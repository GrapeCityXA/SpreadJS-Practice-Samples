import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-io"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-reportsheet-addon"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"
import { data } from './data.js'



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()

const addDataManager = () => {
  let tableName = "orders"
  let dba = spread.dataManager()
  dba.addTable(tableName, { data })
}

addDataManager()


const loadFile2 = async (file, current, allSheet) => {
  return new Promise((resolve, reject) => {
    spread.open(file, () => {
      addDataManager()
      setTimeout(() => {
        let sheetTab = spread.getActiveSheetTab();
        if (sheetTab && sheetTab instanceof GC.Spread.Report.ReportSheet) {
          sheetTab.renderMode("PaginatedPreview");
          let name = sheetTab.name();
          let pageSheet = sheetTab.generatePageSheets(
            false,
            (i) => `${current}${name}${i}`
          )
          resolve(allSheet.concat(pageSheet));
        }
      }, 0)
    })
  })
}


const genarateWorksheets = async (current, total, allSheet) => {
  let response = await fetch(`./static/rp${current}.sjs`);
  let blob = await response.blob();
  let file = new File([blob], `rp${current}.sjs`)
  let returnsheets = await loadFile2(file, current, allSheet)
  current++
  if (current <= total) {
    return await genarateWorksheets(current, total, returnsheets)

  } else {
    return returnsheets
  }
};


let tempSpread
const getMergeExcel = async () => {
  let totalSheet = await genarateWorksheets(1, 2, [])
  tempSpread = new GC.Spread.Sheets.Workbook()
  tempSpread.setSheetCount(1);
  let len = totalSheet.length;
  for (let i = 0; i < len; i++) {
    tempSpread.addSheet(i, totalSheet[i]);
  }
  tempSpread.removeSheet(tempSpread.getSheetCount() - 1);

}

getMergeExcel()

document.getElementById("btn").addEventListener("click", function () {
  tempSpread.export((blob) => {
    saveAs(blob, "test.xlsx");
  });
})







