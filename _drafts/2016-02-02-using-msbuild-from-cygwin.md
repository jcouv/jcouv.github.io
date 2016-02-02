---
published: false
title: Using MSBuild from Cygwin
---
I was happy to see that MSBuild works fine from a Cygwin bash shell.
https://generally.wordpress.com/2006/11/28/building-visual-studio-solutions-using-msbuild-in-cygwin/

But this needs a little refresh for Visual Studio 2015. 

https://github.com/jcouv/dotfiles/blob/master/vs2015.bash

It sets a few environment variables and also an 'msbuild' alias. With this I was able to build and run the tests on Roslyn. I'm using [Babun](http://babun.github.io/), a pre-customized variant of Cygwin.

I'm including it into my .bash_profile with
for DOTFILE in `find ~/.dotfiles/*.bash`; do
  [ -f "$DOTFILE" ] && source "$DOTFILE"
done
