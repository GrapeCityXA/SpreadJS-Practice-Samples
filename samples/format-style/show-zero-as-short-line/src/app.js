import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getActiveSheet();
var style = new GC.Spread.Sheets.Style();
//  定义Style的格式为指定字符
style.formatter = '-';
//  设置条件格式，当单元格值为0时，显示Style效果
sheet.conditionalFormats.addCellValueRule(
    GC.Spread.Sheets.ConditionalFormatting.ComparisonOperators.equalsTo, '0', null, 
    style, [new GC.Spread.Sheets.Range(0, 0, 5, 1)]
);
sheet.setArray(0, 0, [0, 2, 0, 4, 0]);
