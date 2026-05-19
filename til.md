---
layout: page
title: Today I Learned
permalink: /til/
---

Inspired by Simon Willison's [Today I Learned](https://til.simonwillison.net/).

{% for post in site.posts -%}
{% if post.categories contains "til" -%}
[ {{ post.title }} ]({{ post.url }}) - {{ post.date | date: "%Y-%m-%d" }}  
{% endif -%}
{% endfor -%}
