---
layout: post
title: "GitHub Is Your Developer Platform. What Happens When It Goes Down?"
description: "The August 17 GitHub outage disrupted Git, Actions, pull requests, APIs, authentication, webhooks, and Copilot. You do not need a second GitHub. You need a degraded operating mode."
date: 2026-08-25T09:00:00-04:00
author: jaewookkim
tags:
 - github-actions
 - developer-experience
 - platform-engineering
 - infrastructure
keywords:
 - GitHub outage
 - GitHub Actions outage
 - developer platform reliability
 - degraded operating mode
 - CI/CD resilience
 - platform engineering
 - deployment continuity
comments: true
---

Hello, Jae Wook Kim here.

On August 17, 2026, GitHub went down for 7 hours and 47 minutes.

Not just the website.

Git operations, pull requests, Actions, APIs, authentication, webhooks, issues, and Copilot were all affected. For many engineering teams, software delivery did not merely slow down.

It stopped.

Now imagine production is broken during that outage.

You identify the fix, but cannot open a pull request. Required checks cannot run. The merge queue is unavailable. GitHub Actions cannot deploy. The production role trusts GitHub OIDC, so your pipeline cannot authenticate to the cloud. The rollback instructions are stored in the same unavailable platform.

Your application does not run on GitHub.

Your ability to repair it does.

That is the uncomfortable lesson:

> **GitHub is no longer just where your code lives. It is your developer platform.**

The predictable reaction is to ask whether we need a second Git provider or backup CI platform.

Most teams do not.

Rebuilding GitHub's complete operating model somewhere else would be expensive, difficult to maintain, and probably less reliable than GitHub itself.

The better question is:

> **What must our engineering organization still be able to do while GitHub is unavailable?**

You do not need a second GitHub.

You need a degraded operating mode.

---

## GitHub Became the Control Plane

A modern delivery path often looks like this:

```text
Issue
  ↓
Branch
  ↓
Pull request
  ↓
Required checks
  ↓
Review
  ↓
Merge queue
  ↓
GitHub Actions
  ↓
OIDC authentication
  ↓
Artifact publication
  ↓
Deployment
```

GitHub participates in almost every transition.

Your workloads may run on AWS, but GitHub Actions deploys them. Your artifacts may live in another registry, but a GitHub workflow creates them. Your production role may live in the cloud, but it trusts GitHub's identity provider.

Even operational knowledge may depend on it:

- Runbooks stored in repositories
- Ownership defined in `CODEOWNERS`
- Releases identified through Git tags
- Incident automation started by webhooks
- Deployment history recorded in Actions
- Internal tools authenticated through GitHub

A team can truthfully say, “Production does not run on GitHub,” while remaining unable to change or repair production without it.

GitHub is the control plane even when it is not the data plane.

---

## Your “Independent” Systems May Fail Together

Most architectures look more resilient on a diagram than they are in reality.

GitHub Actions, pull requests, APIs, webhooks, authentication, and Copilot appear as separate boxes. During a platform-wide incident, those boxes can fail together.

Even systems outside GitHub may depend on the same failure domain:

```text
Alternative CI
    ↓
Downloads source from GitHub
    ↓
Installs an Action from GitHub
    ↓
Fetches a tool from GitHub Releases
    ↓
Pulls a base image from GHCR
    ↓
Uses GitHub OIDC to reach AWS
```

That is not an independent fallback. It is another route through the same dependency.

The lesson is simple:

> **Multiple services are not redundant when they share the same control plane.**

Before buying a backup tool, trace the entire path required to build, release, deploy, and recover a critical service.

The hidden dependency is usually not the Git repository itself. It is everything around it.

---

## Why a Second GitHub Is Usually the Wrong Answer

Moving source code to another provider is easy.

Moving the developer platform is not.

The real migration surface includes:

- Repository permissions
- Branch protections
- Pull-request workflows
- Merge queues
- CI/CD pipelines
- Secrets and environments
- OIDC trust policies
- Security scanning
- Package publishing
- Dependency automation
- Webhooks and integrations
- Audit controls
- Issue and project data

Running two active platforms is harder still. Every repository, permission, secret, policy, workflow, and integration must remain synchronized.

And the backup has to be exercised.

A cold standby that nobody uses is not a continuity plan. It is configuration you hope still works.

For most organizations, several hours of paused feature development cost less than continuously operating a second developer platform.

That does not mean accepting total paralysis.

It means protecting only the capabilities that cannot wait.

---

## What Can Stop, and What Cannot?

During an eight-hour outage, it may be perfectly acceptable to pause:

- Feature pull requests
- Routine releases
- Dependency updates
- Documentation changes
- Automated issue management
- AI-assisted development

Other activities may be urgent:

- Rolling back a broken release
- Shipping a critical security fix
- Rotating compromised credentials
- Restoring a failed service
- Shifting production traffic
- Disabling a dangerous feature

Start continuity planning with three questions:

1. What can safely stop for eight hours?
2. What must continue within one hour?
3. What must remain possible immediately?

This keeps the solution small.

The goal is not normal developer productivity during a GitHub outage.

The goal is safe production operation.

---

## Degraded Mode Should Be Intentionally Smaller

Normal software delivery may support:

```text
Plan → Code → Review → Test → Merge → Build → Release → Deploy
```

Degraded mode may support only:

```text
Diagnose → Select known artifact → Approve → Roll back
```

For an emergency patch, it might support:

```text
Patch
  ↓
Review through an approved alternate channel
  ↓
Run a reduced but mandatory validation set
  ↓
Build or retrieve an immutable artifact
  ↓
Approve
  ↓
Deploy
  ↓
Reconcile after recovery
```

The emergency path should be less flexible than normal delivery.

Only named responders should use it. Only critical services and operations should be supported. High-impact actions should require independent approval. Every action should be recorded somewhere outside GitHub.

Flexibility is useful during normal development.

During an outage, flexibility becomes risk.

---

## First Priority: Roll Back Without Rebuilding

The most valuable continuity improvement is also the most boring:

> **Rollback should not require source code or CI.**

If production is failing while GitHub Actions is unavailable, the safest response is usually to restore a known-good artifact that already exists.

A resilient release process looks like this:

```text
Build once
    ↓
Publish an immutable artifact
    ↓
Promote that same artifact
    ↓
Record its deployed version
    ↓
Retain previous known-good versions
```

That may mean:

- A container image identified by digest
- A versioned static-site artifact
- A signed application package
- A native cloud deployment revision
- A known-good infrastructure configuration

The emergency process selects and redeploys an existing version. It does not check out old code, reinstall dependencies, and hope the build remains reproducible.

If “rollback” requires another build, it is not rollback.

It is a new release attempt during an incident.

---

## Second Priority: Controlled Break-Glass Access

If GitHub Actions is the only system allowed to modify production, an Actions outage removes your operational path.

The wrong fix is giving engineers permanent administrator credentials.

The right fix is controlled break-glass access:

- Dedicated emergency identities
- Strong authentication
- Short-lived elevated sessions
- Explicit incident references
- Narrow operational roles
- Independent approval
- Central audit logging
- Automatic expiration
- Mandatory post-incident review

Emergency operations should focus on recovery:

- Deploy a known-good artifact
- Restart a failed workload
- Shift traffic
- Disable a feature
- Scale a service
- Rotate a secret
- Restore data
- Revoke compromised access

The emergency path should not impersonate the normal pipeline.

It should be visibly different, more restrictive, and more heavily audited.

---

## OIDC Is Still the Right Choice

GitHub Actions with OIDC is safer than permanent cloud credentials. Keep using it.

But OIDC creates an intentional availability dependency: GitHub must be available for the workflow to receive cloud credentials.

Represent that honestly in the architecture.

Do not store long-lived production keys in GitHub Secrets as a “backup.” That defeats workload identity and creates a larger security problem.

Use separate identity paths:

```text
Normal deployment:
GitHub Actions
    ↓
OIDC
    ↓
Scoped deployment role
```

```text
Emergency operation:
Incident responder
    ↓
Strong authentication and approval
    ↓
Short-lived break-glass role
```

Security and availability are not opposites.

A good identity design supports both without turning an outage plan into a permanent credential leak waiting to happen.

---

## Third Priority: Put the Runbook Outside the Failure

An outage runbook stored only in GitHub is useless during a GitHub outage.

Critical recovery procedures should be published somewhere with a different dependency path:

- An independent documentation platform
- Secured object storage
- The incident-management system
- An offline emergency package
- A narrowly mirrored operations repository

Do not mirror every document. Preserve what responders need when normal tooling fails:

- How to declare an incident
- How to request break-glass access
- How to identify the deployed version
- How to inspect production health
- How to roll back
- How to rotate credentials
- How to record emergency actions
- How to reconcile after recovery

Read the runbook from the perspective of the outage.

If step one says “open the GitHub Actions workflow,” you do not have a GitHub-outage runbook.

---

## Local Git Helps, Until the Build Reaches the Network

Git itself is distributed.

A developer with an existing clone can still inspect history, create branches, write code, run local tests, and generate a patch while GitHub is unavailable.

That is useful, but often overstated.

The local repository may still depend on GitHub for:

- Submodules
- Private dependencies
- Git-based npm or Python packages
- Go modules
- GitHub Releases
- Raw installation scripts
- Base images from GHCR
- Security databases
- Build tools downloaded on demand

The source may be local while the build remains completely network-dependent.

Test an emergency build with GitHub access blocked. You will find the real dependency graph very quickly.

---

## Cache for Availability, Not Just Speed

Caching is usually sold as a performance feature.

It is also a reliability feature.

A build with pinned tools, mirrored packages, cached dependencies, and retained base images survives failures that stop a build dependent on live downloads.

Useful practices include:

- Pin dependencies and Actions to immutable versions
- Mirror critical packages and container images
- Retain essential build tools internally
- Avoid arbitrary `curl | bash` installation
- Preserve immutable release artifacts
- Maintain emergency caches outside GitHub
- Test builds with restricted external access

A GitHub Actions cache does not provide independence from GitHub. If Actions is unavailable, that cache is unavailable too.

The fallback must live in a different failure domain.

Do not mirror the entire internet. Mirror what critical recovery paths actually need.

---

## Manual Does Not Mean Reckless

“Manual deployment” often sounds like an engineer running undocumented commands from a laptop.

That is not degraded mode. That is improvisation.

A manual emergency path can still be controlled:

- Commands are versioned and tested
- Inputs are explicit
- Artifacts use immutable identifiers
- Authentication is short-lived
- High-impact operations require two people
- Logs are captured independently
- Health is verified afterward
- Changes are reconciled when GitHub returns

A boring rollback script tested every quarter is more valuable than an elaborate standby CI platform nobody has used.

Automation is not the goal.

Safe, repeatable recovery is.

---

## Decide What Cannot Be Bypassed

Some controls may be reduced during an outage. Others should remain non-negotiable.

| Control | Degraded Mode |
|---|---|
| Full test suite | May be reduced for an emergency patch |
| Pull-request UI | May be unavailable |
| Human review | Must remain |
| Artifact integrity | Must remain |
| Production authentication | Must remain |
| Audit logging | Must remain |
| Rollback plan | Must remain |
| Least privilege | Must remain |
| Routine release schedule | Pause |

The exact policy will differ by organization.

Decide it before the incident.

If every safeguard becomes optional under pressure, you do not have an emergency process. You have executive improvisation.

---

## Recovery Includes Reconciliation

GitHub returning does not complete the incident.

Work performed during degraded mode may create a second source of truth:

- Production no longer matches the default branch
- A configuration change is missing from Terraform
- A patch exists only on one laptop
- A temporary credential remains active
- Deployment history is incomplete

Every emergency action needs enough metadata to reconcile later:

```text
Incident: INC-482
Operator: Jae
Service: payments-api
Previous artifact: sha256:91de...
Deployed artifact: sha256:a12b...
Approval: incident commander
Time: 2026-08-17T15:42:00Z
Reason: rollback authentication regression
```

After recovery, turn that record into the appropriate commit, pull request, deployment annotation, infrastructure update, and audit evidence.

The fallback path is temporary.

Its changes cannot remain invisible.

---

## Test It Without GitHub

A procedure that has never been exercised is documentation, not capability.

Run a small continuity exercise:

- Block GitHub access for the participants
- Give them a failed production service
- Ask them to identify the current version
- Issue emergency credentials
- Roll back to the previous artifact
- Verify the service
- Revoke access
- Reconcile the action afterward

This will expose hidden assumptions immediately:

```text
The rollback script is in GitHub.
The artifact is in GitHub Releases.
The approval link points to a GitHub issue.
The runbook uses GitHub authentication.
The cloud role trusts only GitHub OIDC.
```

That is the point of the exercise.

Finding the failure during a drill is cheap.

Finding it during a seven-hour provider outage is not.

---

## The Practical Checklist

For each critical service:

1. Identify the currently deployed immutable artifact.
2. Retain at least one known-good previous artifact.
3. Document a rollback that does not rebuild source.
4. Provide short-lived, audited break-glass access.
5. Store the emergency runbook outside GitHub.
6. Trace build and deployment dependencies that still require GitHub.
7. Decide which controls remain mandatory.
8. Record emergency actions independently.
9. Define how changes will be reconciled.
10. Test the path without GitHub access.

Do this where an eight-hour inability to act creates real business risk.

Let routine feature development wait.

Resilience is prioritization, not duplication.

---

## The Takeaway

GitHub's outage mattered because the platform has become deeply embedded in modern software delivery.

That centralization is not automatically a mistake. GitHub provides enormous productivity, security, and developer experience benefits.

The mistake is assuming normal delivery must remain available during a platform-wide failure.

Most engineering work can pause.

A small set of production operations cannot.

Protect those operations deliberately:

- Roll back existing artifacts without rebuilding
- Operate production through controlled emergency access
- Keep critical runbooks in another failure domain
- Preserve independent audit evidence
- Reconcile every emergency change after recovery

Do not respond to one provider outage by building a worse version of the provider.

Build a smaller, safer path for the work that cannot wait.

**You do not need a second GitHub. You need a degraded operating mode.**
