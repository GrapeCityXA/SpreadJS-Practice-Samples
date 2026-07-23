import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";

var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getActiveSheet();

var command = {
  canUndo: false,
  execute: function (context, options, isUndo) {
    var Commands = GC.Spread.Sheets.Commands;
    if (isUndo) {
      Commands.undoTransaction(context, options);
      return true;
    } else {
      Commands.startTransaction(context, options);
      var selection = sheet.getSelections()[0];
      var r = selection.row;
      var c = selection.col;
      var rc = selection.rowCount;
      var cc = selection.colCount;
      // 获取删除前单元格(区域)的value
      var arr = sheet.getArray(r, c, rc, cc);
      console.log(arr);
      alert("被删除的内容为：" + JSON.stringify(arr));
      // 执行删除命令(以删除单个单元格为例)
      sheet.clear(
        r,
        c,
        rc,
        cc,
        GC.Spread.Sheets.SheetArea.viewport,
        GC.Spread.Sheets.StorageType.data,
      );

      Commands.endTransaction(context, options);
      return true;
    }
  },
};

spread.commandManager().register("deleteCommand", command);
spread
  .commandManager()
  .setShortcutKey(
    "deleteCommand",
    GC.Spread.Commands.Key.del,
    false,
    false,
    false,
    false,
  );
