---
published: false
---

## A New Post

.git

objects/
refs/
HEAD
config
description
hooks/
info/


## objects folder
<SHA-1 named files>
pack and index files

Types of objects
blob (contents of a file)
tree (list of filenames with SHA-1 references, object type and mode, where mode is normal, executable or symbolic link) 
commit (reference to toplevel tree, author information and commit message)
annotate tag

Each object type has a specific serialization to file. For instance a blob is "blob <space> <content length> \0 <content>".

## references folder 
refs/heads
refs/tags
refs/remotes

heads contains files named after branches. Each contains the SHA-1 reference of a commit object.
`tags`contains files named after tags. Each typically contains the SHA-1 reference of a commit object (for simple tags), but it can reference any git object (such as an annotated tag object, or a blob object). 
.git/HEAD contains the pathname to a head file (for instance `refs/heads/master`).






