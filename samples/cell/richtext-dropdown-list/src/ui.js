import * as GC from "@grapecity-software/spread-sheets";
import { DEFAULT_COLOR, state } from "./state";
import {
  cloneOptionConfigs,
  createDefaultOptionConfigs,
  createRichTextValue,
  escapeHtml,
  normalizeOptionConfigHtml,
  optionConfigToOption,
  renderOptionConfigHtml
} from "./rich-text";
import {
  clearRichDropdownCellType,
  getRichDropdownCellType,
  setRichDropdownCellType
} from "./rich-text-dropdown-cell-type";

// ---------------------------------------------------------------------------
// 页面 UI：下拉弹层、配置弹框、富文本编辑器、选区工具与页面事件绑定。
// 所有与 DOM 打交道的逻辑都集中在这里；自定义单元格类型本身不依赖本模块。
// ---------------------------------------------------------------------------

// 获取当前活动工作表，并确保该工作表已绑定必要事件。
function getCurrentSheet() {
  const sheet = state.spread.getActiveSheet();
  bindSheetEvents(sheet);
  return sheet;
}

// 过滤出有效的单元格选区。
function getValidSelections(sheet) {
  const selections = sheet.getSelections() || [];
  return selections.filter(function (range) {
    return range.row >= 0 && range.col >= 0 && range.rowCount > 0 && range.colCount > 0;
  });
}

// 将选区格式化为显示用地址。
function formatSelections(selections) {
  if (!selections || !selections.length) {
    return "未选中";
  }
  return selections
    .map(function (range) {
      const start = toA1(range.row, range.col);
      const end = toA1(range.row + range.rowCount - 1, range.col + range.colCount - 1);
      return start === end ? start : start + ":" + end;
    })
    .join(", ");
}

// 将零基行列索引转换为常见的单元格地址。
function toA1(row, col) {
  let current = col + 1;
  let label = "";
  while (current > 0) {
    const mod = (current - 1) % 26;
    label = String.fromCharCode(65 + mod) + label;
    current = Math.floor((current - mod) / 26);
  }
  return label + String(row + 1);
}

// 获取当前选区中的第一个单元格。
function getFirstSelectedCell(sheet) {
  const selections = getValidSelections(sheet);
  if (!selections.length) {
    return null;
  }
  return { row: selections[0].row, col: selections[0].col };
}

// 绑定单个工作表事件，切换选区时关闭下拉弹层。
function bindSheetEvents(sheet) {
  if (state.boundSheets.has(sheet)) {
    return;
  }
  state.boundSheets.add(sheet);
  sheet.bind(GC.Spread.Sheets.Events.SelectionChanged, function () {
    hideDropdownPopup();
  });
}

// 打开单元格旁边的自定义下拉弹层。
function openDropdownPopup(sheet, row, col) {
  const cellType = getRichDropdownCellType(sheet, row, col);
  if (!cellType) {
    return;
  }

  state.dropdownPopupOptionConfigs = cloneOptionConfigs(cellType.options || []);
  renderDropdownPopupItems();

  const popup = document.getElementById("dropdown-popup");
  const workspace = document.getElementById("workspace");
  const host = state.spread.getHost ? state.spread.getHost() : document.querySelector("#designer-container .gc-spread-host");
  const cellRect = sheet.getCellRect(row, col);
  const hostRect = host.getBoundingClientRect();
  const paneRect = workspace.getBoundingClientRect();

  let left = hostRect.left - paneRect.left + cellRect.x + cellRect.width - 380;
  let top = hostRect.top - paneRect.top + cellRect.y + cellRect.height + 10;
  left = Math.max(14, Math.min(left, workspace.clientWidth - 394));
  top = Math.max(70, Math.min(top, workspace.clientHeight - 410));

  state.popupContext = { sheet: sheet, row: row, col: col };
  state.ignoreDocumentClickUntil = Date.now() + 180;
  popup.style.left = left + "px";
  popup.style.top = top + "px";
  popup.classList.remove("hidden");
}

// 渲染下拉弹层中的所有富文本选项。
function renderDropdownPopupItems() {
  document.getElementById("popup-items").innerHTML = state.dropdownPopupOptionConfigs
    .map(function (optionConfig) {
      return (
        '<button class="popup-item" type="button" data-option-id="' + escapeHtml(optionConfig.id) + '">' +
        '<div class="rich-preview">' + renderOptionConfigHtml(optionConfig) + "</div>" +
        "</button>"
      );
    })
    .join("");
}

// 隐藏下拉弹层并清空临时上下文。
function hideDropdownPopup() {
  state.popupContext = null;
  state.dropdownPopupOptionConfigs = [];
  state.ignoreDocumentClickUntil = 0;
  document.getElementById("dropdown-popup").classList.add("hidden");
}

// 将用户选择的富文本选项写入单元格，并调整行高。
function writeOptionToCell(sheet, row, col, option) {
  sheet.setValue(row, col, createRichTextValue(option));
  sheet.autoFitRow(row);
  if (sheet.getRowHeight(row) < 34) {
    sheet.setRowHeight(row, 34);
  }
}

// 打开富文本下拉设置弹框，可选择优先读取当前单元格已有配置。
function openCellTypeConfigModal(preferExisting) {
  const sheet = getCurrentSheet();
  const selections = getValidSelections(sheet);
  if (!selections.length) {
    alert("请先选择具体单元格或区域，再设置自定义单元格类型。");
    return;
  }

  let optionConfigs = createDefaultOptionConfigs();
  const firstCell = getFirstSelectedCell(sheet);
  const existingCellType = firstCell ? getRichDropdownCellType(sheet, firstCell.row, firstCell.col) : null;
  if (preferExisting && existingCellType) {
    optionConfigs = cloneOptionConfigs(existingCellType.options || createDefaultOptionConfigs());
  }

  state.configModalOpen = true;
  state.configOptions = cloneOptionConfigs(optionConfigs);
  state.configActiveOptionId = state.configOptions[0].id;
  document.getElementById("modal-selection-label").textContent = "当前选区：" + formatSelections(selections);
  renderConfigModal();
  document.getElementById("cell-type-modal").classList.remove("hidden");
  state.ignoreModalClickUntil = Date.now() + 180;
}

// 关闭设置弹框，并清空本次编辑状态。
function closeCellTypeConfigModal() {
  if (!state.configModalOpen) {
    return;
  }
  state.configModalOpen = false;
  state.configOptions = [];
  state.configActiveOptionId = null;
  document.getElementById("cell-type-modal").classList.add("hidden");
}

// 获取设置弹框中当前正在编辑的选项。
function getActiveConfigOption() {
  return state.configOptions.find(function (item) {
    return item.id === state.configActiveOptionId;
  });
}

// 刷新设置弹框。
function renderConfigModal() {
  refreshConfigOptionList();
  const option = getActiveConfigOption();
  if (!option) {
    return;
  }
  document.getElementById("config-rich-editor").innerHTML = option.html;
  document.getElementById("editor-color-input").value = DEFAULT_COLOR;
  refreshConfigPreview();
}

// 刷新设置弹框里的选项列表。
function refreshConfigOptionList() {
  document.getElementById("config-option-list").innerHTML = state.configOptions
    .map(function (option) {
      const activeClass = option.id === state.configActiveOptionId ? " active" : "";
      return (
        '<button class="config-option-item' + activeClass + '" type="button" data-option-id="' + escapeHtml(option.id) + '">' +
        '<div class="rich-preview">' + renderOptionConfigHtml(option) + "</div>" +
        "</button>"
      );
    })
    .join("");
}

// 刷新当前选项的富文本预览。
function refreshConfigPreview() {
  const option = getActiveConfigOption();
  if (!option) {
    return;
  }
  persistCurrentEditorHtml();
  document.getElementById("config-option-preview").innerHTML = renderOptionConfigHtml(option);
}

// 将富文本编辑器当前内容保存回活动选项配置。
function persistCurrentEditorHtml() {
  if (!state.configModalOpen) {
    return;
  }
  const option = getActiveConfigOption();
  if (!option) {
    return;
  }
  option.html = normalizeOptionConfigHtml(document.getElementById("config-rich-editor").innerHTML);
}

// 聚焦富文本编辑器，保证工具栏命令作用于编辑区。
function focusRichEditor() {
  document.getElementById("config-rich-editor").focus();
}

// 将弹框里的富文本下拉配置应用到当前所有有效选区。
function saveCellTypeConfigToSelection() {
  persistCurrentEditorHtml();
  const sheet = getCurrentSheet();
  const selections = getValidSelections(sheet);
  if (!selections.length) {
    alert("当前没有有效选区，无法应用自定义单元格类型。");
    return;
  }

  state.spread.suspendPaint();
  selections.forEach(function (range) {
    for (let row = range.row; row < range.row + range.rowCount; row += 1) {
      for (let col = range.col; col < range.col + range.colCount; col += 1) {
        setRichDropdownCellType(sheet, row, col, state.configOptions);
      }
    }
  });
  state.spread.resumePaint();
  closeCellTypeConfigModal();
}

// 从当前所有有效选区中清除富文本下拉单元格类型。
function clearCellTypeFromCurrentSelection() {
  const sheet = getCurrentSheet();
  const selections = getValidSelections(sheet);
  if (!selections.length) {
    alert("请先选择具体单元格或区域，再清除自定义单元格类型。");
    return;
  }

  state.spread.suspendPaint();
  selections.forEach(function (range) {
    for (let row = range.row; row < range.row + range.rowCount; row += 1) {
      for (let col = range.col; col < range.col + range.colCount; col += 1) {
        clearRichDropdownCellType(sheet, row, col);
      }
    }
  });
  state.spread.resumePaint();
  hideDropdownPopup();
}

// 绑定页面弹框、富文本编辑器、下拉弹层等事件。
function bindPageEvents() {
  document.getElementById("close-dropdown-popup-btn").addEventListener("click", hideDropdownPopup);

  document.getElementById("popup-items").addEventListener("click", function (event) {
    const button = event.target.closest("[data-option-id]");
    if (!button || !state.popupContext) {
      return;
    }

    const optionConfig = state.dropdownPopupOptionConfigs.find(function (item) {
      return item.id === button.dataset.optionId;
    });
    if (!optionConfig) {
      return;
    }

    writeOptionToCell(
      state.popupContext.sheet,
      state.popupContext.row,
      state.popupContext.col,
      optionConfigToOption(optionConfig)
    );
    hideDropdownPopup();
  });

  document.getElementById("close-cell-type-modal-btn").addEventListener("click", closeCellTypeConfigModal);
  document.getElementById("cancel-cell-type-config-btn").addEventListener("click", closeCellTypeConfigModal);
  document.getElementById("save-cell-type-config-btn").addEventListener("click", saveCellTypeConfigToSelection);

  document.getElementById("add-config-option-btn").addEventListener("click", function () {
    persistCurrentEditorHtml();
    const option = {
      id: "option-" + Date.now(),
      html: '<span style="color:' + DEFAULT_COLOR + '">文本</span>'
    };
    state.configOptions.push(option);
    state.configActiveOptionId = option.id;
    renderConfigModal();
  });

  document.getElementById("remove-config-option-btn").addEventListener("click", function () {
    if (state.configOptions.length === 1) {
      alert("至少保留一个下拉选项。");
      return;
    }

    const currentIndex = state.configOptions.findIndex(function (item) {
      return item.id === state.configActiveOptionId;
    });
    state.configOptions = state.configOptions.filter(function (item) {
      return item.id !== state.configActiveOptionId;
    });
    state.configActiveOptionId = state.configOptions[Math.max(0, currentIndex - 1)].id;
    renderConfigModal();
  });

  document.getElementById("config-option-list").addEventListener("click", function (event) {
    const button = event.target.closest("[data-option-id]");
    if (!button) {
      return;
    }
    persistCurrentEditorHtml();
    state.configActiveOptionId = button.dataset.optionId;
    renderConfigModal();
  });

  document.getElementById("config-rich-editor").addEventListener("input", function () {
    persistCurrentEditorHtml();
    refreshConfigOptionList();
    refreshConfigPreview();
  });

  document.getElementById("editor-toolbar").addEventListener("mousedown", function (event) {
    event.preventDefault();
  });

  document.getElementById("editor-toolbar").addEventListener("click", function (event) {
    const button = event.target.closest("[data-command]");
    if (!button) {
      return;
    }
    focusRichEditor();
    document.execCommand("styleWithCSS", false, true);
    document.execCommand(button.dataset.command, false, null);
    persistCurrentEditorHtml();
    refreshConfigOptionList();
    refreshConfigPreview();
  });

  document.getElementById("editor-color-input").addEventListener("input", function (event) {
    focusRichEditor();
    document.execCommand("styleWithCSS", false, true);
    document.execCommand("foreColor", false, event.target.value);
    persistCurrentEditorHtml();
    refreshConfigOptionList();
    refreshConfigPreview();
  });

  document.addEventListener("click", function (event) {
    const popup = document.getElementById("dropdown-popup");
    if (!popup.classList.contains("hidden")) {
      if (Date.now() < state.ignoreDocumentClickUntil) {
        return;
      }
      if (!popup.contains(event.target)) {
        hideDropdownPopup();
      }
    }
  });

  document.getElementById("cell-type-modal").addEventListener("click", function (event) {
    if (event.target.id !== "cell-type-modal") {
      return;
    }
    if (Date.now() < state.ignoreModalClickUntil) {
      return;
    }
    closeCellTypeConfigModal();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      hideDropdownPopup();
      closeCellTypeConfigModal();
    }
  });
}

export {
  bindPageEvents,
  bindSheetEvents,
  clearCellTypeFromCurrentSelection,
  hideDropdownPopup,
  openCellTypeConfigModal,
  openDropdownPopup
};
