# Post Front Matter Template

Use this template when creating new blog posts. Save your posts in the `_posts/` directory with the naming convention `YYYY-MM-DD-your-post-title.md`.

## Required Fields

```yaml
---
layout: post
title: "Your Post Title Here"
description: "A brief 1-2 sentence description for SEO and social sharing."
date: 2026-02-23T10:00:00.000Z
tags:
    - tag1
    - tag2
---
```

## All Available Fields

```yaml
---
layout: post
title: "Your Post Title Here"
description: "A brief 1-2 sentence description for SEO and social sharing."
date: 2026-02-23T10:00:00.000Z
lastmod: 2026-02-24T12:00:00.000Z
image: /images/your-post/cover.png
tags:
    - devops
    - aws
    - terraform
keywords:
    - keyword1
    - keyword2
    - keyword3
comments: true           # set to false to disable comments on this post
---
```

## Field Descriptions

| Field | Required | Description |
|-------|----------|-------------|
| `layout` | Yes | Always use `post` |
| `title` | Yes | Post title (shown in browser tab, SEO, social cards) |
| `description` | Yes | 1-2 sentences for meta description and Open Graph |
| `date` | Yes | Publication date in ISO 8601 format |
| `lastmod` | No | Last modified date (shown in post if provided) |
| `image` | No | Cover image for Open Graph/Twitter cards |
| `tags` | Yes | Array of tags for categorization |
| `keywords` | No | SEO keywords (falls back to tags if not set) |
| `comments` | No | Enable/disable Utterances comments (default: true) |

## Available Tags

Check `_data/tags.yaml` for the current tag list. You can add new tags there.

## Example Post

```markdown
---
layout: post
title: "Getting Started with Terraform on AWS"
description: "A beginner-friendly guide to provisioning AWS infrastructure using Terraform. Learn HCL basics, state management, and deploy your first resource."
date: 2026-02-23T10:00:00.000Z
tags:
    - terraform
    - aws
    - infrastructure-as-code
    - hands-on
keywords:
    - Terraform
    - AWS
    - Infrastructure as Code
    - HCL
comments: true
---

Your post content here in Markdown...

## Section Header

Regular paragraph text.

```hcl
resource "aws_instance" "example" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}
```

More content...
```
