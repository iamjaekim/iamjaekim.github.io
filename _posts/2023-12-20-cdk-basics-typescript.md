---
layout: post
title: CDK - Basics with TypeScript
description: How to initialize an AWS CDK project with TypeScript and configure a sample stack. Explaining CDK CLI usage and project structure. Part 2 of the series.
date: 2023-12-20T20:35:40.992Z
lastmod: 2026-02-23T05:42:07.087Z
image: /images/default.svg
tags:
  - cdk
  - aws
  - infrastructure-as-code
  - typescript
keywords:
  - AWS CDK
  - TypeScript
  - CDK CLI
  - Infrastructure as Code
  - CDK Stack
comments: true
---

Hello, AWS CDK?

Hello, I'm Jae Wook Kim. Today's topic is to explore the basic project setup and commands for AWS's alternative resource provisioning tool, [CDK](https://docs.aws.amazon.com/cdk/latest/guide/home.html).

In this post, we will be creating a project utilizing [TypeScript](https://www.typescriptlang.org/).

### Sample_Project Setup

We will be creating a sample project, so let's set up the corresponding directory and necessary apps. Once you complete this section, the basic project tree and structure will be created, meaning you've reached a good starting point.

```bash
mkdir sample_project # Create a directory
n 20 # Install nodejs*
npx aws-cdk init --language typescript # Create cdk boilerplate
```

### Sample_Project

After executing the `npx aws-cdk init --language typescript` command, folders and files are generated, putting the CDK project in a state ready to be written. It's not drastically different from other typical TypeScript projects, and the project is primarily defined around `package.json`, `tsconfig.json`, and `cdk.json`.

Additionally, to add typical resources, you would add them inside the `SampleProjectStack` class within the `sample_project-stack.ts` file located in the `lib` folder. This results in resources being added to the corresponding CloudFormation stack. For instance, if you want to add a VPC resource, you can create it by adding the `cdk.aws_ec2.Vpc` resource. The CDK resources available for use are detailed in the [AWS Documentation](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib-readme.html).

Regarding the Sample_Project and practical usage of CDK code, I will return gradually with other code changes.

### CDK CLI

AWS CDK has various CLI commands. In this section, we will look at `synth`, `deploy`, and `diff`, which you will use frequently going forward.

For more details, please refer to the [AWS Documentation](https://docs.aws.amazon.com/cdk/v2/guide/work-with-cdk-typescript.html#typescript-running).

#### Synth

`(npm run) cdk synth` (pronounced: synth) is an essential step that all CDK processes go through, and this process includes the code build phase. The CDK build refers to the process of converting the variables used while writing code, the scopes used, and the references created and used into actual values, transforming them into JSON recognizable by CloudFormation. The JSON produced at the end of this process is output to the `cdk.out` folder at the project root.

#### Deploy

`(npm run) cdk deploy` (pronounced: deploy) is the command responsible for deploying the compiled JSON file from synth to the actual AWS environment. Naturally, the `synth` process is required before this command, and it is executed automatically as part of the deploy command.

#### Diff

`(npm run) cdk diff` (pronounced: diff) compares the current code against the deployed stack and shows the differences in the terminal. Because this command also requires the current compiled state, it includes the `synth` process and compares it with the state currently deployed on AWS. Furthermore, this process strictly compares the currently **deployed** state—literally the CloudFormation of the deployed stack—with the compiled CloudFormation. Resources manually changed directly in AWS are, naturally, not tracked.

### Note

*Installing nodejs through [various other methods](https://nodejs.org/en/download/package-manager)

Thank you for reading to the very end today as well. If you have any questions, feel free to contact me via email, LinkedIn messages, or open a [GitHub Issue](https://github.com/iamjaekim/iamjaekim.github.io/issues), and I will answer to the best of my knowledge!

Have a great day!
