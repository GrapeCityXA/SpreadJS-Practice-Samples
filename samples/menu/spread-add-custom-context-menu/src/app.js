import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

let oldF = spread.contextMenu.onOpenMenu;
spread.contextMenu.onOpenMenu = function (
  menuData,
  itemsDataForShown,
  hitInfo,
  spread,
) {
  itemsDataForShown.push(
    {
      text: "自定义右键菜单",
      name: "customContextMenu",
      command: "customCommand",
    },
    {
      text: "yustest",
      name: "customContextMenu",
      command: "customCommand",
    },
  );
  // 在第二行不可用
  let sel = spread.getActiveSheet().getSelections()[0];
  if (sel.row == 1) {
    itemsDataForShown.splice(0, itemsDataForShown.length);
  }
  oldF.apply(this, arguments);
};

spread.commandManager().register("customCommand", {
  canUndo: false,
  execute: function (spread, options) {
    console.log(arguments);
  },
});
