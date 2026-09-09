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
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"


let fileMenuPanelCommand = GC.Spread.Sheets.Designer.getCommand(
    GC.Spread.Sheets.Designer.CommandNames.FileMenuPanel
);
let oldExecuteFn = fileMenuPanelCommand.execute;

fileMenuPanelCommand.execute = function (designer, propertyName, newValue) {
    // 请在F12中查看该参数
    console.log(arguments)
    if(propertyName == "button_import_excel" && designer.getData("isFileModified")) {
        let result = confirm("该文件已经被修改，导入新Excel文件后将丢失，是否需要先保存？")
        if(result) {
            // 进行保存操作
            // ...
            // 然后将isFileModified设置为false
            designer.setData("isFileModified", false);
        } else {
            oldExecuteFn.call(this, designer, propertyName, newValue);
        }
    } else {
        oldExecuteFn.call(this, designer, propertyName, newValue);
    }
};

let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
config.commandMap = {
    fileMenuPanel: fileMenuPanelCommand,
};

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

sheet.setValue(1, 1, "请在单元格做出任意编辑后，尝试导入Excel文件")
sheet.setValue(3, 1, "操作路径：文件-导入-导入Excel文件")


