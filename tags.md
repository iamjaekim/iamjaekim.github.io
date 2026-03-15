---
layout: page
title: Tags
permalink: /tags/
description: "Browse all blog posts by tag — Terraform, AWS, CDK, CI/CD, Infrastructure as Code, and more."
---

<div class="tags-page">
  {% assign sorted_tags = site.tags | sort %}
  {% for tag in sorted_tags %}
    <section class="tag-section" id="{{ tag[0] | slugify }}">
      <h2 class="tag-section-title">
        <span class="tag-pill">{{ tag[0] }}</span>
        <span class="tag-count">{{ tag[1].size }} post{% if tag[1].size != 1 %}s{% endif %}</span>
      </h2>
      <ul class="tag-post-list">
        {% assign posts_for_tag = tag[1] | sort: "date" | reverse %}
        {% for post in posts_for_tag %}
        <li class="tag-post-item">
          <time class="tag-post-date">{{ post.date | date: "%b %d, %Y" }}</time>
          <a href="{{ post.url | relative_url }}" class="tag-post-link">{{ post.title }}</a>
        </li>
        {% endfor %}
      </ul>
    </section>
  {% endfor %}
</div>
