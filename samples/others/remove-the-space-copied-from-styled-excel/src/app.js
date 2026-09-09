import * as GC from "@grapecity-software/spread-sheets";


const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();


let clipPasted = false;
let pasteRange;
let copiedText = "";

sheet.bind(GC.Spread.Sheets.Events.ClipboardPasted, function (sender, args) {
    clipPasted = false;

    if (args.pasteData.html != "" && args.pasteData.text != "") {
        clipPasted = true;
        pasteRange = args.cellRange;
    }

    if (!navigator.clipboard) {
        setTextArray(copiedText);
    }
});

spread.getHost().addEventListener('paste', function (event) {
    if (!navigator.clipboard) {
        if (event.clipboardData) {
            // Classic Edge
            copiedText = event.clipboardData.getData('text');
        } else {
            // IE11
            copiedText = window.clipboardData.getData('text');
        }

        return;
    }

    if (!clipPasted) return;

    // Chrome, FireFox
    let paste = (event.clipboardData || window.clipboardData).getData('text');
    setTextArray(paste);
});

function setTextArray(paste) {
    let textArray = [];
    let copyText = paste.split('\n');

    for (let i = 0; i < pasteRange.rowCount; i++) {
        let copyRow = copyText[i].replace(/\r/, "").split('\t');
        for (let j = 0; j < copyRow.length; j++) {
            if (copyRow[j] === "") {
                copyRow[j] = null;
            }
        }
        textArray.push(copyRow);
    }

    sheet.suspendPaint();
    sheet.suspendDirty();
    sheet.suspendEvent();

    sheet.setArray(pasteRange.row, pasteRange.col, textArray);

    sheet.resumeEvent();
    sheet.resumeDirty();
    sheet.resumePaint();
}