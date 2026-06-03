---
layout: page
title: Archive
---

{% for post in site.posts -%}
{% unless post.categories contains "til" -%}[ {{ post.title }} ]({{ post.url }})  
{% endunless -%}
{% endfor -%}
{% include legacy_archives.html %}