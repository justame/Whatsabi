/**
 * Created by @juanjovazpar on 11/10/2015.
 *
 * SnapChart is a simple library based in SnapSVG which contains
 * different types of chart for data visualization.
 */

/**
 *
 * @param name
 * @param data
 * @constructor
 */
function Series(name,data){
    this.name = name || "Unknown";
    this.data = data || [];
}




/**
 * Abstract class
 * @param wrapper
 * @constructor
 */
function Chart(wrapper) {
    this.data = [];
    this.container = document.getElementById(wrapper) || null;
    this.config = {
        mainColor: '#FF4242',
        secondColor: '#B5B5B5',
        thirdColor: '#E3E3E3',
        animateTime: 700,
        fontSize: 12,
        length: 10,
        marginWidth: 10,
        marginHeight: 10,
        margin: 20,
        stroke: 3,
        period: 24,
        minOpacity: 0.05
    };
}

Chart.prototype.setFilter = function(seriesName){
    var data = this.data;

    for(var i = 0;i < data.length;i++){
        var current = data[i];

        if(current.name == seriesName){
            this.paint([current]);
            break;
        }
    }
};
Chart.prototype.setConfig = function (config) {
    for(var property in config){
        if(config.hasOwnProperty(property)){
            this.config[property] = config[property];
        }
    }
};
Chart.prototype.setData = function(series){
    this.data = series;
};
Chart.prototype.clearFilter = function () {
    this.paint(this.data);
};






/**
 * Abstract class ...
 */
function SimpleChart(wrapper) {
    Chart.call(this,wrapper);

    //Create the canvas for the chart and appending it to the container
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
        id = wrapper + 'Chart';
    svg.setAttribute('id',id);
    this.container.appendChild(svg);
    this.canvas = Snap("#" + id);
}

SimpleChart.prototype = Object.create(Chart.prototype);
SimpleChart.constructor = SimpleChart;





function DotChart(wrapper) {
    SimpleChart.call(this,wrapper);
}

DotChart.prototype = Object.create(SimpleChart.prototype);
DotChart.constructor = DotChart;

DotChart.prototype.paint = function (series) {
    var max, opacity,
        data = [],
        w = this.container.clientWidth,
        h = this.container.clientHeight,
        dX = this.config.length,
        mI = this.config.margin,
        mW = this.config.marginWidth,
        mH = this.config.marginHeight,
        mainColor = this.config.mainColor,
        thirdColor = this.config.thirdColor,
        line = this.config.stroke,
        period = this.config.period,
        minOpacity = this.config.minOpacity,
        canvas = this.canvas;

    if(series == null){
        series = this.data;
    }

    //First we find the total array of the values in the series
    for(var i = 0;i < series[0].data.length;i++){
        var total = 0;

        for(var j = 0;j < series.length;j++){
            total += series[j].data[i];
        }
        data.push(total);
    }

    max = Math.max.apply(null,data);

    //Printing the points
    canvas.rect(mW,mH,w - mW*2,1).attr('fill',thirdColor);
    canvas.rect(mW,(h-2*mH)/2,w - mW*2,1).attr('fill',thirdColor);
    canvas.rect(mW,h - mH,w - mW*2,1).attr('fill',thirdColor);

    for(var k = 0; k < data.length; k++){
        var value = data[k];

        if(value > 0){
            opacity = value / max + minOpacity;
        }else if(value == 0){
            opacity = 0;
        }else{
            opacity = minOpacity;
        }

        canvas.circle(mW + dX/2 + Math.floor(k/period) * (dX + mI), mH + k%period*(h-2*mH)/(period-1), line).attr({
            fill: mainColor,
            'opacity': opacity
        });
    }
};





/**
 * HORIZONTAL BARS WITH TOTAL
 */
function TotalBarChart(wrapper) {
    SimpleChart.call(this,wrapper);
}

TotalBarChart.prototype = Object.create(SimpleChart.prototype);
TotalBarChart.constructor = TotalBarChart;

TotalBarChart.prototype.paint = function(series) {
    var txtColor,max,valueL,value,
        canvas = this.canvas,
        w = this.container.clientWidth,
        fontSize = "'" + this.config.fontSize + "'",
        mainColor = this.config.mainColor,
        secondColor = this.config.secondColor,
        thirdColor = this.config.thirdColor,
        animateTime = this.config.animateTime,
        margin = this.config.margin,
        line = this.config.stroke;

    if(series == null){
        series = this.data;
    }

    //Reduce data array of series in a single number
    series = series.map(function (e) {
        e.data = eval(e.data.join('+'));
        return e;
    });

    //Get the max to calc length max of lines
    max = Math.max.apply(this,series.map(function(e){
        return e.data;
    }));

    //Print every series in data
    for (var i = series.length-1; i >= 0; i--) {

        //Change color to highlight max value
        if(i == series.length-1){
            txtColor = secondColor;
        }else{
            txtColor = mainColor;
        }

        //Calculate the lenght of the text for data
        valueL = (series[i].data+'').length * 8;

        //Series name
        canvas.text(0, i * margin + margin - line, series[i].name).attr({
            fill: txtColor,
            'font-size': fontSize
        });

        //Value
        value = canvas.text(w - valueL, i * margin + margin - line, series[i].data).attr({
            fill: txtColor,
            'font-size': fontSize
        });

        //Base stroke
        canvas.rect(0, i * margin + margin, w, line).attr('fill', thirdColor);

        //Value stroke
        canvas.rect(0, i * margin + margin, 0, line).attr('fill', mainColor).animate({
            width: series[i].data * w / max
        }, animateTime);
    }
};





function PolylineChart(wrapper) {
    SimpleChart.call(this,wrapper);
}

PolylineChart.prototype = Object.create(SimpleChart.prototype);
PolylineChart.constructor = PolylineChart;

PolylineChart.prototype.paint = function (series) {
    var max,min,
        data = [],
        dots = [],
        h = this.container.clientHeight,
        w = this.container.clientWidth,
        dX = this.config.length,
        mI = this.config.margin,
        mW = this.config.marginWidth,
        mH = this.config.marginHeight,
        mainColor = this.config.mainColor,
        thirdColor = this.config.thirdColor,
        line = this.config.stroke,
        canvas = this.canvas;

    if(series == null){
        series = this.data;
    }

    //First we find the total array of the values in the series
    for(var i = 0;i < series[0].data.length;i++){
        var total = 0;

        for(var j = 0;j < series.length;j++){
            total += series[j].data[i];
        }
        data.push(total);
    }

    max = Math.max.apply(null,data);
    min = Math.min.apply(null,data);

    //Getting the points for the polyline
    for(var k = 0;k < data.length;k++){
        var x = Math.round(k * (dX + mI) + mW),
        y = Math.round(((h-2*mH)/(max - min))*(max - data[k]) + mH);
        dots.push(x,y,x+dX,y);
    }

    canvas.rect(mW,mH/2,w - mW*2,1).attr('fill',thirdColor);
    canvas.rect(mW,h-mH/2,w - mW*2,1).attr('fill',thirdColor);

    //Printing the polyline
    canvas.polyline(dots).attr({
        stroke: mainColor,
        'strokeWidth': line,
        fill: 'none'
    });
};





function ExtendedChart(wrapper) {
    Chart.call(this,wrapper);
    this.subCharts = [];
}

ExtendedChart.prototype = Object.create(Chart.prototype);
ExtendedChart.constructor = ExtendedChart;

ExtendedChart.prototype.setConfig = function (config) {
    for(var i = 0; i < this.subCharts.length; i++){
        this.subCharts[i].setConfig(config);
    }
};
ExtendedChart.prototype.clearFilter = function () {
    for(var i = 0; i < this.subCharts.length; i++){
        this.subCharts[i].clearFilter();
    }
};
ExtendedChart.prototype.setFilter = function (serie) {
    for(var i = 0; i < this.subCharts.length; i++){
        this.subCharts[i].setFilter(serie);
    }
};
ExtendedChart.prototype.paint = function (series) {
    for(var i = 0; i < this.subCharts.length; i++){
        this.subCharts[i].paint(series);
    }
};





function DotPolyChart(wrapper) {
    ExtendedChart.call(this,wrapper);
    var subContainer1 = document.createElement('DIV'),
        subContainer2 = document.createElement('DIV'),
        id1 = wrapper + 'chart1',
        id2 = wrapper + 'chart2';

    subContainer1.setAttribute('id',id1);
    subContainer2.setAttribute('id',id2);

    subContainer1.style.height = "60px";
    subContainer2.style.height = "240px";

    this.container.appendChild(subContainer1);
    this.container.appendChild(subContainer2);

    this.subCharts.push(new PolylineChart(id1));
    this.subCharts.push(new DotChart(id2));

    this.setConfig({
        stroke: 2
    });
}
DotPolyChart.prototype = Object.create(ExtendedChart.prototype);
DotPolyChart.constructor = DotPolyChart;

DotPolyChart.prototype.setData = function (series) {
    var seriesAdapted = [],
        period = this.config.period;

    //For each series, we need to create a new reduced on
    for(var i = 0; i < series.length; i++){
        var counter = 1,
            sum = 0,
            current = series[i],
            currentData = current.data,
            newSeries = new Series(current.name,[]),
            newData = newSeries.data;

        //We will sum the values in the of the current series
        //Each period-times, we will push the sum to the new series
        while(counter < currentData.length){
            sum += currentData[counter-1];

            if(counter == currentData.length-1 || (counter > 0 && counter%period == 0)){
                newData.push(sum);
                sum = 0;
            }

            counter++;
        }

        seriesAdapted.push(newSeries);
    }

    this.subCharts[0].setData(seriesAdapted);
    this.subCharts[1].setData(series);
};



function FullChart(wrapper) {
    ExtendedChart.call(this,wrapper);
}

FullChart.prototype = Object.create(ExtendedChart.prototype);
FullChart.constructor = FullChart;

FullChart.prototype.setData = function (series) {
    this.data = series;

};
