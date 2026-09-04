import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-shapes"


const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

spread.suspendPaint();
            

// 设置浮动元素
let customFloatingObject = new GC.Spread.Sheets.FloatingObjects.FloatingObject('f1');
customFloatingObject.startRow(1);
customFloatingObject.startColumn(1);
customFloatingObject.endColumn(6);
customFloatingObject.endRow(6);
let div = document.createElement('div');
div.innerHTML = "<div style=\"text-align: center; font-size: 26px;\">浮动对象无法拖动出灰色区域</div>";
div.style.background = '#409EFF';
customFloatingObject.content(div);
sheet.floatingObjects.add(customFloatingObject);

// 设置区域背景色
sheet.getRange(0, 0, 10 + 5, 10 + 5, GC.Spread.Sheets.SheetArea.viewport).backColor("#F2F3F5");
sheet.bind(GC.Spread.Sheets.Events.FloatingObjectChanged, function (e, info) {
    let floatingObject = info.floatingObject
    let x = floatingObject.x();
    let y = floatingObject.y();
    let rangeX = sheet.getColumnWidth(0) * 10;
    let rangeY = sheet.getRowHeight(0) * 10;
    // 限制单元格区域为10行、10列
    if (x > rangeX) {
        floatingObject.x(rangeX);
    } else if (y > rangeY) {
        floatingObject.y(rangeY);
    }
});

spread.resumePaint();


