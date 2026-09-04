import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-en"
import "@grapecity-software/spread-sheets-designer"



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

// ---------------------------核心代码------------------------------
// 字符串类型数字不允许设置小数位数，保持与GcExcel一致
let formatFn = GC.Spread.Formatter.GeneralFormatter.prototype.format;
GC.Spread.Formatter.GeneralFormatter.prototype.format = function (val) {
    let formatter = this.formatString();
    if (typeof val === 'string' && (formatter.indexOf("0") || formatter.indexOf("#"))) {
        return val;
    }
    return formatFn.apply(this, arguments);
}
// -------------------------核心代码结束----------------------------

sheet.setColumnWidth(1, 200)
sheet.setValue(1, 1, "1.23456789")
sheet.setFormatter(1, 1, "0.00")
