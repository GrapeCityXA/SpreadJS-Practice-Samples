import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";

import { del, moveup, movedown } from "./img.js";
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

function hoverCellType() {}
hoverCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();
hoverCellType.prototype.processMouseMove = function (hitInfo) {
  if (!hitInfo.cellButtonHitInfo?.buttonConfig?.hoverText) {
    if (this._toolTipElement) {
      this._toolTipElement.style.display = "none";
    }
    return;
  }
  let containerPosition = {
    left: hitInfo.sheet.getParent().getHost().getBoundingClientRect().left,
    top: hitInfo.sheet.getParent().getHost().getBoundingClientRect().top,
  };
  let hoverText = hitInfo.cellButtonHitInfo.buttonConfig.hoverText;
  if (this._toolTipElement) {
    this._toolTipElement.innerText = hoverText;
    this._toolTipElement.style.top =
      hitInfo.y + containerPosition.top - 40 + "px";
    this._toolTipElement.style.left =
      hitInfo.x + containerPosition.left - 30 + "px";
    this._toolTipElement.style.display = "block";
  } else {
    let div = document.createElement("div");
    div.style.position = "absolute";
    div.style.border = "1px #C0C0C0 solid";
    div.style.boxShadow = "1px 2px 5px rgba(0,0,0,0.4)";
    div.style.font = "9pt Arial";
    div.style.background = "white";
    div.style.padding = "5px";

    this._toolTipElement = div;
    this._toolTipElement.innerText = hoverText;
    this._toolTipElement.style.top = hitInfo.y + 15 + "px";
    this._toolTipElement.style.left = hitInfo.x + 15 + "px";
    this._toolTipElement.style.display = "none";
    document.body.insertBefore(this._toolTipElement, null);
    this._toolTipElement.style.display = "block";
  }
  changeCursor(true);
};
hoverCellType.prototype.processMouseLeave = function () {
  if (this._toolTipElement) {
    this._toolTipElement.style.display = "none";
    changeCursor();
  }
};

// 新增鼠标移入改变为pointer样式的功能
function changeCursor(type = false) {
  let canvas = document.querySelector(
    "canvas[gcuielement='gcWorksheetCanvas']",
  );
  if (type) {
    canvas.classList.add("pointer");
  } else {
    canvas.classList.remove("pointer");
  }
}

function setCellButtons(sheet, row, col, cellButtons) {
  let style = new GC.Spread.Sheets.Style();
  style.cellButtons = cellButtons;
  sheet.setStyle(row, col, style);
  sheet.setCellType(row, col, new hoverCellType());
}

// 这里就是你的btnArr
let cellButtons = [
  {
    imageType: GC.Spread.Sheets.ButtonImageType.custom,
    hoverText: "删除",
    imageSrc: del,
    command: (sheet, row, col, option) => {
      alert("点击删除");
    },
  },
  {
    imageType: GC.Spread.Sheets.ButtonImageType.custom,
    hoverText: "向上移动",
    imageSrc: moveup,
    command: (sheet, row, col, option) => {
      alert("上移");
    },
  },
  {
    imageType: GC.Spread.Sheets.ButtonImageType.custom,
    hoverText: "下移",
    imageSrc: movedown,
    command: (sheet, row, col, option) => {
      alert("下移");
    },
  },
];
// 将sheet/row/col/cellButtons传入这个函数就好了
setCellButtons(spread.getActiveSheet(), 1, 1, cellButtons);
