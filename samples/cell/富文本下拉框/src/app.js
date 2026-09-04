import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio";
import "@grapecity-software/spread-sheets-charts";
import "@grapecity-software/spread-sheets-print";
import "@grapecity-software/spread-sheets-pdf";
import "@grapecity-software/spread-sheets-barcode";
import "@grapecity-software/spread-sheets-languagepackages";
import "@grapecity-software/spread-sheets-shapes";
import "@grapecity-software/spread-sheets-pivot-addon";
import "@grapecity-software/spread-sheets-resources-zh";
import "@grapecity-software/spread-sheets-designer-resources-cn";
import "@grapecity-software/spread-sheets-designer";

import { state } from "./state";
import { createDefaultOptionConfigs, createRichTextValue, optionConfigToOption } from "./rich-text";
import { setDropdownOpener, setRichDropdownCellType } from "./rich-text-dropdown-cell-type";
import {
  bindPageEvents,
  bindSheetEvents,
  clearCellTypeFromCurrentSelection,
  hideDropdownPopup,
  openCellTypeConfigModal,
  openDropdownPopup
} from "./ui";


// ---------------------------------------------------------------------------
// 入口：初始化设计器、示例工作簿，并把自定义单元格类型与页面 UI 串接起来。
// 注意：这里不使用 window.onload——SystemJS 是异步加载模块的，页面 load 事件
// 可能先于本模块执行触发，因此初始化代码在模块加载完成后直接运行。
// ---------------------------------------------------------------------------

function init() {
  const cultureInfo = GC.Spread.Common.CultureManager.getCultureInfo("zh-cn");
  cultureInfo.fontScriptCode = "Hans";
  GC.Spread.Common.CultureManager.culture("zh-cn");

  state.designer = new GC.Spread.Sheets.Designer.Designer(
    document.getElementById("designer-container"),
    buildDesignerConfig()
  );
  state.spread = state.designer.getWorkbook();

  // 单元格类型在下拉按钮被点击时，通过这个回调打开页面上的下拉弹层。
  setDropdownOpener(openDropdownPopup);

  bindWindowEvents();
  initWorkbook();
  bindPageEvents();
  refreshDesignerLayout();
  window.setTimeout(refreshDesignerLayout, 60);
  window.setTimeout(refreshDesignerLayout, 240);
}

// 绑定窗口尺寸变化事件，确保设计器区域高度跟随页面变化。
function bindWindowEvents() {
  window.addEventListener("resize", refreshDesignerLayout);
}

// 根据当前视口重新计算设计器容器高度，并刷新表格控件。
function refreshDesignerLayout() {
  const container = document.getElementById("designer-container");
  const rect = container.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const desiredHeight = Math.max(640, Math.floor(viewportHeight - rect.top));
  container.style.height = desiredHeight + "px";

  if (state.spread && typeof state.spread.refresh === "function") {
    state.spread.refresh();
  }
}

// 向设计器功能区注入富文本下拉列表相关按钮。
function buildDesignerConfig() {
  const config = GC.Spread.Sheets.Designer.DefaultConfig;
  const commandMap = config.commandMap || {};

  commandMap.richDropdownSet = {
    title: "设置富文本下拉",
    text: "设置",
    bigButton: true,
    iconClass: "rich-dropdown-ribbon-icon-set",
    commandName: "richDropdownSet",
    execute: function () {
      openCellTypeConfigModal(false);
    }
  };

  commandMap.richDropdownEdit = {
    title: "编辑富文本下拉",
    text: "编辑",
    bigButton: true,
    iconClass: "rich-dropdown-ribbon-icon-edit",
    commandName: "richDropdownEdit",
    execute: function () {
      openCellTypeConfigModal(true);
    }
  };

  commandMap.richDropdownClear = {
    title: "清除富文本下拉",
    text: "清除",
    bigButton: true,
    iconClass: "rich-dropdown-ribbon-icon-clear",
    commandName: "richDropdownClear",
    execute: function () {
      clearCellTypeFromCurrentSelection();
    }
  };

  config.commandMap = commandMap;

  const ribbonTabs = config.ribbon || [];
  const homeTab = ribbonTabs.find(function (tab) {
    return tab.id === "home";
  }) || ribbonTabs[0];

  if (homeTab && homeTab.buttonGroups && !homeTab.__richDropdownCellTypeButtonsInjected) {
    homeTab.buttonGroups.unshift({
      label: "富文本下拉列表",
      commandGroup: {
        children: [
          {
            direction: "horizontal",
            commands: ["richDropdownSet", "richDropdownEdit", "richDropdownClear"]
          }
        ]
      }
    });
    homeTab.__richDropdownCellTypeButtonsInjected = true;
  }

  return config;
}

// 初始化示例工作簿，填充说明、示例富文本和默认下拉单元格。
function initWorkbook() {
  const sheet = state.spread.getActiveSheet();

  state.spread.suspendPaint();
  sheet.name("CellType 富文本下拉");
  sheet.options.allowCellOverflow = true;
  sheet.setColumnWidth(0, 150);
  sheet.setColumnWidth(1, 320);
  sheet.setColumnWidth(2, 320);
  sheet.setColumnWidth(3, 220);

  for (let row = 0; row < 14; row += 1) {
    sheet.setRowHeight(row, 34);
  }
  sheet.setRowHeight(6, 56);
  sheet.setRowHeight(7, 56);
  sheet.setRowHeight(8, 56);

  sheet.setValue(0, 0, "操作步骤");
  sheet.setValue(0, 1, "1. 选中单元格或区域");
  sheet.setValue(1, 1, "2. 在工具栏点击“开始”");
  sheet.setValue(2, 1, "3. 在弹窗里编辑富文本下拉选项");
  sheet.setValue(3, 1, "4. 保存后点击单元格右侧自绘箭头选择");
  sheet.setValue(5, 0, "示例预览");
  sheet.setValue(5, 2, "CellType 示例");
  sheet.setValue(6, 0, "选项 1");
  sheet.setValue(7, 0, "选项 2");
  sheet.setValue(8, 0, "选项 3");
  sheet.setValue(6, 2, "点击右侧自绘下拉按钮");
  sheet.setValue(7, 2, "点击右侧自绘下拉按钮");
  sheet.setValue(8, 2, "点击右侧自绘下拉按钮");

  const sampleConfigs = createDefaultOptionConfigs();
  sampleConfigs.forEach(function (optionConfig, index) {
    sheet.setValue(6 + index, 1, createRichTextValue(optionConfigToOption(optionConfig)));
    sheet.autoFitRow(6 + index);
  });

  sheet.getCell(0, 0).font("bold 14px Aptos").backColor("#f5f0e8");
  sheet.getRange(0, 0, 9, 1).font("bold 13px Aptos").backColor("#faf7f2");
  sheet.getRange(0, 1, 4, 3).font("12px Aptos").foreColor("#5e7083");
  sheet.getRange(6, 2, 3, 1).backColor("#fff8ee").foreColor("#944624");

  bindSheetEvents(sheet);
  state.spread.bind(GC.Spread.Sheets.Events.ActiveSheetChanged, function () {
    bindSheetEvents(state.spread.getActiveSheet());
    hideDropdownPopup();
  });

  for (let row = 6; row <= 8; row += 1) {
    setRichDropdownCellType(sheet, row, 2, sampleConfigs);
  }

  sheet.setActiveCell(6, 2);
  state.spread.resumePaint();
}

init();
