import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"


const designer = new GC.Spread.Sheets.Designer.Designer(document.getElementById("ss"));
const spread = designer.getWorkbook()
spread.setSheetCount(2)

let sheet1 = spread.getSheetFromName("Sheet1")
sheet1.name("通过editEnding事件实现")
sheet1.setValue(1, 0, "请在B2尝试输入➡️")
sheet1.setColumnWidth(0, 150)

let sheet2 = spread.getSheetFromName("Sheet2")
sheet2.name("通过数据验证实现")
sheet2.setValue(1, 0, "请在B2尝试输入➡️")
sheet2.setColumnWidth(0, 150)

// 方式1，通过editEnding事件实现
sheet1.bind(GC.Spread.Sheets.Events.EditEnding, function (sender, args) {
    console.log(args)
    if(args.row != 1 || args.col != 1) {
        return
    }
    var text = args.editingText;
    if (!Number(text)) {
        alert("请输入数字！")
        args.cancel = true
    }
});

// 方式2，通过数据验证实现
// 高亮验证不通过的单元格
spread.options.highlightInvalidData = true; 
let dv = GC.Spread.Sheets.DataValidation.createNumberValidator(GC.Spread.Sheets.ConditionalFormatting.ComparisonOperators.between, 0, 100, false);
// 是否显示提示信息
dv.showInputMessage(true); 
// 提示信息的提示文字
dv.inputMessage("数字应该在0到100之间"); 
// 提示信息的标题
dv.inputTitle("tip"); 
// 报错信息的标题
dv.errorTitle("输入出错");
// 报错信息的内容
dv.errorMessage("请输入0到100之间的数字");
// 报错的样式：warning是给出警告，但可以继续；stop是给出警告，且无法继续，强制用户修改为正确的值
dv.errorStyle(GC.Spread.Sheets.DataValidation.ErrorStyle.warning); 
sheet2.setDataValidator(1, 1, 1, 1, dv, GC.Spread.Sheets.SheetArea.viewport);
