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

Wiki_version = 1;

/**************************************** Wiki ***************************************************/
function Wiki(flashStorage) {
    var WikiConst = "wiki_";
    var WikiListConst = "wikiList";
    var EntryConst = "entry";
    var DirtyConst = "dirty";
    var VersionConst = "version";
    var RemoteVersionConst = "remoteversion";
    var MergedEntryConst = "mergedentry";
    var OldConst = "old";
    
    var self = this;
    var log = "";
    this.server = new PHPServer(this);
    
    var fs = flashStorage; 
    this.offlineSupported = (fs != null); // if the Flash storage is running, we can support offline mode
    
    this.isOnline = function() { return !this.offlineSupported || window.navigator.onLine; }
    
    this.trace = function(txt) {
        log += "\r" + txt;
        // window.alert(txt); // un-comment for debugging
    }
    
    this.getLog = function() {
        return log;
    }
    this.clearLog = function() {
        log = "";
    }
    
    this.addWikiword = function (wikiword) {
        this.setValue(WikiListConst, wikiword, null, "x");
        fs.flush(WikiListConst);
    }
    
    this.listWikiwords = function() {
        return fs.list(WikiListConst);
    }
    
    this.localSave = function (wikiword, obj) {
        // todo: add support for "pending" status returned from the storage
        if (!this.offlineSupported) return;
        
        self.trace("saving locally: " + wikiword  + " value (JSON-formatted): " + wikiword + JSON.stringify(obj));
        this.addWikiword(wikiword);
        
        var wikiCat = WikiConst + wikiword;
        
        for(var col in obj) {
            this.setValue(wikiCat, col, null, obj[col]);
        }

        var flushRet = fs.flush(wikiCat);
        self.trace("flush returned " + flushRet);
    }
    
    this.localLoad = function (wikiword) {
        if (!this.offlineSupported) return;

        var wikiCat = WikiConst + wikiword;

        self.trace("loading locally");
        var exists = this.getValue(WikiListConst, wikiword, null);
        //alert("exists " + exists);
        if  (typeof(exists) == "undefined") { return null; }
        //alert("exists passed");
        var entry = this.getValue(wikiCat, EntryConst, null);
        if (!entry) { entry = ""; } 
        
        var dirty = this.getValue(wikiCat, DirtyConst, null);
        var version = this.getValue(wikiCat, VersionConst, null);
        
        var ret = { entry: entry, dirty: dirty, version: version };

        var remoteversion = this.getValue(wikiCat, RemoteVersionConst, null);
        var mergedentry = this.getValue(wikiCat, MergedEntryConst, null);
        if (remoteversion != "")  {
            ret.remoteversion = remoteversion;
            ret.mergedentry = mergedentry;
        } 
        
        var old = this.getValue(wikiCat, OldConst, null);
        if (old != "")  {
            ret.old = old;
        }
        
        return ret;
    }
       

    this.remoteLoadAll = function (callback) {
        // todo
    }
    
    this.smartLoad = function (wikiword, callback) {
        var response;

        var localentry = this.localLoad(wikiword);
        
        if (!this.isOnline()) {
            if (localentry) {
                response = { status: "offlineloaded", entry: localentry.entry }; 
            } else {
                response = { status: "offlinefailed" }; 
            }
            
            callback(response);
            return;
        }
        
        if (!localentry || !localentry.dirty) {
            this.server.remoteLoad(wikiword, checkStatusAndCallback);
        } else {
            // todo: the case where the localentry doesn't have a version
            //      means this may be a entry that was create offline
            
            response = { status: "localdirty", entry: localentry.entry};
            callback(response);
        }
        
        function checkStatusAndCallback(remoteResponse) {
            self.trace("smartLoad.checkStatusAndCallback: response (JSON-formatted): " + JSON.stringify(remoteResponse));
            
            switch (remoteResponse.status) {
                case "loaded":
                    response = { status: "remoteloaded", entry: remoteResponse.entry };
                    break;
                    
                case "loadfailed":
                    if (localentry) {
                        // if we have a local copy, return it
                        response = { status: "remoteloadfailed", entry: localentry.entry }; 
                    } else {
                        response = { status: "loadfailed" };
                    }
                    break;
                    
                case "loadimpossible":
                    response = { status: "loadimpossible" };
                    break;
                    
                default:
                    self.trace("smartLoad.checkStatusAndCallback exception");
                    response = { status: "exception" };
                    break;
            }
            callback(response);
        }
                
    }
    
    this.smartSave = function(wikiword, input, callback) {
        var response = { status: "savefailed" };
        
        // save entry locally, marked as dirty
        var localObj = { entry: input.entry, dirty: true };
        if (typeof(input.version) != "undefined") { localObj.version = input.version; }
        
        this.localSave(wikiword, localObj);
        
        response = { status: "localsaved", entry: input.entry };
        
        // if online mode, or we don't support offline, then remoteSave
        if (this.isOnline()) {
            this.server.remoteSave(wikiword, input, checkStatusAndCallback);
        } else {
            this.setGlobalDirty(true);
        
            callback(response);
        }
        
        function checkStatusAndCallback(remoteResponse) {
            self.trace("smartSave.checkStatusAndCallback: response (JSON-formatted): " + JSON.stringify(remoteResponse));
            
            switch (remoteResponse.status) {
                case "saved": 
                    // todo: if there is a remoteResponse.remoteentry, use that one instead of the input.entry
                    //var localObj = { entry: input.entry, version: remoteResponse.remoteversion, dirty: false };
                    //self.localSave(wikiword, localObj);
                    
                    // todo: if there is a remoteResponse.remoteentry, use that one instead of the input.entry
                    response = { status: "remotesaved", entry: input.entry };
                    break;
                    
                case "conflict":
                    self.setGlobalDirty(true);
                    // todo: figure out conflict detection and handling
                    
                    // remoteResponse should contain: remoteentry and remoteversion
                    // UI needs to prompt user, merge/resolve and save again later
                    
                    response = { status: "remoteconflict" };
                    break;
                    
                case "savefailed":
                    self.setGlobalDirty(true);
                    response = { status: "remotesavefailed" };
                    break;
                    
                case "saveimpossible":
                    response = { status: "saveimpossible" };
                    break;
                    
                default:
                    self.trace("smartSave.checkStatusAndCallback exception: " + remoteResponse.status);
                    self.setGlobalDirty(true);
                    response = { status: "exception" };
                    break;
            }
            callback(response);
        }
    
    }

    this.listDirty = function() {
        var titles = this.listWikiwords();
        var out = new Array();
        for (var i = 0; i < titles.length; i++) {
            var obj = this.localLoad(titles[i]);

            if (obj.dirty && !obj.remoteversion) {
                obj.wikiword = titles[i];
                out.push(obj);
            }
        }
        return out;
    }
    
    this.listNeedsResolve = function() {
        var titles = this.listWikiwords();
        var out = new Array();
        for (var i = 0; i < titles.length; i++) {
            var obj = this.localLoad(titles[i]);

            if (obj.dirty && obj.remoteversion) {
                obj.wikiword = titles[i];
                out.push(obj);
            }
        }
        return out;
    }
    
    this.dump = function() {
        var titles = this.listWikiwords();
        var out = "";
        for (var i = 0; i < titles.length; i++) {
            var obj = this.localLoad(titles[i]);
            out += titles[i] + " (version:" + obj.version + ") (dirty:" + obj.dirty + ")\r\n";
            out += obj.entry + "\r\n ======== \r\n";
        }
        return out;
    }
    
    this.subkey = function (name, subname) { return "_" + name + "_" + subname; }

    this.setValue = function(cat, name, subname, value) {
        if (typeof(value) == "string") {
            value = escape(value);
        }
        
        if (subname) {
            name = this.subkey(name, subname);
        }
        
        //alert("Set value " + cat + " " + name + " " + value);
        return fs.setValue(cat, name, value);
    }
    this.getValue = function(cat, name, subname) {
        if (subname) {
            name = this.subkey(name, subname);
        }
        //alert("get value " + cat + " " + name);

        var value = fs.getValue(cat, name);
        //alert("get value returned " + value);
        if (typeof(value) == "string") {
            value = unescape(value);
        }
        return value;
    }
    
    this.setGlobalDirty = function(dirty) {
        this.setValue(DirtyConst, DirtyConst, null, dirty);
        fs.flush();
    }
    
    this.getGlobalDirty = function() {
        if (fs) {
            return this.getValue(DirtyConst, DirtyConst, null);
        } else { 
            return false;
        }
    }
}


/**************************************** PHPServer ***************************************************/
function PHPServer(wiki) {
    this.remoteLoad = function (wikiword, callback) {
        var response;
        
        if (!window.navigator.onLine) { return onimpossible(); }
        
        var xhr = this.createXHR();
        var url = "../php/GetEntry.php?wikiword=" + wikiword; // todo: hardcoded path
        xhr.onreadystatechange = onreadystatechange;
        xhr.open("GET", url, true);
        xhr.send(null);
        
        function onreadystatechange() {
            
            if (xhr.readyState == 4) {
                try {
                    var statusCode = xhr.status;
                } catch (e) {
                    return onerror();
                }
                
                if (statusCode == 200) {
                    onload();
                } else {
                    onerror();
                }
            }
        }
        
        function onload() {
            try {
                wiki.trace("remoteLoad.onload (response from the server): " + xhr.responseText);
                var serverResp = eval('(' + xhr.responseText + ')');
                
                // todo: only cache result if not a conflict
                
                // cache latest entry
                var obj = { entry: serverResp.entry,
                    version: serverResp.version, 
                    dirty: false };
                wiki.localSave(wikiword, obj); 
                
                response = { status: "loaded", entry: serverResp.entry, version: serverResp.version };
            } catch (e) {
                wiki.trace(e.message);
                return onerror();
            }
            
            cleanup();
            callback(response);
        }
        
        function onerror() {
            wiki.trace("remoteLoad.onerror");
            response = { status: "loadfailed" };
            try {
                wiki.trace("remoteLoad.onerror: details: " + xhr.status);
                response.statusCode = xhr.status;
            } catch (e) { }
            
            cleanup();
            callback(response);
        }
        
        function onimpossible() {
            wiki.trace("remoteLoad.onimpossible");
            response = { status: "loadimpossible" };
            cleanup();
            callback(response);
        }
        
        function cleanup() {
            delete xhr['onreadystatechange']; 
            delete xhr;
            xhr = null;
        }
    }
    
    this.remoteSave = function (wikiword, input, callback) {
        var response;
          
        if (!window.navigator.onLine) { return onimpossible(); }
  
        var xhr = this.createXHR();
        var url = "../php/SaveEntry.php?wikiword=" + wikiword; // todo: hardcoded path
        xhr.onreadystatechange = onreadystatechange;
        xhr.open("POST", url, true);
        
        var jsonInput = JSON.stringify(input);
        wiki.trace(jsonInput);
        xhr.send(jsonInput);
        
        function onreadystatechange() {
            if (xhr.readyState == 4) {
                try {
                    var statusCode = xhr.status;
                } catch (e) {
                    return onerror();
                }
                
                if (statusCode == 200) {
                    onload();
                } else {
                    onerror();
                }
            }
        }
            
        function onload() {
            try {
                wiki.trace("remoteSave.onload: " + xhr.responseText);
                var serverResp = eval('(' + xhr.responseText + ')');
                response = { status: serverResp.status, entry: serverResp.entry, version: serverResp.version };
                
                switch (response.status) {
                case "saved": 
                    // todo: if there is a remoteResponse.remoteentry, localSave that one instead of the input.entry

                    var localObj = { entry: input.entry, version: response.remoteversion, dirty: false };
                    wiki.localSave(wikiword, localObj);
                    
                    break;
                }    
                
            } catch (e) {
                wiki.trace(e);
                return onerror();
            }
            cleanup();
            callback(response);
        }
        
        function onerror() {
            wiki.trace("remoteSave.onerror");
            response = { status: "savefailed" };
            try {
                wiki.trace("remoteSave.onerror: details: " + xhr.status);
                response.statusCode = xhr.status;
            } catch (e) { }
            cleanup();
            callback(response);
        }
        
        function onimpossible() {
            wiki.trace("remoteLoad.onimpossible");
            response = { status: "saveimpossible" };
            cleanup();
            callback(response);
        }
        
        function cleanup() {
            delete xhr['onreadystatechange'] ;
            delete xhr;
            xhr = null;
        }
    }
    
    this.createXHR = function() {
        wiki.trace("creating XHR");
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        } else {
            return new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
}
    