// InformIT - Fix Titles
// version 0.1
// 2005-10-11
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
// select "InformIT  - Fix Titles", and click Uninstall.
//
// --------------------------------------------------------------------
// WHAT IT DOES:
// --------------------------------------------------------------------
//
// ==UserScript==
// @name           InformIT - Fix Titles
// @namespace      http://blog.monstuff.com/archives/cat_greasemonkey.html
// @description    Fix the title on InformIT articles
// @include        http://www.informit.com/articles/printerfriendly.asp?*
// ==/UserScript==


var xpath = "//h1";
var res = document.evaluate(xpath, document, null,
                           XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

if (res.snapshotLength >= 1) 
{
    document.title = "InformIT: " + res.snapshotItem(0).firstChild.nodeValue;;
} 