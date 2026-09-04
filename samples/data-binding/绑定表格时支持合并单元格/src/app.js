import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-io";


let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet

let xhr = new XMLHttpRequest()
xhr.open("get", "t.ssjson")
xhr.responseType = "blob"
xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        spread.import(this.response, function () {
            sheet = spread.getActiveSheet()
            bindEvent()
        }, function () { }, {
            fileType: GC.Spread.Sheets.FileType.ssjson
        })
    }
}
xhr.send()

function bindData() {
    let initialData = {
        table: [{
            name: "张三",
            age: 33,
            gender: "男"
        }, {
            name: "李四",
            age: 34,
            gender: "男"
        }, {
            name: "王五",
            age: 35,
            gender: "男"
        }]
    }

    let source = new GC.Spread.Sheets.Bindings.CellBindingSource(initialData)
    sheet.setDataSource(source)
    sheet.tables.all().forEach(table => {
        let dr = table.range()
        let path = table.bindingPath()
        if (path && !initialData[path]) {
            initialData[path] = [{}]
        }
        for (let curRow = dr.row + 1; curRow < dr.row + dr.rowCount; curRow++) {
            sheet.copyTo(dr.row, dr.col, curRow, dr.col, 1, dr.colCount, GC.Spread.Sheets.CopyToOptions.style)
        }

        for (let col = dr.col; col < dr.col + dr.colCount;) {
            let span = sheet.getSpan(dr.row, col)
            console.log(span)
            if (span) {
                for (let rc = dr.row + 1; rc < dr.row + dr.rowCount; rc++) {
                    console.log(rc, col, span.rowCount, span.colCount)
                    sheet.addSpan(rc, col, span.rowCount, span.colCount)
                }
                col = col + span.colCount
            } else {
                col++
            }
        }
    })
}

function bindEvent() {
    spread.bind(GC.Spread.Sheets.Events.TableRowsChanged, function (e, data) {
        console.log(data)
        let table = data.table
        let dr = table.range()
        data.sheet.copyTo(dr.row, dr.col, dr.row + data.row + 1, dr.col, data.count, dr.colCount, GC.Spread.Sheets.CopyToOptions.style)
        for (let col = dr.col; col < dr.col + dr.colCount;) {
            let span = data.sheet.getSpan(dr.row, col)
            console.log(span)
            if (span) {
                for (let rc = 1; rc <= data.count + 1; rc++) {
                    data.sheet.addSpan(dr.row + data.row + rc, col, span.rowCount, span.colCount)
                }
                col = col + span.colCount
            } else {
                col++
            }
        }

    });
}

document.getElementById("bind").addEventListener("click", bindData)


