// ==UserScript==
// @name           Bob Cringley - Fix Titles
// @namespace      http://blog.monstuff.com/archives/cat_greasemonkey.html
// @description    Fix the title on Bob Cringley's "I, Cringley" blog
// @include        http://www.pbs.org/cringely/*
// ==/UserScript==

var xpath = "//div[@class='entrytitle']/p";
var res = document.evaluate(xpath, document, null,
                           XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

if (res.snapshotLength >= 1) 
{
    var newText = res.snapshotItem(0).textContent;
    document.title = "Cringley: " + newText;
} 
