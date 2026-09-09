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



let config = GC.Spread.Sheets.Designer.DefaultConfig
config.ribbon[0].buttonGroups.unshift({
    label: "NewDesigner",
    thumbnailClass: "your-class",
    commandGroup: {
        children: [
            {
                commands: ["CustomDropdownSelect"],
            }
        ],
    }
})

config.commandMap = {
    CustomDropdownSelect: {
        // title: "自定义下拉选择",
        text: "自定义下拉选择",
        comboWidth: 150,
        commandName: "CustomDropdownSelect",
        type: "comboBox",
        dropdownList: [{
            text: "选项1",
            value: 1
        }, {
            text: "选项2",
            value: 2
        }, {
            text: "选项3",
            value: 3
        }],
        execute: function (context, selectValue, value) {
            if (selectValue && value) {
                let spread = context.getWorkbook();
                let sheet = spread.getActiveSheet();
                sheet.setValue(sheet.getActiveRowIndex(), sheet.getActiveColumnIndex(), value);
            }
        },
        getState: function (context, cmdOptions) {
            let sheet = context.getWorkbook().getActiveSheet();
            let row = sheet.getActiveRowIndex();
            let col = sheet.getActiveColumnIndex();
            console.log(row, col, sheet.getValue(row, col))
            let dropdownList = cmdOptions.dropdownList.filter((item) => {
                return item.value === sheet.getValue(row, col) || item.text === sheet.getValue(row, col)
            });
            return dropdownList[0].text || cmdOptions.text;
        }
    }
}

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

