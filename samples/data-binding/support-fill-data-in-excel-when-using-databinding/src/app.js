import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-io";
import { template } from "./template.js"

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
spread.fromJSON(template)

document.getElementById("exportExcel").addEventListener("click", function () {
    spread.export(function (blob) {
        saveAs(blob, "模板.xlsx");
        document.getElementById("exportExcel").style.display = "none"
        document.getElementById("file").style.display = "inline-block"
    }, function (e) {
        console.log(e);
    }, {
        fileType: GC.Spread.Sheets.FileType.excel
    });
})

document.getElementById("file").addEventListener("change", function () {
    let tempSpread = new GC.Spread.Sheets.Workbook()
    tempSpread.import(this.files[0], function () {
        let tempSheet = tempSpread.getActiveSheet()
        let ur = tempSheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.data)
        let arr = tempSheet.getArray(ur.row, ur.col, ur.rowCount, ur.colCount)

        let curSheet = spread.getActiveSheet()
        curSheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource({}))
        curSheet.setArray(ur.row, ur.col, arr)
        alert("请打开F12查看当前sheet的数据源")
        console.log(curSheet.getDataSource().getSource())
    }, function () { }, {
        fileType: GC.Spread.Sheets.FileType.excel
    })
})