// ==UserScript==
// @name           Dare Obasanjo - Fix Title
// @namespace      http://blog.monstuff.com/archives/cat_greasemonkey.html
// @description    Remove the 'aka Carnage4Life' from the title
// @include        http://25hoursaday.com/*
// @include        http://*.25hoursaday.com/*
// ==/UserScript==

document.title = document.title.replace(/aka Carnage4Life /, "");


