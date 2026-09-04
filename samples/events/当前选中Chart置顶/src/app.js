import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-charts";

/**
 * 当前表中含有多个chart并有部分sheet重合时，当前选中的chart至于最顶层
 ***/
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));
let sheet = spread.getActiveSheet();

sheet.suspendPaint();
//准备数据
let dataArray = [
    ["", 'Chrome', 'FireFox', 'IE', 'Safari', 'Edge', 'Opera', 'Other'],
    ["2015", 0.5651, 0.1734, 0.1711, 0.427, 0, 0.184, 0.293],
    ["2016", 0.6230, 0.1531, 0.1073, 0.464, 0.311, 0.166, 0.225],
    ["2017", 0.6360, 0.1304, 0.834, 0.589, 0.443, 0.223, 0.246]
];
sheet.setArray(0, 0, dataArray);
sheet.resumePaint();

//添加图表
sheet.charts.add('Chart1', GC.Spread.Sheets.Charts.ChartType.columnClustered, 0, 100, 400, 200, "A1:H4");
sheet.charts.add('Chart2', GC.Spread.Sheets.Charts.ChartType.pie, 0, 250, 400, 200, "A1:H4");
//绑定选中图片事件 通过zIndex设置堆叠显示优先级
sheet.bind(GC.Spread.Sheets.Events.FloatingObjectSelectionChanged, function(e, info) {
    // typeName为2 表示为chart
    if (info.floatingObject.typeName == '2') {
        // 获取选择的chart 的 name
        let Selname = info.floatingObject.name();
        // 设置选择的chart 的 zindex。（998只是示例）
        sheet.charts.zIndex(Selname, 998);
        // 遍历获取chart
        let charts = sheet.charts.all();
        for (let i = 0; i < charts.length; i++) {
            let name = charts[i].name();
            if (name == Selname) {
                continue;
            }
            // 设置其他chart index为小于998
            sheet.charts.zIndex(name, 600);
        }
    }
});