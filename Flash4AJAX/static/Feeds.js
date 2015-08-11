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
 
function makeLinkID(linkText) {
    return hex_md5(linkText);
}
 

/**************************************** XMLParser ***************************************************/

var XMLParser = new Object();
XMLParser.parseFromString = function(str) {
    if (typeof DOMParser != "undefined") {
        var parser = new DOMParser();
        return parser.parseFromString(str, "application/xml");
    }
	
    if (typeof ActiveXObject != "undefined") {
        var d = new ActiveXObject("MSXML.DomDocument");
        d.loadXML(str);
        return d;
    } 
    
    if (typeof XMLHttpRequest != "undefined") {
        var req = new XMLHttpRequest();
        req.open("GET", "data:application/xml" +
                     ";charset=utf-8," + encodeURIComponent(str), false);
        if (req.overrideMimeType) {
            req.overrideMimeType("application/xml");
        }
        req.send(null);
        return req.responseXML;
    }
}

XMLParser.getText = function(node) {
    try {
        return node.firstChild.nodeValue;
    } catch (e) {
        alert(node.childNodes.length);
        return "";
    }
}

XMLParser.listNodes = function(parent, name, ns) {
    // deal with the difference between IE and FF when it comes to elements with a namespace
    if (!parent.getElementsByTagNameNS && ns) {
        return parent.getElementsByTagName(ns + ':' + name);
    } else {
        return parent.getElementsByTagName(name)
    }
}

// returns an array of channels
// each channel has a siteID and an array of entries
XMLParser.parseFeed = function(xmlStr) 
{
    var out = new Array();
    var dom = XMLParser.parseFromString(xmlStr);
    
    var channels = this.listNodes(dom, "channel");
    for (var i = 0; i < channels.length; i++) {   
        out.push(this.parseChannel(channels[i]));
    }
        
    //alert("parseFeed output: " + JSON.stringify(out));
    return out;
}


// returns a {siteID, entries} where entries is a list of {id, description, link}
XMLParser.parseChannel = function(channel)
{
    var array = new Array();
    var items = this.listNodes(channel, "item");

    var siteLink = this.getText(this.listNodes(channel, "link")[0]);
    var siteID = makeLinkID(siteLink);

    for (var i = 0; i < items.length; i++) {
        try {
            var item = items[i];
            
            var id = this.getText(this.listNodes(item, "itemid", "bloglines")[0]);
            var description = this.getText(this.listNodes(item, "description")[0]);
            var title = this.getText(this.listNodes(item, "title")[0]);
            
            try {
                var link = this.getText(this.listNodes(item, "link")[0]);
            } catch (e) {}
            
            //<guid isPermaLink="true">http://www.bloglines.com/about/news#94</guid>
            var guidNode = this.listNodes(item, "guid")[0];
            var guid = this.getText(guidNode);
            var guidIsPermalink = (guidNode.getAttribute("isPermaLink") == "true");
            if (guidIsPermalink) {
                link = guid;
            }

            var obj = { id: id, description: description, title: title, link: link };
            
            array.push(obj);
        } catch (e) {
            // alert("exception in parseChannel: " + e.message + " " + channel.toString());
        }
    }
    
    var out = { siteID: siteID, entries: array };
    return out;
}


// returns a tree of { t, subID, siteID, s: subTree }
XMLParser.parseSubscriptions = function(xmlStr)
{
    // parse the xmlStr into an XML DOM,  
    var dom = XMLParser.parseFromString(xmlStr);
    var topNode = this.listNodes(dom, "outline")[0];
    
    // build a tree structure, 
    var tree = recurseBuildTree(topNode);
    return tree;

    function recurseBuildTree(domNode) {
        try {
            var linkID = makeLinkID(domNode.getAttribute("htmlUrl"));
        } catch (e) { }
        
        var subID = domNode.getAttribute("BloglinesSubId");
        if (!subID) {
            subID = "0";
        }

        var treeNode = { t: domNode.getAttribute("title"), 
                        subID: subID };

        if (linkID) {
            treeNode.siteID = linkID;
        }

        var children = domNode.childNodes;
        var subList = new Array();
        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeType == 1) {
                subList.push(recurseBuildTree(children[i]));
            }
        }
        if (subList.length > 0) {
            treeNode.s = subList;
        }
        return treeNode;
    }
}   
        
/**************************************** Feeds ***************************************************/
function Feeds(flashStorage) {
    var FeedConst = "feed_";
    var FeedListConst = "feedList";
    var DescriptionConst = "description";
    var TitleConst = "title";
    var LinkConst = "link";
    var SubsTreeConst = "subsTree";
    var SubsListConst = "subsList";
    var LatestConst = "latest_";

    var self = this;
    var log = "";

    var fs = flashStorage; 

    this.offlineSupported = (fs != null); // if the Flash storage is running, we can support offline mode
    
    this.isOnline = function() { return !this.offlineSupported || window.navigator.onLine; }

    this.trace = function(txt) {
        log += "\r\n" + txt;
        // window.alert(txt); // un-comment for debugging
    }
    
    this.epoch = function() {
        var date = new Date();
        return date.getTime();
    }
    
    this.getLog = function() {
        return log;
    }
    this.clearLog = function() {
        log = "";
    }
    
    this.getSubsTree = function() {
        if (!this.offlineSupported) { return null; }
        
        var json = this.getValue(SubsTreeConst, SubsTreeConst, null);
        var tree = eval('(' + json + ')');
        return tree;
    }
    
    // returns true, false or "pending"
    this.setSubsTree = function(tree) {
        // tree structure: {t: title, subID: subID, siteID: siteID, s: [optional ordered list of sub-nodes]}
            
        if (!this.isOnline()) { return null; }

        var json = JSON.stringify(tree);
        //alert("setSubsTree " + json);

        this.setValue(SubsTreeConst, SubsTreeConst, null, json);
        return fs.flush(SubsTreeConst);
    }

    this.refreshSubs = function(callback) {
    alert("resfreshSubs");
        var obj;
        if (!this.isOnline()) { 
            obj = { status: "offline" }; 
            return callback(obj); 
        }
        
        var listsubsUrl  = "http://rpc.bloglines.com/listsubs";
        var callbackName = CallbackManager.registerCallback(saveAndCallback);
        
        fs.XmlGet(listsubsUrl, callbackName);

        function saveAndCallback() {
            var flashXml = fs.GetVariable("retXml");
            
            var startTime = self.epoch();
            self.trace("refreshSubs saveAndCallback starts (XmlGet calls back): " + startTime);

            if (!flashXml || flashXml == "") { callback(); }

            //alert("refreshSubs saveAndCallback: " + obj.str.length);
            var xml = flashXml;
            
            
            var tree = XMLParser.parseSubscriptions(xml);
            //alert("refreshSubs saveAndCallback " + JSON.stringify(tree));

            // save it locally
            self.setSubsTree(tree);
            self.saveSubsList(tree);

            // todo: update the subsList with any new feed
            // todo: list orphan feeds by comparing the list from the tree to that from listFeeds()

            self.trace("refreshSubs saveAndCallback ends: " + (self.epoch() - startTime));

            var obj = { status: "loaded", tree: tree };
            callback(obj);
        }
    }

    this.saveSubsList = function(tree) {
        var title = tree.t;
        var siteID = tree.siteID;  

        if (typeof(tree.s) == "undefined") {
            this.addFeed(siteID, title);
        } else {
            // this is a folder

            for (var i = 0; i < tree.s.length; i++) {
                this.saveSubsList(tree.s[i]);
            }
        }
    }

    this.localGetEntry = function(siteID, entryID) {
        if (!this.offlineSupported) return;
        
        var feedCat = FeedConst + siteID;

        var description = self.getValue(feedCat, DescriptionConst, entryID);
        var title = self.getValue(feedCat, TitleConst, entryID);
        var link = self.getValue(feedCat, LinkConst, entryID);

        var obj = { id: entryID, description: description, title: title, link: link };
        
        return obj;
    }
    
    this.localSaveEntry = function(siteID, entryID, obj) {
        // todo: add support for "pending" status returned from the storage
        if (!this.offlineSupported) return;
        
        var feedCat = FeedConst + siteID;
        
        this.setValue(feedCat, entryID, null, "");
        
        for(var name in obj) {
            if (name != "id") {
                this.setValue(feedCat, name, entryID, obj[name]);
            }
        }
    }
    
    this.localSaveLatest = function (siteID, entries) {
        if (!this.offlineSupported) return;
        
        if (entries.length > 0) {
            // todo: delete all previous entries in latestCat
            
            var latestCat = LatestConst + siteID;
            var entryIDs = new Array();
            for (var i = 0; i < entries.length; i++) {
                this.setValue(latestCat, entries[i].id, null, "");
            }
        }
    }
    
    this.getLatest = function(siteID) {
        var latestCat = LatestConst + siteID;
        var latestEntryIds = fs.list(latestCat);

        return latestEntryIds;
    }
    
    
    this.localGetFeed = function(siteID, filter) {
        //alert(siteID);
        // list and return entries under feed_<siteID>
        var feedCat = FeedConst + siteID;

        var entryIds = fs.list(feedCat);
        //alert("entries in this feed: " + JSON.stringify(entryIds));
        var out = new Array();
        for (var i = 0; i < entryIds.length; i++) {
            var obj = this.localGetEntry(siteID, entryIds[i]);
            
            // todo: apply filter
            
            out.push(obj);
        }
        
        return out;
    }
    
    // return an array of channels: { siteID, entries }
    this.localGetFeeds = function(siteIDs, filter) {
        var out = new Array();
        
        for (var i = 0; i < siteIDs.length; i++) {
            var siteID = siteIDs[i];
            var entries = this.localGetFeed(siteID, filter);
            
            var channel = { siteID: siteID, entries: entries };
            out.push(channel);
            
            // todo: add an upper-cap to the number of entries that can be returned (paging?)
        }
        
        return out;
    }
    
    // returns true, false or "pending"
    this.localFlushFeed = function(siteID) {
        var feedCat = FeedConst + siteID;

        return fs.flush(feedCat);
    }
    
    this.localSaveFeed = function (feed, markRecent) {
        if (!this.offlineSupported) return;
        
        // todo: save a list of the recently downloaded entries in each channel
        
        for (var i = 0; i < feed.length; i++) {
            var siteID = feed[i].siteID;
            var entries = feed[i].entries;
                        
            for (var j = 0; j < entries.length; j++) {
                this.localSaveEntry(siteID, entries[j].id, entries[j]);
            }
            
            this.localSaveLatest(siteID, entries);
            this.localFlushFeed(siteID); // todo: handle "pending"
        }
    }
    
    // add a feed information to the feedList
    this.addFeed = function (siteID, title) {
        this.setValue(FeedListConst, siteID, null, "");
        // todo: if obj is set, save it too. It may contain a title, lastRefreshed
        
        this.setValue(FeedListConst, TitleConst, siteID, title);
        return fs.flush(FeedListConst);
    }
    
    this.listFeeds = function() {
        return fs.list(FeedListConst);
    }

    this.getFeedTitle = function(siteID) {
        return this.getValue(FeedListConst, TitleConst, siteID);
    }
    
    this.localClearOldEntries = function(siteID) {
        // todo
        
    }
    
    this.startEpoch = function(hours) {
        var now = new Date();
        var milli = hours * 3600 * 1000;
        
        return Math.round((now.getTime() - milli) / 1000);
    }
    
    this.remoteGetFeed = function(subID, hours, callback) {
        var obj;
        if (!this.isOnline()) { 
            obj = { status: "offline" }; 
            return callback(obj); 
        }
        

        var getItemsUrl = "http://rpc.bloglines.com/getitems?s=" + subID + "&n=1";
        
        if (hours != null) {
            // compute epoch for the date "hours" hours ago
            var epoch = this.startEpoch(hours);
            
            getItemsUrl += "&d=" + epoch;
        }
        
        var callbackName = CallbackManager.registerCallback(saveAndCallback);
        
        
        fs.XmlGet(getItemsUrl, callbackName);

        function saveAndCallback() {
            var flashXml = fs.GetVariable("retXml");
            fs.log("got retXml out");
            
            var startTime = self.epoch();
            self.trace("remoteGetFeed saveAndCallback starts (XmlGet calls back): " + startTime);

            //alert("remoteGetFeed saveAndCallback string: " + flashXml.length);

            if (!flashXml || flashXml == "" || flashXml == "null") { callback(); }

            self.trace("remoteGetFeed saveAndCallback before unescape : " + (self.epoch() - startTime));

            var xml = flashXml;
            self.trace("remoteGetFeed saveAndCallback after unescape : " + (self.epoch() - startTime));

            // build a tree structure, 
            var feed = XMLParser.parseFeed(xml);
            //alert("remoteGetFeed saveAndCallback JSON:" + JSON.stringify(feed));

            // save it locally (only "mark recent" if not pre-loading)
            var markRecent = (typeof(hours) == "undefined");
            self.localSaveFeed(feed, markRecent);

            // todo: update subsList with lastRefreshed timestamps

            self.trace("remoteGetFeed saveAndCallback ends : " + (self.epoch() - startTime));

            var obj = { status: "loaded", feed: feed };
            callback(obj);
        }
    }
    
    
    this.smartGetFeed = function(subID, siteIDs, hours, callback) {
        var obj;
        
        if (this.isOnline()) {
            this.remoteGetFeed(subID, hours, checkStatusAndCallback);
        } else {
            var feedData = this.localGetFeeds(siteIDs, null); 
            obj = { status: "offline", feed: feedData };
            return callback(obj);
        }
    
        function checkStatusAndCallback(response) {
            // check status
            //alert("smartGetFeed checkStatusAndCallback " + JSON.stringify(response));
            //var feedData = self.localGetFeeds(siteIDs, filter); 
            
            // todo: bug: response may not have a feed property
            obj = { status: "loaded", feed: response.feed };
            return callback(obj);
        }
    }
    
    
    this.subkey = function (name, subname) { return "_" + name + "_" + subname; }

    this.setValue = function(cat, name, subname, value) {
        if (typeof(value) == "string") {
            value = escape(value);
        }
        if (subname != null) {
            name = this.subkey(name, subname);
        }
        return fs.setValue(cat, name, value);
    }
    
    this.getValue = function(cat, name, subname) {
        if (subname != null) {
            name = this.subkey(name, subname);
        }
        
        var value = fs.getValue(cat, name);
        
        if (typeof(value) == "string") {
            value = unescape(value);
        }
        return value;
    }
    
    this.dump = function() {
        // todo: improve
        var out = "";
        out += this.getValue(SubsTreeConst, SubsTreeConst, null) + "\r\n";
        
        var feedList = this.listFeeds();
        
        out += "Feed list (count): " + feedList.length + "\r\n";
        
        for (var i = 0; i < feedList.length; i++) {
            var latest = this.getLatest(feedList[i]);
            if (latest.length > 0) {
                out += "Latest for feed: " + feedList[i] + " is: " + latest + "\r\n";
            }
        }
        
        return out;
    }
}
