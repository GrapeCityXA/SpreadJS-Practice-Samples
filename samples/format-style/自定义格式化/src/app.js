import * as GC from "@grapecity-software/spread-sheets";
/**
 * 在特定区域输入数字，其真实数值会变为显示数值*1000
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));
let sheet = spread.getActiveSheet();

//此示例创建一个自定义格式化程序 
let customFormatterTest = {}
customFormatterTest.prototype = GC.Spread.Formatter.FormatterBase
//数值显示值为真实值/1000
customFormatterTest.format = function (obj) {
    let num = obj / 1000
    if (isNaN(num)) {
        return obj.toString()
    }
    return num.toString()
}

//数字映射为num*1000
customFormatterTest.parse = function (str) {
    if (!str) {
        return null
    }
    let num = parseFloat(str)
    if (isNaN(num)) {
        return str
    }
    return num * 1000
}
//初始化表单数据
sheet.getRange(0, 0, 3, 5).backColor('#456782').formatter(customFormatterTest)
sheet.getCell(0, 0).value(10000)