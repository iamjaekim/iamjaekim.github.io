---
layout: post
title: "Rollback Is Not Rebuild"
description: "A real rollback restores a previously verified artifact. If recovery requires source control, dependency downloads, and a fresh CI build, you are attempting another release during an incident."
date: 2026-08-26T10:24:00-04:00
author: jaewookkim
tags:
 - github-actions
 - developer-experience
 - platform-engineering
 - infrastructure
keywords:
 - deployment rollback
 - immutable artifacts
 - CI/CD resilience
 - container image digest
 - artifact promotion
 - GitHub Actions outage
comments: true
---

Hello, Jae Wook Kim here.

Production is broken.

The latest release is failing health checks, customers are seeing errors, and someone asks the obvious question:

> Can we roll back?

An engineer opens the deployment workflow, selects the previous Git tag, and starts a new build.

The workflow checks out old source code, downloads dependencies, builds a container image, publishes it, and deploys it.

That is not a rollback.

That is another release attempt during an incident.

> **A rollback restores something you already built and verified. A rebuild creates something new and hopes it behaves like the old thing.**

When everything is healthy, that distinction can feel academic. During an outage, it is the difference between recovering in two minutes and creating a second problem.

---

## Rebuilding Old Code Is Not Reproducing an Old Release

Teams often assume that rebuilding an old commit will reproduce the original artifact.

It might.

It might also produce something different because source code is only one input to a build:

- A base container image changed
- An unpinned dependency released a new version
- A transitive dependency resolved differently
- An operating-system package changed
- A build tool downloaded a newer binary
- Build-time configuration was updated
- A signing certificate expired
- An external download became unavailable
- The original runner image no longer exists

The commit can be identical while the build environment is not.

A Git tag tells you which source code you requested. It does not prove that the resulting binary is the same one that previously ran in production.

If a known-good application artifact already exists, the safest recovery action is usually to restore that exact artifact.

Not its source code.

Not a fresh image carrying the same version tag.

The exact artifact.

---

## Source Code Is Not the Release

Source code describes what should be built.

A release is the output of that source combined with a dependency graph, toolchain, configuration, and build environment.

For a containerized application, this is not a precise release identity:

```text
payments-api:v1.8.2
```

A tag can be changed unless the registry prevents it.

This is precise:

```text
payments-api@sha256:82f5b3c...
```

The same idea applies outside containers. A release could be:

- A signed application package and checksum
- A versioned static-site archive
- A serverless deployment package
- A machine image
- A compiled binary in an artifact repository
- A native cloud deployment revision

The format matters less than the property: once published, the artifact cannot change.

Your deployment system should record exactly which immutable artifact reached each environment. That gives you something real to restore later.

---

## Build Once, Promote the Same Artifact

A reliable release process separates building from promotion.

```text
Commit
  ↓
Build and test
  ↓
Publish immutable artifact
  ↓
Deploy to development
  ↓
Promote to staging
  ↓
Promote to production
```

The application artifact stays the same throughout the process.

Environment-specific configuration can still change:

- Secret references
- Runtime variables
- Replica counts
- Resource limits
- Traffic policies
- Feature flags

But the executable application does not get rebuilt for each environment.

If staging tested digest `sha256:82f5b3c`, production should receive that digest too.

This gives you a useful guarantee:

> The thing we tested is the thing we deployed.

It also makes rollback much simpler:

> The thing that previously worked is the thing we restore.

---

## Tags Are for People. Digests Are for Systems.

Human-readable versions are useful. Nobody wants to discuss a production incident using a seventy-character hash.

Keep the version, but record the immutable value behind it:

```text
Service: payments-api
Version: v1.8.2
Commit: 91de220
Image: registry.example.com/payments-api@sha256:82f5b3c...
Built by: workflow run 1842
Built at: 2026-08-26T11:42:00Z
```

The version helps people communicate.

The digest tells the deployment platform exactly what to run.

During rollback, use the digest from the previous healthy deployment. Do not resolve a mutable tag and assume it still points to the same object.

Tags such as these are especially weak recovery references:

```text
latest
staging
production
rollback
```

They describe current intent, not historical identity.

---

## Rollback Should Not Need the Build System

Normal delivery depends on a lot of moving parts:

```text
Source control
    ↓
CI runner
    ↓
Package registries and build tools
    ↓
Artifact registry
    ↓
Runtime
```

Rollback should ideally need only the final two:

```text
Artifact registry
    ↓
Runtime
```

That is the resilience benefit.

If GitHub, CI, or a package registry is unavailable, you can still restore a previously built artifact.

This is the practical follow-up to [GitHub Is Your Developer Platform. What Happens When It Goes Down?]({% link _posts/2026-08-25-github-degraded-operating-mode.md %}).

A GitHub outage may stop new releases. It should not automatically remove your ability to restore production.

---

## Keep the Artifacts You May Need

Once rollback depends on existing artifacts, retention becomes part of the recovery plan.

For each critical service, decide:

- How many production releases are retained?
- How long are they kept?
- Can an artifact be overwritten?
- Can the normal CI role delete it?
- Is its checksum or signature recorded?
- Can responders access it without the primary CI provider?
- Is the current production digest stored somewhere other than CI logs?

A registry cleanup policy that deletes old images after seven days may look tidy.

It can also delete your rollback path.

At minimum, retain the current production artifact, the previous known-good artifact, and enough recent releases to cover your operational recovery window.

Do not let a generic cleanup job decide what production can recover to.

---

## The Build Pipeline Should Not Be Able to Erase Recovery

The pipeline needs permission to publish new artifacts.

It does not necessarily need permission to overwrite or delete production artifacts.

A safer separation looks like this:

```text
Build role:
  publish new artifacts
  attach metadata
  cannot overwrite
  cannot delete protected releases
```

```text
Release role:
  promote an approved artifact
  cannot modify artifact contents
```

```text
Cleanup job:
  delete only artifacts outside retention rules
```

This protects previous releases from broken cleanup scripts, compromised workflows, leaked automation credentials, and accidental tag reuse.

The system creating the next release should not casually erase every previous one.

---

## An Old Artifact Is Not Always Enough

Rollback is easiest for stateless application changes.

Real releases may also change:

- Database schemas
- Event formats
- Infrastructure
- Cache structures
- Search indexes
- API contracts
- Data written by the new version

An old binary may no longer work with the new environment.

This does not make rollback useless. It means compatibility must be part of deployment design.

### Use Expand and Contract for Databases

Instead of removing a column immediately:

1. Add the new schema without removing the old one.
2. Deploy code that works with both versions.
3. Migrate the data.
4. Remove the old schema in a later release.

That keeps the previous application version usable during the transition.

### Keep Message Changes Compatible

A new producer should not immediately emit messages that the previous consumer cannot understand. Version events or evolve schemas in a backward-compatible way.

### Separate Deployment From Activation

Feature flags can disable a broken path without replacing the entire application. That may restore service faster than a deployment rollback.

Not every change can be rolled back cleanly.

Every change should still have a recovery plan.

Sometimes that plan is an old artifact. Sometimes it is a feature flag, traffic shift, data restoration, or forward fix.

Know which one before production.

---

## Rollback or Roll Forward?

Some teams prefer always rolling forward.

A forward fix is sometimes the correct answer, especially when data or infrastructure has changed. But it requires understanding the failure, editing code, reviewing it, validating it, building another artifact, and deploying it.

That takes time.

When a known-good release can restore service quickly, I prefer this sequence:

1. Roll back and stabilize production.
2. Investigate without the same customer pressure.
3. Build and validate the actual fix.
4. Deploy it through the normal path.

Rollback and roll forward are not competing philosophies.

One restores service. The other fixes the defect.

---

## Record Which Deployment Was Actually Healthy

A deployment is not known-good just because the workflow completed.

Record enough information to connect an artifact to production health:

```text
v1.8.0  sha256:3ab...  healthy
v1.8.1  sha256:91d...  healthy
v1.8.2  sha256:82f...  unhealthy
```

Useful deployment metadata includes:

- Artifact identity
- Environment
- Timestamp
- Initiating identity
- Change reference
- Rollout result
- Health-check result
- Rollback relationship
- Incident reference

Then the emergency action becomes simple:

```text
Restore the artifact from the last healthy production deployment.
```

That is much safer than searching old CI runs and guessing which tag was stable.

---

## Make Rollback Boring

During an incident, the responder should provide only a few inputs:

```text
Service: payments-api
Environment: production
Target: previous healthy deployment
Incident: INC-482
```

The platform should show what will happen:

```text
Current artifact:
payments-api@sha256:82f5...

Rollback artifact:
payments-api@sha256:91de...

Previous health:
Healthy for 43 hours

Expected action:
Replace 6 workloads, verify health, then shift traffic

Database compatibility:
Verified

Approval:
Required
```

After approval, the platform should verify the artifact, deploy it without rebuilding, run health checks, restore traffic, and record the outcome.

Boring is good.

An incident tool should reduce decisions, not show off how flexible the platform is.

---

## Test It Before the Incident

A rollback button that has never been used is a hypothesis.

Run a simple exercise:

1. Deploy a test release.
2. Mark it unhealthy.
3. Block access to source control and CI.
4. Ask a responder to restore the previous artifact.
5. Measure recovery time.
6. Write down every hidden dependency.

You may discover that:

```text
The rollback script is stored only in GitHub.
The old image was deleted.
The deployment record contains only a mutable tag.
The emergency role cannot access the registry.
The old application cannot run after the database migration.
```

Those are not documentation problems.

They are delivery-platform problems.

---

## A Practical Checklist

For each production service:

1. Build the artifact once.
2. Give it an immutable identity.
3. Promote the same artifact between environments.
4. Record the exact production digest or checksum.
5. Retain previous healthy releases.
6. Prevent normal pipelines from overwriting or deleting them.
7. Design backward-compatible data changes where possible.
8. Provide an approved runtime rollback path.
9. Keep recovery instructions outside the build system.
10. Test rollback with source control and CI unavailable.

If a step says “rerun the old build,” stop.

You found a build dependency, not a rollback.

---

## The Takeaway

Rebuilding an old commit feels like rollback because the version number moves backward.

Operationally, it is a new build:

- Dependencies may resolve differently
- Toolchains may have changed
- External services may be unavailable
- CI itself may be part of the incident
- The output is not the artifact previously tested in production

A real rollback restores an artifact whose identity and previous behavior are already known.

Build it once.

Test it.

Promote the same artifact.

Keep it long enough to recover.

Then make restoration possible without the system that built it.

**If rollback starts with a build, it is not rollback. It is hope with a version tag.**
