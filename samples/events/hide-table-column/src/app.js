import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Common.CultureManager.culture('zh-cn');
/**
 * 表格中列信息的隐藏和恢复
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));
let sheet = spread.getActiveSheet();
//设置行高、列宽
sheet.setColumnWidth(0,100)
sheet.setRowHeight(0,30)
sheet.setColumnWidth(1,100)

//定义一个按钮，其点击事件用以触发隐藏列操作
let button = new GC.Spread.Sheets.CellTypes.Button()
button.text('隐藏订单日期')
sheet.getCell(0,0).cellType(button).value('orderDate')

//同上，重置按钮用以恢复被隐藏的列
let resetButton = new GC.Spread.Sheets.CellTypes.Button()
resetButton.text('重置表格')
sheet.getCell(0,1).cellType(resetButton).value('reset')

//在表单上添加一个Table表格
let table = sheet.tables.add('table01',1,1,4,4,GC.Spread.Sheets.Tables.TableThemes.light1)
let colsInfo = []
let tempInfo = []
//定义构建表格头部信息的函数
function generateCol(empCol){
    let column1 = new GC.Spread.Sheets.Tables.TableColumn(1,'orderDate','订单日期')
    empCol.push(column1)

    let column2 = new GC.Spread.Sheets.Tables.TableColumn(2,'item','明细',)
    empCol.push(column2)
   
    let column3 = new GC.Spread.Sheets.Tables.TableColumn(3,'cost','金额','$#,##0.00')
    empCol.push(column3)
 
    let checkBox = new GC.Spread.Sheets.CellTypes.CheckBox()
    checkBox.textTrue('是')
    checkBox.textFalse('否')
    let column4 = new GC.Spread.Sheets.Tables.TableColumn(4,'isCash','是否现金',null,checkBox,'isCash')
    empCol.push(column4)
    return empCol
}
//调用生成表头信息
colsInfo = generateCol(colsInfo)
tempInfo = generateCol(tempInfo)
//给Table设置表头信息
table.bindColumns(colsInfo)

//响应按钮的点击事件，执行业务逻辑
spread.bind(GC.Spread.Sheets.Events.ButtonClicked,function(s,e){
    let {row,col,sheet} = e
    let deleteCol = sheet.getCell(row,col).value()
    sheet.suspendPaint()
    //隐藏某列实现
    if(deleteCol!=='reset'){
        let index = findColIndex(deleteCol)
        //如果存在要隐藏的列，将对应列从表头数据中删除的到新的列头信息。移除旧table，根据新的表头重新生成新的table。
        if(index > -1){
            tempInfo.splice(index,1)
            let table = sheet.tables.findByName('table01')
            let range = table.range()
            sheet.tables.remove(table);
            let newTable = sheet.tables.add('table01',range.row,range.col,range.rowCount,tempInfo.length,GC.Spread.Sheets.Tables.TableThemes.light1)
            newTable.bindColumns(tempInfo)
        }
    }else{
            //恢复初始状态：用初始化的Table覆盖隐藏后的Table
            let table = sheet.tables.findByName('table01')
            let range = table.range()
            sheet.tables.remove(table);
            let newTable = sheet.tables.add('table01',range.row,range.col,range.rowCount,colsInfo.length,GC.Spread.Sheets.Tables.TableThemes.light1)
            newTable.bindColumns(colsInfo)
            //重新生成tempInfo,用以下次隐藏列。
            tempInfo = generateCol([])
    }
    sheet.resumePaint()
})
//查询要隐藏列的下标
function findColIndex(deleteCol){
    let index = -1
    for(let i = 0;i<tempInfo.length;i++){
        if(tempInfo[i].dataField()==deleteCol){
            return i
        }
    }
    return index
}

