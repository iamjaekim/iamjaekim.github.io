---
layout: post
title: "Terraform in CI/CD — Automate Your Infrastructure with GitHub Actions"
description: "A practical guide to integrating Terraform into a CI/CD pipeline using GitHub Actions. Covers terraform plan on PRs, automated apply on merge, state backends, and secrets management."
date: 2026-03-15T12:00:00.000Z
tags:
  - terraform
  - infrastructure-as-code
  - hands-on
  - aws
keywords:
  - Terraform CI/CD
  - GitHub Actions Terraform
  - Terraform Plan Pull Request
  - terraform apply automation
  - Infrastructure as Code pipeline
  - remote state S3
comments: true
---

Terraform in CI/CD

Hello, I'm Jae Wook Kim. If you've been following the `Hello Terraform?` series, you now know how to write Terraform code locally — resources, variables, outputs, and modules. But running `terraform plan` and `terraform apply` manually from your laptop is not how teams operate in production.

Today we're closing that gap. We're going to wire Terraform into a CI/CD pipeline using [GitHub Actions](https://docs.github.com/en/actions), so that:

- Every Pull Request automatically runs `terraform plan` and posts the result as a comment
- Every merge to `main` automatically applies the changes

> This post builds on the [Hello Terraform? series](/tags/#terraform). If you're brand new to Terraform, start from [Part 1]({% link _posts/2020-11-22-terraform-pt1.md %}).

---

## Why CI/CD for Terraform?

When you run Terraform only from your laptop, a few problems quietly pile up:

- **State drift** — a teammate applies something manually, and now your plan is wrong
- **No audit trail** — who ran `apply`, when, and with what code?
- **Inconsistent environments** — "works on my machine" applies to infrastructure too

A CI/CD pipeline solves all three. Every change goes through code review, every `apply` is logged, and the environment that runs Terraform is always identical.

---

## Prerequisites

Before writing any workflow YAML, make sure you have:

1.  **A remote backend configured** — Never use local state in a team. Use S3 + DynamoDB for state locking.
2.  **A Terraform project** — we'll use the sample from the previous series.

> **Already using Terraform Cloud?** You can skip most of this post. [Terraform Cloud](https://developer.hashicorp.com/terraform/cloud-docs) has plan, apply, state management, and policy enforcement built in — it's essentially a managed version of what we're building here. This guide is for teams who want to own their pipeline using GitHub Actions and a self-managed backend (for example, when Terraform Cloud's cost or license terms aren't a fit). If you're on the free tier of Terraform Cloud and it's working for you, stick with it.

---

## Step 1: One-time AWS Bootstrap

Everything in this step is done **once per AWS account** — from your local machine, before any CI/CD is involved. Think of it as laying the foundation before building the house.

### 1a. Create the Remote State Backend

First, configure your Terraform project to use a remote backend. Add a `backend.tf` file:

```hcl
# backend.tf
terraform {
  backend "s3" {
    bucket         = "your-tfstate-bucket"
    key            = "your-project/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}
```

Then you'll hit the classic **chicken-and-egg problem**: the S3 bucket and DynamoDB table need to exist *before* Terraform can use them — but you'd normally use Terraform to create resources. A few ways to solve this:

**Option A — AWS CLI (quickest)**

```bash
# Create the S3 bucket
aws s3api create-bucket \
  --bucket your-tfstate-bucket \
  --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket your-tfstate-bucket \
  --versioning-configuration Status=Enabled

# Enable server-side encryption
aws s3api put-bucket-encryption \
  --bucket your-tfstate-bucket \
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

# Create the DynamoDB table for state locking
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

**Option B — A separate bootstrap Terraform module with local state**

Keep a small `bootstrap/` directory in your repo that uses *local* state (no backend block). Its only job is to create the remote backend resources. Run it manually once, then leave it alone.

```hcl
# bootstrap/main.tf — intentionally uses local state
# Run: terraform -chdir=bootstrap init && terraform -chdir=bootstrap apply

resource "aws_s3_bucket" "tfstate" {
  bucket = "your-tfstate-bucket"
}

resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_dynamodb_table" "tf_lock" {
  name         = "terraform-state-lock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
```

**Option C — Use another IaC tool**

If your organization already uses [AWS CDK]({% link _posts/2023-12-20-cdk-basics-typescript.md %}) or CloudFormation, let it own these platform-level bootstrap resources. Clean separation of concerns, no circular dependency.

> **Pro Tip:** Enable versioning on the S3 bucket regardless of which option you pick. If a state file gets corrupted, you can roll back to a previous version — it has saved me more than once.

### 1b. Register GitHub as an OIDC Identity Provider

While you're doing AWS bootstrap work, knock this out too — it's another one-time-per-account step. This registers GitHub as a trusted identity provider so your CI workflows can request short-lived tokens instead of using long-lived static credentials.

Via the [IAM console](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html) or CLI:

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

> If you already have GitHub registered as an OIDC provider in your account, skip this — you only need one per account regardless of how many repos use it.

That's all the one-time AWS account setup done. The rest of the steps are per-repo configuration.

---

## Step 2: Configure AWS Authentication via OIDC

Forget storing `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` as secrets. Long-lived IAM user credentials are a liability — they don't expire, they get leaked, and they need manual rotation. We're using **OIDC (OpenID Connect)** instead.

With OIDC, GitHub Actions requests a short-lived token from AWS directly during the workflow run. No static credentials stored anywhere. The token expires when the job ends.

> **Official Docs**
> - 📘 GitHub: [About security hardening with OpenID Connect](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
> - 📘 GitHub: [Configuring OpenID Connect in Amazon Web Services](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
> - 📙 AWS: [Create an OIDC identity provider in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
> - 📙 AWS Action: [aws-actions/configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials)

### 2a. Create an IAM Role with a Trust Policy

Create an IAM role that GitHub Actions can assume. The [trust policy](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_oidc.html) scopes it tightly to your specific repository — so only workflows from `your-org/your-repo` can assume this role.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:your-org/your-repo:*"
        },
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        }
      }
    }
  ]
}
```

Attach whatever IAM permissions the role needs (S3 access for state, and permissions for the resources Terraform manages). Save the role ARN — you'll need it in the next step.

> **Tip on scoping:** You can tighten the `sub` condition further. For example, `repo:your-org/your-repo:ref:refs/heads/main` restricts assumption to only the `main` branch. Useful for a dedicated apply role that should never run from a PR branch.

### 2b. Store the Role ARN as a Secret

This is the only secret you need to store. In **Settings → Secrets and variables → Actions**, add:

| Secret Name | Value |
|---|---|
| `AWS_ROLE_ARN` | `arn:aws:iam::YOUR_ACCOUNT_ID:role/your-terraform-role` |
| `AWS_REGION` | e.g. `us-east-1` |

---

## Step 3: The Pull Request Workflow — `terraform plan`

This workflow runs on every PR that touches Terraform files. It plans the changes and posts the output directly as a PR comment so reviewers can see exactly what's changing before approving.

Create `.github/workflows/terraform-plan.yml`:

{% raw %}
```yaml
name: Terraform Plan

on:
  pull_request:
    paths:
      - '**.tf'
      - '**.tfvars'

permissions:
  contents: read
  pull-requests: write  # needed to post PR comments
  id-token: write       # required for OIDC token request

jobs:
  plan:
    name: Terraform Plan
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: "1.7.x"

      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Terraform Init
        id: init
        run: terraform init

      - name: Terraform Format Check
        id: fmt
        run: terraform fmt -check
        continue-on-error: true

      - name: Terraform Validate
        id: validate
        run: terraform validate

      - name: Terraform Plan
        id: plan
        run: terraform plan -no-color -out=tfplan
        continue-on-error: true

      - name: Post Plan as PR Comment
        uses: actions/github-script@v7
        with:
          script: |
            const output = `#### Terraform Format 🖌 \`${{ steps.fmt.outcome }}\`
            #### Terraform Init ⚙️ \`${{ steps.init.outcome }}\`
            #### Terraform Validate 🤖 \`${{ steps.validate.outcome }}\`
            #### Terraform Plan 📖 \`${{ steps.plan.outcome }}\`

            <details><summary>Show Plan</summary>

            \`\`\`terraform
            ${{ steps.plan.outputs.stdout }}
            \`\`\`

            </details>

            *Pushed by: @${{ github.actor }}, Action: \`${{ github.event_name }}\`*`;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: output
            })

      - name: Terraform Plan Status
        if: steps.plan.outcome == 'failure'
        run: exit 1
```
{% endraw %}

With this in place, every PR will look like this: reviewers can read the full plan without leaving GitHub. No more "just trust me, it'll work."

---

## Step 4: The Main Branch Workflow — `terraform apply`

This workflow runs only when a PR is merged into `main`. It applies what was already planned and reviewed.

Create `.github/workflows/terraform-apply.yml`:

{% raw %}
```yaml
name: Terraform Apply

on:
  push:
    branches:
      - main
    paths:
      - '**.tf'
      - '**.tfvars'

permissions:
  contents: read
  id-token: write  # required for OIDC token request

jobs:
  apply:
    name: Terraform Apply
    runs-on: ubuntu-latest

    environment: production  # requires manual approval if configured

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: "1.7.x"

      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Terraform Init
        run: terraform init

      - name: Terraform Apply
        run: terraform apply -auto-approve -input=false
```
{% endraw %}

> **Note on `environment: production`:** If you configure a GitHub Environment called `production` with required reviewers, GitHub will pause the workflow and wait for a human to approve before running `apply`. This adds a manual gate for production changes — something I highly recommend for anything beyond a sandbox.

---

## Putting It All Together

Here's the full developer workflow once this is set up:

1. Engineer creates a branch and pushes Terraform changes
2. Engineer opens a Pull Request → `terraform-plan.yml` runs automatically
3. The plan output appears as a PR comment — reviewers see exactly what changes
4. PR is approved and merged → `terraform-apply.yml` triggers on `main`
5. Infrastructure is updated, logged, and auditable

This pattern is sometimes called **GitOps for infrastructure** — your Git repository becomes the single source of truth, and the pipeline enforces that nothing is applied without going through code review first.

---

## Common Pitfalls

**Plan succeeds but apply fails** — This usually means the plan was generated against stale state. Always run `init` before `plan` in your pipeline, and make sure state locking is enabled so concurrent runs don't step on each other.

**Secrets in the plan output** — `terraform plan` can occasionally print sensitive values. Use `sensitive = true` on your Terraform variables and outputs, and review your plan output before storing it in logs or PR comments.

**Terraform version mismatch** — Pin your Terraform version in both the `required_version` constraint in your `terraform {}` block and in `setup-terraform`. Drift between local and CI versions causes hard-to-debug issues.

---

That's the core of a production-grade Terraform CI/CD pipeline. From here, you can layer in things like policy checks with [OPA/Conftest](https://www.conftest.dev/), cost estimation with [Infracost](https://www.infracost.io/), or drift detection with scheduled `plan` runs.

In the next post, we'll talk about something that has been shaking up the Terraform ecosystem — [OpenTofu](/tags/#terraform), the open-source fork, and whether you should care about making the switch.

Thank you for reading to the end. If you have any questions, feel free to contact me via email, LinkedIn messages, or open a [GitHub Issue](https://github.com/iamjaekim/iamjaekim.github.io/issues), and I will answer to the best of my knowledge!

Have a great day!
