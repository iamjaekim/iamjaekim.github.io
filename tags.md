---
layout: page
title: Topics
permalink: /tags/
description: "Explore practical articles on developer experience, platform engineering, GitHub Actions, Terraform, cloud infrastructure, and AI agents."
---

<p class="topics-intro">Browse the main ideas I write about. Start with a focused topic, then follow the related links at the end of each article.</p>

<nav class="featured-topics" aria-label="Core topics">
  <a href="#developer-experience"><strong>Developer Experience</strong><span>Onboarding, feedback loops, and reducing friction.</span></a>
  <a href="#platform-engineering"><strong>Platform Engineering</strong><span>Golden paths, control planes, and reliable self-service.</span></a>
  <a href="#github-actions"><strong>GitHub Actions</strong><span>Reusable automation, CI/CD, and delivery resilience.</span></a>
  <a href="#terraform"><strong>Terraform & IaC</strong><span>Infrastructure workflows, modules, state, and automation.</span></a>
</nav>

<div class="tags-page">
  {% assign sorted_tags = site.tags | sort %}
  {% for tag in sorted_tags %}
    <section class="tag-section" id="{{ tag[0] | slugify }}">
      <h2 class="tag-section-title">
        <span>{{ tag[0] | replace: '-', ' ' | capitalize }}</span>
        <span class="tag-count">{{ tag[1].size }} article{% if tag[1].size != 1 %}s{% endif %}</span>
      </h2>
      <ul class="tag-post-list">
        {% assign posts_for_tag = tag[1] | sort: "date" | reverse %}
        {% for post in posts_for_tag %}
        <li class="tag-post-item">
          <time class="tag-post-date" datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%b %d, %Y" }}</time>
          <div>
            <a href="{{ post.url | relative_url }}" class="tag-post-link">{{ post.title }}</a>
            {% if post.description %}<p>{{ post.description }}</p>{% endif %}
          </div>
        </li>
        {% endfor %}
      </ul>
    </section>
  {% endfor %}
</div>
