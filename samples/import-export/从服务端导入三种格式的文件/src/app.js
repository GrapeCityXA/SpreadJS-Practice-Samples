import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-io"


let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

// sjs导入
document.getElementById("sjs").addEventListener("click", function () {
    let xhr = new XMLHttpRequest()
    xhr.open("get", "./static/test.sjs")
    xhr.responseType = "blob"
    xhr.addEventListener("loadend", function () {
        if (this.readyState == 4 && this.status == 200) {
            let file = new File([this.response],'test.sjs')
            // 也可以封装成blob，spread.open()中直接传递blob即可
            // var blob = new Blob([this.response], {type:'application/zip'});
            spread.open(file)
        }
    })
    xhr.send()
})

// excel导入
document.getElementById("excel").addEventListener("click", function () {
    let xhr = new XMLHttpRequest()
    xhr.open("get", "./static/test.xlsx")
    xhr.responseType = "blob"
    xhr.addEventListener("loadend", function () {
        if (this.readyState == 4 && this.status == 200) {
            let file = new File([this.response], "test.xlsx")
            //对于chrome浏览器，import第一个参数直接传递this.response也可以，safari则会报错，必须传递file。
            spread.import(file, function() {}, function() {}, {
                fileType: GC.Spread.Sheets.FileType.excel
            })
        }
    })
    xhr.send()
})

// ssjson导入
document.getElementById("ssjson").addEventListener("click", function () {
    let xhr = new XMLHttpRequest()
    xhr.open("get", "./static/test.ssjson")
    xhr.responseType = "blob"
    xhr.addEventListener("loadend", function () {
        if (this.readyState == 4 && this.status == 200) {
            let file = new File([this.response], "test.ssjson")
            //import方法中第一个参数直接使用this.response也可
            spread.import(file, function() {}, function() {}, {
                fileType: GC.Spread.Sheets.FileType.ssjson
            })
        }
    })
    xhr.send()
})