/*
 * Copyright (C) 2005, Julien Couvreur, julien.couvreur (at) gmail.com
 * http://blog.monstuff.com
 * 
 * TiwyFeeds is a Bloglines feed reader with offline support.
 * TiwyWiki is a wiki with offline support.
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA
 */
 
// for debugging purpose
var feeds;

function RefreshNav() {
    feeds.refreshSubs(callback);
    
    function callback(obj) {
        //alert(obj.status);
        var div = buildTreeDiv(obj.tree);
        // todo: display div
        $("subsTree").innerHTML = "";
        $("subsTree").appendChild(div);
    }
}

function goToTop() {
    $(nav).scrollIntoView(true); 
}

function listsiteIDs(tree, list) {
    if (typeof(tree.s) == "undefined") {
        // this is a leaf
        list.push(tree.siteID);
    } else {
        // this is a folder
        for (var i = 0; i < tree.s.length; i++) {
            listsiteIDs(tree.s[i], list);
        }
    }
}

function buildTreeDiv(tree) {
    var ul = document.createElement("ul");
    ul.appendChild(listSubTree(tree));
    return ul;
    
    
    
    function listSubTree(tree) {
        var textNode = document.createTextNode(tree.t);

        var siteIDs = new Array(); // link IDs
        listsiteIDs(tree, siteIDs);
        
        var a = document.createElement("a");
        a.appendChild(textNode);
        a.href="#"
        a.onclick = function() {
            DisplayContent(tree.subID, siteIDs);
            return false;
        }
        
        var li = document.createElement("li");
        li.appendChild(a);
        
        if (typeof(tree.s) == "undefined") {
            // this is a leaf
            return li;
        } else {
            // this is a folder

            var listEl = document.createElement("ul");
            listEl.className = "subDir";

            li.appendChild(listEl);
            
            for (var i = 0; i < tree.s.length; i++) {
                listEl.appendChild(listSubTree(tree.s[i]));
            }
        
            return li;
        }
    }

}


    
function DisplayNav() {
    var tree = feeds.getSubsTree();
    var div = buildTreeDiv(tree);
    // todo: display div
    $("subsTree").innerHTML = "";
    $("subsTree").appendChild(div);
}

function DisplayContent(subID, siteIDs) {
    $("view").innerHTML = "";
    // todo: spinner

    //alert("displaying subID: " + subID + " and siteIDs: " + JSON.stringify(siteIDs));
    feeds.smartGetFeed(subID, siteIDs, null, callback);
    
    function callback(obj) {
        //alert("DisplayContent callback: " + JSON.stringify(obj));
        
        var viewDiv = $("view");
        viewDiv.innerHTML = "";
        viewDiv.appendChild(buildChannelsDiv(obj.feed));
    }
}

function LoadAll(subID, siteIDs, hours) {
    $("view").innerHTML = "";
    // todo: spinner

    //alert("displaying subID: " + subID + " and siteIDs: " + JSON.stringify(siteIDs));
    feeds.smartGetFeed(subID, siteIDs, hours, callback);
    
    function callback(obj) {
        //alert("DisplayContent callback: " + JSON.stringify(obj));
        
        var channels = obj.feed;
        var entryCount = 0;
        for (var i = 0; i < channels.length; i++) {
             entryCount += channels[i].entries.length;
        }
        alert("pre-loaded " + entryCount + " entries");
    }
}


function buildChannelsDiv(channels) {
    var containerDiv = document.createElement("div");
    containerDiv.className = "viewDiv";

    for (var i = 0; i < channels.length; i++) {
        var channel = channels[i];
        
        if (channel.entries.length) {
            var h1 = document.createElement("h1");
            h1.innerHTML = feeds.getFeedTitle(channel.siteID);
            
            containerDiv.appendChild(h1);
            containerDiv.appendChild(buildFeedDiv(channel.entries));
        }
    }
    
    return containerDiv;
}

function buildFeedDiv(feed) {
    var containerDiv = document.createElement("div");
    
    for (var i = 0; i < feed.length; i++) {
        var h2 = document.createElement("h2");
        h2.innerHTML = '<a href="' + feed[i].link +'">' + feed[i].title + '</a>';
        
        var div = document.createElement("div");
        div.innerHTML = feed[i].description;
        
        containerDiv.appendChild(h2);
        containerDiv.appendChild(div);
    }
    
    return containerDiv;
}

/**************************************** Startup code ***************************************************/


FlashHelper.addLoadEvent(documentOnLoad);

function documentOnLoad() {
    //alert("Document window.onload");

}


FlashHelper.onload = function(fs) {
    //alert("feeds onload:" + fs);
    if (fs) { fs.Debug(); }

    feeds = new Feeds(fs);
    DisplayNav();
}


/*

<?xml version="1.0" encoding="utf-8"?>
<opml version="1.0">
<head>
    <title>Bloglines Subscriptions</title>
    <dateCreated>Mon, 19 Dec 2005 19:25:30 GMT</dateCreated>
    <ownerName>dumky@ifrance.com</ownerName>
</head>
<body>
  <outline title="Subscriptions">
    <outline title="Peer Pressure" htmlUrl="http://www.allpeers.com/blog" type="rss" xmlUrl="http://www.allpeers.com/blog/wp-rss2.php"  BloglinesSubId="9122079"  BloglinesUnread="3" BloglinesIgnore="0" />

    <outline title="Greaseblog" htmlUrl="http://greaseblog.blogspot.com" type="rss" xmlUrl="http://greaseblog.blogspot.com/atom.xml"  BloglinesSubId="8974106"  BloglinesUnread="0" BloglinesIgnore="0" />
    <outline title="General/Computer" BloglinesSubId="20765615" BloglinesIgnore="0">
        <outline title="Boing Boing" htmlUrl="http://www.boingboing.net/" type="rss" xmlUrl="http://boingboing.net/rss.xml"  BloglinesSubId="1981012"  BloglinesUnread="12" BloglinesIgnore="0" />
        <outline title="Slashdot:" htmlUrl="http://slashdot.org/" type="rss" xmlUrl="http://rss.slashdot.org/slashdot/eqWf"  BloglinesSubId="15039793"  BloglinesUnread="2" BloglinesIgnore="0" />
        <outline title="PVRblog" htmlUrl="http://www.pvrblog.com/pvr/" type="rss" xmlUrl="http://www.pvrblog.com/pvr/index.rdf"  BloglinesSubId="438168"  BloglinesUnread="0" BloglinesIgnore="0" />
        <outline title="Wired News" htmlUrl="http://www.wired.com/" type="rss" xmlUrl="http://www.wired.com/news_drop/netcenter/netcenter.rdf"  BloglinesSubId="232206"  BloglinesUnread="0" BloglinesIgnore="0" />
    </outline>
    
<?xml version="1.0"?>
<rss version="2.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:bloglines="http://www.bloglines.com/services/module"
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
                                                                                
  <channel>
    <title>Feed Title</title>
    <link>http://www.feed.example/</link>
    <description>The description of the feed</description>
                                                                                
    <language>en-us</language>
    <webMaster>support@bloglines.com</webMaster>
    <bloglines:siteid>66</bloglines:siteid>
                                                                                
    <item>
        <title>An entry title</title>
        <dc:creator>John</dc:creator>
        <guid isPermaLink="true">http://feed.example/2004/09/27/1.html</guid>
        <link>http://feed.example/2004/09/27/1.html</link>
        <description><![CDATA[Here is the entry text.]]></description>
        <pubDate>Mon, 27 Sep 2004 8:04:17 GMT</pubDate>
        <bloglines:itemid>12</bloglines:itemid>
    </item>
    </channel>
</rss>

*/