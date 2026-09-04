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
import "@grapecity-software/spread-sheets-designer-resources-en"
import "@grapecity-software/spread-sheets-designer"



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

let style = new GC.Spread.Sheets.Style()
style.cellButtons = [{
    command: "openDateTimePicker",
    imageType: GC.Spread.Sheets.ButtonImageType.dropdown,
    position: GC.Spread.Sheets.ButtonPosition.right
}]
style.dropDowns = [{
    type: GC.Spread.Sheets.DropDownType.dateTimePicker,
    option: {
        startDay: 7,
        showBuiltInDateRange: false,
        showDateRange: false,
        showTime: true,
        calendarPage: 3
    }
}]
sheet.setStyle(1, 1, style)

spread.bind(GC.Spread.Sheets.Events.CellChanged, function (e, info) {
    console.log(info)
    if (!info.isUndo) {
        let row = info.row;
        let col = info.col;
        if (
            info.sheet.getStyle(row, col).cellButtons[0].command === "openDateTimePicker"
        ) {
            let newDate = info.newValue;
            console.log(newDate);
            if (newDate < Date.now()) {
                let cell = info.sheet.getCell(row, col);

                info.sheet.suspendEvent();
                cell.value(info.oldValue);
                info.sheet.resumeEvent();

                alert("非法修改，日期不得早于当前时间！");
            }
        }
    }
})

