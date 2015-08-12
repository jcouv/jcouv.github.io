// short bookmarklet
// javascript:function loadScript(scriptURL) { var scriptElem = document.createElement('SCRIPT'); scriptElem.setAttribute('language', 'JavaScript'); scriptElem.setAttribute('src', scriptURL); document.body.appendChild(scriptElem);} loadScript('http://blog.monstuff.com/archives/images/jsshell.js');


with(window.open("","_blank","width="+screen.width*.6+",left="+screen.width*.35+",height="+screen.height*.9+",resizable,scrollbars=yes")){document.write("<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/html4/strict.dtd\">\n\n<html onclick=\"keepFocusInTextbox(event)\">\n<head>\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=iso-8859-1\">\n<title>JavaScript Shell 1.4 modified to support IE</title>\n\n<script type=\"text/javascript\">\nvar \nhistList = [\"\"], \nhistPos = 0, \n_scope = {}, \n_win, // a top-level context\nquestion,\n_in,\n_out,\ntooManyMatches = null,\nlastError = null;\n\nfunction refocus()\n{\n  _in.blur(); // Needed for Mozilla to scroll correctly.\n  _in.focus();\n}\n\nfunction init()\n{\n  _in = document.getElementById(\"input\");\n  _out = document.getElementById(\"output\");\n\n  _win = window;\n\n  if (opener && !opener.closed)\n  {\n    println(\"Using bookmarklet version of shell: commands will run in opener's context.\", \"message\");\n    _win = opener;\n  }\n\n  initTarget();\n\n  recalculateInputHeight();\n  refocus();\n}\n\nfunction initTarget()\n{\n  _win.Shell = window;\n  _win.print = shellCommands.print;\n}\n\n\n// Unless the user is selected something, refocus the textbox.\n// (requested by caillon, brendan, asa)\nfunction keepFocusInTextbox(e) \n{\n  var g = e.srcElement ? e.srcElement : e.target; // IE vs. standard\n  \n  while (!g.tagName)\n    g = g.parentNode;\n  var t = g.tagName.toUpperCase();\n  if (t==\"A\" || t==\"INPUT\")\n    return;\n    \n  if (window.getSelection) {\n    // Mozilla\n    if (String(window.getSelection()))\n      return;\n  }\n  else if (document.getSelection) {\n    // Opera? Netscape 4?\n    if (document.getSelection())\n      return;\n  }\n  else {\n    // IE\n    if ( document.selection.createRange().text )\n      return;\n  }\n  \n  refocus();\n}\n\nfunction inputKeydown(e) {\n  // Use onkeydown because IE doesn't support onkeypress for arrow keys\n\n  //alert(e.keyCode + \" ^ \" + e.keycode);\n\n  if (e.shiftKey && e.keyCode == 13) { // shift-enter\n    // don't do anything; allow the shift-enter to insert a line break as normal\n  } else if (e.keyCode == 13) { // enter\n    // execute the input on enter\n    try { go(); } catch(er) { alert(er); };\n    setTimeout(function() { _in.value = \"\"; }, 0); // can't preventDefault on input, so clear it later\n  } else if (e.keyCode == 38) { // up\n    // go up in history if at top or ctrl-up\n    if (e.ctrlKey || caretInFirstLine(_in))\n      hist(true);\n  } else if (e.keyCode == 40) { // down\n    // go down in history if at end or ctrl-down\n    if (e.ctrlKey || caretInLastLine(_in))\n      hist(false);\n  } "+
"else if(e.ctrlKey && e.keyCode == 32) { // ctrl-space\n    tabcomplete();\n    e.cancelBubble = false;\n    e.returnValue = false;\n    return false; }" +
"else if (e.keyCode == 9) { // tab\n    tabcomplete();\n    setTimeout(function() { refocus(); }, 0); // refocus because tab was hit\n  } else { }\n\n  setTimeout(recalculateInputHeight, 0);\n  \n  //return true;\n};\n\nfunction caretInFirstLine(textbox)\n{\n  // IE doesn't support selectionStart/selectionEnd\n  if (textbox.selectionStart == undefined)\n    return true;\n\n  var firstLineBreak = textbox.value.indexOf(\"\\n\");\n  \n  return ((firstLineBreak == -1) || (textbox.selectionStart <= firstLineBreak));\n}\n\nfunction caretInLastLine(textbox)\n{\n  // IE doesn't support selectionStart/selectionEnd\n  if (textbox.selectionEnd == undefined)\n    return true;\n\n  var lastLineBreak = textbox.value.lastIndexOf(\"\\n\");\n  \n  return (textbox.selectionEnd > lastLineBreak);\n}\n\nfunction recalculateInputHeight()\n{\n  var rows = _in.value.split(/\\n/).length\n    + 1 // prevent scrollbar flickering in Mozilla\n    + (window.opera ? 1 : 0); // leave room for scrollbar in Opera\n  \n  if (_in.rows != rows) // without this check, it is impossible to select text in Opera 7.60 or Opera 8.0.\n    _in.rows = rows;\n}\n\nfunction println(s, type)\n{\n  if((s=String(s)))\n  {\n    var newdiv = document.createElement(\"div\");\n    newdiv.appendChild(document.createTextNode(s));\n    newdiv.className = type;\n    _out.appendChild(newdiv);\n    return newdiv;\n  }\n}\n\nfunction printWithRunin(h, s, type)\n{\n  var div = println(s, type);\n  var head = document.createElement(\"strong\");\n  head.appendChild(document.createTextNode(h + \": \"));\n  div.insertBefore(head, div.firstChild);\n}\n\n\nvar shellCommands = \n{\nload : function load(url)\n{\n  var s = _win.document.createElement(\"script\");\n  s.type = \"text/javascript\";\n  s.src = url;\n  _win.document.getElementsByTagName(\"head\")[0].appendChild(s);\n  println(\"Loading \" + url + \"...\", \"message\");\n},\n\nclear : function clear()\n{\n  var CHILDREN_TO_PRESERVE = 3;\n  while (_out.childNodes[CHILDREN_TO_PRESERVE]) \n    _out.removeChild(_out.childNodes[CHILDREN_TO_PRESERVE]);\n},\n\nprint : function print(s) { println(s, \"print\"); },\n\n// the normal function, \"print\", shouldn't return a value\n// (suggested by brendan; later noticed it was a problem when showing others)\npr : function pr(s) \n{ \n  shellCommands.print(s); // need to specify shellCommands so it doesn't try window.print()!\n  return s;\n},\n\nprops : function props(e, onePerLine)\n{\n  if (e === null) {\n    println(\"props called with null argument\", \"error\");\n    return;\n  }\n\n  if (e === undefined) {\n    println(\"props called with undefined argument\", \"error\");\n    return;\n  }\n\n  var ns = [\"Methods\", \"Fields\", \"Unreachables\"];\n  var as = [[], [], []]; // array of (empty) arrays of arrays!\n  var p, j, i; // loop variables, several used multiple times\n\n  var protoLevels = 0;\n\n  for (p = e; p; p = p.__proto__)\n  {\n    for (i=0; i<ns.length; ++i)\n      as[i][protoLevels] = [];\n    ++protoLevels;\n  }\n\n  for(var a in e)\n  {\n    // Shortcoming: doesn't check that VALUES are the same in object and prototype.\n\n    var protoLevel = -1;\n    try\n    {\n      for (p = e; p && (a in p); p = p.__proto__)\n        ++protoLevel;\n    }\n    catch(er) { protoLevel = 0; } // \"in\" operator throws when param to props() is a string\n\n    var type = 1;\n    try\n    {\n      if ((typeof e[a]) == \"function\")\n        type = 0;\n    }\n    catch (er) { type = 2; }\n\n    as[type][protoLevel].push(a);\n  }\n\n  function times(s, n) { return n ? s + times(s, n-1) : \"\"; }\n\n  for (j=0; j<protoLevels; ++j)\n    for (i=0;i<ns.length;++i)\n      if (as[i][j].length) \n        printWithRunin(\n          ns[i] + times(\" of prototype\", j), \n          (onePerLine ? \"\\n\\n\" : \"\") + as[i][j].sort().join(onePerLine ? \"\\n\" : \", \") + (onePerLine ? \"\\n\\n\" : \"\"), \n          \"propList\"\n        );\n},\n\nblink : function blink(node)\n{\n  if (!node)                     throw(\"blink: argument is null or undefined.\");\n  if (node.nodeType == null)     throw(\"blink: argument must be a node.\");\n  if (node.nodeType == 3)        throw(\"blink: argument must not be a text node\");\n  if (node.documentElement)      throw(\"blink: argument must not be the document object\");\n\n  function setOutline(o) { \n    return function() {\n      if (node.style.outline != node.style.bogusProperty) {\n        // browser supports outline (Firefox 1.1 and newer, CSS3, Opera 8).\n        node.style.outline = o;\n      }\n      else if (node.style.MozOutline != node.style.bogusProperty) {\n        // browser supports MozOutline (Firefox 1.0.x and older)\n        node.style.MozOutline = o;\n      }\n      else {\n        // browser only supports border (IE). border is a fallback because it moves things around.\n        node.style.border = o;\n      }\n    }\n  } \n  \n  function focusIt(a) {\n    return function() {\n      a.focus(); \n    }\n  }\n\n  if (node.ownerDocument) {\n    var windowToFocusNow = (node.ownerDocument.defaultView || node.ownerDocument.parentWindow); // Moz vs. IE\n    if (windowToFocusNow)\n      setTimeout(focusIt(windowToFocusNow.top), 0);\n  }\n\n  for(var i=1;i<7;++i)\n    setTimeout(setOutline((i%252)?'3px solid red':'none'), i*100);\n\n  setTimeout(focusIt(window), 800);\n  setTimeout(focusIt(_in), 810);\n},\n\nscope : function scope(sc)\n{\n  if (!sc) sc = {};\n  _scope = sc;\n  println(\"Scope is now \" + sc + \".  If a variable is not found in this scope, window will also be searched.  New variables will still go on window.\", \"message\");\n},\n\nmathHelp : function mathHelp()\n{\n  printWithRunin(\"Math constants\", \"E, LN2, LN10, LOG2E, LOG10E, PI, SQRT1_2, SQRT2\", \"propList\");\n  printWithRunin(\"Math methods\", \"abs, acos, asin, atan, atan2, ceil, cos, exp, floor, log, max, min, pow, random, round, sin, sqrt, tan\", \"propList\");\n},\n\nans : undefined\n};\n\n\nfunction hist(up)\n{\n  // histList[0] = first command entered, [1] = second, etc.\n  // type something, press up --> thing typed is now in \"limbo\"\n  // (last item in histList) and should be reachable by pressing \n  // down again.\n\n  var L = histList.length;\n\n  if (L == 1)\n    return;\n\n  if (up)\n  {\n    if (histPos == L-1)\n    {\n      // Save this entry in case the user hits the down key.\n      histList[histPos] = _in.value;\n    }\n\n    if (histPos > 0)\n    {\n      histPos--;\n      // Use a timeout to prevent up from moving cursor within new text\n      // Set to nothing first for the same reason\n      setTimeout(\n        function() {\n          _in.value = ''; \n          _in.value = histList[histPos];\n          var caretPos = _in.value.length;\n          if (_in.setSelectionRange) \n            _in.setSelectionRange(caretPos, caretPos);\n        },\n        0\n      );\n    }\n  } \n  else // down\n  {\n    if (histPos < L-1)\n    {\n      histPos++;\n      _in.value = histList[histPos];\n    }\n    else if (histPos == L-1)\n    {\n      // Already on the current entry: clear but save\n      if (_in.value)\n      {\n        histList[histPos] = _in.value;\n        ++histPos;\n        _in.value = \"\";\n      }\n    }\n  }\n}\n\nfunction tabcomplete()\n{\n  /*\n   * Working backwards from s[from], find the spot\n   * where this expression starts.  It will scan\n   * until it hits a mismatched ( or a space,\n   * but it skips over quoted strings.\n   * If stopAtDot is true, stop at a '.'\n   */\n  function findbeginning(s, from, stopAtDot)\n  {\n    /*\n     *  Complicated function.\n     *\n     *  Return true if s[i] == q BUT ONLY IF\n     *  s[i-1] is not a backslash.\n     */\n    function equalButNotEscaped(s,i,q)\n    {\n      if(s.charAt(i) != q) // not equal go no further\n        return false;\n\n      if(i==0) // beginning of string\n        return true;\n\n      if(s.charAt(i-1) == '\\\\') // escaped?\n        return false;\n\n      return true;\n    }\n\n    var nparens = 0;\n    var i;\n    for(i=from; i>=0; i--)\n    {\n      if(s.charAt(i) == ' ')\n        break;\n\n      if(stopAtDot && s.charAt(i) == '.')\n        break;\n        \n      if(s.charAt(i) == ')')\n        nparens++;\n      else if(s.charAt(i) == '(')\n        nparens--;\n\n      if(nparens < 0)\n        break;\n\n      // skip quoted strings\n      if(s.charAt(i) == '\\'' || s.charAt(i) == '\\\"')\n      {\n        //dump(\"skipping quoted chars: \");\n        var quot = s.charAt(i);\n        i--;\n        while(i >= 0 && !equalButNotEscaped(s,i,quot)) {\n          //dump(s.charAt(i));\n          i--;\n        }\n        //dump(\"\\n\");\n      }\n    }\n    return i;\n  }\n\n  // XXX should be used more consistently (instead of using selectionStart/selectionEnd throughout code)\n  // XXX doesn't work in IE, even though it contains IE-specific code\n  function getcaretpos(inp)\n  {\n    if(inp.selectionEnd != null)\n      return inp.selectionEnd;\n      \n    var range = document.selection.createRange();\n    var isCollapsed = range.compareEndPoints(\"StartToEnd\", range) == 0;\n    if (!isCollapsed)\n        range.collapse(false);\n    var b = range.getBookmark();\n    return b.charCodeAt(2) - 2;  \n  }\n\n  function setselectionto(inp,pos)\n  {\n    if(inp.selectionStart) {\n      inp.selectionStart = inp.selectionEnd = pos;\n    }\n    else if(inp.createTextRange) {\n      var docrange = _win.Shell.document.selection.createRange();\n      var inprange = inp.createTextRange();\n      inprange.move('character',pos);\n      inprange.select();\n    }\n    else { // err...\n    /*\n      inp.select();\n      if(_win.Shell.document.getSelection())\n        _win.Shell.document.getSelection() = \"\";\n        */\n    }\n  }\n    // get position of cursor within the input box\n    var caret = getcaretpos(_in);\n\n    if(caret) {\n      //dump(\"----\\n\");\n      var dotpos, spacepos, complete, obj;\n      //dump(\"caret pos: \" + caret + \"\\n\");\n      // see if there's a dot before here\n      dotpos = findbeginning(_in.value, caret-1, true);\n      //dump(\"dot pos: \" + dotpos + \"\\n\");\n      if(dotpos == -1 || _in.value.charAt(dotpos) != '.') {\n        dotpos = caret;\n//dump(\"changed dot pos: \" + dotpos + \"\\n\");\n      }\n\n      // look backwards for a non-variable-name character\n      spacepos = findbeginning(_in.value, dotpos-1, false);\n      //dump(\"space pos: \" + spacepos + \"\\n\");\n      // get the object we're trying to complete on\n      if(spacepos == dotpos || spacepos+1 == dotpos || dotpos == caret)\n      {\n        // try completing function args\n        if(_in.value.charAt(dotpos) == '(' ||\n (_in.value.charAt(spacepos) == '(' && (spacepos+1) == dotpos))\n        {\n          var fn,fname;\n  var from = (_in.value.charAt(dotpos) == '(') ? dotpos : spacepos;\n          spacepos = findbeginning(_in.value, from-1, false);\n\n          fname = _in.value.substr(spacepos+1,from-(spacepos+1));\n  //dump(\"fname: \" + fname + \"\\n\");\n          try {\n            with(_win.Shell._scope)\n              with(_win)\n                with(Shell.shellCommands)\n                  fn = eval(fname);\n          }\n          catch(er) {\n            //dump('fn is not a valid object\\n');\n            return;\n          }\n          if(fn == undefined) {\n             //dump('fn is undefined');\n             return;\n          }\n          if(fn instanceof Function)\n          {\n            // Print function definition, including argument names, but not function body\n            if(!fn.toString().match(/function .+?\\(\\) +\\{\\n +\\[native code\\]\\n\\}/))\n              println(fn.toString().match(/function .+?\\(.*?\\)/), \"tabcomplete\");\n          }\n\n          return;\n        }\n        else\n          obj = _win;\n      }\n      else\n      {\n        var objname = _in.value.substr(spacepos+1,dotpos-(spacepos+1));\n        //dump(\"objname: |\" + objname + \"|\\n\");\n        try {\n          with(_win.Shell._scope)\n            with(_win)\n                obj = eval(objname);\n        }\n        catch(er) {\n          printError(er); \n          return;\n        }\n        if(obj == undefined) {\n          // sometimes this is tabcomplete's fault, so don't print it :(\n          // e.g. completing from \"print(document.getElements\"\n          // println(\"Can't complete from null or undefined expression \" + objname, \"error\");\n          return;\n        }\n      }\n      //dump(\"obj: \" + obj + \"\\n\");\n      // get the thing we're trying to complete\n      if(dotpos == caret)\n      {\n        if(spacepos+1 == dotpos || spacepos == dotpos)\n        {\n          // nothing to complete\n          //dump(\"nothing to complete\\n\");\n          return;\n        }\n\n        complete = _in.value.substr(spacepos+1,dotpos-(spacepos+1));\n      }\n      else {\n        complete = _in.value.substr(dotpos+1,caret-(dotpos+1));\n      }\n      //dump(\"complete: \" + complete + \"\\n\");\n      // ok, now look at all the props/methods of this obj\n      // and find ones starting with 'complete'\n      var matches = [];\n      var bestmatch = null;\n      for(var a in obj)\n      {\n        //a = a.toString();\n        //XXX: making it lowercase could help some cases,\n        // but screws up my general logic.\n        if(a.substr(0,complete.length) == complete) {\n          matches.push(a);\n          ////dump(\"match: \" + a + \"\\n\");\n          // if no best match, this is the best match\n          if(bestmatch == null)\n          {\n            bestmatch = a;\n          }\n          else {\n            // the best match is the longest common string\n            function min(a,b){ return ((a<b)?a:b); }\n            var i;\n            for(i=0; i< min(bestmatch.length, a.length); i++)\n            {\n              if(bestmatch.charAt(i) != a.charAt(i))\n                break;\n            }\n            bestmatch = bestmatch.substr(0,i);\n            ////dump(\"bestmatch len: \" + i + \"\\n\");\n          }\n          ////dump(\"bestmatch: \" + bestmatch + \"\\n\");\n        }\n      }\n      bestmatch = (bestmatch || \"\");\n      ////dump(\"matches: \" + matches + \"\\n\");\n      var objAndComplete = (objname || obj) + \".\" + bestmatch;\n      //dump(\"matches.length: \" + matches.length + \", tooManyMatches: \" + tooManyMatches + \", objAndComplete: \" + objAndComplete + \"\\n\");\n      if(matches.length > 1 && (tooManyMatches == objAndComplete || matches.length <= 10)) {\n\n        printWithRunin(\"Matches: \", matches.join(', '), \"tabcomplete\");\n        tooManyMatches = null;\n      }\n      else if(matches.length > 10)\n      {\n        println(matches.length + \" matches.  Press tab or ctrl-space again to see them all\", \"tabcomplete\");\n        tooManyMatches = objAndComplete;\n      }\n      else {\n        tooManyMatches = null;\n      }\n      if(bestmatch != \"\")\n      {\n        var sstart;\n        if(dotpos == caret) {\n          sstart = spacepos+1;\n        }\n        else {\n          sstart = dotpos+1;\n        }\n        _in.value = _in.value.substr(0, sstart)\n                  + bestmatch\n                  + _in.value.substr(caret);\n        setselectionto(_in,caret + (bestmatch.length - complete.length));\n      }\n    }\n}\n\nfunction printQuestion(q)\n{\n  println(q, \"input\");\n}\n\nfunction printAnswer(a)\n{\n  if (a !== undefined) {\n    println(a, \"normalOutput\");\n    shellCommands.ans = a;\n  }\n}\n\nfunction printError(er)\n{ \n  var lineNumberString;\n\n  lastError = er; // for debugging the shell\n  if (er.name)\n  {\n    // lineNumberString should not be \"\", to avoid a very wacky bug in IE 6.\n    lineNumberString = (er.lineNumber != undefined) ? (\" on line \" + er.lineNumber + \": \") : \": \";\n    println(er.name + lineNumberString + er.message, \"error\"); // Because IE doesn't have error.toString.\n  }\n  else\n    println(er, \"error\"); // Because security errors in Moz /only/ have toString.\n}\n\nfunction go(s)\n{\n  _in.value = question = s ? s : _in.value;\n\n  if (question == \"\")\n    return;\n\n  histList[histList.length-1] = question;\n  histList[histList.length] = \"\";\n  histPos = histList.length - 1;\n  \n  // Unfortunately, this has to happen *before* the JavaScript is run, so that \n  // print() output will go in the right place.\n  _in.value='';\n  recalculateInputHeight();\n  printQuestion(question);\n\n  if (_win.closed) {\n    printError(\"Target window has been closed.\");\n    return;\n  }\n  \n  try { (\"Shell\" in _win) }\n  catch(er) {\n    printError(\"The JavaScript Shell cannot access variables in the target window.  The most likely reason is that the target window now has a different page loaded and that page has a different hostname than the original page.\");\n    return;\n  }\n\n  if (!(\"Shell\" in _win))\n    initTarget(); // silent\n\n  // Evaluate Shell.question using _win's eval (this is why eval isn't in the |with|, IIRC).\n  _win.location.href = \"javascript:try{ Shell.printAnswer(eval('with(Shell._scope) with(Shell.shellCommands) {' + Shell.question + String.fromCharCode(10) + '}')); } catch(er) { Shell.printError(er); }; setTimeout(Shell.refocus, 0); void 0\";\n}\n\n</script>\n\n<!-- for http://ted.mielczarek.org/code/mozilla/extensiondev/ -->\n<script type=\"text/javascript\" src=\"chrome://extensiondev/content/rdfhistory.js\"></script>\n<script type=\"text/javascript\" src=\"chrome://extensiondev/content/chromeShellExtras.js\"></script>\n\n<style type=\"text/css\">\nbody { background: white; color: black; }\n\n#output { white-space: pre; white-space: -moz-pre-wrap; } /* Preserve line breaks, but wrap too if browser supports it */\nh3 { margin-top: 0; margin-bottom: 0em; }\nh3 + div { margin: 0; }\n\nform { margin: 0; padding: 0; }\n#input { width: 100%; border: none; padding: 0; overflow: auto; }\n\n.input { color: blue; background: white; font: inherit; font-weight: bold; margin-top: .5em; /* background: #E6E6FF; */ }\n.normalOutput { color: black; background: white; }\n.print { color: brown; background: white; }\n.error { color: red; background: white; }\n.propList { color: green; background: white; }\n.message { color: green; background: white; }\n.tabcomplete { color: purple; background: white; }\n</style>\n</head>\n\n<body onload=\"init()\">\n\n<div id=\"output\"><h3>JavaScript Shell 1.4</h3><h4>Modified by <a href=\"http://blog.monstuff.com\">Julien Couvreur</a> to work in IE.</h4><div>Features: autocompletion of property names with Tab and Ctrl-Space, multiline input with Shift+Enter, input history with (Ctrl+) Up/Down, <a accesskey=\"M\" href=\"javascript:go('scope(Math); mathHelp();');\" title=\"Accesskey: M\">Math</a>, <a accesskey=\"H\" href=\"http://www.squarefree.com/shell/?ignoreReferrerFrom=shell1.4\"  title=\"Accesskey: H\">help</a></div><div>Values and functions: ans, print(string), <a accesskey=\"P\" href=\"javascript:go('props(ans)')\" title=\"Accesskey: P\">props(object)</a>, <a accesskey=\"B\" href=\"javascript:go('blink(ans)')\" title=\"Accesskey: B\">blink(node)</a>, <a accesskey=\"C\" href=\"javascript:go('clear()')\" title=\"Accesskey: C\">clear()</a>, load(scriptURL), scope(object)</div></div>\n\n<div><textarea id=\"input\" class=\"input\" wrap=\"off\" onkeydown=\"inputKeydown(event)\" rows=\"1\"></textarea></div>\n\n</body>\n\n</html>");document.close();}
