import * as GC from "@grapecity-software/spread-sheets";
/**
 * 将单元格的编辑权限信息保存到tag中，根据用户等级来分配单元格的编辑权限
 * 并高亮显示受限区域
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));
let sheet = spread.getActiveSheet();
let fileInfo = {"version":"15.0.0","customList":[],"sheets":{"Sheet1":{"name":"Sheet1","isSelected":true,"activeRow":3,"activeCol":10,"frozenTrailingRowStickToEdge":true,"frozenTrailingColumnStickToEdge":true,"theme":"Office","data":{"dataTable":{"1":{"3":{"value":"D3:F5一级用户与二级用户都不能编辑","style":{"hAlign":0,"wordWrap":true}},"4":{"style":{"hAlign":0,"wordWrap":true}},"5":{"style":{"hAlign":0,"wordWrap":true}},"9":{"value":"J3:L5二级用户不能编写","style":{"hAlign":1,"wordWrap":true}},"10":{"style":{"wordWrap":true}},"11":{"style":{"wordWrap":true}}},"2":{"3":{"style":{"borderLeft":null,"borderTop":null,"borderRight":null,"borderBottom":null},"tag":"{\"primaryUser\":true,\"secondaryUser\":true}"},"4":{"style":{"borderLeft":null,"borderTop":null,"borderRight":null,"borderBottom":null},"tag":"{\"primaryUser\":true,\"secondaryUser\":true}"},"5":{"style":{"borderLeft":null,"borderTop":null,"borderRight":null,"borderBottom":null},"tag":"{\"primaryUser\":true,\"secondaryUser\":true}"},"9":{"tag":"{\"secondaryUser\":true}"},"10":{"tag":"{\"secondaryUser\":true}"},"11":{"tag":"{\"secondaryUser\":true}"}},"3":{"3":{"style":{"borderLeft":null,"borderTop":null,"borderRight":null,"borderBottom":null},"tag":"{\"primaryUser\":true,\"secondaryUser\":true}"},"4":{"style":{"borderLeft":null,"borderTop":null,"borderRight":null,"borderBottom":null},"tag":"{\"primaryUser\":true,\"secondaryUser\":true}"},"5":{"style":{"borderLeft":null,"borderTop":null,"borderRight":null,"borderBottom":null},"tag":"{\"primaryUser\":true,\"secondaryUser\":true}"},"9":{"tag":"{\"secondaryUser\":true}"},"10":{"tag":"{\"secondaryUser\":true}"},"11":{"tag":"{\"secondaryUser\":true}"}},"4":{"3":{"style":{"borderLeft":null,"borderTop":null,"borderRight":null,"borderBottom":null},"tag":"{\"primaryUser\":true,\"secondaryUser\":true}"},"4":{"style":{"borderLeft":null,"borderTop":null,"borderRight":null,"borderBottom":null},"tag":"{\"primaryUser\":true,\"secondaryUser\":true}"},"5":{"style":{"borderLeft":null,"borderTop":null,"borderRight":null,"borderBottom":null},"tag":"{\"primaryUser\":true,\"secondaryUser\":true}"},"9":{"tag":"{\"secondaryUser\":true}"},"10":{"tag":"{\"secondaryUser\":true}"},"11":{"tag":"{\"secondaryUser\":true}"}}},"defaultDataNode":{"style":{"themeFont":"Body","locked":false}}},"rowHeaderData":{"defaultDataNode":{"style":{"themeFont":"Body"}}},"colHeaderData":{"defaultDataNode":{"style":{"themeFont":"Body"}}},"rows":[null,{"size":39}],"leftCellIndex":0,"topCellIndex":0,"spans":[{"row":1,"rowCount":1,"col":3,"colCount":3},{"row":1,"rowCount":1,"col":9,"colCount":3}],"selections":{"0":{"row":3,"rowCount":1,"col":10,"colCount":1},"length":1},"rowOutlines":{"items":[]},"columnOutlines":{"items":[]},"cellStates":{},"states":{},"outlineColumnOptions":{},"autoMergeRangeInfos":[],"printInfo":{"paperSize":{"width":850,"height":1100,"kind":1}},"shapeCollectionOption":{"snapMode":0},"index":0}},"pivotCaches":{}}
spread.fromJSON(fileInfo)
let sheet = spread.getActiveSheet()
//修改表格单元格默认不锁定
let defaultStyle = sheet.getDefaultStyle()
//设置单元格默认为可编辑
defaultStyle.locked = false
defaultStyle.wordWrap = true
sheet.setDefaultStyle(defaultStyle)
//开启表单保护
sheet.options.isProtected = true
adjustAuthor(document.getElementById('user').value)
document.getElementById('user').onchange = function(e) {
    adjustAuthor(e.target.value)
}

//对打tag的单元格设置为不可编辑
function adjustAuthor(currentUser) {
    sheet.suspendPaint()
    //清空表单
    sheet.clear(0, 0, sheet.getRowCount(), sheet.getColumnCount(), GC.Spread.Sheets.SheetArea.viewport, GC.Spread.Sheets.StorageType.style)
    for (let i = 0; i < sheet.getRowCount(); i++) {
        for (let j = 0; j < sheet.getColumnCount(); j++) {
            //没有tag信息跳过
            if (sheet.getTag(i, j)) {
                let info = JSON.parse(sheet.getTag(i, j))
                    //若没有编辑权限，设置不可编辑+背景色
                if (info[currentUser]) {
                    let range = sheet.getRange(i, j, 1, 1)
                    range.backColor('#9cf')
                    range.locked(true)
                }
            }
        }
    }
    sheet.resumePaint()
}
