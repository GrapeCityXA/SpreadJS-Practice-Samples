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



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()


spread.fromJSON({"version":"18.0.3","name":"","docProps":{"docPropsApp":{},"docPropsCore":{"created":"2025-02-24T06:40:23Z"}},"sheetCount":1,"customList":[],"defaultSheetTabStyles":{},"builtInFileIcons":{},"sheets":{"Sheet1":{"name":"Sheet1","isSelected":true,"activeRow":12,"activeCol":5,"visible":1,"theme":"Office","data":{"dataTable":{"0":{"1":{"value":"在这里粘贴","style":{"hAlign":2}}},"1":{"0":{"value":1}},"2":{"0":{"value":2}},"3":{"0":{"value":3}},"4":{"0":{"value":4}},"5":{"0":{"value":5}},"6":{"0":{"value":6}},"9":{"3":{"value":"复制此区域↓","style":{"hAlign":3,"vAlign":0,"themeFont":"Body","imeMode":1}}},"10":{"3":{"value":1,"style":{"backColor":"Accent 1 80","hAlign":3,"vAlign":0,"themeFont":"Body","imeMode":1}}},"11":{"3":{"value":2,"style":{"backColor":"Accent 1 80","hAlign":3,"vAlign":0,"themeFont":"Body","imeMode":1}}},"12":{"3":{"value":3,"style":{"backColor":"Accent 1 80","hAlign":3,"vAlign":0,"themeFont":"Body","imeMode":1}}},"13":{"3":{"value":4,"style":{"backColor":"Accent 1 80","hAlign":3,"vAlign":0,"themeFont":"Body","imeMode":1}}},"14":{"3":{"value":5,"style":{"backColor":"Accent 1 80","hAlign":3,"vAlign":0,"themeFont":"Body","imeMode":1}}},"15":{"3":{"value":6,"style":{"backColor":"Accent 1 80","hAlign":3,"vAlign":0,"themeFont":"Body","imeMode":1}}}},"defaultDataNode":{"style":{"themeFont":"Body"}}},"rowHeaderData":{"defaultDataNode":{"style":{"themeFont":"Body"}}},"colHeaderData":{"defaultDataNode":{"style":{"themeFont":"Body"}}},"rows":[null,null,{"visible":false,"isFilter":true},null,{"visible":false}],"columns":[{"size":61},{"size":90},{"size":63},{"size":101}],"defaultData":{},"leftCellIndex":0,"topCellIndex":0,"selections":{"0":{"row":12,"col":5,"rowCount":1,"colCount":1},"length":1},"rowOutlines":{"items":[]},"columnOutlines":{"items":[]},"cellStates":{},"states":{},"rowFilter":{"range":{"row":1,"col":0,"rowCount":6,"colCount":1},"typeName":"HideRowFilter","dialogVisibleInfo":{},"filterItemMap":[{"index":0,"conditions":[{"conType":2,"compareType":0,"expected":"1","useWildCards":false},{"conType":2,"compareType":0,"expected":"3","useWildCards":false},{"conType":2,"compareType":0,"expected":"4","useWildCards":false},{"conType":2,"compareType":0,"expected":"5","useWildCards":false},{"conType":2,"compareType":0,"expected":"6","useWildCards":false}]}],"filteredColumns":[0],"filterButtonVisibleInfo":{"0":true},"showFilterButton":true,"filteredOutRows":[2]},"outlineColumnOptions":{},"autoMergeRangeInfos":[],"shapeCollectionOption":{"snapMode":0},"printInfo":{"paperSize":{"width":850,"height":1100,"kind":1}},"index":0,"order":0}},"sheetTabCount":0,"namedPatterns":{},"pivotCaches":{}})

spread.options.pasteSkipInvisibleRange = true
spread.bind(GC.Spread.Sheets.Events.ClipboardPasting, function (e, info) {
    console.log(info)
    info.sheet.suspendPaint()
    let range = info.cellRange
    let hiddenRows = []
    for (let row = range.row; row < range.row + range.rowCount; row++) {
        // 是否可见？
        let visible = info.sheet.getRowVisible(row)
        // 如果可见，则不做任何处理，跳过
        if (visible) {
            continue
        }

        // 不可见时，判断是不是通过筛选使其不可见
        // sheet和table都有rowFilter，要遍历
        let filters = []
        if (info.sheet.rowFilter()) {
            filters.push(info.sheet.rowFilter())
        }
        // 这里还应该考虑table的filter，但是目前有点问题，暂时注释
        // info.sheet.tables.all().forEach(t => {
        //     filters.push(t.rowFilter())
        // })
        let rowFilterdOut = false
        for (let i = 0; i < filters.length; i++) {
            let filter = filters[i]
            let out = filter.isRowFilteredOut(row)
            // 如果这一行被筛选了，则记录下来
            if (out) {
                rowFilterdOut = true
            }
        }
        // 如果这一行不是被筛选掉的，那就是被隐藏了，记录下来，取消隐藏，粘贴完成之后再重新隐藏
        if (!rowFilterdOut) {
            hiddenRows.push(row)
        }
    }
    console.log(hiddenRows)
    // 取消隐藏，以便粘贴
    hiddenRows.forEach(row => {
        info.sheet.setRowVisible(row, true)
    })

    setTimeout(() => {
        // 重新隐藏
        hiddenRows.forEach(row => {
            info.sheet.setRowVisible(row, false)
        })
        info.sheet.resumePaint()
    }, 0);
})

