import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-sheets-resources-zh"

/**
 * 右键菜单删除整列时，支持一些自定义操作
 * 本案例是弹框提醒
 */
GC.Spread.Common.CultureManager.culture('zh-cn');
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'), { sheetCount: 1 })
//自定义删除列命令
let deleteColumnsNew = {
    canUndo: true,
    name: 'deleteColumnsNew',
    execute: function (context, options, isUndo) {
        let Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(context, options)
            return true
        } else {
            Commands.startTransaction(context, options)
            let sheet = context.getSheetFromName(options.sheetName)
            sheet.suspendPaint()
            //可以在此实现一些删除前的逻辑            
            alert("删除前可以做一些自定义的操作")
            if (options.selections && options.selections.length) {
                let col = options.selections[0].col
                let colCount = options.selections[0].colCount
                sheet.deleteColumns(col, colCount)
            }
            sheet.resumePaint()
            Commands.endTransaction(context, options)
            return true
        }
    }
}

//注册命令
spread.commandManager().register('deleteColumnsNew', deleteColumnsNew)

function MyContextMenu() { }
MyContextMenu.prototype = new GC.Spread.Sheets.ContextMenu.ContextMenu(spread)
MyContextMenu.prototype.onOpenMenu = (menuData, itemsDataForShown, hitInfo, spread) => {
    itemsDataForShown.forEach((item, index) => {
        //如果是整列删除，替换为自定义删除操作
        if (item && item.name === 'gc.spread.deleteColumns') {
            item.text = "删除（自定义）"
            item.command = "deleteColumnsNew"
        }
    })
}
//用自定义的删除命令替换默认的删除操作
let contextMenu = new MyContextMenu()
spread.contextMenu = contextMenu

//初始化表单数据
let sheet = spread.getActiveSheet()
sheet.setColumnWidth(1, 200)
sheet.setArray(0, 0, [
    [1, "↑请在列头点击鼠标右键", 3],
    [4, 5, 6],
    [7, 8, 9],
    [10, 11, 12],
    [13, 14, 15]
])
sheet.setFormula(5, 1, "=sum(B1:B5)")