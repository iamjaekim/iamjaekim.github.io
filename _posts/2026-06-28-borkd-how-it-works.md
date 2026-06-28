---
layout: post
title: "How borkd.dev Works: Edge-Native Status Aggregation on Cloudflare"
description: "A technical walkthrough of how borkd.dev aggregates cloud provider statuses using Cloudflare Workers, Queues, and KV — with no servers and near-zero cost."
date: 2026-06-28T11:00:00.000Z
author: jaewookkim
tags:
    - cloudflare
    - developer-experience
    - devops
    - hands-on
    - side-project
keywords:
    - Cloudflare Workers
    - Cloudflare KV
    - Cloudflare Queues
    - status aggregator
    - borkd.dev
    - edge computing
    - serverless
comments: true
---

Hello, Jae Wook Kim here.

This is the technical companion to [Why I Built borkd.dev]({% link _posts/2026-06-28-borkd-why-i-built-it.md %}). If you want the origin story, start there. This post is about how the thing actually works.

If you are building small reliability tools, internal platform dashboards, or any read-heavy service, this architecture may be useful.

[borkd.dev](https://borkd.dev) checks cloud and SaaS status endpoints on a fixed schedule and serves one unified JSON payload at the edge. The backend runs on **Cloudflare Workers**, **Cloudflare Queues**, and **Cloudflare KV**. No servers to patch, no database to babysit.

---

## Architecture Overview

```
Cron Trigger (scheduled)
       │
       ▼
  Scheduled Handler
  (seeds a queue with provider chunks)
       │
       ▼
  Queue Consumer
  (fetches statuses in parallel batches)
       │
       ▼
  Hash comparison → write to storage (only if changed)
       │
       ▼
  GET /api/status → served from KV + Cloudflare Cache
       │
       ▼
  React SPA (hosted as Worker static assets)
```

The key design principle: **writes are async and cheap; reads are instant and cached.**

That one decision shaped almost everything else.

---

## The Cron Trigger

A Cloudflare Worker cron trigger fires on a fixed interval. The scheduled handler loads active providers from configuration and seeds the queue.

Providers are chunked into small batches so the consumer can parallelize work without creating rate-limit spikes or memory pressure.

---

## The Queue Consumer: Chain-Processing Pattern

The queue consumer processes one chunk at a time and chains the next chunk until the run completes.

`Promise.allSettled` is critical here. One upstream timeout should not take down the whole run. Failed providers degrade to `RED`; everyone else still updates.

---

## The Fetcher Registry

Different status providers use different API formats. The `FetcherRegistry` maps a provider type to a fetcher function:

| Type | Used For | API Format |
|------|----------|------------|
| `statuspage` | GitHub, Vercel, Netlify, Datadog… | Atlassian Statuspage v2 API |
| `statusio` | GitLab, others | Status.io API |
| `custom` | AWS, Azure, GCP | Custom parsers per-provider |

The Atlassian Statuspage API (`/api/v2/summary.json`) is the most common format. Supporting it first gave the best coverage with the least custom code.

---

## Hash-Based KV Writes

Each run fetches fresh data, but storage writes are deduplicated. A payload hash is compared to the previous version, and data is written only when a meaningful change is detected.

In practice, most scheduled runs result in no write at all. Status rarely changes that quickly, so deduplication keeps write volume low.

---

## The API Endpoint

The frontend calls a status API endpoint. Responses are cached at the edge with a short TTL so repeated reads stay fast while updates remain timely.

Most requests never touch KV at all. They are served from the edge cache, which is why the dashboard feels fast from almost anywhere.

---

## Auto-Discovery

Users can submit a new service via the intake form. Rather than requiring manual review of every submission, an auto-discovery engine runs heuristics against the submitted name:

1. **Known providers** (AWS, Azure, GCP) — hardcoded, instantly approved
2. **Atlassian Statuspage guess** — tries common endpoint conventions and validates response shape before auto-approval
3. **Status.io header check** — falls back to fetching the root page and inspecting response headers for Status.io fingerprints
4. **Manual review queue** — if neither heuristic fires, the submission is held for manual review

Result: most popular SaaS tools are onboarded automatically with no human step.

---

## The Frontend

The React SPA is deployed as **Cloudflare Workers static assets** — bundled directly into the same Worker deployment as the backend. No separate CDN, no S3 bucket.

The frontend polls the status endpoint on a short interval using a custom hook. Status changes trigger subtle animations. The UI is built with Tailwind CSS.

## Trade-Offs and Limits

This design is intentionally simple, but not perfect:

1. **Eventually consistent reads** — cache + KV means very small delay before updates appear globally
2. **Provider API drift** — status endpoints can change format without warning, so parsers need occasional maintenance
3. **Interval-level freshness** — the polling cadence is enough for awareness, not incident forensics

For this product, those are acceptable trade-offs. Simplicity and low cost mattered more than second-by-second precision.

---

## Cost

This setup is intentionally low-cost and has stayed inexpensive to operate so far.

That cost constraint was part of the architecture, not an afterthought.

---

## Deployment

I keep deployment intentionally simple: one pipeline deploys both API and frontend together, with environment bindings managed in Cloudflare configuration.

The important part is operational: no manual release steps, safe rollouts, and a fast path to rollback when needed.

---

If you want to see it running: **[borkd.dev](https://borkd.dev)**

If a provider you care about is missing, submit it. If it matches common status platforms, it is usually discoverable within the next cron cycle.
