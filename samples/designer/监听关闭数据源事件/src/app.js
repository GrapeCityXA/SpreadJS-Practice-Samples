import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"



let idm = GC.Spread.Sheets.Designer.getCommand("insertDataManager")
let oldF = idm.execute
idm.execute = function() {
    if(!arguments[2]) {
        // do something
        console.log("关闭数据源")
    }
    oldF.apply(this, arguments)
}


let designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
designerConfig.commandMap = {};
designerConfig.commandMap[GC.Spread.Sheets.Designer.CommandNames.InsertDataManager] = idm;


let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig)
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

