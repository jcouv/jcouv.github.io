---
published: false
title: Using MSBuild from Cygwin
---
I was happy to discover that MSBuild [works fine](https://generally.wordpress.com/2006/11/28/building-visual-studio-solutions-using-msbuild-in-cygwin/) from a Cygwin bash shell. But the solution shared by Mangesh needed a little refresh for Visual Studio 2015. 

Here's the [updated bash script](https://github.com/jcouv/dotfiles/blob/master/vs2015.bash).  
It sets a few environment variables and also an `msbuild` alias. 

Here's one way you can invoke it from your `.bash_profile`:  

    for DOTFILE in `find ~/.dotfiles/*.bash`; do
      [ -f "$DOTFILE" ] && source "$DOTFILE"
    done

With this I was able to build and run the tests on Roslyn. I'm using [Babun](http://babun.github.io/), a pre-customized variant of Cygwin.
