import * as GC from "@grapecity-software/spread-sheets";

/**
 * 注册 Ctrl+M 快捷键，实现合并/取消合并。
 * @param {GC.Spread.Sheets.Workbook} spread - 工作簿对象
 */
export function registerMergeShortcut(spread) {
  const commandManager = spread.commandManager();

  commandManager.register(
    "toggleMergeCells",
    {
      canUndo: true,

      execute: function (context, options, isUndo) {
        const sheet = context.getSheetFromName(options.sheetName);

        if (!sheet) {
          return false;
        }

        // 交由 SpreadJS 的命令系统处理撤销。
        if (isUndo) {
          GC.Spread.Sheets.Commands.undoTransaction(context, options);
          return true;
        }

        GC.Spread.Sheets.Commands.startTransaction(context, options);

        try {
          toggleMerge(sheet);
        } finally {
          GC.Spread.Sheets.Commands.endTransaction(context, options);
        }

        return true;
      },
    },

    // M 键
    77,

    // Ctrl、Shift、Alt、Meta
    true,
    false,
    false,
    false,
  );
}

/**
 * 合并或取消合并当前选区。
 * @param {GC.Spread.Sheets.Worksheet} sheet - 工作表对象
 */
function toggleMerge(sheet) {
  const selections = sheet.getSelections();

  if (!selections || selections.length === 0) {
    return;
  }

  // SpreadJS 通常只有一个主选区，这里取最后一个选区。
  const selection = normalizeRange(
    sheet,
    selections[selections.length - 1],
  );

  const intersectingSpans = getIntersectingSpans(sheet, selection);

  sheet.suspendPaint();

  try {
    if (intersectingSpans.length > 0) {
      // 选区中存在合并区域：取消这些合并区域。
      intersectingSpans.forEach(function (span) {
        sheet.removeSpan(span.row, span.col);
      });
    } else if (selection.rowCount > 1 || selection.colCount > 1) {
      // 多单元格选区且不存在合并区域：执行合并。
      sheet.addSpan(
        selection.row,
        selection.col,
        selection.rowCount,
        selection.colCount,
      );
    }
  } finally {
    sheet.resumePaint();
  }
}

/**
 * 将整行、整列选择转换成实际单元格范围。
 *
 * SpreadJS 中：
 * row === -1 表示整列；
 * col === -1 表示整行。
 */
function normalizeRange(sheet, range) {
  let row = range.row;
  let col = range.col;
  let rowCount = range.rowCount;
  let colCount = range.colCount;

  if (row === -1) {
    row = 0;
    rowCount = sheet.getRowCount();
  }

  if (col === -1) {
    col = 0;
    colCount = sheet.getColumnCount();
  }

  return {
    row: row,
    col: col,
    rowCount: rowCount,
    colCount: colCount,
  };
}

/**
 * 获取所有与当前选区相交的合并区域。
 */
function getIntersectingSpans(sheet, selection) {
  const spans = sheet.getSpans() || [];

  return spans.filter(function (span) {
    return rangesIntersect(selection, span);
  });
}

/**
 * 判断两个单元格范围是否相交。
 */
function rangesIntersect(a, b) {
  const aLastRow = a.row + a.rowCount - 1;
  const aLastCol = a.col + a.colCount - 1;
  const bLastRow = b.row + b.rowCount - 1;
  const bLastCol = b.col + b.colCount - 1;

  return !(
    aLastRow < b.row ||
    bLastRow < a.row ||
    aLastCol < b.col ||
    bLastCol < a.col
  );
}
