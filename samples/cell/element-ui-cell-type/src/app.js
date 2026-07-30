import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet();

function HyperLinkCellType() {
  // 自定义一个单元格类型
  this._width = 0;
}

HyperLinkCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();

HyperLinkCellType.prototype.paint = function (
  ctx,
  value,
  x,
  y,
  w,
  h,
  style,
  context,
) {
  // 默认修改单元格对齐方式
  style.hAlign = GC.Spread.Sheets.HorizontalAlign.center;
  style.vAlign = GC.Spread.Sheets.VerticalAlign.center;
  this._width = w;
  // 继承原逻辑
  GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(
    this,
    ctx,
    value,
    x,
    y,
    w,
    h,
    style,
    context,
  );
};

HyperLinkCellType.prototype.getHitInfo = function (
  x,
  y,
  cellStyle,
  cellRect,
  context,
) {
  // 获取有用的命中信息，后边加鼠标事件时要用到
  var info = {
    x: x,
    y: y,
    row: context.row,
    col: context.col,
    cellStyle: cellStyle,
    cellRect: cellRect,
    sheetArea: context.sheetArea,
  };
  if (
    x >= cellRect.x &&
    x <= cellRect.x + this._width &&
    y >= cellRect.y &&
    y <= cellRect.y + cellRect.height
  ) {
    // 自己加一个标志，判断是不是目标区域
    info.isReservedLocation = true;
  }
  return info;
};

// 处理指针形状及变色
HyperLinkCellType.prototype.processMouseMove = function (hitInfo) {
  var { sheet, row, col } = hitInfo;
  sheet.getCell(row, col).foreColor("#66b1ff");
  var div = sheet.getParent().getHost();
  var canvasId = div.id + "vp_vp";
  var canvas = document.getElementById(canvasId);
  if (sheet && hitInfo.isReservedLocation) {
    canvas.style.cursor = "pointer";
    return true;
  } else {
    canvas.style.cursor = "default";
  }
  return false;
};

HyperLinkCellType.prototype.processMouseUp = function (hitInfo) {
  var sheet = hitInfo.sheet;
  if (sheet && hitInfo.isReservedLocation) {
    var { row, col } = hitInfo;
    // 在这里可以做一些操作,例如删除数据，修改数据等等
    alert(`你正在操作的单元格是：${row},${col}`);
    return true;
  }
  return false;
};

HyperLinkCellType.prototype.processMouseLeave = function (hitInfo) {
  var sheet = hitInfo.sheet;
  if (sheet && hitInfo.isReservedLocation) {
    var { row, col } = hitInfo;
    // 变一个文字颜色
    sheet.getCell(row, col).foreColor("#409eff");
    return true;
  }
  return false;
};

let linkCell = new HyperLinkCellType();

let sheet = spread.getActiveSheet();
sheet.defaults.rowHeight = 40;
sheet
  .getRange(0, 0, 3, 3)
  .cellType(linkCell)
  .value("编辑")
  .foreColor("#409eff");
