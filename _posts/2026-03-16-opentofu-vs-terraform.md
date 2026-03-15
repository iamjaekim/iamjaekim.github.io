---
layout: post
title: "Terraform or OpenTofu in 2026? Here's What I Actually Think"
description: "An honest take on the Terraform vs OpenTofu debate from someone who has been using Terraform since before 1.0. Covers the license change, what OpenTofu is, feature comparisons, and whether the switch is worth it."
date: 2026-03-16T12:00:00.000Z
tags:
  - terraform
  - infrastructure-as-code
  - hashicorp
keywords:
  - OpenTofu vs Terraform
  - Terraform BSL license
  - OpenTofu fork
  - HashiCorp license change
  - should I switch to OpenTofu
  - Infrastructure as Code 2025
comments: true
---

Terraform or OpenTofu?

Hello, I'm Jae Wook Kim. If you've been anywhere near the Infrastructure as Code world in the past couple of years, you've probably heard the name **OpenTofu**. And if you're a Terraform user, you may have asked yourself: *do I need to care about this? Should I switch?*

That's exactly what I want to talk about today — not from a place of hype, but from the perspective of someone who has been writing Terraform since the 0.12 days and uses it professionally.

> Heads up: This is an opinion post. I'll lay out the facts, tell you what I think, and let you decide what makes sense for your team.

---

## What Happened — The License Change

In August 2023, HashiCorp changed Terraform's license from the open-source **Mozilla Public License 2.0 (MPL 2.0)** to the **Business Source License 1.1 (BSL/BUSL)**.

The practical impact of the BSL: you cannot use Terraform to build a product or service that **competes with HashiCorp's commercial offerings** (Terraform Cloud, Terraform Enterprise). For most individual practitioners and non-competing companies, the day-to-day experience is unchanged. But the community reaction was intense, and for good reason.

Open source isn't just a license — it's a social contract. When HashiCorp changed the terms retroactively on a tool that the community had built around, contributed to, and standardized on for nearly a decade, it broke trust. Whether you think the frustration is justified or not, that's what happened.

---

## What is OpenTofu?

Within weeks of the license change, the Linux Foundation launched **[OpenTofu](https://opentofu.org/)** — an open-source fork of Terraform maintained by the community, under the original MPL 2.0 license.

Think of it the way MariaDB relates to MySQL. Same roots, same syntax, same state file format (at least for now), but a different governance structure and a different roadmap.

OpenTofu is not a toy project. It is backed by major companies including Gruntwork, Spacelift, env0, and Harness — all of whom have significant commercial interest in a healthy open-source Terraform ecosystem.

As of early 2026, OpenTofu is on version **1.8.x**, and it ships features that Terraform hasn't adopted yet.

---

## How Different Are They Today?

For the basics, they are **nearly identical**. Your existing `.tf` files will run on OpenTofu without modification. Your S3/GCS/Azure backend configs work. Your modules work. Your providers work.

That said, OpenTofu has started to diverge:

| Feature | Terraform | OpenTofu |
|---|---|---|
| License | BSL 1.1 | MPL 2.0 |
| State encryption | ❌ Not native | ✅ Built-in |
| Provider-defined functions | ✅ (1.8+) | ✅ |
| `for_each` on module `count` | Limited | Improved |
| Community governance | HashiCorp-controlled | Linux Foundation |
| Pricing | Free CLI, paid Cloud/Enterprise | Free (no commercial tier) |

**State encryption** is the biggest functional differentiator right now. OpenTofu lets you encrypt your state file at rest natively — no third-party tooling needed. Given that state files can contain secrets in plaintext (database passwords, private keys, etc.), this is a meaningful security improvement.

---

## My Honest Take

Here's where I land after thinking about this:

**For most teams already running Terraform in production — don't switch just because of the hype.**

If your Terraform setup is working, your team knows it, and you're not building a product that competes with HashiCorp, the BSL doesn't affect you today. Migrating IaC tooling mid-stream has real costs: re-validating pipelines, retraining the team, dealing with provider edge cases. That's not free.

**But there are real reasons to consider OpenTofu if:**

- You are a vendor or building a SaaS platform on top of IaC tooling — the BSL is a real legal concern
- You want native state encryption without bolting on an external solution
- You're starting a greenfield project and want to build on a fully open foundation
- You're philosophically uncomfortable with the license change and want to vote with your tool choice

**The migration path is genuinely easy right now.** Because both tools share the same syntax and state format today, switching is lower-risk than it sounds. You replace the binary, update your CI setup to install `tofu` instead of `terraform`, and that's largely it.

The longer you wait, the more the two tools may diverge — especially once OpenTofu starts shipping features that require state file format changes. Migrating at that point will be harder.

---

## Should You Migrate Your CI/CD Pipeline?

If you followed the [previous post on Terraform in GitHub Actions]({% link _posts/2026-03-15-terraform-cicd-github-actions.md %}), the change to run OpenTofu instead is minimal. Replace the `hashicorp/setup-terraform` action with the community `opentofu/setup-opentofu` action:

```yaml
# Before (Terraform)
- name: Setup Terraform
  uses: hashicorp/setup-terraform@v3
  with:
    terraform_version: "1.7.x"

# After (OpenTofu)
- name: Setup OpenTofu
  uses: opentofu/setup-opentofu@v1
  with:
    tofu_version: "1.8.x"
```

And replace `terraform` commands with `tofu`:

```yaml
# Before
- run: terraform init
- run: terraform plan
- run: terraform apply -auto-approve

# After
- run: tofu init
- run: tofu plan
- run: tofu apply -auto-approve
```

That is genuinely most of the migration for a standard setup.

---

## The Bigger Picture

What I find most interesting about this whole situation is not Terraform vs OpenTofu specifically — it's what it reveals about the IaC ecosystem maturity.

The fact that a community fork could spin up this quickly, get this level of commercial backing, and ship meaningful features ahead of the original tool — that's a sign of how important IaC tooling has become to the industry. Companies aren't going to let a critical piece of their infrastructure stack sit behind terms they're uncertain about.

HashiCorp's acquisition by IBM in 2024 adds another layer of uncertainty to Terraform's long-term roadmap. IBM has a complicated history with open-source communities.

For all these reasons, I'm watching OpenTofu closely. I haven't migrated everything personally, but for new projects, it's now my default consideration.

---

## TL;DR

- **OpenTofu is a legitimate, production-ready fork** of Terraform with growing momentum
- **Most existing Terraform code runs on OpenTofu with no changes today**
- **The migration is low-effort** — mostly a binary swap and a CI tweak
- **For existing stable setups, the urgency is low** — but the longer-term trend favors OpenTofu
- **For new projects, strongly consider starting on OpenTofu**

Whatever you choose, the most important thing is that your infrastructure is version-controlled, reviewed, and deployed through a proper pipeline. The tool is secondary.

---

Thank you for reading to the end. If you have any questions, feel free to contact me via email, LinkedIn messages, or open a [GitHub Issue](https://github.com/iamjaekim/iamjaekim.github.io/issues), and I will answer to the best of my knowledge!

Have a great day!
