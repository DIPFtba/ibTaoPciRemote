

var svgDocument=null;
var Root=document.documentElement;
var O=null;
var txt = null;
var svgns = 'http://www.w3.org/2000/svg';
var xlinkns = 'http://www.w3.org/1999/xlink';
var xmlns="http://www.w3.org/2000/svg";
var rectX_first = null;
var rectY_first = null;
var rectY_second = null;
var Line = null;
var linesXY = [new Array(0,0,0,0,0),new Array(0,0,0,0,0),new Array(0,0,0,0,0),new Array(0,0,0,0,0),new Array(0,0,0,0,0)];
var linesYY = [new Array(0,0,0,0,0),new Array(0,0,0,0,0),new Array(0,0,0,0,0),new Array(0,0,0,0,0),new Array(0,0,0,0,0)];
var selected = null;
var justSelected = true;
var textSelected = " ";
var selectedXColor = "";
var selectedY1Color = "";
var selectedY2Color = "";
var modiffied = 0;
var NumOfX=0;
var NumOfY=0;
var count=0
var namesX = new Array("","","","","");
var namesY = new Array("","","","","");
var idsX = new Array("","","","","");
var idsY = new Array("","","","","");
var isFreezed = false;
var hasPoint = false;
var thisID = 0;
var initialText= "";
var newText = "";
var initialWeight = 0;
var newWeight = 0;
var modTxt = false;
var modThikness = false;
var weightConst = new Array("small","middle","high");
var discreteValueMap = false;
var discreteValueText = false;
var discreteValues = new Array("","","","","","","","","","","","");
var discreteWeightValues = new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
var linesXYDiscrete = [new Array(0,0,0,0,0),new Array(0,0,0,0,0),new Array(0,0,0,0,0),new Array(0,0,0,0,0),new Array(0,0,0,0,0)];
var linesYYDiscrete = [new Array(0,0,0,0,0),new Array(0,0,0,0,0),new Array(0,0,0,0,0),new Array(0,0,0,0,0),new Array(0,0,0,0,0)];
var nrDiscreteValues = 0;
var timeDependent = false;
var timeDependentValue = "";
var modTime = false;
var initialTime = 0;
var newTime = 0;
var defaultWeight = 0;
var noDeleteToolbar = false;
var noDiscreteWeightToolbar = false;
var noTimeDependentToolbar = false;
var noIndirectDependencies = false;
var deleteButtonHelp = "";
var weightUpButtonHelp = "";
var weightDownButtonHelp = "";
var timeDelayButtonHelp = "";
var timeDelayUpButtonHelp = "";
var timeDelayDownButtonHelp = "";



var dependencyType = false; // This is set to true if the dependency is supported both ways... numerically and visually

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

function setIsFreezedToTrue()
{
    isFreezed = true;
}

function showContextMenu( showContextMenu )
{
    if (! showContextMenu) document.oncontextmenu = new Function( 'return false' );
}

function startup(){
    svgRoot = document.documentElement;
    document.documentElement.addEventListener("keydown",key_press,false);
    determineNumOfRect();
    defaultWeight = document.getElementsByTagName("cbaDefaultLineWeight").item(0).getAttributeNS(null, "id");
    if(defaultWeight == "")
    {
    defaultWeight = 3;
    }
    
    if(document.getElementsByTagName("cbaValueMapDefined").item(0).getAttributeNS(null, "id") == "true")
    {
    discreteValueMap = true;
    determineDiscreteValues();
    }
    else{
    discreteValueMap = false;
    }
    
    if(document.getElementsByTagName("cbaNoIndirectDependencies").item(0).getAttributeNS(null, "id") == "true")
    {
    noIndirectDependencies = true;
    }
    else{
    noIndirectDependencies = false;
    }
    
    if(document.getElementsByTagName("cbaNoDeleteToolbar").item(0).getAttributeNS(null, "id") == "true")
    {
    noDeleteToolbar = true;
    }
    else{
    noDeleteToolbar = false;
    }
    
    if(document.getElementsByTagName("cbaNoDiscreteWeightToolbar").item(0).getAttributeNS(null, "id") == "true")
    {
    noDiscreteWeightToolbar = true;
    }
    else{
    noDiscreteWeightToolbar = false;
    }
    
    if(document.getElementsByTagName("cbaNoTimeDependentToolbar").item(0).getAttributeNS(null, "id") == "true")
    {
    noTimeDependentToolbar = true;
    }
    else{
    noTimeDependentToolbar = false;
    }

    readVariableNames();
    var dependency = document.getElementsByTagName("cbaDependencyType").item(0).getAttributeNS(null, "id");
    if (dependency == "true")
    {
        dependencyType = true;
    }   
    else
    {
        dependencyType = false;
    }
    
    determineToolbars();
    //getToolbarsHelpText();
    standardize(Root);
}

function getToolbarsHelpText()
{
    var microDynModelId = document.getElementsByTagName("cbaMycroDynModelPanel").item(0).getAttributeNS(null, "id");
    deleteButtonHelp = eval(getRealParentForTextField()+ "." + microDynModelId + ".getDeleteButtonHelp();");
    weightUpButtonHelp = eval(getRealParentForTextField()+ "." + microDynModelId + ".getWeightUpButtonHelp();");
    weightDownButtonHelp = eval(getRealParentForTextField()+ "." + microDynModelId + ".getWeightDownButtonHelp();");
    timeDelayButtonHelp = eval(getRealParentForTextField()+ "." + microDynModelId + ".getTimeDelayButtonHelp();");
    timeDelayUpButtonHelp = eval(getRealParentForTextField()+ "." + microDynModelId + ".getTimeDelayUpButtonHelp();");
    timeDelayDownButtonHelp = eval(getRealParentForTextField()+ "." + microDynModelId + ".getTimeDelayDownButtonHelp();");
}

function determineNumOfRect()
{
    var rectangles= document.getElementsByTagName("rect");
    number=rectangles.length;
    i=0;
    while (i<number)
    {
        aux1 = rectangles.item(i);
        pos = parseInt(aux1.getAttribute("onclick").charAt(aux1.getAttribute("onclick").length-3));
        if (aux1.getAttribute("onclick").indexOf('X') != -1) 
        {
            NumOfX = NumOfX+1;
            idsX[pos] = aux1.getAttribute("id");
        }
        if (aux1.getAttribute("onclick").indexOf('Y') != -1) 
        {
            NumOfY = NumOfY+1;
            idsY[pos] = aux1.getAttribute("id");
        }
        i = i+1;
    }
    //alert('Nr x: ' + NumOfX + ' Nr y: ' + NumOfY);
}

function determineDiscreteValues()
{
    var values= document.getElementsByTagName("cbaValueMapValue");
    number=values.length;
    i=0;
    while (i<number)
    {
        aux1 = values.item(i);
        pos = parseInt(aux1.getAttribute("id"));
        val = aux1.getAttribute("value");
    weight = aux1.getAttribute("weight");
    
    //alert('Pos: ' + pos + ' Val: ' + val + ' Weight : ' + weight);
    
    discreteValues[pos] = val;
    discreteWeightValues[pos] = weight;
    nrDiscreteValues++;
        i = i+1;
    }
    
    if (document.getElementsByTagName("cbaValueMapType").item(0).getAttributeNS(null, "id") == "text")
    {
    discreteValueText = true;
    }
    else
    {
    discreteValueText = false;
    }
    
}

function readVariableNames()
{
    var text= document.getElementsByTagName("text");
    number=text.length;
    i=1;
    while (i<number)
    {
        aux1 = text.item(i);
        //aux1.setAttribute("onclick","");
        objet=document.getElementById(aux1.getAttribute("id"));
        child=objet.firstChild;
        pos = parseInt(aux1.getAttribute("onclick").charAt(aux1.getAttribute("onclick").length-3));
    var rectText = child.nodeValue;
        if (aux1.getAttribute("onclick").indexOf('X') != -1) 
        {
            namesX[pos] = child.nodeValue;
        }
        if (aux1.getAttribute("onclick").indexOf('Y') != -1) 
        {
            namesY[pos] = child.nodeValue;
        }
    var rectWidth = parseInt(aux1.getAttribute("width"))
    var textX = parseInt(aux1.getAttribute("x"));
    if(rectText.length > rectWidth/3)
    {    
        var temp = new Array();
        var splitArray = new Array();
        temp = rectText.split(' ');
        j = 0;
        auxText = "";
        for (index = 0; index<temp.length; index++)
        {
        if (auxText.length + temp[index].length > rectWidth/5)
        {
            if (!auxText=="")
            {
            splitArray[j] = auxText;
            auxText = temp[index];
            j++;
            }
            else
            {
            splitArray[j]= temp[index];
            j++;
            }
        }
        else{
            auxText = auxText + " " + temp[index];
        }
        }
        splitArray[j] = auxText;
        
        for ( index = 0; index <= j; index++)
        {
        var dy = 10;
        if (index == 0) { dy = 0; }
        child.nodeValue = "";
        var tspan = document.createElementNS(svgns,"tspan");
        tspan.setAttributeNS(null,"x",textX);
        tspan.setAttributeNS(null,"dy",dy);
        var textNode = document.createTextNode(splitArray[index]);
        tspan.appendChild(textNode);
        objet.appendChild(tspan);
        }
    }
        i++;
    }
}

function determineToolbars()
{
    var index = 1;
    if (noDeleteToolbar)
    {
    aux = document.getElementById("delete_rect");
    aux.parentNode.removeChild(aux);
    index--;
    }
    if (noDiscreteWeightToolbar)
    {
    aux = document.getElementById("up_rect");
    aux.parentNode.removeChild(aux);
    aux = document.getElementById("down_rect");
    aux.parentNode.removeChild(aux);
    }
    else
    {
    aux = document.getElementById("up_rect");
    aux.setAttribute("x", (index * 30) + 5);
    index ++;
    aux = document.getElementById("down_rect");
    aux.setAttribute("x", (index * 30) + 5);
    index ++;
    }
    if (noTimeDependentToolbar)
    {
    aux = document.getElementById("dependency_rect");
    aux.parentNode.removeChild(aux);
    aux = document.getElementById("timeDep_up_rect");
    aux.parentNode.removeChild(aux);
    aux = document.getElementById("timeDep_down_rect");
    aux.parentNode.removeChild(aux);
    }
    else
    {
    aux = document.getElementById("dependency_rect");
    aux.setAttribute("x", (index * 30) + 5);
    index ++;
    aux = document.getElementById("timeDep_up_rect");
    aux.setAttribute("x", (index * 30) + 5);
    index ++;
    aux = document.getElementById("timeDep_down_rect");
    aux.setAttribute("x", (index * 30) + 5);
    }
}

function checkModified(mod)
{
    var modified = true;
    var microDynModelId = document.getElementsByTagName("cbaMycroDynModelPanel").item(0).getAttributeNS(null, "id");
    //alert(mycroDynModelId);
    if (mod == 0)
    {
        modified = false;
    }
    try {
        eval(getRealParentForTextField()+ "." + microDynModelId + ".updateState(\""+ modified +"\");"); 
        //alert(getRealParentForTextField()+ "." + microDynModelId + ".setModified("+ modified +"); ");
    }
    catch(exception)
    {
        //alert("Error: " + exception);
        //throw exception;
    }
}

function logEvents(type,text,nr1,nr2,value,startAfterStep)
{
    var microDynModelId = document.getElementsByTagName("cbaMycroDynModelPanel").item(0).getAttributeNS(null, "id");
    try {
        //alert(getRealParentForTextField()+ "." + microDynModelId + ".logSVGEvents(\""+ type +"\",\"" + text +"\",\""+ nr1 +"\",\"" + nr2 +"\",\"" + value + "\",\"" + startAfterStep +"\");");
        eval(getRealParentForTextField()+ "." + microDynModelId + ".logSVGEvents(\""+ type +"\",\"" + text +"\",\""+ nr1 +"\",\"" + nr2 +"\",\"" + value + "\",\"" + startAfterStep +"\");");
    }
    catch(exception)
    {
        alert("Error: " + exception);
        //throw exception;
    }
}

function drawLine(Id1,Id2,text,startAfterStep)
{
    if(Id1 == Id2)
    {
    drawLineYID(Id1,text,defaultWeight,startAfterStep);
    }
    else{
    if (idsX.indexOf(Id1) >= 0)
    {
        drawXYLinesID(Id1,Id2,text,defaultWeight,startAfterStep)
    }
    else{
        drawYYLinesID(Id1,Id2,text,defaultWeight,startAfterStep)
    }
    }
}

function getWeight(variable, oldWeight)
{
    weight = oldWeight;
    if(discreteValueMap && dependencyType)
    {
    if (discreteValues.indexOf(variable) >= 0)
    {
        weight = discreteWeightValues[discreteValues.indexOf(variable)];
    }
    }
    return weight;
}

function drawLineYID(Id,txt,weight,startAfterStep)
{
    if(noIndirectDependencies) return;
    weight = getWeight(txt,weight);
    var str = Id.toString();
    var nrY = str.charAt(str.length-1);
    y = parseInt(document.getElementById(Id).getAttribute("y"));
    x = parseInt(document.getElementById(Id).getAttribute("x")) + (parseInt(document.getElementById(Id).getAttribute("width"))/2);
    height = document.getElementById(Id).getAttribute("height");
    width = document.getElementById(Id).getAttribute("width");
    //drawLineY(x,y,parseInt(rectY_first.getAttribute("height")),parseInt(rectY_first.getAttribute("width")),nrY,"",defaultWeight)
                
    // draw line from Yi->Yi
    Line=document.getElementById("elipse").cloneNode("false")
    Arrow=document.getElementById("arrow").cloneNode("false")
    // set the path of the line
    auxX = (x + width/2) - x;
    auxY = (y + height/2) - y;
    auxCx = 40*width/100;
    auxCy = 30*height/100;
    path = "M " + x + "," + y + " a" + auxCx + "," + auxCy +" 1 1,1 " + auxX + "," + auxY;
    arrowPath = (x + width/2 + 3)+","+(y+height/2-8)+" "+(x + width/2)+","+(y+height/2)+" "+(x + width/2 + 5)+","+(y+height/2+4)
    Line.setAttribute("id","elipse" + nrY)
    Line.setAttribute("d", path)
    Line.setAttribute("stroke","blue")
    Line.setAttribute("fill","none")
    Line.setAttribute("stroke-width",weight)
    Line.setAttributeNS(null, "style","");
    
    delay = "";
    if (startAfterStep > 0 )
    {
    Line.setAttributeNS(null, "style","stroke-dasharray: 6, 3;");
    delay = '/ ' + startAfterStep;
    }
    Arrow.setAttribute("points", arrowPath)
    Arrow.setAttribute("stroke","blue")
    Arrow.setAttribute("fill","none")
    Arrow.setAttribute("stroke-width",weight)
    Arrow.setAttribute("marker-end", "")
    
    var lineText=null;
    if ((discreteValueMap && discreteValueText) || !discreteValueMap)
    {
    lineText=document.getElementById("lineText").cloneNode("false");
    var tv=document.createTextNode(txt + ' ' + delay);
    lineText.setAttribute("id",Line.getAttribute("id") + "_text");
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
    Line.appendChild(lineText)
    Line.setAttribute("onclick","deleteLine(evt)")
    svgRoot.appendChild(Line)
    svgRoot.appendChild(Arrow)
    svgRoot.appendChild(lineText)
    }
    else
    {
    lineIcon=document.getElementById("img_rect").cloneNode("false");
    lineIcon.setAttribute("id",Line.getAttribute("id") + "_icon");
    lineIcon.setAttribute("x",x + 10)
    lineIcon.setAttribute("y", y - 30)
    lineIcon.setAttribute("filter", txt);
    
    lineText=document.getElementById("lineText").cloneNode("false");
    var tv=document.createTextNode(delay);
    lineText.setAttribute("id",Line.getAttribute("id") + "_text");
    lineText.setAttribute("x", x + 40)
    lineText.setAttribute("y", y - 20)
    if( lineText.firstChild != null )
    {
        lineText.replaceChild(tv,lineText.firstChild)
    }
    else
    {
        lineText.appendChild(tv)
    }
    
    Line.appendChild(lineIcon)
    Line.appendChild(lineText)
    Line.setAttribute("onclick","deleteLine(evt)")
    svgRoot.appendChild(Line)
    svgRoot.appendChild(Arrow)
    svgRoot.appendChild(lineIcon)
    svgRoot.appendChild(lineText)
    }
    checkModified(++modiffied)
    if (!isFreezed)
        logEvents("add","source="+namesY[nrY] + " " + "destination="+namesY[nrY],"Y"+Id,"Y"+Id,txt,startAfterStep);
    //alert(Line.getAttribute("id"));
}

function drawXYLinesID(Id1,Id2,txt,weight,startAfterStep)
{
    weight = getWeight(txt,weight);
    var str = Id1.toString();
    var nrX = str.charAt(str.length-1);
    str = Id2.toString();
    var nrY = str.charAt(str.length-1);

    x1 = parseInt(document.getElementById(Id1).getAttribute("x"))
    x2 = parseInt(document.getElementById(Id2).getAttribute("x"))
    
    width1= parseInt(document.getElementById(Id1).getAttribute("width"))
    width2= parseInt(document.getElementById(Id2).getAttribute("width"))
    height1 = parseInt(document.getElementById(Id1).getAttribute("height"))
    height2 = parseInt(document.getElementById(Id2).getAttribute("height"))

    y1= parseInt(document.getElementById(Id1).getAttribute("y"))  
    y2 = parseInt(document.getElementById(Id2).getAttribute("y"))   
    
    var textX = 0
    var textY = 0
    if (x1+width1 > x2-width2 && x1< x2 + width2 && (y1+height1<y2 || y1>y2+height2))
    {
        if (y1 + height1 < y2)
        {
            x1= x1 + width1/2;
            x2= x2 + width2/2;
            y1= y1+height1;
            
            textX = x1+10;
            textY = y1 + (10*nrY)
        
        }
        else
        {
            x1= x1 + width1/2;
            x2= x2 + width2/2;
            y2= y2+height2;
            
            textX = x1+10;
            textY = y1 - (10*nrY)
            
        }
    }
    else 
    {
        if (x1+width1 <= x2)
        {
            x1=x1+width1;
            y1=y1+height1/2;
            y2=y2+height2/2;
            
            textX = x1+ 10 * nrY;
            textY = y1 - sign(y1-y2) * 10 *nrY; 
            
        }
        else if (x1 > x2 + width2) 
        {
            x2=x2+width2;
            y1=y1+height1/2;
            y2=y2+height2/2;
            
            textX = x1 - 10 * nrY;
            textY = y1 - sign(y1-y2) * 10 *nrY; 
        }
    }
    var Line=determineLine(x1,x2,y1,y2,Id1,Id2,nrX,nrY,true);
    var midX=(x1-x2)/2;
    var midY=(y1-y2)/2;
        
    Line.setAttribute("marker-end", "url(#startMarker)")
    //alert(Line.getAttribute("d"));
    
    Line.setAttribute("stroke","blue")
    Line.setAttribute("fill","none")
    Line.setAttribute("stroke-width",weight)
    delay = "";
    if (startAfterStep > 0 )
    {
    Line.setAttributeNS(null, "style","stroke-dasharray: 6, 3;");
    delay = '/ ' + startAfterStep;
    }
    var lineText=null;
    if ((discreteValueMap && discreteValueText) || !discreteValueMap)
    {
    lineText=document.getElementById("lineText").cloneNode("false");
    var tv=document.createTextNode(txt + ' ' + delay);
    lineText.setAttribute("fill", "#000")
          
    lineText.setAttribute("id",Line.getAttribute("id") + "_text");
    lineText.setAttribute("x", textX)
    lineText.setAttribute("y", textY)
        
    if( lineText.firstChild != null )
    {
        lineText.replaceChild(tv,lineText.firstChild)
    }
    else
    {
        lineText.appendChild(tv)
    }
    
    Line.appendChild(lineText)
    Line.setAttribute("onclick","deleteLine(evt)")
        svgRoot.appendChild(Line)
    svgRoot.appendChild(lineText)
    }
    else
    {
    lineIcon=document.getElementById("img_rect").cloneNode("false");
    lineIcon.setAttribute("id",Line.getAttribute("id") + "_icon");
    lineIcon.setAttribute("x",textX)
    lineIcon.setAttribute("y", textY)
    lineIcon.setAttribute("filter", txt);
    
    lineText=document.getElementById("lineText").cloneNode("false");
    var tv=document.createTextNode(delay);
    lineText.setAttribute("id",Line.getAttribute("id") + "_text");
    lineText.setAttribute("x", textX + 30)
    lineText.setAttribute("y", textY + 10)
    if( lineText.firstChild != null )
    {
        lineText.replaceChild(tv,lineText.firstChild)
    }
    else
    {
        lineText.appendChild(tv)
    }
    
    Line.appendChild(lineIcon)
    Line.appendChild(lineText)
    Line.setAttribute("onclick","deleteLine(evt)")
        svgRoot.appendChild(Line)
    svgRoot.appendChild(lineIcon)
    svgRoot.appendChild(lineText)
    }

    checkModified(++modiffied)
    if (!isFreezed)
        logEvents("add","source="+namesX[nrX] + " " + "destination="+namesY[nrY],"X"+Id1,"Y"+Id2,txt,startAfterStep);
    //alert(Line.getAttribute("id"));
}

function drawYYLinesID(Id1,Id2,txt,weight,startAfterStep)  
{
    if(noIndirectDependencies) return;
    weight = getWeight(txt,weight);
    var str = Id1.toString();
    var nrY1 = str.charAt(str.length-1);
    str = Id2.toString();
    var nrY2 = str.charAt(str.length-1);

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

    var textX = 0
    var textY = 0
    if (x1+width1 > x2-width2 && x1< x2 + width2 && (y1+height1<y2 || y1>y2+height2))
    {
        if (y1 + height1 < y2)
        {
        x1= x1  + deplW1;
        x2= x2  + deplW2;
        y1= y1+height1;
                        
        textX = x1+10;
        textY = y1 + (10*nrY2)
        }
        else
        {
        x1= x1 + 3 * deplW1;
        x2= x2 + 3 * deplW2;
        y2= y2+height2;
            
        textX = x1+10;
        textY = y1 - (10*nrY2)
        }
    }
    else 
    {
        if (x1+width1 <= x2)
        {
            x1=x1+width1;
            y1=y1+ deplH1;
            y2=y2+ deplH2;
            
            textX = x1+ 10 * nrY2;
            textY = y1 - sign(y1-y2) * 10 *nrY2; 
        }
        else if (x1 > x2 + width2) 
        {
            x2=x2+width2;
            y1=y1+ 3 * deplH1;
            y2=y2+ 3 * deplH2;
            
            textX = x1 - 10 * nrY2;
            textY = y1 - sign(y1-y2) * 10 *nrY2; 
        }
    }
    var Line=determineLine(x1,x2,y1,y2,Id1,Id2,nrY1,nrY2,false);

    Line.setAttribute("marker-end", "url(#startMarker)")

    Line.setAttribute("stroke","blue")
    Line.setAttribute("fill","none")
    Line.setAttribute("stroke-width",weight)
    delay = "";
    if (startAfterStep > 0 )
    {
    Line.setAttributeNS(null, "style","stroke-dasharray: 6, 3;");
    delay = '/ ' + startAfterStep;
    }
    
    
    var lineText=null;
    if ((discreteValueMap && discreteValueText) || !discreteValueMap)
    {
    lineText=document.getElementById("lineText").cloneNode("false");
    var tv=document.createTextNode(txt + " " + delay);
    lineText.setAttribute("id",Line.getAttribute("id") + "_text");
    lineText.setAttribute("x", textX)
    lineText.setAttribute("y", textY)
    if( lineText.firstChild != null )
    {
        lineText.replaceChild(tv,lineText.firstChild)
    }
    else
    {
        lineText.appendChild(tv)
    }
    Line.appendChild(lineText)
    Line.setAttribute("onclick","deleteLine(evt)")
    svgRoot.appendChild(Line)
    svgRoot.appendChild(lineText)
    }
    else
    {
    lineIcon=document.getElementById("img_rect").cloneNode("false");
    lineIcon.setAttribute("id",Line.getAttribute("id") + "_icon");
    lineIcon.setAttribute("x",textX)
    lineIcon.setAttribute("y", textY)
    lineIcon.setAttribute("filter", txt);
    
    lineText=document.getElementById("lineText").cloneNode("false");
    var tv=document.createTextNode(delay);
    lineText.setAttribute("id",Line.getAttribute("id") + "_text");
    lineText.setAttribute("x", textX + 30)
    lineText.setAttribute("y", textY + 10)
    if( lineText.firstChild != null )
    {
        lineText.replaceChild(tv,lineText.firstChild)
    }
    else
    {
        lineText.appendChild(tv)
    }
    
    Line.appendChild(lineIcon)
    Line.appendChild(lineText)
    Line.setAttribute("onclick","deleteLine(evt)")
        svgRoot.appendChild(Line)
    svgRoot.appendChild(lineIcon)
    svgRoot.appendChild(lineText)
    }
    
    checkModified(++modiffied)
    if (!isFreezed)
        logEvents("add","source="+namesY[nrY1] + " " + "destination="+namesY[nrY2],"Y"+Id1,"Y"+Id2,txt,startAfterStep);
    //alert(Line.getAttribute("id"));
}

function key_press(event)
{
    if (!isFreezed)
    {
    var text = "";
    //handle "keypress" for all "real characters"
    if (event.type == "keydown") {
     //some browsers support evt.charCode, some only evt.keyCode
      if (event.charCode) {
        var charCode = event.charCode;
        }
        else {
        var charCode = event.keyCode;
        }
        //alert(charCode);
        //all digits char
        if (discreteValueMap)
        {
        if (charCode == 38) {
          increaseLineWeight();
        }
        // - key
        else if (charCode == 40) {
          decreaseLineWeight();
        }
        }
         else {
         if (charCode > 47 && charCode <= 57 || charCode == 45 || charCode == 109 || charCode == 8 || charCode == 46 || charCode == 190) {
        if (selected != null)
        {
          
          if (selected.getAttribute("id").substring(0,6) == "elipse")
          {
              lineText = selected.nextSibling.nextSibling
          }
          else
          {
              lineText = selected.nextSibling
          }
          if (justSelected)
          {
              initialText = lineText.firstChild.nodeValue;
              modTxt = true;
              if (charCode == 45 || charCode == 109)
              {
              textSelected = "-";
              justSelected = false;
              }
              else {
              if (charCode != 8 && charCode != 46 && charCode != 106 && charCode != 190)
              {
                  textSelected = String.fromCharCode(charCode);
                  justSelected = false;
              }
              }
          }
          else
          {
              if (charCode != 45 && charCode != 109)
              {
              if (charCode == 8)
              {
                  if (textSelected.length >1)
                  {
                  if (textSelected.charAt(textSelected.length-1) == '.')
                      hasPoint = false;
                  textSelected = textSelected.substring(0,textSelected.length-1);
                  }
                  else
                  {
                  textSelected = "";
                  justSelected = true;
                  }
              }
              else {
                  if (charCode != 46 && charCode != 106 && charCode != 190)
                  {
                      if (textSelected == "0")
                      {   
                      textSelected = "";
                      }
                      if (textSelected == "-0")
                      {   
                      textSelected = "-";
                      }
                      textSelected = textSelected + String.fromCharCode(charCode);
                  }
                  else{
                      if (!hasPoint)
                      {
                      if (charCode == 190)
                      {
                          if (textSelected != "-") {
                          hasPoint = true;
                          textSelected = textSelected + ".";
                          }
                      }
                      else {
                          textSelected = textSelected + String.fromCharCode(charCode);
                      }
                      }
                  }
              }
              }
          }
          
          newText = textSelected;
          var auxText = textSelected;
          if (timeDependent)
          {
            temp  = new Array();
            temp = initialText.split(' / ');
            if (temp[1] != null)
            {
            initialText = temp[0];
            timeDependentValue = temp[1];
            }
            auxText = textSelected + " / " + timeDependentValue;
          }
          lineText.firstChild.nodeValue = auxText;  
        }
           
        }
        //+ key
        if (dependencyType)
        {
        if (charCode == 38) {
          increaseLineWeight();
        }
        // - key
        else if (charCode == 40) {
          decreaseLineWeight();
        }
        }
       }
    }
       event.preventDefault();
       event.stopPropagation();
      
     }
}

function parseLineForWeightTraking(type, initial , changed,startAfterStep)
{
    lineType = selected.getAttribute("id").substring(0,2)
    if (discreteValueMap)
    {
    value = discreteValues[changed];
    }
    else
    {
    value = changed;
    }
    if (lineType == "XY")
    {
        x = parseInt(selected.getAttribute("id").charAt(2))
        y = parseInt(selected.getAttribute("id").charAt(3))
        logEvents(type,"source="+namesX[x] + " " + "destination="+namesY[y] + " " + "old="+initial + " " + "new="+changed,"X"+idsX[x],"Y"+idsY[y],""+value,startAfterStep);
    }
    else
    {
    if (lineType == "YY")
    {
        y1 = parseInt(selected.getAttribute("id").charAt(2))
        y2 = parseInt(selected.getAttribute("id").charAt(3))
        logEvents(type,"source="+namesY[y1]+ " "+ "destination="+namesY[y2] + " "  + "old="+initial + " " + "new="+changed,"Y"+idsY[y1],"Y"+idsY[y2],""+value,startAfterStep);
    }
    else { // elipse
        y = parseInt(selected.getAttribute("id").charAt(6))
        logEvents(type,"source="+namesY[y]+ " " + "destination="+namesY[y]+ " "  + "old="+initial + " " + "new="+changed,"Y"+idsY[y],"Y"+idsY[y],""+value,startAfterStep);
    }
    }
}

function deselectLine()
{
    if (!isFreezed)
    {
        justSelected = true;
        hasPoint = false;
    startAfterStep = 0;
    if (timeDependent && selected != null)
    {
        startAfterStep = getTimeDependentValue();
    }
        if(modTxt)
        {
            //alert("Var:" +initialText + " " + newText )
            modTxt = false;
            if (initialText == "" ) initialText = "null"
            parseLineForWeightTraking("weight number", initialText , newText,startAfterStep)
        }
        if(modThikness && (initialWeight != newWeight))
        {
            //alert("Var:" +initialWeight + " " + newWeight )
            modThikness = false;
            parseLineForWeightTraking("weight thikness", weightConst[initialWeight-2] , weightConst[newWeight-2],startAfterStep)
        }
    if(modTime)
    {
        modTime = false;
        parseLineForWeightTraking("dependency delay",initialTime,newTime,startAfterStep)
    }
        if(selected != null)
        {
            if (selected.getAttribute("id").substring(0,6) == "elipse")
            {
                selected.nextSibling.setAttribute("stroke","blue")
            }
            else{
                selected.setAttribute("marker-end", "url(#startMarker)")
            }
            selected.setAttribute("stroke","blue")
            selected = null;
        refreshButtons();
        }
    
    }
}

function backgroundSelected()
{
    deselectLine();
    if (rectX_first != null)
    {
        rectX_first.setAttribute("fill",selectedXColor)
        rectX_first = null;
    }
    if (rectY_first != null)
    {
    rectY_first.setAttribute("fill",selectedY1Color)
    rectY_first = null;
    }
}

function deleteLine(evt)
{
    if (!isFreezed)
    {
        justSelected = true;
        // delete X-Y and Yi-Yj line
    
        if (evt.target.nodeName=="line" || evt.target.nodeName=="polyline" || evt.target.getAttribute("id").length == 5)
        {
            if (selected != null)
            {
                if (selected == evt.target) 
                {
                    type = selected.getAttribute("id").substring(0,2)
        
                    if (type == "XY")
                    {
                        x = parseInt(selected.getAttribute("id").charAt(2))
                        y = parseInt(selected.getAttribute("id").charAt(3))
                        linesXY[x-1][y-1] = 0;
                        logEvents("remove","source="+namesX[x] + " " + "destination="+namesY[y],"X"+idsX[x],"Y"+idsY[y],""+"delete",0);
                    }
                    else
                    {
                        y1 = parseInt(selected.getAttribute("id").charAt(2))
                        y2 = parseInt(selected.getAttribute("id").charAt(3))
                        linesYY[y1-1][y2-1] = 0;
                        logEvents("remove","source="+namesY[y1] + " " + "destination="+namesY[y2],"Y"+idsY[y1],"Y"+idsY[y2],""+"delete",0);
                    }
            if (discreteValueMap && !discreteValueText)
            {
            svgRoot.removeChild(selected.nextSibling.nextSibling)
            }
                    svgRoot.removeChild(selected.nextSibling)
                    svgRoot.removeChild(selected)
                    selected = null;
                    checkModified(--modiffied)
                }
                else 
                {
                    if (selected.getAttribute("id").substring(0,6) == "elipse")
                    {
                        selected.nextSibling.setAttribute("stroke","blue")
                    }
                    selected.setAttribute("stroke","blue")
                    deselectLine();
                    selected = evt.target;                  
                    selected.setAttribute("stroke","red")
            if (selected.getAttribute("style") != "" )
            {
            timeDependent = true;
            initialTime = getTimeDependentValue();
            }
            else
            {
            timeDependent = false;
            }
            if (discreteValueMap)
            {
            initialText =getDiscreteValueId();
            }
                }
            }
            else 
            {   
                selected = evt.target;
                selected.setAttribute("stroke","red")
                selected.setAttribute("marker-end", "url(#selectedStartMarker)")
        if (selected.getAttribute("style") != "" )
        {
            timeDependent = true;
            initialTime = getTimeDependentValue();
        }
        else
        {
            timeDependent = false;
        }
        if (discreteValueMap)
        {
            initialText =getDiscreteValueId();
        }
            }
        }
        else if (evt.target.nodeName=="path") // delete Yi-Yi line
        {
            if (selected != null)
            {
                if (selected == evt.target) 
                {
                    y = parseInt(selected.getAttribute("id").charAt(6))
                    linesYY[y-1][y-1] = 0;
            if (discreteValueMap && !discreteValueText)
            {
            svgRoot.removeChild(selected.nextSibling.nextSibling)
            }
                    svgRoot.removeChild(selected.nextSibling.nextSibling)
                    svgRoot.removeChild(selected.nextSibling)
                    svgRoot.removeChild(selected)
                    selected = null;
                    checkModified(--modiffied)
                    logEvents("remove","source="+namesY[y] + " " + "destination="+namesY[y],"Y"+idsY[y],"Y"+idsY[y],""+"delete",0);
                }
                else 
                {
                    selected.setAttribute("stroke","blue")
                    deselectLine();
                    selected = evt.target;
                    selected.setAttribute("stroke","red")
                    selected.nextSibling.setAttribute("stroke","red")
            if (selected.getAttribute("style") != "" )
            {
            timeDependent = true;
            initialTime = getTimeDependentValue();
            }
            else
            {
            timeDependent = false;
            }
            if (discreteValueMap)
            {
            initialText =getDiscreteValueId();
            }
                }
            }
            else 
            {   
                selected = evt.target;
                selected.setAttribute("stroke","red")
                selected.nextSibling.setAttribute("stroke","red")
        if (selected.getAttribute("style") != "" )
        {
            timeDependent = true;
            initialTime = getTimeDependentValue();
        }
        else
        {
            timeDependent = false;
        }
        if (discreteValueMap)
        {
            initialText =getDiscreteValueId();
        }
            }
        }
        if(selected != null)
        {
            var thikness = parseInt(selected.getAttribute("stroke-width"))
            initialWeight = thikness;
        }
    refreshButtons();
    }
}

function selectXRectangle(id){
    if (!isFreezed)
    {
        deselectLine()
        if (rectY_first != null)
        {
        rectY_first.setAttribute("fill",selectedY1Color)
        rectY_first = null;
    }
        if (rectX_first != null) 
        {
            rectX_first.setAttribute("fill",selectedXColor)
    }
        
        rectSelected = document.getElementById(id)
        selectedXColor = rectSelected.getAttribute("fill");
        if (rectSelected == rectX_first)
        {
            rectSelected.setAttribute("fill",selectedXColor)
            rectX_first = null;
    }
        else
        {
        rectSelected.setAttribute("fill","yellow")
            rectX_first = rectSelected;
        }
        
    }
}

function selectYRectangle(id){
    if (!isFreezed)
    {
        deselectLine();
        if (rectY_first != null) 
        {
            rectSelected = document.getElementById(id)
            selectedY2Color = rectSelected.getAttribute("fill");
            if (rectY_first == rectSelected ) 
            {
                rectY_first.setAttribute("fill",selectedY1Color)
                // draw line to itself
                var nrY = parseInt(rectY_first.getAttribute("id").charAt(id.length-1))
                if (linesYY[nrY-1][nrY-1] == 0 )
                {
                    linesYY[nrY-1][nrY-1] = 1
                    //alert(nrY + "," + nrY);
            if (discreteValueMap)
            {
            if(dependencyType)
            {
                drawLineYID(rectY_first.getAttribute("id"),discreteValues[0],discreteWeightValues[0],0);
            }
            else
            {
                drawLineYID(rectY_first.getAttribute("id"),discreteValues[0],defaultWeight,0);
            }
            linesYYDiscrete[nrY-1][nrY-1]=0;
            }
            else
            {
            drawLineYID(rectY_first.getAttribute("id"),"",defaultWeight,0);
            }
                    rectY_first = null;
                }
                else
                {
            var line1 = document.getElementById("elipse" + nrY);
            var evObj = document.createEvent('MouseEvents');
            evObj.initEvent( 'click', true, true );
    
            if(line1 !=null)
            {
            line1.dispatchEvent(evObj);
            }
                    rectY_first = null;
                }
            }
            else
            {
                var nrY1 = parseInt(rectY_first.getAttribute("id").charAt(id.length-1))
                var nrY2 = parseInt(rectSelected.getAttribute("id").charAt(id.length-1))
                rectY_first.setAttribute("fill",selectedY1Color)
                // draw line from one to another
                if (linesYY[nrY1-1][nrY2-1] == 0 )
                {
                    linesYY[nrY1-1][nrY2-1] = 1;
                    //alert(nrY1 + "," + nrY2);
            if (discreteValueMap)
            {
            if(dependencyType)
            {
                drawYYLinesID(rectY_first.getAttribute("id"),rectSelected.getAttribute("id"),discreteValues[0],discreteWeightValues[0],0);
            }
            else
            {
                drawYYLinesID(rectY_first.getAttribute("id"),rectSelected.getAttribute("id"),discreteValues[0],defaultWeight,0);
            }
            linesYYDiscrete[nrY1-1][nrY2-1]=0;
            }else {
            drawYYLinesID(rectY_first.getAttribute("id"),rectSelected.getAttribute("id"),"",defaultWeight,0)
            }
                    rectY_first = null;
                }
                else
                {
                    rectSelected.setAttribute("fill",selectedY2Color)
            var line1 = document.getElementById("YY"+nrY1+""+nrY2);
            var line2 = document.getElementById("YY"+nrY1+""+nrY2+"A");
            var evObj = document.createEvent('MouseEvents');
            evObj.initEvent( 'click', true, true );
    
            if(line1 !=null)
            {
            line1.dispatchEvent(evObj);
            }
            else if (line2 != null) {
            line2.dispatchEvent(evObj);
            }
                    rectY_first = null;
                }
            }
        }
        else
        {
            rectSelected = document.getElementById(id)
            selectedY1Color = rectSelected.getAttribute("fill");
            rectSelected.setAttribute("fill","yellow")
            rectY_first = rectSelected; 
            if (rectX_first != null)
            {   
                //var nrX = parseInt(rectX_first.getAttribute("id").charAt(id.length-1))
                //var nrY = parseInt(rectSelected.getAttribute("id").charAt(id.length-1))
                
                var localXID = rectX_first.getAttribute("id");
                var localYID = rectY_first.getAttribute("id");

                var nrX = parseInt(localXID.charAt(localXID.length-1))
                var nrY = parseInt(localYID.charAt(localYID.length-1))

                if (linesXY[nrX-1][nrY-1] == 0)
                {
                    linesXY[nrX-1][nrY-1] = 1;
            if (discreteValueMap)
            {
                if(dependencyType)
                {
                    drawXYLinesID (rectX_first.getAttribute("id"),rectSelected.getAttribute("id"),discreteValues[0],discreteWeightValues[0],0);
                }
                else
                {
                    drawXYLinesID (rectX_first.getAttribute("id"),rectSelected.getAttribute("id"),discreteValues[0],defaultWeight,0);
                }
                linesXYDiscrete[nrX-1][nrY-1]=0;
            }
            else {
            drawXYLinesID (rectX_first.getAttribute("id"),rectSelected.getAttribute("id"),"",defaultWeight,0);
            }
                    rectSelected.setAttribute("fill",selectedY1Color)
                    rectX_first.setAttribute("fill",selectedXColor)
                    rectX_first = null;
                    rectY_first = null;
                }
                else
                {           
            var line1 = document.getElementById("XY"+nrX+""+nrY);
            var line2 = document.getElementById("XY"+nrX+""+nrY+"A");
            var evObj = document.createEvent('MouseEvents');
            evObj.initEvent( 'click', true, true );
    
            if(line1 !=null)
            {
            line1.dispatchEvent(evObj);
            }
            else if (line2 != null) {
            line2.dispatchEvent(evObj);
            }
                    rectSelected.setAttribute("fill",selectedY1Color)
                    rectX_first.setAttribute("fill",selectedXColor)
                    rectX_first = null;
                    rectY_first = null;
                }
            }
        }   
    }
}

/**
 * tests if a given point is left or right of a given line
 * @param {Number} pointx       the x position of the given point
 * @param {Number} pointy       the y position of the given point
 * @param {Number} linex1       the x position of line's start point
 * @param {Number} liney1       the y position of line's start point
 * @param {Number} linex2       the x position of line's end point
 * @param {Number} liney2       the y position of line's end point
 * @return leftof               the result of the leftOfTest, 1 means leftOf, 0 means rightOf
 */
function leftOfTest(pointx,pointy,linex1,liney1,linex2,liney2) {
    var result = (liney1 - pointy) * (linex2 - linex1) - (linex1 - pointx) * (liney2 - liney1);
    if (result < 0) {
        var leftof = 1; //case left of
    }
    else {
        var leftof = 0; //case right of 
    }
    return leftof;
}

/**
 * calculates the distance between a given point and a given line
 * @param {Number} pointx       the x position of the given point
 * @param {Number} pointy       the y position of the given point
 * @param {Number} linex1       the x position of line's start point
 * @param {Number} liney1       the y position of line's start point
 * @param {Number} linex2       the x position of line's end point
 * @param {Number} liney2       the y position of line's end point
 * @return distance             the result of the leftOfTest, 1 means leftOf, 0 means rightOf
 */
function distFromLine(xpoint,ypoint,linex1,liney1,linex2,liney2) {
    var dx = linex2 - linex1;
    var dy = liney2 - liney1;
    var distance = (dy * (xpoint - linex1) - dx * (ypoint - liney1)) / Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
    return distance;
}

/**
 * gives the sign of an value
 * @param {Number} number       the number 
 * @return +/- 1                the sign of the given number
 */
function sign(number)
{
    if (number!=0)
    {
        return number/Math.abs(number);
    } else {
        return 1;
    }
}

function checkIfSegmentIntersectsRectangle(pointx,pointy,height,width,linex1,liney1,linex2,liney2)
{
    intersects = false;
    
    if (((sign(pointx-linex1) == sign(pointx-linex2)) && (sign(pointy-liney1) == sign(pointy-liney2))) &&
        ((sign(pointx+width-linex1) == sign(pointx+width-linex2)) && (sign(pointy-liney1) == sign(pointy-liney2))) &&
        ((sign(pointx-linex1) == sign(pointx-linex2)) && (sign(pointy + height-liney1) == sign(pointy+ height-liney2))) &&
        ((sign(pointx+width-linex1) == sign(pointx+width-linex2)) && (sign(pointy+ height-liney1) == sign(pointy+ height-liney2)))  )
    {
        return false;
    }
    side = leftOfTest(pointx,pointy,x1,y1,x2,y2);
    if (leftOfTest(pointx+width,pointy+height,x1,y1,x2,y2) != side || leftOfTest(pointx+width,pointy,x1,y1,x2,y2) != side || 
            leftOfTest(pointx,pointy+height,x1,y1,x2,y2) != side)
    {
        return true;
    }       
    return false;
}


/**
 * calculates if a straight line is possible between two rectangles
 * @param {Number} x1       the x position of line's start point
 * @param {Number} y1       the y position of line's start point
 * @param {Number} x2       the x position of line's end point
 * @param {Number} y2       the y position of line's end point
 * @param {Number} Id1      the id of the first rectangle
 * @param {Number} Id2      the id of the first rectangle
 * @param {boolean} type    true if XY or false if YY
 * @return RectId           the rectangle that is an obstacle if a straight line is not possible
 */
function straightLinePossible(x1,y1,x2,y2,Id1,Id2,type)
{
    for (i=1; i<= NumOfX; i++)
    {
        if ((idsX[i] != Id1 && type) || !type)
        {
            xRect = parseInt(document.getElementById(idsX[i]).getAttribute("x"))
            yRect = parseInt(document.getElementById(idsX[i]).getAttribute("y"))
            heightRect = parseInt(document.getElementById(idsX[i]).getAttribute("height"))
            widthRect = parseInt(document.getElementById(idsX[i]).getAttribute("width"))
            
            if (checkIfSegmentIntersectsRectangle(xRect,yRect,heightRect,widthRect,x1,y1,x2,y2) == true)
            {
                //alert("False X: id= " + i); 
                return "X" + idsX[i];
            }
        }
    }
    for (i=1; i<= NumOfY; i++)
    {
        if ((idsY[i] != Id2 && type) || (!type && idsY[i] != Id1 && idsY[i] != Id2))
        {
            xRect = parseInt(document.getElementById(idsY[i]).getAttribute("x"))
            yRect = parseInt(document.getElementById(idsY[i]).getAttribute("y"))
            heightRect = parseInt(document.getElementById(idsY[i]).getAttribute("height"))
            widthRect = parseInt(document.getElementById(idsY[i]).getAttribute("width"))
            
            if (checkIfSegmentIntersectsRectangle(xRect,yRect,heightRect,widthRect,x1,y1,x2,y2) == true)
            {
                //alert("False Y: id= " + i); 
                return "Y" + idsY[i];
            }
        }
    }
    return "";
}

/**
 * calculates if a straight line is possible between two rectangles
 * @param {Number} x1       the x position of line's start point
 * @param {Number} y1       the y position of line's start point
 * @param {Number} x2       the x position of line's end point
 * @param {Number} y2       the y position of line's end point
 * @param {Number} Id1      the id of the first rectangle
 * @param {Number} Id2      the id of the first rectangle
 * @param {Number} nrX      the id of the first rectangle
 * @param {Number} nrY      the id of the first rectangle
 * @param {boolean} type    true if XY or false if YY
 * @return Line             the Line that is drawn between the two rectangles
 */
function determineLine(x1,x2,y1,y2,Id1,Id2,nrX,nrY,type)
{
    Line = null;
    result = straightLinePossible(x1,y1,x2,y2,Id1,Id2,type)
    if( result !="")
    {
        // calculate avoiding route
        pointAx=0;
        pointAy=0;
        pointBx=0;
        pointBy=0;
        idsearched= result.substring(1,result.length);
        path = "";
        slope = -1;
        modifyX = false;
        if (y2==y1)
        {   
            //alert("00");
            pointAx=parseInt(document.getElementById(idsearched).getAttribute("x")) + parseInt(document.getElementById(idsearched).getAttribute("width"))/2;
            pointAy=parseInt(document.getElementById(idsearched).getAttribute("y"));
            pointBx=parseInt(document.getElementById(idsearched).getAttribute("x")) + parseInt(document.getElementById(idsearched).getAttribute("width"))/2;
            pointBy=parseInt(document.getElementById(idsearched).getAttribute("y")) + parseInt(document.getElementById(idsearched).getAttribute("height"));
        } else if (x1==x2)
        {
            pointAx=parseInt(document.getElementById(idsearched).getAttribute("x"));
            pointAy=parseInt(document.getElementById(idsearched).getAttribute("y")) + parseInt(document.getElementById(idsearched).getAttribute("height"))/2;
            pointBx=parseInt(document.getElementById(idsearched).getAttribute("x")) + parseInt(document.getElementById(idsearched).getAttribute("width"));
            pointBy=parseInt(document.getElementById(idsearched).getAttribute("y")) + parseInt(document.getElementById(idsearched).getAttribute("height"))/2;
            modifyX = true;
        }
        else {
            slope = (y2-y1)/(x2-x1)
            //alert ("line" + x1 + " , " + y1 + " , " + x2 + " , " + y2 );
            if(slope>0){
                pointAx=parseInt(document.getElementById(idsearched).getAttribute("x"))+ parseInt(document.getElementById(idsearched).getAttribute("width"));
                pointAy=parseInt(document.getElementById(idsearched).getAttribute("y"));
                pointBx=parseInt(document.getElementById(idsearched).getAttribute("x"));
                pointBy=parseInt(document.getElementById(idsearched).getAttribute("y"))+ parseInt(document.getElementById(idsearched).getAttribute("height"));
                
            }
            else 
            {
                pointAx=parseInt(document.getElementById(idsearched).getAttribute("x"));
                pointAy=parseInt(document.getElementById(idsearched).getAttribute("y"));
                pointBx=parseInt(document.getElementById(idsearched).getAttribute("x")) + parseInt(document.getElementById(idsearched).getAttribute("width"));
                pointBy=parseInt(document.getElementById(idsearched).getAttribute("y")) + parseInt(document.getElementById(idsearched).getAttribute("height"));
            }
            if (Math.abs(slope)> 2)
            {
                modifyX = true;
            }
        }
        
        d1 = Math.abs(distFromLine(pointAx,pointAy,x1,y1,x2,y2));
        d2 = Math.abs(distFromLine(pointBx,pointBy,x1,y1,x2,y2));
        //alert("d1: " + d1 + " d2: " + d2);
        if (d1<d2)
        {
            if (modifyX)
            {
                //alert("Point Ax : " + pointAx + " , " + pointAy)
                path = "M" + x1 + "," + y1 + " C "+ (pointAx+sign(slope)*30) +"," + pointAy +" " + (pointAx+sign(slope)*30) +"," + pointAy + " " + x2 + "," + y2;
            }
            else {
                //alert("Point A : " + pointAx + " , " + pointAy)
                path = "M" + x1 + "," + y1 + " C "+ pointAx +"," + (pointAy-30) +" " + pointAx +"," + (pointAy-30) + " " + x2 + "," + y2;
            }
        }
        else
        {
            if (modifyX)
            {
                //alert("Point Bx : " + pointAx + " , " + pointAy)
                path = "M" + x1 + "," + y1 + " C "+ (pointBx-sign(slope)*30) +"," + pointBy +" " + (pointBx-sign(slope)*30) +"," + pointBy + " " + x2 + "," + y2;
            }
            else {
                //alert("Point B : " + pointBx + " , " + pointBy)
                path = "M" + x1 + "," + y1 + " C "+ pointBx +"," + (pointBy+30) +" " + pointBx +"," + (pointBy+30) + " " + x2 + "," + y2;
            }
        }

        Line=document.getElementById("avoid").cloneNode("false")
        Line.setAttribute("d", path)
        Line.setAttributeNS(null, "style","")
        if (type)
        {
            Line.setAttribute("id","XY" + nrX + "" + nrY + "A")
        } else
        {
            Line.setAttribute("id","YY" + nrX + "" + nrY + "A")
        }
        
    }
    else{   
        //draw line from X->Y
        Line=document.createElementNS(svgns,"line")
        Line.setAttribute("x1", x1)
        Line.setAttribute("x2", x2)
        Line.setAttribute("y1", y1)
        Line.setAttribute("y2", y2)
        Line.setAttributeNS(null, "style","")
        if (type)
        {
            Line.setAttribute("id","XY" + nrX + "" + nrY)
        } else
        {
            Line.setAttribute("id","YY" + nrX + "" + nrY)
        }
    }
    
    return Line;
}

function increaseLineWeight()
{
    if (selected != null)
    {
    if (discreteValueMap)
    {
        modTxt = true;
        nextId = getDiscreteValueId();
        if (nextId < nrDiscreteValues-1 )
        {
        nextId= nextId + 1;
        }

        setDiscreteLineValue(discreteValues[nextId]);
        newText = nextId;
        if(dependencyType)
        {
        selected.setAttribute("stroke-width",discreteWeightValues[nextId])
        }
        setNewDiscreteValueId(nextId);
    }else
    {
        if(dependencyType)
        {
        modThikness = true;
        var thikness = parseInt(selected.getAttribute("stroke-width"))
        if (thikness< 4)
        {
            selected.setAttribute("stroke-width",thikness + 1)
            newWeight = thikness + 1;
        }
        }
    }
    }
}

function decreaseLineWeight()
{
    if (selected != null)
    {
    if (discreteValueMap)
    {
        modTxt = true;
        nextId = getDiscreteValueId();
        if (nextId > 0 )
        {
        nextId= nextId - 1;
        }
        newText = nextId;
        setDiscreteLineValue(discreteValues[nextId]);
        if(dependencyType)
        {
        selected.setAttribute("stroke-width",discreteWeightValues[nextId])
        }
        setNewDiscreteValueId(nextId);
        
    }else
    {
        if(dependencyType)
        {
        modThikness = true;
        var thikness = parseInt(selected.getAttribute("stroke-width"))
        if (thikness > 2)
        {
            selected.setAttribute("stroke-width",thikness - 1)
            newWeight = thikness - 1;
        }
        }
    }
    }
}

function getDiscreteValueId()
{
    lineType = selected.getAttribute("id").substring(0,2)
    if (lineType == "XY")
    {
        x = parseInt(selected.getAttribute("id").charAt(2))
        y = parseInt(selected.getAttribute("id").charAt(3))
    return linesXYDiscrete[x-1][y-1];
    }else if (lineType == "YY")
    {
        y1 = parseInt(selected.getAttribute("id").charAt(2))
        y2 = parseInt(selected.getAttribute("id").charAt(3))
    return linesYYDiscrete[y1-1][y2-1];
    }
    else { // elipse
        y = parseInt(selected.getAttribute("id").charAt(6))
    return linesYYDiscrete[y-1][y-1];
    }
}

function setNewDiscreteValueId(id)
{
    lineType = selected.getAttribute("id").substring(0,2)
    if (lineType == "XY")
    {
        x = parseInt(selected.getAttribute("id").charAt(2))
        y = parseInt(selected.getAttribute("id").charAt(3))
    linesXYDiscrete[x-1][y-1]=id;
    }else if (lineType == "YY")
    {
        y1 = parseInt(selected.getAttribute("id").charAt(2))
        y2 = parseInt(selected.getAttribute("id").charAt(3))
    linesYYDiscrete[y1-1][y2-1]=id;
    }
    else { // elipse
        y = parseInt(selected.getAttribute("id").charAt(6))
    linesYYDiscrete[y-1][y-1]=id;
    }
}

function setDiscreteLineValue(value)
{
    if (selected.getAttribute("id").substring(0,6) == "elipse")
    {
    lineText = selected.nextSibling.nextSibling;
    }
    else
    {
    lineText = selected.nextSibling;
    }
    
    if (discreteValueText)
    {
    if (timeDependent)
    {
        text = lineText.firstChild.nodeValue;
        temp  = new Array();
        temp = text.split(' / ');
        value = value + " / " + temp[1];
    }
    lineText.firstChild.nodeValue = value;
    }
    else{
    lineText.setAttribute("filter", value)  ;
    }
}

function deleteButtonPressed()
{
    if (selected != null)
    {
    var evObj = document.createEvent('MouseEvents');
    evObj.initEvent( 'click', true, true );
    selected.dispatchEvent(evObj);
    }
}

function downButtonPressed()
{
    decreaseLineWeight();
}

function upButtonPressed()
{
    increaseLineWeight();
}

function deleteButtonMouseOver(evt)
{
    var rect = document.getElementById('delete_rect');
    if(rect == null) return;
    
    if (selected != null)
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
    if(rect == null) return;
    
    if (selected != null)
    {
    rect.setAttributeNS(null, "filter", "url(#delete_active)");
    }
    else {
    rect.setAttributeNS(null, "filter", "url(#delete)");
    }
    tooltip();
}

function dependencyButtonMouseOver(evt)
{
    var rect = document.getElementById('dependency_rect');
    if(rect == null) return;
    
    if (selected != null)
    {
    rect.setAttributeNS(null, "filter", "url(#dependency_mouseover)");
    tooltip(evt, timeDelayButtonHelp);
    }
    else {
    rect.setAttributeNS(null, "filter", "url(#dependency)");
    }
}

function dependencyButtonState()
{
    var rect = document.getElementById('dependency_rect');
    if(rect == null) return;
    
    if (selected != null)
    {
    rect.setAttributeNS(null, "filter", "url(#dependency_active)");
    }
    else {
    rect.setAttributeNS(null, "filter", "url(#dependency)");
    }
    tooltip();
}

function upButtonMouseOver(evt)
{
    var rect = document.getElementById('up_rect');
    if(rect == null) return;
    
    if (selected != null)
    {
    rect.setAttributeNS(null, "filter", "url(#up_mouseover)");
    tooltip(evt, weightUpButtonHelp);
    }
    else {
    rect.setAttributeNS(null, "filter", "url(#up)");
    }
}

function upButtonState()
{
    var rect = document.getElementById('up_rect');
    if(rect == null) return;
    
    if (selected != null)
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
    if(rect == null) return;
    
    if (selected != null)
    {
    rect.setAttributeNS(null, "filter", "url(#down_mouseover)");
    tooltip(evt, weightDownButtonHelp);
    }
    else {
    rect.setAttributeNS(null, "filter", "url(#down)");
    }
}

function downButtonState()
{
    var rect = document.getElementById('down_rect');
    if(rect == null) return;
    
    if (selected != null)
    {
    rect.setAttributeNS(null, "filter", "url(#down_active)");
    }
    else {
    rect.setAttributeNS(null, "filter", "url(#down)");
    }
    tooltip();
}

function timeDepUpButtonMouseOver(evt)
{
    var rect = document.getElementById('timeDep_up_rect');
    if(rect == null) return;
    
    if (selected != null && timeDependent)
    {
    rect.setAttributeNS(null, "filter", "url(#timeDep_up_mouseover)");
    tooltip(evt, timeDelayUpButtonHelp);
    }
    else {
    rect.setAttributeNS(null, "filter", "url(#timeDep_up)");
    }
}

function timeDepUpButtonState()
{
    var rect = document.getElementById('timeDep_up_rect');
    if(rect == null) return;
    
    if (selected != null && timeDependent)
    {
    rect.setAttributeNS(null, "filter", "url(#timeDep_up_active)");
    }
    else {
    rect.setAttributeNS(null, "filter", "url(#timeDep_up)");
    }
    tooltip();
}

function timeDepDownButtonMouseOver(evt)
{
    var rect = document.getElementById('timeDep_down_rect');
    if(rect == null) return;
    
    if (selected != null && timeDependent)
    {
    rect.setAttributeNS(null, "filter", "url(#timeDep_down_mouseover)");
    tooltip(evt, timeDelayDownButtonHelp);
    }
    else {
    rect.setAttributeNS(null, "filter", "url(#timeDep_down)");
    }
}

function timeDepDownButtonState()
{
    var rect = document.getElementById('timeDep_down_rect');
    if(rect == null) return;
 
    if (selected != null && timeDependent)
    {
    rect.setAttributeNS(null, "filter", "url(#timeDep_down_active)");
    }
    else {
    rect.setAttributeNS(null, "filter", "url(#timeDep_down)");
    }
    tooltip();
}

function refreshButtons()
{
   deleteButtonState();
   dependencyButtonState();
   upButtonState();
   downButtonState();
   timeDepDownButtonState();
   timeDepUpButtonState();
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

function dependencyButtonPressed()
{
    if (selected != null)
    {
    if (!timeDependent)
    {
        selected.setAttributeNS(null, "style","stroke-dasharray: 6, 3;");
        timeDependent = true;
        modTime = true;
        initialTime = null;
        newTime = 1;
    } else
    {
         selected.setAttributeNS(null, "style","");
         timeDependent = false;
         modTime = true;
         newTime = null;
    }
    
    if ((discreteValueText && discreteValueMap) || !discreteValueMap)
    {
        timeDependentWithText();
    }
    else
    {
        timeDependentWithIcon();
    }
    timeDepDownButtonState();
    timeDepUpButtonState()
    }
}

function timeDependentWithText()
{
    if (timeDependent)
    {
    if (selected.getAttribute("id").substring(0,6) == "elipse")
    {
        lineText = selected.nextSibling.nextSibling
    }
    else
    {
        lineText = selected.nextSibling
    }
    text = lineText.firstChild.nodeValue;
    if (text == "" )
    {
        text = "0"
    }
    
    lineText.firstChild.nodeValue = text +" / 1";
    
    }
    else
    {
    if (selected.getAttribute("id").substring(0,6) == "elipse")
    {
        lineText = selected.nextSibling.nextSibling
    }
    else
    {
        lineText = selected.nextSibling
    }
    
    text = lineText.firstChild.nodeValue;
    temp  = new Array();
    temp = text.split(' / ');
    lineText.firstChild.nodeValue = temp[0];
    }
}

function timeDependentWithIcon()
{
    if (timeDependent)
    {
    if (selected.getAttribute("id").substring(0,6) == "elipse")
    {
        lineText = selected.nextSibling.nextSibling.nextSibling
    }
    else
    {
        lineText = selected.nextSibling.nextSibling
    }
    
    lineText.firstChild.nodeValue = "/ 1";
    
    }
    else
    {
    if (selected.getAttribute("id").substring(0,6) == "elipse")
    {
        lineText = selected.nextSibling.nextSibling.nextSibling
    }
    else
    {
        lineText = selected.nextSibling.nextSibling
    }

    lineText.firstChild.nodeValue = "";
    }
}

function timeDepUpButtonPressed()
{
    if (selected != null && timeDependent)
    {
    chanceDelayValue(1);
    }
}

function timeDepDownButtonPressed()
{
    if (selected != null && timeDependent)
    {
    chanceDelayValue(-1);
    }
}

function chanceDelayValue(sign)
{
    modTime = true;
    if ((discreteValueText && discreteValueMap) || !discreteValueMap)
    {
        if (selected.getAttribute("id").substring(0,6) == "elipse")
        {
            lineText = selected.nextSibling.nextSibling
        }
        else
        {
            lineText = selected.nextSibling
        }
    
        text = lineText.firstChild.nodeValue;
    temp  = new Array();
        temp = text.split(' / ');
    timeDependentValue = parseInt(temp[1]) + sign;
    if (timeDependentValue ==  0)
    {
        timeDependentValue = 1;
    }
    newTime = timeDependentValue;
    lineText.firstChild.nodeValue = temp[0] + ' / ' + timeDependentValue;
    }
    else
    {
    if (selected.getAttribute("id").substring(0,6) == "elipse")
        {
            lineText = selected.nextSibling.nextSibling.nextSibling
        }
        else
        {
        lineText = selected.nextSibling.nextSibling
        }
    
    
        text = lineText.firstChild.nodeValue;
    temp  = text.substring(1, text.length)
    timeDependentValue = parseInt(temp) + sign;
    if (timeDependentValue ==  0)
    {
        timeDependentValue = 1;
    }
    newTime = timeDependentValue;
    lineText.firstChild.nodeValue = '/ ' + timeDependentValue;
    }
}

function getTimeDependentValue()
{
    if ((discreteValueText && discreteValueMap) || !discreteValueMap)
    {
        if (selected.getAttribute("id").substring(0,6) == "elipse")
        {
            lineText = selected.nextSibling.nextSibling
        }
        else
        {
            lineText = selected.nextSibling
        }
    
        text = lineText.firstChild.nodeValue;
    temp  = new Array();
        temp = text.split(' / ');
    return parseInt(temp[1]);
    }
    else
    {
    if (selected.getAttribute("id").substring(0,6) == "elipse")
        {
            lineText = selected.nextSibling.nextSibling.nextSibling
        }
        else
        {
        lineText = selected.nextSibling.nextSibling
        }
    
    
        text = lineText.firstChild.nodeValue;
    temp  = text.substring(1, text.length)
    return parseInt(temp);
    }
}

function grab(evt){
    // alert(4);
    if (!selected) return
    var O=evt.target
    if (evt.target.getAttribute("id") =="background") return
    if (evt.target.getAttribute("id").indexOf('X') < 0 || evt.target.getAttribute("id").indexOf('Y') < 0)
    {
        if(evt.target.getAttribute("id").indexOf('elipse') < 0)
        {
        return
        }
    }
    if (evt.target.getAttribute("id").indexOf('text') > 0 ) return

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
    if(t!=null)
    {
        t.setAttributeNS(null, "x", evt.clientX+22)
        t.setAttributeNS(null, "y", evt.clientY+15)
    }
    var i=document.getElementById(id+"_icon")
    if(i!=null)
    {
        i.setAttributeNS(null, "x", evt.clientX)
        i.setAttributeNS(null, "y", evt.clientY)
    }
}

function standardize(R){
    // alert(1);
    var Attr={
        "onmousedown":"grab(evt)",
        "onmousemove":null
    }
    assignAttr(R,Attr)
}

function assignAttr(O,A){
    // alert(6);
    for (i in A) O.setAttributeNS(null,i, A[i])
}


 
