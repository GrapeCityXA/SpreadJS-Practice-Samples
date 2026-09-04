import * as GC from "@grapecity-software/spread-sheets";

/**
 * 限制单元格中输入信息的长度
 */

GC.Spread.Common.CultureManager.culture('zh-cn');
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

// 定义NumberCellType的构造函数，默认可以输入长度为2
function NumberCellType(decimalPlace) {
	this.typeName = "NumberCellType";
	this.decimalPlace = decimalPlace ? decimalPlace : 2;
}
//使用文本单元格类型的编辑器类型
NumberCellType.prototype = new GC.Spread.Sheets.CellTypes.Text(GC.Spread.Sheets.CellTypes.EditorType.textarea);
NumberCellType.prototype.createEditorElement = function(){
    var textarea = GC.Spread.Sheets.CellTypes.Text.prototype.createEditorElement.apply(this, arguments);
    //限制文本输入框中可输入内容的长度
    textarea.maxLength = this.decimalPlace;
    return textarea;
}
let sheet = spread.getActiveSheet();
//将该规则应用到1,1单元格上
sheet.setCellType(1, 1, new NumberCellType(5));