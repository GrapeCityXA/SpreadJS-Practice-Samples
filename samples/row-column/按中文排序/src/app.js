import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-resources-zh"

// 引用这两个资源，如果systemjs-plugin-css报错： package添加：  "systemjs-plugin-css": "0.1.37",
import "./videoTools.css"
import { videoPreview } from "./videoTools.js"
videoPreview("https://videos.grapecity.com.cn/SpreadJS/CodeLibrary/Sort%20by%20Chinese.mp4");


GC.Spread.Common.CultureManager.culture('zh-cn');

/**
 * 实现中文自定义排序规则
 */
let salesData = [
    ["SalesPers", "Birth", "Region", "SaleAmt", "ComPct", "ComAmt"],
    ["哈京信息", new Date("1988/08/21"), "South", 660, 0.15, 99],
    ["北京农业", new Date("2000/01/23"), "North", 260, 0.1, 26],
    ["北京信息", new Date("1988/08/21"), "South", 660, 0.15, 99],
    ["博大精深", new Date("1995/08/03"), "East", 940, 0.15, 141],
    ["渤海地区", new Date("1994/05/23"), "West", 410, 0.12, 49.2],
    ["大成人民", new Date("1992/07/21"), "North", 800, 0.15, 120],
    ["东北大米", new Date("1995/11/03"), "South", 900, 0.15, 135],
    ["东海地区", new Date("1987/02/11"), "West", 300, 0.17, 110],
    ["富国民强", new Date("1997/04/01"), "West", 310, 0.16, 99.2],
    ["工银手艺", new Date("1997/02/15"), "North", 500, 0.10, 76],
    ["广大理财", new Date("1991/12/28"), "East", 450, 0.18, 35]
];

let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));
initSpread(spread);
let isAscending;

//初始化工作薄
function initSpread(spread) {
    let sheet = spread.getSheet(0);
    //挂起绘制
    sheet.suspendPaint();
    //给表单绑定对列进行排序时触发的事件
    sheet.bind(GC.Spread.Sheets.Events.RangeSorting, function (e, info) {
        isAscending = info.ascending;
        info.compareFunction = sortDomain
    });
    sheet.options.allowCellOverflow = true;
    sheet.name("FilterDialog");
    //设置数据
    sheet.setArray(1, 1, salesData);
    //创建一个行筛选并应用
    let filter = new GC.Spread.Sheets.Filter.HideRowFilter(new GC.Spread.Sheets.Range(2, 1, salesData.length - 1, salesData[0].length));
    sheet.rowFilter(filter);
    sheet.defaults.rowHeight = 28;
    sheet.setColumnWidth(1, 150);
    sheet.setColumnWidth(2, 80);
    sheet.getRange(2, 2, 10, 1).formatter("yyyy/mm/dd");
    //恢复绘制
    sheet.resumePaint();

};

//排序规则设置
function sortDomain(value1, value2) {
    if (value1 && value2) {
        return value1.toString().localeCompare(value2.toString(), 'zh');
    } else if (!value1 && !value2) {
        return 0;
    } else if (value1 && !value2) {
        return isAscending ? -1 : 1;
    } else if (!value1 && value2) {
        return isAscending ? 1 : -1;
    }
}