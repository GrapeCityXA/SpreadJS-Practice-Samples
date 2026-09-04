import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));


window.addEventListener("paste", function (e) {
    var clipboardData = e.clipboardData;
    var blob = void 0, items = clipboardData.items;
    var text = clipboardData.getData('text/plain');
    let hasImg = false
    for (var i = 0; i < items.length; i++) {
        console.log(items[i].type)
        console.log(clipboardData.getData(items[i].type))
        if (items[i].type.indexOf("image") === 0) {
            blob = items[i].getAsFile();
            if (blob) {
                hasImg = true
                break;
            }
        }
    }
    if (hasImg) {
        if (text && (text.indexOf("图片") > -1 || text.toLowerCase().indexOf("dispimg") > -1)) {
            if (blob) {
                var reader = new FileReader();
                reader.onload = function (event) {
                    var img = new Image();
                    img.src = event.target.result;
                    console.log(img.src)
                    img.onload = function () {
                        let sheet = spread.getActiveSheet()
                        let row = sheet.getActiveRowIndex()
                        let col = sheet.getActiveColumnIndex()
                        // 单元格内图片
                        // 浮动图片交给spreadjs处理
                        sheet.setFormula(row, col, "image(\"" + img.src + "\")")
                    };
                };
                reader.readAsDataURL(blob);
            }
            return
        }
    }
}, true);
