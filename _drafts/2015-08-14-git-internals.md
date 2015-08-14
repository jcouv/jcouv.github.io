---
published: false
---

## A New Post

.git

    objects
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
* blob (contents of a file)
* tree (list of filenames with SHA-1 references, object type and mode, where mode is normal, executable or symbolic link) 
* commit (reference to toplevel tree, author information and commit message)
* annotated tag

Each object type has a specific serialization to file. For instance a blob is "blob <space> <content length> \0 <content>".

As you commit multiple versions of a file, the object folder grows and contains a lot of duplication. A git command allows to pack the object. This creates an index file and a pack data file.
The index is a list of SHA-1 object identifiers that got packed, and some information for finding the object in the pack data file. Because the data can be stored in different ways in the data file (either a snapshot or a delta), there are two types of index rows.
Simple or snapshot index entries have an identifier, object type, object size, and offsets.
Delta index entries have an identifier, object type, some offsets and the SHA-1 identifier of the baseline object.
When git packs the objects, it decides which objects to keep as snapshot and which to keep as delta.



## references folder 
    refs/heads
    refs/tags
    refs/remotes

heads contains files named after branches. Each contains the SHA-1 reference of a commit object.
`tags`contains files named after tags. Each typically contains the SHA-1 reference of a commit object (for simple tags), but it can reference any git object (such as an annotated tag object, or a blob object). 
.git/HEAD contains the pathname to a head file (for instance `refs/heads/master`).






