
var xmlns="http://www.w3.org/2000/svg"
var xlink="http://www.w3.org/1999/xlink" 
var Root=document.documentElement
var selected = null;
var stateType = 0; // 0 - nothing; 1 - start; 2 - normal; 3 - end.
var stateTypeColor = new Array("white","white","white");
var stateTypeId = new Array("start", "state", "stop");
var nextId = new Array(1,1,1);
var selectedRect = null;
var selectedLine = null;
var rectLabels = new Array()
var lineLabels = new Array()
var previousColor = "";
var linesIds = new Array()
var deleteButtonHelp = "";
var addStateButtonHelp = "";
var upButtonHelp = "";
var downButtonHelp = "";    

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

function showContextMenu( showContextMenu )
{
    if (! showContextMenu) document.oncontextmenu = new Function( 'return false' );
}

function startUp()
{
    readStateLabels();
    readTransitionLabels();
    readInitialStates();
    standardize(Root);
    getToolbarsHelpText();
}

function getToolbarsHelpText()
{
    var microFinModelId = document.getElementsByTagName("cbaMycroFinModelPanel").item(0).getAttributeNS(null, "id");
    deleteButtonHelp = eval(getRealParentForTextField()+ "." + microFinModelId + ".getDeleteButtonHelp();");
    addStateButtonHelp = eval(getRealParentForTextField()+ "." + microFinModelId + ".getAddStateButtonHelp();");
    upButtonHelp = eval(getRealParentForTextField()+ "." + microFinModelId + ".getUpButtonHelp();");
    downButtonHelp = eval(getRealParentForTextField()+ "." + microFinModelId + ".getDownButtonHelp();");
}

function readInitialStates()
{
    var rectangles= document.getElementsByTagName("rect");
    number=rectangles.length;
    i=0;
    while (i<number)
    {
        aux1 = rectangles.item(i);
        id = aux1.getAttribute("id");
        if (id.indexOf('start') == 0) 
        {
        nextId[0] = nextId[0]+1;
        }
        if (id.indexOf('state') == 0) 
        {
        nextId[1] = nextId[1]+1;
        }
        if (id.indexOf('stop') == 0) 
        {
        nextId[2] = nextId[2]+1;
        }
        var textEl = document.getElementById(id+"_text");
        if (textEl!=null)
        {
        var rectText = textEl.firstChild.nodeValue;
        rectLabels.splice(rectLabels.indexOf(rectText),1);
        }
        i = i+1;
    }
}

function readStateLabels()
{
    var values= document.getElementsByTagName("cbaStateLabels");
    number=values.length;
    i=0;
    while (i<number)
    {
        aux1 = values.item(i);
        val = aux1.getAttribute("value");
        
        //alert('Pos: ' + pos + ' Val: ' + val + ' Weight : ' + weight);
        rectLabels.push(val);
        i = i + 1;
    }
}

function readTransitionLabels()
{
    var values= document.getElementsByTagName("cbaTransitionLabels");
    number=values.length;
    i=0;
    while (i<number)
    {
        aux1 = values.item(i);
        val = aux1.getAttribute("value");
        
        //alert('Pos: ' + pos + ' Val: ' + val + ' Weight : ' + weight);
        lineLabels.push(val);
        i = i + 1;
    }
}

function standardize(R){
    // alert(1);
    var Attr={
        "onmouseup":"add(evt)",
        "onmousedown":"grab(evt)",
        "onmousemove":null
    }
    assignAttr(R,Attr)
}


function add(evt){
    // alert(3);
    if (evt.target.getAttribute("id")!= "background") return    
    if (stateType == 0 ) 
    {
        deselect();
        return
    }
    if (stateType == 1 && nextId[0] == 2 ) return
    if(selectedRect != null) deselect();
    if (rectLabels.length == 0 ) return
    var R=document.createElementNS(xmlns,"rect") 
    var Attr={
        x:evt.clientX,
        y:evt.clientY,
        width:60,
        height:25,
        stroke:"black",
        fill:"yellow",
        rx:20,
        ry:20,
        stable:"no",
        "onclick":"selectRect(evt)",
        id:stateTypeId[stateType-1] + "" + nextId[stateType-1]
    }
    assignAttr(R,Attr)
    
    var L = document.createElementNS(xmlns,"text");
    var Attr={
        x:evt.clientX + 30,
        y:evt.clientY + 12,
        width:60,
        height:25,
        "text-anchor":"middle",
        "font-family":"Tahoma",
        "font-size":"11",
        fill:"#000",
        id:stateTypeId[stateType-1] + "" + nextId[stateType-1] + "_text"
    }
    previousColor = stateTypeColor[stateType-1];
    nextId[stateType-1] = nextId[stateType-1] + 1;
    assignAttr(L,Attr)
    selectedRect = R;
    var tv=document.createTextNode(rectLabels.shift());
    L.appendChild(tv);
    Root.appendChild(R)
    Root.appendChild(L)
    refreshButtons();
}

function grab(evt){
    // alert(4);
    var O=evt.target
    if (evt.target.getAttribute("id") =="background") return
    if (evt.target.getAttribute("id").indexOf('text') > 0 ) return
    if (evt.target.getAttribute("stable") == "yes" ) return
    var Attr={
        "onmousemove":"slide(evt,'"+O.id+"')",
        "onmouseup":"standardize(Root)"
    }
    assignAttr(Root,Attr)
}

function slide(evt,id){
    // alert(5);
    var o=document.getElementById(id)
    o.setAttributeNS(null, "x", evt.clientX)
    o.setAttributeNS(null, "y", evt.clientY)
    var t=document.getElementById(id+"_text")
    t.setAttributeNS(null, "x", evt.clientX+30)
    t.setAttributeNS(null, "y", evt.clientY+12)
}

function assignAttr(O,A){
    // alert(6);
    for (i in A) O.setAttributeNS(null,i, A[i])
}

function Color(){
    // alert(7);
    return "rgb("+parseInt(Math.random()*255)+","+parseInt(Math.random()*255)+","+parseInt(Math.random()*255)+")"
}

function deleteButtonPressed()
{
    deleteRect();
    deleteLine();
    refreshButtons();
}

function deleteRect()
{
    if (selectedRect != null)
    {
    var index = 0;
    var auxLineIds = new Array();
    for (index=0; index<linesIds.length; index++)
    {
        if (linesIds[index].indexOf(selectedRect.getAttribute("id"))>=0)
        {
            auxLineIds.push(linesIds[index]);   
        }
    }
    
    for (index=0; index<auxLineIds.length; index++)
    {
        auxLine = document.getElementById(auxLineIds[index]);
        var evObj = document.createEvent('MouseEvents');
        evObj.initEvent( 'click', true, true );
        auxLine.dispatchEvent(evObj);
        deleteLine();
    }
    textEl = document.getElementById(selectedRect.getAttribute("id")+"_text");
    var rectText = textEl.firstChild.nodeValue;
    rectLabels.unshift(rectText);
    
    Root.removeChild(textEl);
    Root.removeChild(selectedRect);
    selectedRect = null;    
    }
}

function deleteLine()
{
    if (selectedLine != null)
    {
    linesIds.splice(linesIds.indexOf(selectedLine.getAttribute("id")),1);
    textEl = document.getElementById(selectedLine.getAttribute("id")+"_text");
    var lineText = textEl.firstChild.nodeValue;
    lineLabels.unshift(lineText);
    
    Root.removeChild(textEl);
    Root.removeChild(selectedLine);
    selectedLine = null;    
    }
}

function selectRect(evt)
{
    if (selectedLine != null)
    {
        selectedLine.setAttribute("stroke","blue");
        selectedLine.setAttribute("marker-end", "url(#startMarker)");
        selectedLine = null;
    }
    if (selectedRect == null)
    {
        selectedRect = evt.target;
        previousColor = selectedRect.getAttribute("fill");
        selectedRect.setAttribute("fill","yellow");
    } else
    {
        id1 = selectedRect.getAttribute("id");
        id2 = evt.target.getAttribute("id");
        //alert (id1 + "  " + id2);
        if (id1.indexOf('stop') > -1 || id2.indexOf('start') > -1)
        {
            selectedRect.setAttribute("fill", previousColor);
            selectedRect = evt.target;
            previousColor = selectedRect.getAttribute("fill");
            selectedRect.setAttribute("fill","white");
        }
        else
        {
            if (document.getElementById(id1 + "-" + id2) == null)
            {
                if (lineLabels.length == 0 ) return
                if(id1!=id2)
                {
                    drawLine(id1,id2,lineLabels.shift());
                    deselect();
                }
                else
                {
                    drawSelfLine(id1,lineLabels.shift());
                    deselect();
                }
            }
            else{
                deselect();
                var evObj = document.createEvent('MouseEvents');
                evObj.initEvent( 'click', true, true );
                document.getElementById(id1 + "-" + id2).dispatchEvent(evObj);
            }
        }
    }
    refreshButtons();
}

function drawLine(Id1,Id2,label)
{
    checkLabel(label);
    x1 = parseInt(document.getElementById(Id1).getAttribute("x"))
    x2 = parseInt(document.getElementById(Id2).getAttribute("x"))
    
    width1= parseInt(document.getElementById(Id1).getAttribute("width"))
    width2= parseInt(document.getElementById(Id2).getAttribute("width"))
    height1 = parseInt(document.getElementById(Id1).getAttribute("height"))
    height2 = parseInt(document.getElementById(Id2).getAttribute("height"))

    y1= parseInt(document.getElementById(Id1).getAttribute("y"))  
    y2 = parseInt(document.getElementById(Id2).getAttribute("y"))   
    var deplW1 = width1 / 4
    var deplW2 = width2 / 4
    var deplH1 = height1 / 4
    var deplH2 = height2 / 4
    
    if (x1+width1 > x2-width2 && x1< x2 + width2 && (y1+height1<y2 || y1>y2+height2))
    {
        if (y1 + height1 < y2)
        {
            x1= x1  + deplW1;
            x2= x2  + deplW2;
            y1= y1+height1;
        }
        else
        {
            x1= x1 + 3 * deplW1;
            x2= x2 + 3 * deplW2;
            y2= y2+height2;
        }
    }
    else 
    {
            if (x1+width1 <= x2)
            {
                x1=x1+width1;
                y1=y1+ deplH1;
                y2=y2+ deplH2;
            }
            else if (x1 > x2 + width2) 
            {
                x2=x2+width2;
                y1=y1+ 3 * deplH1;
                y2=y2+ 3 * deplH2;
            }
        }
        
    var textX = (x1-x2)/2
    var textY = (y1-y2)/2
    var Line=document.createElementNS(xmlns,"line")
    Line.setAttribute("x1", x1)
    Line.setAttribute("x2", x2)
    Line.setAttribute("y1", y1)
    Line.setAttribute("y2", y2)
    Line.setAttribute("id", Id1 + "-" + Id2);
    
    Line.setAttribute("marker-end", "url(#startMarker)")

    Line.setAttribute("stroke","blue")
    Line.setAttribute("fill","none")
    Line.setAttribute("stroke-width",3)
    
    lineText=document.getElementById("lineText").cloneNode("false");
    var tv=document.createTextNode(label);
    lineText.setAttribute("x", x1-textX+5)
    lineText.setAttribute("y", y1-textY)
    if( lineText.firstChild != null )
    {
        lineText.replaceChild(tv,lineText.firstChild)
    }
    else
    {
        lineText.appendChild(tv)
    }
    lineText.setAttribute("id", Id1 + "-" + Id2 + "_text")
    Line.appendChild(lineText)
    Line.setAttribute("onclick","selectLine(evt)")
    Root.appendChild(Line)
    Root.appendChild(lineText)
    
    document.getElementById(Id1).setAttribute("stable","yes");
    document.getElementById(Id2).setAttribute("stable","yes");
    
    linesIds.push(Line.getAttribute("id"));
}

function drawSelfLine(Id,label)
{
    checkLabel(label);
    y = parseInt(document.getElementById(Id).getAttribute("y"));
    x = parseInt(document.getElementById(Id).getAttribute("x")) + (parseInt(document.getElementById(Id).getAttribute("width"))/2);
    height = document.getElementById(Id).getAttribute("height");
    width = document.getElementById(Id).getAttribute("width");
    
    Line=document.getElementById("elipse").cloneNode("false")
    Arrow=document.getElementById("arrow").cloneNode("false")
    // set the path of the line
    auxX = (x + width/2) - x;
    auxY = (y + height/2) - y;
    auxCx = 40*width/100;
    auxCy = 30*height/100;
    path = "M " + x + "," + y + " a" + auxCx + "," + auxCy +" 1 1,1 " + auxX + "," + auxY;
    arrowPath = (x + width/2 + 3)+","+(y+height/2-8)+" "+(x + width/2)+","+(y+height/2)+" "+(x + width/2 + 5)+","+(y+height/2+4)
    Line.setAttribute("id",Id + "-" + Id)
    Line.setAttribute("d", path)
    Line.setAttribute("stroke","blue")
    Line.setAttribute("fill","none")
    Line.setAttribute("stroke-width","3")
    Line.setAttributeNS(null, "style","");
    Line.setAttribute("marker-end", "url(#startMarker)")
    
    //Arrow.setAttribute("points", arrowPath)
    //Arrow.setAttribute("stroke","blue")
    //Arrow.setAttribute("fill","none")
    //Arrow.setAttribute("stroke-width",3)
    //Arrow.setAttribute("marker-end", "")
    
    lineText=document.getElementById("lineText").cloneNode("false");
    var tv=document.createTextNode(label);
    lineText.setAttribute("x",x+ 10)
    lineText.setAttribute("y", y - 10)
    if( lineText.firstChild != null )
    {
        lineText.replaceChild(tv,lineText.firstChild)
    }
    else
    {
        lineText.appendChild(tv)
    }
    lineText.setAttribute("id", Id + "-" + Id + "_text")
    Line.appendChild(lineText)
    Line.setAttribute("onclick","selectLine(evt)")
    Root.appendChild(Line)
    Root.appendChild(lineText)
    //Root.appendChild(Arrow)
    
    document.getElementById(Id).setAttribute("stable","yes");
    
    linesIds.push(Line.getAttribute("id"));
}

function checkLabel(label)
{
    if (lineLabels.indexOf(label) >-1)
    {
        lineLabels.splice(lineLabels.indexOf(label),1);
    }
}

function selectLine(evt)
{
    if (selectedLine == null)
    {
        selectedLine = evt.target;
        selectedLine.setAttribute("stroke","red");
        selectedLine.setAttribute("marker-end", "url(#selectedStartMarker)")
        refreshButtons();
    }
}


function deselect()
{
    if (selectedRect != null)
    {
        selectedRect.setAttribute("fill", previousColor);
        previousColor = "";
        selectedRect = null;
    }
    if (selectedLine != null)
    {
        selectedLine.setAttribute("stroke","blue");
        selectedLine.setAttribute("marker-end", "url(#startMarker)");
        selectedLine = null;
    }
    refreshButtons();
}

function downButtonPressed()
{
    if (selectedRect != null)
    {
        if (rectLabels.length == 0 ) return
        textEl = document.getElementById(selectedRect.getAttribute("id")+"_text");
        var rectText = textEl.firstChild.nodeValue;
        var newRectText = rectLabels.pop();
        rectLabels.unshift(rectText);
        textEl.firstChild.nodeValue = newRectText;
    }
    if (selectedLine != null)
    {
        if (lineLabels.length == 0 ) return
        textEl = document.getElementById(selectedLine.getAttribute("id")+"_text");
        var lineText = textEl.firstChild.nodeValue;
        var newLineText = lineLabels.pop();
        lineLabels.unshift(lineText);
        textEl.firstChild.nodeValue = newLineText;
    }
}

function upButtonPressed()
{
    if (selectedRect != null)
    {
        if (rectLabels.length == 0 ) return
        textEl = document.getElementById(selectedRect.getAttribute("id")+"_text");
        var rectText = textEl.firstChild.nodeValue;
        var newRectText = rectLabels.shift();
        rectLabels.push(rectText);
        textEl.firstChild.nodeValue = newRectText;
    }
    if (selectedLine != null)
    {
        if (lineLabels.length == 0 ) return
        textEl = document.getElementById(selectedLine.getAttribute("id")+"_text");
        var lineText = textEl.firstChild.nodeValue;
        var newLineText = lineLabels.shift();
        lineLabels.push(lineText);
        textEl.firstChild.nodeValue = newLineText;
    }
}

function deleteButtonMouseOver(evt)
{
    var rect = document.getElementById('delete_rect');
 
    if (selectedLine != null || selectedRect != null)
    {
    rect.setAttributeNS(null, "filter", "url(#delete_mouseover)");
    tooltip(evt, deleteButtonHelp);
    }
    else {
    rect.setAttributeNS(null, "filter", "url(#delete)");
    }
}

function deleteButtonState()
{
    var rect = document.getElementById('delete_rect');
 
    if (selectedLine != null || selectedRect != null)
    {
    rect.setAttributeNS(null, "filter", "url(#delete_active)");
    }
    else {
    rect.setAttributeNS(null, "filter", "url(#delete)");
    }
    tooltip();
}


function upButtonMouseOver(evt)
{
    var rect = document.getElementById('up_rect');
 
    if (selectedLine != null || selectedRect != null)
    {
    rect.setAttributeNS(null, "filter", "url(#up_mouseover)");
    tooltip(evt, upButtonHelp);
    }
    else {
    rect.setAttributeNS(null, "filter", "url(#up)");
    }
}

function upButtonState()
{
    var rect = document.getElementById('up_rect');
 
    if (selectedLine != null || selectedRect != null)
    {
    rect.setAttributeNS(null, "filter", "url(#up_active)");
    }
    else {
    rect.setAttributeNS(null, "filter", "url(#up)");
    }
    tooltip();
}

function downButtonMouseOver(evt)
{
    var rect = document.getElementById('down_rect');
 
    if (selectedLine != null || selectedRect != null)
    {
    rect.setAttributeNS(null, "filter", "url(#down_mouseover)");
    tooltip(evt, downButtonHelp);
    }
    else {
    rect.setAttributeNS(null, "filter", "url(#down)");
    }
}

function downButtonState()
{
    var rect = document.getElementById('down_rect');
 
    if (selectedLine != null || selectedRect != null)
    {
    rect.setAttributeNS(null, "filter", "url(#down_active)");
    }
    else {
    rect.setAttributeNS(null, "filter", "url(#down)");
    }
    tooltip();
}


function refreshButtons()
{
   deleteButtonState();
   upButtonState();
   downButtonState();
}

//function startStateButtonState()
//{
//    var rect = document.getElementById('add_start');
// 
//    if (stateType == 1)
//    {
//  rect.setAttributeNS(null, "filter", "url(#start_selected)");
//    }
//    else {
//  rect.setAttributeNS(null, "filter", "url(#start)");
//    }
//    tooltip();
//}
//
//function startStateButtonPressed()
//{
//    var rect = document.getElementById('add_start');
// 
//    if (stateType != 1)
//    {
//  rect.setAttributeNS(null, "filter", "url(#start_selected)");
//  stateType = 1;
//  stopStateButtonState();
//  normalStateButtonState();
//    }
//    else {
//  rect.setAttributeNS(null, "filter", "url(#start)");
//  stateType = 0;
//    }
//}
//
//function startStateButtonMouseOver(evt)
//{
//    var rect = document.getElementById('add_start');
// 
//    if (stateType != 1)
//    {
//  rect.setAttributeNS(null, "filter", "url(#start_mouseover)");
//  tooltip(evt, 'Add start state');
//    }
//    else {
//  rect.setAttributeNS(null, "filter", "url(#start_selected)");
//    }
//}
//
//function stopStateButtonState()
//{
//    var rect = document.getElementById('add_stop');
// 
//    if (stateType == 3)
//    {
//  rect.setAttributeNS(null, "filter", "url(#stop_selected)");
//    }
//    else {
//  rect.setAttributeNS(null, "filter", "url(#stop)");
//    }
//    tooltip();
//}
//
//function stopStateButtonPressed()
//{
//    var rect = document.getElementById('add_stop');
// 
//    if (stateType != 3)
//    {
//  rect.setAttributeNS(null, "filter", "url(#stop_selected)");
//  stateType = 3;
//  startStateButtonState();
//  normalStateButtonState();
//    }
//    else {
//  rect.setAttributeNS(null, "filter", "url(#stop)");
//  stateType = 0;
//    }
//}
//
//function stopStateButtonMouseOver(evt)
//{
//    var rect = document.getElementById('add_stop');
// 
//    if (stateType != 3)
//    {
//  rect.setAttributeNS(null, "filter", "url(#stop_mouseover)");
//  tooltip(evt, 'Add stop state');
//    }
//    else {
//  rect.setAttributeNS(null, "filter", "url(#stop_selected)");
//    }
//}

function normalStateButtonState()
{
    var rect = document.getElementById('add_normal');

    if (stateType == 2)
    {
    rect.setAttributeNS(null, "filter", "url(#normal_selected)");
    }
    else {
    rect.setAttributeNS(null, "filter", "url(#normal)");
    }
    tooltip();
}

function normalStateButtonPressed()
{
    var rect = document.getElementById('add_normal');
 
    if (stateType != 2)
    {
    rect.setAttributeNS(null, "filter", "url(#normal_selected)");
    stateType = 2;
    //startStateButtonState();
    //stopStateButtonState();
    }
    else {
    rect.setAttributeNS(null, "filter", "url(#normal)");
    stateType = 0;
    }
}

function normalStateButtonMouseOver(evt)
{
    var rect = document.getElementById('add_normal');
 
    if (stateType != 2)
    {
    rect.setAttributeNS(null, "filter", "url(#normal_mouseover)");
    tooltip(evt, addStateButtonHelp);
    }
    else {
    rect.setAttributeNS(null, "filter", "url(#normal_selected)");
    }
}

function tooltip(evt, text)
{
    if(!evt || !text || text == ""){
        document.getElementById('tooltipArea').setAttributeNS(null,'transform','translate(' + (-1000) + ',' + (-1000) + ')');
        return;
    }
    document.getElementById('tooltipText').firstChild.data = text;
    var myTextLength = document.getElementById('tooltipText').getComputedTextLength();
    document.getElementById('tooltipRect').setAttributeNS(null,'width',myTextLength + 4);
    document.getElementById('tooltipArea').setAttributeNS(null,'transform','translate(' + (evt.clientX + 10) + ',' + (evt.clientY + 10) + ')');
}

 
