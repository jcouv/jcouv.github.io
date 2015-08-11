// RealSimple - Printer Friendly Redirect
// version 0.1
// 2005-08-04
// Copyright (c) 2005, Julien Couvreur
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
// --------------------------------------------------------------------
//
// ==UserScript==
// @name            RealSimple - Printer Friendly Redirect
// @namespace       http://blog.monstuff.com/archives/cat_greasemonkey.html
// @description     Show the printer-friendly version of all articles on realsimple.com, even if you are not a registered user.
// @include         http://realsimple.com/*
// @include         http://www.realsimple.com/*
// ==/UserScript==


function addGlobalStyle(css) {
    style = document.createElement("style");
	style.type = "text/css";
    style.innerHTML = css;
    document.getElementsByTagName('head')[0].appendChild(style);
};

if (document.location.href.match(/\/print\//) != null) {        
    addGlobalStyle("body { margin: 80px }");
    return;
}

// don't do anything on the front page
if (document.location.href.match(/\/flash\//) != null) {
    return;
}

// don't do anything in the section pages
if (document.location.href.match(/\/channel\//) != null) {
    return;
}
if (document.location.href.match(/\/inside\//) != null) {
    return;
}
if (document.location.href.match(/\/browse\//) != null) {
    return;
}


var text = document.getElementsByTagName('body')[0].innerHTML;

// example html:
// <a href="javascript:popPrint('/realsimple/gallery/print/0,22304,1085812,00.html')" class="toolbox_tool">Print</a> 

// grab the href
var pattern = /<a href=\"([^\"]*)\".*>Print<\/a>/;
var matches = text.match(pattern);
if (matches == null) {
    GM_log("no match found for print href");
    return;
} else {
    GM_log("matched print href: " + matches[1]);
}

// grab the url
var pattern = /javascript:popPrint\('([^']*)'\)/;
var matches = matches[1].match(pattern);
if (matches == null) {
    GM_log("no match found for print url");
    return;
} else {
    GM_log("matched print url: " + matches[1]);
}

//alert("redirecting " + document.location.href + " to " + matches[1]);
document.location.href = "http://www.realsimple.com" + matches[1];

