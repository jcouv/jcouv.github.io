/**************************************** Overview ***************************************************/
// An option tree is a tree choices, where each choice has multiple options.
// The current selected path in the option tree can be represented to the user, and interacted with.
// Thru interaction, the selected path is modified.
//
// The option tree stores some additional state, on top of the selected option for each choice: variables.
// Variables are state which is scoped and applicable for all the sub-options under the option that it is defined on.
//
// Each leaf option (which does not have sub-option) has a representation.
// This representation is a sentence, and is composed of a sequence of segments.
//
// One way to look at the object model:
// OptionTree -> Choice [with Variables] -> Options (-> more Choices and Options...)* -> Sentence -> Segments


/**************************************** TODO ***************************************************/


/**************************************** OptionTree ***************************************************/
// OptionTree is the entry point for this library.
// The OptionTree should offer all the APIs you need, for all the basic scenarios.
//
// You start by creating an OptionTree from an XML declaration
// Then you render the OptionTree as a sentence, which is a DOM node
// Then you query the current state of the OptionTree (options and variables)



// onValueSet notifies you of changes made by the user. 
// Note that in many cases, more state is likely to have changed than this one variable or option.
// void onValueSet(name, value)
var OptionTree = function(xmlDoc, onValueSet) 
{
    var rootChoice = new Choice(xmlDoc.documentElement);  
    
    // returns a property bag with all the current state of the OptionTree
    this.dumpState = function() 
    {
        var propBag = new Object();
        return rootChoice.dumpState(propBag);   
    }
    
    // programmatically update the state of the OptionTree    
    this.setValue = function(name, value) 
    {
        rootChoice.setValue(name, value);
        
        if (onValueSet != null && typeof(onValueSet) == "function") {
            onValueSet(name, value);
        }
    }
    
    this.getSentence = function() 
    {
        return rootChoice.getSentence();
    }
    
    this.getVariableType = function(name) 
    {
        return rootChoice.getVariableType(name);
    }

    // render the current active sentence to a DOM node in your page
    this.render = function(nodeID, updatedVarName) 
    {
        var self = this; // capture instance for use in callback
        var doc = window.document;
        var newNode = doc.createElement("span");
        
        // allows a segment to set a value and, optionally, re-render the whole tree
        var segmentCallback = function(variableName, variableValue, doRender) 
        {
            self.setValue(variableName, variableValue);
            if (doRender) {
                self.render(nodeID, variableName);
            }
        }

        // render each segment
        var segments = this.getSentence().getSegments();
        var focusStack = new Array();
        for (var i = 0; i < segments.length; i++) 
        {
            var focusFunc = segments[i].render(newNode, this, segmentCallback);
            focusStack.push(focusFunc);
        }
        
        // display the DOM tree that was built
        var destNode = doc.getElementById(nodeID);
        if (destNode.hasChildNodes()) {
            destNode.replaceChild(newNode, destNode.firstChild);
        } else {
            destNode.appendChild(newNode);
        }
        
        // set focus on the proper element, by giving each segment a chance
        for (var i = 0; i < focusStack.length; i++) {
            var focusFunc = focusStack[i];
            if (focusFunc != null && typeof(focusFunc) == "function") 
            {
                focusFunc(updatedVarName);
            }
        }
        
        // avoid circular memory references across JS heap and DOM
        newNode = null;
        destNode = null;
        focusStack = null;
    }
         
    // print the current state of the OptionTree into the given div (for debugging purpose)
    this.printState = function(divID) 
    {
        var variables = this.dumpState();
        var outputDiv = window.document.getElementById(divID);
        
        if (outputDiv.hasChildNodes()) {
            outputDiv.removeChild(outputDiv.firstChild);
        }
        
        var outputText = "{ ";
        var first = true;
        
        for (var variableName in variables) 
        {
            if (first) { first = false; } else { outputText += " , "; }
            outputText += variableName + " : '" + variables[variableName] + "'";
        } 
        
        outputText += " }";
        
        outputDiv.appendChild(document.createTextNode(outputText));
    }   
    
    var InitInputRenderMap = function() 
    {
        // The InputRenderMap is the main extensibility point for the TextWidget
        // Two types of input segment are supported by default (static and text).
        // You can add your own (pick a date from a calendar, location from a map, contact from a list, etc.)
        // 
        // For example, you could render and input dates and times in good english, based on the http://www.datejs.com/ JS library.
        var ret = new Object();
        ret["static"] = renderStaticInputSegment;
        ret["text"] = renderTextInputSegment;
        
        return ret;
    }
    
    this.inputRenderMap = InitInputRenderMap();
}

/**************************************** Sentence ***************************************************/
// A sentence is a list of segments. Each segment is either text, clickable text or input.
// When pushed, clickable segments change the state of the tree, by setting a specified variable to a certain value.
//
// Three kinds of segments are supported:
// -text
// -a 
// -input (extensible)

var Sentence = function(xmlNode) 
{
    var segments = createSegments(xmlNode);
    
    this.getSegments = function() 
    {
        return segments;   
    }

    function createSegments(xmlNode) 
    {
        var segments = new Array();
        for (var i = 0; i < xmlNode.childNodes.length; i++) 
        {
            var child = xmlNode.childNodes[i];

            switch (child.nodeName) {
                case "#text":
                    segments.push(new TextSegment(child));
                    break;
                case "a":
                    segments.push(new ClickableSegment(child));
                    break;
                case "input":
                    segments.push(new InputSegment(child));
                    break;
                default:
                    throw "Unsupported sentence format";
                    break;
            }
        }
        
        return segments;
    }
}


/**************************************** Segment ***************************************************/
// There are three kinds of segments supported at this point:
// -TextSegment: these are not interactive.
// -ClickableSegment: the only interaction allowed is clicking. It has a pre-defined action associated with it.
// -InputSegment: these are for the rest of the interactions, and can be extended with new types of input.
// 
// Segments should have the following interface:
// -Segment.type
// -Segment.render(containerNode, optionTree, segmentCallback) -> focusCallback

/**************************************** TextSegment ***************************************************/
var TextSegment = function(textNode) 
{
    if (textNode.nodeType != 3) 
    {
        throw "A Segment object can only be created using a text node";
    }
    
    this.type = "TextSegment";
    var textContent = textNode.nodeValue;

    this.render = function(containerNode, optionTree, segmentCallback) 
    {
        var doc = window.document;
        
        var textNode = doc.createTextNode(textContent);
        containerNode.appendChild(textNode);    

        // avoid circular memory references across JS heap and DOM
        textNode = null;
        
        return null;
    }
}


/**************************************** ClickableSegment ***************************************************/
var ClickableSegment = function(anchorNode) 
{
    this.type = "ClickableSegment";
    var textContent = anchorNode.firstChild.nodeValue;

    var variableNameVal = anchorNode.getAttribute("onclick");
    if (variableNameVal == null || variableNameVal.length == 0) 
    {
        throw "Invalid format for 'a' element in sentence node";
    }
    
    var splitVar = variableNameVal.split("=");
    if (splitVar.length != 2) 
    {
        throw "Invalid format for 'onclick' attribute on 'a' element in sentence node";    
    }

    // name of the variable to set when segment is clicked    
    var variableName = splitVar[0];
    // value that gets set on that variable when segment is clicked
    var variableValue = splitVar[1];

    this.setFocus = function(varName) 
    {
        if (varName == variableName) 
        {
            // TODO
            return true;
        }
    }

    // override this to customize rendering
    // void segmentCallback(varName, varValue)
    this.render = function(containerNode, optionTree, segmentCallback) 
    {
        var doc = window.document;
        var self = this; // keep it for callback function 
        
        var textNode = doc.createTextNode(textContent);
        var linkNode = doc.createElement("a");
        
        linkNode.setAttribute("href", "");
        linkNode.appendChild(textNode);
        linkNode.onclick = 
            function() { 
                segmentCallback(variableName, variableValue, true); 
                return false; 
            }
        containerNode.appendChild(linkNode);
        
        // avoid circular memory references across JS heap and DOM
        textNode = null;
        
        var setFocus = function(updatedVarName) {
            if (updatedVarName == variableName) {
                linkNode.focus();
            }
            
            // avoid circular memory references across JS heap and DOM
            linkNode = null; 
        }
        
        return setFocus;
    }
}

/**************************************** InputSegment ***************************************************/
var InputSegment = function(inputNode) 
{
    this.type = "InputSegment";
    // name
    this.inputName = inputNode.getAttribute("name");
    if (this.inputName == null || this.inputName.length == 0) 
    {
        throw "Input element needs a name attribute";
    }
    
    this.setFocus = function(varName) 
    {
        if (varName == this.inputName) 
        {
            // TODO
            return true;
        }
    }
    
    // override this to customize rendering
    // void segmentCallback(varName, varValue)
    this.render = function(containerNode, optionTree, segmentCallback) 
    {
        var variableType = optionTree.getVariableType(this.inputName);
        
        var renderMethod = optionTree.inputRenderMap[variableType];
        if (typeof(renderMethod) == "function") 
        {
            return renderMethod(containerNode, this, optionTree, segmentCallback);
        }
        else 
        {
            throw "This InputSegment uses an unsupported type";
        }
    }
}

/**************************************** InputRenderMap ***************************************************/
// The InputRenderMap let's you extend the types of InputSegment supported.
//
// By default, two input types are provided:
// -static: this is a non-interactive but programmable segment. It simply echos a value from the current OptionTree.
// -int: this is an integer value. The user can change the value represented by this segment.
//
// New input types can be added by implementing and registering a function of type:
//  focusCallback function(containerNode, inputSegment, optionTree, segmentCallback) 

// renders a non-clickable text element with the variable value
function renderStaticInputSegment(containerNode, inputSegment, optionTree, segmentCallback) 
{
    var doc = window.document;
    var value = optionTree.dumpState()[inputSegment.inputName];
    
    var textNode = doc.createTextNode(value);
    containerNode.appendChild(textNode);    
    
    // avoid circular memory references across JS heap and DOM
    textNode = null;
    
    return null;
}

// renders a clickable then editable element with the variable value
function renderTextInputSegment(containerNode, inputSegment, optionTree, segmentCallback)
{
    var doc = window.document;
    var value = optionTree.dumpState()[inputSegment.inputName];

    var handleBlanks = function(value) { return (value == "") ? "_" : value; }

    var textNode = doc.createTextNode(handleBlanks(value));
    var linkNode = doc.createElement("a");

    linkNode.setAttribute("href", "");
    linkNode.appendChild(textNode);
    linkNode.onclick = 
        function(e) { 
            var e = e ? e : window.event;
            var element = e.target ? e.target : e.srcElement;
            
            //alert("source element: " + element.nodeName);
            // TODO: this should be done inline, instead of using a prompt
            var newValue = prompt("Pick a new value", value);
            
            if (newValue == null) 
            { 
                // no change
                return false; 
            }
            
            textNode.nodeValue = handleBlanks(newValue); // update UI
            value = newValue; // update local context
            segmentCallback(inputSegment.inputName, newValue, false);

            return false; 
        }

    containerNode.appendChild(linkNode);

    // avoid circular memory references across JS heap and DOM
    doc = null;
    linkNode = null;
    //textNode = null;
    
    return null;
}

/**************************************** Choice ***************************************************/
/*
A choice gives an alternative between multiple options. Each option has a name.
The selected value of the choice is the name of one of the options.
A choice can also hold additional variables. 

The state of a choice is the combination of:
choiceName->choiceValue, (variableName->variableValue) for all variables, and the state of the selected option.

*/
var Choice = function(xmlNode) 
{
    var choiceName;
    var choiceValue;
    var subOptions;
    var variables;
    initChoice();
        
    this.dumpState = function(propBag) 
    {
        // record the local choice
        propBag[choiceName] = choiceValue;
        
        // record the local variables
        for (var variableName in variables) 
        {
            var variable = variables[variableName];
            variable.dumpState(propBag);
        }
        
        // recurse into sub-options
        var subOption = subOptions[choiceValue];
        return subOption.dumpState(propBag);
    }
    
    this.getVariableType = function(name) 
    {
        // check if the variable exists at this level
        var variable = variables[name];
        if (variable != null) 
        {
            return variable.getType();
        }
        
        // otherwise, try on the selected sub-option
        var subOption = subOptions[choiceValue];
        if (subOption != null) 
        {
            return subOption.getVariableType(name);
        }
    }
    
    this.setValue = function(name, value) 
    {
        if (name == choiceName) 
        {
            if (validateChoice(value)) {
                choiceValue = value;
                return;    
            }
            throw "'" + value + "' is not a valid value for this choice"; 
        } 
        
        // otherwise, check the variables
        var variable = variables[name];
        if (variable!= null) 
        {
            variable.setValue(value);
            return;
        }
        
        // otherwise, try on the appropriate sub-option
        var subOption = subOptions[choiceValue];
        if (subOption != null) 
        {
            subOption.setValue(name, value);
            return;
        }
        
        // bomb
        throw "Could not find where to set choice or variable '" + name + "'";
    }
 
    this.getSentence = function() 
    {
        var subOption = subOptions[choiceValue];
        if (subOption != null) 
        {
            return subOption.getSentence();
        }
    }
 
    function validateChoice(value) 
    {
        return (subOptions[value] != null);            
    }
    
    function initChoice() 
    {   
        if (xmlNode.nodeName != "choice") 
        {
            throw "You can only construct a Choice object with a choice xml node";
        }
     
        // initialize the choice name
        choiceName = xmlNode.getAttribute("name");
        if (choiceName == null || choiceName.length == 0) {
            throw "A choice node needs a name attribute";
        }
        
        // initialize the main choice value
        choiceValue = xmlNode.getAttribute("default");
        if (choiceValue == null) {
            // todo: we could pick a default value at random
            throw "A choice node needs to have default property";
        }
    
        subOptions = listSubOptions();
        variables = listVariables();
        
        if (!validateChoice(choiceValue)) 
        {
            throw "The default value for the choice node '" + choiceName + "' is not a valid option";
        }
    }
    
    function listSubOptions() {
        var childs = xmlNode.childNodes;
        var childOptions = new Object();
        
        for (var i = 0; i < childs.length; i++) {
            var child = childs[i];
            if (child.nodeName == "option") {
                var value = child.getAttribute("value");
                // todo: check that value attribute exists
                // if (child.getAttribute("value")
                childOptions[value] = new Option(child);
            }
        }
    
        if (childOptions.length == 0) {
            throw "Choices should have options child nodes";
        }    
        return childOptions;
    }    

    function listVariables() 
    {
        var childs = xmlNode.childNodes;
        var childVariables  = new Object();
        
        for (var i = 0; i < childs.length; i++) {
            var child = childs[i];
            if (child.nodeName == "variable") {
                var variable = new Variable(child);
                childVariables[variable.getName()] = variable;
            }
        }
        
        return childVariables;
    }
}



/**************************************** Option ***************************************************/
// Options can either have a sub-Choice or be terminal (leaf)
// Leaf options have a Sentence object which can represent them as a UI widget.
var Option = function(xmlNode) 
{
    // can either hold a sentence or a choice
    var subChoice;
    var sentence;
    initOption();
    
    function initOption() 
    {
        subChoice = getSubChoice();
        sentence = loadSentence();
        
        if (subChoice != null && sentence != null) 
        {
            throw "An option should either have a sub-choice or a sentence, but not both.";
        }
    }
    
    function loadSentence() {
        var childs = xmlNode.childNodes;
        var childSentences = new Array();
        
        for (var i = 0; i < childs.length; i++) {
            var child = childs[i];
            if (child.nodeName == "sentence") {
                childSentences.push(new Sentence(child));
            }
        }
    
        if (childSentences.length == 0) {
            return null;
        }
        if (childSentences.length == 1) {
            return childSentences[0];
        }
        
        throw "An option should have a maximum of one sentence child node";
    }
    
    function getSubChoice() {
        var childs = xmlNode.childNodes;
        var childChoices = new Array();
        
        for (var i = 0; i < childs.length; i++) {
            var child = childs[i];
            if (child.nodeName == "choice") {
                childChoices.push(new Choice(child));
            }
        }
    
        if (childChoices.length == 0) {
            return null;
        }
        if (childChoices.length == 1) {
            return childChoices[0];
        }
        
        throw "An option should have a maximum of one choice child node";
    }    
  
    
    this.dumpState = function (propBag) 
    {
        if (subChoice != null) 
        {
            return subChoice.dumpState(propBag);
        }
        
        return propBag;
    }

    this.setValue = function (name, value) 
    {
        // set the value on the right sub choice
        if (subChoice != null) 
        {
            subChoice.setValue(name, value);
            return;
        }
        
        // if no sub choice left, then this name is not valid
        throw "The value for '"+ name +"' is not valid in the current state";
    }
    
    this.getVariableType = function(name) 
    {
        if (subChoice != null) 
        {
            return subChoice.getVariableType(name);
        }
        
        // if no sub choice left, then this variable name is not valid
        throw "The variable '"+ name +"' does not exist in the current state";
    }
    
    this.getSentence = function() 
    {
        if (sentence != null) 
        {
            return sentence;
        }
        if (subChoice != null) 
        {
            return subChoice.getSentence();
        }
    }
}



/**************************************** Variable ***************************************************/
// A Choice not only knows which one of its Options is selected.
// It can also hold Variables.
// Variables can be modified by the user thru interaction within the selected Option selection.
var Variable = function(xmlNode) 
{
    var variableName;
    var variableValue;
    var variableType;
    
    initVariable(xmlNode);
    
    this.getName = function() { return variableName; }
    this.setValue = function(value) { variableValue = value; }
    
    this.getType = function() { return variableType; }
    
    this.dumpState = function(propBag) 
    {
        propBag[variableName] = variableValue;
        return propBag;
    }
    
    function initVariable() 
    {
        // initialize the variable name
        variableName = xmlNode.getAttribute("name");
        if (variableName== null || variableName.length == 0) {
            throw "A variable node needs a name attribute";
        }
        
        // initialize the variable value
        variableValue = xmlNode.getAttribute("default");
        if (variableValue == null) {
            throw "A variable node needs to have default value.";
        }
        
        // intialize the variable type
        // variableType = static renders the value as text
        // variableType = int renders the value as a link which allows editing the int
        variableType = xmlNode.getAttribute("type");
        if (variableType == null || variableType.length == 0) 
        {
            variableType = "static";
        }
    }
}


/**************************************** XMLParser ***************************************************/

var XMLParser = new Object();
XMLParser.loadString = function(str) {
    
    // TODO: fix bug with multiple whitespaces in Firefox
    if (typeof DOMParser != "undefined") {
        var parser = new DOMParser();
        return parser.parseFromString(str, "application/xml");
    }
	
	// IE
    if (typeof ActiveXObject != "undefined") {
        var d = new ActiveXObject("MSXML.DomDocument");
        d.preserveWhiteSpace = true;
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


XMLParser.listNodes = function(parent, name, ns) {
    // deal with the difference between IE and FF when it comes to elements with a namespace
    if (!parent.getElementsByTagNameNS && ns) {
        return parent.getElementsByTagName(ns + ':' + name);
    } else {
        return parent.getElementsByTagName(name)
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

