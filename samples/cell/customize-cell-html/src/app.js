//Title: HTML元素单元格
//Description：设置HTML元素单元格
//Tag：HTML元素单元格
import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";
function HTMLCellType() {}
HTMLCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();
HTMLCellType.prototype.paint = function (
  ctx,
  value,
  x,
  y,
  w,
  h,
  style,
  context,
) {
  var DOMURL = window.URL || window.webkitURL || window;
  var cell = context.sheet.getCell(context.row, context.col);
  var img = cell.tag();
  if (img) {
    try {
      ctx.save();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.drawImage(img, x + 2, y + 2);
      ctx.restore();
      cell.tag(null);
      return;
    } catch (err) {
      GC.Spread.Sheets.CustomCellType.prototype.paint.apply(this, [
        ctx,
        "#HTMLError",
        x,
        y,
        w,
        h,
        style,
        context,
      ]);
      cell.tag(null);
      return;
    }
  }
  var svgPattern =
    '<svg xmlns="http://www.w3.org/2000/svg" width="{0}" height="{1}">' +
    '<foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="font:{2}">{3}</div></foreignObject></svg>';

  var data = svgPattern
    .replace("{0}", w)
    .replace("{1}", h)
    .replace("{2}", style.font)
    .replace("{3}", value);
  var doc = document.implementation.createHTMLDocument("");
  doc.write(data);
  // Get well-formed markup
  data = new XMLSerializer().serializeToString(doc.body.children[0]);

  img = new Image();
  var svg = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
  var url = DOMURL.createObjectURL(svg);
  img.src = url;
  cell.tag(img);
  img.onload = function () {
    context.sheet.repaint(new GC.Spread.Sheets.Rect(x, y, w, h));
  };
};
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
  sheetCount: 1,
});
var sheet = spread.getActiveSheet();
sheet.setColumnWidth(1, 300);
sheet.setRowHeight(1, 150);
sheet
  .getCell(1, 1)
  .cellType(new HTMLCellType())
  .value(
    '<h1 style="text-decoration: line-through;">Hello SpreadJS!</h1><h3>E=mc<sup>2</sup></h3><h2><em style="color:red">I</em> like ' +
      '<span style="color:white; text-shadow:0 0 2px blue;">' +
      'Javascript</span></h2><p>aaaa</p><img style="width:100px;height:100px;display:none;" src="https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA17SbZ4.img?w=612&h=304&q=90&m=6&f=jpg&u=t"/><p>aaaa</p>',
  )
  .wordWrap(true);
