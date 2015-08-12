---
layout: page
title: Archive
---

{% for post in site.posts -%}[ {{ post.title }} ]({{ post.url }})  
{% endfor -%}
{% include legacy_archives.html -%}