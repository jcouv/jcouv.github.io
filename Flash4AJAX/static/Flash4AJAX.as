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
 
// compile with:
//	mtasc -swf Flash4AJAX.swf -main -header 215:138:20 -version 8 HttpConnection.as Flash4AJAX.as

// you'll need to modify a config file for mtasc before compiling:
//	add "function onHTTPStatus(httpStatus:Number):Void;" in std8/XML.as,
//	as detailled in this thread: http://www.nabble.com/Problem-with-XML.onHTTPStatus-in-Flash-8-t773060.html

import flash.external.ExternalInterface;

class Storage {
	static var app : Storage;
	static var log : String;
	static var debug : Boolean;
	static var startTime : Number = Storage.epoch();
	
	static function epoch():Number {
		var date = new Date();
		return date.getTime();
	}
	
	function Storage() {
		//Storage.startTime = Storage.epoch();
		
		_root.createTextField("tf",0,0,0,215,138);
		log = "";
		var ret;
		
		_root.tf.text = "Running Flash version: " + getVersion();
		_root.tf.text += "\r\ntest2";
				
		if(ExternalInterface.available)
		{
			// todo: add error handling
			ret = ExternalInterface.addCallback("getValue", this, get);
			if (!ret) {
				Log("ExternalInterface.addCallback failed");
				return;
			}
			
			ExternalInterface.addCallback("setValue", this, set);
			
			ExternalInterface.addCallback("flush", this, flush);

			ExternalInterface.addCallback("list", this, list);
			
			ExternalInterface.addCallback("erase", this, erase);


			ExternalInterface.addCallback("log", app, Log);

			ExternalInterface.addCallback("getLog", this, getLog);
			
			// todo: add error handling
			ExternalInterface.addCallback("ping", this, ping);
			
			ExternalInterface.addCallback("XmlGet", this, XmlGet);
			ExternalInterface.addCallback("XmlHttp", this, XmlHttp);
			
			ExternalInterface.addCallback("loadPolicyFile", this, loadPolicyFile);

			ExternalInterface.addCallback("Debug", null, Debug);
		} 
		//Storage.Debug();
	}

	static function main(mc) {
		if(ExternalInterface.available)
		{
			app = new Storage();
			Log("Storage created");
		
			Log("ExternalInterface is available");
			var ret = ExternalInterface.call("storageOnLoad");
		} else {
			getURL("javascript:storageOnError()");
		}
	}
	
	static public function Debug() {
		debug = true;
	}
	
	static public function Log(input:String)
	{
		log = log + " ___ " + input;
		
		if (debug) {
			_root.tf.text = input + " (" + Storage.getTime()  + ")\r" + _root.tf.text;
		}
	}

    public function set(category:String, name:String, value:String) {
		var so:SharedObject = SharedObject.getLocal(category);
		// todo: add error handling
		
		so.data[name] = value;
   } 
        
    public function get(category:String, name:String):String {
		//Log("get:" + category + " " + name);
		var so:SharedObject = SharedObject.getLocal(category);
		// todo: add error handling
		if (so == null || so.data[name] == undefined) { return null; }
		
		return so.data[name];
    }
    
    // delete all the sub-entries for a name
    public function erase(category:String, name:String) {
		var so:SharedObject = SharedObject.getLocal(category);
		
		// todo
		// delete x
		// http://www.actionscript.org/tutorials/intermediate/SharedObjects/index3.shtml
		// http://www.flashguru.co.uk/delete-a-sharedobject/
    }
    
    // list all the entries that do not start with an _
    public function list(category:String):Array {
		var ret = new Array();
		
		var so:SharedObject = SharedObject.getLocal(category);
		for (var item in so.data) {
			if (item.charAt(0) != '_') {
				ret.push(item);
				Log("listed item: " + item);
			}
		}
		return ret;
    }
    
    public function flush(category:String):Object {
		var so:SharedObject = SharedObject.getLocal(category);
		// todo: add error handling

		return so.flush();
		//This method returns false when the user has disabled shared objects for your domain or for all domains. It returns "pending" when additional Storage space is needed and the user must interactively decide whether to allow an increase.
		// todo: add error handling
    }
    
    
    public function getLog():String {
		return escape(log);
    }
    
    // todo: replace this with "version"
    public function ping():String {
		Storage.Log("ping");
		return "pong";
    }
    
	static public function getTime() : Number {
		return Storage.epoch() - Storage.startTime;
	}
    
    // todo: figure out the timeout behavior for this async call
    public function XmlGet(location:String, callbackName:String) {
		var responseXML:XML = new XML();
		responseXML.ignoreWhite = true;
		
		//var headers:Array = new Array("Cache-Control", "max-age=0"); // "no-cache"
		responseXML.addRequestHeader("Cache-Control", "no-cache, max-age=0");
		responseXML.addRequestHeader("Pragma", "no-cache");

		// todo: if onHTTPStatus doesn't get called back before onLoad, there is probably a security issue
		
		Storage.Log("XmlGet, location: " + location);
				
		responseXML.onHTTPStatus = function(httpStatus:Number) {
			Storage.Log("XmlGet, onHTTPStatus: " + httpStatus);
		}
		
		
		responseXML.onLoad = function(success) {
			Storage.Log("XmlGet.onLoad, success: " + success);

			var xml = responseXML.toString();
			Storage.Log("XmlGet, str length: " + xml.length);
			
			Storage.Log("XmlGet onLoad callback");

			//ExternalInterface.call(callbackName, xml); // this is the bottleneck
			_root.retXml = xml; // todo: use a temp variable and return its name
			ExternalInterface.call(callbackName, "");
			
			Storage.Log("XmlGet onLoad ends");
		}
		
		responseXML.load(location);
    }
    
    // restrictions:
    // - only GET or POST
    // - custom headers only sent on POST
    public function XmlHttp(location:String, callbackName:String, verb:String, body:String, contentType:String, headers:Array) {
		// bug: an empty body string gets converted into a "null"
		if (body == "null") { body = ""; }
		// bug: when the body is a null or empty string, the request will be made into a GET automatically

		//Storage.Log("Headers: " + headers);
		
		var http:HTTPConnection = new HTTPConnection(location);
		http.setVerb(verb);
		http.setBody(body);
		http.setContentType(contentType);
		http.addRequestHeader(headers);
		//http.addRequestHeader("test", "test");
		
		http.onData = function(src:String)
		{
			// no data returned on error (src is undefined)
			
			// todo: use a random string format
			
			Storage.Log("XmlHttp onData (length=" + src.length + ")");
			if (callbackName) {
				_root.retText = src;
				ExternalInterface.call(callbackName, "retText");
			}
		}
		http.send();
    }
    
    public function loadPolicyFile(location:String)
    {
		System.security.loadPolicyFile(location);
    }
}

