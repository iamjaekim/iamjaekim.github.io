---
layout: post
title: "Custom GitHub Actions vs Reusable Workflows: Two Layers of Reuse"
description: "Custom Actions and reusable workflows solve reuse at different layers. Understanding which layer you are working in is one of the highest-leverage things you can do for developer experience."
date: 2026-07-11T05:56:00.000Z
author: jaewookkim
tags:
 - github-actions
 - cicd
 - developer-experience
 - platform-engineering
keywords:
 - custom GitHub Actions
 - reusable GitHub Actions workflows
 - composite actions
 - developer experience
 - platform engineering
 - CI/CD golden path
comments: true
---

Hello, Jae Wook Kim here.

If you have used GitHub Actions for more than a few weeks, you have probably hit the copy-paste wall. One repository gets a decent pipeline, and then that YAML gets pasted into the next repo, and the next, until the organization is quietly maintaining twenty slightly different versions of the same idea.

The usual advice is "use reusable workflows." That is good advice, but it is only half the picture. GitHub actually gives you **two different layers of reuse**, and most of the confusion I see comes from people reaching for the wrong one, or not realizing there is a choice at all.

> **Custom Actions and reusable workflows are not competing tools. They solve reuse at different layers.**

Getting this distinction right is one of the highest-leverage things you can do for developer experience. Get it wrong and you end up with abstractions that are technically DRY but painful to use. Get it right and a developer ships their first change without needing to understand your entire CI setup.

This post is about the layers, not the YAML.

---

## Two Layers, Two Kinds of Reuse

Think of it in terms of what you are actually reusing.

A **custom Action** reuses a *step*. It packages a repeatable operation, "set up the toolchain," "calculate a version," "scan this artifact", into a single unit you can drop into any job. It runs inside a job that someone else defines.

A **reusable workflow** reuses a *process*. It packages an entire sequence of jobs, along with the runners, permissions, ordering, and gates that make that sequence trustworthy. It *is* the job, or rather, all of them.

Here is the mental model I use:

> **An Action is a building block. A workflow is a contract.**

A building block is something you compose with. A contract is something you agree to. When a team adopts your reusable workflow, they are agreeing to a defined process: these checks will run, in this order, under these rules. When they use your custom Action, they are just grabbing a well-made part and assembling the rest themselves.

Different layers, different promises.

---

## Why the Layer Matters for DX

The reason this is a developer experience question and not a trivia question comes down to **cognitive load**.

Every abstraction you publish makes a trade. It hides complexity, which is good, but it also removes control, which is sometimes bad. The skill is matching the amount hidden to what the developer actually wants to think about.

- A developer who just wants standard CI does not want to assemble a pipeline from parts. They want to say "run the standard pipeline" and move on. That is a **workflow**, the whole contract, one line to adopt.
- A developer building something non-standard does not want your entire opinionated process shoved onto them. They want the good parts, the toolchain setup, the security scan, and the freedom to arrange the rest. That is a set of **Actions**, building blocks they compose.

When you offer the wrong layer, you feel it immediately. Force everyone onto one giant workflow and the advanced teams start fighting it, adding hacks, or quietly forking. Offer only building blocks and the simple teams drown in boilerplate they did not want to write.

A good smell test: if teams keep asking, "Can I add one custom step before build?" your reusable workflow is probably too rigid. That does not mean the workflow is bad, it means some behavior belongs one layer lower as a custom Action, so teams can compose it without forking the whole process.

Good platform work means offering *both layers* so people can enter at the altitude that fits their problem.

---

## The Building Block Layer: Custom Actions

Custom Actions come in three flavors, and the choice between them is also a DX decision, mostly about who has to maintain and read them later.

**Composite Actions** bundle shell commands and other Actions into one step. No compilation, easy to read, easy to trust. This is where the vast majority of internal automation should live, setting up a runtime, installing dependencies, generating metadata. If someone can open the `action.yml` and understand it in thirty seconds, you have done it right.

**JavaScript Actions** are for when the logic outgrows shell. Parsing results, calling the GitHub API, making real decisions with real error handling. The moment your composite Action becomes a pile of nested `if` statements and `jq`, that is the signal to move up to a proper JavaScript or TypeScript Action.

**Docker Actions** are for when you genuinely need to control the runtime, specific system packages, isolation, tooling that is a nightmare to install otherwise. They are slower to start and Linux-only, so I treat them as the option of last resort.

My default progression:

1. Start with a composite Action.
2. Move to JavaScript when shell scripting turns into software.
3. Reach for Docker only when the runtime itself is the problem.

Do not build a TypeScript Action to run three shell commands. That is not engineering, that is decoration.

The whole point of this layer is that each Action does *one operation well* and stays composable. A small illustration, a setup step packaged as a composite Action:

{% raw %}
```yaml
# setup-node-project/action.yml (trimmed)
runs:
  using: composite
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        cache: npm
    - shell: bash
      run: npm ci
```
{% endraw %}

That is deliberately boring. It sets up a project consistently and does nothing else, no tests, no build, no deploy. Those are not this layer's job. A dozen teams can reuse this operation without inheriting anyone's opinions about the rest of their pipeline.

---

## The Contract Layer: Reusable Workflows

A reusable workflow answers a different question: not "how do I do this step" but "what is the *standard process* for shipping this kind of thing."

This is where the pieces that a single Action cannot own naturally live, multiple jobs, their ordering, which runner each uses, what permissions each is granted, and any approval gates. These are process-level concerns. They describe not just *what* runs but *under what rules*, and that is exactly what makes a workflow a contract rather than a convenience.

I will resist showing a full pipeline here, because honestly, the specific jobs are the least interesting part and they will look different for every team. What matters is the shape:

```yaml
# The caller's entire CI file
jobs:
  ci:
    uses: your-org/platform-automation/.github/workflows/node-ci.yml@v1
```

One line. That is the DX win. The team declares *intent*, "run the standard CI process", and the actual implementation lives centrally, maintained by people whose job is to maintain it.

When the platform team improves caching, tightens a permission, or adds a new required check, every repo on that contract inherits the improvement through a version bump. Nobody has to hand-edit fifty YAML files. The complexity moved out of the application repos and into one place designed to hold it.

That is the entire promise of the contract layer: **centralized process, minimal surface area for the consumer.**

---

## Composing the Layers

The two layers are best together. A well-built reusable workflow is not a monolith of inline shell, it is *assembled from custom Actions*.

```text
Custom Action        →  reusable operation ("set up the project")
      ↓
Reusable Workflow    →  standard process, built from those operations
      ↓
One-line caller      →  the team's entire CI file
      ↓
Developer ships code
```

The Action layer keeps the workflow readable and lets advanced teams reuse individual pieces. The workflow layer gives everyone else a single, trustworthy front door. Each layer covers the other's weakness.

This is also why "just put everything in one big Action" is a trap. An Action runs inside a single job, so it can never own the process-level concerns, ordering, per-job permissions, approval gates. Cram a whole pipeline into one Action and you either lose those guarantees or smear them across every caller. The layer boundary exists for a reason: **the workflow owns the process, the Action owns the operation.**

---

## Escape Hatches Are a Feature

One last DX principle, because it is where a lot of platforms go wrong: a golden path should be the *easiest* route, not the *only* route.

Offer people three altitudes and let them choose:

1. **Adopt the whole reusable workflow** if you are standard. One line, done.
2. **Compose from the custom Actions** if you need custom orchestration but still want the good parts.
3. **Write your own workflow** for the genuinely exceptional cases, while still meeting the same standards.

Most teams take door one and get a five-line CI file. The advanced teams take door two or three and do not feel trapped. Nobody has to fight the platform to get their work done, and that, more than any amount of DRY, is what makes people actually adopt it.

The best abstraction is the one people reach for because it is genuinely easier, not because you forced it on them.

---

## The Takeaway

Reuse in GitHub Actions is not one decision, it is two, at two different layers.

- **Custom Actions** reuse an operation. They are building blocks: composable, single-purpose, the parts you assemble with.
- **Reusable workflows** reuse a process. They are contracts: centralized, opinionated, the front door for everyone who just wants the standard thing.

The developer experience win is not picking one. It is understanding which layer a given problem lives at, and offering people the right altitude to enter, from "give me the whole pipeline in one line" to "give me the parts and get out of my way."

**Actions are the building blocks. Workflows are the contracts. The art is knowing which layer you are working in.**
