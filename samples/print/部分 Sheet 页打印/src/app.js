import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-resources-zh";
import "@grapecity-software/spread-sheets-print";



/**
 * 实现按需打印sheet
 */
GC.Spread.Common.CultureManager.culture('zh-cn');
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'),{
    sheetCount: 5
});
let sheet1 = spread.getSheet(0);
let sheet2 = spread.getSheet(1);
let sheet3 = spread.getSheet(2);
sheet1.setValue(0, 0, "SUM:");
sheet1.setFormula(0, 1, "=SUM(Sheet3!A1:Sheet3!A5)");
sheet1.setValue(1, 0, "AVERAGE:");
sheet1.setFormula(1, 1, "=AVERAGE(Sheet3!A1:Sheet3!A5)");
sheet2.setValue(0, 0, "SUM:");
sheet2.setFormula(0, 1, "=SUM(Sheet3!B1:Sheet3!B5)");
sheet2.setValue(1, 0, "AVERAGE:");
sheet2.setFormula(1, 1, "=AVERAGE(Sheet3!B1:Sheet3!B5)");
sheet3.setValue(0, 0, 1);
sheet3.setValue(1, 0, 2);
sheet3.setValue(2, 0, 3);
sheet3.setValue(3, 0, 4);
sheet3.setValue(4, 0, 5);
sheet3.setValue(0, 1, 1);
sheet3.setValue(1, 1, 5);
sheet3.setValue(2, 1, 10);
sheet3.setValue(3, 1, 15);
sheet3.setValue(4, 1, 20);

//打印按钮绑定点击事件
document.getElementById("print").onclick = function() {
    let printSheets = document.getElementById("printSheet").value;
    if (printSheets.length != 0) {
        let printSheetArr = printSheets.split(',');
        myprint(printSheetArr);
    } else {
        myprint(null);
    }
}

//具体打印逻辑
function myprint(index) {
    //默认打印所有页
    if (index == null) {
        console.log(index)
        spread.print();
    } else {
        //新拷贝一个临时的工作薄 仅将需要打印的sheet设置可见
        let tempSpread = new GC.Spread.Sheets.Workbook();
        tempSpread.fromJSON(JSON.parse(JSON.stringify(spread.toJSON())));
        for (let i = 0; i < tempSpread.getSheetCount(); i++) {
            let visibleSheet = tempSpread.getSheet(i);
            visibleSheet.visible(false);
        }
        for (let i = 0; i < index.length; i++) {
            let visibleSheet = tempSpread.getSheet(parseInt(index[i]));
            visibleSheet.visible(true);
        }
        tempSpread.print();
    }
}