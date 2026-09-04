import * as GC from "@grapecity-software/spread-sheets";
import { BUTTON_WIDTH, CELL_TYPE_NAME, SHEET_AREA, state } from "./state";
import { cloneOptionConfigs } from "./rich-text";

// ---------------------------------------------------------------------------
// 自定义单元格类型：RichTextDropdownCellType。
// 负责绘制单元格内容与右侧下拉箭头、命中检测下拉按钮区域、把配置保存在实例上，
// 并提供对单元格设置/清除/查询该类型的工具函数。
//
// 打开下拉弹层的行为通过 setDropdownOpener 注入，避免本模块直接依赖页面 UI，
// 也避免与 ui.js 产生循环依赖。
// ---------------------------------------------------------------------------

// 下拉按钮点击后的打开回调，由 app.js 注入。
let dropdownOpener = null;

export function setDropdownOpener(opener) {
  dropdownOpener = opener;
}

// 定义一个真正的自定义单元格类型，配置直接保存在类型实例上。
export function RichTextDropdownCellType(optionConfigs) {
  GC.Spread.Sheets.CellTypes.Text.call(this);
  this.typeName = CELL_TYPE_NAME;
  this.options = cloneOptionConfigs(optionConfigs || []);
}

RichTextDropdownCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();
RichTextDropdownCellType.prototype.constructor = RichTextDropdownCellType;

// 绘制单元格内容和右侧下拉箭头区域。
RichTextDropdownCellType.prototype.paint = function (ctx, value, x, y, width, height, style, context) {
  const contentWidth = Math.max(0, width - BUTTON_WIDTH);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, contentWidth, height);
  ctx.clip();
  GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, [ctx, value, x, y, contentWidth, height, style, context]);
  ctx.restore();

  paintDropdownButton(ctx, x + width - BUTTON_WIDTH, y, BUTTON_WIDTH, height);
};

// 判断鼠标是否点在自定义绘制的下拉按钮区域。
RichTextDropdownCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
  if (!context || !cellRect) {
    return null;
  }
  const buttonLeft = cellRect.x + cellRect.width - BUTTON_WIDTH;
  const isLeftButton = !context.event || context.event.button === 0;
  const info = {
    x: x,
    y: y,
    row: context.row,
    col: context.col,
    cellRect: cellRect,
    sheetArea: context.sheetArea,
    sheet: context.sheet
  };
  info.isReservedLocation =
    isLeftButton &&
    x >= buttonLeft &&
    x <= cellRect.x + cellRect.width &&
    y >= cellRect.y &&
    y <= cellRect.y + cellRect.height;
  return info;
};

// 在鼠标抬起时处理下拉按钮点击，并打开自定义富文本下拉弹层。
RichTextDropdownCellType.prototype.processMouseUp = function (hitInfo) {
  if (!hitInfo || !hitInfo.isReservedLocation) {
    return false;
  }
  const sheet = hitInfo && hitInfo.sheet ? hitInfo.sheet : state.spread && state.spread.getActiveSheet();
  if (sheet && dropdownOpener) {
    dropdownOpener(sheet, hitInfo.row, hitInfo.col);
    return true;
  }
  return false;
};

// 将自定义单元格类型转换为可序列化对象，方便后续观察导出数据。
RichTextDropdownCellType.prototype.toJSON = function () {
  return {
    typeName: CELL_TYPE_NAME,
    options: cloneOptionConfigs(this.options)
  };
};

// 从序列化对象恢复自定义单元格类型实例上的选项配置。
RichTextDropdownCellType.prototype.fromJSON = function (settings) {
  this.typeName = CELL_TYPE_NAME;
  this.options = cloneOptionConfigs(settings && settings.options ? settings.options : []);
};

// 绘制自定义单元格类型右侧的下拉按钮外观。
function paintDropdownButton(ctx, x, y, width, height) {
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  ctx.save();
  ctx.fillStyle = "#f5f7f8";
  ctx.strokeStyle = "#c6d0d6";
  ctx.beginPath();
  ctx.rect(x + 0.5, y + 0.5, width - 1, height - 1);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#4f6474";
  ctx.beginPath();
  ctx.moveTo(centerX - 4, centerY - 2);
  ctx.lineTo(centerX + 4, centerY - 2);
  ctx.lineTo(centerX, centerY + 3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// 给指定单元格设置自定义富文本下拉单元格类型。
export function setRichDropdownCellType(sheet, row, col, optionConfigs) {
  const style = sheet.getStyle(row, col, SHEET_AREA) || new GC.Spread.Sheets.Style();
  style.wordWrap = true;
  style.vAlign = GC.Spread.Sheets.VerticalAlign.center;
  sheet.setStyle(row, col, style, SHEET_AREA);
  sheet.setCellType(row, col, new RichTextDropdownCellType(optionConfigs), SHEET_AREA);

  if (sheet.getRowHeight(row) < 34) {
    sheet.setRowHeight(row, 34);
  }
}

// 清除指定单元格上的自定义富文本下拉单元格类型。
export function clearRichDropdownCellType(sheet, row, col) {
  if (!hasRichDropdownCellType(sheet, row, col)) {
    return;
  }
  sheet.setCellType(row, col, null, SHEET_AREA);
}

// 获取指定单元格上的富文本下拉单元格类型实例。
export function getRichDropdownCellType(sheet, row, col) {
  const cellType = sheet.getCellType(row, col, SHEET_AREA);
  return cellType && cellType.typeName === CELL_TYPE_NAME ? cellType : null;
}

// 判断指定单元格是否已经设置了富文本下拉单元格类型。
export function hasRichDropdownCellType(sheet, row, col) {
  return !!getRichDropdownCellType(sheet, row, col);
}
