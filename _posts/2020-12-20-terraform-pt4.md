---
layout: post
title: Terraform - Data, Local and Output
description: How to write more flexible and reusable infrastructure code utilizing Terraform's Data Sources, Local variables, and Output values. Part 4 of the series.
date: 2020-12-20T00:00:00.000Z
lastmod: 2026-02-23T05:42:07.066Z
image: /images/default.svg
tags:
  - terraform
  - infrastructure-as-code
keywords:
  - Terraform Data Source
  - Terraform Locals
  - Terraform Output
  - Infrastructure as Code
  - HCL
comments: true
---

Hello Terraform?

Hello, I'm Jaewook Kim. Today's topic covers Terraform [Data Sources](https://www.terraform.io/docs/configuration/data-sources.html), [Locals](https://www.terraform.io/docs/configuration/locals.html), and [Outputs](https://www.terraform.io/docs/configuration/outputs.html).

> The `Hello Terraform?` series is written to be easily understood by those who say, "I have at least managed resources in the cloud via CLI," as they move on to the next step.

Data, Local, and Output are variables that can be used internally within Terraform.
- Data executes a `GET` query remotely and stores the retrieved values as variables.
- Local stores variables tied to the execution environment.
- Output stores values from created resources and exposes them so they can be used externally by modules, etc.

---
## Data
Let's talk about Data. The basis of Data is a `GET` query. It retrieves all data about a physical resource using a `GET` request and stores it as a variable. Data definition and usage look like the following. (Let's use the [`aws_vpc` resource example](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/vpc) from my previous post.)
```terraform
data "aws_vpc" "selected" {
  id = "vpc-1234824" # An actual existing vpcid
}

resource "aws_subnet" "example" {
  vpc_id            = data.aws_vpc.selected.id # Reference the id item from the queried `aws_vpc.selected` object
  availability_zone = "us-east-1a"
  cidr_block        = cidrsubnet(data.aws_vpc.selected.cidr_block, 4, 1)
}
```
This code block queries the VPC resource using the account and IAM user designated by the provider, [saves the response results as a variable](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/vpc#attributes-reference), and then sets the queried VPC's ID to the `vpc_id` field—a required parameter when creating a subnet. This is an excellent strategy when you need to use an existing VPC instead of creating a new one.

The source of the data depends on the provider being used, and Terraform processes these items and exposes them as `attributes`. Thus, the data queried changes depending on the environment, and it gets saved in the state file. If the queried data changes, it might impact the actual resources referencing that data, and if the resource was created outside of the Terraform you are using, you need to think carefully about the impact of the changes.

There are many use cases for data, but its biggest advantage is dynamicity.
For example, if you divide one AWS account into multiple VPCs to configure different operating environments, instead of querying IDs directly, you can query tags to save them as variables, convert and save them as Local variables when needed, and use them individually within Terraform.

```terraform
data "aws_vpcs" "prod-vpcs" {
  tags = {
    service = "production"
  }
}
```
This code block queries *all* VPCs with the `service: production` tag, stores them in an array format inside the variable `data.aws_vpcs.prod-vpcs`, and allows you to use them selectively using [basic Terraform functions](https://www.terraform.io/docs/configuration/functions.html) such as `loop` or `element` when needed.

---
## Local
Let's talk about Local variables. As briefly explained earlier, these are variables tied only to the current execution environment. This concept is widely used in other programming languages as well. A Local variable declaration takes the following format:
```terraform
locals {
    tags = {
        name = "my_service"
        env = "prod"
        owner = "infrastructure_team"
        automation = "terraform"
    }
    query_vpc = data.aws_vpc.prod-vpc
}

data "aws_vpc" "prod-vpc" {
  tags = local.tags
}

resource "aws_subnet" "example" {
  vpc_id            = local.query_vpc.id
  availability_zone = "us-east-1a"
  cidr_block        = cidrsubnet(local.query_vpc.cidr_block, 4, 1)
  tags              = local.tags
}
```

This code block saves `tags` locally in the current execution environment. Not only basic strings, but `data` can also be saved in local variables. If used well, you can save all configuration locally and create actual resources relying entirely on the values stored in local variables.

Among its many use cases, one very useful application is [applying tags to resources](https://www.terraform.io/docs/configuration/locals.html#when-to-use-local-values). It's recommended to use identically or similarly formatted values for consistency across resources, and when tagging via Terraform, this task becomes much easier.

By using the tags variable declared in `locals` and assigning it across multiple resources like this, you ensure every resource built by this Terraform code gets the exact same tags. Also, if tags need to be updated, that single update can be applied instantly to all generated resources simultaneously—a very handy advantage.

---
## Output

Let's talk about Output. Output exposes resource information created by a module so that other modules or resources can reference these values when needed. If you want to use the `aws_vpc` information created in Module A over in Module B, defining an output in Module A records that output in the state file. Furthermore, any Terraform resource can become an output. Data, resources, and even locals can be set as outputs so that they can be utilized in other modules or Terraform codebases.
```terraform
data "aws_vpc" "prod-vpc" {
  tags = local.tags
}

output "vpc_arn" {
  value = data.aws_vpc.prod-vpc.arn
}
```
This code block is an example that queries `aws_vpc` via data and exposes the VPC's ARN outside. Once exposed, this VPC's ARN becomes accessible by other Terraform code and modules, allowing you to compose much more dynamic Terraform configurations.

The biggest benefit of an output is precisely this cross-reference capability with other Terraform setups. [For example, in an environment utilizing multiple backend and state files where a VPC ARN is required, instead of writing new data blocks everywhere, you can simply load the data from the state file where the VPC ARN was exposed.](https://www.terraform.io/docs/providers/terraform/d/remote_state.html)

So today, we went over Data, Local, and Output. The official Terraform documentation has more detailed examples and explanations, so it would be great to reference it while writing Terraform.

Thank you for reading to the end. If you have any questions, feel free to contact me via email, LinkedIn messages, or open a [GitHub Issue](https://github.com/iamjaekim/iamjaekim.github.io/issues), and I will answer to the best of my knowledge!

Have a great day!
