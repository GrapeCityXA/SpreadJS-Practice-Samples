import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-io";
import "@grapecity-software/spread-sheets-charts";



let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

document.getElementById("excel").addEventListener("click", function () {
    let progressElement = document.querySelector("#progress")
    let modalElement = document.querySelector(".modal")
    progressElement.style.display = "block"
    modalElement.style.display = "block"
    let xhr = new XMLHttpRequest()
    xhr.open("get", "./static/template.xlsx")
    xhr.responseType = "blob"
    xhr.addEventListener("loadend", function () {
        if (this.readyState == 4 && this.status == 200) {
            spread.import(this.response, function () { }, function () { }, {
                fileType: GC.Spread.Sheets.FileType.excel,
                progress: function (arg) {
                    showProgress(arg, progressElement, modalElement)
                }
            })
        }
    })
    xhr.send()
})


function showProgress(arg, progressElement, modalElement) {
    progressElement.value = Math.floor(arg.progress * 100)
    console.log(progressElement.value)
    if (progressElement.value == 100) {
        progressElement.style.display = "none"
        modalElement.style.display = "none"
        progressElement.value = 0
    }
}
