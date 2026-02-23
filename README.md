# iamjaekim.github.io

Personal blog of Jae Wook Kim — DevOps Engineer. Built with Jekyll, hosted on GitHub Pages.

🌐 **Live site:** [https://iamjaekim.github.io](https://iamjaekim.github.io)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Writing a New Post](#writing-a-new-post)
- [Post Front Matter Reference](#post-front-matter-reference)
- [Features](#features)
- [Configuration](#configuration)
- [Deployment](#deployment)

---

## Tech Stack

| Tool | Purpose |
| --- | --- |
| [Jekyll](https://jekyllrb.com/) | Static site generator |
| [GitHub Pages](https://pages.github.com/) | Hosting |
| [Rouge](https://rouge.jneen.net/) | Syntax highlighting |
| [jekyll-seo-tag](https://github.com/jekyll/jekyll-seo-tag) | SEO meta tags |
| [jekyll-sitemap](https://github.com/jekyll/jekyll-sitemap) | Auto-generated sitemap |
| [jekyll-feed](https://github.com/jekyll/jekyll-feed) | RSS feed |
| [jekyll-paginate](https://github.com/jekyll/jekyll-paginate) | Post pagination |
| [Utterances](https://utteranc.es/) | GitHub-based comments |
| Inter + JetBrains Mono | Fonts (via Google Fonts) |

---

## Project Structure

```
.
├── _config.yml           # Site-wide configuration
├── _layouts/
│   ├── default.html      # Base layout (header, footer, dark mode)
│   ├── post.html         # Individual post layout (with sidebar + comments)
│   └── page.html         # Static page layout (About, etc.)
├── _includes/
│   ├── meta.html         # SEO meta tags, Open Graph, Twitter Card
│   ├── analytics.html    # Google Analytics GA4
│   ├── comments.html     # Utterances comments (GitHub Issues)
│   ├── sidebar.html      # Tag cloud + recent posts sidebar
│   ├── tags.html         # Inline tag pills for posts
│   └── favicon.html      # Favicon link tags
├── _posts/               # Blog posts (Markdown)
├── _sass/
│   ├── _variables.scss   # Design tokens, CSS custom properties, dark mode vars
│   ├── _highlights.scss  # Syntax highlighting (light + dark themes)
│   ├── _reset.scss       # CSS reset
│   └── _svg-icons.scss   # Footer icon styles
├── _data/
│   ├── tags.yaml         # Allowed tag list
│   └── authors.yaml      # Author definitions
├── images/               # Post images and favicon
├── style.scss            # Main stylesheet entry point
├── index.html            # Homepage (paginated post list)
├── about.md              # About page
├── robots.txt            # Search engine crawl rules
├── sitemap.xml           # XML sitemap
├── feed.xml              # RSS feed
└── POST_TEMPLATE.md      # Front matter reference (not published)
```

---

## Local Development

### Prerequisites

- Ruby (managed via `asdf` or `rbenv`)
- Bundler

### Setup

```bash
bundle install
```

### Serve locally

```bash
bundle exec jekyll serve --livereload
```

Then open [http://localhost:4000](http://localhost:4000).

### Build only

```bash
bundle exec jekyll build
```

Output goes to `_site/`.

---

## Writing a New Post

1. Create a file in `_posts/` named `YYYY-MM-DD-your-post-title.md`
2. Add front matter (see below)
3. Write content in Markdown
4. Commit and push to `main` — GitHub Pages builds automatically

### Minimal example

```markdown
---
layout: post
title: "Your Post Title"
description: "One or two sentences summarising the post for SEO."
date: 2026-02-23T10:00:00.000Z
tags:
    - aws
    - devops
comments: true
---

Your content here...
```

---

## Post Front Matter Reference

| Field | Required | Description |
| --- | --- | --- |
| `layout` | ✅ | Always `post` |
| `title` | ✅ | Displayed title. Use Title Case and wrap in quotes. |
| `description` | ✅ | 1–2 sentences for meta description, OG, and Twitter card. |
| `date` | ✅ | ISO 8601 format, e.g. `2026-02-23T10:00:00.000Z` |
| `tags` | ✅ | Array. See `_data/tags.yaml` for the current tag list. |
| `lastmod` | — | Last-modified date shown in the post. ISO 8601. |
| `image` | — | Absolute path to cover image, used for OG/Twitter cards. Falls back to `/images/default.svg`. |
| `keywords` | — | Additional SEO keywords array. Falls back to `tags` if omitted. |
| `comments` | — | `true` (default) or `false` to disable Utterances on a post. |

### Adding a new tag

Edit `_data/tags.yaml` and add the tag name as a new list item.

---

## Features

### SEO
- `jekyll-seo-tag` generates `<title>`, `<meta name="description">`, canonical URL, and JSON-LD structured data automatically.
- Per-post Open Graph and Twitter Card tags are in `_includes/meta.html`.
- Google site verification meta tag is set via `google_site_verification` in `_config.yml`.
- `sitemap.xml` covers all posts and pages; `robots.txt` allows full crawl.

### Dark Mode
- Defaults to the OS preference (`prefers-color-scheme`).
- User preference is persisted in `localStorage`.
- Toggle button in the header (🌙 / ☀️).
- All colours are CSS custom properties under `[data-theme="dark"]` in `_sass/_variables.scss`.
- Utterances comments theme syncs with the site theme automatically.

### Syntax Highlighting
- Rouge is used server-side (no client JS required).
- Light theme mirrors GitHub's syntax colours; dark theme mirrors GitHub Dark.
- Line numbers are enabled globally via `kramdown` config in `_config.yml`.
  - To disable line numbers on a single block, use a plain fenced code block — line numbers require the `linenos` option or the kramdown table mode.

### Comments (Utterances)
- Backed by GitHub Issues on this repository.
- Enabled by default on all posts (`defaults` in `_config.yml`).
- Disable per-post with `comments: false` in front matter.
- Change the repo, label, or theme in `_config.yml` under `comments.utterances`.

### Sidebar
- Tag cloud (all unique tags across posts).
- 5 most recent posts.
- On mobile the sidebar appears above the post list.

### Analytics
- Google Analytics GA4 (`G-MJT8MKP4BN`). Update the ID in `_config.yml` under `google_analytics`.

---

## Configuration

All site-wide settings live in `_config.yml`. Commonly changed values:

```yaml
name: Jae Kim                         # Site name in header + SEO
description: "..."                    # Site tagline
url: https://iamjaekim.github.io      # Full URL (no trailing slash)
google_analytics: "G-XXXXXXXXXX"      # GA4 Measurement ID
google_site_verification: "..."       # Google Search Console verification code

comments:
  utterances:
    repo: iamjaekim/iamjaekim.github.io   # GitHub repo for Utterances
    issue_term: pathname
    label: blog-comment

paginate: 10                          # Posts per page on homepage
```

---

## Deployment

Push to the `main` branch. GitHub Pages triggers a Jekyll build automatically.

**Required GitHub settings** (Settings → Pages):
- Source: `Deploy from a branch`
- Branch: `main` / `/ (root)`

All plugins used (`jekyll-sitemap`, `jekyll-feed`, `jekyll-paginate`, `jekyll-seo-tag`) are on the [GitHub Pages whitelist](https://pages.github.com/versions/) and require no extra configuration.