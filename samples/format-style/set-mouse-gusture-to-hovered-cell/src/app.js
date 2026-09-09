import * as GC from "@grapecity-software/spread-sheets";

var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
initSpread(spread)
function initSpread(spread) {

    var sheet = spread.getSheet(0);
    sheet.suspendPaint();

    function RaidoButtonCellType(items, size, isHorizontal) {
        this.typeName = "RaidoButtonCellType";
    }
    RaidoButtonCellType.prototype = new GC.Spread.Sheets.CellTypes.RadioButtonList();
    RaidoButtonCellType.prototype.processMouseMove = function (hitInfo) {
        var sheet = hitInfo.sheet;
        var div = sheet.getParent().getHost();
        var canvasId = div.id + "vp_vp";
        var canvas = div.querySelector("#" + canvasId);
        if (sheet && hitInfo.isReservedLocation) {
            canvas.style.cursor = 'pointer';
            return true;
        } else {
            canvas.style.cursor = 'default';
        }
        return false;
    };

    var radio = new RaidoButtonCellType();

    radio.items([
        { text: "sample1", value: "0" },
        { text: "sample2", value: "1" },
        { text: "sample3", value: "2" },
    ]);
    sheet.setCellType(0, 1, radio);
    sheet.defaults.rowHeight = 50;
    sheet.defaults.colWidth = 200;

    sheet.resumePaint();
};
