---
layout: post
title: Terraform - Version 1.0 General Availability
description: News on the official release of HashiCorp Terraform 1.0. A summarized translation covering what changed in v1.0, interoperability promises, and the upgrade guide.
date: 2021-06-13T00:00:00.000Z
lastmod: 2026-02-23T05:42:07.080Z
image: /images/default.svg
tags:
  - hashicorp
  - terraform
  - translation
  - infrastructure-as-code
keywords:
  - Terraform 1.0
  - HashiCorp
  - General Availability
  - Infrastructure as Code
  - Release Notes
comments: true
---

Terraform v1.0 GA Release

Hello, I'm Jae Wook Kim. Today's topic is about Terraform 1.0.
This post is a paraphrased summary of key points from HashiCorp's blog post.

> https://www.hashicorp.com/blog/announcing-hashicorp-terraform-1-0-general-availability

Terraform 1.0 was announced and released during HashiCorp's European conference. Terraform 1.0 significantly improves upon its existing strengths: interoperability, easy version upgrades, and automated workflow features. This is undoubtedly a major milestone. Currently, Terraform version 1.0 is available to use by selecting version 1.0 on the official website or via Terraform Cloud.

## State Interoperability
Terraform 1.0 guarantees compatibility and support starting from the previous `0.14.x` versions. Users already on `0.14.x` or higher can upgrade to and use Terraform 1.0 without worrying about upgrades, migrations, or backward compatibility. One of the major compatibility features, the `remote state data` resource type, has been supported since version `0.12.30`. Users of the state backend on those versions who are considering migrations will also receive continuous compatibility support for their Terraform version's state backend resources without major changes or friction.

## Upgrade path to Terraform 1.0
For users on Terraform versions 0.15 and later, upgrading to Terraform 1.0 can be done smoothly via its own CLI without major changes or needing new tools, just like previous versions. For users on versions prior to 0.15, it is expected that the upgrade will need to be done in stages.

## Terraform Support
Starting with Terraform 1.0, maintenance support is scheduled to be guaranteed for at least 18 months, during which HashiCorp will provide feature upgrades and bug fixes for that specific Terraform version.

Thank you for reading to the end. If you have any questions, feel free to contact me via email, LinkedIn messages, or open a [GitHub Issue](https://github.com/iamjaekim/iamjaekim.github.io/issues), and I will answer to the best of my knowledge!

Have a great day!
