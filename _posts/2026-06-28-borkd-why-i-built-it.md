---
layout: post
title: "Why I Built borkd.dev: One Tab Instead of Ten"
description: "I was tired of opening a dozen browser tabs just to figure out if a cloud provider was having a bad day. So I built one place to check them all."
date: 2026-06-28T10:00:00.000Z
author: jaewookkim
tags:
    - developer-experience
    - side-project
    - devops
    - cloudflare
keywords:
    - status page aggregator
    - cloud provider status
    - SRE tools
    - borkd.dev
    - DevOps productivity
comments: true
---

Hello, Jae Wook Kim here.

Quick story.

One Tuesday morning, a deploy failed in CI right before a demo. The error looked like an auth issue, then a timeout, then a transient network failure. For 20 minutes I did what most of us do: retried jobs, tailed logs, and second-guessed recent changes.

Then I opened status pages. GitHub had an incident. The pipeline was fine. My code was fine. I had burned 20 minutes proving a problem I did not own.

You know the drill. Something in your pipeline is failing. You are not sure if it's your code, a dependency, or a cloud provider having a rough morning. So you open a new browser tab.

Then another one. Then another.

- `status.github.com` — *is GitHub Actions down?*
- `cloudflare.com/system-status` — *is their Workers runtime okay?*
- `status.openai.com` — *maybe it's the AI API?*
- `health.aws.amazon.com` — *what about S3?*

Before you know it you have ten tabs open, you are scanning five different dashboards with five different UI conventions, and you still don't have a single, definitive answer.

This frustrated me more than I expected. Not because the information wasn't available — every major cloud provider publishes a status page. The problem was the **friction**: opening each one manually, remembering the URLs, and then mentally aggregating the results yourself.

If you are an engineer, SRE, or platform team member, this is a repeat tax you pay every week.

---

## What I Actually Wanted

I wanted one page. A single, fast-loading view that showed me the current health of every provider I care about. No accounts, no logins, no configuration. Just open it and know.

The requirements I had in my head were simple:

1. **Fast** — if I'm already debugging something, I don't need another slow page to wait for
2. **Comprehensive** — AWS, GCP, Azure, GitHub, Cloudflare, Vercel, Netlify, OpenAI, and more
3. **Cheap** — ideally free or near-free to run; this is a utility, not a product
4. **No extra googling** — the URL should be memorable and the page should be self-explanatory

So I built [borkd.dev](https://borkd.dev): one URL, one glance, one answer to "is it me or is it the platform?"

---

## The Name

"Borked" is slang for "broken" or "messed up." If AWS is having issues, AWS is *borked*. The name felt honest. The `.dev` TLD felt right for the audience.

---

## What It Looks Like

It's a high-contrast, dark-mode grid. Each provider gets a card. Each card has a name, a current status indicator (green/yellow/red), and a timestamp for when it was last checked. You can see everything at once — no scrolling, no clicking into sub-pages.

The design is intentionally utilitarian. This is a tool, not a marketing site.

The goal is not beauty. The goal is confidence, fast.

---

## What's Next

Right now the list of providers is curated by me. I've added a submission form so anyone can request a new service to be tracked. There's also an auto-discovery engine running in the backend that can detect whether a submitted URL is an Atlassian Statuspage or Status.io instance and automatically promote it to the active list.

If you want the full technical breakdown — how the edge worker, queue, and KV stores fit together — I've written a separate post about that: [How borkd.dev Works Under the Hood]({% link _posts/2026-06-28-borkd-how-it-works.md %}).

Otherwise, go check it out: **[borkd.dev](https://borkd.dev)**

If a provider is missing, hit "Submit a Service." Most mainstream providers auto-activate quickly, and if not, I review it manually.
