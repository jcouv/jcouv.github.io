---
published: true
title: A copy-on-write git worktree skill
categories: [til]
permalink: /til/git-cow-worktree.html
comments: False
---

Git worktrees share their `.git` objects but each gets a full copy of the
working tree, which could be large (including build artifacts). On a copy-on-write
filesystem you can reduce that cost too.

I built a [`git-cow-worktree` agent skill](https://github.com/jcouv/dotfiles/tree/main/copilot/skills/git-cow-worktree) including a file-based C# app for this.

CoW support is per-filesystem: Windows ReFS/Dev Drive (not NTFS), Linux
Btrfs/XFS/ZFS (not ext4), macOS APFS.

The approach is adapted from this [blog post](https://commaok.xyz/post/git-cow-worktrees/).
See also Microsoft's [Dev Drive and copy-on-write](https://devblogs.microsoft.com/engineering-at-microsoft/dev-drive-and-copy-on-write-for-developer-performance/)
write-up.
