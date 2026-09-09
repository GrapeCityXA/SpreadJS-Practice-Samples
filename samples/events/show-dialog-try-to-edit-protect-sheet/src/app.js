import * as GC from "@grapecity-software/spread-sheets";
/**
 * 表单保护时，双击锁定单元格或按下键盘上某个按钮时弹出提示框
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'), {
    sheetCount: 1
})
let sheet = spread.getActiveSheet()
//开启表单保护
sheet.options.isProtected = true
//按下键盘按键事件处理
document.onkeydown = function(event) {
    var e = event || window.event;
    if (e && e.keyCode) {
        var gcuielement = document.activeElement.attributes.gcuielement;
        if (gcuielement && gcuielement.localName === 'gcuielement') {
            var selection = sheet.getSelections()[0];
            var { row, col } = selection;
            if (sheet.options.isProtected === true && sheet.getCell(row, col).locked() === true) {
                alert('您试图更改的单元格或图表位于受保护的工作表中，若要进行更改，请取消工作表保护。');
            }
        }
    }
}

//监听双击单元格
sheet.bind(GC.Spread.Sheets.Events.CellDoubleClick, function(e, args) {
    var { row, col } = args;
    if (sheet.options.isProtected === true && sheet.getCell(row, col).locked() === true) {
        alert('您试图更改的单元格或图表位于受保护的工作表中，若要进行更改，请取消工作表保护。');
    }
});