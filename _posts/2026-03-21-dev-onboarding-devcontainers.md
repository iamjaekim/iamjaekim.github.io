---
layout: post
title: "The First Commit: Winning at Developer Experience (DevEx) with Dev Containers"
description: "Why moving from manual setup guides to containerized 'Golden Setups' is the single biggest win for Developer Experience in 2026."
date: 2026-03-21T23:30:00.000Z
author: jaewookkim
tags:
    - developer-experience
    - dev-container
    - hands-on
    - aws
    - typescript
keywords:
    - Developer Experience (DevEx)
    - Engineering Productivity
    - Dev Containers
    - VS Code Dev Containers
    - Developer Onboarding
    - Golden Path
    - DevEx
comments: true
---

Hello, I'm Jae Wook Kim. If you've been following my recent transition into **Developer Experience (DevEx)**, you know I've been thinking a lot about friction.

We've all been there: You join a new project, and the "Getting Started" guide in the Wiki is a graveyard of outdated commands, missing prerequisites, and "it works on my machine" caveats. You spend three days just trying to get `terraform plan` to run without a `Plugin Error`.

Today, we're ending that. We're moving from "Follow these 20 steps" to **"One command to rule them all."**

---

## The Problem: Documentation is a Choice

The biggest issue with manual onboarding guides isn't just that they are long—it's that they are **manual**. Because the documentation is separate from the environment, it inevitably drifts. A version gets bumped, a new CLI tool is added, and the Wiki page is forgotten.

When your environment setup is a choice, developers will make different choices. This leads to the "Snowflake Laptop" problem: every developer has a slightly different setup, making debugging local issues a nightmare for the platform team.

---

## The New Norm: Dev Containers as your "Golden Setup"

Modern software is shipped in containers. It stays in a container through CI and lands in a container in Production. So why are we still developing directly on our host machines?

**Dev Containers** allow us to define our "Golden Setup" as code. Instead of a Wiki page, we provide a `.devcontainer/` directory in the repo. 

When a developer opens the repo in VS Code (or a supporting IDE), they are prompted to "Reopen in Container." Within minutes, they have:
1.  The exact OS version required.
2.  All CLI tools (`aws`, `tofu`, `cdk`) pre-installed at the correct versions.
3.  All VS Code extensions pre-configured.
4.  Standardized linting and formatting (no more "Prettier vs. ESLint" wars).

---

## Practical Example: A CDK TypeScript Project

Let's look at how this works in a real project. Imagine a standard AWS CDK project using TypeScript.

### 1. The Dockerfile
We define our base environment. No more `brew install` or `nvm use`.

```dockerfile
FROM mcr.microsoft.com/devcontainers/javascript-node:1-24-bookworm

# Install global dependencies for the project
RUN npm install -g aws-cdk@2.1112.0 typescript@5.9.3


# Ensure the environment is ready
RUN cdk --version && tsc --version
```

### 2. The `devcontainer.json`
This is where the magic happens. We map our host AWS credentials into the container so developers don't have to re-authenticate inside.

```json
{
  "name": "Sample CDK Project",
  "dockerFile": "Dockerfile",
  "features": {
    "ghcr.io/devcontainers/features/aws-cli:1": {}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "amazonwebservices.aws-toolkit-vscode"
      ],
      "settings": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode"
      }
    }
  },
  "mounts": [
    "source=${localEnv:HOME}/.aws,target=/home/node/.aws,type=bind,consistency=cached"
  ],
  "remoteUser": "node",
  "postCreateCommand": "npm install"
}
```

---

## Stop Polluting Your Laptop

The most immediate benefit is **hygiene**. 

Your laptop's root environment should be clean. If you are a DevEx engineer supporting 5 different teams, you don't want 5 different versions of Python or Terraform fighting over your `$PATH`. 

With Dev Containers, those dependencies are "trashable." When the project ends, or you want to switch context, you just close the container. Your host machine stays pristine.

### Integrating the "Outer Loop"
For more complex microservices, you can even layer in tools like **Tilt** or **Skaffold** within the container to offload heavy workloads to a remote cluster or mimic a full production environment in a local Docker network.

---

## The Cultural Shift: Sunsetting the "Old Way"

Moving to Dev Containers is a cultural change. Developers have deep-seated habits and favorite ZSH plugins. 

As a DevEx Engineer, your job isn't to *force* this change, but to make the "Golden Path" so much better that the old way feels painful by comparison.

1.  **Offer Alternatives:** Start by providing the container as an *option*.
2.  **Show the Benefit:** When someone's local setup breaks, don't debug their laptop. Ask them to try the container.
3.  **The "Aha!" Moment:** When a new hire gets to their **first commit** in 30 minutes instead of Day 3, the value becomes undeniable.
4.  **Graceful Sunset:** Once the majority of the team is on the "Golden Path," update the onboarding guide to make the container the default and deprecate the manual steps.

---

## Conclusion

Developer Experience (DevEx) isn't just about build speeds; it's about **removing cognitive load**. By codifying the development environment, we free our engineers to focus on what they do best: writing code and solving problems.

The "First Commit" is the first impression a developer has of your organization. Make it a great one.

Thank you for reading. If you have any questions about setting up Dev Containers for your team, feel free to reach out via [LinkedIn](https://linkedin.com/in/iamjaekim) or open an issue on my [GitHub](https://github.com/iamjaekim/iamjaekim.github.io)!

Have a great day!
