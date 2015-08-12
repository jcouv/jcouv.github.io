// WiredPrinterFriendlyRedirect
// version 0.2
// 2005-04-08
// updated 2005-12-28
// Copyright (c) 2005, Julien Couvreur
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
//
// To install, you need Greasemonkey: http://greasemonkey.mozdev.org/
// Then restart Firefox and revisit this script.
// Under Tools, there will be a new menu item to "Install User Script".
// Accept the default configuration and install.
//
// To uninstall, go to Tools/Manage User Scripts,
// select "Wired - Printer Friendly Redirect", and click Uninstall.
//
// --------------------------------------------------------------------
//
// WHAT IT DOES:
// --------------------------------------------------------------------
//
// ==UserScript==
// @name            Wired - Printer Friendly Redirect
// @namespace       http://blog.monstuff.com/archives/cat_greasemonkey.html
// @description     Redirects to the printer-friendly version of Wired pages when one is detected.
//
// @include         http://wired.com/*
// @include         http://*.wired.com/*

// ==/UserScript==

var div = document.getElementById("storyTools");
if (div) {
    var printerLink = div.getElementsByTagName("a")[0].href;
    if (printerLink) { document.location = printerLink; return; }
}
    
// add CSS on printer-friendly page: body { margin: 80px }
var addGlobalStyle = function(css) {
    var style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = css;
    document.getElementsByTagName('head')[0].appendChild(style);
};
        
if (document.location.pathname.match(/\/.*\//) != null) {
    addGlobalStyle("body { margin: 80px }");
}