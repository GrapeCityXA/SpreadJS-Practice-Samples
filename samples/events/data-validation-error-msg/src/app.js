import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

// 数据验证示例：限制输入范围为1-100
// 创建整数验证器
const dv = GC.Spread.Sheets.DataValidation.createNumberValidator(
    GC.Spread.Sheets.ConditionalFormatting.ComparisonOperators.between,
    1,
    100,
    true
);

// 设置输入提示信息
dv.inputTitle("提示");
dv.inputMessage("请输入1到100之间的整数！");
dv.showInputMessage(true);

// 设置错误提示信息
dv.errorTitle("输入错误");
dv.errorMessage("您输入的值不在1-100范围内，请重新输入！");
dv.errorStyle(GC.Spread.Sheets.DataValidation.ErrorStyle.stop);
dv.showErrorMessage(true);

// 将验证器应用到 A1 单元格
sheet.setDataValidator(1, 1, dv);

// 设置 A1 单元格的提示文字
sheet.setValue(1, 0, "请在浅黄色区域输入任意非法数字：");
sheet.getRange(1, 1, 1, 1).backColor("lightyellow");
sheet.setColumnWidth(0, 300)

spread.bind(GC.Spread.Sheets.Events.ValueChanged, function (sender, args) {
    let { row, col, newValue, oldValue, sheet } = args
    // 如果当前单元格有数据验证
    if (sheet.getCell(row, col).validator()) {
        //判断数据验证是否通过
        let isValid = sheet.isValid(row, col, newValue)
        if (!isValid) {
            //数据验证失败时 弹出错误信息
            alert(sheet.getCell(row, col).validator().errorMessage());
            //清空单元格内容
            sheet.setValue(row, col, oldValue)
        }
    }
})