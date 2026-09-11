# workbook-global-search

### 问题：如何在工作簿范围内全局查找内容？

***

#### 背景

在实际的项目需求中，不少用户有需要在整个Workbook上去查找单元格上特定的内容，本文就此需求，介绍实现方案。

#### 查找单个Sheet中的字符串：

```auto
/**
 * 在单个sheet中搜索所有匹配项
 * @param {number} sheetIndex - sheet索引
 * @param {Object} sheet - sheet对象
 * @param {Object} searchCondition - 搜索条件
 * @param {Array} results - 结果数组
 */
function searchInSheet(sheetIndex, sheet, searchCondition, results) {
    let searchResult = spread.search(searchCondition);

    // 如果没有找到，直接返回
    if (!searchResult || searchResult.searchFoundFlag === 0) {
        return;
    }

    // 循环搜索直到没有更多结果
    while (searchResult && searchResult.searchFoundFlag !== 0) {
        // 获取单元格值
        let value = sheet.getValue(searchResult.foundRowIndex, searchResult.foundColumnIndex);

        // 添加结果到数组
        results.push({
            sheetIndex: sheetIndex,
            sheetName: sheet.name(),
            row: searchResult.foundRowIndex,
            col: searchResult.foundColumnIndex,
            value: value
        });

        // 更新搜索起始位置，继续搜索下一个
        searchCondition.rowStart = searchResult.foundRowIndex;
        searchCondition.columnStart = searchResult.foundColumnIndex + 1;

        // 继续搜索
        searchResult = spread.search(searchCondition);
    }
}
```

通过上述代码段，即可实现单Sheet中特定内容查找的需求。

#### 遍历查找所有Sheet：

```auto
/**
 * 全局搜索函数 - 搜索所有sheet中的字符串
 * @param {string} searchText - 要搜索的字符串
 * @param {Object} options - 可选配置
 * @param {boolean} options.ignoreCase - 是否忽略大小写，默认true
 * @param {boolean} options.useWildCards - 是否使用通配符，默认true
 * @returns {Array} 搜索结果数组，每个结果包含 sheetIndex, sheetName, row, col, value
 */
function globalSearch(searchText, options = {}) {
    if (!searchText || searchText === "") {
        return [];
    }

    const { ignoreCase = true, useWildCards = true } = options;
    let results = []; // 搜索结果数组

    // 创建搜索条件
    let searchCondition = new GC.Spread.Sheets.Search.SearchCondition();
    searchCondition.searchString = searchText;
    searchCondition.searchTarget = GC.Spread.Sheets.Search.SearchFoundFlags.cellText;

    // 设置搜索标志：忽略大小写、使用通配符
    searchCondition.searchFlags = 0;
    if (ignoreCase) {
        searchCondition.searchFlags |= GC.Spread.Sheets.Search.SearchFlags.ignoreCase;
    }
    if (useWildCards) {
        searchCondition.searchFlags |= GC.Spread.Sheets.Search.SearchFlags.useWildCards;
    }

    const beginTime = new Date();

    // 遍历所有sheet进行搜索
    for (let i = 0; i < spread.getSheetCount(); i++) {
        let sheet = spread.getSheet(i);
        if (!sheet) continue;

        searchCondition.startSheetIndex = i;
        searchCondition.endSheetIndex = i;
        searchCondition.rowStart = 0;
        searchCondition.columnStart = 0;
        searchCondition.rowEnd = sheet.getRowCount() - 1;
        searchCondition.columnEnd = sheet.getColumnCount() - 1;

        // 在当前sheet中搜索所有匹配项
        searchInSheet(i, sheet, searchCondition, results);
    }

    const endTime = new Date();
    console.log('Global search completed in', endTime - beginTime, 'ms, found', results.length, 'results');

    return results;
}
```

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
