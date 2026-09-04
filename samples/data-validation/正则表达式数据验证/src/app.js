import * as GC from "@grapecity-software/spread-sheets";
/**
 * 使用正则表达式自定义条件验证规则
 */

//自定义教校验规则类
function MyCondition(reg) {
    this.reg = reg;
}
//继承Condition类
MyCondition.prototype = new GC.Spread.Sheets.ConditionalFormatting.Condition();
//添加evaluate方法
MyCondition.prototype.evaluate = function (evaluator, baseRow, baseColumn, actualObj) {
    //用于检测一个字符串是否匹配某个模式，
    var reg = new RegExp(this.reg);
    if (reg.test(actualObj)) {
        return true;
    } else {
        return false;
    }

};
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet();
//挂起绘制
spread.suspendPaint();
//实例化一个MyCondition对象
// 如果这里用到了反斜杠\，例如\d   \.   \w等，需要写两个反斜杠，如\\d   \\w，否则在16行new RegExp的时候，正则会和预期不同
let nCondition = new MyCondition(
    "^[0-9]*[1-9][0-9]*$");
//自定义数据验证规则
let validator = new GC.Spread.Sheets.DataValidation.DefaultDataValidator(nCondition);
validator.type(GC.Spread.Sheets.DataValidation.CriteriaType.custom);
sheet.setValue(0, 0, 'hello');
sheet.setValue(1, 0, 2);
//高亮显示不满足验证规则的数据
spread.options.highlightInvalidData = true;
//将校验规则应用到区域上
sheet.setDataValidator(0, 0, validator);
sheet.setDataValidator(1, 0, validator);
//恢复绘制
spread.resumePaint();