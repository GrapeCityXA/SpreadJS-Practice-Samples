import * as GC from "@grapecity-software/spread-sheets";


let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let protectedSheet = new GC.Spread.Sheets.Worksheet("被锁定的sheet")
protectedSheet.options.isProtected = true
spread.addSheet(1, protectedSheet);

let sheet1 = spread.getActiveSheet()
sheet1.setValue(0,0,1)
sheet1.setValue(1,0,2)
sheet1.setValue(2,0,3)
sheet1.setValue(3,0,4)
sheet1.setValue(4,0,5)

//重写粘贴
var commandV = {
    canUndo: false,
    execute: function (context, options, isUndo) {
        let sheet = context.getActiveSheet()
        if(sheet.options.isProtected) {
            sheet.options.isProtected = false
            setTimeout(() => {
                sheet.options.isProtected = true
            }, 0);
        }
        spread.commandManager().execute({ cmd: "paste" });
    }
};
spread.commandManager().register("myPaste", commandV);
spread.commandManager().setShortcutKey("myPaste", GC.Spread.Commands.Key.v, true, false, false, false);