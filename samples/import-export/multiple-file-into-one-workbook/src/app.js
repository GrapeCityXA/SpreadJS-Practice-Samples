import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-io";


var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
    sheetCount: 1
});

function importExcels(spread, index, files, count) {
    let file = files[index];
    var tempSpread = new GC.Spread.Sheets.Workbook();
    tempSpread.import(file, function () {
        var tempSheet = tempSpread.getActiveSheet();
        tempSheet.name("Sheet" + (index + 1));
        spread.getSheet(index).fromJSON(tempSheet.toJSON())
        if (index < count) {
            importExcels(spread, index + 1, files, count);
        } else {
            spread.setActiveSheetIndex(0)
        }
    })
}

// 导入excel按钮
$("#loadExcel").click(function () {
    var excelFiles = document.getElementById("fileDemo").files;
    console.log(excelFiles)
    if (excelFiles.length > 0) {
        spread.setSheetCount(excelFiles.length);
        importExcels(spread, 0, excelFiles, excelFiles.length)
    }

});

// 导出workbook按钮
$("#saveExcel").click(function () {
    var fileName = $("#exportFileName").val();
    if (fileName.substr(-5, 5) !== '.xlsx') {
        fileName += '.xlsx';
    }
    spread.export(function (blob) {
        saveAs(blob, fileName);
    }, function (e) {
        // process error
    });
});

// 导出activeSheet按钮
$("#saveActiveSheet").click(function () {
    var fileName = $("#exportFileName").val();
    if (fileName.substr(-5, 5) !== '.xlsx') {
        fileName += '.xlsx';
    }
    var json = JSON.stringify(spread.toJSON());

    var tempSpread = new GC.Spread.Sheets.Workbook();
    tempSpread.fromJSON(JSON.parse(json));
    var index = tempSpread.getActiveSheetIndex();
    for (var i = tempSpread.getSheetCount() - 1; i > index; i--) {
        tempSpread.removeSheet(i);
    }
    for (var i = 0; i < index; i++) {
        tempSpread.removeSheet(0);
    }
    tempSpread.export(function (blob) {
        saveAs(blob, fileName);
    }, function (e) {
        // process error
    });
});