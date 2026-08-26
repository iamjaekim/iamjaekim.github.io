---
layout: post
title: Terraform - Provider
description: Part 2 of the series, explaining what a Terraform Provider is and how to configure and use the AWS Provider with examples.
date: 2020-11-27T00:00:00.000Z
lastmod: 2026-08-26T09:45:00-04:00
image: /images/default.svg
tags:
  - terraform
  - infrastructure-as-code
keywords:
  - Terraform Provider
  - AWS Provider
  - HashiCorp
  - Infrastructure as Code
comments: true
---

Hello Terraform?

Hello, I'm Jae Wook Kim. Today's topic is the Terraform [Provider](https://developer.hashicorp.com/terraform/language/providers).

> The `Hello Terraform?` series is written to be easily understood by those who say, "I have at least managed resources in the cloud via CLI," as they move on to the next step.

Metaphorically speaking, a Terraform Provider is similar to the concept of dressing the "body" of `Terraform`, which initially has nothing.
When you first install Terraform, the operations you can perform are very limited. The basic CLI commands (usage can be seen with `terraform help`) are all there is. It's only when a provider is installed that it can communicate with resource APIs to create customized resources.

For example:

> If you want to use Terraform to create a VPC in AWS:
>
> > After installing Terraform, you define the AWS Provider, and only when the VPC resource is defined can you create VPC resources using Terraform.
>
> The resources defined in HCL are translated through the provider to create corresponding resources on that platform.

Terraform is managed by HashiCorp, but the case is different for providers. Most providers are open-source, and anyone can participate in fixing bugs, creating new features, and contributing to building better providers.

The list of providers currently supported by Terraform can be found in the [Terraform Registry](https://registry.terraform.io/browse/providers). The [provider documentation](https://developer.hashicorp.com/terraform/language/providers) explains the official, partner, community, and archived provider tiers. By using these providers alongside Terraform, you can create resources on various platforms.

_Each Terraform Provider is an independent project and community, so their completeness, maturity, and participation levels may vary._

When using a provider, there are a few essential things you must configure. These include User Authentication, Region settings, and other values essential for using the platform's CLI. Think of it simply: the values you configure via `export` or `environment variables` when using the corresponding platform CLI are also essential configurations in the Terraform provider. Generally, you should refer to the official documentation of each provider for these required values before starting.

Taking [AWS](https://registry.terraform.io/providers/hashicorp/aws/latest/docs) as an example, you must specify the provider version, access key, secret key, region, etc., or proceed with user authentication based on values defined via `export` or user information in the `~/.aws/` directory.

Terraform handles [AWS User Authentication](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#authentication) quite flexibly.
- Firstly, you can put the keys directly into the provider. **However**, this method is NOT recommended outside of testing because your access key and secret key could be exposed to the outside world, so keep its use to a minimum. Also, if the keys are exposed, please request them to be deleted and recreated as soon as possible.
- Secondly, Terraform can read necessary information from environment variables.
- Thirdly, it can proceed with user authentication by reading configuration files from the `~/.aws/` or `%USERPROFILE%\.aws` folder.
- Fourthly, it can receive authentication information from the ROLE in the environment where Terraform is running. In this case, where CD is configured, it is common to authenticate as a CD user or system role rather than using individual keys.

As explained earlier, the Terraform provider communicates with the AWS API, but one concept that shouldn't be confused here is the difference between Terraform user authentication and IAM-based RBAC permissions. Terraform user authentication is, simply put, just logging into an AWS account, but **for fine-grained permissions, it follows the RBAC granted to the respective IAM user or Assumed Role.**

Code Sample:
```terraform
# Proceed with user authentication using the provider block.
provider "aws" {
  region     = "Region"
  access_key = "Access Key"
  secret_key = "Secret Key"
}
# Using the provider information above, authenticate the user and create a VPC resource.
resource "aws_vpc" "demovpc" {
  cidr_block = "10.0.0.0/16"
}
```

Thank you for reading to the end. If you have any questions, feel free to contact me via email, LinkedIn messages, or open a [GitHub Issue](https://github.com/iamjaekim/iamjaekim.github.io/issues), and I will answer to the best of my knowledge!

Have a great day!
