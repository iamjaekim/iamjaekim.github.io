---
layout: post
title: Terraform - Resource
description: How to define cloud infrastructure with Terraform Resource blocks. Part 3 of the series exploring real resource examples like AWS VPC and EC2.
date: 2020-11-29T00:00:00.000Z
lastmod: 2026-02-23T05:42:07.061Z
image: /images/default.svg
tags:
  - terraform
  - infrastructure-as-code
keywords:
  - Terraform Resource
  - AWS VPC
  - Infrastructure as Code
  - HCL
comments: true
---

Hello Terraform?

Hello, I'm Jaewook Kim. Today's topic is the Terraform [Resource](https://www.terraform.io/docs/configuration/resources.html).

> The `Hello Terraform?` series is written to be easily understood by those who say, "I have at least managed resources in the cloud via CLI," as they move on to the next step.

A Terraform Resource is, literally, a block where you can specify the configuration values for a given resource.

[Installing Terraform]({{ 'terraform-pt1' | relative_url }}) and [Configuring a Provider]({{ 'terraform-pt2' | relative_url }}), which we did previously, are prerequisites for creating resources. Terraform's true value shines when you actually create these resources. The limits of the resources you can create depend on the official documentation of each provider. For example, with the [AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs), the community rapidly and actively supports nearly all AWS resources.

> _NOTE: The examples use AWS, and assume the corresponding provider is configured. If you would like to read about providers again, click [here]({{ 'terraform-pt2' | relative_url }}) to go to that post._

A resource declaration takes the following format:
```terraform
resource "aws_vpc" "demovpc" {
  cidr_block = "10.0.0.0/16"
}
```

Breaking down the example:
- `resource` declares that this is a resource block. Internally, Terraform has reserved words for different types, and this first word defines the purpose of the block.
  - As an additional example, from the provider post, the provider block starts with the word `provider`.
- `aws_vpc` is the [AWS resource](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/vpc) we want to create. Looking at the provider documentation, you can see the resources you can create, along with the required and optional parameters for each.
- `demovpc` is the name of the `aws_vpc` used internally by Terraform. This name must be unique within a single state file. This name is used quite importantly to logically distinguish resources inside the state file, and **if this name changes, Terraform usually considers the resource deleted, attempts to delete the existing resource, and tries to recreate it.**
  - If a change is needed, it strictly requires migrating the reference (`terraform state mv`), or removing the reference from the state file (`terraform state rm`) and then re-importing the reference (`terraform import`).
- The contents inside the `{ }` block become the direct configuration values for the resource. The parameters change for each [resource](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/vpc). If you have used the AWS CLI, you can now define the values you used to pass as CLI parameters inside this block to create and manage them using Terraform. As parameter values change, Terraform recognizes the changes and determines whether to update or recreate the resource, informing the user.

---

From the resource block, you can also use Terraform's powerful feature: [meta-arguments](https://www.terraform.io/docs/language/meta-arguments/depends_on.html). Meta-arguments inject logic into Terraform. These configurations are not tied to a specific provider but belong to Terraform's core features, and all providers are designed to handle meta-arguments.

While all meta-arguments should be used in the right place, some of the most widely used ones these days are:
- `provider`: Used when you need to use a provider configuration different from the default one. You pass an alias parameter to the provider to create a reference. For instance, with AWS, this is very useful when a resource needs to be created in us-east-1 and us-west-2 simultaneously.

```terraform
# Default AWS provider to use
provider "aws" {
  region = "us-east-1"
}

# AWS provider with different settings
provider "aws" {
  alias  = "uswest2"
  region = "us-west-2"
}

resource "aws_vpc" "useast1" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_vpc" "uswest2" {
  provider   = aws.uswest2 # You must pass the reference like this.
  cidr_block = "10.0.0.0/16"
}
```
- `count` and `for_each` are often used when you need to create multiple identical resources. They cannot be used at the same time; using both will result in an error.
  - When you assign the [`count`](https://www.terraform.io/docs/configuration/resources.html#count-multiple-resource-instances-by-count) parameter to a resource, Terraform automatically recognizes it and creates the resource according to the given number. Because all configuration values remain the same unless explicitly changed, if the items require unique configurations, you must also make the settings dynamic. These generated resources are recorded in the state file as an array format, and if needed, you can use `count.index` to reference the array index and use dynamic settings.
    - The example uses Terraform's [`element` function](https://www.terraform.io/docs/configuration/functions/element.html) to pick a value from the cidrs defined as an array variable and assigns it to the `cidr_block`.
```terraform
variable "cidrs" {
  default = ["10.0.1.0/24","10.0.2.0/24"]
}
resource "aws_vpc" "demovpc" {
  count      = 2
  cidr_block = element(var.cidrs, count.index)
}
```
  - [`for_each`](https://www.terraform.io/docs/configuration/resources.html#for_each-multiple-resource-instances-defined-by-a-map-or-set-of-strings) takes a map or a set of strings, allowing you to sequentially call the values in the variable. Resources created this way are also recorded in the state file like `count`, but unlike `count`, they are recorded by key values, not array indexes.
```terraform
resource "aws_vpc" "demovpc" {
  for_each = {
    a = "10.0.1.0/24"
    b = "10.0.2.0/24"
  }
  cidr_block = each.value
}
```

In this way, Terraform resources can have a simple yet complex structure. Since configuration names might change or bugs might be fixed in different provider versions, you should always refer to the official documentation for the version of the provider you are using when creating new resources.

Thank you for reading to the end. If you have any questions, feel free to contact me via email, LinkedIn messages, or open a [GitHub Issue](https://github.com/iamjaekim/iamjaekim.github.io/issues), and I will answer to the best of my knowledge!

Have a great day!
