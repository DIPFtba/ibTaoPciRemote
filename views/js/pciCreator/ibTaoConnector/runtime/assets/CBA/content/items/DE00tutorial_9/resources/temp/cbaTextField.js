
/*
 * ------------------------------------------------------------------------------------------------------------------------
 * Javascript extension for CBA TextFields
 * ------------------------------------------------------------------------------------------------------------------------
 */

var glbXlinkNamespace = 'http://www.w3.org/1999/xlink';
var svgNs = "http://www.w3.org/2000/svg";
var xlink = "xlink:href";
var svgweb = getSVGObject();
var vars = null;
var glbDEBUG = false;

// window.onerror = errorHandling;

if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(elt /* , from */)
  {
    var len = this.length;
    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}

function variables()
{
    this.cbaTextFieldId = null;
    this.glbSvgDoc=null;
    this.glbSvgRootElement = null;
    this.glbSvgNamespace = 'http://www.w3.org/2000/svg';
    
    this.glbCbaNamespace = 'http://cba.softcon.de/schemas/extensions';
    this.glbCbaTextBlock = 'TextBlock';
    this.glbCbaTextBlockFragment = 'TextBlockFragment';
    this.glbCbaEmbeddedReferenceContainer = 'EmbeddedReferenceContainer';
    this.glbCbaEmbeddedReference = 'EmbeddedReference';
    this.glbCbaTextField = 'TextField';
    this.glbCbaTextParagraph = 'TextParagraph';
    this.glbCbaEmbeddedImage = 'EmbeddedImage';
    this.glbCbaTextLine = 'TextLine';
    this.glbCbaTextFragment = 'TextFragment';
    
    this.glbSVGTable = null;
    this.glbLineJustificationSpace = new Array();
    
    this.glbEmbeddedReferenceArray = new Array();
    this.glbTextBlockArray = new Array();
    
    // counter
    this.charCounter = 0;
    this.glbLineCounter = 0;
    this.glbLineTspanCounter = 0;
    this.glbLineTspanStartY = 0;
    this.glbLineDeltaY = 0;
    this.glbParagraphCounter = 0;
    this.glbParagraphFragmentCounter = 0;
    this.glbFragmentTspanCounter = 0;
    
    this.glbCurrentLineWidth = 0;
    this.glbCurrentNettoWidth = 0;
    this.glbCurrentBulletIndentation = 0;
    this.glbCurrentBulletLength = 0;
    this.glbSelecting = false;
    this.glbQuicksort = new QuickSort();
    this.glbNonDblclickHighlightable = " \t\n\r.,;!?";
    this.glbTextSelectionEnabled = true;
    this.glbIsTableCellProvider = false;
    this.glbImagePosStartY = -1;
    this.glbImagePosEndY = -1;
    this.glbLastImageIndentation = 0;
    this.glbTextDirection = "ltr";
    
    //this.glbSaveSelectedText = true;
    
    this.cbaTextFieldList = null;
    this.isJustify = true;
    this.currentSelectionEnd = null;
    // this.stopSelection = false;
    this.glbCurrentSelectionRange = null;
    
    this.svgTspanTemplate = null;
    this.justificationArray = new Array();
    this.previousLineOffset = 0;
    this.displayingLinkCursor = false;
    this.linkCursorShape = null;
    this.showLink = false;
    
    this.savedText = null;
    
    this.tfContainerId =  null;
    this.bgContainerId =  null;
    this.imgContainerId =  null;
    
    this.textContainer = null;
    
    this.glbTspanCounter = 0;
    this.glbTspanY = 0;
    
    this.clickAction = null;
    
    this.glbDebugMode = false;
    this.doubleClickInProgress = false;
    
    this.selectionFromOutside = false; // is set to false at the first mouse move event
    this.selectionStartedOutside = false;
    this.isNewSelektion = false;
    
    this.selectionBlocked = false;
    
    this.mouseOverNorth = false;
    this.mouseOverSouth = false;

    this.mouseOverWest = false;
    this.mouseOverEast = false;
    
    this.selectionEntryFound = false;
    
    this.mouseOutLeft = false;
    this.mouseOutRight = false;
    this.mouseOutTop = false;
    this.mouseOutBottom = false;
    
    this.mouseMovedOut = false;
    
    this.mouseMoveEventCounter = 0;
    
    this.cbaTextFieldWidth = 0;
    this.cbaTextFieldHeight = 0;
    
    this.cbaTextFieldWidthSelectionValue = 0;
    this.cbaTextFieldHeightSelectionValue = 0;
    
    this.selectionId = null;
    this.highlightColor = null;
    this.isRTLDirection = false;
}


function resetFields()
{
    vars.previousLineOffset = 0;
    vars.glbTspanCounter = 0;
    vars.glbTspanY = 0;
    
    /*
     * vars.charCounter = 0; vars.glbLineCounter = 0; vars.glbLineTspanCounter =
     * 0; vars.glbParagraphCounter = 0; vars.glbParagraphFragmentCounter = 0;
     * vars.glbFragmentTspanCounter = 0;
     * 
     * vars.glbCurrentLineWidth = 0; vars.glbCurrentNettoWidth = 0;
     * vars.glbCurrentBulletIndentation = 0; vars.glbCurrentBulletLength = 0;
     * vars.glbSelecting = false; vars.glbTextSelectionEnabled = true;
     * vars.glbIsTableCellProvider = false; vars.glbImagePosStartY = -1;
     * vars.glbImagePosEndY = -1; vars.glbLastImageIndentation = 0;
     */
}


function showContextMenu( showContextMenu )
{
 if (! showContextMenu) document.oncontextmenu = new Function( 'return false' );
}

/*
 * initSVG called onload event.
 */
function initSVG(evt)
{
    // var startTime = new Date().getTime();
        
    if(vars == null)
    {
        vars = new variables();
        if (evt != null && evt != 'undefined')
        {
           vars.glbSvgDoc = evt.target.ownerDocument;
           vars.glbSvgRootElement = evt.target.ownerDocument.rootElement;
        }
        else
        {
           vars.glbSvgDoc = document;
           vars.glbSvgRootElement = document.getElementsByTagNameNS(vars.glbSvgNamespace,'svg')[0];
        }
        
        vars.svgTspanTemplate = vars.glbSvgDoc.createElementNS(vars.glbSvgNamespace, 'tspan');
        
        var cbaTextFieldList = vars.glbSvgRootElement.getElementsByTagNameNS(vars.glbCbaNamespace, vars.glbCbaTextField);
        var cbaTextfield = cbaTextFieldList.item(0);
        vars.cbaTextFieldId = cbaTextfield.getAttribute("id");
        
        
        vars.cbaTextFieldWidth = cbaTextfield.getAttribute("width");
        vars.cbaTextFieldHeight = cbaTextfield.getAttribute("height");
        
        vars.cbaTextFieldWidthSelectionValue = vars.cbaTextFieldWidth -2;
        vars.cbaTextFieldHeightSelectionValue = vars.cbaTextFieldHeight -2;
        
        /*
         * if(!isVisiblePage(vars.cbaTextFieldId)) { return; }
         */
        
        vars.tfContainerId = cbaTextfield.getAttribute("container-id");
        vars.textContainer = vars.glbSvgDoc.getElementById(vars.tfContainerId);
        vars.bgContainerId = cbaTextfield.getAttribute("background-container-id");
        vars.imgContainerId = cbaTextfield.getAttribute("image-container-id");
        
        //processTextBlocks();
        processReferences();
        processTextFields(); 
        
        //resetSelectLock();
        
        applyChromeAlignmentPatch();
        vars.glbSVGTable.initializeSVGResultForXYList();
        orderSVGResults4RTLDirection();
        
        // HMA: vars.charCounter only set after initializeSVGResultForXYList
        // so textblocks can only be normalized here
        processTextBlocks();

        //printSvgResultForXYList();
        
        assignSearchCallImplementation();
        /*
        if(vars.glbTextSelectionEnabled)
        {
            retreiveAndRestoreHighlightState(vars.cbaTextFieldId);
        }
        */
        retreiveAndRestoreHighlightState(vars.cbaTextFieldId);
        /*
         * if(vars.showLink) { retrieveAndMarkVisitedReferences(vars.cbaTextFieldId); }
         */
        retrieveAndMarkVisitedReferences(vars.cbaTextFieldId);
        
        setGlbDebugMode();
        updateHighlightColor();
        
        // var endTime = new Date().getTime();
        // var timeTaken = endTime-startTime;
        
        // serialize
        // var markup = serializeToString(vars.glbSvgDoc);
        
        // vars.savedText = markup;
        
        //displayTextBlockInformation();
        
        // printEmbeddedReferences();
        
        //printSvgResultListXValues();
    }
}

function applyChromeAlignmentPatch()
{
  if (vars.isRTLDirection)
  {
    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    if (!isChrome) return;

    var lineList = vars.glbSVGTable.lineList;
    for (var i=0; i<lineList.length; i++)
    {
      var line = lineList[i];
      var lineWidth = 0;
      var selectedTspan = null;
      var tspanWrapperList = line.tspanWrapperList;

      for (var j=0; j<tspanWrapperList.length; j++)
      {
         var wrapper = tspanWrapperList[j];
         var tspan = wrapper.getTspan();
         if (j < (tspanWrapperList.length - 1)) lineWidth += tspan.getComputedTextLength();
         var alignment = tspan.getAttribute('text-anchor');
         if (alignment != null) selectedTspan = tspan;
         
         /*Patch: Sub-superscript does not look ok for Chrome
         var dy = tspan.getAttribute("dy");
         if (dy == null) tspan.setAttribute("dy","0");*/
      }

      if (selectedTspan != null)
      {
          var alignment = selectedTspan.getAttribute('text-anchor');
          var x = selectedTspan.getAttribute('x');
          if (alignment == 'middle') 
          {
            var x = parseInt(x) + parseInt(lineWidth/2);
            selectedTspan.setAttribute('x', x);
          }
          if (alignment == 'end') 
          {
            var x =  parseInt(x) + parseInt(lineWidth);
            selectedTspan.setAttribute('x', x);
          }
      }
    }
  }
}

function orderSVGResults4RTLDirection()
{
	if (vars.isRTLDirection)
	{
		var svgResultList  = vars.glbSVGTable.svgResultForXYList;
	    svgResultList.sort(function(r1, r2) {
		  var line1 = r1.getLineIndex(); 
		  var line2 = r2.getLineIndex(); 
		  if (line1 == line2)
		  {
		  	 return (r2.absoluteStart - r1.absoluteStart);
		  }
		  return line1 - line2;
		});
	} 
}


function updateHighlightColor()
{
    var parentHighlightColor = eval(getRealParentForTextField()+".textSelectionModeProvider.getHighlightColor();");
    if (parentHighlightColor != null && parentHighlightColor != "") 
    {
        vars.highlightColor = parentHighlightColor;
    }
}


function printSvgResultForXYList()
{
    var svgResultList  = vars.glbSVGTable.svgResultForXYList;
    for (var i=0; i<svgResultList.length; i++)
    {
        var xy = svgResultList[i];
        /*
        log.debug("index: "+i);
        log.debug("charNumber = "+xy.charNumber);
        log.debug("character = "+xy.characterString);
        */
    }
}


function printSvgResultListXValues()
{
    var svgResultList  = vars.glbSVGTable.svgResultForXYList;
    for (var i=0; i<svgResultList.length; i++)
    {
        var xy = svgResultList[i];
        xy.printXValues();
        xy.printYValues();
    }
}


function isVisiblePage(cbaTextFieldId)
{
    try
    {
        var booleanString = eval(getRealParentForTextField()+ "." + cbaTextFieldId + ".getVisibleState();");
        return (booleanString != null && booleanString.toLowerCase() === 'true');
    }
    catch(exception)
    {
        return true;
    }
}


function printEmbeddedReferences()
{
    for (var i=0; i<vars.glbEmbeddedReferenceArray.length; i++)
    {
        // log.debug(vars.glbEmbeddedReferenceArray[i]);
    }
}


function create1PixelSpaceTspan(textFragmentWrapper)
{
    var spaceTspan = vars.glbSvgDoc.createElementNS(vars.glbSvgNamespace, 'tspan');
    var fragmentFontFamily = textFragmentWrapper.getFontFamily();
    spaceTspan.setAttribute('font-family', fragmentFontFamily);
    spaceTspan.setAttribute('font-size', '1px');
    spaceTspan.setAttribute('text-rendering', 'geometricPrecision');
    spaceTspan.setAttribute('style','white-space:pre;');
    spaceTspan.appendChild(vars.glbSvgDoc.createTextNode(" "));
    return spaceTspan;
}


function compute1PixelSpaceFactor(textFragmentWrapper, svgTextHandler)
{
    var spaceLengthFactor = textFragmentWrapper.getSpaceLengthFactor();
    if(spaceLengthFactor == null)
    {
        var spaceTspan = create1PixelSpaceTspan(textFragmentWrapper);
        svgTextHandler.appendChild(spaceTspan);
        var spaceTspanLength = spaceTspan.getComputedTextLength();
        //Chrome 48.0 issue - 1px space length is 0
        if (spaceTspanLength == 0) spaceTspanLength = 0.25;
        svgTextHandler.removeChild(spaceTspan);
        textFragmentWrapper.setSpaceLengthFactor(spaceLengthFactor);
        var spaceLengthFactor = parseFloat(1) / parseFloat(spaceTspanLength);
    }
    return spaceLengthFactor;
}


function createVariableSpaceTspanTemplate(textFragmentWrapper, svgTextHandler)
{
    var factorWithPixelUnit = "" + compute1PixelSpaceFactor(textFragmentWrapper, svgTextHandler) + "px";
    var fragmentFontFamily = textFragmentWrapper.getFontFamily();
    var spaceTspan = vars.glbSvgDoc.createElementNS(vars.glbSvgNamespace, 'tspan');
    spaceTspan.setAttribute('font-family', fragmentFontFamily);
    spaceTspan.setAttribute('font-size', factorWithPixelUnit);
    spaceTspan.setAttribute('text-rendering', 'geometricPrecision');
    spaceTspan.setAttribute('style','white-space:pre;');
    return spaceTspan;
}


function assignSearchCallImplementation()
{
    try
    {
        var cmd = getRealParentForTextField() + ".searchCall_" + vars.cbaTextFieldId + " = function search(string) { findString(string, false); }";
        eval(cmd);
    }
    catch(exception)
    {
        // throw exception;
    }
}


/*
 * TspanWrapper class
 * 
 * Encapsulates the svgTspan
 */ 

function TspanWrapper(svgTspan, paragraphNumber, computedLength, textFragmentWrapper)
{
    this.svgTspan = svgTspan;
    this.svgTspanText = svgTspan.firstChild.data;
    this.paragraphNumber = paragraphNumber;
    this.startSvgResultForXY = null;
    this.endSvgResultForXY = null;
    this.computedTextLength = computedLength;
    this.textDecoration = svgTspan.getAttribute('text-decoration');
    this.startPositionOfCharY = null;
    this.svgLine = null;
    this.fragmentWrapper = textFragmentWrapper;
    
    this.getTspan =
        function()
        {
            return this.svgTspan;
        };
        
    this.getTspanText =
        function()
        {
            return this.svgTspanText;
        };
        
    this.getPositionIncrement =
        function()
        {
            var positionIncrement = parseInt(this.fragmentWrapper.getPositionIncrement());
            if(positionIncrement == null)
            {
                positionIncrement = 0;
            }
            return positionIncrement;
        };
        
    this.getComputedTextLength =
        function()
        {
            return this.computedTextLength;
        };
        
    this.setComputedTextLength =
        function(textLength)
        {
            this.computedTextLength = textLength;
        };
    
    this.getFragmentWrapper =
        function()
        {
            return this.fragmentWrapper;
        };
        
    this.getStartPositionOfCharY =
        function()
        {
            return this.startPositionOfCharY;
        };
        
    this.setStartPositionOfCharY =
        function(startPositionOfCharY)
        {
            this.startPositionOfCharY = startPositionOfCharY;
        };
        
    this.getTextDecoration =
        function()
        {
            return this.textDecoration;
        };
        
    this.getBiggestYValue =
        function()
        {
            var biggestY = null;
            var textString = this.svgTspanText;
            
            for (var charIndex=0; charIndex<textString.length; charIndex++)
            {
                var y = parseFloat(this.svgTspan.getStartPositionOfChar(charIndex).y);
                
                if(biggestY == null || biggestY < y)
                {
                    biggestY = y;
                }
            }
            return biggestY;
        };
        
    this.getSvgTspan =
        function()
        {
            return this.svgTspan;
        };
        
    this.getParagraphNumber =
        function()
        {
            return this.paragraphNumber;
        };
        
        
    this.setStartSvgResultForXY =
        function(svgResultForXY)
        {
            this.startSvgResultForXY = svgResultForXY;
        };
        
    this.setEndSvgResultForXY =
        function(svgResultForXY)
        {
            this.endSvgResultForXY = svgResultForXY;
        };
        
    this.getUnderline =
        function()
        {
            return this.svgLine;
        };
        
        
    this.setUnderline =
        function(svgLine)
        {
            this.svgLine = svgLine;
        };
}



/*
 * SVGLine class
 */ 
function SVGLine()
{
    this.tspanWrapperList = new Array();
    this.biggestYValue = 0;
    this.biggestDeltaYValue = 0;
    this.isBullet = false;
    
    this.addTspan =
        function(svgTspan, computedLength, textFragmentWrapper)
        {
            var tspanWrapper = new TspanWrapper(svgTspan, vars.glbParagraphCounter, computedLength, textFragmentWrapper);
            this.tspanWrapperList.push(tspanWrapper);
            
            if(vars.glbLineTspanStartY > vars.glbTspanY)
            {
                var tspanWrapper = this.tspanWrapperList[0];
                var tspan = tspanWrapper.getTspan();
                tspan.setAttribute('y', vars.glbLineTspanStartY);
                vars.glbTspanY = vars.glbLineTspanStartY;
            }
        };
        
    this.removeLastTspan =
        function()
        {
            return this.tspanWrapperList.pop();
        };
        
    this.getBiggestYValue =
        function()
        {
            return this.biggestYValue;
        };
        
    this.getBiggestDeltaYValue =
        function()
        {
            return this.biggestDeltaYValue;
        };
    
    this.setIsBullet =
        function(flag)
        {
            this.isBullet = flag;
        };
        
    this.getIsBullet =
        function()
        {
            return this.isBullet;
        };
    
}

function getClientX(evt)
{
	if ( !vars.isRTLDirection ) return evt.clientX;
	
    return (evt.clientX - vars.cbaTextFieldWidth);
}

function isRTLString(tspan)
{
	var startPos = tspan.getStartPositionOfChar(0);
	var endPos = tspan.getEndPositionOfChar(0); 
    return (startPos.x > endPos.x);
}

/*
 * SVGResultForXY class
 */ 
function SVGResultForXY(lineIndex, tspanIndex, lineLengthDelta, paragraphCounter, tspanWrapper, svgTspan, character, characterIndex, charCounter, absoluteStart, realLength, absoluteEnd, tempLineLength, isBullet)
{
	if ( vars.isRTLDirection)
	{
	    if (absoluteStart > 0) absoluteStart = (-1)*absoluteStart ;
	    if (absoluteEnd > 0) absoluteEnd = (-1)*absoluteEnd ;
	
	    if (absoluteStart > absoluteEnd)
	    {
	        var tmp = absoluteStart;
	        absoluteStart = absoluteEnd;
	        absoluteEnd = tmp; 
	    }
    }
	
    this.isBullet = isBullet;
    this.lineIndex = lineIndex;
    this.tspanIndex = tspanIndex;
    this.lineLengthDelta = lineLengthDelta;
    this.tspanWrapper = tspanWrapper;
    this.svgTspan = svgTspan;
    this.characterIndex = characterIndex;
    this.absoluteStart = absoluteStart;
    this.realLength = realLength;
    this.absoluteEnd = absoluteEnd;
    this.characterString = character; // hux: The var is called
                                        // characterString because there is no
                                        // char in javascript.
    this.charNumber = charCounter;
    this.paragraphNumber = paragraphCounter;
    this.highlightRect = null;
    this.absoluteY = null;
    this.height = null;
    this.isReference = charNumberBelongsToReference(charCounter, character);
    
    this.eventX = null;
    this.eventY = null;
    
    this.printXValues =
        function()
        {
            log.debug("charNumber: "+this.charNumber+"   char: "+this.characterString);
            log.debug("SVGResultForXY - absoluteStart = "+this.absoluteStart);
            log.debug("SVGResultForXY - absoluteEnd   = "+this.absoluteEnd);
            //log.debug("SVGResultForXY - realLength    = "+this.realLength);
        };
        
    this.printYValues =
        function()
        {
            log.debug("SVGResultForXY - absoluteY     = "+this.absoluteY);
            log.debug("SVGResultForXY - height        = "+this.height);
        };
    
    this.printXYValues =
        function()
        {
            log.debug("SVGResultForXY - absoluteStart = "+this.absoluteStart);
            log.debug("SVGResultForXY - absoluteEnd   = "+this.absoluteEnd);
            log.debug("SVGResultForXY - realLength    = "+this.realLength);
            log.debug("SVGResultForXY - absoluteY     = "+this.absoluteY);
            log.debug("SVGResultForXY - height        = "+this.height);
        };
        
    this.printEventValues =
        function()
        {
            log.debug("SVGResultForXY - eventX = "+this.eventX);
            log.debug("SVGResultForXY - eventY = "+this.eventY);
        };
        
    this.printInfo =
        function()
        {
            log.debug("SVGResultForXY - characterString = "+this.characterString);
            log.debug("SVGResultForXY - paragraphNumber = "+this.paragraphNumber);
            log.debug("SVGResultForXY - lineIndex       = "+this.lineIndex);
            log.debug("SVGResultForXY - charNumber      = "+this.charNumber);
            log.debug("SVGResultForXY - isReference     = "+this.isReference);
        };
            
    this.getLineIndex =
        function()
        {
            return this.lineIndex;
        };
        
    this.setLineIndex =
        function(index)
        {
            this.lineIndex = index;
        };
        
    this.setAbsolutePosY =
        function(absolutePosY)
        {
            this.absoluteY = absolutePosY;
        };
        
    this.getAbsolutePosY =
        function()
        {
            return this.absoluteY;
        };
        
    this.setHeight =
        function(height)
        {
            this.height = height;
        };
        
    this.getHeight =
        function()
        {
            return this.height;
        };
        
    this.setHighlightRect =
        function(bgHighlightRect)
        {
            this.highlightRect = bgHighlightRect;
        };
        
    this.getHighlightRect =
        function()
        {
            return this.highlightRect;
        };
        
    this.getIsReference =
        function()
        {
            return this.isReference;
        };
        
    this.getIsBullet =
        function()
        {
            return this.isBullet;
        };
        
    this.getTspanWrapper =
        function()
        {
            return this.tspanWrapper;
        };
        
    // test if two objects have the same attributes
    this.equals = 
        function(other)
        {
            if (other == null) return false;
            if (this.lineIndex == other.lineIndex && this.tspanIndex == other.tspanIndex && this.characterIndex == other.characterIndex)
            {
                return true;
            }
            return false;
        };
        
        
        this.coordinatesMatch = 
            function(coordinates)
            {
                if (coordinates == null) return false;
                
                var thisPointX = parseInt(this.absoluteStart);
                var thisPointY = parseInt(this.getAbsolutePosY());
                
                var otherPointX = parseInt(coordinates.absoluteStart);
                var otherPointY = parseInt(coordinates.getAbsolutePosY());
                
                if (thisPointX == otherPointX && thisPointY == otherPointY)
                {
                    return true;
                }
                return false;
            };
            
            
    // compare two objects equal = 0, this > other = 1, this < other = -1
    this.compare =
        function(other)     
        {
            if (this.equals(other)) return 0;
            if (this.lineIndex > other.lineIndex ||
                (this.lineIndex >= other.lineIndex && this.tspanIndex > other.tspanIndex) ||
                (this.lineIndex >= other.lineIndex && this.tspanIndex >= other.tspanIndex && this.characterIndex > other.characterIndex))
            {
                return 1;
            }
            return -1;
        };
        
    this.getUniqueId =
           function()
           {
                //return "" + this.lineIndex + "_" + this.tspanIndex + "_" + this.characterIndex;
                return "" + this.charNumber;
           };       
}


/*
 * SVGDistance class
 */ 
function SVGDistance()
{
    this.svgResultForXYList = new Array();
    
    this.add =
        function(svgResultForXY)
        {
            this.svgResultForXYList.push(svgResultForXY);
        };
        
    this.remove =
        function(svgResultForXY)
        {
            var newList = new Array();
            for (var i=0; this.svgResultForXYList.length; i++)
            {
                var xy = this.svgResultForXYList[i];
                if (xy.equals(svgResultForXY) == false)
                {
                    newList.push(xy);
                }
            }
            this.svgResultForXYList = newList;          
        };
        
    this.getLastElement =
        function()
        {
            var lastElement = null;
            if(this.svgResultForXYList.length > 0)
            {
                lastElement = this.svgResultForXYList[this.svgResultForXYList.length-1];
            }
            return lastElement;
        };
        
        /**
         * Create a new SVGDistance with all SVGResultForXY,
         * which are not part of svgDistance.
         * 
         * @param svgDistance
         * @return
         */
        this.notIn =
            function(svgDistance)
            {
            
                if (svgDistance == null || svgDistance.svgResultForXYList.length == 0) return this;
                
                var ret = new SVGDistance();
                var svgDistanceByUniqueId = new Array();
                
                for (var i=0; i<svgDistance.svgResultForXYList.length; i++)
                {
                    var xy =  svgDistance.svgResultForXYList[i];
                    svgDistanceByUniqueId[xy.getUniqueId()] = xy;
                }
                
                for (var i=0; i<this.svgResultForXYList.length; i++)
                {
                    var xy =  this.svgResultForXYList[i]; 
                    var xyFound = svgDistanceByUniqueId[xy.getUniqueId()];
                    if (xyFound == null)
                    {
                        ret.add(xy);
                    }               
                }
                
                return ret;
            };      
}


/*
 * SVGTable class
 */ 
function SVGTable(firstLine, lineSpacing, svgBackgroundRect, svgContainer)
{
    this.firstLine = firstLine;
    this.lineSpacing = lineSpacing;
    this.svgBackgroundRect = svgBackgroundRect;
    this.svgContainer = svgContainer;
    this.svgRectangleList = new Array();
    this.lineList = new Array(new SVGLine());
    this.currentIndex = 0;
    this.svgResultForXYList = null;
    //HMA
    this.currentSvgContainer = this.svgContainer;
        
        
    this.getCurrentLine =
      function()
      {
        return this.lineList[this.currentIndex];
      };
      
    this.addNewLine = 
      function()
      {
        this.lineList.push(new SVGLine());
        this.currentIndex++;
      };    
      
    this.getNumberOfLines =
        function()
        {
            return this.lineList.length;
        };  
        
    this.getStartPositionOfCharacter =
        function(svgTspan, charIndex)
        {
            // TODO check
            if (charIndex == 0) return 0;
            else return svgTspan.getSubStringLength(0, charIndex);
        };      

    
    this.getSVGResultForXYIndex =
        function(svgResultForXY)
        {
            for (var i=0; i<this.svgResultForXYList.length; i++)
            {
                var xy = this.svgResultForXYList[i];
                if (xy.equals(svgResultForXY)) return i;
            }
            return -1;
        };
    
    
     // get the absolute y position
     this.getAbsoluteY =
        function(svgResultForXY)
        {
            try
            {
                var line = this.lineList[svgResultForXY.lineIndex];
                var absPosY = line.tspanWrapperList[0].getStartPositionOfCharY();
                
                if(absPosY == null)
                {
                    var firstTSpanInLine = line.tspanWrapperList[0].getTspan();
                    absPosY = firstTSpanInLine.getStartPositionOfChar(0).y;
                    line.tspanWrapperList[0].setStartPositionOfCharY(absPosY);
                }
                return absPosY;
            
            }
            catch(exception)
            {
                return null;
            }           
        };
        
     this.getBiggestAbsoluteY =
        function(svgResultForXY)
        {
            var line = this.lineList[svgResultForXY.lineIndex];
            var y = line.getBiggestYValue();
            // var y =
            // line.tspanWrapperList[svgResultForXY.lineIndex].getBiggestYValue();
            return y;
        };
    
    this.getSVGResultForCharNumber =
        function(charNumber)
        {
            for (var i=0; i<this.svgResultForXYList.length; i++)
            {
                var svgResultForXY = this.svgResultForXYList[i];
                if (svgResultForXY.charNumber==charNumber) return svgResultForXY;
            }
            return null;
        };
    
        
     // get the absolute height position
     this.getHeight =
        function(svgResultForXY)
        {
            try
            {
                if (svgResultForXY.lineIndex == 0)
                {
                    var y = this.getAbsoluteY(svgResultForXY);
                    return parseFloat(y);
                }
                else
                {
                    var lastIndex = parseInt(svgResultForXY.lineIndex - 1);
                    var lineAbove = this.lineList[lastIndex];
                    
                    var yAbove = lineAbove.tspanWrapperList[0].getStartPositionOfCharY();
                    
                    if(yAbove == null)
                    {
                        var firstTSpanInLineAbove = lineAbove.tspanWrapperList[0].getTspan();
                        yAbove = parseFloat(firstTSpanInLineAbove.getStartPositionOfChar(0).y);
                        lineAbove.tspanWrapperList[0].setStartPositionOfCharY(yAbove);
                    }
                    
                    var y = this.getAbsoluteY(svgResultForXY);
                    return (parseFloat(y - yAbove));
                }
            }
            catch(exception)
            {
                return null;
            }
        };
    
    this.underline = 
        function (x1, length, y, yOffset, tspan)
        {
            var svgLine = vars.glbSvgDoc.createElementNS(vars.glbSvgNamespace, 'line');
            
            svgLine.setAttribute('x1', x1);  
            svgLine.setAttribute('y1', y + yOffset);
            svgLine.setAttribute('x2', x1 + length);
            svgLine.setAttribute('y2', y + yOffset);
            svgLine.setAttribute('stroke', tspan.getAttribute('fill'));
            svgLine.setAttribute('stroke-width', 1);
            
            this.svgContainer.appendChild(svgLine);
        };
    
      /* OLD
      // create a background rectangle for a single character
      this.createHighlightForSingleCharacter =
        function (svgResultForXY)
        {
            var myClone = this.svgBackgroundRect.cloneNode(false);
            var x = svgResultForXY.absoluteStart;
            var y = this.getAbsoluteY(svgResultForXY);
            // var test_y = this.getBiggestAbsoluteY(svgResultForXY);
            
            var width = svgResultForXY.realLength;
            var height = svgResultForXY.getHeight(); // this.getHeight(svgResultForXY);
            
            var offset = height * 0.2;
            y = y - height + offset;
            
            // HMA: create unique id's
            myClone.setAttribute('id', "" + svgResultForXY.lineIndex + "_" + svgResultForXY.tspanIndex + "_" + svgResultForXY.characterIndex);
            myClone.setAttribute('x', x);
            myClone.setAttribute('y', y);
            myClone.setAttribute('width', width);
            myClone.setAttribute('height', height);
            myClone.setAttribute('opacity', '0.0');
            
            this.svgContainer.appendChild(myClone);
            // a list of rectangles without text nodes or other non related
            // nodes
            // this.svgRectangleList.push(myClone);
            svgResultForXY.setHighlightRect(myClone);
        };
        */
        
          /**
           * Create a background rectangle for a single character.
           * @param svgResultForXY
           */
          this.createHighlightForSingleCharacter =
            function (svgResultForXY)
            {
                var RECTANGLE_SLICE_SIZE = 10;
                var myClone = this.svgBackgroundRect.cloneNode(false);
                var x = parseFloat(svgResultForXY.absoluteStart);
                var y = this.getAbsoluteY(svgResultForXY);
                
                var width = svgResultForXY.realLength;
                var height = svgResultForXY.getHeight(); 
                
                var offset = height * 0.2;
                y = y - height + offset;
                
                // HMA: create unique id's
                myClone.setAttribute('id', "" + svgResultForXY.getUniqueId());
                myClone.setAttribute('x', x);
                myClone.setAttribute('y', y);
                myClone.setAttribute('width', width);
                myClone.setAttribute('height', height);
                myClone.setAttribute('opacity', '0.0');
                
                // OLD: this.svgContainer.appendChild(myClone);
                if (vars.charCounter % RECTANGLE_SLICE_SIZE == 0)
                {
                    var newContainer = this.svgContainer.cloneNode(false);
                    newContainer.setAttribute('id', "" + vars.charCounter);
                    newContainer.appendChild(myClone);
                    this.svgContainer.parentNode.insertBefore(newContainer, this.svgContainer);
                    this.currentSvgContainer = newContainer;
                }
                else
                {
                    this.currentSvgContainer.appendChild(myClone);
                }
                
                svgResultForXY.setHighlightRect(myClone);
            };



    

    // find the rectangle for a xy result
    // use binary search for optimal performance
    // the assumption is that the children are ordered
    // by x and y.
    this.rFindHighlightRectangle = 
        function (start, end, svgResultForXY)
        {
            if(svgResultForXY.lineIndex == null)
            {
                return null;
            }
            
            var x = parseInt(svgResultForXY.absoluteStart);
            var y = this.getAbsoluteY(svgResultForXY);
            var height = this.getHeight(svgResultForXY);
            
            var offset = height * 0.2;
            y = y - height + offset;
            
            var high = end;
            var low = start;
            
            if (low <= high) 
            {
                var mid = parseInt((low + high) / 2);
                var child = this.svgRectangleList[mid];
                var childX = child.getAttribute('x');
                var childY = child.getAttribute('y');
                if (childX == x && childY == y)
                {
                    return child;
                }
                else if (childY > y ||
                         childX > x && childY == y)
                {   
                    // Call ourself for the lower part of the array
                    return this.rFindHighlightRectangle(start, mid - 1, svgResultForXY);
                }
                else
                {
                    // Call ourself for the upper part of the array
                    return this.rFindHighlightRectangle(mid + 1, end, svgResultForXY);
                }                            
            }
            else
            {
                return null;
            }
        };




    // find the rectangle for a xy result
    // use binary search for optimal performance
    // the assumption is that the children are ordered
    // by x and y.
    this.findHighlightRectangle = 
        function (svgResultForXY)
        {
            return this.rFindHighlightRectangle(0, this.svgRectangleList.length - 1, svgResultForXY);
        };


    this.highlightSvgDistance = 
        function (svgDistance)
        {
            // HMA: optimize: detach rectangles from dom, set value, attach
            //this.detachHighlightRectangles(svgDistance);
            for (var i=0; i<svgDistance.svgResultForXYList.length; i++)
            {
                this.highlightCharacter(svgDistance.svgResultForXYList[i]);
            }
            //this.attachHighlightRectangles(svgDistance);
        };
    
        
    // HMA: detach all rectangles from a corresponding distance from the dom
    this.detachHighlightRectangles = 
        function (svgDistance)
        {
            for (var i=0; i<svgDistance.svgResultForXYList.length; i++)
            {
                var rect = svgDistance.svgResultForXYList[i].getHighlightRect();
                if (rect != null)
                {
                    this.svgContainer.removeChild(rect);
                }
            }
        };

    // HMA: detach all rectangles from a corresponding distance from the dom
    this.attachHighlightRectangles = 
        function (svgDistance)
        {
            for (var i=0; i<svgDistance.svgResultForXYList.length; i++)
            {
                var rect = svgDistance.svgResultForXYList[i].getHighlightRect();
                if (rect != null)
                {
                    this.svgContainer.appendChild(rect);
                }
            }
        };      
        
        
    this.unhighlightSvgDistance = 
        function (svgDistance)
        {
        //log.debug("in unhighlightSvgDistance ");
            // HMA: optimize: detach rectangles from dom, set value, attach
            //this.detachHighlightRectangles(svgDistance);
        //log.debug("svgDistance = "+svgDistance);
        //log.debug("svgDistance.svgResultForXYList = "+svgDistance.svgResultForXYList);
        //log.debug("svgDistance.svgResultForXYList.length = "+svgDistance.svgResultForXYList.length);
        
            for (var i=0; i<svgDistance.svgResultForXYList.length; i++)
            {
                //log.debug("unHighlightCharacter: "+svgDistance.svgResultForXYList[i].characterString);
                this.unHighlightCharacter(svgDistance.svgResultForXYList[i]);
                //log.debug("unHighlightCharacter: "-svgDistance.svgResultForXYList[i].characterString);
            }
            //this.attachHighlightRectangles(svgDistance);
        };
    
    // highlight a character
    this.highlightCharacter = 
        function (svgResultForXY)
        {
            if(svgResultForXY != null)
            {
                var rect = svgResultForXY.getHighlightRect();
                if (rect != null)
                {
                    rect.setAttribute('opacity', '1.0');
                    rect.setAttribute('fill', vars.highlightColor);
                }
            }
        };
        
    this.getCharacterHighlightColor = 
        function (svgResultForXY)
        {   
            if (!this.isCharacterHighlighted(svgResultForXY)) return null;
            
            var rect = svgResultForXY.getHighlightRect();
            return rect.getAttribute('fill');
        };    
        
        
    this.unHighlightAllCharacters = 
        function ()
        {
            for (var i=0; i<this.svgResultForXYList.length; i++)
            {
                this.unHighlightCharacter(this.svgResultForXYList[i]);
            }
        };
        
        
    this.unHighlightCharacter = 
        function (svgResultForXY)
        {
            ret = false;
            if(svgResultForXY != null)
            {
                var rect = svgResultForXY.getHighlightRect();
                
                if (rect != null)
                {
                    rect.setAttribute('opacity', '0.0');
                }
            }
            return ret;
        };      
        
        
    this.isCharacterHighlighted = 
        function (svgResultForXY)
        {   
            ret = false;
            if(svgResultForXY != null)
            {
                var rect = svgResultForXY.getHighlightRect();
                if (rect != null)
                {
                    if (rect.getAttribute('opacity') == '1.0' || rect.getAttribute('opacity') == '1') return true;
                    return false;
                }
            }
            return ret;
        };      
    
    // create a list of SVGResultForXY for all characters in all tspan elements
    this.initializeSVGResultForXYList = 
        function()
        {
            if (this.svgResultForXYList != null) return;
            this.svgResultForXYList = new Array();
            
            for (var i=0; i<this.lineList.length; i++)
            {
                var line = this.lineList[i];
                
                var lineLength = 0;
                var lineLengthBefore = 0;
                var absoluteStartDelta = 0;
                var positionIncrement = 0;
                
                for (var j=0; j<line.tspanWrapperList.length; j++)
                {
                    var tspanWrapper = line.tspanWrapperList[j];
                    var tspan = tspanWrapper.getTspan();
                    
                    if(line.getIsBullet() && j==0)
                    {
                        positionIncrement = tspanWrapper.getPositionIncrement();
                        if (isNaN(positionIncrement)) positionIncrement = 0;
                    }
                    
                    var paragraphNumber = tspanWrapper.getParagraphNumber();
                    var computedTextLength = tspanWrapper.getComputedTextLength();
                    if(computedTextLength == null)
                    {
                        computedTextLength = tspan.getComputedTextLength();
                        tspanWrapper.setComputedTextLength(computedTextLength);
                    }
                    
                    if (j == 0)
                    {
                        try
                        {
                            absoluteStartDelta = tspan.getStartPositionOfChar(0).x;
                            absolutePosY = tspan.getStartPositionOfChar(0).y;
                        }
                        catch(exception)
                        {
                            absoluteStartDelta = 0;
                            absolutePosY = 0;
                        }
                    }
                    else
                    {
                        var deltaX = tspan.getAttribute('dx');
                            
                        if(deltaX != null && deltaX != "")
                        {
                            try
                            {
                            	absoluteStartDelta += parseFloat(deltaX);
                            }
                            catch(exception)
                            {
                                // log.debug(exception);
                            }
                        }
                    }
                    
                    lineLengthBefore = lineLength;
                    lineLength = lineLength + computedTextLength;
                                        
                    var numberOfChars = tspan.getNumberOfChars();                    
                    var tempLineLength = lineLengthBefore;
                    var string = tspanWrapper.getTspanText();
                    
                    // Fix for FF > 53: tspan.getNumberOfChars() returns 0
					if (numberOfChars == 0) {
						numberOfChars = string.length;
					}					                    
                    var lastCharIndex = numberOfChars-1;
                    // Fix for negative index
                    if (lastCharIndex < 0) {
                    	lastCharIndex = 0;
                    }
                    
                    if (vars.isRTLDirection)
                    {
                    	if (numberOfChars != string.length) numberOfChars = string.length;
                    }
                    
                    if(simpleTrim(string) == "")
                    {
                        // log.debug(" --------------> number Of space Chars =
                        // "+numberOfChars);
                        numberOfChars = 1;
                    }
                    
                    try
                    {
	                    for (var charIndex=0; charIndex<numberOfChars; charIndex++)
	                    {
	                    	var absoluteStart = tempLineLength + absoluteStartDelta;
		                    try{
		                         if (vars.isRTLDirection) absoluteStart = tspan.getStartPositionOfChar(charIndex).x;
		                    }catch(e) {}
		                        
		                    var realLength = 0;
		                    try {
		                    	realLength = (numberOfChars == 1)? computedTextLength: tspan.getSubStringLength(parseInt(charIndex), 1);
		                    } catch(e) { }
		                       
		                    try{
		                    	if (vars.isRTLDirection) realLength = Math.abs(tspan.getStartPositionOfChar(charIndex).x - tspan.getEndPositionOfChar(charIndex).x);
		                    }catch(e) {} 
		                        
		                    tempLineLength = tempLineLength + realLength; 
		                        
		                    if(line.getIsBullet() && j==1 && charIndex ==0)//it's a bullet line & it's the second tspan (the one after the bullet) & the first char
		                    {
		                        vars.charCounter =  vars.charCounter + 1 + positionIncrement;  //vars.charCounter++;
		                    }
		                        
		                    var isBulletCharacter = (line.getIsBullet() && j==0);
		                        
		                    var charEnd = absoluteStart + realLength;
		                    try{
		                        if (vars.isRTLDirection) charEnd = tspan.getEndPositionOfChar(charIndex).x;
		                    }catch(e) {}
		                        
		                    var newXY = new SVGResultForXY(i, j, lineLengthBefore, paragraphNumber, tspanWrapper, tspan, string.charAt(charIndex), charIndex, vars.charCounter, absoluteStart, realLength, charEnd, tempLineLength, isBulletCharacter);
		                        
		                    newXY.setAbsolutePosY(absolutePosY);
		                    newXY.setHeight(this.getHeight(newXY));
		                        
		                    vars.charCounter++;
		                        
		                    if(charIndex == 0)
		                    {
		                        line.tspanWrapperList[j].setStartSvgResultForXY(newXY);
		                    }
		                    if(charIndex == lastCharIndex)
		                    {
		                        line.tspanWrapperList[j].setEndSvgResultForXY(newXY);
		                    }
		                        
		                    this.svgResultForXYList.push(newXY);
		                    // create a background rectangle
		                    this.createHighlightForSingleCharacter(newXY);
		                        
		                    // this.highlightCharacter(newXY);
		                    
	                    }
                    } catch(e) {}
                }
            }
        };
    

    // calculate the distance (list of SVGResultForXY)
    // for two given SVGResultForXY.
    this.getDistanceSVGResultForXYList_orig =
        function(startSVGResultForXY, endSVGResultForXY)
        {
            var ret = new SVGDistance();
            if(startSVGResultForXY == null)
            {
                return ret;
            }
            if (startSVGResultForXY.equals(endSVGResultForXY) || endSVGResultForXY == null)
            {
                ret.add(startSVGResultForXY);
                return ret;
            }
            
            var startXY;
            var endXY;
            if (startSVGResultForXY.compare(endSVGResultForXY) == -1) 
            {
                startXY = startSVGResultForXY;
                endXY = endSVGResultForXY;
            }
            else 
            {
                startXY = endSVGResultForXY;
                endXY = startSVGResultForXY;
             }
            
            var startIndex = parseInt(this.getSVGResultForXYIndex(startXY));
            var endIndex = parseInt(this.getSVGResultForXYIndex(endXY));
            
            // error handling if not found
            if (startIndex == -1 || endIndex == -1)
            {
                ret.add(startSVGResultForXY);
                return ret;
            }
            
            for (var i=startIndex; i<=endIndex; i++)
            {
                var xy = this.svgResultForXYList[i];
                ret.add(xy);
            }
            return ret;
        };
        
        
        
        this.getDistanceSVGResultForXYList =
            function(startSVGResultForXY, endSVGResultForXY)
            {
                var ret = new SVGDistance();
                
                try
                {
                    var startIndex = -1;
                    var endIndex = -1;
                    
                    if(!vars.selectionFromOutside && startSVGResultForXY.coordinatesMatch(endSVGResultForXY))
                    {
                        ret.add(startSVGResultForXY);
                        return ret;
                    }
                    
                    if(vars.completeSelection)
                    {
                        findMouseoverLocation(startSVGResultForXY, endSVGResultForXY);
                        
                        if((vars.mouseOverNorth && vars.mouseOutBottom) || (vars.mouseOverSouth && vars.mouseOutTop))
                        {
                            startIndex = 0;
                            endIndex = this.svgResultForXYList.length-1;
                            
                            for (var i=startIndex; i<=endIndex; i++)
                            {
                                var xy = this.svgResultForXYList[i];
                                ret.add(xy);
                            }
                            return ret;
                        }
                        else if((vars.mouseOverWest && vars.mouseOutRight) || (vars.mouseOverEast && vars.mouseOutLeft))
                        {
                            //carry on
                        }
                        else
                        {
                            return ret;
                        }
                    }
                    
                    if(vars.selectionFromOutside || vars.completeSelection) // this variable is cleared after the first mouse move event
                    {
                        if(vars.mouseOverNorth)
                        {
                            //log.debug("mouseOverNorth");
                            startSVGResultForXY = this.svgResultForXYList[0];
                            glbSelectLock = startSVGResultForXY;
                        }
                        else if(vars.mouseOverSouth)
                        {
                            //log.debug("mouseOverSouth");
                            startSVGResultForXY = this.svgResultForXYList[this.svgResultForXYList.length-1];
                            glbSelectLock = startSVGResultForXY;
                        }
                        else if(vars.mouseOverEast)
                          {
                                //log.debug("mouseOverEast");
                            var pointX = vars.cbaTextFieldWidth - 1;
                            this.setValuesForSvgResult(startSVGResultForXY, pointX);
                          }
                          else if(vars.mouseOverWest)
                          {
                                //log.debug("mouseOverWest");
                            var pointX = 1;
                            this.setValuesForSvgResult(startSVGResultForXY, pointX);
                          }
                        else // there was a mouseover but we do not know where it occured... so we need to check the mouse move direction ...
                        {
                            findMouseoverLocation(startSVGResultForXY, endSVGResultForXY);
                            
                            if (vars.mouseOverNorth)
                            {
                              startSVGResultForXY = this.svgResultForXYList[0];
                              glbSelectLock = startSVGResultForXY;
                            }
                            else if (vars.mouseOverSouth)
                            {
                              startSVGResultForXY = this.svgResultForXYList[this.svgResultForXYList.length-1];
                              glbSelectLock = startSVGResultForXY;
                            }
                             else if (vars.mouseOverWest)
                            {
                              var pointX = 1;
                              this.setValuesForSvgResult(startSVGResultForXY, pointX);
                            }
                            else if (vars.mouseOverEast)
                            {
                              var pointX = vars.cbaTextFieldWidth - 1;
                              this.setValuesForSvgResult(startSVGResultForXY, pointX);
                            }
                        }
                        //this.copyValuesIntoSelectLock(startSVGResultForXY);
                    }
                    
                    
                    if(startSVGResultForXY.characterString == null)
                    {
                        //log.debug("startSVGResultForXY.characterString == null");
                        
                        this.setYValuesForSvgResult(startSVGResultForXY);// HUX! added
                        
                        var startPointX = parseInt(startSVGResultForXY.absoluteStart);
                        if(vars.mouseOverWest)
                          {
                              startPointX = 1;
                          }
                          else if(vars.mouseOverEast)
                          {
                              startPointX = vars.cbaTextFieldWidth - 1;
                          }
                        var startPointY = parseInt(startSVGResultForXY.getAbsolutePosY());
                        
                        var endPointX = parseInt(endSVGResultForXY.absoluteStart);
                        var endPointY = parseInt(endSVGResultForXY.getAbsolutePosY());
                        
                        startLineIndex = startSVGResultForXY.getLineIndex();
                        
                        if(endSVGResultForXY.characterString == null)
                        {
                            this.setYValuesForSvgResult(endSVGResultForXY);
                            endLineIndex = parseInt(endSVGResultForXY.getLineIndex());
                            
                            endPointX = parseInt(endSVGResultForXY.absoluteStart);
                            endPointY = parseInt(endSVGResultForXY.getAbsolutePosY());
                            
                        }
                        else
                        {
                            endLineIndex = parseInt(endSVGResultForXY.getLineIndex());
                            endIndex = parseInt(this.getSVGResultForXYIndex(endSVGResultForXY));
                        }
                        
                        startIndex = this.searchStartSelectionSVGResult(startLineIndex, endLineIndex, endIndex, parseInt(startPointX), parseInt(endPointX), parseInt(startPointY), parseInt(endPointY),(startLineIndex != endLineIndex && (startPointY < endPointY)));
                        
                        if(startLineIndex == -1 )//|| startLineIndex == 0)
                        {
                            if(startIndex == (this.svgResultForXYList.length -1))
                            {
                                startSVGResultForXY = this.svgResultForXYList[this.svgResultForXYList.length-1];
                                glbSelectLock = startSVGResultForXY;
                                //this.copyValuesIntoSelectLock(this.svgResultForXYList[startIndex]);
                            }
                            else if(startIndex == 0)
                            {
                                startSVGResultForXY = this.svgResultForXYList[0];
                                glbSelectLock = startSVGResultForXY;
                                //this.copyValuesIntoSelectLock(this.svgResultForXYList[0]);
                            }
                        }
                        
                        if(endIndex == -1)
                        {
                            endIndex = this.searchEndSelectionSVGResult(startLineIndex, endLineIndex, startIndex, parseInt(startPointX), parseInt(endPointX), parseInt(startPointY), parseInt(endPointY), (startPointY < endPointY));
                        }
                    }
                    else if(endSVGResultForXY.characterString == null)
                    {
                        this.setYValuesForSvgResult(endSVGResultForXY);
                        
                        var endPointX = parseInt(endSVGResultForXY.absoluteStart);
                        var endPointY = parseInt(endSVGResultForXY.getAbsolutePosY());
                        
                        var startPointX = parseInt(startSVGResultForXY.absoluteStart);
                        var startPointY = parseInt(startSVGResultForXY.getAbsolutePosY());
                        
                        endLineIndex = endSVGResultForXY.getLineIndex();
                        
                        if(endLineIndex == -1 && startPointY < endPointY)
                        {
                            var xy = this.svgResultForXYList[this.svgResultForXYList.length-1];
                        }
                        
                        if(startSVGResultForXY.characterString == null)
                        {
                            this.setYValuesForSvgResult(startSVGResultForXY);
                        
                            startLineIndex = startSVGResultForXY.getLineIndex();
                            startPointX = parseInt(startSVGResultForXY.absoluteStart);
                            startPointY = parseInt(startSVGResultForXY.getAbsolutePosY());
                        }
                        else
                        {
                            startLineIndex = parseInt(startSVGResultForXY.getLineIndex());
                            startIndex = parseInt(this.getSVGResultForXYIndex(startSVGResultForXY));
                        }
                        
                        endIndex = this.searchEndSelectionSVGResult(startLineIndex, endLineIndex, startIndex, parseInt(startPointX), parseInt(endPointX), parseInt(startPointY), parseInt(endPointY), (startPointY < endPointY));
                        
                        if(startIndex == -1)
                        {
                            startIndex = this.searchStartSelectionSVGResult(startLineIndex, endLineIndex, endIndex, parseInt(startPointX), parseInt(endPointX), parseInt(startPointY), parseInt(endPointY),(startLineIndex != endLineIndex && (startPointY < endPointY)));
                        }
                    }
                    else
                    {
                        //log.debug("else");
                        
                        if (startSVGResultForXY.equals(endSVGResultForXY) || endSVGResultForXY == null)
                        {
                            ret.add(startSVGResultForXY);
                            return ret;
                        }
                        
                        var startXY;
                        var endXY;
                        if (startSVGResultForXY.compare(endSVGResultForXY) == -1) 
                        {
                            startXY = startSVGResultForXY;
                            endXY = endSVGResultForXY;
                        }
                        else 
                        {
                            startXY = endSVGResultForXY;
                            endXY = startSVGResultForXY;
                         }
                        
                        startIndex = parseInt(this.getSVGResultForXYIndex(startXY));
                        endIndex = parseInt(this.getSVGResultForXYIndex(endXY));
                    }
                    
                    if(startIndex != endIndex)
                    {
                        if(startIndex == -1)
                        {
                            startIndex = endIndex;
                        }
                        if(endIndex == -1)
                        {
                            endIndex = startIndex;
                        }
                    }
                    
                    // error handling if not found
                    if (startIndex == -1 && endIndex == -1)
                    {
                        //ret.add(startSVGResultForXY);
                        return ret;
                    }
                    
                    if(startIndex > endIndex)
                    {
                        var tempIndex = startIndex;
                        startIndex = endIndex;
                        endIndex = tempIndex;
                    }
                    
                    for (var i=startIndex; i<=endIndex; i++)
                    {
                        var xy = this.svgResultForXYList[i];
                        ret.add(xy);
                    }
                }
                catch(exception)
                {
                    ret = new SVGDistance();
                }
                return ret;
                
            };
            
        
    this.copyValuesIntoSelectLock =
        function(svgResultForXYList)
        {
            glbSelectLock.setLineIndex(parseInt(svgResultForXYList.getLineIndex()));
            glbSelectLock.setAbsolutePosY(parseInt(svgResultForXYList.getAbsolutePosY()));
            glbSelectLock.absoluteStart = parseInt(svgResultForXYList.absoluteStart);
            glbSelectLock.setHeight(parseInt(svgResultForXYList.getHeight()));
        }
    
    
    this.searchStartSelectionSVGResult =
        function(startLineIndex, endLineIndex, endIndex, startPointX, endPointX, startPointY, endPointY, searchDown)
        {
            //log.debug("searchDown = "+searchDown);
        
            var result = -1;
            
            if(startLineIndex == -1 && endLineIndex == -1)
            {
                return result;
            }
        
            if(startLineIndex == endLineIndex && startPointY == endPointY)
            {
                if(startPointX > endPointX)
                {
                    for (var index = this.svgResultForXYList.length -1; index > -1 && result == -1; index--)//
                    {
                        var svgResult = this.svgResultForXYList[index];
                        var svgResultStartX = parseInt(svgResult.absoluteStart);
                        var svgResultEndX = parseInt(svgResult.absoluteEnd);
                        var lineIndex = parseInt(svgResult.getLineIndex());
                        
                        if (startLineIndex == lineIndex && svgResultEndX > endPointX && startPointX > svgResultEndX) 
                        {
                            result = index;
                        }
                    }
                }
                else if(startPointX < endPointX)
                {
                    for (var index=0; index<this.svgResultForXYList.length && result == -1; index++)
                    {
                        var svgResult = this.svgResultForXYList[index];
                        var svgResultStartX = parseInt(svgResult.absoluteStart);
                        var svgResultEndX = parseInt(svgResult.absoluteEnd);
                        var lineIndex = parseInt(svgResult.getLineIndex());
                        
                        if (startLineIndex == lineIndex && svgResultStartX >= startPointX && svgResultStartX <= endPointX)
                        {
                            result = index;
                        }
                    }
                }
                else if(startLineIndex == 0)
                {
                    for (var index=0; index<this.svgResultForXYList.length && result == -1; index++)
                    {
                        var svgResult = this.svgResultForXYList[index];
                        var svgResultStartX = svgResult.absoluteStart;
                        var svgResultLength = svgResult.realLength;
                        var svgResultEndX = svgResultStartX + svgResultLength;
                        
                        var lineIndex = svgResult.getLineIndex();
                        
                        if (lineIndex == 0 && svgResultStartX < startPointX && svgResultEndX >= endPointX)
                        {
                            result = 0;
                        }
                    }
                }
            }
            else if(searchDown)
            {
                //log.debug("searchDown");
                
                for (var index=0; index<this.svgResultForXYList.length && result == -1; index++)
                {
                    var svgResult = this.svgResultForXYList[index];
                    var svgResultStartX = svgResult.absoluteStart;
                    var svgResultAbsY = parseInt(svgResult.getAbsolutePosY());
                    var svgResultLineIndex = svgResult.getLineIndex();
                    
                    if (svgResultLineIndex >= startLineIndex && (svgResultLineIndex <= endLineIndex || endLineIndex == -1) && (svgResultStartX > startPointX || svgResultAbsY > startPointY))
                    {
                        result = index;
                    }
                }
                if(result == -1 && endLineIndex != -1)
                {
                    result = 0;
                }
            }
            else
            {
                //log.debug("search up");
                
                for (var index = this.svgResultForXYList.length -1; index > -1 && result == -1; index--)
                {
                    var svgResult = this.svgResultForXYList[index];
                    var svgResultStartX = svgResult.absoluteStart;
                    var svgResultAbsY = parseInt(svgResult.getAbsolutePosY());
                    var svgResultLineIndex = svgResult.getLineIndex();
                    
                    if (svgResultLineIndex <= startLineIndex && svgResultLineIndex >= endLineIndex && (svgResultStartX <= startPointX || svgResultAbsY < startPointY)) 
                    {
                        result = index;
                    }
                }
                if(result == -1 && endLineIndex != -1)
                {
                    result = this.svgResultForXYList.length -1;
                }
            }
            return result;
        };
        
        
    this.searchEndSelectionSVGResult =
        function(startLineIndex, endLineIndex, startIndex, startPointX, endPointX, startPointY, endPointY, searchDown)
        {
            //log.debug("searchEndSelectionSVGResult  searchDown = "+searchDown);
            var result = -1;
            
            if(startLineIndex == -1 && endLineIndex == -1)
            {
                return result;
            }
            
            if(startLineIndex == endLineIndex && startPointY == endPointY)
            {
                if(startPointX > endPointX)
                {
                    for (var index = this.svgResultForXYList.length -1; index > -1; index--)
                    {
                        var svgResult = this.svgResultForXYList[index];
                        var svgResultStartX = parseInt(svgResult.absoluteStart);
                        var svgResultEndX = parseInt(svgResult.absoluteEnd);
                        var lineIndex = parseInt(svgResult.getLineIndex());
                        
                        if (endLineIndex == lineIndex && svgResultStartX < startPointX && svgResultStartX > endPointX) 
                        {
                            result = index;
                        }
                    }
                }
                else if(startPointX < endPointX)
                {
                    for (var index=0; index<this.svgResultForXYList.length; index++)
                    {
                        var svgResult = this.svgResultForXYList[index];
                        var svgResultStartX = parseInt(svgResult.absoluteStart);
                        var svgResultEndX = parseInt(svgResult.absoluteEnd);
                        var svgResultLineIndex = parseInt(svgResult.getLineIndex());
                        
                        if (endLineIndex == svgResultLineIndex && svgResultStartX >= startPointX && svgResultEndX <= endPointX)
                        {
                            result = index;
                        }
                    }
                }
                else
                {
                    for (var index=0; index<this.svgResultForXYList.length ; index++)
                    {
                        var svgResult = this.svgResultForXYList[index];
                        var svgResultStartX = parseInt(svgResult.absoluteStart);
                        var svgResultEndX = parseInt(svgResult.absoluteEnd);
                        var svgResultLineIndex = parseInt(svgResult.getLineIndex());
                        
                        if (endLineIndex == svgResultLineIndex && svgResultStartX <= startPointX )//&& svgResultEndX <= endPointX
                        {
                            result = index;
                        }
                    }
                }
            }
            else if(searchDown)
            {
                if(vars.mouseMovedOut && endPointY >= vars.cbaTextFieldHeight)
                {
                    result = this.svgResultForXYList.length -1;
                }
                else
                {
                    for (var index=0; index<this.svgResultForXYList.length ; index++)
                    {
                        var svgResult = this.svgResultForXYList[index];
                        var svgResultStartX = parseInt(svgResult.absoluteStart);
                        var svgResultAbsY = parseInt(svgResult.getAbsolutePosY());
                        var svgResultLineIndex = svgResult.getLineIndex();
                        
                        //if (lineIndex >= startLineIndex && lineIndex <= endLineIndex && (svgResultStartX > startPointX || svgResultAbsY > startPointY))
                        if ((startLineIndex == -1 || svgResultLineIndex >= startLineIndex) && svgResultLineIndex <= endLineIndex && (svgResultStartX < startPointX || svgResultAbsY > startPointY))    
                        {
                            result = index;
                        }
                    }
                    if(result == -1 )// && startLineIndex != -1
                    {
                        result = this.svgResultForXYList.length -1;
                    }
                }
            }
            else // searching up
            {
                for (var index = this.svgResultForXYList.length -1; index > -1; index--)
                {
                    var svgResult = this.svgResultForXYList[index];
                    var svgResultStartX = svgResult.absoluteStart;
                    var svgResultAbsY = parseInt(svgResult.getAbsolutePosY());
                    var svgResultLineIndex = svgResult.getLineIndex();
                    
                    if ((startLineIndex == -1 || svgResultLineIndex <= startLineIndex) && svgResultLineIndex >= endLineIndex && (svgResultStartX < startPointX || svgResultAbsY < startPointY)) 
                    {
                        result = index;
                    }
                }
                if(result == -1 && startLineIndex != -1)
                {
                    result = 0;
                }
            }
            return result;
        };
        
    
    // find out more information for the given svgResult without char
    this.setYValuesForSvgResult =
        function(svgResult)
        {
            var pointY = svgResult.getAbsolutePosY();
            
            for (var index=0; index<this.svgResultForXYList.length; index++)
            {
                var xy = this.svgResultForXYList[index];
                var heightT = xy.getHeight();
                
                if (isNumberInRange(pointY, xy.absoluteY - heightT, xy.absoluteY))
                {
                    svgResult.setLineIndex(parseInt(xy.getLineIndex()));
                    svgResult.setAbsolutePosY(parseInt(xy.getAbsolutePosY()));
                        //svgResult.absoluteStart = parseInt(xy.absoluteStart);
                    svgResult.setHeight(parseInt(xy.getHeight()));
                }
            }
        };
        
        
        this.setValuesForSvgResult =
            function(svgResult, pointX)
            {
                var pointY = parseInt(svgResult.getAbsolutePosY());
                //var pointX = parseInt(svgResult.absoluteStart);
                var foundY = false;
               
                for (var index=0; index<this.svgResultForXYList.length && !foundY; index++)
                {
                    var xy = this.svgResultForXYList[index];
                    var yPos = parseInt(xy.absoluteY);
                    var startX = parseInt(xy.absoluteStart);
                    var endX = parseInt(xy.absoluteEnd);
                    var heightT = parseInt(xy.getHeight());
                    
                    if (isNumberInRange(pointY, yPos - heightT, yPos) && isNumberInRange(pointX, startX , endX))
                    {
                        svgResult.setLineIndex(parseInt(xy.getLineIndex()));
                        svgResult.setAbsolutePosY(parseInt(xy.getAbsolutePosY()));
                        svgResult.setHeight(parseInt(heightT));
                        
                        svgResult.absoluteStart = parseInt(xy.absoluteStart);
                        svgResult.absoluteEnd = parseInt(xy.absoluteEnd);
                        svgResult.realLength = parseInt(xy.realLength);
                        
                        svgResult.tspanIndex = xy.tspanIndex;
                        svgResult.svgTspan = xy.svgTspan;
                        svgResult.characterIndex = xy.characterIndex;
                        svgResult.characterString = xy.characterString;
                        foundY = true;
                    }
                }
                
                //var foundX = false;
                
                /*
                for (var index=0; index<this.svgResultForXYList.length && !foundX; index++)
                {
                    var xy = this.svgResultForXYList[index];
                    var startX = parseInt(xy.absoluteStart);
                    var endX = parseInt(xy.absoluteEnd);
                    
                    if (isNumberInRange(pointX, startX , endX))
                    {
                        svgResult.absoluteStart = parseInt(xy.absoluteStart);
                        svgResult.absoluteEnd = parseInt(xy.absoluteEnd);
                        svgResult.realLength = xy.realLength;
                        
                        if(foundY)
                        {
                            svgResult.tspanIndex = xy.tspanIndex;
                            svgResult.svgTspan = xy.svgTspan;
                            svgResult.characterIndex = xy.characterIndex;
                            svgResult.characterString = xy.characterString;
                        }
                        foundX = true;
                    }
                }
                */
            };
        
    // find the maximum distance around a highlighted character
    this.findMaximumHighlightedDistance =
        function(startSVGResultForXY)
        {   
            var ret = new SVGDistance();
            var startIndex = parseInt(this.getSVGResultForXYIndex(startSVGResultForXY));
            
            if (startIndex == -1)
            {
                ret.add(startSVGResultForXY);
                return ret;
            }
            var stop = false;
            var len = this.svgResultForXYList.length;
            
            for (var i=startIndex; i<this.svgResultForXYList.length && stop == false; i++)
            {
                var xy = this.svgResultForXYList[i];
                var test = this.isCharacterHighlighted(xy);
                
                if (test == true)
                {
                    ret.add(xy);
                }
                else
                {
                    stop = true;
                }
            }
            stop = false;
            for (var i=startIndex-1; i>=0 && stop == false; i--) // hux:
                                                                    // changed
                                                                    // from var
                                                                    // i=startIndex
                                                                    // to var
                                                                    // i=startIndex-1
            {
                var xy = this.svgResultForXYList[i];
                if (this.isCharacterHighlighted(xy))
                {
                    ret.add(xy);
                }
                else
                {
                    stop = true;
                }
            }
            return ret;
        };
        
        
    // find the corresponding tspan for a given x,y pair
    this.getTspanInformationForXY =
        function(x, y)
        {
            try
            {
                for (var i=0; i<this.svgResultForXYList.length; i++)
                {
                    var svgResultForXY = this.svgResultForXYList[i];
                    
                    var startX = parseInt(svgResultForXY.absoluteStart);
                    var endX = parseInt(svgResultForXY.absoluteEnd);
                    
                    var lowerY = parseInt(svgResultForXY.svgTspan.getStartPositionOfChar(0).y);
                    var heightT = parseInt(svgResultForXY.getHeight());
                    
                    var offset = heightT * 0.2;
                    lowerY = lowerY + offset;
                    
                    var upperY = lowerY - heightT;
                    
                    if (isNumberInRange(x, startX, endX) && isNumberInRange(y, upperY, lowerY))
                    {
                        return svgResultForXY;
                    }
                }
                //log.debug("isNumberInRange = false");
                var result = new SVGResultForXY(-1, -1, -1, -1, null, null, null, -1, -1, -1, -1, -1, false);
                result.absoluteStart = x;
                result.setAbsolutePosY(y);
                this.setYValuesForSvgResult(result);
                
                return result;
            }
            catch(exception)
            {
                var result = new SVGResultForXY(-1, -1, -1, -1, null, null, null, -1, -1, -1, -1, -1, false);
                result.absoluteStart = x;
                result.setAbsolutePosY(y);
                return result;
            }
        };  
    
        
    // find the boundaries of the word wich contains the given SVGResultForXY
    this.findWordBounds =
        function(startSVGResultForXY)
        {   
            var ret = new SVGDistance();
            
            if(startSVGResultForXY != null && startSVGResultForXY.svgTspan != null)
            {
                var string = startSVGResultForXY.getTspanWrapper().getTspanText();
                var startIndex = parseInt(this.getSVGResultForXYIndex(startSVGResultForXY));
                var startCharIndex = startSVGResultForXY.characterIndex;
                
                var clickedChar = string.charAt(startCharIndex);
                if(vars.glbNonDblclickHighlightable.indexOf(clickedChar) == -1) // +++
                                                                                // if
                                                                                // not
                                                                                // clicked
                                                                                // on a
                                                                                // non-dblClick-selectable
                                                                                // char
                {
                    // find lower bound
                    var addIndex = startIndex;
                    var lowerFound = false;
                    for (var i=startCharIndex; i>=0 && lowerFound == false; i--)
                    {
                        var charAtIndex = string.charAt(i);
                        
                        if (vars.glbNonDblclickHighlightable.indexOf(charAtIndex) != -1)
                        {
                            lowerFound = true;
                        }
                        else
                        {
                            var svgResult = this.svgResultForXYList[addIndex];
                            ret.add(svgResult);
                            addIndex--;
                        }
                    }
                    
                    // find upper bound
                    var addIndex = startIndex+1;
                    var upperFound = false;
                    for (var i=startCharIndex+1; i<this.svgResultForXYList.length && upperFound == false; i++)
                    {
                        var charAtIndex = string.charAt(i);
                        if (vars.glbNonDblclickHighlightable.indexOf(charAtIndex) != -1)
                        {
                            upperFound = true;
                        }
                        else
                        {
                            var svgResult = this.svgResultForXYList[addIndex];
                            ret.add(svgResult);
                            addIndex++;
                        }
                    }
                }
            }
            return ret;
        };
        
        
        // find the boundaries of the paragraph wich contains the given
        // SVGResultForXY
    this.findParagraphBounds =
        function(startSVGResultForXY)
        {
            var paragraphDistance = new SVGDistance();
            var paragraphNumber = startSVGResultForXY.paragraphNumber;
            
            for (var i=0; i<this.svgResultForXYList.length; i++)
            {
                var xy = this.svgResultForXYList[i];
                
                if(xy.paragraphNumber == paragraphNumber)
                {
                    paragraphDistance.add(xy);
                }
            }
            return paragraphDistance;
        };
        
    // find the boundaries of the tSpan for the given tspanWrapper
    this.findTspanBounds =
        function(tspanWrapper)
        {
            var tspanDistance = new SVGDistance();
            var start = tspanWrapper.startSvgResultForXY;
            var end = tspanWrapper.endSvgResultForXY;
            
            if(start != null && end != null)
            {
                tspanDistance = this.getDistanceSVGResultForXYList(start, end);
            }
            return tspanDistance;
        };
}

function findMouseoverLocation(startSVGResultForXY, endSVGResultForXY)
{
    var absX = Math.abs(startSVGResultForXY.absoluteStart - endSVGResultForXY.eventX) ;
    var absY = Math.abs(startSVGResultForXY.getAbsolutePosY() - endSVGResultForXY.eventY);
    var mouseOverX = startSVGResultForXY.absoluteStart;
    var mouseOverY = startSVGResultForXY.getAbsolutePosY();
    var mouseMoveX = endSVGResultForXY.eventX;
    var mouseMoveY = endSVGResultForXY.eventY;
    var tfWidth = vars.cbaTextFieldWidth;
    var tfHeight = vars.cbaTextFieldHeight;
    
    if (absX == 0)
    {
      if (mouseOverY - mouseMoveY > 0) vars.mouseOverSouth = true;
      else vars.mouseOverNorth = true;
    }
    else if (absY == 0)
    {
      if (mouseOverX - mouseMoveX > 0) vars.mouseOverEast = true;
      else vars.mouseOverWest = true;
    }
    else
    {
      var angleSide3 = absY;
      var angleSide1 = 0;
      var angleSide2 = 0;
      if (mouseOverX > mouseMoveX)
      {
        angleSide1 = tfWidth - mouseOverX;
        angleSide2 = tfWidth - mouseMoveX;
      } 
      else
      {
        angleSide1 = mouseOverX;
        angleSide2 = mouseMoveX;
      }
      /*compute X : [(angleSide1 / angleSide2) == 
                    (x / x+angleSide3)]  */
      var x = (angleSide1*angleSide3)/(angleSide2-angleSide1);
      if (mouseOverY < mouseMoveY)
      {
         if (mouseOverY - x < 0)
         {
           vars.mouseOverNorth = true;
         }
      }
      else
      {
        if (mouseOverY + x > tfHeight)
        {
            vars.mouseOverSouth = true;
        }
      } 
        
      if (!vars.mouseOverNorth && !vars.mouseOverSouth)
      {
        if (mouseOverX < mouseMoveX)
        {
            vars.mouseOverWest = true;
        }
        else
        {
            vars.mouseOverEast = true;
        }
      }
    }    
}

/*
 * Helper function for sorting arrays of numbers
 * 
 */
function Numsort (a, b) {
  return a > b;
}


function Round(x,s)
{
  // Runden des Wertes x auf s Nachkommastellen
  if(x.toFixed)
  {
    return x.toFixed(s);
  }
  else
  {
    return parseInt(x*Math.pow(10,s)+0.5)/Math.pow(10,s);
  }
}



/**
 * The string which is sent to the parent is a comma separated list of 1...n of
 * the following items: Deselection: "0" + TextblockId Partial Selection "1" +
 * TextblockId Complete Selection "2" + TextblockId
 * 
 * e.g. "2TB1,2TB3,1TB4"
 * 
 */
function getTextblockSelectionStateString()
{
    var selectString = "";
    var svgResultForXYList = vars.glbSVGTable.svgResultForXYList;
    
    for (var i=0; i<vars.glbTextBlockArray.length; i++)
    {
        var textblock = vars.glbTextBlockArray[i];
        var charNumberList = textblock.getCharNumberList();
        
        var textblockId = textblock.id;
        var selectedCharsCount = 0;
        var selectedSpacesCount = 0;
        var nonSelectedSpacesCount = 0;
        var selectState = "";
        var loopCompleted = false;
        
        for (var k=0; k<charNumberList.length && !loopCompleted; k++)
        {
            var tbCharNumber = charNumberList[k];
            
            var index = parseInt(tbCharNumber);
            var lastSVGResultIndex = svgResultForXYList.length - 1;
            if (tbCharNumber > lastSVGResultIndex)
            {
                index = lastSVGResultIndex;
            }
            
            var svgResultForXY = findSvgResultForTextblockCharNumber(svgResultForXYList, index, tbCharNumber);
            
            if (vars.glbSVGTable.isCharacterHighlighted(svgResultForXY))
            {
                if(svgResultForXY.characterString == " ")
                {
                    selectedSpacesCount ++;
                }
                else
                {
                    selectedCharsCount ++;
                }
            }
            else if(svgResultForXY.characterString == " ")
            {
                nonSelectedSpacesCount ++;
            }
            else
            {
                if(selectedCharsCount > 0) //HUX: may need to be adopted... (selectedCharsCount + selectedSpacesCount)
                {
                    loopCompleted = true;
                }
            }
        }
        selectString = extendSelectString(selectString, selectedCharsCount, selectedSpacesCount, nonSelectedSpacesCount, charNumberList ,textblockId);
    }
    return selectString;
}


function findSvgResultForTextblockCharNumber(svgResultForXYList, startIndex, tbCharNumber)
{
    var svgResultForXY = null;
    var found = false;
    
    for (var i=startIndex; i >= 0 && !found; i--)
    {
        var xy = svgResultForXYList[i];
        if(xy.charNumber == tbCharNumber || (xy.charNumber < tbCharNumber && xy.getIsBullet))
        {
            found = true;
            svgResultForXY =xy;
        }
    }
    return svgResultForXY;
}


function extendSelectString(selectString, selectedCharsCount, selectedSpacesCount, nonSelectedSpacesCount, charNumberList ,textblockId)
{
    if(selectedCharsCount == 0)
    {
        selectState = "0";
    }
    else if((selectedCharsCount + selectedSpacesCount) == charNumberList.length)
    {
        selectState = "2";
    }
    else if((selectedCharsCount + selectedSpacesCount + nonSelectedSpacesCount) == charNumberList.length)
    {
        selectState = "2";
    }
    else if(selectedCharsCount > 0)// at least 1 non-space-char is selected
    {
        selectState = "1";
    }
    if(selectString == "")
    {
        selectString += selectState + textblockId;
    }
    else
    {
        selectString += ","+selectState + textblockId;
    }
    return selectString;
}


function announceTextblockSelectionState(selectString)
{
    try
    {
        vars.clickAction = "selectionChange";
        eval(getRealParentForTextField()+ "." + vars.cbaTextFieldId + ".selectTextBlocks(\"" + selectString + "\"," + vars.doubleClickInProgress +");");
    }
    catch(exception)
    {
        // throw exception;
    }
}


function QuickSort()
{
    this.sort =
        function(array, begin, end)
        {
            if(end-1 > begin)
            {
                var pivot=begin+Math.floor(Math.random()*(end-begin));
                pivot=partition(array, begin, end, pivot);
                qsort(array, begin, pivot);
                qsort(array, pivot+1, end);
            }
        };

    this.partition =
        function(array, begin, end, pivot)
        {
            var piv=array[pivot];
            array.swap(pivot, end-1);
            var store=begin;
            var ix;
            for(ix=begin; ix<end-1; ++ix)
            {
                if(array[ix]<=piv)
                {
                    array.swap(store, ix);
                    ++store;
                }
            }
            array.swap(end-1, store);
            return store;
        };
        
    Array.prototype.swap =
        function(a, b)
            {
                var tmp=this[a];
                this[a]=this[b];
                this[b]=tmp;
            };
}


/**
 * 
 * Utility methods
 * 
 */
function incrementLineCounter()
{
    vars.glbLineCounter = parseInt(vars.glbLineCounter) + 1;
    vars.glbSVGTable.addNewLine();
}

function resetLineCounter()
{
    vars.glbLineCounter = 0;
}

function getLineCounter()
{
    return vars.glbLineCounter;
}




function incrementFragmentTspanCounter()
{
    vars.glbFragmentTspanCounter = parseInt(vars.glbFragmentTspanCounter) + 1;
}

function decrementFragmentTspanCounter()
{
    vars.glbFragmentTspanCounter = parseInt(vars.glbFragmentTspanCounter) - 1;
}

function resetFragmentTspanCounter()
{
    vars.glbFragmentTspanCounter = 0;
}

function getFragmentTspanCounter()
{
    return vars.glbFragmentTspanCounter;
}




function incrementParagraphFragmentCounter()
{
    vars.glbParagraphFragmentCounter = parseInt(vars.glbParagraphFragmentCounter) + 1;
}

function decrementParagraphFragmentCounter()
{
    vars.glbParagraphFragmentCounter = parseInt(vars.glbParagraphFragmentCounter) - 1;
}

function resetParagraphFragmentCounter()
{
    vars.glbParagraphFragmentCounter = 0;
}

function getParagraphFragmentCounter()
{
    return vars.glbParagraphFragmentCounter;
}


function incrementLineTspanCounter()
{
    vars.glbLineTspanCounter = parseInt(vars.glbLineTspanCounter) + 1;
}

function decrementLineTspanCounter()
{
    vars.glbLineTspanCounter = parseInt(vars.glbLineTspanCounter) - 1;
}

function resetLineTspanCounter()
{
    vars.glbLineTspanCounter = 0;
}

function getLineTspanCounter()
{
    return vars.glbLineTspanCounter;
}


function setCurrentLineWidth(val)
{
    vars.glbCurrentLineWidth = val;
}

function incrementCurrentLineWidth(val)
{
    vars.glbCurrentLineWidth = parseInt(vars.glbCurrentLineWidth) + parseInt(val);
}

function resetCurrentLineWidth()
{
    vars.glbCurrentLineWidth = 0;
}

function getCurrentLineWidth()
{
    return vars.glbCurrentLineWidth;
}


function getCurrentBulletIndentation()
{
    return vars.glbCurrentBulletIndentation;
}

function setCurrentBulletIndentation(x)
{
    vars.glbCurrentBulletIndentation = x;
}

function getCurrentBulletLength()
{
    return vars.glbCurrentBulletLength;
}

function setCurrentBulletLength(x)
{
    vars.glbCurrentBulletLength = x;
}



var glbIndentation = 0;

function getCurrentIndentation()
{
    return glbIndentation;
}

function setCurrentIndentation(x)
{
    glbIndentation = x;
}


function hideSVGElement(obj) {
    obj.setAttribute('opacity', '0');
}

function showSVGElement(obj) {
    obj.setAttribute('opacity', '1');
}

function debug(msg)
{
    if (glbDEBUG == true)
    {
        // alert("[DEBUG] " + msg);
    }
}


function processReferences()
{
    var cbaEmbeddedReferenceList = vars.glbSvgRootElement.getElementsByTagNameNS(vars.glbCbaNamespace, vars.glbCbaEmbeddedReference);
    if(cbaEmbeddedReferenceList != null)
    {
        for (var i=0; i<cbaEmbeddedReferenceList.length; i++)
        {
            var cbaEmbeddedReference = cbaEmbeddedReferenceList.item(i);
            var id = cbaEmbeddedReference.getAttribute("id");
            var start = cbaEmbeddedReference.getAttribute("start");
            var length = cbaEmbeddedReference.getAttribute("length");
            var reference = cbaEmbeddedReference.getAttribute("reference");
            var referenceId = cbaEmbeddedReference.getAttribute("referenceId");
            var visitedLinkColor = cbaEmbeddedReference.getAttribute("visitedLinkColor");
            var isSameLinkColor = cbaEmbeddedReference.getAttribute("useSameColorForVisitedLink");
            var embeddedReference = new EmbeddedReference(id, parseInt(start), parseInt(length), reference, referenceId, visitedLinkColor, isSameLinkColor);
            vars.glbEmbeddedReferenceArray.push(embeddedReference);
        }
    }
}


// The EmbeddedReference object
function EmbeddedReference(id, startCharNumber, length, reference, referenceId, visitedLinkColor, isSameLinkColor)
{
    this.id = id;
    this.startCharNumber = startCharNumber; 
    this.length = length;
    this.reference = reference;
    this.referenceId = referenceId;
    this.visitedLinkColor = visitedLinkColor;
    this.isSameLinkColor = isSameLinkColor;
    this.endCharNumber = startCharNumber + (length-1);
    this.referenceString = "";
    
    this.containsCharNumber =
        function(charNumber)
        {
            return !(charNumber < this.startCharNumber || charNumber > this.endCharNumber);
            // return (charNumber >= this.startCharNumber && charNumber <=
            // this.endCharNumber);
        };
        
    this.getId =
        function()
        {
            return this.id;
        };
        
    this.addReferenceChar =
        function(char)
        {
            this.referenceString = this.referenceString + char;
        };
        
    this.getReferenceText =
        function()
        {
            return this.referenceString;
        };
        
    this.getReference =
        function()
        {
            return this.reference;
        };
        
    this.getReferenceId =
        function()
        {
            return this.referenceId;
        };
    
    this.getVisitedLinkColor =
        function()
        {
            return this.visitedLinkColor;
        };
        
    this.getIsSameLinkColor =
        function()
        {
            return (this.isSameLinkColor == null || this.isSameLinkColor === 'true') ? true : false;
        };
}


function displayTextBlockInformation()
{
    for (var i=0; i<vars.glbTextBlockArray.length; i++)
    {
        var textblock = vars.glbTextBlockArray[i];
        log.debug("TB-ID = "+textblock.id);
        log.debug("FirstCharNumber ="+textblock.getFirstCharNumber());
        log.debug("LastCharNumber ="+textblock.getLastCharNumber());
        log.debug("Detail:"+textblock.toString());
    }
}



/**
 * Normalize the index (position) of a text fragment.
 * The start position must be greater or equal zero. 
 * The end position must not point past the last character of the TextFields text.
 * @author HMA
 */
function normalizeTextBlockFragmentIndex(indexString)
{
    var lastIndex = vars.charCounter - 1;
    var index = parseInt(indexString);
    if (index < 0) return 0;
    if (index > lastIndex) return lastIndex;
    return index;
}


/*
 * processTextBlocks called upon onload event.
 * 
 */
function processTextBlocks()
{
    var cbaTextBlockList = vars.glbSvgRootElement.getElementsByTagNameNS(vars.glbCbaNamespace, vars.glbCbaTextBlock);
    
    if(cbaTextBlockList != null)
    {
        for (var i=0; i<cbaTextBlockList.length; i++)
        {
            var cbaTextBlock = cbaTextBlockList.item(i);
            var id = cbaTextBlock.getAttribute("id");
            
            var textBlock = new TextBlock(id);
            
            var cbaTextBlockFragmentList = cbaTextBlock.getElementsByTagNameNS(vars.glbCbaNamespace, vars.glbCbaTextBlockFragment);
            for (var j=0; j<cbaTextBlockFragmentList.length; j++)
            {
                var textBlockFragment = cbaTextBlockFragmentList.item(j);
                var startCharNumber = textBlockFragment.getAttribute("start");
                var endCharNumber = textBlockFragment.getAttribute("end");
                //HMA
                //textBlock.addFragment(parseInt(startCharNumber), parseInt(endCharNumber));
                textBlock.addFragment(normalizeTextBlockFragmentIndex(startCharNumber), normalizeTextBlockFragmentIndex(endCharNumber));
            }
            textBlock.getFragmentList().sort(TextblockFragmentSort);
            vars.glbTextBlockArray.push(textBlock);
        }
    }
}


function TextblockFragmentSort (fragment_A, fragment_B)
{
  return fragment_A.getStartCharNumber() > fragment_B.getEndCharNumber();
}


function TextBlock(id)
{
    this.id = id;
    this.fragmentList = new Array();
    this.charNumberList = new Array();
    
    this.addFragment =
        function(startCharNumber, endCharNumber)
        {
            var fragment = new TextBlockFragment(this.id, startCharNumber, endCharNumber);
            this.fragmentList.push(fragment);
            for(var i=startCharNumber; i<=endCharNumber; i++)
            {
                this.charNumberList.push(i);
            }
        };
        
    this.containsCharNumber =
        function(charNumber)
        {
            var ret = false;
            for (var i=0; i<this.fragmentList.length; i++)
            {
                if(this.fragmentList[i].containsCharNumber(charNumber))
                {
                    ret = true;
                }
            }
            return ret;
        };
    
    this.getCharNumberList =
        function()
        {
            return this.charNumberList;
        };
            
    this.getFragmentList =
        function()
        {
            return this.fragmentList;
        };
        
    this.getFragmentCount =
        function()
        {
            return this.fragmentList.length;
        };
        
    this.getFirstCharNumber =
        function()
        {
            return this.fragmentList[0].getStartCharNumber();
        };
        
    this.getLastCharNumber =
        function()
        {
            var lastIndex = this.fragmentList.length -1;
            return this.fragmentList[lastIndex].getEndCharNumber();
        };
        
    this.toString =
        function()
        {
            var infoString = "[";
            for (var i=0; i<this.fragmentList.length; i++)
            {
                infoString += "<";
                infoString += this.fragmentList[i].getStartCharNumber();
                infoString += "-";
                infoString += this.fragmentList[i].getEndCharNumber();
                infoString += ">";
            }
            infoString += "]";
            return infoString;
        };
        
}


function TextBlockFragment(textblockId, startCharNumber, endCharNumber)
{
    this.textblockId = textblockId;
    this.startCharNumber = startCharNumber; 
    this.endCharNumber = endCharNumber;
    
    this.containsCharNumber =
        function(charNumber)
        {
            return !(charNumber < this.startCharNumber || charNumber > this.endCharNumber);
        };
        
    this.getStartCharNumber =
        function()
        {
            return this.startCharNumber;
        };
        
    this.getEndCharNumber =
        function()
        {
            return this.endCharNumber;
        };
}


/*
 * processTextFields called upon 'onload' event.
 * 
 * Currently there will be only one text field to process.
 */
function processTextFields()
{
    var cbaTextFieldList = vars.glbSvgRootElement.getElementsByTagNameNS(vars.glbCbaNamespace, vars.glbCbaTextField);
    
    for (var i=0; i<cbaTextFieldList.length; i++)
    {
        var cbaTextField = cbaTextFieldList.item(i);
        
        vars.tfContainerId = cbaTextField.getAttribute("container-id");
        vars.textContainer = vars.glbSvgDoc.getElementById(vars.tfContainerId);
        
        var svgTextHandler = updateSvgTextField(cbaTextField);
        
        var textfieldWidth = svgTextHandler.getTfWidth(); // parseInt(svgText.getAttribute(null,
                                                            // 'width'));
        
        // hideSVGElement(svgTextHandler.getCurrentSvgText());

        // setTextDirection(cbaTextField, svgTextHandler);
        
        resetLineCounter();
        resetCurrentLineWidth();
               
        var cbaTextParagraphList = cbaTextField.getElementsByTagNameNS(vars.glbCbaNamespace, vars.glbCbaTextParagraph);
        
        // iterate overall paragraphs
        for (var j=0; j<cbaTextParagraphList.length; j++)
        {
            var cbaTextParagraph = cbaTextParagraphList.item(j);
            processTextParagraph(svgTextHandler, cbaTextField, textfieldWidth, cbaTextParagraph);
            vars.glbParagraphCounter = vars.glbParagraphCounter + 1;
            resetParagraphFragmentCounter();
        }
        // showSVGElement(svgTextHandler.getCurrentSvgText());
        
        setSelectionFlag(cbaTextField);
        setLinkCursor(cbaTextField);
        setTableCellProviderFlag(cbaTextField);
        //setHighlightTextTransferFlag(cbaTextField);
        
        resetFields();
    }
    vars.cbaTextFieldList = cbaTextFieldList;
}


/*
 * Rules for enabling selection: 1. default is set to 'true' 2. flag from parent
 * (if present) overwrites the default 3. if the parent flag is null and the
 * cbaTextField attribut 'highlightable' is set to false, then highlighting is
 * not possible
 * 
 */
function setSelectionFlag(cbaTextField)
{
    
    var parentSelectionFlag = getParentSelectionFlag(cbaTextField);
    if(parentSelectionFlag != null)
    {
        vars.glbTextSelectionEnabled = parentSelectionFlag;
    }
    else
    {
        var textfieldSelectionFlag = cbaTextField.getAttribute('highlightable');
        if(textfieldSelectionFlag != null && textfieldSelectionFlag == "false")
        {
            vars.glbTextSelectionEnabled = false;
        }
    }
}


function setLinkCursor(cbaTextField)
{
    
    var linkCursorShape = cbaTextField.getAttribute('link-cursor');
    if(linkCursorShape != null && linkCursorShape != "default")
    {
        vars.linkCursorShape = linkCursorShape;
        vars.showLink = true;
    }
}


//function setHighlightTextTransferFlag(cbaTextField)
//{
//  
//  var linkCursorShape = cbaTextField.getAttribute('highlighttext-transfer');
//    if(linkCursorShape != null && linkCursorShape != "default")
//    {
//      vars.linkCursorShape = linkCursorShape;
//      vars.showLink = true;
//    }
//}


function getParentSelectionFlag(cbaTextField)
{
    var selectionFlag = null;
    try
    {
        var booleanString = eval(getRealParentForTextField()+ "." + vars.cbaTextFieldId + ".getHighlightable();");
        if(booleanString != null)
        {
            if(booleanString.toLowerCase() === 'true')
            {
                selectionFlag = true;
            }
            else
            {
                selectionFlag = false;
            }
        }
    }
    catch(exception)
    {
        selectionFlag = null;
    }
    return selectionFlag;
}


function setTableCellProviderFlag(cbaTextField)
{
    var isTableCellContent = cbaTextField.getAttribute('isTableCellProvider');
    if(isTableCellContent != null && isTableCellContent == "true")
    {
        vars.glbIsTableCellProvider = true;
    }
}



/*
 * updateSvgTextField
 * 
 */
function updateSvgTextField(cbaTextField)
{
    var svgTextId = cbaTextField.getAttribute("id");
    
    /* CPE: Release 6.1 fix */
    //var svgText = vars.glbSvgDoc.getElementById(svgTextId);
    var svgText = retrieveDynamicTextElement(svgTextId)
    
    //svgText.setAttribute("unicode-bidi","bidi-override");
    //svgText.setAttribute("direction","rtl");
    
    // update the svg text field
    var width = cbaTextField.getAttribute("width");      
    var height = cbaTextField.getAttribute("height"); 
    svgText.setAttribute('width', width);
    svgText.setAttribute('height', height);
    
    // create the table object
    var firstLine = parseInt(cbaTextField.getAttribute('first-baseline'));
    var lineSpacing = parseInt(cbaTextField.getAttribute('line-spacing'));
    
    var svgBackgroundRectId = cbaTextField.getAttribute("background-id");
    var svgContainerId = cbaTextField.getAttribute("background-container-id");
    var svgBackgroundRect = vars.glbSvgDoc.getElementById(svgBackgroundRectId);
    var svgContainer = vars.glbSvgDoc.getElementById(svgContainerId);
    vars.highlightColor = svgBackgroundRect.getAttribute("fill");
    vars.glbSVGTable = new SVGTable(firstLine, lineSpacing, svgBackgroundRect, svgContainer);
    
    return new SvgTextHandler(svgText, svgTextId, width);
}

/* Retrieve dynamic text element, different method 
 * -- due to same id value in different namespaces
 * -- old method not working since FF 32 update  
 */ 
function retrieveDynamicTextElement(svgTextId)
{
    var cbaSvgTextsList = vars.glbSvgDoc.getElementsByTagName('text');
    if (cbaSvgTextsList != null)
    {
        for (var i=0; i < cbaSvgTextsList.length; i++)
        {
            var cbaSvgText = cbaSvgTextsList.item(i);
            var id = cbaSvgText.getAttribute("id");
            if (id === svgTextId) return cbaSvgText;
        }
    }
    return null;
}


/*
 * SvgTextHandler class
 */ 
function SvgTextHandler(svgText, svgTextId, tfWidth)
{
    this.currentSvgText = svgText;
    this.origSvgTextId = svgTextId;
    this.currentSvgTextCounter = 0;
    this.maxTspans = 6;
    this.tspanCounter = 0;
    this.tfWidth = tfWidth;
    this.overAllTspanCounter = 0;
        
    this.incrementTspanCounter =
      function()
      {
        this.tspanCounter++;
      };
      
     this.isTspanLimitReached =
        function()
        {
            return this.tspanCounter > this.maxTspans;
        };
      
     this.getTfWidth =
      function()
      {
        return this.tfWidth;
      };
      
     this.getOverAllTspanCounter =
      function()
      {
        return 0;// this.overAllTspanCounter;
      };
      
    this.getCurrentSvgText =
      function()
      {
        return this.currentSvgText;
      };
     
     this.creatNewSvgText =
        function()
        {
            var svgTextClone = this.currentSvgText.cloneNode(false);
            this.currentSvgTextCounter ++;
            var newSvgTextId = this.origSvgTextId + "_" + this.currentSvgTextCounter;
            svgTextClone.setAttribute('id', newSvgTextId);
            this.tspanCounter = 0;
            vars.textContainer.appendChild(svgTextClone);
            this.currentSvgText = svgTextClone;
        };
     
     this.appendChild =
        function(svgTextTspan)
        {
            this.getCurrentSvgText().appendChild(svgTextTspan);
            this.tspanCounter ++;
        };
     
     this.removeChild =
        function(svgTextTspan)
        {
            this.getCurrentSvgText().removeChild(svgTextTspan);
            this.tspanCounter --;
        };

}



/*
 * processTextParagraph
 * 
 */
function processTextParagraph(svgTextHandler, cbaTextField, textfieldWidth, cbaTextParagraph)
{
    var textParagraphWrapper = new TextParagraphWrapper(cbaTextParagraph);
    textParagraphWrapper.initialise();
    var cbaTextLineList = cbaTextParagraph.getElementsByTagNameNS(vars.glbCbaNamespace, vars.glbCbaTextLine);
    
    setCurrentBulletIndentation(0);
    processEmbeddedImage(svgTextHandler, cbaTextField, textParagraphWrapper);
    var tspanIndex = 0;
    
    // iterate overall lines
    var lastLineIndex = cbaTextLineList.length - 1;
    
    for (var j=0; j<cbaTextLineList.length; j++)
    {
        var cbaTextLine = cbaTextLineList.item(j);
        
        if(textParagraphWrapper.getIsBullet() && j==0)
        {
            vars.glbSVGTable.getCurrentLine().setIsBullet(true);
        }
        
        if (vars.isRTLDirection) svgTextHandler.creatNewSvgText();
        processTextLine(svgTextHandler, cbaTextField, textfieldWidth, j, textParagraphWrapper, cbaTextLine, tspanIndex);
        
        if(textParagraphWrapper.getIsJustified() && j<lastLineIndex)
        {
            justifyLine(vars.glbSVGTable.getCurrentLine(), vars.glbLineJustificationSpace[vars.glbLineCounter]);
        }
        
        // important: first justify, then text decoration!
        handleTextDecorationForCbaTextLine(cbaTextField, vars.glbSVGTable.getCurrentLine());
        
        incrementLineCounter();
        resetLineTspanCounter();
        resetCurrentLineWidth();
    }
}



function TextParagraphWrapper(cbaTextParagraph)
{
    this.cbaTextParagraph = cbaTextParagraph;
    this.paragraphDx = null;
    this.textAnchor = null;
    this.isBullet = false;
    this.leftAligned = false;
    this.middleAligned = false;
    this.rightAligned = false;
    this.justified = false;
    
    this.initialise =
        function()
        {
            this.setParagraphDx();
            this.setAlignment();
            this.setIsBullet();
        };
    
    this.getCbaTextParagraph = 
        function()
        {
            return this.cbaTextParagraph;
        };
    
    this.getParagraphDx =
        function()
        {
            return this.paragraphDx;
        };
        
    this.setParagraphDx = 
        function()
        {
            var dx = this.cbaTextParagraph.getAttribute('dx');
            if(dx != null && dx != "")
            {
                this.paragraphDx = parseInt(dx);
            }
            else
            {
                this.paragraphDx = 0;
            }
        };
        
    this.getIsBullet =
        function()
        {
            return this.isBullet;
        };
        
    this.setIsBullet =
        function()
        {
            var bullet = this.cbaTextParagraph.getAttribute('is-bullet');
            if(bullet == null || bullet == "" || bullet == "false")
            {
                this.isBullet = false;
            }
            else
            {
                this.isBullet = true;
            }
        };
    
    this.getTextAnchor = 
        function()
        {
            return this.textAnchor;
        };
        
    this.getIsLeftAligned = 
        function()
        {
            return this.leftAligned;
        };
        
    this.getIsMiddleAligned = 
        function()
        {
            return this.middleAligned;
        };
        
    this.getIsRightAligned = 
        function()
        {
            return this.rightAligned;
        };
        
    this.getIsJustified =
        function()
        {
            return this.justified;
        };
        
    this.setAlignment =
        function()
        {
            var anchor = this.cbaTextParagraph.getAttribute('text-anchor');
            if (anchor == null || anchor == "" || anchor == "start" || anchor == "justify")
            {
                this.leftAligned = true;
                if(anchor == "justify")
                {
                    this.justified = true;
                }
            }
            else if (anchor == "middle")
            {
                this.middleAligned = true;
            }
            else
            {
                this.rightAligned = true;
            }
            this.textAnchor = anchor;
        };
}


// The TextFragment Wrapper Object
function TextFragmentWrapper(cbaTextFragment, fragmentIndex)
{
    this.cbaTextFragment = cbaTextFragment;
    this.index = fragmentIndex;
    this.textDecoration = null;
    this.fillAttribute = null;
    this.fontFamily = null;
    this.defaultFontFamily = "Arial";
    this.fontWeight = null;
    this.fontStyle = null;
    this.fontSize = null;
    this.text = null;
    this.spaceLength = null;
    this.fragmentDx = 0;
    this.fragmentDy = 0;
    this.baselineDy = 0;  // The baseline-dy is the delta y to the baseline.
    this.spaceTspanTemplate = null;
    this.spaceLengthFactor = null;
    this.positionIncrement = null;
    
    this.initialise =
        function()
        {
            this.setText();
            this.setFontFamily();
            this.setFontWeight();
            this.setFontStyle();
            this.setFontSize();
            this.setFillAttribute();
            this.setFragmentDx();
            this.setFragmentDy();
            this.setBaselineDy();
            this.setTextDecoration();
        };
        
    this.getFragmentIndex = 
        function()
        {
            return this.index;
        };
        
    this.getCbaTextFragment = 
        function()
        {
            return this.cbaTextFragment;
        };
    
    this.getSpaceTspanTemplate =
        function()
        {
            return this.spaceTspanTemplate;
        };
        
    this.setSpaceTspanTemplate =
        function(spaceTspanTemplate)
        {
            this.spaceTspanTemplate = spaceTspanTemplate;
        };
        
    this.getTextDecoration =
        function()
        {
            return this.textDecoration;
        };
        
    this.setTextDecoration =
        function()
        {
            this.textDecoration = this.cbaTextFragment.getAttribute('text-decoration');
        }
    
    this.getPositionIncrement =
        function()
        {
            if(this.positionIncrement == null)
            {
                this.setPositionIncrement();
            }
            return this.positionIncrement;
        };
        
    this.setPositionIncrement =
        function()
        {
            this.positionIncrement = this.cbaTextFragment.getAttribute('position-increment');
        }
        
    this.setText =
        function()
        {
            this.text = this.cbaTextFragment.firstChild.data;
        };
        
    this.getText =
        function()
        {
            return this.text;
        };
        
    this.setFontFamily =
        function()
        {
            this.fontFamily = this.cbaTextFragment.getAttribute('font-family');
            if(this.fontFamily == null || simpleTrim(this.fontFamily) == "")
            {
                this.fontFamily  = "Arial";
            }
        };
        
    this.getFontFamily =
        function()
        {
            return this.fontFamily;
        };
        
    this.setFontWeight =
        function()
        {
            this.fontWeight = this.cbaTextFragment.getAttribute('font-weight');
        };
        
    this.getFontWeight =
        function()
        {
            return this.fontWeight;
        };
        
    this.setFontSize =
        function()
        {
            this.fontSize = this.cbaTextFragment.getAttribute('font-size');
        };
        
    this.getFontSize =
        function()
        {
            return this.fontSize;
        };
    
    this.setFontStyle =
        function()
        {
            this.fontStyle = this.cbaTextFragment.getAttribute('font-style');
        };
        
    this.getFontStyle =
        function()
        {
            return this.fontStyle;
        };
        
    this.setFillAttribute =
        function()
        {
            this.fillAttribute = this.cbaTextFragment.getAttribute('fill');
        };
        
    this.getFillAttribute =
        function()
        {
            return this.fillAttribute;
        };
        
    this.setFragmentDx =
        function()
        {
            var dx = this.cbaTextFragment.getAttribute('dx');
            if (dx != null && dx != "")
            {
                this.fragmentDx = parseInt(dx);
            }
        };
        
    this.getFragmentDx =
        function()
        {
            return this.fragmentDx;
        };
        
    this.setFragmentDy =
        function()
        {
            var dy = this.cbaTextFragment.getAttribute('dy');
            if (dy != null && dy != "")
            {
                this.fragmentDy = parseInt(dy);
            }
        };
        
    this.getFragmentDy =
        function()
        {
            return this.fragmentDy;
        };
        
    this.setBaselineDy =
        function()
        {
            var baseDy = this.cbaTextFragment.getAttribute('baseline-dy');
            if (baseDy != null && baseDy != "")
            {
                return parseInt(baseDy);
            }
        };
        
    this.getBaselineDy =
        function()
        {
            return this.baselineDy;
        };
        
    this.setSpaceLength =
        function(length)
        {
            this.spaceLength = length;
        };
        
    this.getSpaceLength =
        function()
        {
            return this.spaceLength;
        };
        
    this.setSpaceLengthFactor =
        function(factor)
        {
            this.spaceLengthFactor = factor;
        };
        
    this.getSpaceLengthFactor =
        function()
        {
            return this.spaceLengthFactor;
        };
}


/*
 * processTextLine
 * 
 */
function processTextLine(svgTextHandler, cbaTextField, textfieldWidth, lineIndex, textParagraphWrapper, cbaTextLine, tspanIndex)
{
    var cbaTextFragmentList = cbaTextLine.getElementsByTagNameNS(vars.glbCbaNamespace, vars.glbCbaTextFragment);
    
    setCurrentIndentation(0);
    
    // iterate overall fragments
    for (var j=0; j<cbaTextFragmentList.length; j++)
    {
        resetFragmentTspanCounter();
        
        var cbaTextFragment = cbaTextFragmentList.item(j);
        var textFragmentWrapper = new TextFragmentWrapper(cbaTextFragment, j);
        textFragmentWrapper.initialise();
        
        var cbaLookAheadTextFragment;
        var text = textFragmentWrapper.getText();
        
        if (j < cbaTextFragmentList.length - 1)
        {
            cbaLookAheadTextFragment = cbaTextFragmentList.item(j + 1);
        }
        else 
        {
            cbaLookAheadTextFragment = null;
        }
        
        var fragmentIndex = createTspan(svgTextHandler, cbaTextField, textfieldWidth, cbaTextLine, 0, lineIndex, j, 0, textParagraphWrapper, textFragmentWrapper, text, tspanIndex, cbaLookAheadTextFragment); 
        
        while(fragmentIndex < j)
        {
            decrementParagraphFragmentCounter();
            j--;
        }
        incrementParagraphFragmentCounter();
    } 
    // return tspanIndex;
}


/*
 * setXValueForTspan
 * 
 */
function setXValueForTspan(textParagraphWrapper, svgTspan, x, width, dx)
{
	if (vars.isRTLDirection)
	{
		 width = (-1)*width;
		 dx = (-1)*dx;
	}

    if (textParagraphWrapper.getIsLeftAligned())
    {
        svgTspan.setAttribute('x', x + dx);
        svgTspan.setAttribute('text-anchor', 'start');
    }
    else if (textParagraphWrapper.getIsMiddleAligned())
    {
        svgTspan.setAttribute('x', width  / 2 + dx);
        svgTspan.setAttribute('text-anchor', 'middle');
    }
    else
    {
        svgTspan.setAttribute('x', width + parseInt(dx));
        svgTspan.setAttribute('text-anchor', 'end');
    }
}


/*
 * setFontInformationForTspan
 * 
 */
function setFontInformationForTspan(textFragmentWrapper, svgTspan)
{
	svgTspan.setAttribute('font-family', textFragmentWrapper.getFontFamily());
    svgTspan.setAttribute('font-size',   textFragmentWrapper.getFontSize());
    svgTspan.setAttribute('font-weight', textFragmentWrapper.getFontWeight());
    svgTspan.setAttribute('font-style',  textFragmentWrapper.getFontStyle());
    svgTspan.setAttribute('style','white-space:pre;');
    
    var fillColor = textFragmentWrapper.getFillAttribute();
    svgTspan.setAttribute('fill',       fillColor);
}


/*
 * getSvgImage
 * 
 */
function getSvgImage(textParagraphWrapper)
{
    var cbaTextParagraph = textParagraphWrapper.getCbaTextParagraph();
    var cbaEmbeddedImageList = cbaTextParagraph.getElementsByTagNameNS(vars.glbCbaNamespace, vars.glbCbaEmbeddedImage);
    if (cbaEmbeddedImageList != null && cbaEmbeddedImageList.length > 0)
    {
        var cbaEmbeddedImage = cbaEmbeddedImageList[0];
        
        var svgImageId = cbaEmbeddedImage.getAttribute('image-id');
        var svgImage = vars.glbSvgDoc.getElementById(svgImageId);
        return svgImage;
    }
    return null;
}


/*
 * getImageIndentation
 * 
 */
function getImageIndentation(textParagraphWrapper)
{
    var svgImage = getSvgImage(textParagraphWrapper);
    if (svgImage == null) return 0;
    var imageIndentation = parseInt(svgImage.getAttribute('x')) + parseInt(svgImage.getAttribute('width'));
    return imageIndentation;
}


/*
 * processEmbeddedImage
 * 
 */
function processEmbeddedImage(svgTextHandler, cbaTextField, textParagraphWrapper)
{
    var cbaTextParagraph = textParagraphWrapper.getCbaTextParagraph();
    var cbaEmbeddedImageList = cbaTextParagraph.getElementsByTagNameNS(vars.glbCbaNamespace, vars.glbCbaEmbeddedImage);
    if (cbaEmbeddedImageList != null && cbaEmbeddedImageList.length > 0)
    {
        var cbaEmbeddedImage = cbaEmbeddedImageList[0];
        
        var svgImageId = cbaEmbeddedImage.getAttribute('image-id');
        var width = parseInt(cbaEmbeddedImage.getAttribute('width'));
        var height = parseInt(cbaEmbeddedImage.getAttribute('height'));

        var svgImage = vars.glbSvgDoc.getElementById(svgImageId);
        var x = 0;
        // first place it on 0,0
        // after the creation of the first tspan, the image will be moved
        var y = 0;
        
        if (textParagraphWrapper.getIsBullet())
        {
            // beginning of a line, add dx from the bullet indentation paragraph
            var dx = getCurrentBulletIndentation(); 
            x = dx + textParagraphWrapper.getParagraphDx();
        }
        else
        {
            var dx = textParagraphWrapper.getParagraphDx(); 
            x = dx;
        }
        
        svgImage.setAttribute('x', x);
        svgImage.setAttribute('y', y);
        svgImage.setAttribute('width', width);
        svgImage.setAttribute('height', height);
        
        //FIX for Chrome, Opera images
        var imageReference = svgImage.getAttribute('href');
        if (imageReference.indexOf('#ref_') == 0) imageReference = imageReference.substring(5);
        svgImage.removeAttribute('href');
        svgImage.setAttributeNS(glbXlinkNamespace, xlink, imageReference);
        
        var imageIndentation = parseInt(svgImage.getAttribute('x')) + parseInt(svgImage.getAttribute('width'));
        
        vars.glbImagePosStartY = y;
        vars.glbImagePosEndY = y+height;
        vars.glbLastImageIndentation = imageIndentation;
        
        return svgImage;    
    }
    return null;
}



/*
 * moveSvgImage
 * 
 */
function moveSvgImage(textFragmentWrapper, svgTspan, svgImage)
{
    try
    {
        if (svgImage != null)
        {
        	if (vars.isRTLDirection)
            {
                var x = svgImage.getAttribute('x');
                var width = svgImage.getAttribute('width');
                var updatedX = (-1)*(x + width);
                svgImage.setAttribute('x', updatedX);
            }
        
            var y = svgTspan.getStartPositionOfChar(0).y;
            var height = textFragmentWrapper.getFontSize();
            y = parseFloat(y) - parseFloat(height);
            
            svgImage.setAttribute('y', y);
            
            vars.glbImagePosStartY = y;
            var ingHeight = parseInt(svgImage.getAttribute('height'));
            vars.glbImagePosEndY = y+ingHeight;
        }
    }
    catch(exception)
    {
    }
}


function simpleTrim_unused(s) {
  if(s==null) s="";
  while (s.substring(0,1) == ' ') {
    s = s.substring(1,s.length);
  }
  while (s.substring(s.length-1,s.length) == ' ') {
    s = s.substring(0,s.length-1);
  }
  return s;
}


function simpleTrim(str)
{
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}


function getJustificationStartIndex(tspanWrapperList)
{
    var startIndex = -1;
    var found = false;
    
    for (var i=0; i<tspanWrapperList.length && !found; i++)
    {
        startIndex++; // TODO check this
        
        var tspanText = tspanWrapperList[i].getTspanText();
        if(tspanText != null && simpleTrim(tspanText) != "" )
        {
            found = true;
        }
    }
    return startIndex;
}


function getJustificationEndIndex(tspanWrapperList)
{
    var endIndex = tspanWrapperList.length;
    var found = false;
    
    for (var i=tspanWrapperList.length-1; i>-1 && !found; i--)
    {
        endIndex--;
        var tspanText = tspanWrapperList[i].getTspanText();
        if(tspanText != null && simpleTrim(tspanText) != "" )
        {
            found = true;
        }
    }
    return endIndex;
}


function justifyLine(textLine, availableSpace)
{
    var tspanWrapperList = textLine.tspanWrapperList;
    
    if(tspanWrapperList != null && availableSpace > 0)
    {
        var startIndex = getJustificationStartIndex(tspanWrapperList);
        var endIndex = getJustificationEndIndex(tspanWrapperList);
        
        for (var j=startIndex; j<endIndex; j++)
        {
            var tspanText = tspanWrapperList[j].getTspanText();
            
            if(tspanText != null && simpleTrim(tspanText) == "" )
            {
                var tspan = tspanWrapperList[j].getTspan();
                vars.justificationArray.push(tspanWrapperList[j]);
            }
        }
    }
    
    var justificationSpaceCount = vars.justificationArray.length;
    
    if(availableSpace > 0 && justificationSpaceCount > 0)
    {
        if(availableSpace < justificationSpaceCount)
        {
            tspanSpace = 0;
            rest = availableSpace;
        }
        else if(availableSpace >= justificationSpaceCount)
        {
            tspanSpace = Math.floor(availableSpace/justificationSpaceCount);
            rest = availableSpace % justificationSpaceCount;
        }
        
        for (var k=0; k<justificationSpaceCount; k++)
        {
            var tspanWrapper = vars.justificationArray[k];
            var spaceTspan = tspanWrapper.getTspan();
            var spacePixelCount = tspanSpace + ((k+1 <= rest)? 1: 0);
            
            var spaceTspanText = spaceTspan.firstChild.data;
            
            var additionalSpaces = new StringBuffer();
            for (var m=0; m<spacePixelCount; m++)
            {
                additionalSpaces.append(" ");
            }
            
            var extendedText = spaceTspanText + additionalSpaces.toString();
            spaceTspan.firstChild.data = extendedText;
            tspanWrapper.setComputedTextLength(spaceTspan.getComputedTextLength());
        }
    }
    vars.justificationArray.length = 0;
}
    
    
function handleTextDecorationForCbaTextLine(cbaTextField, textLine)
{
    var tspanWrapperList = textLine.tspanWrapperList;
    
    for (var j=0; j<tspanWrapperList.length; j++)
    {
        var tspanWrapper = tspanWrapperList[j];
        var textDecoration = tspanWrapper.getTextDecoration();
        
        if(textDecoration != null)
        {
            handleTextDecorationForCbaTspan(cbaTextField, tspanWrapper, textDecoration);
        }
    }
}


function handleTextDecorationForCbaTspan(cbaTextField, tspanWrapper, textDecoration)
{
	if ( vars.isRTLDirection ) return;
    if (textDecoration == "underline")
    {
        handleTextUnderlineForCbaTspan(cbaTextField, tspanWrapper, textDecoration);
    }
}


function handleTextUnderlineForCbaTspan(cbaTextField, tspanWrapper, textDecoration)
{
    try
    {
        var cbaTspan = tspanWrapper.getTspan();
        var computedTextLength = tspanWrapper.getComputedTextLength();
        if(computedTextLength == null)
        {
            computedTextLength = cbaTspan.getComputedTextLength();
            tspanWrapper.setComputedTextLength(computedTextLength);
        }
    
        var svgPoint = cbaTspan.getStartPositionOfChar(0);
        
        var x1 = svgPoint.x;
        var x2 = x1 + computedTextLength;
        if (vars.isRTLDirection) 
        {
        	if (isRTLString(cbaTspan)) x2 = x1 - computedTextLength;
        }
        
        var lineY = cbaTspan.getStartPositionOfChar(0).y;
        var lineDy = 2;
        var svgLine = vars.glbSvgDoc.createElementNS(vars.glbSvgNamespace, 'line');
        
        svgLine.setAttribute('x1', x1);  
        svgLine.setAttribute('y1', lineY + lineDy);
        svgLine.setAttribute('x2', x2);
        svgLine.setAttribute('y2', lineY + lineDy);
        svgLine.setAttribute('stroke', cbaTspan.getAttribute('fill'));
        svgLine.setAttribute('stroke-width', 1);
        
        var svgContainerId = cbaTextField.getAttribute("container-id");
        var svgContainer = vars.glbSvgDoc.getElementById(svgContainerId);
        svgContainer.appendChild(svgLine);
        
        tspanWrapper.setUnderline(svgLine);
    }
    catch(exception)
    {
    }
}


/*
 * createTspan
 * 
 */
function createTspan(svgTextHandler, cbaTextField, textfieldWidth, cbaTextLine, x, lineIndex, fragmentIndex, customFragmentLine, textParagraphWrapper, textFragmentWrapper, text, tspanIndex, cbaLookAheadTextFragment)
{
    var cbaNextTextFragment = cbaLookAheadTextFragment;
    var nettoWidth = parseInt(textfieldWidth - parseInt(getCurrentIndentation()));
    var remainingText = text + "";
    var tspanText = "";
    var tspanBuffer = "";
    var remainingBuffer = "";
    var computedTextLength = 0;
    var computedSpaceLength = 0;
    var svgTextTspan = null;
    var svgSpaceTspan = null;
    var forcedWrite = false;
    var isFirstTspanInFragment = true;
    var bulletOffset = 0;
    // var fragmentIndex = null;
    
    var spaceIndex = remainingText.indexOf(" ");
    if(spaceIndex == 0)
    {
        tspanText = " ";
        remainingText = (remainingText.length > spaceIndex)? remainingText.substring(spaceIndex+1) : "";
        svgTextTspan = createSpaceTspan(textFragmentWrapper);
        spaceIndex = -1;
    }
    else
    {
        setTspanText(spaceIndex);
        svgTextTspan = doCreateTspan(textFragmentWrapper, tspanText);
    }
    
    
    
    var tspanDeltaY = setYOffsetForTspan(svgTextTspan, isFirstTspanInFragment, fragmentIndex);
    
    var computedTextLength = addTextTspan(svgTextTspan, textFragmentWrapper);
    
    setSvgImagePositionY(textParagraphWrapper, textFragmentWrapper, svgTextTspan);
    
    setXOffsetForTspan(svgTextTspan, computedTextLength, isFirstTspanInFragment, fragmentIndex, tspanDeltaY);
    
    isFirstTspanInFragment = false; // for all the following tspans within this
                                    // fragment
    
    nettoWidth = parseInt(textfieldWidth - parseInt(getCurrentIndentation()));
    
    vars.glbCurrentNettoWidth = nettoWidth;
    
    if (spaceIndex != -1)
    {
        svgSpaceTspan = createNewSpaceTspan(textFragmentWrapper, textParagraphWrapper, svgTextHandler);
        computedSpaceLength = addSpaceTspan(svgSpaceTspan, textFragmentWrapper);
    }
    var lineLength = parseInt(getCurrentLineWidth()) + computedTextLength + computedSpaceLength;
    
    if(lineLength > nettoWidth && getCurrentLineWidth() == 0)
    {
        forcedWrite = true; //  although the lineLength is less than nettoWidth, the first word in the line is always written
    }
    setCurrentLineWidth(lineLength);
    
    while (lineLength < nettoWidth && remainingText.length > 0 )
    {
        spaceIndex = remainingText.indexOf(" ");
        
        if(spaceIndex == 0)
        {
            if(simpleTrim(remainingText) == "")
            {
                setTspanText(spaceIndex);
                svgTextTspan = createNewSpaceTspan(textFragmentWrapper, textParagraphWrapper, svgTextHandler);
                spaceIndex = -1;
            }
            else
            {
                remainingText = (remainingText.length > spaceIndex+1)? remainingText.substring(spaceIndex+1) : "";
                svgTextTspan = createNewSpaceTspan(textFragmentWrapper, textParagraphWrapper, svgTextHandler);
                spaceIndex = -1;
            }
        }
        else
        {
            setTspanText(spaceIndex);
            svgTextTspan = doCreateTspan(textFragmentWrapper, tspanText);
        }
        
        if (svgTextTspan != null)
        {
            
                  
            var tspanDeltaY = setYOffsetForTspan(svgTextTspan, isFirstTspanInFragment, fragmentIndex);
            
            computedTextLength = addTextTspan(svgTextTspan, textFragmentWrapper); 
            
            setXOffsetForTspan(svgTextTspan, computedTextLength, isFirstTspanInFragment, fragmentIndex, tspanDeltaY);
        }
        
        if (spaceIndex != -1)
        {
            svgSpaceTspan = createNewSpaceTspan(textFragmentWrapper, textParagraphWrapper, svgTextHandler);
            computedSpaceLength = addSpaceTspan(svgSpaceTspan, textFragmentWrapper);
        }
        else
        {
            svgSpaceTspan = null;
            computedSpaceLength = 0;
        }
        
        lineLength = parseFloat(getCurrentLineWidth() + computedTextLength + computedSpaceLength);
        setCurrentLineWidth(lineLength);
    }
    
    
    if (lineLength > nettoWidth && !forcedWrite)
    {
        var spaceDetected = false;
        var wordCounter = 0;
        var fragmentWrapper = null;
        var lastTspan = null;
        var lastTspanText = "";
        
        while((lineLength > nettoWidth) || !spaceDetected)
        {
            wordCounter++;
            var svgText = svgTextHandler.getCurrentSvgText();
            lastTspan = svgText.lastChild;
            lastTspanText = lastTspan.firstChild.data;
            
            if(simpleTrim(lastTspanText) == "")
            {
                if(wordCounter > 1)
                {
                    spaceDetected = true;
                }
                else
                {
                    remainingText = " " + remainingText;
                    var tspanWrapper = removeTspan(lastTspan);
                    fragmentWrapper = tspanWrapper.getFragmentWrapper();
                }
            }
            else
            {
                remainingText = lastTspanText + remainingText;
                var tspanWrapper = removeTspan(lastTspan);
                fragmentWrapper = tspanWrapper.getFragmentWrapper();
            }
            
            if(fragmentIndex != fragmentWrapper.getFragmentIndex())
            {
                remainingText = lastTspanText;
                fragmentIndex = fragmentWrapper.getFragmentIndex();
                textFragmentWrapper = fragmentWrapper;
            }
            svgTextTspan = null;
            svgSpaceTspan = null;
        }
    }
    
    if(textParagraphWrapper.getIsBullet() && fragmentIndex == 1 && customFragmentLine == 0)
    {
        nettoWidth = nettoWidth + textFragmentWrapper.getFragmentDx();
    }
    
    var availableLineSpace = (nettoWidth > lineLength)? nettoWidth - lineLength: 0;
    vars.glbLineJustificationSpace[vars.glbLineCounter] = availableLineSpace;
    
    // remaining text will result in a new tspan element
    if (remainingText.length > 0)
    {
        if(textParagraphWrapper.getIsJustified())
        {
            justifyLine(vars.glbSVGTable.getCurrentLine(), availableLineSpace);
        }
        // important: first justify, then text decoration!
        handleTextDecorationForCbaTextLine(cbaTextField, vars.glbSVGTable.getCurrentLine());
        
        svgTextHandler.creatNewSvgText();
        
        incrementLineCounter();
        resetCurrentLineWidth();
        resetLineTspanCounter();
        customFragmentLine ++;
        
        tspanIndex = createTspan(svgTextHandler, cbaTextField, textfieldWidth, cbaTextLine, x, lineIndex, fragmentIndex, customFragmentLine, textParagraphWrapper, textFragmentWrapper, remainingText, tspanIndex, cbaLookAheadTextFragment);
    }
    
    return fragmentIndex;
    
    
    // ++++++++++ INNER FUNCTIONS:
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    
    
    function addTextTspan(textTspan, textFragmentWrapper)
    { 
        svgTextHandler.appendChild(svgTextTspan);
        // len is only calculated after the tspan is appended
        var computedTextLength = svgTextTspan.getComputedTextLength();
        vars.glbSVGTable.getCurrentLine().addTspan(svgTextTspan, computedTextLength, textFragmentWrapper);
        return computedTextLength;
    }
    
    
    function addSpaceTspan(spaceTspan, textFragmentWrapper)
    { 
        svgTextHandler.appendChild(spaceTspan);
        // len is only calculated after the tspan is appended
        var computedSpaceLength = spaceTspan.getComputedTextLength();
        vars.glbSVGTable.getCurrentLine().addTspan(spaceTspan, null, textFragmentWrapper);
        return computedSpaceLength;
    }
    
    
    function removeTspan(lastTspan)
    { 
        var textLength = lastTspan.getComputedTextLength();
        svgTextHandler.removeChild(lastTspan);
        var tspanWrapper = vars.glbSVGTable.getCurrentLine().removeLastTspan();
        lineLength = lineLength - textLength;
        decrementLineTspanCounter();
        decrementFragmentTspanCounter();
        return tspanWrapper;
    }
    
    
    function  createNewSpaceTspan(textFragmentWrapper, textParagraphWrapper, svgTextHandler)
    {
        var spaceTspan = null;
        if(textParagraphWrapper.getIsJustified())
        {
            // if(computedSpaceLength == 0)
            // {
                var spaceLength = getSpaceLengthForFragment();
            // }
            spaceTspan = createVariableSpaceTspan(Math.floor(spaceLength), textFragmentWrapper, svgTextHandler);
        }
        else
        {
            spaceTspan = createSpaceTspan(textFragmentWrapper);
        }
        tspanIndex = tspanIndex + 1;
        incrementLineTspanCounter();
        incrementFragmentTspanCounter();
        
        copyTextDecorationFromFragmentIntoTspan(textFragmentWrapper, spaceTspan);
        
        return spaceTspan;
    }
    
    
    function getSpaceLengthForFragment()
    {
        var spaceLength = textFragmentWrapper.getSpaceLength();
        if(spaceLength == null)
        {
            var spaceTspan = createSpaceTspan(textFragmentWrapper);
            svgTextHandler.appendChild(spaceTspan);
            spaceTspanLength = spaceTspan.getComputedTextLength();
            svgTextHandler.removeChild(spaceTspan);
            textFragmentWrapper.setSpaceLength(spaceTspanLength);
            spaceLength = spaceTspanLength;
        }
        return spaceLength;
    }
    
    
    /*
     * Returns .
     */
    function createSpaceTspan(textFragmentWrapper)
    {
        // var spaceTspan = vars.glbSvgDoc.createElementNS(vars.glbSvgNamespace,
        // 'tspan');
        var spaceTspan = vars.svgTspanTemplate.cloneNode(false);
        spaceTspan.appendChild(vars.glbSvgDoc.createTextNode(" "));
        setFontInformationForTspan(textFragmentWrapper, spaceTspan);
        return spaceTspan;
    }
    
    
    /*
     * 
     * 
     */
    function createVariableSpaceTspan(widthInPixel, textFragmentWrapper, svgTextHandler)
    {
        var spaceBuffer = new StringBuffer();
        for (var i=0; i<widthInPixel; i++)
        {
            spaceBuffer.append(" ");
        }
        var spaceTspanTemplate = textFragmentWrapper.getSpaceTspanTemplate();
        if(spaceTspanTemplate == null)
        {
            spaceTspanTemplate = createVariableSpaceTspanTemplate(textFragmentWrapper, svgTextHandler);
            textFragmentWrapper.setSpaceTspanTemplate(spaceTspanTemplate);
        }
        var spaceTspan = spaceTspanTemplate.cloneNode(false);
        spaceTspan.appendChild(vars.glbSvgDoc.createTextNode(spaceBuffer.toString()));
        return spaceTspan;
    }
    
    
    /*
     * Text decoration from the cbaTextFragment is copied into the tspan.
     * 
     */
    function copyTextDecorationFromFragmentIntoTspan(textFragmentWrapper, tspan)
    {
        var textDecoration = textFragmentWrapper.getTextDecoration();
        if(textDecoration != null && textDecoration != "")
        {
            tspan.setAttribute('text-decoration', textDecoration);
        }
        var fill = textFragmentWrapper.getFillAttribute();
        if(fill != null && fill != "")
        {
            tspan.setAttribute('fill', fill);
        }
    }
    
    
    function setTspanText(spaceIndex)
    {
        tspanBuffer = tspanText;
        remainingBuffer = remainingText;
        if (spaceIndex == -1)
        {
            tspanText = remainingText;
            remainingText = "";
        }
        else
        {
            tspanText = remainingText.substring(0, spaceIndex);
            // remainingText = (remainingText.length > spaceIndex+1)?
            // remainingText.substring(spaceIndex+1) : "";
            // HMA
            remainingText = (remainingText.length > spaceIndex+1)? remainingText.substring(spaceIndex+1) : "";
        }
        if(tspanText.length < 1)
        {
            tspanText = " ";
        }
    }
    
    
    /*
     * inner function
     * 
     */
    function doCreateTspan(textFragmentWrapper, tspanText)
    {
        // var svgTspan = vars.glbSvgDoc.createElementNS(vars.glbSvgNamespace,
        // 'tspan');
        var svgTspan = vars.svgTspanTemplate.cloneNode(false);
        copyTextDecorationFromFragmentIntoTspan(textFragmentWrapper, svgTspan);
        svgTspan.appendChild(vars.glbSvgDoc.createTextNode(tspanText));
        tspanIndex = tspanIndex + 1;
        incrementLineTspanCounter();
        incrementFragmentTspanCounter();
        
        setFontInformationForTspan(textFragmentWrapper, svgTspan);
        
        //fix for IE bullets (Wingdings font does not work)
        var bulletMatch = isBulletTspan(tspanText);
        if (bulletMatch) svgTspan.setAttribute("font-family", "Arial");
        
        return svgTspan;
    }
    
    function isBulletTspan(tspanText)
    {
        var circle = '\u25cb';
        var square = '\u25a1';
        var filledCircle = '\u25cf';
        var filledSquare = '\u25a0';
        
        if (circle == tspanText) return true;
        if (square == tspanText) return true;
        if (filledCircle == tspanText) return true;
        if (filledSquare == tspanText) return true;
        
        return false;
    }
    
    function setYOffsetForTspan(tspan, isFirstTspanInFragment, fragmentIndex)
    {
        var tspanDeltaY = 0;
        //var tspanText = tspan.firstChild.data
        
        if (parseInt(getCurrentLineWidth()) == 0) // if CurrentLineWidth == 0 then it is a new line!
        {
            var deltaY = (vars.glbFragmentTspanCounter == 1)? textFragmentWrapper.getFragmentDy() : textFragmentWrapper.getBaselineDy();
            var startY = computeDeltaYForCurrentLine(cbaTextField, textParagraphWrapper, textFragmentWrapper, cbaNextTextFragment, tspan);
            
            vars.glbLineDeltaY = startY;
            
            var dy = startY + deltaY;// - vars.previousLineOffset;
            vars.previousLineOffset = 0;
            
            vars.glbTspanY = vars.glbTspanY + dy;
            
            vars.glbLineTspanStartY = vars.glbTspanY;
            
            tspan.setAttribute('y', vars.glbTspanY);
            
            tspanDeltaY = dy;
        }
        else
        {
            var deltaY = (vars.glbFragmentTspanCounter == 1)? textFragmentWrapper.getFragmentDy() : textFragmentWrapper.getBaselineDy();
            var startY = computeDeltaYForCurrentLine(cbaTextField, textParagraphWrapper, textFragmentWrapper, cbaNextTextFragment, tspan);
            
            if(startY > vars.glbLineDeltaY)
            {
                vars.glbLineTspanStartY = vars.glbLineTspanStartY + (startY - vars.glbLineDeltaY);
                vars.glbLineDeltaY = startY;
            }
            
            var dy = deltaY;// - vars.previousLineOffset;
            
            if (dy != 0)
            {
                tspan.setAttribute('dy', dy);
                vars.previousLineOffset = vars.previousLineOffset + dy;
            }
        }
        return tspanDeltaY;
    }
    
    
    function setXOffsetForTspan(tspan, computedTextLength, isFirstTspanInFragment, fragmentIndex, tspanDeltaY)
    {
            if (parseInt(getCurrentLineWidth()) == 0) // if CurrentLineWidth
                                                        // == 0 then it is a new
                                                        // line!
            {
                var dx = 0;
                var imageIndentation = 0;
                
                // HUX: the next line causes an exception when loaded several
                // times
                var tspanLowerY = tspan.getStartPositionOfChar(0).y;
                var tspanUpperY = tspanLowerY - tspanDeltaY;
                
                if(vars.glbImagePosStartY != -1 && vars.glbImagePosEndY != -1)
                {
                    if(isNumberInRange(tspanUpperY, vars.glbImagePosStartY, vars.glbImagePosEndY)
                    || isNumberInRange(tspanLowerY, vars.glbImagePosStartY, vars.glbImagePosEndY) )
                    {
                        imageIndentation = vars.glbLastImageIndentation;
                    }
                }
                
                if (textParagraphWrapper.getIsBullet())
                {
                    dx = getCurrentBulletIndentation();
                    
                    if (fragmentIndex == 0 && (dx == null || dx == 0))
                    {
                        var paragraphOffset = textParagraphWrapper.getParagraphDx();
                        dx = imageIndentation + paragraphOffset;
                        
                        setCurrentBulletLength(computedTextLength);
                        setCurrentBulletIndentation(dx);
                    }
                    else
                    {
                        dx = getCurrentIndentation();
                    }
                }
                else    // new line and no bullet
                {
                    dx = parseInt(textParagraphWrapper.getParagraphDx()) + parseInt(imageIndentation);
                    setCurrentIndentation(dx);
                }
                setXValueForTspan(textParagraphWrapper, tspan, x, parseInt(textfieldWidth), dx);
            }
            else if (getLineTspanCounter() == 2)
            {
                var imageIndentation =  vars.glbLastImageIndentation;
                var fragmentDx = textFragmentWrapper.getFragmentDx();
                
                if(textParagraphWrapper.getIsBullet())
                {
                    fragmentDx = fragmentDx - getCurrentBulletLength();
                    
                    dx = getCurrentIndentation();
                    
                    if (dx == null || dx == 0)
                    {
                        dx = imageIndentation + getCurrentBulletIndentation() + getCurrentBulletLength() + fragmentDx;
                        setCurrentIndentation(dx);
                    }
                }
                
                var dxValue = x + fragmentDx;
                if ( vars.isRTLDirection ) 
                {
                   if (vars.glbSVGTable.getCurrentLine().getIsBullet())
                   {
                      dxValue = (-1) * dxValue;
                      tspan.setAttribute('dx', dxValue);
                   }
                } 
                else 
                {
                  tspan.setAttribute('dx', dxValue);
                }
            }
    }
    
    
    /*
     * inner function
     * 
     */
    function setSvgImagePositionY(textParagraphWrapper, textFragmentWrapper, svgTspan)
    {
        var svgImage = getSvgImage(textParagraphWrapper);
        
        if(svgImage != null && vars.glbParagraphFragmentCounter == 0 && vars.glbFragmentTspanCounter == 1)
        {
            moveSvgImage(textFragmentWrapper, svgTspan, svgImage);
        }
    }
    
}


function isNumberInRange(number, rangeStart, rangeEnd)
{
    return (number >= rangeStart && number <= rangeEnd);
}


/*
 * computeDeltaYForCurrentLine deprecated
 */
function computeDeltaYForCurrentLine(cbaTextField, textParagraphWrapper, textFragmentWrapper, cbaNextTextFragment, svgTspan)
{
    var lineSpacing = parseInt(cbaTextField.getAttribute('line-spacing'));
    var fontSize;
    
    if (cbaNextTextFragment != null && textParagraphWrapper.getIsBullet() && vars.glbFragmentTspanCounter == 1) 
    {
        fontSize = parseInt(cbaNextTextFragment.getAttribute('font-size'));
    }
    else
    {
        fontSize = textFragmentWrapper.getFontSize();
    }
    var line = getLineCounter();
    
    if (line == 0)
    {
        var dy = parseFloat(fontSize) + parseFloat(lineSpacing);
        return parseFloat(dy);
    }
    else
    {
        var dy = parseFloat(fontSize) * parseFloat(1.2) + parseFloat(lineSpacing);
        //var dy = parseFloat(fontSize) + parseFloat(fontSize * 0.5) + parseFloat(lineSpacing);
        return parseFloat(dy);
    }
}


function createEmptySVGResultForXY(x,y)
{
    var result = new SVGResultForXY(-1, -1, -1, -1, null, null, null, -1, -1, -1, -1, -1, false);
    result.absoluteStart = x;
    result.setAbsolutePosY(y);
    return result;
}


/* highlight methods */
var glbSelectLock =  null;
var glbHighlightMode = true;

function setSelectLock(x,y)
{
    var selectionStart = getTspanInformationForEvent(x,y);
    
    if(!vars.glbSVGTable.isCharacterHighlighted(selectionStart))
    {
        selectionStart.eventX = x;
        selectionStart.eventY = y;
        glbSelectLock = selectionStart;
        vars.isNewSelektion = true;
    }
    else
    {
        setParentSelectionBlocked(true);
    }
}


function resetSelectLock()
{
    glbSelectLock = null;
    vars.glbSelecting = false;
    vars.isNewSelektion = false;
}


function isSelectLocked()
{
    if (glbSelectLock != null) return true;
    else return false;
}
  

/*
 * Returns an SvgResultForXY
 * 
 */
function getTspanInformationForEvent(x,y)
{
    // var point = vars.glbSvgDoc.documentElement.createSVGPoint();
    // point.x = evt.clientX;
    // point.y = evt.clientY;
    //log.debug("evt.clientX = "+getClientX(evt));
    //log.debug("evt.clientY = "+evt.clientY);
    return vars.glbSVGTable.getTspanInformationForXY(x,y);
}


/*
 * selectAllCharacters select all characters.
 * 
 */ 
function selectAllCharacters(evt)
{
    if (isSelectLocked())
    {
        var startXY = glbSelectLock;
        var endXY = vars.glbSVGTable.getTspanInformationForXY(getClientX(evt), evt.clientY);
        var distance = vars.glbSVGTable.getDistanceSVGResultForXYList(startXY, endXY);
        vars.glbSVGTable.highlightSvgDistance(distance);
    }   
}


/*
 * deSelectHighlightedArea deselect a highlighted area
 * 
 */ 
function deSelectHighlightedArea(evt)
{
    if (isSelectLocked())
    {
        var startXY = glbSelectLock;
        var endXY = vars.glbSVGTable.getTspanInformationForXY(getClientX(evt), evt.clientY);
        var distance = vars.glbSVGTable.getDistanceSVGResultForXYList(startXY, endXY);
        
        //log.debug("distance.svgResultForXYList.length = "+distance.svgResultForXYList.length);
        
        if (distance.svgResultForXYList.length > 0)
        {
            var highlightedDistance = vars.glbSVGTable.findMaximumHighlightedDistance(distance.svgResultForXYList[0]);
            
            if(highlightedDistance != null && highlightedDistance.svgResultForXYList.length > 0)
            {
                vars.glbSVGTable.unhighlightSvgDistance(highlightedDistance);
            }
        }
    }   
}


function handleSelection(evt)
{
    var x = getClientX(evt);
    var y = evt.clientY;
    var ret = null;
    var deselectOldDistance = null;
    
    if(!isSelectLocked())
    {
        var test = getTspanInformationForEvent(x,y);
        if(vars.glbSVGTable.isCharacterHighlighted(test))
        {
            var distance = vars.glbSVGTable.getDistanceSVGResultForXYList(test, test);
            var unhighlightDistance = vars.glbSVGTable.findMaximumHighlightedDistance(distance.svgResultForXYList[0]);
            vars.glbSVGTable.unhighlightSvgDistance(unhighlightDistance);
        }
    }

    if (isSelectLocked())
    {
        if(glbSelectLock.eventX == getClientX(evt) && glbSelectLock.eventY == evt.clientY)
        {
            return ret; // it was a mouse down and mouse up at the same pixel
        }
        
        var startXY = glbSelectLock;
        var endXY = null;
        
        if(vars.mouseMovedOut)
        {
            //endXY = createEmptySVGResultForXY(getClientX(evt), evt.clientY);
            //vars.glbSVGTable.setValuesForSvgResult(startSVGResultForXY); // HUX TODO find point
            //endXY = getTspanInformationForEvent(x,y);
            if(vars.mouseOutBottom)
            {
                y = y + 1; // to make sure, that the endXY which is derived from x and y is not the currently selected char
            }
            else if(vars.mouseOutTop)
            {
                y = y -1; //to make sure, that the endXY which is derived from x and y is not the currently selected char
            }
            endXY = vars.glbSVGTable.getTspanInformationForXY(x,y);
        }
        else
        {
            endXY = vars.glbSVGTable.getTspanInformationForXY(getClientX(evt), evt.clientY);
            //endXY.printInfo();
        }
        
        endXY.eventX = getClientX(evt);
        endXY.eventY = evt.clientY;
        
        var yStart = glbSelectLock.getAbsolutePosY();
        var yEnd = endXY.getAbsolutePosY();
        
        var xStart = glbSelectLock.absoluteStart;
        var xEnd = endXY.absoluteStart;
        
        if(vars.glbSelecting && (vars.currentSelectionEnd == endXY))
        {
            //log.debug("1");
        if(evt.type == 'mouseup' || evt.type == 'mouseout') 
            {
                //log.debug("1.1");
                var oldDistance = getOldSvgDistance();
                vars.glbSVGTable.highlightSvgDistance(oldDistance);
                return oldDistance;
            }
            else
            {
                //log.debug("1.2");
                var oldDistance = getOldSvgDistance();
                vars.glbSVGTable.highlightSvgDistance(oldDistance);
                return null;  // still selecting the same character, so there is nothing to do
            }
        }
        else if(vars.glbSelecting)
        {
            //log.debug("2");
            if(vars.currentSelectionEnd != null)
            {
                //log.debug("2.1");
                if(endXY != null)// && endXY.characterString  != null
                {
                    //log.debug("2.1.1");
                    
                    var oldDistance = getOldSvgDistance();
                    //HMA:vars.glbSVGTable.unhighlightSvgDistance(oldDistance);
                    deselectOldDistance = oldDistance;
                }
            }
            vars.currentSelectionEnd = endXY;
        }
        
        distance = vars.glbSVGTable.getDistanceSVGResultForXYList(startXY, endXY);
        
        if (distance.svgResultForXYList.length == 1 && (deselectOldDistance == null || deselectOldDistance.svgResultForXYList.length == 1))
        {
            if (vars.glbSVGTable.isCharacterHighlighted(startXY)&& vars.glbSelecting == false )//&& vars.glbSelecting == false
            {
                distance = vars.glbSVGTable.findMaximumHighlightedDistance(distance.svgResultForXYList[0]);
                
                vars.glbSVGTable.unhighlightSvgDistance(distance);
                ret = distance;
            }
            else
            {
                if(evt.type == 'mousemove' )
                {
                    vars.glbSVGTable.highlightCharacter(distance.svgResultForXYList[0]);
                }
                if(vars.glbSelecting)
                {
                    vars.glbSVGTable.highlightCharacter(distance.svgResultForXYList[0]);
                    ret = distance;
                }
            }
        }
        else if (startXY.equals(endXY) && !distance.svgResultForXYList.length > 1)
        {
            if (vars.glbSVGTable.isCharacterHighlighted(startXY))
            {
                vars.glbSVGTable.unHighlightCharacter(startXY);
            }
            else
            {
                vars.glbSVGTable.highlightCharacter(startXY);
            }
            ret = distance;
        }
        else
        {
            //log.debug("else");
            /* ORIG
            vars.glbSVGTable.highlightSvgDistance(distance);
            ret = distance;
            */
            
            // HMA          
            if (deselectOldDistance != null)
            {               
                var deltaDistance = deselectOldDistance.notIn(distance);
                if (deltaDistance != null && deltaDistance.svgResultForXYList.length > 0)
                {
                    //alert("HMA: deltaDistance: " + deltaDistance.svgResultForXYList.length);
                    vars.glbSVGTable.unhighlightSvgDistance(deltaDistance);
                }
            }
            vars.glbSVGTable.highlightSvgDistance(distance);
            ret = distance;
        }
    }
    return ret;
}


function getOldSvgDistance()
{
    var startXY = glbSelectLock;
    var oldEnd = vars.currentSelectionEnd;
    var oldDistance = vars.glbSVGTable.getDistanceSVGResultForXYList(startXY, oldEnd);
    return oldDistance;
}


function selectWord(evt)
{
    var selectedXY = vars.glbSVGTable.getTspanInformationForXY(getClientX(evt), evt.clientY);
    var wordDistance = vars.glbSVGTable.findWordBounds(selectedXY);
    vars.glbSVGTable.highlightSvgDistance(wordDistance);
    //checkForTextblockSelection(wordDistance);
    //selectionChanged();
    stopSelection(wordDistance);
}


function selectParagraph(evt)
{
    var selectedXY = vars.glbSVGTable.getTspanInformationForXY(getClientX(evt), evt.clientY);
    
    if(selectedXY != null)
    {
        var paragraphDistance = vars.glbSVGTable.findParagraphBounds(selectedXY);
        vars.glbSVGTable.highlightSvgDistance(paragraphDistance);
        // paragraphDistance.svgResultForXYList[index].characterString != " "
        //checkForTextblockSelection(paragraphDistance);// HUX TODO remove/replace
        selectionChanged(); //HMA/CPE: removed      //HUX: put in again
    }
}


function findStringInTspans(searchString, caseSensitive)
{
    // deselect all
    vars.glbSVGTable.unHighlightAllCharacters();
    
    if(searchString == null || simpleTrim(searchString) == "")
    {
        return;
    }
    var searchResult = false;
    var lineList = vars.glbSVGTable.lineList;
    
    for (var i=0; i<lineList.length-1; i++)
    {
        var textLine = lineList[i];
        var tspanWrapperList = textLine.tspanWrapperList;
        
        for (var j=0 && tspanWrapperList != null; j<tspanWrapperList.length; j++)
        {
            
            var tspanText = tspanWrapperList[j].getTspanText();
            var beginIndex = -1;
            if (caseSensitive == false)
            {
                var lowerTspanText = tspanText.toLowerCase();
                var lowerSearchStringText = searchString.toLowerCase();
                beginIndex = lowerTspanText.indexOf(lowerSearchStringText);
            }
            else
            {
                beginIndex = tspanText.indexOf(searchString);
            }
            
            if (beginIndex != -1)
            {
            	searchResult = true;
                // select search result
                var startSvgResult = textLine.tspanWrapperList[j].startSvgResultForXY;
                var endSvgResult = textLine.tspanWrapperList[j].endSvgResultForXY;
                
                var tspanDistance = vars.glbSVGTable.getDistanceSVGResultForXYList(startSvgResult, endSvgResult);
                var endIndex = searchString.length + beginIndex;
                
                for (var k=beginIndex; k<endIndex; k++)
                {
                    var singleChar = tspanDistance.svgResultForXYList[k];
                    if(singleChar != null)
                    {
                        vars.glbSVGTable.highlightCharacter(singleChar);
                    }
                }
            }
        }
    }
    announceSearchResult(searchResult);
    announceHighlightChange();
}

function announceSearchResult(searchResult)
{
    try
    {
        eval(getRealParentForTextField()+ "." + vars.cbaTextFieldId + ".searchResultEvent(\"" + searchResult + "\");");
    }
    catch(exception)
    {
    }
}

function CurrentHighlightState()
{
    this.rangeString = null;
    this.atLeastOneNoneSpaceCharHighlighted = false;
    
    this.getRangeString =
        function()
        {
            return this.rangeString;
        };
        
    this.addToRangeString =
        function(range)
        {
            this.rangeString = (this.rangeString == null)? range: this.rangeString + ";" + range;
        };
        
    this.isAtLeastOneNoneSpaceCharHighlighted =
        function()
        {
            return this.atLeastOneNoneSpaceCharHighlighted;
        };
        
    this.setIsAtLeastOneNoneSpaceCharHighlighted =
        function(flag)
        {
            this.atLeastOneNoneSpaceCharHighlighted = flag;
        };
}

function findHighlightedEndColorPaired(svgResultForXYList, startIndex)
{
    var endIndex = svgResultForXYList.length-1;
    var end = false;

    var svgResultForXYStart = svgResultForXYList[startIndex];
    var startHighlightColor = vars.glbSVGTable.getCharacterHighlightColor(svgResultForXYStart);

    for (var i=startIndex+1; i<svgResultForXYList.length && !end; i++)
    {
        var svgResultForXY = svgResultForXYList[i];
        var isCharacterHighlighted = vars.glbSVGTable.isCharacterHighlighted(svgResultForXY);
        
        if (!isCharacterHighlighted)
        {
            end = true;
        }
        else
        {
            var highlightColor = vars.glbSVGTable.getCharacterHighlightColor(svgResultForXY);
            if (startHighlightColor != highlightColor) end = true;
        }
        
        if (end) endIndex = i-1;
    }
    return endIndex;
}


/*
 * Private function.
 * 
 */
function getCurrentHighlightState()
{
    var currentHighlightState = new CurrentHighlightState();
    var highlightedCharFound = false;
    var svgResultForXYList = vars.glbSVGTable.svgResultForXYList;
    
    for (var i=0; i<svgResultForXYList.length; )
    {
        var svgResultForXY = svgResultForXYList[i];
        
        if (vars.glbSVGTable.isCharacterHighlighted(svgResultForXY))
        {
            var endIndex = findHighlightedEndColorPaired(svgResultForXYList, i);
            
            if(!currentHighlightState.isAtLeastOneNoneSpaceCharHighlighted())
            {
                for (var k=i; k<=endIndex && !highlightedCharFound; k++)
                {
                    if(simpleTrim(svgResultForXYList[k].characterString) != "")
                    {
                        highlightedCharFound = true;
                        currentHighlightState.setIsAtLeastOneNoneSpaceCharHighlighted(true);
                    }
                }
            }
            
            var startCharNumber = svgResultForXY.charNumber;
            var endCharNumber = svgResultForXYList[endIndex].charNumber;
            var color = vars.glbSVGTable.getCharacterHighlightColor(svgResultForXY);
            if (color == null) color = vars.highlightColor;
            
            var range = (startCharNumber < endCharNumber)? startCharNumber +"-"+ endCharNumber: startCharNumber;
            range = range + "@" + color;
            
            currentHighlightState.addToRangeString(range);
            
            i = endIndex + 1;
        }
        else
        {
            i++;
        }
    }
    return currentHighlightState;
}


function getHighlightFragmentsArray()
{
    var fragmentsArray = new Array();
    
    var svgResultForXYList = vars.glbSVGTable.svgResultForXYList;
    
    for (var i=0; i<svgResultForXYList.length; )
    {
        var svgResultForXY = svgResultForXYList[i];
        
        if (vars.glbSVGTable.isCharacterHighlighted(svgResultForXY))
        {
            var endIndex = findHighlightedEnd(svgResultForXYList, i);
            var startCharNumber = svgResultForXY.charNumber;
            var endCharNumber = svgResultForXYList[endIndex].charNumber;
            
            var slicedArray = svgResultForXYList.slice(i,endIndex+1);
            var fragmentText = extractTextFromResultList(slicedArray);
            
            var rangeArray = new Array();
            rangeArray.push(String(startCharNumber));
            rangeArray.push(String(endCharNumber));
            rangeArray.push(fragmentText);
            
            fragmentsArray.push(rangeArray);
            
            i = endIndex + 1;
        }
        else
        {
            i++;
        }
    }
    return fragmentsArray;
}


function extractTextFromResultList(slicedArray)
{
    var text = "";
    for (var i=0; i<slicedArray.length; i++)
    {
        text += slicedArray[i].characterString;
    }
    return text;
}


/*
 * Private function.
 * 
 */
function findHighlightedEnd(svgResultForXYList, startIndex)
{
    var endIndex = svgResultForXYList.length-1;
    
    var end = false;
    for (var i=startIndex+1; i<svgResultForXYList.length && !end; i++)
    {
        var svgResultForXY = svgResultForXYList[i];
        if (!vars.glbSVGTable.isCharacterHighlighted(svgResultForXY))
        {
            endIndex = i-1;
            end = true;
        }
    }
    return endIndex;
}


function saveCurrentHighlightState(rangeString)
{
    saveHighlightState(vars.cbaTextFieldId, rangeString);
}


/*
 * Takes a comma separated list of number ranges (i.e. 3-8,24-45,201-519) and
 * writes it to the parent.
 */
function saveHighlightState(cbaTextFieldId, rangeString)
{
    try
    {
        eval(getRealParentForTextField()+ "." + cbaTextFieldId + ".charactersHighlighted(\"" + rangeString + "\");");
    }
    catch(exception)
    {
    }
}


function writeHighlightStateToParent(fragmentsArray)
{
    highlightStateChangeCall(vars.cbaTextFieldId, fragmentsArray);
}


function highlightStateChangeCall(cbaTextFieldId, fragmentsArray)
{
    try
    {
        eval(getRealParentForTextField()+ "." + cbaTextFieldId).updateHighlightedFragments(fragmentsArray);
    }
    catch(exception)
    {
    }
}


function setGlbDebugMode()
{
    try
    {
        var debugMode = eval(getRealParentForTextField()+ "." + vars.cbaTextFieldId + ".getDebugMode();");
        if(debugMode != null && debugMode.toLowerCase() === 'true')
        {
            vars.glbDebugMode = true;
        }
        else
        {
            vars.glbDebugMode = false;
        }
    }
    catch(exception)
    {
        vars.glbDebugMode = false;
    }
}


function retreiveAndRestoreHighlightState()
{
    var rangeString = null;
    try
    {
        rangeString = eval(getRealParentForTextField()+ "." + vars.cbaTextFieldId + ".getHighlightedCharacters();");
    }
    catch(exception)
    {
        rangeString = null;
        // rangeString = ("2-5,45-80,89");
    }
    if(rangeString != null && rangeString != "")
    {
        restoreHighlightState(rangeString);
    }
}


/*
 * Is given a symbol separated list of number ranges (i.e. 3-8@rgb(0,0,0);24-45@#FF0000;201-519@00FF00;)
 * ...and selects the corresponding characters.
 * 
 */
function restoreHighlightState(rangeString)
{
    resetSelectLock();
    
    var charNumberArray = new Array();
    var rangeArray = rangeString.split(";");
    var charNumber = -1;
    
    for (var i=0; i<rangeArray.length; i++)
    {
        var singleRange = rangeArray[i];
        var dashIndex  = singleRange.indexOf("-");
        var colorIndex = singleRange.indexOf("@");
        if (colorIndex != -1) 
        {
            vars.highlightColor = singleRange.substring(colorIndex+1);
            singleRange = singleRange.substring(0, colorIndex);
        }
        
        if(dashIndex == -1)
        {
            charNumber = singleRange;
            var svgResultForXY = vars.glbSVGTable.getSVGResultForCharNumber(singleRange);
            if(svgResultForXY != null)
            {
                vars.glbSVGTable.highlightCharacter(svgResultForXY);
            }
        }
        else
        {
            startCharNumber = singleRange.substring(0, dashIndex);
            endCharNumber = singleRange.substring(dashIndex+1);
            var startSvg = vars.glbSVGTable.getSVGResultForCharNumber(startCharNumber);
            var endSvg = vars.glbSVGTable.getSVGResultForCharNumber(endCharNumber);
            var distance = vars.glbSVGTable.getDistanceSVGResultForXYList(startSvg, endSvg);
            
            vars.glbSVGTable.highlightSvgDistance(distance);
        }
    }
    
    //restore original highlight color
    var cbaTextField = vars.glbSvgDoc.getElementById(vars.cbaTextFieldId);
    var svgBackgroundRectId = cbaTextField.getAttribute("background-id");
    var svgBackgroundRect = vars.glbSvgDoc.getElementById(svgBackgroundRectId);
    vars.highlightColor = svgBackgroundRect.getAttribute("fill");
}


function retrieveAndMarkVisitedReferences(cbaTextFieldId)
{
    var visitedReferencesString = null;
    try
    {
        visitedReferencesString = eval(getRealParentForTextField()+ "." + cbaTextFieldId + ".getVisitedReferenceIds();");
    }
    catch(exception)
    {
        visitedReferencesString = null;
        //var visitedReferencesString = "0";
    }
    if(visitedReferencesString != null && visitedReferencesString != "")
    {
        markVisitedReferences(visitedReferencesString);
    }
}


function markVisitedReferences(visitedReferencesString)
{
    var svgResultForXYList = vars.glbSVGTable.svgResultForXYList;
    
    var refIdArray = visitedReferencesString.split(",");
    for (var j=0; j<refIdArray.length; j++)
    {
        var refId = refIdArray[j];
        var found = false;
        for (var i=0; i<vars.glbEmbeddedReferenceArray.length && !found; i++)
        {
            var referenceObject = vars.glbEmbeddedReferenceArray[i];
            
            if(referenceObject.getId() == refId)
            {
                var startCharNumber = referenceObject.startCharNumber;
                var endCharNumber = referenceObject.endCharNumber+1;
            
                var tspanWrapperArray = new Array();
                var linkEndReached = false;
                var tspanWrapper = null;
                
                for (var i=startCharNumber; i<endCharNumber; i++)
                {
                    var wrapper = svgResultForXYList[i].getTspanWrapper();
                    if(tspanWrapper != wrapper)
                    {
                        tspanWrapper = wrapper;
                        tspanWrapperArray.push(wrapper);
                    }
                    markReferenceTspan(tspanWrapperArray, referenceObject);
                }
            }
        }
    }
}


function markReferenceTspan(tspanWrapperArray, refObject)
{
    for (var i=0; i<tspanWrapperArray.length; i++)
    {
        var tspanWrapper = tspanWrapperArray[i];
        var refTspan = tspanWrapper.getTspan();
        if(refTspan != null &&  refObject != null && !refObject.getIsSameLinkColor())
        {
            var refColor = refObject.getVisitedLinkColor();
            refTspan.setAttribute('fill', refColor);
            
            var svgLine = tspanWrapper.getUnderline();
            if(svgLine != null)
            {
                svgLine.setAttribute('stroke', refColor);
            }
        }
    }
}


/*
 * function findTspanForReferenceObject(referenceObject) { var
 * svgResultForXYList = vars.glbSVGTable.svgResultForXYList; var found = false;
 * var tspanWrapper = null; for (var i=0; i<svgResultForXYList.length &&
 * !found; i++) { var svgResultForXY = svgResultForXYList[i];
 * 
 * if (svgResultForXYList[i].getIsReference()) { var charNumber =
 * svgResultForXYList[i].charNumber;
 * if(referenceObject.containsCharNumber(charNumber)) { tspanWrapper =
 * svgResultForXYList[i].getTspanWrapper(); found = true; } } } return
 * tspanWrapper; }
 */


function findString(string, caseSensitive)
{
    findStringInTspans(string, caseSensitive);
}


function getReferenceForCharNumber(charNumber)
{
    var embeddedReference = null;
    for (var i=0; i<vars.glbEmbeddedReferenceArray.length && embeddedReference == null; i++)
    {
        if(vars.glbEmbeddedReferenceArray[i].containsCharNumber(charNumber))
        {
            embeddedReference = vars.glbEmbeddedReferenceArray[i];
        }
    }
    return embeddedReference;
}


function charNumberBelongsToReference(charNumber, charString)
{
    var belongsToReference = false;
    for (var i=0; i<vars.glbEmbeddedReferenceArray.length && !belongsToReference; i++)
    {
        var embeddedReference = vars.glbEmbeddedReferenceArray[i];
        if(embeddedReference.containsCharNumber(parseInt(charNumber)))
        {
            belongsToReference = true;
            embeddedReference.addReferenceChar(charString);
        }
    }
    return belongsToReference;
}


/*
 * Call the reference (link) that has been clicked.
 * 
 */
function doReferenceCall(embeddedReferenceObj)
{
    var id = embeddedReferenceObj.id;
    var reference = embeddedReferenceObj.reference;
    var referenceID = embeddedReferenceObj.referenceId;
    var referenceText = embeddedReferenceObj.getReferenceText();
    try{
        vars.clickAction = "referenceClick";
        eval(getRealParentForTextField()+ "." + vars.cbaTextFieldId + ".switchPage(\"" + referenceID +"\",\""+ reference + "\",\""+ id + "\");");
        markVisitedReferences(id);
    }
    catch(exception)
    {
    }
}


function getClickedEmbeddedReference(evt)
{
    var x = getClientX(evt);
    var y = evt.clientY;
    
    var embeddedReferenceObject = null;
    var svgResultForXY = getTspanInformationForEvent(x,y);
    if(svgResultForXY != null)
    {
        var charNumber = svgResultForXY.charNumber;
        embeddedReferenceObject = getReferenceForCharNumber(charNumber);
    }
    return embeddedReferenceObject;
}


function announceHighlightChange()
{
    //var rangeString = getCurrentHighlightState();
    var currentHighlightState = getCurrentHighlightState();
    var rangeString = currentHighlightState.getRangeString();
    var atLeastOneNoneSpaceCharHighlighted = currentHighlightState.isAtLeastOneNoneSpaceCharHighlighted();
    
    saveCurrentHighlightState(rangeString); // writes it to the parent
    
    if(vars.glbDebugMode)
    {
        var highlightFragmentsArray = getHighlightFragmentsArray();
        writeHighlightStateToParent(highlightFragmentsArray);
    }

    selectionStateChangeCall(atLeastOneNoneSpaceCharHighlighted);
    
    vars.glbCurrentSelectionRange = rangeString;
}


function selectionStateChangeCall(selectionExists)
{
    try{
        vars.clickAction = "selectionChange";
        eval(getRealParentForTextField()+ "." + vars.cbaTextFieldId + ".highlightEvent(\"" + selectionExists + "\");");
    }
    catch(exception)
    {
    }
}


function setParentSelectionMode(selectionMode)
{
    try{
        if(selectionMode == true)
        {
            //HUX: old version: eval(getRealParentForTextField()+".textSelectionModeProvider.enableSelectionMode();");
            //log.debug("vars.cbaTextFieldId = "+vars.cbaTextFieldId);
            vars.selectionId = vars.cbaTextFieldId + "_" + new Date().getTime();
            eval(getRealParentForTextField()+".textSelectionModeProvider.enableSelectionMode(\"" + vars.selectionId + "\");");
        }
        else
        {
            eval(getRealParentForTextField()+".textSelectionModeProvider.disableSelectionMode();");
        }
    }
    catch(exception)
    {
    }
}


function setParentSelectionBlocked(flag)
{
    try
    {
        vars.selectionBlocked = flag;
        eval(getRealParentForTextField()+".textSelectionModeProvider.setSelectionBlocked("+flag+");");
    }
    catch(exception)
    {
    }
}


function selectionChanged()
{
    if(vars.glbTextBlockArray != null && vars.glbTextBlockArray.length > 0)
    {
        var selectString = getTextblockSelectionStateString();
        announceTextblockSelectionState(selectString);
    }
    announceHighlightChange();
}


/*
 * handleMouseDown handler for mouse down event.
 * 
 */ 
function handleMouseDown(evt)
{
    var x = getClientX(evt);
    var y = evt.clientY;
    
    if(evt.ctrlKey)
    {
        if(vars.glbTextSelectionEnabled)
        {
            selectParagraph(evt);
        }
    }
    else
    {
        setParentSelectionMode(true);
        
        if (vars.glbTextSelectionEnabled)
        {
            setSelectLock(x,y);
        }
        else if (vars.glbEmbeddedReferenceArray.length > 0)
        {
            var embeddedReferenceObj = getClickedEmbeddedReference(evt);
            if(embeddedReferenceObj != null)
            {
                doReferenceCall(embeddedReferenceObj);
            }
        }
    }
    
    if (vars.clickAction != "referenceClick")
    {
        runtimeClickNotification();
    }
}


function runtimeClickNotification()
{
    var textBlocksDefined = (vars.glbTextBlockArray != null && vars.glbTextBlockArray.length > 0);
    try
    {
        eval(getRealParentForTextField()+ "." + vars.cbaTextFieldId + ".doClickEvent(\"" + textBlocksDefined + "\");");
    }
    catch(exception)
    {
    }
}


/*
 * handleMouseUp handler for mouse up event.
 * 
 */ 
function handleMouseUp(evt)
{
    setDefaultCursor();
    if (vars.glbTextSelectionEnabled)
    {
        if(!evt.ctrlKey)
        {
            var svgDistance = handleSelection(evt);
            stopSelection(svgDistance);//always! even if svgDistance is null!
            vars.selectionFromOutside = false;
            vars.selectionStartedOutside = false;
        }
    }
    setParentSelectionMode(false);
    setParentSelectionBlocked(false);
    doMouseupTracing();
}


function stopSelection(svgDistance)
{
    resetSelectionValues();
    selectionChanged();
}

function resetSelectionValues()
{
    resetSelectLock();
    vars.glbSelecting = false;
    vars.currentSelectionEnd = null;
}


function doMouseupTracing()
{
    if(vars.clickAction == null)
    {
        var textBlocksDefined = (vars.glbTextBlockArray != null && vars.glbTextBlockArray.length > 0);
        try{
        
            eval(getRealParentForTextField()+ "." + vars.cbaTextFieldId + ".doTraceMouseupEvent(\"" + textBlocksDefined + "\");");
        }
        catch(exception)
        {
        }
    }
    vars.clickAction = null;
}




/*
 * handleMouseMove handler for mouse move event.
 * 
 */     
function handleMouseMove(evt)
{
    var x = getClientX(evt);
    var y = evt.clientY;
    
    if(vars.selectionFromOutside && vars.mouseMoveEventCounter < 1)
    {
        vars.mouseMoveEventCounter++;
        return;
    }
    else
    {
        vars.mouseMoveEventCounter = 0;
    }
    
    if(vars.selectionBlocked)
    {
        setNotAllowedCursor();
    }
    else if (isSelectLocked())
    {
        vars.glbSelecting = true;
        
        svgDistance = handleSelection(evt);
        vars.selectionFromOutside = false;
    }
    else
    {
        if (vars.glbEmbeddedReferenceArray.length > 0)
        {
            var svgResultForXY = getTspanInformationForEvent(x,y);
            if(svgResultForXY != null)
            {
                if(svgResultForXY.getIsReference())
                {
                    if(!vars.displayingLinkCursor)
                    {
                        vars.glbSvgRootElement.setAttribute("cursor", vars.linkCursorShape);
                        vars.displayingLinkCursor = true;
                    }
                }
                else
                {
                    if(vars.displayingLinkCursor)
                    {
                        vars.glbSvgRootElement.setAttribute("cursor","default");
                        vars.displayingLinkCursor = false;
                    }
                }
            }
        }
    }
}


function handleDblClick(evt)
{
    if (vars.glbTextSelectionEnabled)
    {
        vars.doubleClickInProgress = true;
        selectWord(evt);
        vars.doubleClickInProgress = false;
        
        setParentSelectionMode(false);
        setParentSelectionBlocked(false);
    }
    evt.stopPropagation();
}



//Does not work anymore for later FF (e.g. FF20)
//Move handling to onClick handleSelect(evt)
/*function ondblclick(evt)
{
    evt.preventDefault();
    handleDblClick(evt);
}*/


/*
 * handleSelect Dispatcher for the various mouse events.
 * 
 */ 
function handleSelect(evt)
{
    evt.preventDefault();
    updateHighlightColor();
    
    if (evt.type == 'mousemove')
    {
    	//CPE: 6.3.0 fix (IE strange highlight effects)
    	if (!vars.mouseMovedOut) handleMouseMove(evt);
    }
    else if (evt.detail == 2)
    {
         handleDblClick(evt);
    }
    else if (evt.type == 'mousedown')
    {
        handleMouseDown(evt);
    }
    else if (evt.type == 'mouseup')
    {
        handleMouseUp(evt);
    }
}



function findMouseoverEntryPoint(xEntry,yEntry)
{
    if(xEntry < 4)
    {
        vars.mouseOverWest = true;
        vars.selectionEntryFound = true;
    }
    else if(xEntry > vars.cbaTextFieldWidthSelectionValue)
    {
        vars.mouseOverEast = true;
        vars.selectionEntryFound = true;
    }
    else if(yEntry < 4)
    {
        vars.mouseOverNorth = true;
        vars.selectionEntryFound = true;
    }
    else if(yEntry > vars.cbaTextFieldHeightSelectionValue)
    {
        vars.mouseOverSouth = true;
        vars.selectionEntryFound = true;
    }
    
}


function getIsSelectionBlockedFromParent()
{
    var selectionBlocked = null;
    try
    {
        //selectionBlocked = false;
        selectionBlocked = eval(getRealParentForTextField()+".textSelectionModeProvider.isSelectionBlocked();");
        vars.selectionBlocked = selectionBlocked;
    }
    catch(exception)
    {
        selectionBlocked = null;
        vars.selectionBlocked = false;
    }
    return selectionBlocked;
}


function getIsSelectionModeEnabledFromParent()
{
    var selectionModeEnabled = null;
    try
    {
        selectionModeEnabled = eval(getRealParentForTextField()+".textSelectionModeProvider.isSelectionModeEnabled();");
        //selectionModeEnabled = 'true';
    }
    catch(exception)
    {
        selectionModeEnabled = null;
    }
    return selectionModeEnabled;
}


function getSelectionModeSessionId()
{
    var selectionModeSessionId = null;
    try
    {
        selectionModeSessionId = eval(getRealParentForTextField()+".textSelectionModeProvider.getSelectionModeSessionId();");
        //selectionModeSessionId = vars.cbaTextFieldId;
    }
    catch(exception)
    {
        selectionModeSessionId = null;
    }
    return selectionModeSessionId;
}


function isNewSelection(globalSelectionId)
{
    return globalSelectionId == vars.selectionId;
}


function handleonmouseover(evt)
{
    var xEntry = getClientX(evt);
    var yEntry = evt.clientY;
    
    vars.mouseOverNorth = false;
    vars.mouseOverSouth = false;
    
    vars.mouseOverWest = false;
    vars.mouseOverEast = false;
    
    vars.selectionEntryFound = false;
    updateHighlightColor();
    
    vars.mouseMovedOut = false;
    vars.completeSelection = false;
    var selectionModeEnabled = null;
    try
    {
        selectionBlocked = getIsSelectionBlockedFromParent();
        
        if(selectionBlocked != null && selectionBlocked)
        {
            setNotAllowedCursor();
        }
        else
        {
            setDefaultCursor();
        }
        
        if (vars.glbTextSelectionEnabled)
        {
            selectionModeEnabled = getIsSelectionModeEnabledFromParent();
            
            if(selectionModeEnabled != null)
            {
                if(selectionModeEnabled.toLowerCase() === 'true' && (selectionBlocked == null || !selectionBlocked))
                {
                    findMouseoverEntryPoint(xEntry,yEntry);
                    
                    var globalSelectionID = getSelectionModeSessionId();
                    var createNewSelection = isNewSelection(globalSelectionID);
                    
                    vars.selectionId = globalSelectionID;
                    
                    if(!createNewSelection || (createNewSelection && !isSelectLocked()))
                    {// then it is a new selection
                        
                        resetSelectionValues();
                        
                        if(vars.selectionEntryFound)
                        {
                            
                            if(vars.mouseOverWest)
                            {
                                xEntry = 1;
                            }
                            else if(vars.mouseOverEast)
                            {
                                xEntry = vars.cbaTextFieldWidth -1;
                            }
                            setSelectLock(xEntry,yEntry);
                            
                            //glbSelectLock = createEmptySVGResultForXY(xEntry,yEntry);
                        }
                        else
                        {
                            glbSelectLock = createEmptySVGResultForXY(xEntry,yEntry);
                        }
                        
                        vars.glbSelecting = true;
                        vars.selectionFromOutside = true;
                    }
                    else
                    {
                        vars.isNewSelektion = false;
                    }
                    vars.selectionStartedOutside = true;
                }
                else
                {
                    resetSelectionValues();
                }
            }
            else
            {
                resetSelectionValues();
            }
        }
    }
    catch(exception)
    {
        resetSelectLock();
    }
}



function onmouseover(evt)
{
    //alert("test");
}


function findMouseOutPoint(evt)
{
    var xOut = getClientX(evt);
    var yOut = evt.clientY;
    
    if(xOut < 1)
    {
        vars.mouseOutLeft = true;
    }
    else if(xOut >= vars.cbaTextFieldWidth)
    {
        vars.mouseOutRight = true;
    }
    else if(yOut < 1)
    {
        vars.mouseOutTop = true;
    }
    else if(yOut >= vars.cbaTextFieldHeight)
    {
        vars.mouseOutBottom = true;
    }
}


function handleonmouseout(evt)
{
    if(vars.selectionFromOutside && !vars.mouseOverEast && !vars.mouseOverWest)
    {
        vars.completeSelection = true;
    }
    else
    {
        vars.completeSelection = false;
    }
    
    vars.mouseMovedOut = true;
    vars.selectionFromOutside = false;
    
    if (vars.glbTextSelectionEnabled && vars.glbSelecting)
    {
        findMouseOutPoint(evt);
        
        if(vars.mouseOverNorth && vars.mouseOutTop && vars.isNewSelektion)
        {
            deSelectHighlightedArea(evt);
        }
        else if(vars.mouseOverSouth && vars.mouseOutBottom && vars.isNewSelektion)
        {
            deSelectHighlightedArea(evt);
        }
        else
        {
            var svgDistance = handleSelection(evt);
            
            //if(svgDistance != null && svgDistance.svgResultForXYList.length == 1 && vars.glbSVGTable.svgResultForXYList.length > 1 && vars.selectionStartedOutside)
            if(vars.mouseOverWest && vars.mouseOutLeft && svgDistance != null && svgDistance.svgResultForXYList.length == 1 && vars.selectionStartedOutside)
            {
                vars.glbSVGTable.unHighlightCharacter(svgDistance.svgResultForXYList[0]);
            }
            else if(vars.mouseOverEast && vars.mouseOutRight && svgDistance != null && svgDistance.svgResultForXYList.length == 1 && vars.selectionStartedOutside)
            {
                vars.glbSVGTable.unHighlightCharacter(svgDistance.svgResultForXYList[0]);
            }
            else if(svgDistance != null && svgDistance.svgResultForXYList.length == 1 && vars.selectionStartedOutside && (vars.mouseOutTop || vars.mouseOutBottom))
            {
                vars.glbSVGTable.unHighlightCharacter(svgDistance.svgResultForXYList[0]);
            }
        }
        
        vars.mouseOutTop = false;
        vars.mouseOutBottom = false;
        vars.mouseOutLeft = false;
        vars.mouseOutRight = false;
        
        selectionChanged(); //HUX this is necessary here because the selection can be stopped later outside the textfield
    }
    vars.selectionStartedOutside = false;
}


function getRealParentForTextField()
{
    if (parent.name == "cbaframe")
    {
        return "parent.parent";
    }
    else 
    {
        return "parent";
    }
}


function setDefaultCursor()
{
    vars.glbSvgRootElement.setAttribute("cursor","default");
}

function setNotAllowedCursor()
{
    vars.glbSvgRootElement.setAttribute("cursor","not-allowed");
}

function setWaitCursor()
{
    vars.glbSvgRootElement.setAttribute("cursor","wait");
}


function errorHandling (Message, File, Line) {
  alert(Message,Line);
  resetSelectLock();
  return true;
}



// ++++++++++++ BEGIN STRINGBUFFER IMPLEMENTATION ++++++++++++++++
function StringBuffer() {
    this.__strings__ = new Array;
}
StringBuffer.prototype.append = function (str) {
    this.__strings__.push(str);
};
StringBuffer.prototype.toString = function () {
    return this.__strings__.join("");
};
// ++++++++++++ END STRINGBUFFER IMPLEMENTATION ++++++++++++++++

 
