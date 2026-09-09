import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-shapes";
import { installCleanExportPipeline } from "./clean-export.js";

const Events = GC.Spread.Sheets.Events;
const Shapes = GC.Spread.Sheets.Shapes;

/**
 * 创建公式依赖追踪引擎。
 * 支持两个方向：追踪引用单元格（前导，precedents）与追踪从属单元格
 * （后序，dependents）。追踪结果以箭头连接线和交叉表跳转标记展示，
 * 高亮对应的引用范围，并支持多层展开与一键清除。
 *
 * @param {GC.Spread.Sheets.Workbook} spread - 设计器的工作簿对象
 */
export function createTraceEngine(spread) {
  // —— 引擎内部状态 ——
  const traceSheets = new Set(); // 出现追踪图形的 sheet
  const boundSheets = new Set(); // 已绑定 ShapeSelectionChanged 的 sheet
  const highlightedCells = new Map(); // 高亮单元格 -> 原始底色
  const crossSheetTargets = new Map(); // 跨表标记名 -> 目标位置
  const renderedRelations = new Set(); // 已绘制的关系（去重）
  const crossSheetMarkerCounts = new Map(); // 每个 sheet 的跨表标记计数
  const traceStates = new Map(); // 每个追踪任务的状态（用于多层展开）
  let artifactCounter = 0;

  function getSheetByName(sheetName) {
    for (let i = 0; i < spread.getSheetCount(); i += 1) {
      const sheet = spread.getSheet(i);
      if (sheet.name() === sheetName) {
        return sheet;
      }
    }
    return null;
  }

  function getCellKey(sheetName, row, col) {
    return sheetName + ":" + row + ":" + col;
  }

  function getReferenceSheetName(reference, fallbackSheetName) {
    return reference.sheetName || fallbackSheetName;
  }

  function getReferenceKey(reference, fallbackSheetName) {
    return (
      getReferenceSheetName(reference, fallbackSheetName) +
      ":" +
      Math.max(0, Number(reference.row) || 0) +
      ":" +
      Math.max(0, Number(reference.col) || 0) +
      ":" +
      Math.max(1, Number(reference.rowCount) || 1) +
      ":" +
      Math.max(1, Number(reference.colCount) || 1)
    );
  }

  function getRelationKey(sheet, row, col, reference, isPrecedents) {
    const currentKey = getCellKey(sheet.name(), row, col);
    const referenceKey = getReferenceKey(reference, sheet.name());
    const startKey = isPrecedents ? referenceKey : currentKey;
    const endKey = isPrecedents ? currentKey : referenceKey;
    return sheet.name() + "|" + startKey + "->" + endKey;
  }

  function getReferenceCells(reference, fallbackSheetName) {
    const sheetName = getReferenceSheetName(reference, fallbackSheetName);
    const rowCount = Math.max(1, Number(reference.rowCount) || 1);
    const colCount = Math.max(1, Number(reference.colCount) || 1);
    const row = Math.max(0, Number(reference.row) || 0);
    const col = Math.max(0, Number(reference.col) || 0);

    // 整行/整列的大范围引用只取锚点，避免展开海量单元格
    if (rowCount * colCount > 2000) {
      const anchor = getTraceAnchor(reference);
      return [{ sheetName: sheetName, row: anchor.row, col: anchor.col }];
    }

    const cells = [];
    for (let r = row; r < row + rowCount; r += 1) {
      for (let c = col; c < col + colCount; c += 1) {
        cells.push({ sheetName: sheetName, row: r, col: c });
      }
    }
    return cells;
  }

  function getNextCrossSheetMarkerIndex(sheet) {
    const sheetName = sheet.name();
    const index = crossSheetMarkerCounts.get(sheetName) || 0;
    crossSheetMarkerCounts.set(sheetName, index + 1);
    return index;
  }

  function clearTrace() {
    traceSheets.forEach(function (sheet) {
      if (!sheet || !sheet.shapes) {
        return;
      }

      sheet.shapes.all().forEach(function (shape) {
        if (shape.name().indexOf("formulaTrace_") === 0) {
          sheet.shapes.remove(shape.name());
        }
      });
    });

    highlightedCells.forEach(function (state) {
      state.cell.backColor(state.backColor == null ? null : state.backColor);
    });
    highlightedCells.clear();
    traceSheets.clear();
    crossSheetTargets.clear();
    renderedRelations.clear();
    crossSheetMarkerCounts.clear();
    traceStates.clear();
    artifactCounter = 0;
  }

  function configureTraceArtifact(shape) {
    shape.allowMove(false);
    shape.allowResize(false);
    shape.allowRotate(false);
    shape.canPrint(false);
    shape.showHandle(false);
    shape.isSelected(false);
  }

  function highlightTraceRange(sheet, cellInfo, color) {
    const rowCount = Math.max(1, Number(cellInfo.rowCount) || 1);
    const colCount = Math.max(1, Number(cellInfo.colCount) || 1);
    const row = Math.max(0, Number(cellInfo.row) || 0);
    const col = Math.max(0, Number(cellInfo.col) || 0);

    // 大范围引用跳过逐格高亮，避免性能问题
    if (rowCount * colCount > 2000) {
      return;
    }

    for (let r = row; r < row + rowCount; r += 1) {
      for (let c = col; c < col + colCount; c += 1) {
        const key = sheet.name() + ":" + r + ":" + c;
        if (highlightedCells.has(key)) {
          continue;
        }

        const cell = sheet.getCell(r, c);
        highlightedCells.set(key, {
          cell: cell,
          backColor: cell.backColor(),
        });
        cell.backColor(color);
      }
    }
  }

  function getTraceAnchor(cellInfo) {
    const rowCount = Math.max(1, Number(cellInfo.rowCount) || 1);
    const colCount = Math.max(1, Number(cellInfo.colCount) || 1);
    const row = Math.max(0, Number(cellInfo.row) || 0);
    const col = Math.max(0, Number(cellInfo.col) || 0);
    const isLargeRange = rowCount * colCount > 2000;

    return {
      row: row + (isLargeRange ? 0 : Math.floor((rowCount - 1) / 2)),
      col: col + (isLargeRange ? 0 : Math.floor((colCount - 1) / 2)),
    };
  }

  function getColumnName(col) {
    let value = Math.max(0, Number(col) || 0) + 1;
    let name = "";
    while (value > 0) {
      value -= 1;
      name = String.fromCharCode(65 + (value % 26)) + name;
      value = Math.floor(value / 26);
    }
    return name;
  }

  function getCrossSheetLabel(reference) {
    return (
      reference.sheetName +
      "!" +
      getColumnName(reference.col) +
      (Number(reference.row) + 1)
    );
  }

  function addTraceConnector(sheet, name, start, end, options) {
    const connector = sheet.shapes.addConnector(
      name,
      Shapes.ConnectorType.straight,
      0,
      0,
      0,
      0,
    );

    connector.startRow(start.row);
    connector.startColumn(start.col);
    connector.startRowOffset(
      start.rowOffset == null
        ? sheet.getRowHeight(start.row) / 2
        : start.rowOffset,
    );
    connector.startColumnOffset(
      start.colOffset == null
        ? sheet.getColumnWidth(start.col) / 2
        : start.colOffset,
    );
    connector.endRow(end.row);
    connector.endColumn(end.col);
    connector.endRowOffset(
      end.rowOffset == null
        ? sheet.getRowHeight(end.row) / 2
        : end.rowOffset,
    );
    connector.endColumnOffset(
      end.colOffset == null
        ? sheet.getColumnWidth(end.col) / 2
        : end.colOffset,
    );
    configureTraceArtifact(connector);

    const style = connector.style();
    style.line = style.line || {};
    style.line.color = options.color;
    style.line.width = 2;
    if (options.dashed) {
      style.line.lineStyle = Shapes.PresetLineDashStyle.dash;
    }
    style.line.beginArrowheadStyle = Shapes.ArrowheadStyle.oval;
    style.line.beginArrowheadWidth = Shapes.ArrowheadWidth.narrow;
    style.line.beginArrowheadLength = Shapes.ArrowheadLength.short;
    style.line.endArrowheadStyle = Shapes.ArrowheadStyle.triangle;
    style.line.endArrowheadWidth = Shapes.ArrowheadWidth.medium;
    style.line.endArrowheadLength = Shapes.ArrowheadLength.medium;
    connector.style(style);

    return connector;
  }

  function getCrossSheetMarkerAnchor(sheet, row, col, index) {
    const rowCount = Math.max(1, sheet.getRowCount());
    const colCount = Math.max(1, sheet.getColumnCount());
    const rowOffset = Math.floor((index + 1) / 2);
    const markerRow =
      index % 2 === 0
        ? Math.min(rowCount - 1, row + rowOffset)
        : Math.max(0, row - rowOffset);
    const maxMarkerStartCol = Math.max(0, colCount - 2);
    const markerCol =
      col + 4 <= maxMarkerStartCol
        ? col + 4
        : Math.max(0, Math.min(maxMarkerStartCol, col - 5));

    return { row: markerRow, col: markerCol };
  }

  function addCrossSheetTrace(
    sheet,
    row,
    col,
    reference,
    markerIndex,
    artifactId,
    isPrecedents,
  ) {
    const markerAnchor = getCrossSheetMarkerAnchor(
      sheet,
      row,
      col,
      markerIndex,
    );
    const markerName = "formulaTrace_crossMarker_" + artifactId;
    const rowHeight = sheet.getRowHeight(markerAnchor.row);
    const colWidth = sheet.getColumnWidth(markerAnchor.col);
    const markerEndCol = Math.min(
      sheet.getColumnCount() - 1,
      markerAnchor.col + 1,
    );
    const markerEndColWidth = sheet.getColumnWidth(markerEndCol);
    const markerWidth =
      colWidth +
      (markerEndCol === markerAnchor.col ? 0 : markerEndColWidth) -
      8;
    const marker = sheet.shapes.add(
      markerName,
      Shapes.AutoShapeType.rectangle,
      0,
      0,
      Math.max(20, markerWidth),
      Math.max(16, rowHeight - 4),
    );

    marker.startRow(markerAnchor.row);
    marker.startColumn(markerAnchor.col);
    marker.startRowOffset(2);
    marker.startColumnOffset(4);
    marker.endRow(markerAnchor.row);
    marker.endColumn(markerEndCol);
    marker.endRowOffset(Math.max(16, rowHeight - 2));
    marker.endColumnOffset(Math.max(4, markerEndColWidth - 4));
    marker.text(getCrossSheetLabel(reference));
    marker.alt("跳转到 " + getCrossSheetLabel(reference));
    configureTraceArtifact(marker);

    const color = isPrecedents ? "#4472C4" : "#70AD47";
    const markerStyle = marker.style();
    markerStyle.fill = markerStyle.fill || {};
    markerStyle.line = markerStyle.line || {};
    markerStyle.textEffect = markerStyle.textEffect || {};
    markerStyle.fill.color = isPrecedents ? "#D9EAF7" : "#E2F0D9";
    markerStyle.line.color = color;
    markerStyle.line.width = 1;
    markerStyle.textEffect.color = "#1F1F1F";
    markerStyle.textEffect.font = "10pt Calibri";
    markerStyle.textFrame.vAlign = GC.Spread.Sheets.VerticalAlign.center;
    marker.style(markerStyle);

    const source = { row: row, col: col };
    const markerConnectorAnchor = {
      row: markerAnchor.row,
      col: markerAnchor.col,
      rowOffset: rowHeight / 2,
      colOffset: 4,
    };
    addTraceConnector(
      sheet,
      "formulaTrace_crossConnector_" + artifactId,
      isPrecedents ? markerConnectorAnchor : source,
      isPrecedents ? source : markerConnectorAnchor,
      { color: color, dashed: true },
    );

    crossSheetTargets.set(markerName, {
      sheetName: reference.sheetName,
      row: Math.max(0, Number(reference.row) || 0),
      col: Math.max(0, Number(reference.col) || 0),
    });
    traceSheets.add(sheet);
  }

  function navigateToCrossSheetTarget(target) {
    spread.setActiveSheet(target.sheetName);
    const targetSheet = spread.getActiveSheet();
    if (!targetSheet || targetSheet.name() !== target.sheetName) {
      return;
    }

    targetSheet.setActiveCell(target.row, target.col);
    targetSheet.showCell(
      target.row,
      target.col,
      GC.Spread.Sheets.VerticalPosition.center,
      GC.Spread.Sheets.HorizontalPosition.center,
    );
  }

  function traceReferences(sheet, row, col, direction) {
    const isPrecedents = direction === "precedents";
    const references = isPrecedents
      ? sheet.getPrecedents(row, col) || []
      : sheet.getDependents(row, col) || [];
    const nextCells = [];
    references.forEach(function (reference) {
      const relationKey = getRelationKey(
        sheet,
        row,
        col,
        reference,
        isPrecedents,
      );

      if (!renderedRelations.has(relationKey)) {
        const artifactId = artifactCounter;
        artifactCounter += 1;
        if (reference.sheetName && reference.sheetName !== sheet.name()) {
          addCrossSheetTrace(
            sheet,
            row,
            col,
            reference,
            getNextCrossSheetMarkerIndex(sheet),
            artifactId,
            isPrecedents,
          );
        } else {
          const target = getTraceAnchor(reference);
          const start = isPrecedents ? target : { row: row, col: col };
          const end = isPrecedents ? { row: row, col: col } : target;
          addTraceConnector(
            sheet,
            "formulaTrace_" + artifactId,
            start,
            end,
            {
              color: isPrecedents ? "#4472C4" : "#70AD47",
              dashed: false,
            },
          );

          highlightTraceRange(
            sheet,
            reference,
            isPrecedents ? "#FFF2CC" : "#E2F0D9",
          );
          traceSheets.add(sheet);
        }
        renderedRelations.add(relationKey);
      }

      getReferenceCells(reference, sheet.name()).forEach(function (cell) {
        nextCells.push(cell);
      });
    });

    return nextCells;
  }

  function getTraceCell(sheet, direction) {
    const row = sheet.getActiveRowIndex();
    const col = sheet.getActiveColumnIndex();
    if (row < 0 || col < 0) {
      return null;
    }

    if (direction === "precedents") {
      const formula = sheet.getFormula(row, col);
      if (typeof formula !== "string" || formula.length === 0) {
        return null;
      }
    }

    return { row: row, col: col };
  }

  function traceNextLevel(direction) {
    if (!spread) {
      return;
    }

    const sheet = spread.getActiveSheet();
    const traceCell = getTraceCell(sheet, direction);
    if (!traceCell) {
      return;
    }

    const rootKey = getCellKey(sheet.name(), traceCell.row, traceCell.col);
    const stateKey = direction + "|" + rootKey;
    let traceState = traceStates.get(stateKey);
    if (!traceState) {
      traceState = {
        direction: direction,
        rootKey: rootKey,
        frontier: [
          {
            sheetName: sheet.name(),
            row: traceCell.row,
            col: traceCell.col,
          },
        ],
        visited: new Set(),
      };
      traceStates.set(stateKey, traceState);
    }

    const nextFrontier = [];
    traceState.frontier.forEach(function (cell) {
      const cellKey = getCellKey(cell.sheetName, cell.row, cell.col);
      if (traceState.visited.has(cellKey)) {
        return;
      }
      traceState.visited.add(cellKey);

      const cellSheet = getSheetByName(cell.sheetName);
      if (!cellSheet) {
        return;
      }

      if (direction === "precedents") {
        const formula = cellSheet.getFormula(cell.row, cell.col);
        if (typeof formula !== "string" || formula.length === 0) {
          return;
        }
      }

      traceReferences(cellSheet, cell.row, cell.col, direction).forEach(
        function (nextCell) {
          const nextCellKey = getCellKey(
            nextCell.sheetName,
            nextCell.row,
            nextCell.col,
          );
          if (!traceState.visited.has(nextCellKey)) {
            nextFrontier.push(nextCell);
          }
        },
      );
    });

    const uniqueFrontier = new Map();
    nextFrontier.forEach(function (cell) {
      uniqueFrontier.set(getCellKey(cell.sheetName, cell.row, cell.col), cell);
    });
    traceState.frontier = Array.from(uniqueFrontier.values());
  }

  /**
   * 绑定 sheet 的图形选中事件：点击跨表标记时跳转到目标位置。
   */
  function bindSheet(sheet) {
    if (!sheet || boundSheets.has(sheet)) {
      return;
    }

    boundSheets.add(sheet);
    sheet.bind(Events.ShapeSelectionChanged, function (event, args) {
      if (!args || !args.shape || !args.shape.isSelected()) {
        return;
      }

      const target = crossSheetTargets.get(args.shape.name());
      if (!target) {
        return;
      }

      args.shape.isSelected(false);
      navigateToCrossSheetTarget(target);
    });
  }

  // 安装干净导出管线：导出/另存时自动移除追踪痕迹
  installCleanExportPipeline(spread, highlightedCells);

  return {
    bindSheet: bindSheet,
    tracePrecedents: function () {
      traceNextLevel("precedents");
    },
    traceDependents: function () {
      traceNextLevel("dependents");
    },
    clearTrace: clearTrace,
  };
}
