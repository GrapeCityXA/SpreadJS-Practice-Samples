import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-resources-zh"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-io"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"


// 修改导出的默认选项
let getFileMenuOption = GC.Spread.Sheets.Designer.FileMenuHandler.getFileMenuOption;
console.log(getFileMenuOption)
GC.Spread.Sheets.Designer.FileMenuHandler.getFileMenuOption = function (context) {
    let fileMenuSetting = (context.getData("fileMenuSetting") || {});
    let option = getFileMenuOption.apply(this, arguments);
    // 可以打印option查看其他选项
    console.log(option)
    option.exportXlsxOptions.includeBindingSource = fileMenuSetting.exportXlsxOptions_includeBindingSource !== undefined ? fileMenuSetting.exportXlsxOptions_includeBindingSource : true;
    option.exportXlsxOptions.includeFormulas = false
    return option;
}

// 打印时默认打印整个工作簿
var fileMenuPanelCommand = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.FileMenuPanel);
var oldGetStateFn = fileMenuPanelCommand.getState;
fileMenuPanelCommand.getState = function () {
    var result = oldGetStateFn.apply(this, arguments);
    result.printSetting.printArea = 1;
    return result;
}
var config = GC.Spread.Sheets.Designer.DefaultConfig;
config.commandMap = {
    fileMenuPanel: fileMenuPanelCommand
}
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)

let spread = designer.getWorkbook()

spread.setSheetCount(5)

let sheet = spread.getActiveSheet()

sheet.setValue(0,0,'grapecity')





