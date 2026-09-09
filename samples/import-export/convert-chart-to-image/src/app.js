import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-sheets-charts"


var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), { sheetCount: 3 });
initSpread(spread);

document.getElementById("convert").onclick = function () {
    var sheet = spread.getActiveSheet();
    var chart = sheet.charts.all()[0]
    var canvas = chart.getHost()[0].querySelector("canvas")
    var image = new Image()
    image.src = canvas.toDataURL("image/png",1)
    image.style.width = "100%"
    var w = window.open(image.src, 'Image', `width=${chart.width()},height=${chart.height()},resizable=1`);
    w.document.write(image.outerHTML);
    w.document.close();
}

document.getElementById("convertAll").onclick = function () {
    pics = [];
    var sheetsCount = spread.getSheetCount()
    for (let i = 0; i < sheetsCount; i++) {
        var sheet = spread.getSheet(i);
        spread.setActiveSheet(sheet.name());
        var charts = sheet.charts.all();
        if (charts) {
            charts.forEach(function (c) {
                sheet.showRow(c.startRow(), GC.Spread.Sheets.VerticalPosition.top);
            });
        }
    }
    alert("转换成功，请打开F12查看")
    console.log(pics);
}
var pics = [];

spread.bind(GC.Spread.Sheets.Events.FloatingObjectLoaded, function (e, info) {
    var sheet = info.sheet;
    var floatingObject = info.floatingObject;
    var canvas = floatingObject.getHost()[0].querySelector("canvas")
    if (canvas) {
        var image = new Image()
        image.src = canvas.toDataURL("image/png")
        //console.log(image.src);
        pics.push(image.src);
    }
});




var colorArray = ['rgb(120, 180, 240)', 'rgb(240, 160, 80)', 'rgb(140, 240, 120)', 'rgb(120, 150, 190)'];

function initSpread(spread) {
    var chartType = [{
        type: GC.Spread.Sheets.Charts.ChartType.columnClustered,
        desc: "columnClustered",
        dataArray: [
            ["", 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            ["Tokyo", 49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
            ["New York", 83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3],
            ["London", 48.9, 38.8, 39.3, 41.4, 47.0, 48.3, 59.0, 59.6, 52.4, 65.2, 59.3, 51.2],
            ["Berlin", 42.4, 33.2, 34.5, 39.7, 52.6, 75.5, 57.4, 60.4, 47.6, 39.1, 46.8, 51.1]
        ],
        dataFormula: "A1:M5",
        changeStyle: function (chart) {
            changeChartTitle(chart, "The Average Monthly Rainfall");
            changColumnChartDataLabels(chart);
            chart.axes({ primaryValue: { title: { text: "Rainfall(mm)" } } });
            changeChartSeriesColor(chart);
        }
    }, {
        type: GC.Spread.Sheets.Charts.ChartType.columnStacked,
        desc: "columnStacked",
        dataArray: [
            ["", 'Tokyo', 'New York', 'London', 'Berlin'],
            ["The First Quarter", 227.8, 260.9, 127, 110.1],
            ["The Second Quarter", 449.2, 283.9, 136.7, 167.8],
            ["The Third Quarter", 500.5, 300.5, 171, 165.4],
            ["The Fourth Quarter", 344.1, 282.4, 175.7, 137]
        ],
        dataFormula: "A1:E5",
        changeStyle: function (chart) {
            changeChartTitle(chart, "The Average Quarterly Rainfall");
            changColumnChartDataLabels(chart);
            chart.axes({ primaryValue: { title: { text: "Rainfall(mm)" } } });
            changeChartSeriesColor(chart);
        }
    }, {
        type: GC.Spread.Sheets.Charts.ChartType.columnStacked100,
        desc: "columnStacked100",
        dataArray: [
            ["", 'Tokyo', 'New York', 'London', 'Berlin'],
            ["The First Quarter", 227.8, 260.9, 127, 110.1],
            ["The Second Quarter", 449.2, 283.9, 136.7, 167.8],
            ["The Third Quarter", 500.5, 300.5, 171, 165.4],
            ["The Fourth Quarter", 344.1, 282.4, 175.7, 137]
        ],
        dataFormula: "A1:E5",
        changeStyle: function (chart) {
            changeChartTitle(chart, "The Average Quarterly Rainfall");
            changColumnChartDataLabels(chart);
            chart.axes({ primaryValue: { title: { text: "Rainfall(%)" } } });
            changeChartSeriesColor(chart);
        }
    }];
    var sheets = spread.sheets;
    spread.suspendPaint();
    for (var i = 0; i < chartType.length; i++) {
        var sheet = sheets[i];
        initSheet(sheet, chartType[i].desc, chartType[i].dataArray);
        var chart = addChart(sheet, chartType[i].type, chartType[i].dataFormula);//add chart
        chartType[i].changeStyle(chart);
    }
    spread.resumePaint();
}

function initSheet(sheet, sheetName, dataArray) {
    sheet.name(sheetName);
    //prepare data for chart
    sheet.setArray(0, 0, dataArray);
    sheet.setColumnWidth(0, 120);
}

function addChart(sheet, chartType, dataFormula) {
    //add chart
    return sheet.charts.add((sheet.name() + 'Chart1'), chartType, 30, 100, 900, 400, dataFormula, GC.Spread.Sheets.Charts.RowCol.rows);
    
}

function changeChartTitle(chart, title) {
    chart.title({ text: title });
}

// show dataLabels
function changColumnChartDataLabels(chart) {
    var dataLabels = chart.dataLabels();
    dataLabels.showValue = true;
    dataLabels.showSeriesName = false;
    dataLabels.showCategoryName = false;
    var dataLabelPosition = GC.Spread.Sheets.Charts.DataLabelPosition;
    dataLabels.position = dataLabelPosition.outsideEnd;
    chart.dataLabels(dataLabels);
}

//change color
function changeChartSeriesColor(chart) {
    return
    var series = chart.series().get();
    for (var i = 0; i < series.length; i++) {
        chart.series().set(i, { backColor: colorArray[i] });
    }
}