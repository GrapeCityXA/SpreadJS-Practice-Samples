import * as GC from "@grapecity-software/spread-sheets";


// GC.Spread.Sheets.Designer.LicenseKey = "GrapeCity-Internal-Use-Only,E355896284189812#B1M13dpBlIbpjInxmZiwSZzxWYmpjIyNHZisnOiwmbBJye0ICRiwiI34TUUhFMMNzdNpkVu3CNZ5kQmpFRyAzYilFeTNEcWp6QHZ7NXVXRKdTdXFWYLlWWBN6Kv2We9MDNS3Ce63ydlFme6cHeFtGMGZWUOdVZi3kcwFlMyhFREFnbrlzR4tET5oGajdmMpFXMkR6QMpWR8gHbJ54LCd6Qz36b7Z7RGVDcuNleiB7UvAVcnJmcWhnQIRUWYtERCNWYQ94RqlmTzc7Tvt4M8d6UoF6KqJ5aPVUUG9mWKZncON6LMdlbv8keX9UWsJnc9UlVyNlcQRmT63SRKJDdshWQJdzNoJDbM5GZjJmWYJDOy44dpxGOyVzRjV6Q8EUTRlHWyd4d72UTQh7U8gUZLllTE9EeuZWRpJzZZdjRZRlVGFmd4IVcZV6QmRkQzxEMMdlVB96MGpXdH9WazZFNsdUeLdzc8Bjcj9UT4lXOTdXb8tiSzU5Qv2EdWRGOCZGR7ZlI0IyUiwiIwEDOEVUQ7cjI0ICSiwCO9YDNxMDMxgTM0IicfJye#4Xfd5nILRVOGJiOiMkIsISOx8idgkiTDhibvRGZB5icl96ZpNXZE5yUKRWYlJHcTJiOi8kI1tlOiQmcQJCLiMDNzMTMwACOwUDM6IDMyIiOiQncDJCLiMXduMXdpN6cl5mLqwCcvRnLzVXajNXZt9iKsAnauMXdpN6cl5mLqwybp9yc5l6YzVWbuoCLt36YuMXdpN6cl5mLqwicr9ybj9yc5l6YzVWbuoCLwpmLvNmLzVXajNXZt9iKs46bj9idlRWe4l6YlBXYydmLqwibj9SbvNmL9RXajVGchJ7ZuoCLt36YukHdpNWZwFmcn9iKsI7au26YukHdpNWZwFmcn9iKsAnau26YukHdpNWZwFmcn9iKiojIz5GRiwiIzx6bvRlclB7bsVmdlRkI0ISYONkIsUWdyRnOik6YBJCLlVnc4pjIsZXRiwiIyEDO9gTM4gjM6kDO5UzMiojIklkIs4XXiQnchh6QhRXYEJCLiQXZlh6U4RnbhdkIsIibvlGdhJ7biFGbs36QiwiIJFkIsICdlVGaTRncvBXZSJCLiUGbgFIV";

let spread = new GC.Spread.Sheets.Workbook("designer-container")
// let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

let table = sheet.tables.add("table1", 1, 1, 3, 4)
sheet.addSpan(2, 2, 1, 2)
sheet.addSpan(3, 2, 1, 2)
sheet.addSpan(4, 2, 1, 2)
sheet.addSpan(5, 2, 1, 2)
sheet.addSpan(6, 2, 1, 2)
sheet.addSpan(7, 2, 1, 2)
sheet.addSpan(8, 0, 1, 15)
sheet.setValue(8,0,"当table中存在合并单元格，且table下方存在横跨表格的合并单元格时，默认无法通过tab新增表格行")

let selectionChanged = false
let oldSelection, newSelection, curSheet
window.addEventListener('keydown', function (e) {
    if (!selectionChanged || e.key !== 'Tab') {
        return
    }
    // 到这里就证明是通过按下Tab键改变了当前活动的单元格
    // 接下来就判断如果之前的单元格属于一个表格，并且当前的单元格不属于表格，则resize表格，使其向下扩展一行
    let table = curSheet.tables.find(oldSelection.row, oldSelection.col)
    // 如果按tab之前不是表格，则return
    if (!table) {
        return
    }
    let _table = curSheet.tables.find(newSelection.row, newSelection.col)
    // 如果按tab之后是表格，也return
    if (_table) {
        return
    }
    let range = table.range()
    curSheet.tables.resize(table, new GC.Spread.Sheets.Range(range.row, range.col, range.rowCount + 1, range.colCount))
}, true);

spread.bind(GC.Spread.Sheets.Events.SelectionChanged, function (e, info) {
    // 如果之前选择的区域大于1个单元格，或者选择了多个区域，那么按下tab时不应该新增表格行
    if (info.oldSelections.length > 1) {
        return
    }
    if (info.oldSelections[0].rowCount > 1 || info.oldSelections[0].colCount > 1) {
        return
    }
    if (info.newSelections[0].rowCount > 1 || info.newSelections[0].colCount > 1) {
        return
    }

    if(info.newSelections[0].row - info.oldSelections[0].row != 1) {
        return
    }

    oldSelection = info.oldSelections[0]
    newSelection = info.newSelections[0]
    curSheet = info.sheet
    selectionChanged = true

    setTimeout(() => {
        selectionChanged = false
    }, 0);
})

