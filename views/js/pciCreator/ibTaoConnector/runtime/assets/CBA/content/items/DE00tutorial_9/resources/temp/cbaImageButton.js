
var svgDocument=null;
var O=null;
var txt = null;
var svgns = 'http://www.w3.org/2000/svg';
var xlinkns = 'http://www.w3.org/1999/xlink';
var xmlns="http://www.w3.org/2000/svg";





function changeImageMouseDown(evt)
{
	var rect = evt.target;
            
    rect.setAttributeNS(null, "filter", "url(#pressed)");
}

function changeImageMouseUp(evt)
{
	var rect = evt.target;
            
    rect.setAttributeNS(null, "filter", "url(#activated)");
}

function changeImageMouseOver(evt)
{
	var rect = evt.target;
            
    rect.setAttributeNS(null, "filter", "url(#mouseOver)");
}

function changeImageMouseOut(evt)
{
	var rect = evt.target;
            
    rect.setAttributeNS(null, "filter", "url(#activated)");
}



 
