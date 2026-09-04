import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-shapes";

/**
 * 在分页位置添加线型形状，增强打印预览线的样式。
 *
 * 根据 `spread.pageInfo()` 返回的每一页的边界位置，在表格上绘制
 * 顶部 / 底部 / 左侧 / 右侧边框线，使分页边界清晰可见。
 *
 * @param {GC.Spread.Sheets.Workbook} spread - 工作簿对象
 * @param {GC.Spread.Sheets.Worksheet} sheet - 需要绘制分页线的工作表
 */
export function addPageBreakLines(spread, sheet) {
  spread.suspendPaint();

  let start = performance.now();

  // 获取当前工作表的索引
  const sheetIndex = getSheetIndex(spread, sheet);

  // 获取分页信息
  const pageInfos = spread.pageInfo(sheetIndex);

  if (!pageInfos || !pageInfos.pages || pageInfos.pages.length === 0) {
    console.log("没有分页信息");
    return;
  }

  console.log(`总页数: ${pageInfos.pages.length}`);

  // 用于记录已经添加过的线条位置，避免重复添加
  // key格式: 横线用 "h_y_x1_x2"，竖线用 "v_x_y1_y2"
  const addedLines = new Set();

  // 遍历每一页，在分页位置添加线型形状
  for (let i = 0; i < pageInfos.pages.length; i++) {
    const pageInfo = pageInfos.pages[i];
    const { row, rowCount, column, columnCount } = pageInfo;

    console.log(
      `第 ${i + 1} 页: 行=${row}, 列=${column}, 行数=${rowCount}, 列数=${columnCount}`,
    );

    // 计算当前页的边界位置
    let pageTop = 0;
    for (let r = 0; r < row; r++) {
      pageTop += sheet.getRowHeight(r);
    }

    let pageLeft = 0;
    for (let c = 0; c < column; c++) {
      pageLeft += sheet.getColumnWidth(c);
    }

    let pageBottom = pageTop;
    for (let r = row; r < row + rowCount; r++) {
      pageBottom += sheet.getRowHeight(r);
    }

    let pageRight = pageLeft;
    for (let c = column; c < column + columnCount; c++) {
      pageRight += sheet.getColumnWidth(c);
    }

    // 顶部边框线
    const topLineKey = `h_${pageTop}_${pageLeft}_${pageRight}`;
    if (!addedLines.has(topLineKey)) {
      const topLine = sheet.shapes.addConnector(
        `pageBorder_top_${i}`,
        GC.Spread.Sheets.Shapes.ConnectorType.straight,
        pageLeft,
        pageTop,
        pageRight,
        pageTop,
      );
      const topLineStyle = topLine.style();
      topLineStyle.line.color = "#000000";
      topLineStyle.line.width = 2;
      topLineStyle.line.lineStyle =
        GC.Spread.Sheets.Shapes.PresetLineDashStyle.solid;
      topLine.style(topLineStyle);
      addedLines.add(topLineKey);
    }

    // 底部边框线
    const bottomLineKey = `h_${pageBottom}_${pageLeft}_${pageRight}`;
    if (!addedLines.has(bottomLineKey)) {
      const bottomLine = sheet.shapes.addConnector(
        `pageBorder_bottom_${i}`,
        GC.Spread.Sheets.Shapes.ConnectorType.straight,
        pageLeft,
        pageBottom,
        pageRight,
        pageBottom,
      );
      const bottomLineStyle = bottomLine.style();
      bottomLineStyle.line.color = "#000000";
      bottomLineStyle.line.width = 2;
      bottomLineStyle.line.lineStyle =
        GC.Spread.Sheets.Shapes.PresetLineDashStyle.solid;
      bottomLine.style(bottomLineStyle);
      addedLines.add(bottomLineKey);
    }

    // 左侧边框线
    const leftLineKey = `v_${pageLeft}_${pageTop}_${pageBottom}`;
    if (!addedLines.has(leftLineKey)) {
      const leftLine = sheet.shapes.addConnector(
        `pageBorder_left_${i}`,
        GC.Spread.Sheets.Shapes.ConnectorType.straight,
        pageLeft,
        pageTop,
        pageLeft,
        pageBottom,
      );
      const leftLineStyle = leftLine.style();
      leftLineStyle.line.color = "#000000";
      leftLineStyle.line.width = 2;
      leftLineStyle.line.lineStyle =
        GC.Spread.Sheets.Shapes.PresetLineDashStyle.solid;
      leftLine.style(leftLineStyle);
      addedLines.add(leftLineKey);
    }

    // 右侧边框线
    const rightLineKey = `v_${pageRight}_${pageTop}_${pageBottom}`;
    if (!addedLines.has(rightLineKey)) {
      const rightLine = sheet.shapes.addConnector(
        `pageBorder_right_${i}`,
        GC.Spread.Sheets.Shapes.ConnectorType.straight,
        pageRight,
        pageTop,
        pageRight,
        pageBottom,
      );
      const rightLineStyle = rightLine.style();
      rightLineStyle.line.color = "#000000";
      rightLineStyle.line.width = 2;
      rightLineStyle.line.lineStyle =
        GC.Spread.Sheets.Shapes.PresetLineDashStyle.solid;
      rightLine.style(rightLineStyle);
      addedLines.add(rightLineKey);
    }
  }

  spread.resumePaint();

  let end = performance.now();

  console.log(`添加分页线耗时: ${(end - start).toFixed(2)} ms`);
  console.log("分页线添加完成！");
}

/**
 * 获取工作表在工作簿中的索引。
 * @param {GC.Spread.Sheets.Workbook} spread - 工作簿对象
 * @param {GC.Spread.Sheets.Worksheet} sheet - 工作表对象
 * @returns {number} 工作表索引，找不到时返回 0
 */
function getSheetIndex(spread, sheet) {
  for (let i = 0; i < spread.getSheetCount(); i++) {
    if (spread.getSheet(i) === sheet) {
      return i;
    }
  }
  return 0;
}
