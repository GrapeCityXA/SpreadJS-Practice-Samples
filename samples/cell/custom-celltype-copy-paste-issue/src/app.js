import * as GC from "@grapecity-software/spread-sheets";
import { FivePointedStarCellType, FullNameCellType } from "./customCellType.js"


const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

// 解决直接复制自定义单元格不生效的问题
GC.Spread.Sheets.getTypeFromString = function (typeStr) {
    if (typeStr === 'FivePointedStarCellType') {
        return FivePointedStarCellType;
    }
}


// 解决自定义单元格的编辑框复制不生效的问题
FullNameCellType.prototype.isReservedKey = function (e) {
    //cell type handle tab key by itself
    return (e.keyCode === GC.Spread.Commands.Key.tab && !e.ctrlKey && !e.shiftKey && !e.altKey)
    || (e.keyCode === GC.Spread.Commands.Key.c && e.ctrlKey && !e.shiftKey && !e.altKey)
};



sheet.setCellType(0, 0, new FivePointedStarCellType())
sheet.setCellType(0, 1, new FullNameCellType())
sheet.setValue(0, 1, {firstName: "Michaeal", lastName: "Jackson"})
sheet.setColumnWidth(1, 200)