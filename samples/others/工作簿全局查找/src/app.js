import * as GC from "@grapecity-software/spread-sheets";


const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
spread.setSheetCount(3)
const sheet1 = spread.getSheet(0);
const sheet2 = spread.getSheet(1);
const sheet3 = spread.getSheet(2);
sheet1.setValue(1, 1, "test1")
sheet2.setValue(2, 2, "test22")
sheet3.setValue(3, 3, "test333")

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
    alert(JSON.stringify(results))
    return results;
}

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

document.getElementById("btn").addEventListener("click", function() {
    globalSearch("test")
})
