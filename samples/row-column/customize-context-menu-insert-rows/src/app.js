import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";
/**
 * 点击行头右键菜单，实现插入多行
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
  sheetCount: 1,
});
let sheet = spread.getActiveSheet();
sheet.setValue(5, 0, "←请在此点击鼠标右键查看");
sheet.setRowCount(10);
//获取命令管理器
let commandManager = spread.commandManager();
//定义一个menuData对象，将其添加到spread菜单项列表中
let insertRows = {
  text: "插入多行",
  name: "insertRows",
  command: "rowsCount",
  workArea: "rowHeader",
};
spread.contextMenu.menuData.push(insertRows);

// 插入多行操作
let insertRowsByCounts = {
  //该操作不可回滚
  canUndo: false,
  //在选定行之后插入n行
  execute: function (spread, options) {
    if (options.commandOptions) {
      var sheet = spread.getSheetFromName(options.sheetName);
      sheet.suspendPaint();
      sheet.addRows(options.activeRow, parseInt(options.commandOptions));
      sheet.resumePaint();
    }
  },
};
// 向命令管理器注册插入多行的命令
commandManager.register(
  "rowsCount",
  insertRowsByCounts,
  null,
  false,
  false,
  false,
  false,
);

//定义一个菜单试图的构造函数
function CustomMenuView() {}
//继承默认的MenuView类
CustomMenuView.prototype = new GC.Spread.Sheets.ContextMenu.MenuView();
//创建菜单视图项
CustomMenuView.prototype.createMenuItemElement = function (menuItemData) {
  let self = this;
  if (menuItemData.name === "insertRows") {
    let containers =
      GC.Spread.Sheets.ContextMenu.MenuView.prototype.createMenuItemElement.call(
        self,
        menuItemData,
      );
    let supMenuItemContainer = containers[0];
    let inputBlock = createInput();
    supMenuItemContainer.appendChild(inputBlock);
    return supMenuItemContainer;
  } else {
    let menuItemView =
      GC.Spread.Sheets.ContextMenu.MenuView.prototype.createMenuItemElement.call(
        self,
        menuItemData,
      );
    return menuItemView;
  }
};
CustomMenuView.prototype.getCommandOptions = function (
  menuItemData,
  host,
  event,
) {
  if (menuItemData && menuItemData.name === "insertRows") {
    // var ele = event.target || event.srcElement;
    let ele = document.getElementsByClassName("inputBlock")[0];
    return ele.value;
  }
};
spread.contextMenu.menuView = new CustomMenuView();

//创建一个input 用以显示要增加的行数
function createInput() {
  var inputBlock = document.createElement("input");
  inputBlock.className = "inputBlock";
  inputBlock.style = "width: 40px";
  inputBlock.type = "number";
  inputBlock.defaultValue = 3;
  inputBlock.min = 1;
  inputBlock.onclick = function (ev) {
    if (ev.target) {
      ev.stopPropagation();
    }
  };
  inputBlock.onkeydown = function (ev) {
    if (ev.key === "Enter") {
      console.log(ev);
      this.parentNode.click();
      ev.stopPropagation();
    }
  };
  return inputBlock;
}
