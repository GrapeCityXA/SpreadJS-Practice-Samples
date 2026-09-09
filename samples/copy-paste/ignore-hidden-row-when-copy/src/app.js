import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"


let config = GC.Spread.Sheets.Designer.ToolBarModeConfig
let designer = new GC.Spread.Sheets.Designer.Designer("ss", config)
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet();
sheet.setValue(0, 0, 1)
sheet.setValue(1, 0, 2)
sheet.setValue(2, 0, 3)
sheet.setValue(3, 0, 4)
sheet.setRowVisible(1, false)
sheet.setRowVisible(2, false)
let style = new GC.Spread.Sheets.Style()
style.backColor = "#c6e2ff"
sheet.getRange(0,0,4,1).setStyle(style)

sheet.setValue(0, 2, "第2和第3行已经被隐藏")
sheet.setValue(3, 2, "请选择A1:A4，然后按下 alt+; 键")
sheet.setValue(4, 2, "接着，按下 ctrl+C 键复制后，在任意处 ctrl+V 粘贴")

// 请注意，V17.1.9版本已默认支持 alt+; 快捷键，如果您正在使用V17.1.9以下的版本，可以将下面的注释代码打开
// 该快捷键需要在设计器下使用，如果您没有使用设计器，也请打开下面的注释
// spread.commandManager().setShortcutKey(null, 186, false, false, true, false)
// spread.commandManager().register("selectIgnoreHidden", {
//     canUndo: false,
//     execute: function (spread, options, isUndo) {
//         let sheet = spread.getActiveSheet();
//         spread.suspendPaint();
//         let sels = sheet.getSelections();
//         let newSels = [];
//         for (let sel of sels) {
//             let originalRange = sel;
//             if (originalRange.row !== -1) {
//                 let newRanges = [];
//                 let lastVisibleRow = -1;
//                 for (let r = 0; r < originalRange.rowCount; r++) {
//                     let row = originalRange.row + r;
//                     if (!sheet.getRowVisible(row)) {
//                         if (lastVisibleRow !== -1) {
//                             newRanges.push(new GC.Spread.Sheets.Range(lastVisibleRow, originalRange.col, row - lastVisibleRow, originalRange.colCount));
//                             lastVisibleRow = -1;
//                         }
//                     }
//                     else if (lastVisibleRow === -1) {
//                         lastVisibleRow = row;
//                     }
//                 }
//                 if (lastVisibleRow !== -1) {
//                     newRanges.push(new GC.Spread.Sheets.Range(lastVisibleRow, originalRange.col, originalRange.row + originalRange.rowCount - lastVisibleRow, originalRange.colCount));
//                 }
//                 newSels = newSels.concat(newRanges);
//             }
//         }
//         sheet.clearSelection();
//         for (let sel of newSels) {
//             sheet.addSelection(sel.row, sel.col, sel.rowCount, sel.colCount);
//         }
//         spread.resumePaint();
//     }
// }, 186, false, false, true, false);
