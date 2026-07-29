import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-print";
import "@grapecity-software/spread-sheets-pdf";
import "file-saver";
import * as echarts from "echarts";
GC.Spread.Sheets.LicenseKey = "";
/**
 * 需要引入三方库： https://lib.baomitu.com/echarts/5.1.0/echarts.simple.js
 * 点击外部资源，在展开的输入框中输入三方库地址，之后点击+号添加链接
 * 点击运行，看看效果吧
 **/

GC.Spread.Common.CultureManager.culture("zh-cn");

// chart数据
var charts = {
  bar: {
    id: "barChart",
    tableName: "bar",
    source: [
      {
        衬衫: 5,
        羊毛衫: 20,
        雪纺衫: 36,
        裤子: 10,
        高跟鞋: 10,
        袜子: 20,
      },
    ],
    startRow: 1,
    endRow: 15,
    startColumn: 8,
    endColumn: 16,
    echart: false,
  },
  pie: {
    id: "pieChart",
    tableName: "pie",
    source: [
      {
        直接访问: 335,
        邮件营销: 310,
        联盟广告: 234,
        视频广告: 135,
        搜索引擎: 1548,
      },
    ],
    startRow: 16,
    endRow: 30,
    startColumn: 8,
    endColumn: 16,
    echart: false,
  },
  line: {
    id: "lineChart",
    tableName: "line",
    source: [
      {
        Mon: 820,
        Tue: 932,
        Wed: 901,
        Thu: 934,
        Fri: 1290,
        Sat: 1330,
        Sun: 1320,
      },
    ],
    startRow: 31,
    endRow: 45,
    startColumn: 8,
    endColumn: 16,
    echart: false,
  },
};

function initCharts(chart) {
  switch (chart.id) {
    case "barChart":
      chart.echart = initBarECharts(chart);
      break;
    case "pieChart":
      chart.echart = initPieECharts(chart);
      break;
    case "lineChart":
      chart.echart = initLineECharts(chart);
      break;
  }
}

function initDataTable(sheet, chart) {
  //id, startRow, source
  sheet.setColumnWidth(1, 90);
  sheet.setColumnWidth(2, 90);
  sheet.setColumnWidth(3, 90);
  sheet.setColumnWidth(4, 90);
  sheet.setColumnWidth(5, 90);
  sheet.setColumnWidth(6, 90);
  sheet.setColumnWidth(7, 90);

  var chartTable = sheet.tables.addFromDataSource(
    chart.tableName,
    chart.startRow + 1,
    1,
    chart.source,
    GC.Spread.Sheets.Tables.TableThemes.medium2,
  );

  var chartTableRange = chartTable.dataRange();

  var table = {};
  table.row = chartTableRange.row;
  table.rowCount = chartTableRange.rowCount;
  table.col = chartTableRange.col;
  table.colCount = chartTableRange.colCount;
  chart.table = table;
}

function getChartDataFromTables(tableSource) {
  var categoriesArr = [];
  var dataArr = [];
  for (var prop in tableSource[0]) {
    categoriesArr.push(prop);
    dataArr.push(tableSource[0][prop]);
  }
  var barData = {
    categories: categoriesArr,
    data: dataArr,
  };
  return barData;
}

function refreshCharts(id, data) {
  var myChart = echarts.getInstanceByDom(document.getElementById(id));
  if (myChart) {
    switch (id) {
      case "barChart":
        myChart.setOption({
          xAxis: {
            data: data.categories,
          },
          series: [
            {
              data: data.data,
            },
          ],
        });
        break;
      case "pieChart":
        var dataArr = [];
        for (var i = 0; i < data.categories.length; i++) {
          dataArr.push({
            value: data.data[i],
            name: data.categories[i],
          });
        }
        myChart.setOption({
          legend: {
            data: data.categories,
          },
          series: [
            {
              data: dataArr,
            },
          ],
        });
        break;
      case "lineChart":
        myChart.setOption({
          xAxis: {
            data: data.categories,
          },
          series: [
            {
              data: data.data,
            },
          ],
        });
        break;
    }
  }
}

function initFloatingObject(sheet, chart) {
  // 初始化浮动对象
  var customFloatingObject =
    new GC.Spread.Sheets.FloatingObjects.FloatingObject(chart.id);
  customFloatingObject.startRow(chart.startRow);
  customFloatingObject.startColumn(chart.startColumn);
  customFloatingObject.endColumn(chart.endColumn);
  customFloatingObject.endRow(chart.endRow);

  // 创建ECharts容器
  var div = document.createElement("div");
  div.innerHTML =
    '<div id="' + chart.id + '" style="width: 500px;height:300px; "></div>';
  $(div).css({
    background: "#FFFFFF",
  });
  // 将ECharts添加到浮动层中
  customFloatingObject.content(div);
  sheet.floatingObjects.add(customFloatingObject);
}

function initBarECharts(chart) {
  var div = document.getElementById(chart.id);

  if (!div) {
    return;
  }

  var dataObj = getChartDataFromTables(chart.source);

  // 基于准备好的dom，初始化echarts实例
  var myChart = echarts.init(div);

  // 指定图表的配置项和数据
  var option = {
    title: {
      text: "ECharts 入门示例",
    },
    tooltip: {},
    legend: {
      data: ["销量"],
    },
    xAxis: {
      data: dataObj.categories,
    },
    yAxis: {},
    series: [
      {
        name: "销量",
        type: "bar",
        data: dataObj.data,
        animation: false,
      },
    ],
  };

  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);

  //EChartsArr.bar.chart = myChart;

  return myChart;
}

function initPieECharts(chart) {
  var div = document.getElementById(chart.id);

  if (!div) {
    return;
  }

  var dataObj = getChartDataFromTables(chart.source);
  var dataArr = [];
  for (var i = 0; i < dataObj.categories.length; i++) {
    dataArr.push({
      value: dataObj.data[i],
      name: dataObj.categories[i],
    });
  }

  var myChart = echarts.init(div);

  var option = {
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      x: "left",
      data: dataObj.categories,
    },
    series: [
      {
        name: "访问来源",
        type: "pie",
        radius: ["50%", "70%"],
        avoidLabelOverlap: false,
        label: {
          normal: {
            show: false,
            position: "center",
          },
          emphasis: {
            show: true,
            textStyle: {
              fontSize: "30",
              fontWeight: "bold",
            },
          },
        },
        labelLine: {
          normal: {
            show: false,
          },
        },
        data: dataArr,
        animation: false,
      },
    ],
  };

  myChart.setOption(option);

  //EChartsArr.pie.chart = myChart;

  return myChart;
}

function initLineECharts(chart) {
  var div = document.getElementById(chart.id);

  if (!div) {
    return;
  }

  var dataObj = getChartDataFromTables(chart.source);

  var myChart = echarts.init(div);

  var option = {
    xAxis: {
      type: "category",
      data: dataObj.categories,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: dataObj.data,
        type: "line",
        animation: false,
      },
    ],
  };

  myChart.setOption(option);

  //EChartsArr.line.chart = myChart;

  return myChart;
}
/*
          初始化Spread
      */
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var tempSpread = new GC.Spread.Sheets.Workbook();
var sheet = spread.getSheet(0);

// 设置默认样式为中文字体 SimSun（宋体），确保中文在页面和 PDF 中使用中文字体渲染
var defaultStyle = sheet.getDefaultStyle() || new GC.Spread.Sheets.Style();
defaultStyle.font = "11pt SimSun";
sheet.setDefaultStyle(defaultStyle);

sheet.suspendPaint();

var defaultShowRows = 600 / 20;

for (var chart in charts) {
  // 初始化数据表格
  initDataTable(sheet, charts[chart]);
  // 初始化浮动对象
  initFloatingObject(sheet, charts[chart]);
}

sheet.resumePaint();

for (var chart in charts) {
  // 初始化图表
  initCharts(charts[chart]);
}

spread.bind(GC.Spread.Sheets.Events.ValueChanged, function (s, e) {
  var row = e.row;
  var col = e.col;

  for (var chart in charts) {
    var range = new GC.Spread.Sheets.Range(
      charts[chart].table.row,
      charts[chart].table.col,
      charts[chart].table.rowCount,
      charts[chart].table.colCount,
    );
    if (range.contains(row, col, 1, 1)) {
      refreshCharts(
        charts[chart].id,
        getChartDataFromTables(charts[chart].source),
      );
      break;
    }
  }
});

// TopRowChanged 随事件加载
/*
 *   SpreadJS 出于性能需要，采用了lazyload机制，因此
 *   需要在事件中进行判断，当滚动条滚动到floating object 所在位置时
 *   再加载ECharts图像。
 * */

// 判断：当存在未加载的charts时，注册事件
spread.bind(GC.Spread.Sheets.Events.TopRowChanged, function (s, e) {
  console.log(e);
  var newTopRow = e.newTopRow;

  if (
    charts["bar"].startRow - defaultShowRows < newTopRow &&
    !charts["bar"].echart
  ) {
    initCharts(charts["bar"]);
  }

  if (
    charts["pie"].startRow - defaultShowRows < newTopRow &&
    !charts["pie"].echart
  ) {
    initCharts(charts["pie"]);
  }

  if (
    charts["line"].startRow - defaultShowRows < newTopRow &&
    !charts["line"].echart
  ) {
    initCharts(charts["line"]);
  }
});

$("#exportPDF").click(async function () {
  // 加载包含完整中文字符集的真实中文字体（楷体 simkai.ttf）
  if (!window.loadedChineseFontBuffer) {
    try {
      const res = await fetch("./simkai.ttf");
      window.loadedChineseFontBuffer = await res.arrayBuffer();
    } catch (e) {
      console.error("加载中文字体失败:", e);
    }
  }

  if (window.loadedChineseFontBuffer) {
    var chineseFont = { normal: window.loadedChineseFontBuffer };
    GC.Spread.Sheets.PDF.PDFFontsManager.registerFont("SimSun", chineseFont);
    GC.Spread.Sheets.PDF.PDFFontsManager.registerFont("宋体", chineseFont);
    GC.Spread.Sheets.PDF.PDFFontsManager.registerFont(
      "customFont1",
      chineseFont,
    );

    // 设置备用字体，确保任意字体下的中文均可正常渲染
    GC.Spread.Sheets.PDF.PDFFontsManager.fallbackFont = function (font) {
      return window.loadedChineseFontBuffer;
    };
  }

  // 深拷贝工作簿状态
  tempSpread.fromJSON(
    JSON.parse(
      JSON.stringify(
        spread.toJSON({
          includeBindingSource: true,
        }),
      ),
    ),
  );

  tempSpread.suspendPaint();

  let tempSheet = tempSpread.getSheet(0);

  // 设置打印信息，使 PDF 页面布局整洁
  let printInfo = tempSheet.printInfo();
  printInfo.showGridLine(false);
  printInfo.showBorder(false);
  printInfo.showRowHeader(GC.Spread.Sheets.Print.PrintVisibilityType.show);
  printInfo.showColumnHeader(GC.Spread.Sheets.Print.PrintVisibilityType.show);
  printInfo.orientation(GC.Spread.Sheets.Print.PrintPageOrientation.landscape); // 横向打印更适合包含右侧图表的布局
  printInfo.fitPagesWide(1);
  printInfo.fitPagesTall(1); // 缩放到单页以完整呈现

  for (var chart in charts) {
    // 遍历 sheet 删除多余 floatObject
    tempSheet.floatingObjects.remove(charts[chart].id);

    // 动态生成图表图片（白色背景，高分辨率）并添加为 Picture
    // var img = getEChartImage(charts[chart]);
    if (!charts[chart].echart) {
      sheet.showCell(
        charts[chart].startRow,
        charts[chart].startColumn,
        GC.Spread.Sheets.VerticalPosition.top,
        GC.Spread.Sheets.HorizontalPosition.left,
      );
      initCharts(charts[chart]);
    }
    var img = charts[chart].echart.getDataURL();
    var picture = tempSheet.pictures.add(charts[chart].id, img, 0, 0, 100, 100);
    picture.startRow(charts[chart].startRow);
    picture.startColumn(charts[chart].startColumn);
    picture.endColumn(charts[chart].endColumn);
    picture.endRow(charts[chart].endRow);
  }
  tempSpread.resumePaint();

  tempSpread.savePDF(
    function (blob) {
      saveAs(blob, "download.pdf");
    },
    function (error) {
      console.log(error);
    },
    {
      title: "Test Title",
      author: "Test Author",
      subject: "Test Subject",
      keywords: "Test Keywords",
      creator: "test Creator",
    },
  );
});
