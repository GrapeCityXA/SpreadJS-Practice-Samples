import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";
function MyCheckBoxCellType() {
  GC.Spread.Sheets.CellTypes.CheckBox.apply(this);
  this.caption("All");
}
MyCheckBoxCellType.prototype = new GC.Spread.Sheets.CellTypes.CheckBox();
var basePaint = GC.Spread.Sheets.CellTypes.CheckBox.prototype.paint;
MyCheckBoxCellType.prototype.paint = function (
  ctx,
  value,
  x,
  y,
  width,
  height,
  style,
  context,
) {
  //var tag = context.sheet.getColumn(context.col,context.sheetArea).tag();
  var tag = context.sheet.getTag(context.row, context.col, context.sheetArea);
  if (tag !== true) {
    tag = false;
  }
  basePaint.apply(this, [ctx, tag, x, y, width, height, style, context]);
};
MyCheckBoxCellType.prototype.getHitInfo = function (
  x,
  y,
  cellStyle,
  cellRect,
  context,
) {
  if (context) {
    return {
      x: x,
      y: y,
      row: context.row,
      col: context.col,
      cellRect: cellRect,
      sheetArea: context.sheetArea,
      isReservedLocation: true,
      sheet: context.sheet,
    };
  }
  return null;
};
MyCheckBoxCellType.prototype.createEditorElement = function () {
  return null;
};
MyCheckBoxCellType.prototype.processMouseUp = function (hitInfo) {
  var sheet = hitInfo.sheet,
    row = hitInfo.row,
    col = hitInfo.col,
    sheetArea = hitInfo.sheetArea;

  if (
    sheet.getCell(0, 0, GC.Spread.Sheets.SheetArea.colHeader).locked() &&
    sheet.options.isProtected
  ) {
    return;
  }

  var tag = sheet.getTag(row, col, sheetArea);
  //var tag = sheet.getColumn(col,sheetArea).tag();
  if (tag === undefined || tag === null) {
    //first time
    sheet.setTag(row, col, true, sheetArea);
    //sheet.getColumn(col,sheetArea).tag(true)
  } else {
    sheet.setTag(row, col, !tag, sheetArea);
    //sheet.getColumn(col,sheetArea).tag(!tag)
  }
  //add your code here
  tag = sheet.getTag(row, col, sheetArea);
  //tag = sheet.getColumn(col,sheetArea).tag();
  // sheet.setValue(-1, 0, tag);
  sheet.suspendPaint();
  for (var i = 0; i < sheet.getRowCount(); i++) {
    var cell = sheet.getCell(i, col);
    if (cell.cellType() instanceof GC.Spread.Sheets.CellTypes.CheckBox) {
      cell.value(tag);
    }
  }
  sheet.resumePaint();
};
var spread = new GC.Spread.Sheets.Workbook($("#ss").get(0), {
  sheetCount: 1,
});
var sheet = spread.getActiveSheet();

sheet.setCellType(
  0,
  0,
  new MyCheckBoxCellType(),
  GC.Spread.Sheets.SheetArea.colHeader,
);

for (var i = 0; i < 8; i++) {
  var c = new GC.Spread.Sheets.CellTypes.CheckBox();
  c.textAlign(GC.Spread.Sheets.CellTypes.CheckBoxTextAlign.right);
  sheet.setCellType(i, 0, c, GC.Spread.Sheets.SheetArea.viewport);
}

spread.bind(GC.Spread.Sheets.Events.ButtonClicked, function (e, args) {
  var sheet = args.sheet,
    row = args.row,
    col = args.col;
  var cellType = sheet.getCellType(row, col);
  if (cellType instanceof GC.Spread.Sheets.CellTypes.CheckBox) {
    var colHeaderCell = (cellType = sheet.getCell(
      0,
      col,
      GC.Spread.Sheets.SheetArea.colHeader,
    ));
    if (colHeaderCell.cellType() instanceof MyCheckBoxCellType) {
      var checkStatus = true;
      for (var i = 0; i < sheet.getRowCount(); i++) {
        var cell = sheet.getCell(i, col);
        if (
          cell.cellType() instanceof GC.Spread.Sheets.CellTypes.CheckBox &&
          !cell.value()
        ) {
          checkStatus = false;
          break;
        }
      }
      colHeaderCell.tag(checkStatus);
      sheet.repaint();
    }
  }
});
