// XmlHttpRequest - Add Latency
// version 0.1
// 2005-09-21 (last updated 2005-01-12)
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
// After installing it, go to "Manage User Scripts" (under Tools) and
// configure the sites you want to have this script run on.
//
// To uninstall, go to Tools/Manage User Scripts,
// select "XmlHttpRequest - Add Latency", and click Uninstall.
//
// --------------------------------------------------------------------
//
// WHAT IT DOES:
// Simulates the effect of WAN latency by adding a delay to 
//  XmlHttpRequest calls to the server.
//
// --------------------------------------------------------------------
//
// ==UserScript==
// @name            XmlHttpRequest - Add Latency
// @namespace       http://blog.monstuff.com
// @description     Add a delay to XmlHttpRequest calls to the server (to simulate WAN latency)
//
// @include         http://select.some.domains/*
// ==/UserScript==

// todo:
// - make the delay configurable (via menu)

// update (2005-01-12):
// Fixed to run in Firefox 1.5 with Greasemonkey 0.6.4. Older versions are not supported anymore.

function injectMe() {
/*============================================================================*/  
var delay = 2000; // number of milliseconds


// backup original "send" function reference
XMLHttpRequest.prototype.oldSend = XMLHttpRequest.prototype.send;

// replace the "send" function with a delayed send
var newSend = function(a) {
    var xhr = this;
    
    window.setTimeout(function() { xhr.oldSend(a); }, delay);
}
XMLHttpRequest.prototype.send = newSend;
/*============================================================================*/  
}
unsafeWindow.eval(injectMe.toString());
unsafeWindow.eval("injectMe();");