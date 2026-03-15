---
layout: post
title: Terraform - Intro
description: A beginner's guide to Terraform. Part 1 of the series introducing the concept of Infrastructure as Code, what Terraform is, and why we use it.
date: 2020-11-22T00:00:00.000Z
lastmod: 2026-02-23T05:42:07.046Z
image: /images/default.svg
tags:
  - terraform
  - infrastructure-as-code
keywords:
  - Terraform
  - Infrastructure as Code
  - IaC
  - HashiCorp
  - DevOps
comments: true
---

Hello Terraform?

Hello, I'm Jae Wook Kim. In this first post of my blog, I would like to introduce Terraform, a tool that is widely used these days.

![terraform-logo](../images/terraform-color.svg){: width="100%" height="100%"}

> The `Hello Terraform?` series is written to be easily understood by those who say, "I have at least managed resources in the cloud via CLI," as they move on to the next step.

[Terraform](https://www.terraform.io/intro/index.html) is an open-source tool created by HashiCorp, used to create various resources through the combination of its proprietary HCL (HashiCorp Configuration Language) and providers.

It is a software used for what is commonly referred to these days as `Infrastructure as Code` (IaC), allowing you to define, create, and manage necessary resources as code.

The latest version is currently [1.5.x or later](https://releases.hashicorp.com/terraform/) (updated from original post), but for the sake of this introductory series keeping aligned with its original context, we will be referencing concepts that apply generally, though originally written around version [0.12.29](https://releases.hashicorp.com/terraform/). While newer versions introduce many improvements, the core concepts remain consistent.

> You can easily install it on a Mac using Homebrew
>
> brew tap hashicorp/tap
> brew install hashicorp/tap/terraform # Install the latest version

Among the many advantages of Terraform, here are a few key ones:

- You can track changes between the configuration defined in the code and the actual resource values.
- You can establish a Single Source of Truth, and manage it like typical application code.
- You can recreate the same resources with minimal effort.

While it has these advantages, there are of course disadvantages as well:

- There is a file called `state`, and this file stores infrastructure configuration values in clear text.
- When looking for diffs (Advantage 1), it uses the state file. If there is a problem with the state file, or if multiple versions exist, Terraform cannot perform its job properly.
- Since you can create the same resources with little effort, using identical resources extensively will be immediately reflected in your billing.

Because of reasons like this, Terraform seems to be getting even more attention lately. Despite the disadvantages, teams using it create their own rules to overcome them, or entrust everything from state files to infrastructure deployment to CI/CD solutions like [Terraform Cloud / Enterprise](https://www.terraform.io/docs/enterprise/index.html) to ensure the master or production branch sync difference is as minimal as possible.

Thank you for reading to the end. If you have any questions, feel free to open a [GitHub Issue](https://github.com/iamjaekim/iamjaekim.github.io/issues), send an email, or a LinkedIn message, and I will answer to the best of my knowledge!

Have a great day!
