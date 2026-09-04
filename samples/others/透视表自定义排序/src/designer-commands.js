import * as GC from "@grapecity-software/spread-sheets";

/**
 * 使用 BFS 算法找到与起始单元格连通的所有有数据的单元格区域。
 * 用于选中单个单元格时自动推断筛选范围。
 * @param {GC.Spread.Sheets.Worksheet} sheet - 工作表对象
 * @param {number} startRow - 起始行索引
 * @param {number} startCol - 起始列索引
 * @returns {Object} 包含 row, col, rowCount, colCount 的范围对象
 */
export function findConnectedDataRegion(sheet, startRow, startCol) {
  let visited = {};
  let queue = [];
  let minRow = startRow,
    maxRow = startRow;
  let minCol = startCol,
    maxCol = startCol;

  // 获取工作表的实际范围，遍历搜索的边界
  let maxSheetRow = sheet.getRowCount();
  let maxSheetCol = sheet.getColumnCount();

  /**
   * 检查单元格是否有数据
   */
  function hasCellData(row, col) {
    let value = sheet.getValue(row, col);
    return value !== null && value !== undefined && value !== "";
  }

  /**
   * 检查坐标是否有效且在合理范围内
   */
  function isValidCell(row, col) {
    return row >= 0 && col >= 0 && row < maxSheetRow && col < maxSheetCol;
  }

  /**
   * 生成单元格键用于访问记录
   */
  function getCellKey(row, col) {
    return row + "_" + col;
  }

  // 初始化：如果起始点有数据，开始探索
  if (hasCellData(startRow, startCol)) {
    queue.push({ row: startRow, col: startCol });
    visited[getCellKey(startRow, startCol)] = true;
  } else {
    // 如果起始点没有数据，返回单个空单元格的范围
    return {
      row: startRow,
      col: startCol,
      rowCount: 1,
      colCount: 1,
    };
  }

  // BFS算法遍历：层次遍历所有相邻的有数据单元格
  while (queue.length > 0) {
    let current = queue.shift();
    let row = current.row;
    let col = current.col;

    // 更新范围边界
    minRow = Math.min(minRow, row);
    maxRow = Math.max(maxRow, row);
    minCol = Math.min(minCol, col);
    maxCol = Math.max(maxCol, col);

    // 定义四个方向的相邻单元格（上下左右）
    let directions = [
      { dRow: -1, dCol: 0 }, // 上
      { dRow: 1, dCol: 0 }, // 下
      { dRow: 0, dCol: -1 }, // 左
      { dRow: 0, dCol: 1 }, // 右
    ];

    // 检查四个方向的相邻单元格
    for (let i = 0; i < directions.length; i++) {
      let newRow = row + directions[i].dRow;
      let newCol = col + directions[i].dCol;
      let cellKey = getCellKey(newRow, newCol);

      // 如果新单元格有效且未访问且有数据，加入队列
      if (
        isValidCell(newRow, newCol) &&
        !visited[cellKey] &&
        hasCellData(newRow, newCol)
      ) {
        visited[cellKey] = true;
        queue.push({ row: newRow, col: newCol });
      }
    }
  }

  // 返回连通区域的范围信息
  return {
    row: minRow,
    col: minCol,
    rowCount: maxRow - minRow + 1,
    colCount: maxCol - minCol + 1,
  };
}

/**
 * 根据当前选中区域自动应用行筛选器（排除标题行）。
 * 若选中区域处于表格（Table）中，返回 null，表示应交给默认命令逻辑处理。
 * @param {GC.Spread.Sheets.Worksheet} worksheet - 工作表对象
 * @returns {boolean|null} true=已处理（应用或移除了筛选器）；null=应回退到原命令
 */
function applyFilterFromSelection(worksheet) {
  const selection = worksheet.getSelections()?.[0];
  if (!selection) {
    return true;
  }

  if (worksheet.tables.find(selection.row, selection.col)) {
    return null;
  }

  if (worksheet.rowFilter()) {
    worksheet.rowFilter(null);
    return true;
  }

  let { row, col, rowCount, colCount } = selection;
  let range;
  if (rowCount === 1) {
    range = findConnectedDataRegion(worksheet, row, col);
    ({ row, col, rowCount, colCount } = range);
  }

  if (row === -1) {
    range = new GC.Spread.Sheets.Range(row + 2, col, rowCount - 1, colCount);
  } else {
    range = new GC.Spread.Sheets.Range(row + 1, col, rowCount - 1, colCount);
  }
  const filter = new GC.Spread.Sheets.Filter.HideRowFilter(range);
  worksheet.rowFilter(filter);
  return true;
}

/**
 * 修改设计器的 setFilter / setFilterData 命令：选中单个单元格时，
 * 自动寻找连通数据区域并应用行筛选器（排除标题行）；已存在筛选器时移除。
 * 选区处于表格内时回退到设计器默认行为。
 * @returns {Object} 需合并到 designerConfig.commandMap 的命令映射
 */
export function buildFilterCommandMap() {
  const commandMap = {};

  const setFilterCmd = GC.Spread.Sheets.Designer.getCommand(
    GC.Spread.Sheets.Designer.CommandNames.SetFilter,
  );
  const oldFilterExecute = setFilterCmd.execute;
  setFilterCmd.execute = function (context) {
    const workbook = context.getWorkbook();
    const worksheet = workbook.getActiveSheet();
    const handled = applyFilterFromSelection(worksheet);
    if (handled === null) {
      oldFilterExecute.call(this, context);
    }
  };
  commandMap.setFilter = setFilterCmd;

  const setFilterDataCmd = GC.Spread.Sheets.Designer.getCommand(
    GC.Spread.Sheets.Designer.CommandNames.SetFilterData,
  );
  const oldFilterDataExecute = setFilterDataCmd.execute;
  setFilterDataCmd.execute = function (context) {
    const workbook = context.getWorkbook();
    const worksheet = workbook.getActiveSheet();
    const handled = applyFilterFromSelection(worksheet);
    if (handled === null) {
      oldFilterDataExecute.call(this, context);
    }
  };
  commandMap.setFilterData = setFilterDataCmd;

  return commandMap;
}

/**
 * 注册工作表右键菜单“筛选”命令（contextmenuFilterForSheet）。
 * 与设计器的 setFilter 命令行为一致，但作为一个可撤销的命令注册，
 * 供右键菜单 / 编程方式调用。
 * @param {GC.Spread.Sheets.Workbook} spread - 工作簿对象
 */
export function registerSheetFilterContextCommand(spread) {
  let command = {
    canUndo: true,
    execute: function (context, options, isUndo) {
      let Commands = GC.Spread.Sheets.Commands;
      options.cmd = "contextmenuFilterForSheet";
      if (isUndo) {
        Commands.undoTransaction(context, options);
        return true;
      } else {
        Commands.startTransaction(context, options);
        const worksheet = context.getActiveSheet();
        applyFilterFromSelection(worksheet);
        Commands.endTransaction(context, options);
        return true;
      }
    },
  };
  let commandManager = spread.commandManager();
  commandManager.register("contextmenuFilterForSheet", command);
}
