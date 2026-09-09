import * as GC from "@grapecity-software/spread-sheets";

const Events = GC.Spread.Sheets.Events;

/**
 * 安装“粘贴不影响数据绑定”功能。
 *
 * 问题：复制/剪切后粘贴到绑定了数据源的单元格时，粘贴操作会用源单元格的
 * 内容覆盖目标单元格的绑定路径（binding path），导致目标单元格与数据源
 * 的绑定关系丢失。
 *
 * 解决：在 ClipboardPasting 事件中提前保存目标区域（以及剪切时的源区域）
 * 原有的绑定路径；待 ClipboardPasted 事件触发后立即把这些绑定路径写回，
 * 从而保证粘贴前后绑定关系保持一致。
 *
 * @param {GC.Spread.Sheets.Workbook} spread - 设计器的工作簿对象
 */
export function installBindingPreserve(spread) {
  // 保存粘贴前源区域和目标区域的绑定路径
  let sourceBindingPaths = [];
  let targetBindingPaths = [];

  // 粘贴前：保存源区域和目标区域已有的绑定路径
  spread.bind(Events.ClipboardPasting, function (sender, args) {
    targetBindingPaths = [];
    sourceBindingPaths = [];

    const sheet = args.sheet;
    const { row, col, rowCount, colCount } = args.cellRange;

    // 1. 保存目标区域的绑定路径
    for (let i = row; i < row + rowCount; i++) {
      for (let j = col; j < col + colCount; j++) {
        targetBindingPaths.push({
          row: i,
          col: j,
          bindingPath: sheet.getBindingPath(i, j),
        });
      }
    }

    // 2. 如果是剪切操作，还要保存源区域的绑定路径
    if (args.isCutting && args.fromSheet && args.fromRange) {
      const fromSheet = args.fromSheet;
      const fromRange = args.fromRange;
      for (let i = fromRange.row; i < fromRange.row + fromRange.rowCount; i++) {
        for (
          let j = fromRange.col;
          j < fromRange.col + fromRange.colCount;
          j++
        ) {
          sourceBindingPaths.push({
            row: i,
            col: j,
            bindingPath: fromSheet.getBindingPath(i, j),
          });
        }
      }
    }
  });

  // 粘贴后：恢复源区域和目标区域原本的绑定路径
  spread.bind(Events.ClipboardPasted, function (sender, args) {
    const sheet = args.sheet;
    spread.suspendPaint();

    // 1. 如果是剪切操作，恢复源区域原本的绑定路径
    if (args.isCutting) {
      for (const item of sourceBindingPaths) {
        sheet.setBindingPath(item.row, item.col, item.bindingPath);
      }
    }
    // 2. 恢复目标区域原本的绑定路径
    for (const item of targetBindingPaths) {
      let value = sheet.getValue(item.row, item.col)
      sheet.setBindingPath(item.row, item.col, item.bindingPath);
      sheet.setValue(item.row, item.col, value)
    }


    spread.resumePaint();
    targetBindingPaths = [];
    sourceBindingPaths = [];
  });
}
