import * as GC from "@grapecity-software/spread-sheets";

// ---------------------------------------------------------------------------
// 共享状态与常量。
// 设计器实例、工作簿实例以及下拉弹层/配置弹框的临时状态都放在这里，
// 供 cellType / ui / app 各模块跨文件读写，避免相互传递大量参数。
// ---------------------------------------------------------------------------

// 自定义富文本下拉单元格类型的名称，用于序列化和类型判断。
export const CELL_TYPE_NAME = "RichTextDropdownCellType";

// 单元格类型默认作用在 viewport 区域上。
export const SHEET_AREA = GC.Spread.Sheets.SheetArea.viewport;

// 单元格右侧自绘下拉按钮的宽度。
export const BUTTON_WIDTH = 24;

// 富文本默认颜色与字号（上下标字号略小）。
export const DEFAULT_COLOR = "#22303c";
export const DEFAULT_FONT_SIZE = 24;
export const DEFAULT_SUPSUB_FONT_SIZE = 18;

// 垂直对齐标记到表格控件富文本 vertAlign 取值的映射。
export const VERTICAL_ALIGN_MAP = {
  normal: 0,
  sup: 1,
  sub: 2
};

// 全局共享状态。
export const state = {
  // 设计器实例及其内部工作簿。
  designer: null,
  spread: null,

  // 下拉弹层的临时上下文与选项配置。
  popupContext: null,
  dropdownPopupOptionConfigs: [],
  ignoreDocumentClickUntil: 0,

  // 已绑定选区事件的表格，避免重复绑定。
  boundSheets: new WeakSet(),

  // 配置弹框的编辑状态。
  configModalOpen: false,
  configOptions: [],
  configActiveOptionId: null,
  ignoreModalClickUntil: 0
};
