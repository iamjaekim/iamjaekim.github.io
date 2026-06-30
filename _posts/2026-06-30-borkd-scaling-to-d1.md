---
layout: post
title: "Scaling borkd.dev: Why I Migrated from Cloudflare KV to D1"
description: "How I hit the limits of Cloudflare KV list operations and refactored my edge-native status dashboard to use a hybrid D1 and KV architecture."
date: 2026-06-30T10:00:00.000Z
author: jaewookkim
tags:
    - cloudflare
    - databases
    - devops
    - architecture
    - hands-on
    - scaling
keywords:
    - Cloudflare D1
    - Cloudflare KV
    - Serverless architecture
    - scaling
    - edge computing
    - borkd.dev
comments: true
---

Hello, Jae Wook Kim here.

A few days ago, I wrote about [how borkd.dev works]({% link _posts/2026-06-28-borkd-how-it-works.md %}), detailing its edge-native architecture using Cloudflare Workers, Queues, and KV. 

At the time, the entire backend relied solely on Cloudflare KV. I used one namespace (`STATUS_KV`) to cache the final rendered dashboard payload for the frontend, and a second namespace (`REGISTRY_KV`) to hold the list of all active status providers we needed to check.

It was a perfectly elegant solution for an MVP, but I quickly realized I had made a critical miscalculation regarding Cloudflare's free tier limits.

This post is about why Cloudflare KV isn't a silver bullet for everything, and how migrating the registry to **Cloudflare D1** (their serverless SQLite database) saved the architecture from mathematically breaking itself.

---

## The 1,000 `list()` Operation Limit

Cloudflare KV is designed to be a globally distributed, eventually consistent key-value store. If you know the exact key you want to fetch (e.g., `get('latest_status_payload')`), it is blindingly fast and you get a generous 100,000 read operations per day on the free tier.

But building a *registry* in KV requires relying on the `list()` operation. 

Every minute, my cron worker would trigger, call `list({ prefix: 'active:' })` on `REGISTRY_KV`, grab the list of all active endpoints, and seed the fetch queue. 

Here is where the architecture buckled: **Cloudflare's free tier only allows 1,000 `list()` operations per day.** 

A cron job running every minute executes 1,440 times a day. This meant that simply by existing and checking statuses, the app would exhaust its daily limit and crash within the first 16 hours of operation—regardless of how many users visited the site.
1. **Pagination Limits:** A single `list()` call only returns up to 1,000 keys. As the registry grows, you have to implement pagination loops, waiting for the cursor to return before making the next call.
2. **Execution Timeouts:** Cloudflare Workers have a hard limit on execution time. If you spend too much of your time budget paginating through a slow KV list operation, the worker crashes before it even seeds the queue.
3. **Ingestion Complexity:** The Auto-Discovery engine was also saving user submissions as `pending:` keys in the same KV namespace. Querying, filtering, and updating these entries required even more `list()` operations and manual parsing, creating a tangled, inefficient ingestion pipeline.

In short: **KV is a phenomenal cache, but a terrible database.**

---

## The Solution: A Hybrid D1 + KV Architecture

To fix this, I needed to separate the relational data (the registry) from the caching layer. I migrated the entire provider registry over to **Cloudflare D1**.

If you haven't used it, D1 is Cloudflare's native serverless SQLite database. It runs on the edge, speaks SQL, and handles relational queries effortlessly.

Here is how the hybrid architecture works today:

### 1. The Registry (D1)
We now have a simple `providers` SQL table. 

When the cron trigger fires (now optimized to every two minutes), the worker simply executes a blazing-fast SQL query:
```sql
SELECT * FROM providers WHERE status = 'active';
```
No pagination loops. No cursors. No string parsing. It just works.

Furthermore, D1 acts as the perfect ingestion layer. When a user submits a new URL via the frontend, it is inserted into the `providers` table with a status of `pending`. The Auto-Discovery engine can easily query for pending rows, run its heuristic checks, and execute a simple `UPDATE` query to promote them to `active`.

### 2. The Cache (KV)
`STATUS_KV` remains completely untouched. 

Once the queue consumer fetches all the latest statuses from the APIs, it generates the final unified JSON payload and saves it to KV. The React frontend continues to enjoy zero-latency edge reads.

---

## Takeaways

When building serverless architectures, it is tempting to use one tool for everything. Cloudflare KV is so easy to set up that using it as a pseudo-database feels natural at first. 

However, decoupling your state into the right purpose-built tools—**SQL for queries and relationships, KV for caching and fast edge reads**—is the secret to keeping your system resilient and your costs near zero.

Check out the updated architecture running live at **[borkd.dev](https://borkd.dev)**!
