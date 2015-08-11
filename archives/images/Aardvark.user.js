// Aardvark
// version 0.1
// 2005-04-26
//
// Made into a user script by Julien Couvreur
// based on http://www.karmatics.com/aardvark/aardvarkOverlay.js
//
// "The following code is adapted from Aardvark (
// http://karmatics.com/aardvark/) with the permission of its author, Rob
// Brown. It is experimental, and is distributed here temporarily until we
// produce a version that can be released under GPL, without requiring changes
// to Aardvark's license (it will be a separate extension or script that
// integrates with, rather than replaces, Aardvark). This code is copyrighted,
// and it and any modifications to it cannot be redistributed after the date of
// June 1, 2005, without the express permission of Rob Brown."
// 
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
//
// To install, you need Greasemonkey: http://greasemonkey.mozdev.org/
// Then restart Firefox and revisit this script.
// Under Tools, there will be a new menu item to "Install User Script".
// Under Tools and User Script Commands, there will be a new menu item to
//  "Start Aadvark"
//
// To uninstall, go to Tools/Manage User Scripts,
// select "Aardvark", and click Uninstall.
//
// --------------------------------------------------------------------
//
// WHAT IT DOES:
// Helps you inspect the page. More info at: 
//      http://www.karmatics.com/aardvark/ (via Simon Willison's linklog)
// --------------------------------------------------------------------
//
// ==UserScript==
// @name            Aardvark
// @namespace       http://blog.monstuff.com/archives/cat_greasemonkey.html
// @description     Helps you inspect the page by displaying element type.
// @include         http://*
// ==/UserScript==

// add a GM menu command
GM_registerMenuCommand("Start Aardvark", launchAardvark);

function launchAardvark() {
    // script from http://www.karmatics.com/aardvark/aardvarkOverlay.js
    var g_doc = null;
    var g_saveHilited = null;
    var g_innerItem = null;
    var g_box = null;
    var outWin = null;
    var g_mode = 'R';

    var undoElement;
    var undoRefElement;
    var undoBody;
    var undoMode;

    var boxMiddleX, boxMiddleY;

    //-----------------------------------------------------
    // find the x position of an object
    function advrk_getX (o)
    {
    var leftX = 0;
    if (o.offsetParent)
	    {
	    while (o.offsetParent)
		    {
		    leftX += o.offsetLeft
		    o = o.offsetParent;
		    }
	    }
    else if (o.x)
	    leftX += o.x;
    return leftX;
    }

    //-----------------------------------------------------
    // find the y position of an object
    function advrk_getY (o)
    {
    var topY = 0;
        
    if (o.offsetParent)
	    {
	    while (o.offsetParent)
		    {
		    topY += o.offsetTop
		    o = o.offsetParent;
		    }
	    }
    else if (o.y)
	    topY += o.y;
    return topY;
    }

    //-------------------------------------------------
    function advrk_getElemFromEvent (evt)
    {
    return (evt.target) ? evt.target : evt.srcElement;
    }

    //-------------------------------------------------
    function advrk_makeBox ()
    {
    g_box = new Array ();
    var d;

    for (var i=0; i<4; i++)
	    {
	    d = g_doc.createElement ("DIV");
	    d.style.overflow = "hidden";
	    d.style.position = "absolute";
	    d.style.height = "2px";
	    d.style.width = "2px";
	    d.style.top = "20px";
	    d.style.left = "20px";
	    d.style.zIndex = "2500";
	    d.id = "xv" + i;
	    g_box[i] = d;
	    g_doc.body.appendChild (d);
	    }

    g_box[0].style.borderTopWidth = "2px";
    g_box[0].style.borderTopColor = "red";
    g_box[0].style.borderTopStyle = "solid";
        
    g_box[1].style.borderTopWidth = "2px";
    g_box[1].style.borderTopColor = "red";
    g_box[1].style.borderTopStyle = "solid";
        
    g_box[2].style.borderLeftWidth = "2px";
    g_box[2].style.borderLeftColor = "red";
    g_box[2].style.borderLeftStyle = "solid";

    g_box[3].style.borderLeftWidth = "2px";
    g_box[3].style.borderLeftColor = "red";
    g_box[3].style.borderLeftStyle = "solid";

    for (var i=0; i<2; i++)
	    {
	    d = g_doc.createElement ("DIV");
	    d.style.backgroundColor = "#ffffbb";
	    d.id = "xv" + (4 + i);
	    d.style.borderColor = "black";
	    d.style.borderWidth = "1px 2px 2px 1px";
	    d.style.borderStyle = "solid";
	    d.style.fontFamily = "arial";
	    d.style.textAlign = "left";
	    d.style.color = "black";
	    d.style.fontSize = "12px";
	    d.style.position = "absolute";
	    d.style.paddingTop = "2px";
	    d.style.paddingBottom = "2px";
	    d.style.paddingLeft = "5px";
	    d.style.paddingRight = "5px";
	    d.setAttribute("onmouseover", "advrk_clearBox()");
	    g_doc.body.appendChild (d);
	    g_box[4+i] = d;
	    }

    g_box[4].style.MozBorderRadiusBottomleft = "6px";
    g_box[4].style.MozBorderRadiusBottomright = "6px";
    g_box[4].style.zIndex = "2499";

    g_box[5].style.backgroundColor = "#bbeeff";
    g_box[5].style.zIndex = "2501";
    }

    //-------------------------------------------------
    function advrk_alignBoxToElement (elem, string)
    {
    if (g_box == null)
	    advrk_makeBox ();

    var x = advrk_getX(elem)
    var y = advrk_getY(elem);
    g_box[0].style.width = elem.offsetWidth + "px";
    g_box[0].style.display = "";
    advrk_moveAbsPosElem (g_box[0], x, y);

    g_box[1].style.width = (elem.offsetWidth + 2)  + "px";
    g_box[1].style.display = "";
    advrk_moveAbsPosElem (g_box[1], x, y+elem.offsetHeight);

    g_box[2].style.height = elem.offsetHeight  + "px";
    g_box[2].style.display = "";
    advrk_moveAbsPosElem (g_box[2], x, y);

    g_box[3].style.height = elem.offsetHeight + "px";
    g_box[3].style.display = "";
    advrk_moveAbsPosElem (g_box[3], x+elem.offsetWidth, y);

    g_box[4].innerHTML =  string;
    g_box[4].style.display = "";

    var boxY = y+elem.offsetHeight+1;
    if (boxY > findScrollTop() + findWindowHeight())
	    {
	    boxY = findScrollTop() + findWindowHeight() - g_box[4].offsetHeight;
	    }

    advrk_moveAbsPosElem (g_box[4], x+2, boxY);
    }

    //-------------------------------------------------
    function advrk_removeBoxFromBody ()
    {
    if (g_box != null)
	    {
	    for (var i=0; i<6; i++)
		    g_box[i] = g_box[i].parentNode.removeChild(g_box[i]);
	    }
    }

    //-------------------------------------------------
    function advrk_reAddBoxToBody ()
    {
    if (g_box != null)
	    {
	    for (var i=0; i<6; i++)
		    g_doc.body.appendChild(g_box[i]);
	    }
    }

    //-------------------------------------------------
    function advrk_clearBox ()
    {
    g_saveHilited = null;
    if (g_box != null)
	    for (var i=0; i<5; i++)
		    g_box[i].style.display = "none";
    }

    var promptInc = 1;

    //-------------------------------------------------
    function advrk_clearPrompt (inc)
    {
    if (inc == promptInc)
	    {
	    var d;
	    if ((d = g_doc.getElementById("xv5")) != null)
		    d.style.visibility = "hidden";
	    }
    }

    //-------------------------------------------------
    function advrk_showPrompt (string, firstBig)
    {
    g_box[5].innerHTML = "<span style='font-size:2em;font-weight:bold'>" +
	    string.charAt(0) + "</span>" + string.substring(1, string.length);
    var y = g_doc.body.scrollTop+boxMiddleY-(g_box[5].offsetHeight);
    if (y < 0)
	    y = 0;

    advrk_moveAbsPosElem (g_box[5], g_doc.body.scrollLeft+boxMiddleX-(g_box[5].offsetWidth/2),
	    y);
    g_box[5].style.visibility = "visible";
    promptInc++;
    setTimeout ("advrk_clearPrompt(" + promptInc + ")", 400);
    }

    //-------------------------------------------------
    function advrk_getWindowWidth()
    {
    if (typeof(window.innerWidth) == 'number')
	    return window.innerWidth;
    if (g_doc.clientWidth)
	    return g_doc.clientWidth;
    if (g_doc.body && g_doc.body.clientWidth )
	    return g_doc.body.clientWidth;
    return 0;
    }

    //-----------------------------------------------------
    // move a div (or whatever) to an x y location
    function advrk_moveAbsPosElem (o, x, y)
    {
    o=o.style;

    if (g_doc.all)
	    {
	    o.pixelLeft=x + "px";
	    o.pixelTop=y + "px";
	    }
    else
	    {
	    o.left=x + "px";
	    o.top=y + "px";     
	    }
    }

    //-------------------------------------------------
    function advrk_dump (text)
    {
    var t = text;
    if (outWin == null || outWin.closed == true)
    {
    outWin = window.open('','output',
	    'scrollbars=no,menubar=no,height=400,width=600,resizable=yes,toolbar=no,location=no,status=no');
    var d = outWin.document.getElementById ('output');
    if (d != null)
	    {
	    d.innerHTML += "<hr>" + t;
	    }
    else
	    {
	    outWin.document.write ("<html><title>Output</title>" +
		    "<body style='margin:0; padding:0'>" +
		    "<div style='width:100%;margin:-2px ; padding: 2px 0 2px 2px; font-family: arial;' id='output'>" +
		    t + "</div></body></html>");
	    outWin.document.close ();
	    }
    }
    else
	    {
	    var d = outWin.document.getElementById ('output');
	    d.innerHTML += "<hr>" + t;
	    }
    outWin.scroll (0, 10000);
    }

    //-------------------------------------------------
    function advrk_mm (evt)
    {
    boxMiddleX = evt.clientX;
    boxMiddleY = evt.clientY;
    }

    //-------------------------------------------------
    function advrk_mo (evt)
    {
    var o = advrk_getElemFromEvent (evt);
    if (o == null)
	    advrk_clearBox ();
    else
	    advrk_showElement (o);
    g_innerItem = null;
    return false;
    }

    //-------------------------------------------------
    function advrk_showElement (o)
    {
    var ok = false;
    while (ok == false)
	    {
	    switch (o.tagName)
		    {
		    case "OBJECT": 
		    case "APPLET": 
		    case "BLOCKQUOTE": 
		    case "H1": 
		    case "H2": 
		    case "H3": 
		    case "PRE": 
		    case "FORM": 
		    case "CODE": 
		    case "UL": 
		    case "OL": 
		    case "P":
		    case "TABLE":
		    case "TD":
		    case "TH":
		    case "TR":
		    case "DIV":
		    case "IMG":
			    ok = true;
			    break;
		    default:
			    if (o.parentNode == null)
				    {
				    if (g_saveHilited != null)
					    advrk_clearBox();
				    return;
				    }
			    o = o.parentNode;
			    break;
		    }
	    }

    var s = '';
    if (o.id.indexOf ("xv") != -1)
	    return;
    g_saveHilited = o;

    s += "<span style='font-weight: bold'>" + o.tagName.toLowerCase() + "</span>";

    if (o.id != '')
	    s += ", id=" + o.id;
    if (o.className != '')
	    s += ", class=" + o.className;
    advrk_alignBoxToElement (o, s)
    }

    //-------------------------------------------------
    function advrk_modeToString (mode)
    {
    switch (mode)
	    {
	    case 'V': 
		    return "View source";
	    case 'C': 
		    return "Colorize";
	    case 'B': 
		    return "Black on white";
	    case 'E': 
		    return "Erase";
	    case 'R': 
		    return "Remove";
	    case 'I':
		    return "Isolate";
	    case 'P': 
		    return "Property";
	    case 'D': 
		    return "De-widthify";
	    default:
		    return null;
	    }
    }

    //-------------------------------------------------
    function advrk_doAction (evt)
    {
    if (g_saveHilited != null)
	    {
	    var o = g_saveHilited;
	    advrk_clearBox ();
        
	    var parent;
	    if (g_saveHilited != null && g_saveHilited.parentNode != null)
		    parent = g_saveHilited.parentNode;
	    else
		    parent = null;
        
	    switch (g_mode)
		    {
		    case 'V':
			    {
			    var s = advrk_getOuterHtml(o);
			    advrk_dump (s);
			    break;
			    }
		    case 'C':
			    {
			    o.style.backgroundColor = "#" + 
					    Math.floor(Math.random()*16).toString(16) + 
					    Math.floor(Math.random()*16).toString(16) + 
					    Math.floor(Math.random()*16).toString(16);
			    o.style.backgroundImage = "";
			    break;
			    }
		    case 'B':
			    {
			    advrk_backgroundClear (o);
			    break;
			    }
		    case 'E':
			    {
			    var st = g_doc.defaultView.getComputedStyle (o, "");
			    var w = st.getPropertyValue ("width");
			    var h = st.getPropertyValue ("height");
			    o.style.width = w;
			    o.style.height = h;
        		
			    if (o.tagName == "TABLE")
				    {
				    var newO = g_doc.createElement ("TABLE");
				    var tr = g_doc.createElement ("TR");
				    var td = g_doc.createElement ("TD");
				    tr.appendChild (td);
				    td.style.width = w;
				    td.style.height = h;
				    td.className = "noclass";
				    tr.className = "noclass";			
				    newO.appendChild (tr);
				    o.parentNode.insertBefore (newO, o);
				    o.parentNode.removeChild (o);
				    o = newO;
				    }
			    else if (o.tagName == "TR")
				    {
				    var newO = g_doc.createElement ("TR");
				    var td = g_doc.createElement ("TD");
				    td.style.width = w;
				    td.style.height = h;
				    td.className = "noclass";
				    newO.appendChild (td);
				    o.parentNode.insertBefore (newO, o);
				    o.parentNode.removeChild (o);
				    o = newO;
				    }
			    else
				    {
				    o.innerHTML = "";
				    }
        		
			    o.style.backgroundColor = ""
			    o.style.backgroundImage = "";
			    o.style.border = "";
			    o.className = "noclass";
			    if (parent)
				    advrk_showElement (parent);
			    break;
			    }
		    case "R":
			    {
			    if (o.parentNode != null)
				    {
				    if (undoMode == 'B')
					    undoElement.parentNode.removeChild (undoElement);
				    undoElement = o;
				    o.style.display = 'none';
				    undoMode = 'R';
				    }
			    break;
			    }
		    case 'I':
			    isolateElement (o);
			    break;
		    case 'D':
			    {
			    advrk_deWiden(o)			
			    }
		    break;
		    case 'P':
			    {
        					
			    }
		    break;
		    }
	    }
    evt.preventDefault ();
    }

    //------------------------------------------------------------
    function isolateElement (o)
    {
    if (o.parentNode != null)
	    {
	    advrk_removeBoxFromBody ();
        
	    var ta = o.style.textAlign;
	    var cssFloat = o.style.cssFloat;
	    var position = o.style.position;
	    var top = o.style.top;
	    var left = o.style.left;
	    var margin = o.style.margin;
        
	    o.style.textAlign = "left";
	    o.style.cssFloat = "none";
	    o.style.position = "relative";
	    o.style.top = "0";
	    o.style.left = "0";
	    o.style.margin = "0";
        		
	    var outerHTML = advrk_getOuterHtml2 (o);
        
	    o.style.textAlign = ta;
	    o.style.cssFloat = cssFloat;
	    o.style.position = position;
	    o.style.top = top;
	    o.style.left = left;
	    o.style.margin = margin;
        
	    if (o.tagName == "TR")
		    outerHTML = "<table class='noclass;'>" + outerHTML + "</table>";
	    else if (o.tagName == "TD")
		    outerHTML = "<table class='noclass;'><tr class='noclass;'>" + outerHTML + "</tr></table>";
        
	    undoElement = g_doc.body;
	    undoMode = 'I';
        
	    g_doc.body = g_doc.createElement ("BODY");
	    g_doc.body.style.textAlign = "left";
	    g_doc.body.style.background = "none";
	    g_doc.body.style.backgroundColor = "white";
	    g_doc.body.style.backgroundImage = "none";		
	    g_doc.body.style.margin = "20px";		
        
	    g_doc.body.innerHTML = outerHTML;
	    advrk_reAddBoxToBody ();
	    advrk_clearBox();
	    }
    }

    //--------------------------------------------
    function findScrollTop()
    {
    if (g_doc.defaultView.pageYOffset != null)
	    return g_doc.defaultView.pageYOffset;
    if (g_doc.body.scrollWidth != null)
	    return g_doc.body.scrollTop;
    return (null);
    }

    //--------------------------------------------
    function findWindowHeight()
    {
    if (typeof(g_doc.defaultView.innerHeight) == 'number')
	    //Non-IE
	    return g_doc.defaultView.innerHeight;
    if (g_doc.documentElement &&
		    g_doc.documentElement.clientHeight)
	    //IE 6+ in 'standards compliant mode'
	    return g_doc.documentElement.clientHeight;
    if (g_doc.body && document.body.clientHeight)
	    //IE 4 compatible
	    return g_doc.body.clientHeight;
    return 0;
    }
        		
    //-------------------------------------------------
    function advrk_kd (evt)
    {
    if (g_doc.isStarted)
	    {
	    var c;
	    if (evt.keyCode != 0)
		    c = evt.keyCode;
	    else
		    c = String.fromCharCode(evt.which).toUpperCase();
        
	    if (c == "W" || c ==38)
		    {
		    if (g_saveHilited != null && g_saveHilited.parentNode != null)
			    {
			    g_innerItem = g_saveHilited;
			    advrk_showElement (g_saveHilited.parentNode);
			    if (g_saveHilited == null)
				    advrk_showElement (g_innerItem);
			    }
		    advrk_showPrompt ("Wider", true);
		    }
	    else if (c == "U") // undo
		    {
		    advrk_removeBoxFromBody ();
		    g_box = null;
        			
		    if (undoMode == "R")
			    {
			    undoElement.style.display = '';
			    undoMode = null;
			    }
		    else if (undoMode == "I")
			    {
			    g_doc.body = undoElement;
			    undoMode = null;
			    }
		    advrk_makeBox ();
		    advrk_showPrompt ("Undo", true);
		    }
	    else if (c == 37)
		    {
		    if (g_saveHilited != null)
			    {
			    var isParent = false;
			    var n = g_saveHilited.previousSibling;
			    if (n == null)
				    {
				    n = n.parentNode;
				    isParent = true;
				    }
			    while (n != null)
				    {
				    if (!isParent && n.nodeType == 1)
					    {
					    g_saveHilited = n;
					    break;
					    }
				    if (n.previousSibling == null && n.parentNode)
					    {
					    n = n.parentNode;
					    isParent = true;
					    }
				    else
					    {
					    n = n.previousSibling;
					    isParent = false;				
					    }
				    }
			    advrk_showElement (g_saveHilited);
			    }
		    }
	    else if (c == "N" || c == 40)
		    {
		    if (g_innerItem != null)
			    {
			    advrk_showElement (g_innerItem);
			    advrk_showPrompt ("Narrower", true);
			    }
		    }
	    else if (c == "Q")
		    {
		    advrk_clearBox ();
		    delete (g_doc.isStarted);
		    g_doc.onkeypress = null;
		    g_doc.onmouseover = null;
		    window.status = "aardvark stopped";
		    g_saveHilited = null;
		    g_innerItem = null;
		    g_box = null;
		    outWin = null;
		    advrk_showPrompt ("Quit Aardvark", true);
		    }
	    else
		    {
		    var s = advrk_modeToString (c);
		    if (s == null)
			    return false;
		    g_mode = c;
		    advrk_showPrompt (s, true);
		    advrk_doAction (evt);
		    }
	    }
    evt.preventDefault ();
    return true;
    }

    //
    function advrk_getOuterHtml2(node)
    {
    var str = "";

    switch (node.nodeType)
	    {
	    case 1: // ELEMENT_NODE
		    {
		    var isLeaf = (node.childNodes.length == 0 && leafElems[node.nodeName]);
        	
		    str += "<" + node.nodeName.toLowerCase() + " ";
		    for (var i=0; i<node.attributes.length; i++) 
			    {
			    if (node.attributes.item(i).nodeValue != null &&
				    node.attributes.item(i).nodeValue != '')
				    {
				    str += node.attributes.item(i).nodeName +
					    "='" + 
					    node.attributes.item(i).nodeValue +
					    "' ";
				    }
			    }

		    if (isLeaf)
			    str += " />";
		    else 
			    {
			    str += ">";
        		
			    for (var i=0; i<node.childNodes.length; i++)
				    str += advrk_getOuterHtml2(node.childNodes.item(i));
        		
			    str += "</" +
				    node.nodeName.toLowerCase() + ">"
			    }
		    }
		    break;
        		
	    case 3:	//TEXT_NODE
		    str += node.nodeValue;
		    break;
        	
	    }

    return str;
    }

    //
    function advrk_getOuterHtml(node)
    {
    var str = "";

    switch (node.nodeType)
	    {
	    case 1: // ELEMENT_NODE
		    {
		    if (node.style.display == 'none')
			    break;
		    var isLeaf = (node.childNodes.length == 0 && leafElems[node.nodeName]);
        	
		    if (!isLeaf)
			    str += "<div style='border: 1px solid #cccccc; border-right: 0; margin-left: 10px; margin-right: 0; overflow: hidden'>";
		    str += "&lt;<span style='color:red;font-weight:bold'>" +
					    node.nodeName.toLowerCase() + "</span>";
		    for (var i=0; i<node.attributes.length; i++) 
			    {
			    if (node.attributes.item(i).nodeValue != null &&
				    node.attributes.item(i).nodeValue != '')
				    {
				    str += " <span style='color:green;'>"
				    str += node.attributes.item(i).nodeName;
				    str += "</span>='<span style='color:blue;'>";
				    str += node.attributes.item(i).nodeValue;
				    str += "</span>'";
				    }
			    }

		    if (isLeaf)
			    str += " /&gt;<br>";
		    else 
			    {
			    str += "&gt;<br>";
        		
			    for (var i=0; i<node.childNodes.length; i++)
				    str += advrk_getOuterHtml(node.childNodes.item(i));
        		
			    str += "&lt;/<span style='color:red;font-weight:bold'>" +
				    node.nodeName.toLowerCase() + "</span>&gt;</div>"
			    }
		    }
		    break;
        		
	    case 3:	//TEXT_NODE
		    if (node.nodeValue != '' && node.nodeValue != '\n' 
				    && node.nodeValue != '\r\n' && node.nodeValue != ' ')
			    str += node.nodeValue + "<br>";
		    break;
        	
	    case 4: // CDATA_SECTION_NODE
		    str += "&lt;![CDATA[" + node.nodeValue + "]]><br>";
		    break;
        			
	    case 5: // ENTITY_REFERENCE_NODE
		    str += "&amp;" + node.nodeName + ";<br>"
		    break;

	    case 8: // COMMENT_NODE
		    str += "&lt;!--" + node.nodeValue + "--><br>"
		    break;
	    }

    return str;
    }

    var _leafElems = ["IMG", "HR", "BR", "INPUT"];
    var leafElems = {};
    for (var i=0; i<_leafElems.length; i++)
	    leafElems[_leafElems[i]] = true;
        
    function startAardvark()
    {
    g_doc = document;
    //((gContextMenu) ? gContextMenu.target.ownerDocument :
	    //window._content.document; //);

    if (g_doc.isStarted)
	    {
	    advrk_clearBox ();
	    delete (g_doc.isStarted);
	    g_doc.onkeypress = null;
	    g_doc.onmouseover = null;
	    g_doc.onmousemove = null;
	    g_saveHilited = null;
	    g_innerItem = null;
	    g_box = null;
	    outWin = null;
	    }
    else
	    {
	    g_saveHilited = null;
	    g_innerItem = null;
	    g_box = null;
	    outWin = null;

	    g_doc.isStarted = true;
	    g_doc.onkeypress = advrk_kd;
	    g_doc.onmouseover = advrk_mo;
	    g_doc.onmousemove = advrk_mm;
	    }
    }

    function advrk_deWiden(node)
    {
    switch (node.nodeType)
	    {
	    case 1: // ELEMENT_NODE
		    {
		    if (node.tagName != "IMG")
			    {
			    node.style.width = 'auto';
			    if (node.width)
				    node.width = null;
			    }
		    var isLeaf = (node.childNodes.length == 0 && leafElems[node.nodeName]);
        	
		    if (!isLeaf)
			    for (var i=0; i<node.childNodes.length; i++)
				    advrk_deWiden(node.childNodes.item(i));
		    }
		    break;
	    }
    }

    function advrk_backgroundClear(node)
    {
    switch (node.nodeType)
	    {
	    case 1: // ELEMENT_NODE
		    {
		    if (node.tagName != "IMG")
			    {
			    node.style.backgroundColor = "white";
			    node.style.color = "black";
			    node.style.backgroundImage = "";
			    }
		    var isLeaf = (node.childNodes.length == 0 && leafElems[node.nodeName]);
        	
		    if (!isLeaf)
			    for (var i=0; i<node.childNodes.length; i++)
				    advrk_backgroundClear(node.childNodes.item(i));
		    }
		    break;
	    }
    }

    startAardvark();
}
