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
 
var wiki;
var WikiUI_version = 1;

function showLogs() {
    show("wikiLog", true);
}

function loadEntryIfReturn(e) {
    var event = e ? e : window.event;
    if (e.keyCode == 13) {
        loadClick();
    }
}

function wikiwordClick(e) {
    var link = window.event ? window.event.srcElement : e.target;
    UIHelper.loadEntry(link.firstChild.nodeValue);
    return false;
}

function clearWikiEntry() {
    $("entryTextarea").value = "";
    $("entryDiv").innerHTML = "";
    show("wikiEdit", false);  
    show("wikiView", false);
    showInline("browsing", true);
    show("syncing", false);
}

function displayWikiEntry(wikiword, entry, isNew) {
    show("wikiEdit", false);  

    // populate entryTextarea
    $("entryTextarea").value = entry;
    
    $("wikiIsNew").value = isNew ? "true" : "false";
    
    $("wikiTitle").innerHTML = wikiword;
    Formatter.wikify("entryDiv", entry);

    show("wikiView", true);
    show("wikiTitle", true);

    document.title = $("wikiword").value;
}

function wikiEditHandler() {
    show("information", false);
    show("wikiView", false);
    show("wikiEdit", true);
}

function show(id, visible) {
    try {
        $(id).style.display = (visible ? "block" : "none");
    } catch (e) { alert(id); }
}

function showInline(id, visible) {
    try {
        $(id).style.display = (visible ? "inline" : "none");
    } catch (e) { alert(id); }
}

function spin(visible) {
    if (visible) {
        show("wikiView", false);
        show("wikiEdit", false);
        show("information", false);
        show("wikiTitle", false);
    }
    
    showInline("wikiSpinner", visible);
}

function loadClick() {
    if (window.event) { window.event.cancelBubble = true; } 
    
    var wikiword = $("wikiword").value;  
    UIHelper.loadEntry(wikiword);
    return false;
}

function wikiSaveHandler() {
    var wikiword = $("wikiTitle").innerHTML;
    var entry = $("entryTextarea").value;
    var isNew = $("wikiIsNew").value == "true";
    UIHelper.saveEntry(wikiword, entry, isNew);
}

function wikiCancelHandler() {
    show("information", false);
    show("wikiView", true);
    show("wikiEdit", false);    
}

function checkOnlineStatus() {
    if (window.navigator.onLine) { 
        showInline("online", true);
        showInline("offline", false);
        UIHelper.updateOnlineStatus(true);
    } else {
        showInline("online", false);
        showInline("offline", true);
    }
}

function offlineIconInfo() {
    if (window.navigator.onLine) { 
        alert("Your browser is currently in Online mode. \nTo set your browser in Offline mode, select the 'File' -> 'Work Offline' menu.");
    } else {
        alert("Your browser is currently in Offline mode. \nTo set your browser in Online mode, un-select the 'File' -> 'Work Offline' menu.");
    }
}

/**************************************** UIHelper ***************************************************/

var UIHelper = new Object();
UIHelper.returnWikiword = "";

UIHelper.makePrompt = function(id, message, level) {
    // parameters following message should be callback() functions to be injected
    var callbackParameters = arguments;
    
    show(id, false);
    $(id).innerHTML = message; //"<div>" + message + "</div>"; // workaround for Fade.SlideUp
    $(id).className = level;
    
    attachCallbacks($(id));
    show(id, true);
    
    function attachCallbacks(node) {
        // look for nodes under the input node that have a callback property (callback="...")
        //  and instrument these with the corresponding callback method and set the hrefs
        
        for (var i = 0; i < node.childNodes.length; i++) {
            var child = node.childNodes[i];
            if (!child.getAttribute) { continue; }
            
            var callbackID = child.getAttribute("callback");
            
            if (callbackID && callbackID != "") {
                child.removeAttribute("callback");
                
                var callbackIndex = parseInt(callbackID) + 3;

                child.onclick = callbackParameters[callbackIndex]; // todo: this is probably leaking
                
                if (child.href == "") {
                    child.href = window.location.hash;
                }
            } else {
                attachCallbacks(child);
            }
            
            child = null;
            callbackID = null;
        }
    }
}

UIHelper.localdirtyPrompt = function(wikiword, localResponse) {
    show("wikiView", false);
    show("wikiEdit", false);

    UIHelper.makePrompt("information",
                    "This entry has local changes. Before opening it, you need to either: " +
                    "<ul><li><a callback='0'>Save your local changes to the server</a>.</li> "+
                    "<li><a callback='1'>Forget local changes</a>.</li> "+
                    "<li class='offlineSupported'>Or, if you are offline, set your browser to work Offline and <a callback='2'>continue working with local copy</a> for now.</li>",
                    "warning",
                    saveLocalChanges, revertLocalChanges, workOffline);

    function saveLocalChanges() {
        UIHelper.saveEntry(wikiword, localResponse.entry);
    }
    
    function revertLocalChanges() {
        spin(true);
        wiki.server.remoteLoad(wikiword, callback);

        function callback(remoteResponse) {
            spin(false);
            
            switch (remoteResponse.status) {
                case "failed":
                    UIHelper.makePrompt("information",
                            "Loading the entry from the server failed. You can: " +
                            "<ul><li><a callback='0'>Try to save your local changes to the server</a>.</li> "+
                            "<li><a callback='1'>Attempt the same operation again (forget local changes)</a>.</li> "+
                            "<li class='offlineSupported'>Or set your browser to work Offline and <a callback='2'>continue working with local copy</a> for now.</li>",
                            "error",
                            saveLocalChanges, revertLocalChanges, workOffline);
                    
                    UIHelper.updateOnlineStatus();
                    
                    break;
                case "loaded":
                    displayWikiEntry(wikiword, remoteResponse.entry);
                    UIHelper.makePrompt("information",
                            "Entry was loaded from the server", "info");
                    
                    UIHelper.updateOnlineStatus(true);
                    break;
                case "loadimpossible":
                    UIHelper.makePrompt("information",
                            "Entry could not be opened. Set your browser in Online mode to try again. (todo)", "error");
                    break;
            }
        }
    }
    
    function workOffline() {
        if (wiki.isOnline()) {
            UIHelper.makePrompt("information",
                    "The local copy was loaded. <br /> If you are not connected to the internet, you should set your browser in Offline mode.", "warning");
        } else {
            UIHelper.makePrompt("information",
                    "You are now working offline. The local copy of the entry was loaded.", "info");
        }
        
        displayWikiEntry(wikiword, localResponse.entry);
    }
}

UIHelper.remoteloadfailedPrompt = function(wikiword, localResponse) {
    UIHelper.makePrompt("information",
                    "This entry couldn't be loaded from the server. A local copy was used instead. <br />" +
                    "If you are not connected to the internet, you may want to set your browser in Offline mode.",
                    "error");
    // todo: add a "try again" option
    
    displayWikiEntry(wikiword, localResponse.entry);
}

UIHelper.offlineloadedPrompt = function(wikiword, localResponse) {
    UIHelper.makePrompt("information",
                    "This entry was loaded locally. " +
                        "If you are now connected to the internet, you may want to set your browser in Online mode and "+
                        "<a callback='0'>reload the entry</a>.", "info", workOnline); 
    
    displayWikiEntry(wikiword, localResponse.entry);

    function workOnline() {
        if (wiki.isOnline()) {
            show("wikiView", false);
            show("wikiEdit", false);
        
            // todo: save changes locally
            
            // try to smartLoad the entry
            UIHelper.loadEntry(wikiword);
        } else {
            UIHelper.makePrompt("information",
                    "You must first switch your browser to Online mode and xxx todo", "error");
        }
    }
}

UIHelper.offlinefailedPrompt = function(wikiword) {
    UIHelper.makePrompt("information",
                    "You're working offline and this entry doesn't exist locally. You can:" +
                        "<ul><li>Set your browser to work Online and <a callback='0'>load it from the server</a>.</li> "+
                        "<li><a callback='1'>Create this entry locally</a>.</li></ul>",
                        "warning",
                        workOnline, createLocalEntry);
 
    function workOnline() {
        if (wiki.isOnline()) {
            show("wikiView", false);
            show("wikiEdit", false);
        
            // todo: save changes locally
            
            // try to load the entry again
            UIHelper.loadEntry(wikiword);
        } else {
            UIHelper.makePrompt("information",
                    "You must first switch your browser to Online mode and xxx todo", "error");
        }
    }
    
    function createLocalEntry() {
        UIHelper.createNewEntry(wikiword);
        return false;
    }
}



UIHelper.loadfailedPrompt = function(wikiword) {
    // todo: improve this case: was the server down, or did the server say "I don't have it"?
    UIHelper.makePrompt("information",
                        "This entry couldn't be loaded from the server and doesn't exist locally. " +
                        "You can <a callback='0'>create it</a>.",
                        "error",
                        createEntry);
                        
    function createEntry() {
        UIHelper.createNewEntry(wikiword);  
        return false;        
    }
}


UIHelper.loadEntry = function(wikiword) {
    //alert("loadEntry");
    clearWikiEntry();
    
    wikiword = wikiword.replace(/^#/, "");
    $("wikiword").value = wikiword; 
    window.location.hash = wikiword;
    // dhtmlHistory.add(wikiword, wikiword);
          
    spin(true);
    wiki.smartLoad(wikiword, callback);
    
    function callback(response) {
        spin(false);
        UIHelper.updateOnlineStatus();
        
        wiki.trace(response.status + " " + response.entry + " " + response.version);
        $("log").value = wiki.getLog();
        
        // "offlinefailed", "offlineloaded", "remoteloaded", "remoteloadfailed", "loadfailed", "localdirty", "loadimpossible"
        switch (response.status) {
            case "offlinefailed": 
                UIHelper.offlinefailedPrompt(wikiword);
                break;
            case "remoteloadfailed":
                UIHelper.remoteloadfailedPrompt(wikiword, response);
                break;
            case "loadfailed":
                UIHelper.loadfailedPrompt(wikiword);
                break;
            case "localdirty":
                UIHelper.localdirtyPrompt(wikiword, response);
                break;
            case "remoteloaded":
                UIHelper.updateOnlineStatus(true);
                displayWikiEntry(wikiword, response.entry);
                break;
            case "offlineloaded":
                UIHelper.offlineloadedPrompt(wikiword, response);
                break;
            case "loadimpossible":
                UIHelper.makePrompt("information",
                        "Entry could not be opened. Set your browser in Online mode to try again. (todo)", "error");
                break;    
        }
    }
    
}

UIHelper.loadPermalink = function() {
    // if we have a wikiword in the url, load it
    var wikiword = window.location.hash.replace(/^#/, "");
    
    if (wikiword && wikiword != "") {
        UIHelper.loadEntry(wikiword);
    } else {
        $("wikiword").value = "Type a wikiword..."; 
        spin(false);
    }
}    


UIHelper.localsavedPrompt = function(wikiword, localResponse) {
    UIHelper.makePrompt("information",
                    "Entry was saved locally.", "info");
    displayWikiEntry(wikiword, localResponse.entry);
}

UIHelper.remotesavedPrompt = function(wikiword, localEntry, remoteResponse) {
    UIHelper.makePrompt("information",
                    "Entry was saved to the server", "info");
    
    var entry = remoteResponse.entry ? remoteResponse.entry : localEntry;
    displayWikiEntry(wikiword, entry);
}

UIHelper.savefailedPrompt = function(wikiword, entry, response) {
    UIHelper.makePrompt("information",
                    "Some critical error prevented the entry from being saved either locally or on the server. " +
                        "You can <a callback='0'>try again</a>.",
                        "error",
                        saveEntry);
                        
    function saveEntry() {
        UIHelper.saveEntry(wikiword, entry);
    }
}

UIHelper.remotesavefailedPrompt = function(wikiword, entry, response) {
    // todo: show the entry in view mode (not edit)
    
    UIHelper.makePrompt("information",
                    "The entry couldn't be saved on the server, but was successfully saved locally. " +
                        "You can <a callback='0'>try again</a><span class='offlineSupported'> or if you are offline, put your browser in Offline mode<span>.",
                        "error",
                        saveEntry);
                        
    function saveEntry() {
        UIHelper.saveEntry(wikiword, entry);
    }
}

UIHelper.saveEntry = function(wikiword, entry, isNew) {
    var obj = { entry: entry };
    if (isNew) { obj.version = -1; alert("new"); }
    
    spin(true);
    wiki.smartSave(wikiword, obj, callback);
    
    function callback(response) {
        spin(false);
        UIHelper.updateOnlineStatus();
        
        wiki.trace(response.status + " " + response.remoteentry + " " + response.remoteversion);
        $("log").value = wiki.getLog();
        
        // "localsaved", "remotesaved", "remoteconflict", "remotesavefailed", "savefailed", "saveimpossible"
        switch (response.status) {
            case "localsaved": 
                UIHelper.localsavedPrompt(wikiword, response);
                break;
            case "remotesaved":
                UIHelper.updateOnlineStatus(true);
                UIHelper.remotesavedPrompt(wikiword, entry, response);
                break;
            case "savefailed":
                UIHelper.savefailedPrompt(wikiword, entry, response);
                break;
            case "remotesavefailed":
                UIHelper.remotesavefailedPrompt(wikiword, entry, response);
                break;
            case "saveimpossible":
                UIHelper.makePrompt("information",
                        "Entry could not be saved. Set your browser in Online mode to try again. (todo)", "error");
                break;    
            default:
                showLogs();
                alert("todo exception");
        }
    }   
}

UIHelper.createNewEntry = function(wikiword) {
    //alert("creating new entry");
    // open this new entry locally with wikiIsNew flag (meaning version = -1)
    displayWikiEntry(wikiword, "", true);
    show("wikiView", false);
    show("wikiEdit", true);
    show("information", false);
    //alert("new entry displayed");
}

UIHelper.doSyncPrompt = function() {
    // todo: show the number of entries that need syncing

    UIHelper.makePrompt("onlineStatus",
                        "Do you want to <a callback='0' href='#'>sync</a>?",
                        "status", 
                        doSync);
    showInline("onlineStatus", true);
    
    function doSync() {
        UIHelper.doSync();
        return false;
    }
}

UIHelper.doSync = function() {
    UIHelper.returnWikiword = window.location.hash;
    window.location.hash = "#";
    document.title = "Syncing";

    showInline("browsing", false);
    show("syncStatus", false);
    show("syncing", true);
   
    // save all dirty entries, show progress, record the response, handle conflicts if needed
    UIHelper.doSyncSave()        
}

// returns true if all are saved (only clean or conflicting entries remain)
UIHelper.doSyncSave = function() {
    // list dirty entries
    var dirtyList = wiki.listDirty();
    if (dirtyList.length == 0) { return UIHelper.doSyncResolve(); }
    
    var dirtyIndex = 0; // how many where saved so far
    
    // build a table listing the entries and link it with dirtyList
    UIHelper.showDirtyList(dirtyList);
    saveDirtyList();

    // iterate over the dirtyEntries list and remoteSave them one by one
    function saveDirtyList() {
        // when we've gone through the whole list, show doSyncSaveStatus
        if (dirtyIndex >= dirtyList.length) { dirtyList = null; return UIHelper.doSyncSaveStatus(); }
        
        var dirtyEntry = dirtyList[dirtyIndex];
        var obj = { entry: dirtyEntry.entry, version: dirtyEntry.version };
        //alert("saving: " + dirtyEntry.wikiword + " JSON-formatted:" + JSON.stringify(obj));
        
        dirtyEntry.td.innerHTML = '<img src="spinner.gif" alt="Saving..."/> Saving...';
        
        wiki.server.remoteSave(dirtyEntry.wikiword, obj, callback);
    }
    
    function callback(remoteResponse) {
        // update the UI and storage to reflect the response
        var dirtyEntry = dirtyList[dirtyIndex];
        
        switch (remoteResponse.status) {
            case "saved":
                dirtyEntry.td.innerHTML = '<span class="info">Saved.</span>';
                break;
            default:
                // todo: present the UI better
                dirtyEntry.td.innerHTML = '<span class="error"> + remoteResponse.status + </span>';
                break;
        }
        
        // save the remaining entries
        dirtyIndex++;
        saveDirtyList();        
    }
}

UIHelper.doSyncSaveStatus = function() { 
    // if there were some save errors (some entries are still dirty): offer to retry (UIHelper.doSyncSave)
    var dirtyList = wiki.listDirty();
    if (dirtyList.length != 0) { 
        // syncStatus
        alert("some entries failed to save. Do syncSave again?"); 
        return; 
    }

    // if there were some conflicts, next step is UIHelper.doSyncResolve
    var resolveList = wiki.listNeedsResolve();
    if (resolveList.length != 0) { alert("some entries need to be resolved. Do it now?"); return; }

    // if all went fine, go back to normal activities and mark the store as clean
    return UIHelper.doSyncDone(); 
}

// todo: a templating system would be nice
UIHelper.showDirtyList = function(dirtyList) {
    var out = "<table class='syncTable'>";

    for (var i = 0; i < dirtyList.length; i++) {
        var dirtyEntry = dirtyList[i];
        out += "<tr><td>" + dirtyEntry.wikiword + "</td><td></td></tr>";
    }
    out += "</table>";
    
    $("syncList").innerHTML = out; 

    // browser the table, get the empty td nodes out and reference them in the dirtyList
    var rows = $("syncList").firstChild.firstChild.childNodes;
    for (var i = 0; i < dirtyList.length; i++) {
        var dirtyEntry = dirtyList[i];
        var td = rows[i].lastChild;
        dirtyEntry.td = td;
    }
    
    show("syncing", true);
    rows = null;
}

UIHelper.doSyncResolve = function() {
    var resolveList = wiki.listNeedsResolve();
    if (resolveList.length == 0) { return UIHelper.doSyncDone(); }
    
    alert("let's resolve some entries");
}

UIHelper.doSyncDone = function() {
    wiki.setGlobalDirty(false);

    UIHelper.makePrompt("syncStatus",
        "All your local changes have successfully been synchronized back to the server. <br />" +
        "<a callback='0' href='" + UIHelper.returnWikiword + "'>Go back to " + UIHelper.returnWikiword + "</a>.",
        "info",
        returnToLastWikiword);
        
    
    function returnToLastWikiword() {
        UIHelper.loadEntry(UIHelper.returnWikiword);
    }
}

UIHelper.updateOnlineStatus = function(isNowOnline) {
    if (!wiki.offlineSupported) {
        UIHelper.makePrompt("onlineStatus",
                "In order to use the offline capability you need Flash version 8. <a href='www.macromedia.com/go/getflashplayer'>Get Flash Player</a>. <br />If it's already installed, please reload the page or try installing a newer version.",
                "error");
        showInline("onlineStatus", true);
        return;
    } 
    
    if (!wiki.getGlobalDirty()) {
        // nothing to sync 
        show("onlineStatus", false);
        return; 
    }
    
    // we have stuff to sync 
    
    if (typeof(isNowOnline) != "undefined" && isNowOnline) {
        // we're clearly online
        UIHelper.doSyncPrompt();
        return;
    }
    
    // we're not clearly online
    show("onlineStatus", false);
}

/**************************************** Formatter ***************************************************/

var Formatter = new Object();

Formatter.wikify = function(id, entry) {
    var wikiHTML = entry;
    
    // convert linebreaks into BR elements
    wikiHTML = wikiHTML.replace(/\n/g, "<br/>");
    
    // linkify wikiwords
    wikiHTML = wikiHTML.replace(/([A-Z]+[a-z0-9]*(\.?[A-Z][a-z0-9]+)+)/g, "<a href='#$1' onclick='wikiwordClick(event)'>$1</a>"); 
    // todo: when offline, indicate which wikiword exist in the system
    
    
    // linkify external links
    wikiHTML = wikiHTML.replace(/\[\[(\S+)\s*([^\]]*)\]\]/g, "<a href='$1'>$2</a>*"); 
    
    $(id).innerHTML = wikiHTML;
}


/**************************************** Startup code ***************************************************/


FlashHelper.addLoadEvent(documentOnLoad);

function documentOnLoad() {
    //alert("Document window.onload");
    show("wikiLog", false);
    show("wikiEdit", false);  
    show("wikiView", false);
    show("syncing", false);
    show("onlineStatus", false);
    show("body", true);

    //dhtmlHistory.initialize();
    //dhtmlHistory.addListener(historyChange);
}


function historyChange() {
    alert("history changed");
}

FlashHelper.onload = function(fs) {
    //alert("wiki onload");
    if (fs) { fs.Debug(); }

    wiki = new Wiki(fs);
    checkOnlineStatus();

    setInterval(checkOnlineStatus, 1000);
    //showLogs();
    UIHelper.loadPermalink();
    
    checkVersion();
}

function checkVersion() {
    // todo: need to define an XHTML namespace to add "version" to link and script tags

    // Check the version in the CSS files compared to the version required in the head
    var links = window.document.getElementsByTagName("link");
    for (var i = 0; i < links.length; i++) {
        if (links[i].getAttribute("rel") == "stylesheet") {
            var requiredVersion = links[i].getAttribute("version");
            var href = links[i].href;
            var actualVersion = getStyleSheetVersionByHref(href);
            
            if (requiredVersion != actualVersion) {
                alert("version mismatch for stylesheet: " + href);
            }
        }
    }

    // Check the version in the JS files compared to the version required in the JS includes
    var scripts = window.document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
        var requiredVersion = scripts[i].getAttribute("version");
        var id = scripts[i].id;
        
        if (requiredVersion) {
            var actualVersion = window[id + "_version"];
            if (requiredVersion != actualVersion) {
                alert("version mismatch for script: " + id);
            }
        }
    }
    
    

    // todo: Check Flash object version
}

function getStyleSheetVersionByHref(href) {
    var sheets = window.document.styleSheets;
    for (var i = 0; i < sheets.length; i++) {
        if (sheets[i].href == href) {
            return getCSSVersion(i);
        }
    }
}

function getCSSVersion(sheetIndex) {
    var sheet = window.document.styleSheets[sheetIndex];
    for (var i = 0; i < sheet.cssRules.length; i++) {
        if (sheet.cssRules[i].selectorText == "version") {
            return eval(sheet.cssRules[i].style["content"]);
        } 
    }
}