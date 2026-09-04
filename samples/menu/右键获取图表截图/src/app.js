import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-resources-zh"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"

var designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
designerConfig.commandMap = {
    "copyAsPicture":{
        text: "复制为图片(自定义）",
        commandName: "copyAsPicture",
        visibleContext:"ChartSelected",
        execute: async function(designer){
            getScreenshot(designer.getWorkbook());
        }
    }
}
designerConfig.contextMenu.unshift("copyAsPicture");


let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig)
let spread = designer.getWorkbook();
spread.setSheetCount(3)
setTimeout(function(){
    initSpread(spread);
}, 100)




let getScreenshot = async function (spread) {
    try {
        console.profile("print")
        console.log(new Date())
        // spread.suspendCalcService(true)
        const makeImagePromise = async () => {
            return await getScreenshotBlob(spread)
        }
        // 为了支持Safari，write必须在事件中，当前的content不能因为异步改变
        await navigator.clipboard.write(
            [new ClipboardItem({ ["image/png"]: makeImagePromise() })]
        )
    } catch (err) {
        console.log(`${err.name}:  ${err.message}`)
    }
    finally{
        // spread.resumeCalcService(false)
        console.log(new Date())
        console.profileEnd("print")
        console.log('success')
    }
}



function getScreenshotBlob(spread) {
    return new Promise(function (resolve, reject) {
        let sheet = spread.getActiveSheet()
        let selectedChart;
        for(let i = 0; i < sheet.charts.all().length; i++){
            let chart = sheet.charts.all()[i];
            if(chart && chart.isSelected()){
                selectedChart = chart;
                break;
            }
        }

        if(!selectedChart){
            return;
        }

        let canvas = chart.getHost()[0].getElementsByTagName('canvas')[0];
        canvas.toBlob((blob) => {
                resolve(blob)
            })

    });
}




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
            chart.axes({primaryValue: {title: {text: "Rainfall(mm)"}}});
            changeChartSeriesColor(chart);
            changeChartSeriesGapWidthAndOverLap(chart);
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
            chart.axes({primaryValue: {title: {text: "Rainfall(mm)"}}});
            changeChartSeriesColor(chart);
            changeChartSeriesGapWidthAndOverLap(chart);
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
            chart.axes({primaryValue: {title: {text: "Rainfall(%)"}}});
            changeChartSeriesColor(chart);
            changeChartSeriesGapWidthAndOverLap(chart);
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
    chart.title({text: title});
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
    var series = chart.series().get();
    for (var i = 0; i < series.length; i++) {
        chart.series().set(i, {backColor: colorArray[i]});
    }
}

function changeChartSeriesGapWidthAndOverLap(chart) {
    var seriesItem = chart.series().get(0);
    seriesItem.gapWidth = 2;
    seriesItem.overlap = 0.1;
    chart.series().set(0, seriesItem);
}
