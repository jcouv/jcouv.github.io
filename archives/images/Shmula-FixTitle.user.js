// ==UserScript==
// @name           Shmula: fix title
// @namespace      http://blog.monstuff.com/archives/cat_greasemonkey.html
// @description    Clean up the title on the Shmula blog
// @include        http://www.shmula.com/*
// ==/UserScript==

document.title = document.title.replace(/\u00BB/, ">");
document.title = document.title.replace(/: Business, Technology, and Stuff in Between/, "");
