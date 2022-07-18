

var CHART_LINE    =  1;
var CHART_AREA    =  2;
var CHART_BAR     =  3;
var CHART_STACKED =  4;

var round = 0;
var charType;
var undoList = [];
var resetList = [];
var barValues = [];
var horizontalLabels = [];
var localBarValues = [];
var localHorizontalLabels = [];

var chart;
var microDynHistoryChartId;
var chartType;
var textColor; 
var textFont; 
var textSize; 
var backgroundColor ;
var lineColor ;
var gridColor;
var undoColor;
var countRound = 0;
var isControlPhase;

var roundLabel;
var yMinValue;
var yMaxValue;
var localYMinValue;
var localYMaxValue;
var exploreSteps;
var controlSteps;

var startValue;
var targetValue;
var targetLimit;

var hasYAxisLabel;
var noXAxisLabel;
var verticalAxisCoverage ;
var horizontalAxisLength ;

var start = 1;

var dynamicHorizontalAxis = false;
var labelWidth;
var maxNbXLabels;
var skipValue;
var yAxisOrigin ;
var targetBand;
var showTarget;

function showContextMenu( showContextMenu )
{
    if (! showContextMenu) document.oncontextmenu = new Function( 'return false' );
}

function initSVG(painterType) {

   microDynHistoryChartId = document.getElementsByTagName("cbaMicrodynHistoryChartId").item(0).getAttributeNS(null, "id");

    chart = new Chart(document.getElementById('chart'));
    if (painterType == 'svg') { chart.setPainterFactory(SVGChartPainterFactory); }
    
    chartType = eval(getRealParentForTextField()+ "." + microDynHistoryChartId + ".getChartStyle();");
    
    textColor = eval(getRealParentForTextField()+ "." + microDynHistoryChartId + ".getTextColor();");
    textFont = eval(getRealParentForTextField()+ "." + microDynHistoryChartId + ".getTextFont();");
    textSize = parseInt(eval(getRealParentForTextField()+ "." + microDynHistoryChartId + ".getTextSize();"));
    backgroundColor = eval(getRealParentForTextField()+ "." + microDynHistoryChartId + ".getBackgroundColor();");
    lineColor = eval(getRealParentForTextField()+ "." + microDynHistoryChartId + ".getLineColor();");
    gridColor = eval(getRealParentForTextField()+ "." + microDynHistoryChartId + ".getGridColor();");
    undoColor = eval(getRealParentForTextField()+ "." + microDynHistoryChartId + ".getUndoColor();");

    hasYAxisLabel = eval(getRealParentForTextField()+ "." + microDynHistoryChartId + ".getHasYAxisLabel();");
    noXAxisLabel = eval(getRealParentForTextField()+ "." + microDynHistoryChartId + ".getNoXAxisLabel();");
    verticalAxisCoverage = eval(getRealParentForTextField()+ "." + microDynHistoryChartId + ".getVerticalAxisCoverage();");
    horizontalAxisLength = parseInt(eval(getRealParentForTextField()+ "." + microDynHistoryChartId + ".getHorizontalAxisLength();"));

    yMinValue = parseInt(eval(getRealParentForTextField()+ "." + microDynHistoryChartId + ".getYMinValue();"));
    yMaxValue = parseInt(eval(getRealParentForTextField()+ "." + microDynHistoryChartId + ".getYMaxValue();"));
    exploreSteps = parseInt(eval(getRealParentForTextField()+ "." + microDynHistoryChartId + ".getExploreSteps();"));
    controlSteps = parseInt(eval(getRealParentForTextField()+ "." + microDynHistoryChartId + ".getControlSteps();"));

    isControlPhase = eval(getRealParentForTextField()+ "." + microDynHistoryChartId + ".getIsControlPhase();");
    
    startValue = eval(getRealParentForTextField()+ "." + microDynHistoryChartId + ".getStartValue();");
    targetValue = parseInt(eval(getRealParentForTextField()+ "." + microDynHistoryChartId + ".getTargetValue();"));
    targetLimit = parseInt(eval(getRealParentForTextField()+ "." + microDynHistoryChartId + ".getTargetLimit();"));
    targetBand = eval(getRealParentForTextField()+ "." + microDynHistoryChartId + ".getTargetBand();");
    showTarget = eval(getRealParentForTextField()+ "." + microDynHistoryChartId + ".getShowTarget();");

    widgetWidth = document.getElementById("chart").getAttribute("width");
//    widgetWidth = widgetWidth - 2*20;
    
    var barWidth = 0;
    
    labelWidth = 2*textSize*96/72;
    maxNbXLabels = Math.floor(widgetWidth * 0.9/labelWidth);

    if(horizontalAxisLength <=0 ){
        dynamicHorizontalAxis = true;
        if(!isControlPhase){
            //count 1 to number of steps, because at load there is drawn first start value
            horizontalAxisLength = exploreSteps+1;
            barWidth =  Math.floor(widgetWidth/horizontalAxisLength);
            if(barWidth ==0 ){
                barWidth = 1;
            }
        }else{
            //count 1 to number of steps, because at load there is drawn first start value
            horizontalAxisLength = controlSteps+1;
            barWidth =  Math.floor(widgetWidth/horizontalAxisLength);
            if(barWidth ==0 ){
                barWidth = 1;
            }

        }
    }else{
        barWidth = 5;
    }

    chart.setGridDensity(1, 2);
    
    chart.setBarWidth(barWidth);

    if(chartType != 'CHART_LINE'){
        if(yMinValue > 0){
            yAxisOrigin  = yMinValue;
            yMinValue = 0;
        }
        if(yMaxValue < 0){
            yAxisOrigin  = yMaxValue;
            yMaxValue = 0;
        }
        
    }


    chart.setVerticalRange(yMinValue, yMaxValue);

    if (String(hasYAxisLabel) == "true"){
        hasYAxisLabel = true;
    }else{
        hasYAxisLabel = false;
    }

    horizontalLabels.push('0');
    barValues.push(startValue);
    
    localHorizontalLabels.push('0');
    localBarValues.push(startValue);
    
    chart.setHorizontalLabels(horizontalLabels);

    var fixedHorizontalValues = [];

    if(horizontalAxisLength != 0){
        for(i = 0; i< horizontalAxisLength; i++){
            fixedHorizontalValues.push('0');
        }
    }

    chart.add('False Positives', '#4040FF', fixedHorizontalValues);
    chart.add('System Load',     lineColor, barValues, convertChartType(chartType));

    chart.draw(textColor,backgroundColor, lineColor, gridColor, undoColor, hasYAxisLabel, undoList, yMinValue, yMaxValue, horizontalLabels.length);
    
    addRound();
    
    undoRound();
    
    resetRound();

}

function addRound(){
     var microDynHistoryChartId = document.getElementsByTagName("cbaMicrodynHistoryChartId").item(0).getAttributeNS(null, "id");
     
    try
    {
        var cmd = getRealParentForTextField() + ".newRound_" + microDynHistoryChartId + " = function search(string) { demo(string, 'ADD');  }";
        eval(cmd);

    }
    catch(exception)
    {
    }
}

function demo(string, flag) {

    countRound++;
    
    var min, max;

    var index = string.indexOf(',');
    
    var round = parseInt(string.substring(0,index));
    
    var introduceValue = parseInt(string.substring(index+1,string.length));

    if(flag == 'UNDO'){
        var lastElement = localHorizontalLabels[localHorizontalLabels.length-1];
        
        undoList.push(horizontalLabels.length);

        var labelIndex = localHorizontalLabels.indexOf(lastElement-1);
        if(labelIndex == -1){
            labelIndex = 0;
        }
        var barValue = localBarValues[labelIndex];

        barValues.push(barValue);
        localBarValues.push(barValue);
        
        horizontalLabels.push(lastElement-1);
        localHorizontalLabels.push(lastElement-1);
    }

    if(flag == 'ADD'){
    
        barValues.push(introduceValue);
            
        localBarValues.push(introduceValue);


        if(horizontalLabels.length != 0){
            var max = parseInt(Math.max.apply(null, horizontalLabels));
            horizontalLabels.push(max+1);
            
            localHorizontalLabels.push(max+1);
            
        }else{
            horizontalLabels.push(countRound);
            
            localHorizontalLabels.push(countRound);
        }
    }

    if (flag == 'RESET'){

        barValues.push(introduceValue);
        
        localBarValues.push(introduceValue);

        undoList.push(horizontalLabels.length);
        
        horizontalLabels.push('0');
        
        localHorizontalLabels.push('0');
        
    }
    
    var sendYMinValue, sendYMaxValue;
    
    if(verticalAxisCoverage == 1.0){
        chart.setVerticalRange(yMinValue, yMaxValue);
        sendYMinValue = yMinValue;
        sendYMaxValue = yMaxValue;
    }
    else{
        //changeRange(barValues, introduceValue);
        sendYMinValue = parseInt(Math.min.apply(null, barValues));
        sendYMaxValue = parseInt(Math.max.apply(null, barValues));
        chart.setVerticalRange(sendYMinValue, sendYMaxValue);
    }
    
    //check how many bars/labels can be added
    var localLabelNumber;
    localLabelNumber = widgetWidth /15;  //bar width+5
    
    if(horizontalAxisLength <= 0){
        horizontalAxisLength = localLabelNumber;
    }

    if(horizontalAxisLength != 0){
        if(horizontalLabels.length > horizontalAxisLength){
            horizontalLabels.splice(0, 1);
            barValues.splice(0, 1);

            for(i=0;i<undoList.length;i++){
                var a = undoList[i];
                undoList[i] =  a-1;
            }
            
            for(i=0;i<resetList.length;i++){
                var a = resetList[i];
                resetList[i] =  a-1;
            }
        }
    }
    
    chart.setGridDensity(0, round);

    chart.setHorizontalLabels(horizontalLabels);
    
    var fixedHorizontalValues = [];

    if(horizontalAxisLength != 0){
        for(i = 0; i< horizontalAxisLength; i++){
            fixedHorizontalValues.push('0');
        }
    }

    chart.add('False Positives', '#4040FF', fixedHorizontalValues);
    chart.add('Spam',            '#4040FF', fixedHorizontalValues);
    chart.add('System Load',     lineColor, barValues, convertChartType(chartType));

    chart.draw(textColor,backgroundColor, lineColor, gridColor, undoColor, hasYAxisLabel, undoList, sendYMinValue, sendYMaxValue, horizontalLabels.length);
   
}

function changeRange(barValues, introduceValue){
 
        min = parseInt(Math.min.apply(null, barValues));
        max = parseInt(Math.max.apply(null, barValues));
        
        if(introduceValue < min){
            min = min;
        }
        if(introduceValue > max){
            max = introduceValue;
        }
        
        var newYValue = (max - min) / (yMinValue + yMaxValue) ;

        if(newYValue < verticalAxisCoverage){
            localYMinValue = min - min/2;
            
            if((max + max/2) != 0){
                localYMaxValue = max + max/2;
            }else{
                localYMaxValue = yMaxValue;
            }
    }
    if(localYMaxValue > yMaxValue){
        localYMaxValue = yMaxValue;
    }

}

function convertChartType(type){
var nrType;

    if(type == 'CHART_LINE'){
        nrType = 1;
    }
    if(type == 'CHART_AREA'){
        nrType = 2;
    }
    if(type == 'CHART_BAR'){
        nrType = 3;
    }
    return nrType;
}

function check(type)
{
   charType = document.getElementById("answer").value=type
}

function undoRound(){
     var microDynHistoryChartId = document.getElementsByTagName("cbaMicrodynHistoryChartId").item(0).getAttributeNS(null, "id");
     
    try
    {
        var cmd = getRealParentForTextField() + ".undoRound_" + microDynHistoryChartId + " = function search(string) { demo(string, 'UNDO');  }";
        eval(cmd);
    }
    catch(exception)
    {
    }
}

function resetRound(){
     var microDynHistoryChartId = document.getElementsByTagName("cbaMicrodynHistoryChartId").item(0).getAttributeNS(null, "id");
     
    try
    {
        var cmd = getRealParentForTextField() + ".resetRound_" + microDynHistoryChartId + " = function search(string) { demo(string, 'RESET');  }";
        eval(cmd);

    }
    catch(exception)
    {
    }
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

function SVGChartPainterFactory() {
    return new SVGChartPainter();
}


function SVGChartPainter() {
    this.base = AbstractChartPainter;
};


SVGChartPainter.prototype = new AbstractChartPainter;


SVGChartPainter.prototype.create = function(el) {
    this.svg = el;
    this.labelOffset = 20;
    this.x = this.labelOffset;
    this.y = this.labelOffset;
    this.w = this.svg.getAttribute('width') - 2*this.labelOffset;
    this.h = this.svg.getAttribute('height') - 2*this.labelOffset;
};

    
SVGChartPainter.prototype.init = function(xlen, ymin, ymax, xgd, ygd, bLegendLabels, colorText) {
    this.calc(this.w, this.h, xlen, ymin, ymax, xgd, ygd, colorText);
};


SVGChartPainter.prototype.drawBackground = function(backgroundColor) {
    while (this.svg.firstChild) { this.svg.removeChild(this.svg.lastChild); }
    this._drawRect(backgroundColor, this.x, this.y, this.w, this.h);    
};


SVGChartPainter.prototype.drawChart = function(gridColor) {
    if (this.ygrid || this.xgrid) {
        //vertical lines
        this._drawRect(gridColor, this.x , this.y, 1, this.h-1);
        this._drawRect(gridColor, this.x+this.w , this.y, 1, this.h-1);
        
        if(isControlPhase == 'true'){
            if( (this.ymax != targetValue &&  this.ymax != targetLimit) || showTarget == 'false' ){
                //ymax line
                this._drawRect(gridColor, this.x, this.y , this.w, 1);
            }
            
            if( (this.ymin != targetValue && this.ymin != targetLimit) || showTarget == 'false'){
                //ymin line
                this._drawRect(gridColor, this.x, this.y+this.h, this.w, 1);
            }
        }else{
            //ymax line
            this._drawRect(gridColor, this.x, this.y , this.w, 1);
            //ymin line
            this._drawRect(gridColor, this.x, this.y+this.h, this.w, 1);
        }
        
    }
};

SVGChartPainter.prototype.drawArea = function(lineColor, values) {
    var i, len, x, y, n, yoffset, path, o;

    /* Determine distance between points and offset */
    n = this.range/this.h;
    yoffset = (this.ymin / n);

    len = values.length;
    if (len) {

        /* Begin line in lower left corner */
        x = this.x;
        //path = 'M' + x + ',' + (this.y + this.h - 1);
        if(yoffset < 0){
        var a = this.y + this.h + yoffset;
            path = 'M' + x + ',' + a;
        }else{
            path = 'M' + x + ',' + (this.y + this.h );
        }

        /* Determine position of first point and append line to command */
        y = this.y + this.h - (values[0] / n) + yoffset;
        path += ' L' + x + ',' + y;

        /* Append commands for succeeding points */
        
        for (i = 0; i < len; i++) {

            y = this.y + this.h - (values[i] / n) + yoffset;

        if(values[i]>=0){
            //check distance between valkue 0 and value 1
            //this distance is added/extracted n times to y (calculated with normal chart value)
            val0 = 0;
            y0 = this.y + this.h - (val0 / n) + yoffset;
            val1 = 1;
            y1 = this.y + this.h - (val1 / n) + yoffset;
            
            yDifference = y0 - y1;
            
            diff = y0 - y;
            
            if(diff < 2){
                if(yDifference > 2){
                    y = y - 2;
                }else{
                    while(yDifference <= 2){
                        yDifference=yDifference+yDifference;
                    }
                    y = y0 - yDifference;
                
                    //range [-100, 0] , value 0 must be represented under 0 bar, not upper
                    if(this.ymin < 0 && this.ymax == 0){
                        y = y0 + yDifference;
                    }
                }
            }
        }else{
            val0 = 0;
            y0 = this.y + this.h - (val0 / n) + yoffset;
            val1 = -1;
            y1 = this.y + this.h - (val1 / n) + yoffset;

            yDifference = y1 - y0;
            
            diff= y - y0;

            if(diff < 2){
                if(yDifference > 2){
                    y = y + 2;
                }else{
                    while(yDifference <= 2){
                        yDifference=yDifference+yDifference;
                    }
                
                    y = y0 + yDifference;
                }
            }
        }

            x += this.xstep;

           
            path += ' L' + x + ',' + y;
            //path += ' L' + x + ',' + this.y + this.h - (y-yoffset);
        }

        /* Close path and fill it */
        //path += ' L' + x + ',' + (this.y + this.h - 1) + ' Z';
        var a = this.y + this.h + yoffset;
        path += ' L' + x + ',' + a + ' Z';
        o = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        o.setAttribute('stroke', lineColor);
        o.setAttribute('fill', lineColor);
        o.setAttribute('d', path);
        this.svg.appendChild(o);
}   };


SVGChartPainter.prototype.drawLine = function(lineColor, values, undoColor) {
    var i, len, x, y, n, yoffset, path, o;

    /* Determine distance between points and offset */
    n = this.range/this.h;
    yoffset = (this.ymin / n);

    len = values.length;
    if (len) {
        /* Determine position of first point and start path */
        x = 1 + this.x;
        y = this.y + this.h - (values[0] / n) + yoffset;

        path = 'M' + x + ',' + y;
        this._drawPoint(lineColor, x, y, 2);

        /* Append line to commands for succeeding points */
        for (i = 1; i < len; i++) {
            y = this.y + this.h - (values[i] / n) + yoffset;

            x += this.xstep;
 
            path += ' L' + x + ',' + y;
            
            if(undoList.length != 0 ){
                for(j = 0; j < undoList.length; j++){
                    if(i == undoList[j]){
                        this._drawPoint(undoColor, x, y, 2);
                        break;
                    }else{
                        this._drawPoint(lineColor, x, y, 2);
                    }
                }
            }else{
                this._drawPoint(lineColor, x, y, 2);
            }
            
        }
        
        /* Draw path */
        o = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        o.setAttribute('stroke', lineColor);
        o.setAttribute('fill', 'none');
        o.setAttribute('stroke-width', '1px');
        o.setAttribute('d', path);
        this.svg.appendChild(o);
}   };


SVGChartPainter.prototype.drawBars = function(lineColor, values, xoffset, width, undoColor, undoList) {
var i, len, x, y, n, yoffset;

    /* Determine distance between points and offset */
    n = this.range/this.h;
    yoffset = (this.ymin / n);
      // DHE 2009-11-28 shouldn't we always start at 0 ... because we draw all bars?
    // xoffset += this.x;
    xoffset = this.x;

    len = values.length;
    if (len) {
        /* Determine position of each bar and draw it */
        x = xoffset + 1;
        for (i = 0; i < horizontalLabels.length; i++) {
            var barHeight;
            var underZero;

            y = this.y + this.h - (values[i] / n) + yoffset;
            
             if(values[i] >= 0 ){
                     // range without 0
                    if(this.ymin > 0 && 0 < this.ymax){
                        if(values[i] == this.ymin){
                            values[i] = this.ymin + 1;
                            y = this.y + this.h - (values[i] / n) + yoffset;
                            values[i] = this.ymin;
                            
                            barHeight = this.y + this.h - y;
                        }
                        else{
                            
                            barHeight = this.y + this.h - y;
                        }
                    }else{

                        barHeight = this.y + this.h - (y-yoffset);
                        
                        if(barHeight < 2){
                            valMin = 0;
                            tempYMin = this.y + this.h - (valMin / n) + yoffset;
                        
                            val = 1;
                            tempY = this.y + this.h - (val / n) + yoffset;
                            tempBarHeight = this.y + this.h - (tempY-yoffset);
                            
                            yDifference = tempYMin - tempY;
                            
                            if(yDifference > 2){
                                barHeight = 2;
                                y = y - 2; 
                            }else{
                                while(barHeight <=2){
                                    barHeight = barHeight + tempBarHeight;
                                    y = y - yDifference; 
                                }
                            }
                        }

                        if(this.ymin < 0){
                            underZero = this.y + this.h + yoffset;
                        }
                          //alert("barHeight "+barHeight+" values "+values[i]);                      
                    }   

            }else{  
                
                underZero = this.y + this.h + yoffset;
                barHeight = (this.y + this.h - underZero) - (this.y + this.h - y);
                
                if(barHeight < 2){
                    valMin = 0;
                    temp = this.y + this.h - (valMin / n) + yoffset;
                    barHeight0 = (this.y + this.h - underZero) - (this.y + this.h -temp);
                    val = -1;
                    temp1 = this.y + this.h - (val / n) + yoffset;
                    barHeight1= (this.y + this.h - underZero) - (this.y + this.h - temp1);

                    barDifference = temp1 - temp;
                    
                    if(barDifference > 2){
                        barHeight = 2;
                        y = y - 2; 
                    }else{
                        while(barHeight <=2){
                            barHeight = barHeight + barDifference;
                        }     
                    }                   
                }   
          
            }
            
            if(undoList.length != 0 ){
                for(j = 0; j < undoList.length; j++){
                    if(i == undoList[j]){
                        if(values[i] >= 0){
                            if(values[i] == 0){
                                this._drawRect(undoColor, x, y , width, barHeight);
                                break;
                            }else{
                                this._drawRect(undoColor, x, y , width, barHeight);
                                break;
                            }
                        }else{
                            this._drawRect(undoColor, x, underZero, width, barHeight);
                            break;
                        }
                    }else{
                        if(values[i] >= 0){
                            if(values[i] == 0){
                                this._drawRect(lineColor, x, y , width, barHeight);    
                            }else{
                                this._drawRect(lineColor, x, y, width, barHeight);     
                            }
                        }else{
                            this._drawRect(lineColor, x, underZero, width, barHeight);       
                        }
                    }
                }

             }else{
                if(horizontalLabels.length != 1){
                    if(i == horizontalLabels.length -1){
                        x = x;
                    }
                }
                
                if(values[i] >= 0){
                    if(this.ymin <0 && this.ymax == 0){
                        this._drawRect(lineColor, x, underZero, width, barHeight);   
                    }else{
                        this._drawRect(lineColor, x, y, width, barHeight);       
                    }
                }else{
                    this._drawRect(lineColor, x, underZero, width, barHeight);       
                }
            }

            //x += this.xstep;
            if(x < (this.w+15)){
                x += this.xstep;
            }
        }   
    } 
    // DHE 2009-11-28 The following line gives an error "rect is undefined"
    // parent.removeChild(rect);
};

SVGChartPainter.prototype._drawRect = function(color, x, y, w, h) {
    var rect;

    rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('stroke', 'none');
    rect.setAttribute('fill', color);
    rect.setAttribute('x', x + 'px');
    rect.setAttribute('y', y + 'px');
    rect.setAttribute('width', w + 'px');
    rect.setAttribute('height', h + 'px');

    this.svg.appendChild(rect);
};

SVGChartPainter.prototype._drawPoint = function(color, x, y, r) {
    var point;

    point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    point.setAttribute('fill', color);
    point.setAttribute('cx', x + 'px');
    point.setAttribute('cy', y + 'px');
    point.setAttribute('r', r + 'px');

    this.svg.appendChild(point);
};

SVGChartPainter.prototype._drawText = function(color, x, y, label, vertical) {
    var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('fill',color);
    text.setAttribute('font-size', textSize);
    text.setAttribute('style','font-family:'+textFont+';');
    text.setAttribute('y', y );
    
    if(vertical){
        text.setAttribute('text-anchor','middle');
        text.setAttribute('x', x+10);
    }else{
        text.setAttribute('x', x);
    }
    
    var textNode = document.createTextNode(label);
        text.appendChild(textNode);
    this.svg.appendChild(text);
        
    return text;
};


SVGChartPainter.prototype.drawHorizontalAxis = function(xlen, labels, xgd, precision, textColor, undoColor, horizontalLabelsLength) {
   var axis, item, step, x, tx, n, multiplier;
    /* Calculate offset, step size and rounding precision */
    multiplier = Math.pow(10, precision);
    n          = this.w / (horizontalAxisLength);

    //if(dynamicHorizontalAxis){
        skipValue = Math.round(horizontalAxisLength/maxNbXLabels);
        
    //}else{
    //  skipValue = 1;
    //}
   /* Draw labels and points */
   if(noXAxisLabel == 'false'){
    for (i = 0; i < horizontalLabelsLength; i+=skipValue) {
        x = this.x + (n * i);
        dx = x ;
        dy = this.y + this.h + 20;
        
        var undoValue= false;
    
        if(undoList.length != 0){
            for(j = 0; j < undoList.length; j++){
                if(i == undoList[j]){
                   if(i != horizontalLabelsLength ){
                        undoValue=true;
                    }
                }
            }
            if(undoValue){
                this._drawText(undoColor, dx, dy, labels[i], false);
            }else{
                this._drawText(textColor, dx, dy, labels[i], false);
            }
         }else{
              if(i != horizontalLabelsLength){
                if(dx > 0){
                    this._drawText(textColor, dx, dy, labels[i], false);   
                }else{
                    this._drawText(textColor, this.x, dy, labels[i], false);   
                }
                 xRect = dx;
                yRect = dy;
            }
        }

        this._drawRect(textColor, this.x, yRect , 1, 5);
        }
    }   
};

SVGChartPainter.prototype.drawVerticalAxis = function(ygd, precision, textColor, hasYAxisLabel) {
    var axis, item, step, y, ty, n, yoffset, value, multiplier, w, items, pos;

       multiplier = Math.pow(10, precision);
       step       = this.range / (ygd - 1);
       
    var yLabelDisplay = parseInt(this.h / textSize);
    var distance = this.range / yLabelDisplay;
    
    if(distance < 1){
        distance = 1;
    }

    var arr = [];
    //fil with min and max array which keep all bar values
    arr.push(parseInt(this.ymin));
    arr.push(parseInt(this.ymax));
    //if(chartType == 'CHART_BAR' || chartType == 'CHART_AREA'){
        if(this.ymin < 0 && 0 < this.ymax){
            arr.push(0);
        }   
         if(yAxisOrigin != null){
            arr.push(parseInt(yAxisOrigin));
        }
    //}   

    if(isControlPhase){
        //save target value and target limit only in control phase
        arr.push(targetValue);
        //if(targetLimit >= 0 ){
            arr.push(targetLimit);
        //}
    }

    //dynamic y min and max only for verticalAxisCoverage different by 100%
    if(verticalAxisCoverage != 1.0){
        if(horizontalLabels.length != 0 ){
            for(j=0; j < barValues.length ;j++){
                var val = this.ymin ;
                arr.push(parseInt(val));
            }
        }
    }
    arr.sort(sortNumber);
    //eliminate duplicate elements from array (all bar values)
    var uniqueValueArr = unique(arr);

    //create new arry which keep all positions for existing bar values
    var positions = [];
    
    /* Position labels on the axis */
    n          = this.range / this.h;
    yoffset    = (this.ymin / n);

    for (i = 0; i < uniqueValueArr.length; i++) {
         value = uniqueValueArr[i];

        if (value == this.ymin) { 
            y = this.y + this.h - 1; 
        }
        else { 
            y = this.y + (this.h - (value / n) + yoffset); 
        }
 
        positions.push(y);
 
    }   
    for(a = 0; a < uniqueValueArr.length; a++){
        var value = uniqueValueArr[a];
        var pos = positions[a];

        if(hasYAxisLabel){  
            if(value == targetValue || value == targetLimit){
                if(value == this.ymin || value == this.ymax){
                    this._drawText(textColor, 0, pos, value, true);
                }
            }else{
                this._drawText(textColor, 0, pos, value, true);
            }
        }
       
        if(isControlPhase){
            if(value == targetValue){
                var value1 = pos;
            }
            if(value == targetLimit){
                var value2 = pos;
                
                if(targetBand == 'true' && showTarget == 'true'){
                    if(value1 > 0 && value2 > 0){
                    this._drawRect(undoColor, this.x, value2, this.w, value1-value2);
                    }
                }
            }
            //if(targetBand != 'true'){
                if(value == targetValue && showTarget == 'true' ){
                    this._drawRect(undoColor, this.x, pos, this.w, 1);
                }
            
                if(value == targetLimit && showTarget == 'true' ){
                    this._drawRect(undoColor, this.x, pos, this.w, 1);
                }
            //}
                
        }
         
        if(value == 0 && this.ymin != 0){
            this._drawRect(gridColor, this.x, pos, this.w, 1);
            if(hasYAxisLabel){
                this._drawText(textColor, 0, pos, value, true);
            }
        }
        
        if(value == yAxisOrigin ){
            this._drawRect(gridColor, this.x, pos, this.w, 1);
            if(hasYAxisLabel){
                this._drawText(textColor, 0, pos, value, true);
            }
        }
        
 
    }
    
};

function sortNumber(a,b)
{
    return a - b;
}

function unique(a) {
    tmp = new Array(0);
    
    for(i = 0;i < a.length; i++){
        if(!contains(tmp, a[i])){
            tmp.length+=1;
            tmp[tmp.length-1]=a[i];
        }
    }
    return tmp;
}


function contains(a, e) {
    for(j = 0; j < a.length; j++)
        if(a[j]==e)return true;
    return false;
}


/*----------------------------------------------------------------------------\
|                                    Chart                                    |
|- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -|
| Chart class, control class that's used to represent a chart. Uses a painter |
| class for the actual drawing.  This is the only  class that should be  used |
| directly, the other ones are internal.                                      |
\----------------------------------------------------------------------------*/

function Chart(el) {

    this._cont             = el;
    this._yMin             = null;
    this._yMax             = null;
    this._xGridDensity     = 0;
    this._yGridDensity     = 0;
    this._flags            = 0;
    this._series           = new Array();
    this._labelPrecision   = 0;
    this._horizontalLabels = new Array();
    this._barWidth         = 5;
    this._barDistance      = 0;
    this._bars             = 0;
    this._showLegend       = false; 

}


Chart.prototype.setPainterFactory = function(f) {
    this._painterFactory = f;
};


Chart.prototype.setVerticalRange = function(min, max) {
    this._yMin = min;
    this._yMax = max;
};


Chart.prototype.setLabelPrecision = function(precision) {
    this._labelPrecision = precision;
};


Chart.prototype.setShowLegend = function(b) {
    this._showLegend = b;
};


Chart.prototype.setGridDensity = function(horizontal, vertical) {
    this._xGridDensity = horizontal;
    this._yGridDensity = vertical;
};


Chart.prototype.setHorizontalLabels = function(labels) {
    this._horizontalLabels = labels;
};

Chart.prototype.setHorizontalLabels = function(textColor) {
    this._horizontalLabels = textColor;
};

Chart.prototype.setDefaultType = function(flags) {
    this._flags = flags;
};


Chart.prototype.setBarWidth = function(width) {
    this._barWidth = width;
};


Chart.prototype.setBarDistance = function(distance) {
    this._barDistance = distance;
};


Chart.prototype.add = function(label, color, values, flags) {
    var o, offset;

    if (!flags) { flags = this._flags; }
    if ((flags & CHART_BAR) == CHART_BAR) { offset = this._barDistance + this._bars * (this._barWidth + this._barDistance); this._bars++; }
    else { offset = 0; }
    o = new ChartSeries(label, color, values, flags, offset);

    this._series.push(o);
};

Chart.prototype.draw = function(textColor, backgroundColor, lineColor, gridColor, undoColor, hasYAxisLabel, undoList, yMinValue, yMaxValue, horizontalLabelsLength) {
    var painter, i, o, o2, len, xlen, ymin, ymax, series, type, self, bLabels;

    if (!this._painterFactory) { return; }

    /* Initialize */
    series = new Array();
    stackedSeries = new Array();
    xlen = 0;
//    ymin = this._yMin;
//    ymax = this._yMax;
    ymin = yMinValue;
    ymax = yMaxValue;


    /* Separate stacked series (as they need processing). 
        series se ia din demo.js alea cu Span, Innocent
    */
    for (i = 0; i < this._series.length; i++) {
        o = this._series[i]
        if ((o.flags & CHART_STACKED) == CHART_STACKED) { series.push(o); }
    }

    /* Calculate values for stacked series */
    for (i = series.length - 2; i >= 0; i--) {
        o  = series[i].values;
        o2 = series[i+1].values;
        len = (o2.length > o.length)?o2.length:o.length;
        for (j = 0; j < len; j++) {
            if ((o[j]) && (!o2[j])) { continue; }
            if ((!o[j]) && (o2[j])) { o[j] = o2[j]; }
            else { o[j] = parseInt(o[j]) + parseFloat(o2[j]); }
    }   }

    /* Append non-stacked series to list */
    for (i = 0; i < this._series.length; i++) {
        o = this._series[i]
        if ((o.flags & CHART_STACKED) != CHART_STACKED) { series.push(o); }
    }
    /* Determine maximum number of values, ymin and ymax */
   for (i = 0; i < series.length; i++) {
        o = series[i]

        if (o.values.length > xlen) 
        { 
            xlen = o.values.length; 
        }
        for (j = 0; j < o.values.length; j++) {
            if (ymin == null)  
            { 
                ymin = o.values[j]; 
            }
            if (ymax == null) 
            { 
                ymax = o.values[j]; 
            }
       }
    }
    
                
    /*
     * For bar only charts the number of charts is the same as the length of the
     * longest series, for others combinations it's one less. Compensate for that
     * for bar only charts.
     */
    if (this._series.length == this._bars) {
        xlen++;
        this._xGridDensity++;
    }
    /*
     * Determine whatever or not to show the legend and axis labels
     * Requires density and labels to be set.
     this._xGridDensity este luat din Demo.js
     */
    bLabels = ((this._xGridDensity) && (this._yGridDensity) && (this._horizontalLabels.length >= this._xGridDensity));
    
    /* Create painter object */
    painter = this._painterFactory();
    painter.create(this._cont);

    /* Initialize painter object */
    painter.init(xlen, ymin, ymax, this._xGridDensity, this._yGridDensity, bLabels);

    /* Draw chart */
    painter.drawBackground(backgroundColor);

    /*
     * If labels and grid density where specified, draw legend and labels.
     * It's drawn prior to the chart as the size of the legend and labels
     * affects the size of the chart area.
     */
    if (this._showLegend) { painter.drawLegend(series); }
    
    if(targetBand == 'true'){
        painter.drawVerticalAxis(this._yGridDensity, this._labelPrecision, textColor, hasYAxisLabel);
            /* Draw series */
    // DHE 2009-11-28 What is this loop for?
    //for (i = 0; i < series.length; i++) {
        i = series.length - 1;
        type = series[i].flags & ~CHART_STACKED;
        
        switch (type) {
            case CHART_LINE: painter.drawLine(series[i].color, series[i].values, undoColor); break;
            case CHART_AREA: painter.drawArea(series[i].color, series[i].values); break;
            case CHART_BAR:     
            painter.drawBars(series[i].color, series[i].values, series[i].offset, this._barWidth, undoColor, undoList); break;

            default: ;
        };
    }else{
            /* Draw series */
    // DHE 2009-11-28 What is this loop for?
    //for (i = 0; i < series.length; i++) {
        i = series.length - 1;
        type = series[i].flags & ~CHART_STACKED;
        
        switch (type) {
            case CHART_LINE: painter.drawLine(series[i].color, series[i].values, undoColor); break;
            case CHART_AREA: painter.drawArea(series[i].color, series[i].values); break;
            case CHART_BAR:     
            painter.drawBars(series[i].color, series[i].values, series[i].offset, this._barWidth, undoColor, undoList); break;

            default: ;
        };
        
        painter.drawVerticalAxis(this._yGridDensity, this._labelPrecision, textColor, hasYAxisLabel);
    }

    painter.drawHorizontalAxis(xlen, this._horizontalLabels, this._xGridDensity, this._labelPrecision, textColor, undoColor, horizontalLabelsLength);

    /* Draw chart */
    painter.drawChart(gridColor);
        
};


/*----------------------------------------------------------------------------\
|                                 ChartSeries                                 |
|- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -|
| Internal class for representing a series.                                   |
\----------------------------------------------------------------------------*/

function ChartSeries(label, color, values, flags, offset) {
    this.label  = label;
    this.color  = color;
    this.values = values;
    this.flags  = flags;
    this.offset = offset;
}

/*----------------------------------------------------------------------------\
|                            AbstractChartPainter                             |
|- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -|
| Abstract base class defining the painter API. Can not be used directly.     |
\----------------------------------------------------------------------------*/

function AbstractChartPainter() {

};


AbstractChartPainter.prototype.calc = function(w, h, xlen, ymin, ymax, xgd, ygd) {
    this.range = ymax - ymin;
    //constant 40 is used because of vertical labels 
    var width = this.svg.getAttribute('width') - 40;
    this.xstep = (width-5) / (xlen);    
    this.xgrid = (xgd)?w / (xgd - 1):0;
    this.ygrid = (ygd)? (h * 3) / (ygd - 1):0;
    this.ymin  = ymin;
    this.ymax  = ymax;
};

 
