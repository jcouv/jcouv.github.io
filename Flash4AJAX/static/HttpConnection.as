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
 
class HTTPConnection
{
    private var verb:String = "GET";
    private var body:String = "";
    private var url:String = "";
    
    var contentType:String;
    var sendAndLoad:Function = LoadVars.prototype.sendAndLoad;
	var load:Function = LoadVars.prototype.load;

	// note: many headers can't be added. http://livedocs.macromedia.com/flash/8/main/wwhelp/wwhimpl/common/html/wwhelp.htm?context=LiveDocs_Parts&file=00002324.html
    var addRequestHeader:Function = LoadVars.prototype.addRequestHeader;
	var onData:Function; // Hook into this Function(string) to receive the response

    function HTTPConnection(_url:String )
    {
		url  = _url;
    }

	function setVerb(_verb:String) {
		if (_verb) {
			verb = _verb;
		}
	}
	
	function setBody(_body:String) {
		if (_body) {
			body = _body;
		}
	}

	function setContentType(_contentType:String) {
		if (_contentType) {
			contentType = _contentType;
		}
	}

    function toString():String
    {
		return body;
    }

    function send()
    {
		Storage.Log("HttpConnection send (verb=" + verb + ")");
		Storage.Log("HttpConnection send (body length=" + body.length + ")");
		
		// note: this appears in LiveHTTPHeaders only when doing a POST. Does that mean it's not properly set when doing a GET?
		//addRequestHeader("X-Hello-World", "Hello world");
		//addRequestHeader(["X-Hello-World", "Hello world"]);
		
		// note: if we did a sendAndLoad on a GET, the Flash API would add a question mark '?' at the end of the querystring :(
		if (verb == "GET") {
			load(url);
		} else {
			sendAndLoad(url, this, verb);
		}
    }
} 
/*
o.addRequestHeader = function (key, value) {
    if (typeof(this._customHeaders) == "undefined") {
        this._customHeaders = new Array();
        ASSetPropFlags(this, "_customHeaders", 131);
    }
    if (typeof(key) == "string" && typeof(value) == "string") {
        this._customHeaders.push(key, value);
    } else if (key instanceof Array) {
        var _l2 = 0;
        while (_l2 < key.length) {
            if (_l2 + 1 < key.length){
                this.addRequestHeader(key[_l2], key[_l2 + 1]);
            }
            _l2 = _l2 + 2;
        }
    }
};
*/