import DojoExternalInterface;

class Crossdomain {
	public function Crossdomain(){
		DojoExternalInterface.initialize();
		DojoExternalInterface.addCallback("sayHello", this, sayHello);
		DojoExternalInterface.addCallback("XmlHttp", this, XmlHttp);

		DojoExternalInterface.loaded();
	}
	
	public function sayHello(msg){
		return "FLASH: Message received from JavaScript was: " + msg;
	}
		
	static function main(mc){
		//getURL("javascript:dojo.debug('FLASH:main method of flash')");
		_root.crossDomain = new Crossdomain();
	}
	
	public function XmlHttp(location:String, callbackName:String, verb:String, body:String, contentType:String) {
		// bug: an empty body string gets converted into a "null"
		if (body == "null") { body = ""; }
		// bug: when the body is a null or empty string, the request will be made into a GET automatically

		var http:HTTPConnection = new HTTPConnection(location);
		http.setVerb(verb);
		http.setBody(body);
		http.setContentType(contentType);
		//http.addRequestHeader(headers);
		
		http.onData = function(src:String)
		{
			// no data returned on error (src is undefined)
			// todo: use a random string format

			var resultsReady = function(results){
				// nothing
			}
			
			DojoExternalInterface.call(callbackName, resultsReady, src);
		}
		
		http.send();
    }
}
