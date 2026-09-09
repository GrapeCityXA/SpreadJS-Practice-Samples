import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));


spread.bind(GC.Spread.Sheets.Events.ValueChanged, function (sender, args) {
    let str = args.newValue;
    if (str.indexOf("\n") >= 0) {
        args.sheet.getCell(args.row, args.col).wordWrap(true);
        args.sheet.autoFitRow(args.row);
    }
});
