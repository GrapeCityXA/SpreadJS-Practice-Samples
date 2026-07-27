import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";
var WarningCellType = function (icon) {
  this.icon = icon;
};
WarningCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();
WarningCellType.prototype.paint = function (
  ctx,
  value,
  x,
  y,
  w,
  h,
  style,
  context,
) {
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
  ctx.drawImage(this.icon, x + w - h + 3, y + 3, h - 6, h - 6);
};

var IconCellType = function (icon, count, infos) {
  this.icon = icon;
  this.count = count;
  this.Infos = infos;
};
IconCellType.prototype = new GC.Spread.Sheets.CellTypes.Base();
IconCellType.prototype.paint = function (
  ctx,
  value,
  x,
  y,
  w,
  h,
  style,
  context,
) {
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
  for (var i = 1; i <= this.count; i++) {
    ctx.drawImage(this.icon, x + w - (h - 3) * i, y + 3, h - 6, h - 6);
  }
};
IconCellType.prototype.getHitInfo = function (
  x,
  y,
  cellStyle,
  cellRect,
  context,
) {
  var index =
    x - (cellRect.x + cellRect.width - (cellRect.height - 3) * this.count) > 0
      ? Math.floor(
          (x -
            (cellRect.x +
              cellRect.width -
              (cellRect.height - 3) * this.count)) /
            (cellRect.height - 3),
        )
      : -1;
  return {
    x: x,
    y: y,
    row: context.row,
    col: context.col,
    cellStyle: cellStyle,
    cellRect: cellRect,
    sheetArea: context.sheetArea,
    reservedLocationIndex: index,
  };
};
IconCellType.prototype.processMouseMove = function (hitinfo) {
  if (hitinfo.reservedLocationIndex >= 0) {
    if (this._toolTipElement) {
      $(this._toolTipElement)
        .text(
          "move in " +
            hitinfo.reservedLocationIndex +
            " and Info is" +
            this.Infos[hitinfo.reservedLocationIndex],
        )
        .css("top", hitinfo.y + 15)
        .css("left", hitinfo.x + 15);
    } else {
      var div = document.createElement("div");
      $(div)
        .css("position", "absolute")
        .css("border", "1px #C0C0C0 solid")
        .css("box-shadow", "1px 2px 5px rgba(0,0,0,0.4)")
        .css("font", "9pt Arial")
        .css("background", "white")
        .css("padding", 5);

      this._toolTipElement = div;
      $(this._toolTipElement)
        .text("Cell [R:" + hitinfo.row + "] : [C:" + hitinfo.col + "]")
        .css("top", hitinfo.y + 15)
        .css("left", hitinfo.x + 15);
      $(this._toolTipElement).hide();
      document.body.insertBefore(this._toolTipElement, null);
      $(this._toolTipElement).show("fast");
    }
  } else {
    if (this._toolTipElement) {
      document.body.removeChild(this._toolTipElement);
      this._toolTipElement = null;
    }
  }
};
IconCellType.prototype.processMouseLeave = function (hitinfo) {
  if (this._toolTipElement) {
    document.body.removeChild(this._toolTipElement);
    this._toolTipElement = null;
  }
};
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
  sheetCount: 2,
});
var sheet = spread.getActiveSheet();
var img = new Image();
img.src =
  "data:img/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAlCAIAAABK/LdUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAKWSURBVFhH7ZX7T5JRGMf9v1przZZdt66T1DDnWlNnkYvyMkHUZvNCmoWJiOQQoeUFzVJwEVoaLi+zqExns5qXFBTLJATXkzyzt+flvGOzH/zh/ez7C+f5fs/Le97znBMjIiKy6/nlDwy9cNdXdZRkG65frE6XlF5LrSqW62vLW/vso77lH+jbOcGNYJvpefIx1Yk9cpYksXmNmi7fCvOpP9f8MA/+EGBs6OOlMyVkdpYS4xS2Dhcmt1hdWXN0D6tVpqRDiqoiM46ycPaMkBmj0UND77c5b3/vWGVhc0Jc/vZ4fGwuzhuR8deT21auTu/LVlyuLVc2Fcn1SYeVpCosV99bnJ2P5EAecYNMuh7Pog8dW18FFvDs/hxiY6ks34hJgrneRqygNyNTWP6XhVnv+SPRvihmCAkH/657WNZmJ9YiAX+F+PnKz7xv0dsxwGXCPUOsF44XYo1NbrqGpECn9t7ISbvX3T44P+tBHx+njW5L2NBYY/O0dYCklDLt4sIylgWAc4Qka8pasMYG+oykjNpurLH4NDkL3SOTqkkyL6MGHWweaLpIqqG6E2uEqQ9fWoyOK9IKEuBq2bOKbgb8LQYdjDUu0LzEF1HCr1h3u5344SjAGqHgah2xslShbFr7vo4xDvCdiBNkNfdhmTDqmiBWAUFfP2p8Bof4zPS8e2z6ScvLzMRy4gHJktU4O59gMAS3CQmkniy+c9OSlVJJxqMRnMsCF9MfVFm6sFV6tEBf3Tk8+D4UCsH4Zmgz+tUOK+Nc6dzXpfC0TCbffdaq22CV/OsBHOLQanTwFyCiDHcfBwIbGNsJ3iWfpcHO78uw0uJv6Sqt0FTo/o/AVeDqd8MdBDvFZn014BiHjYM1ERGR3U1MzG/dmjY5fcSQGwAAAABJRU5ErkJggg==";
img.onload = function () {
  sheet.repaint();
};

sheet.getCell(1, 1).value(22).cellType(new WarningCellType(img)).hAlign(0);
sheet
  .getCell(2, 1)
  .cellType(new IconCellType(img, 3, ["First", "Second", "Third"]));
