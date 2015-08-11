// ==UserScript==
// @name           Bloglines - Open Links In New Tab
// @namespace      http://blog.monstuff.com/archives/cat_greasemonkey.html
// @description    Makes all entry/post links on Bloglines open in a new tab
// @include        http://www.bloglines.com/myblogs_display?*
// @include        http://bloglines.com/myblogs_display?*
// @include        http://www.bloglines.com/info/*
// @include        http://bloglines.com/info/*
// ==/UserScript==


if (!GM_openInTab) {
    alert("The 'Bloglines - Open Links In New Tab' requires a newer version of Greasemonkey to run");
}

// add a symbol into the toolbar to show this script is active
function MarkToolBar() {
    var iconData = "data:image/gif,GIF89a%10%00%10%00%91%00%00%FF%FF%FF%00%00%CC%FF%FF%FF%00%00%00!%F9%04%01%00%00%02%00%2C%00%00%00%00%10%00%10%00%00%023%94%1D%A9%7B%B8%9FZ%02%B4%D2x%26x%3B%C8p-%9D%C0%85%13%A4qb%D7%81%A7%12%B2%D6%AAY%26%D8%A2k%0E%91%B8%8D%C9%FCf%9E%8F%AEh%EC5%04%05%00%3B";
    //var iconData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8%2F9hAAAALHRFWHRDcmVhdGlvbiBUaW1lAFdlZCAyNSBBdWcgMjAwNCAxMzoxMzo1MyAtMDYwMAxWF1cAAAAHdElNRQfUCBkSDxTa%2BhjhAAAACXBIWXMAAAsSAAALEgHS3X78AAAABGdBTUEAALGPC%2FxhBQAAAFxJREFUeNpjYKAQMGITnMnA8J8YzelA%2FUyUuoCFkA2EXEgdFzQ0NKD6uaGBAZs4kI%2FhIuqGAcwGmB9hfAwX0swF6AAe2tAwwZY%2BaOMC9PiHhQFdYoGoPEBVF1AMABE5HddSGZY7AAAAAElFTkSuQmCC";

    var icon = document.createElement("img");
    icon.src = iconData;
    icon.title = "All post links open into new tabs";


    var xpath = "//div[contains(@class, 'logbar')]/table/tbody/tr/td";
    var res = document.evaluate(xpath, document, null,
                           XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

    for (var i = 0; i < res.snapshotLength; i++) {
        var td = res.snapshotItem(i);
        td.insertBefore(icon, td.firstChild);
    }
    
}

function InstrumentLink(link) {
    link.addEventListener("click", 
		function(event) {
                    GM_openInTab(link.href);
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                },
                true);
}

var xpath = "//h3/a";
var res = document.evaluate(xpath, document, null,
                           XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

for (var i = 0; i < res.snapshotLength; i++) {
    InstrumentLink(res.snapshotItem(i));
}

MarkToolBar();