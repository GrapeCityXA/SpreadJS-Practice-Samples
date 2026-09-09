import * as GC from "@grapecity-software/spread-sheets";


let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

let sheet = spread.getActiveSheet()

sheet.addSpan(2,2,3,3)
// 创建样式
let style = new GC.Spread.Sheets.Style()
style.font = 'italic small-caps bold 20pt/22pt Times New Roman,Georgia,Serif'
style.hAlign = GC.Spread.Sheets.HorizontalAlign.center
style.vAlign = GC.Spread.Sheets.VerticalAlign.center
style.textDecoration = GC.Spread.Sheets.TextDecorationType.overline | GC.Spread.Sheets.TextDecorationType.underline;
sheet.setStyle(2, 2, style, GC.Spread.Sheets.SheetArea.viewport)
sheet.setValue(2,2,'SpreadJS')

/***
 * 单元格字体一般是由多个属性堆叠起来的css效果
 * 例如font属性可以用来作为font-style, font-variant, font-weight, font-size, line-height 和 font-family 属性的简写
 * 
 * 修改时可以先创建一个DOM元素，将当前单元格的字体赋值给该DOM的字体信息
 * 之后做自己局部属性的修改
 * 修改完成后再获取DOM的字体信息，赋值给临时style
 * 最后将style赋值给单元格
 * **/

document.getElementById("changeFont").onclick = function(){
    // 获取需要改变的单元格的样式
    let cssStyle = sheet.getStyle(2, 2) || new GC.Spread.Sheets.Style();
    // 创建临时DOM
    let fontElement = document.createElement("span")
    // 将单元格样式字体赋值给临时DOM的字体样式
    fontElement.style.font = cssStyle.font
    // 修改临时DOM的字体类型
    fontElement.style.fontFamily = "宋体"
    // 将临时DOM的字体样式赋值给单元格样式的font属性
    cssStyle.font = fontElement.style.font
    // 设置目标单元格样式
    sheet.setStyle(2,2,cssStyle)

}

