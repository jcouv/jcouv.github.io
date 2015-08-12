// @name      The Fade Anything Technique (revisited)
// @url       http://blog.monstuff.com/archives/images/fade-anything-technique.js
//            Based on http://www.axentric.com/aside/fat/
// @version   1.0
// @author    Julien Couvreur
//            Original author    Adam Michela

// This modification on the Fade Anything Technique doesn't require IDs on elements.
// Instead of using IDs, pass in the DOM elements directly.

var Fat = {
	make_hex : function (r,g,b) 
	{
		r = r.toString(16); if (r.length == 1) r = '0' + r;
		g = g.toString(16); if (g.length == 1) g = '0' + g;
		b = b.toString(16); if (b.length == 1) b = '0' + b;
		return "#" + r + g + b;
	},

	fade_element : function (element, fps, duration, from, to) 
	{
		if (!fps) fps = 30;
		if (!duration) duration = 2000;
		if (!from || from=="#") from = "#FFFF33";
		if (!to) to = this.get_bgcolor(element);
		
		var frames = Math.round(fps * (duration / 1000));
		var interval = duration / frames;
		var delay = interval;
		var frame = 0;
		
		if (from.length < 7) from += from.substr(1,3);
		if (to.length < 7) to += to.substr(1,3);
		
		var rf = parseInt(from.substr(1,2),16);
		var gf = parseInt(from.substr(3,2),16);
		var bf = parseInt(from.substr(5,2),16);
		var rt = parseInt(to.substr(1,2),16);
		var gt = parseInt(to.substr(3,2),16);
		var bt = parseInt(to.substr(5,2),16);
			
		var r,g,b,h;
		while (frame < frames)
		{
			r = Math.floor(rf * ((frames-frame)/frames) + rt * (frame/frames));
			g = Math.floor(gf * ((frames-frame)/frames) + gt * (frame/frames));
			b = Math.floor(bf * ((frames-frame)/frames) + bt * (frame/frames));
			h = this.make_hex(r,g,b);
		
		    
			setTimeout(this.makeTimer(element, h), delay);

			frame++;
			delay = interval * frame; 
		}
		setTimeout(this.makeTimer(element, to), delay);
	},
	
	makeTimer : function(element, color) {
	    return function() { Fat.set_bgcolor(element, color); }
	},
	
	set_bgcolor : function (element, c)
	{
		element.style.backgroundColor = c;
	},
	
	get_bgcolor : function (element)
	{
		while(element)
		{
			var c;
			if (window.getComputedStyle) c = window.getComputedStyle(element,null).getPropertyValue("background-color");
			if (element.currentStyle) { c = element.currentStyle.backgroundColor; }
			if ((c != "" && c != "transparent") || element.tagName == "BODY") { break; }
			element = element.parentNode;
		}
		if (c == undefined || c == "" || c == "transparent") c = "#FFFFFF";
		var rgb = c.match(/rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/);
		if (rgb) c = this.make_hex(parseInt(rgb[1]),parseInt(rgb[2]),parseInt(rgb[3]));
		return c;
	}
}

