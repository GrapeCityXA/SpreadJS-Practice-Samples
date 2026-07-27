import * as GC from "@grapecity-software/spread-sheets";

const HIGHLIGHT_COLOR = "#a0cfff";
const HIGHLIGHT_Z_INDEX = 100;
const HIGHLIGHT_OPACITY = 0.4;
const BORDER_OFFSET = 2;

function setElsCommonStyle(els) {
  els.forEach((el) => {
    el.style.backgroundColor = HIGHLIGHT_COLOR;
    el.style.pointerEvents = "none";
    el.style.position = "absolute";
    el.style.zIndex = HIGHLIGHT_Z_INDEX;
    el.style.opacity = HIGHLIGHT_OPACITY;
    document.body.append(el);
  });
}

function eventCallback(sheet, selection, els) {
  let spread = sheet.getParent();
  let canvas = spread
    .getHost()
    .querySelector("canvas[gcuielement='gcWorksheetCanvas']");
  let canvasRect = canvas.getBoundingClientRect();
  let selLT_Rect = sheet.getCellRect(selection.row, selection.col);
  let selRB_Rect = sheet.getCellRect(
    selection.row + selection.rowCount - 1,
    selection.col + selection.colCount - 1,
  );
  selLT_Rect.width = sheet.getColumnWidth(selection.col);
  selLT_Rect.height = sheet.getRowHeight(selection.row);
  selRB_Rect.width = sheet.getColumnWidth(
    selection.col + selection.colCount - 1,
  );
  selRB_Rect.height = sheet.getRowHeight(
    selection.row + selection.rowCount - 1,
  );

  let selRect = {
    x: selLT_Rect.x,
    y: selLT_Rect.y,
    width: selRB_Rect.x + selRB_Rect.width - selLT_Rect.x,
    height: selRB_Rect.y + selRB_Rect.height - selLT_Rect.y,
  };
  if (!selRect.x || !selRect.y || !selRect.width || !selRect.height) {
    let topRow = sheet.getViewportTopRow(1);
    let bottomRow = sheet.getViewportBottomRow(1);
    let leftCol = sheet.getViewportLeftColumn(1);
    let rightCol = sheet.getViewportRightColumn(1);

    // 选择单元格在可视区域【上方】
    if (
      selection.row < topRow &&
      selection.col >= leftCol &&
      selection.col + selection.colCount - 1 <= rightCol
    ) {
      selRect.x = sheet.getCellRect(topRow, selection.col).x;
      setElPosition(canvasRect, selRect, els, "bottom"); // 只需要一个bottom
    }
    // 选择单元格在可视区域【下方】
    else if (
      selection.row > bottomRow &&
      selection.col >= leftCol &&
      selection.col + selection.colCount - 1 <= rightCol
    ) {
      selRect.x = sheet.getCellRect(bottomRow, selection.col).x;
      setElPosition(canvasRect, selRect, els, "top"); // 只需要一个top
    }
    // 选择单元格在可视区域【左方】
    else if (
      selection.col < leftCol &&
      selection.row >= topRow &&
      selection.row + selection.rowCount - 1 <= bottomRow
    ) {
      selRect.y = sheet.getCellRect(selection.row, leftCol).y;
      setElPosition(canvasRect, selRect, els, "right"); // 只需要一个right
    }
    // 选择单元格在可视区域【右方】
    else if (
      selection.col > rightCol &&
      selection.row >= topRow &&
      selection.row + selection.rowCount - 1 <= bottomRow
    ) {
      selRect.y = sheet.getCellRect(selection.row, rightCol).y;
      setElPosition(canvasRect, selRect, els, "left"); // 只需要一个left
    } else {
      setElPosition(canvasRect, selRect, els, "none"); // 全都不显示
    }
  } else {
    setElPosition(canvasRect, selRect, els);
  }
}

function setElPosition(canvasRect, selRect, els, direction) {
  const { leftEl, rightEl, topEl, bottomEl } = els;

  if (!direction) {
    leftEl.style.display = "block";
    rightEl.style.display = "block";
    topEl.style.display = "block";
    bottomEl.style.display = "block";

    leftEl.style.left = canvasRect.x + "px";
    leftEl.style.top = canvasRect.y + selRect.y + "px";
    leftEl.style.width = selRect.x - BORDER_OFFSET + "px";
    leftEl.style.height = selRect.height + "px";

    rightEl.style.left =
      canvasRect.x + selRect.x + selRect.width + BORDER_OFFSET + "px";
    rightEl.style.top = canvasRect.y + selRect.y + "px";
    rightEl.style.width =
      canvasRect.width - selRect.x - selRect.width - BORDER_OFFSET + "px";
    rightEl.style.height = selRect.height + "px";

    topEl.style.left = canvasRect.x + selRect.x + "px";
    topEl.style.top = canvasRect.y + "px";
    topEl.style.width = selRect.width + "px";
    topEl.style.height = selRect.y - BORDER_OFFSET + "px";

    bottomEl.style.left = canvasRect.x + selRect.x + "px";
    bottomEl.style.top =
      canvasRect.y + selRect.y + selRect.height + BORDER_OFFSET + "px";
    bottomEl.style.width = selRect.width + "px";
    bottomEl.style.height =
      canvasRect.height - selRect.y - selRect.height - BORDER_OFFSET + "px";
    return;
  }

  leftEl.style.display = "none";
  rightEl.style.display = "none";
  topEl.style.display = "none";
  bottomEl.style.display = "none";

  const directionMap = {
    left: leftEl,
    right: rightEl,
    top: topEl,
    bottom: bottomEl,
  };
  const el = directionMap[direction];
  if (!el) return;

  el.style.display = "block";
  if (direction === "left" || direction === "right") {
    el.style.top = selRect.y + "px";
    el.style.left = canvasRect.x + "px";
    el.style.width = canvasRect.width + "px";
  } else {
    el.style.top = canvasRect.y + "px";
    el.style.left = selRect.x + "px";
    el.style.height = canvasRect.height + "px";
  }
}

function recordSelections(sheet, selections) {
  removeAllElements();
  let sheetName = sheet.name();
  elArr = {};
  selections.forEach((sel) => {
    let leftEl = document.createElement("div");
    let rightEl = document.createElement("div");
    let topEl = document.createElement("div");
    let bottomEl = document.createElement("div");
    let els = { leftEl, rightEl, topEl, bottomEl };
    elArr[sheetName] = elArr[sheetName] || [];
    elArr[sheetName].push({
      els: els,
      pos: sel,
    });
  });
  elArr[sheetName].forEach((val) => {
    setElsCommonStyle(Object.values(val.els));
  });
  elArr[sheetName].forEach((val) => {
    eventCallback(sheet, val.pos, val.els);
  });
}

function cb1(e, info) {
  recordSelections(info.sheet, info.newSelections);
}
function cb2(e, info) {
  if (elArr[info.sheet.name()]) {
    elArr[info.sheet.name()].forEach((val) => {
      eventCallback(info.sheet, val.pos, val.els);
    });
  }
}
function cb3(e, info) {
  recordSelections(info.newSheet, info.newSheet.getSelections());
}
let elArr = {};

function removeAllElements() {
  Object.keys(elArr).forEach((sheetname) => {
    elArr[sheetname].forEach((val) => {
      document.body.removeChild(val.els.leftEl);
      document.body.removeChild(val.els.rightEl);
      document.body.removeChild(val.els.topEl);
      document.body.removeChild(val.els.bottomEl);
    });
  });
  elArr = {};
}

// 注册时，只需要传入spread变量即可
function bootCrossHighlight(_spread, start = true) {
  // 停止高亮显示
  if (!start) {
    // 去掉所有的监听
    _spread.unbind(GC.Spread.Sheets.Events.SelectionChanging, cb1);
    _spread.unbind(GC.Spread.Sheets.Events.TopRowChanged, cb2);
    _spread.unbind(GC.Spread.Sheets.Events.LeftColumnChanged, cb2);
    _spread.unbind(GC.Spread.Sheets.Events.ViewZoomed, cb2);
    _spread.unbind(GC.Spread.Sheets.Events.RowHeightChanged, cb2);
    _spread.unbind(GC.Spread.Sheets.Events.ColumnWidthChanged, cb2);
    _spread.unbind(GC.Spread.Sheets.Events.ActiveSheetChanged, cb3);
    // 去掉所有的高亮元素
    removeAllElements();
    return;
  }

  _spread.bind(GC.Spread.Sheets.Events.SelectionChanging, cb1);
  _spread.bind(GC.Spread.Sheets.Events.TopRowChanged, cb2);
  _spread.bind(GC.Spread.Sheets.Events.LeftColumnChanged, cb2);
  _spread.bind(GC.Spread.Sheets.Events.ViewZoomed, cb2);
  _spread.bind(GC.Spread.Sheets.Events.RowHeightChanged, cb2);
  _spread.bind(GC.Spread.Sheets.Events.ColumnWidthChanged, cb2);
  _spread.bind(GC.Spread.Sheets.Events.ActiveSheetChanged, cb3);

  recordSelections(
    _spread.getActiveSheet(),
    _spread.getActiveSheet().getSelections(),
  );
}

export { bootCrossHighlight };
