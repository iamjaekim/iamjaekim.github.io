#!/usr/bin/env python3
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import sys
import xml.etree.ElementTree as ET

SITE = Path("_site")
ORIGIN = "https://iamjaekim.github.io"
errors = []

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self._in_title = False
        self.canonical = None
        self.description = None
        self.robots = None
        self.h1 = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "title":
            self._in_title = True
        elif tag == "h1":
            self.h1 += 1
        elif tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs.get("href")
        elif tag == "meta":
            name = attrs.get("name", "").lower()
            if name == "description": self.description = attrs.get("content")
            if name == "robots": self.robots = attrs.get("content")

    def handle_endtag(self, tag):
        if tag == "title": self._in_title = False

    def handle_data(self, data):
        if self._in_title: self.title += data

sitemap = SITE / "sitemap.xml"
if not sitemap.exists():
    errors.append("Missing _site/sitemap.xml")
else:
    try:
        root = ET.parse(sitemap).getroot()
        namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        urls = [node.text for node in root.findall("sm:url/sm:loc", namespace)]
        if not urls:
            errors.append("Sitemap contains no URLs")
        for url in urls:
            if not url.startswith(ORIGIN):
                errors.append(f"Unexpected sitemap origin: {url}")
    except Exception as exc:
        errors.append(f"Invalid sitemap XML: {exc}")

for path in SITE.rglob("*.html"):
    if path.name.startswith(("google", "naver")) or path.name == "404.html":
        continue
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8", errors="replace"))
    label = path.relative_to(SITE)
    if not parser.title.strip(): errors.append(f"{label}: missing title")
    if not parser.description or len(parser.description.strip()) < 50:
        errors.append(f"{label}: missing or weak meta description")
    if not parser.canonical:
        errors.append(f"{label}: missing canonical URL")
    elif not parser.canonical.startswith(ORIGIN):
        errors.append(f"{label}: invalid canonical origin {parser.canonical}")
    if parser.h1 != 1:
        errors.append(f"{label}: expected exactly one h1, found {parser.h1}")
    if parser.robots and "noindex" in parser.robots.lower():
        errors.append(f"{label}: unexpectedly marked noindex")

robots = SITE / "robots.txt"
if not robots.exists():
    errors.append("Missing robots.txt")
else:
    text = robots.read_text(encoding="utf-8")
    if f"Sitemap: {ORIGIN}/sitemap.xml" not in text:
        errors.append("robots.txt does not advertise the canonical sitemap")

if errors:
    print("SEO validation failed:")
    for error in errors: print(f"- {error}")
    sys.exit(1)

print("SEO validation passed: sitemap, canonicals, metadata, robots, and heading structure look healthy.")
