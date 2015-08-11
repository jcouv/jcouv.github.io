
function InitFlash(callbackName) {
		dojo.require("dojo.event.*");
		dojo.require("dojo.flash");
		
		dojo.event.connect(dojo.flash, "loaded", callbackName);
		dojo.flash.setSwf({flash6: "Crossdomain_version6.swf",
						   flash8: "Crossdomain_version8.swf",
						   visible: false});
}



/**************************************** CallbackManager ***************************************************/

var CallbackManager = new Object();
CallbackManager.callbacks = new Array();

// assigns and returns a unique callback name for the input callback
CallbackManager.registerCallback = function(callback) {
    // todo: could be improved (look for the first available spot in the callbacks table, if necessary, expand it)
    var length = this.callbacks.push(selfDeleteCallback);
    var callbackID = length - 1;
    
    return "CallbackManager.callbacks[" + callbackID + "]";
    
    function selfDeleteCallback(obj) {
        delete CallbackManager.callbacks[callbackID];
        setTimeout(function() { callback(obj); }, 0);
        return;
    } 
}

/**************************************** FlashXmlHttpRequest ***************************************************/

// Implementation of FlashXMLHttpRequest on top of the Dojo-based Flash object
var FlashXMLHttpRequest = function() {
    var self = this;
    var _method, _url = null;
    var _contentType = "application/x-www-form-urlencoded";
    var _headers = new Array();
    
    // responseXML 
    // status 
    
    this.open = function(method, url, async, user, password) { 
        _method = method;
        _url = url;
    }
    
    this.send = function(body) {               
        function callback(response) {
            self.responseText = response;
            
            if (self.onload) {
                self.onload();
            }
        }
        dojo.flash.comm.XmlHttp(_url, CallbackManager.registerCallback(callback), _method, body, _contentType);
    }
    
    this.setRequestHeader = function(header, value) {
        if (header.toLowerCase() == "Content-Type".toLowerCase()) {
            _contentType = value;
            return;
        }
    }
    
    this.getRequestHeader = function() { alert("not supported"); }
    this.getResponseHeader = function(a) { alert("not supported"); }
    this.getAllResponseHeaders = function() { alert("not supported"); }
    this.abort = function() { alert("not supported"); }
    this.addEventListener = function(a, b, c) { alert("not supported"); }
    this.dispatchEvent = function(e) { alert("not supported"); }
    this.openRequest = function(a, b, c, d, e) { this.open(a, b, c, d, e); }
    this.overrideMimeType = function(e) { alert("not supported"); }
    this.removeEventListener = function(a, b, c) { alert("not supported"); }
}