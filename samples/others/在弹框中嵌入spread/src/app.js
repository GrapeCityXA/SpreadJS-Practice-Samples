import * as GC from "@grapecity-software/spread-sheets";
var btn = document.getElementById('open_btn');
var div = document.getElementById('background');
var close = document.getElementById('close-button');

btn.onclick = function show() {
    div.style.display = "block";
}

close.onclick = function close() {
    div.style.display = "none";
}

window.onclick = function close(e) {
    if (e.target == div) {
        div.style.display = "none";
    }
}
// host the workbook control in a DIV element with id "ss"
var spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'), {
    sheetCount: 1
});

/*
 * retrieve the spread workbook object from the host element using findControl static method.
 * var spread = GC.Spread.Sheets.findControl(document.getElementById('ss'));
 */
initSpread(spread);
function initSpread(spread) {

    var sheet = spread.getActiveSheet();
    //Add text to first cell
    sheet.setValue(0, 0, "Hello World!");
}