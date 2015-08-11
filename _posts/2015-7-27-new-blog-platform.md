---
published: false
---

I came back from vacation with a few topics to blog about (in particular, I will start a series on the fundamentals of computing). Being an efficient procrastinator, I naturally decided this would involve moving away from MovableType first ;-)

What tool to use? I don't like set up or administering SQL instances. I appreciate flat files for content, static files for HTML output (easier to backup and migrate to new hosts) and the idea of managing my content in git/GitHub (versioning, access control, Markdown preview). Also, I want to keep continuity with my previous content. I looked at a few [flat-file blogging platforms](http://www.freshtechtips.com/2014/01/flat-file-blogging-software.html), but none quite fit the bill.

The solution I built yesterday is simple (every tool starts that way, doesn't it): read content in [Markdown](http://daringfireball.net/projects/markdown/syntax) files, read some metadata about the entry in a [YAML](http://www.yaml.org/spec/1.2/spec.html) file, and run those through [Liquid](http://liquidmarkup.org/) templates to generate the HTML and RSS output files. The editing of content and metadata can be done directly in GitHub. The publishing is done via SFTP.

The code (not counting HTML templates or CSS) stays short by leveraging libraries like MarkdownDeep, YamlDotNet, DotLiquid and System.Net.FtpClient. Dynamic site features such as commenting and searching are outsourced to Disqus and Google. I intend to refresh the design and stylesheets for the site, as they are dating, but that will come later. 

The code for the tool and content for this blog are hosted on this [GitHub repo](https://github.com/dumky/blog).

It is structured as follows:

    /content/
      index.yml (blog info, list of entries)
      *.md (body for each blog entry)
    /templates/
      index.liquid, entry.liquid, rss.liquid, archives.liquid
    /output/
      *.html
    /src/BlogBuilder/
      *.cs

## Update (2015/08/11): 
I found out that Jekyll is platform built on those same ideas (static files, liquid templates, yaml configuration) and it happens to be supported by GitHub Pages. I'll be switching over shortly.
