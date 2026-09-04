import * as GC from "@grapecity-software/spread-sheets";
// Title:自定义数据校验
// Description：自定义数据校验
// Tag:数据校验

var data = [{
    name: 111,
    value: 1,
}, {
    name: 111,
    value: '非法值',
}, {
    name: 222,
    value: null,
}, {
    name: 222,
    value: 2,
}, {
    name: 222,
    value: 3,
}, {
    name: 222,
    value: "",
}, {
    name: 222,
    value: 5,
},];

// 合并单元格函数
function addSpanShow(arr, propName, colNums) {
    const merges = [];
    const newArr = [];
    arr.forEach((item, index) => {
        if (index === 0) {
            newArr.push(index);
        } else {
            const isDiff = propName.some((elem) => {
                return item[elem] !== arr[index - 1][elem];
            });
            if (isDiff) {
                newArr.push(index);
            }
        }
    });
    newArr.forEach((item, index) => {
        const rowspan = (index === newArr.length - 1) ? (arr.length - item) : (newArr[index + 1] - item);
        colNums.forEach((i) => {
            merges.push({
                row: item,
                col: i,
                rowspan,
                colspan: 1,
            });
        });
    });
    return merges;
}

// 初始化表单
function initSpread(spread, data) {
    spread.suspendPaint();

    const sheet = spread.getActiveSheet();
    sheet.reset();
    const colInfos = [{
        name: 'name',
        displayName: '名称',
        size: 100,
    }, {
        name: 'value',
        displayName: '数值',
        size: 100,
    },];
    sheet.setDataSource(data);
    sheet.bindColumns(colInfos);
    // 合并
    const merges = addSpanShow(data, ['name'], [0]);
    merges.forEach((item) => {
        const {
            row, col, rowspan, colspan
        } = item;
        sheet.addSpan(row, col, rowspan, colspan); // 行坐标，列坐标，行数， 列数
        sheet.getCell(row, col).vAlign(GC.Spread.Sheets.VerticalAlign.center); // 垂直居中
    });
    // 添加合计行
    const rowCount = sheet.getRowCount();
    if (rowCount > 0) {
        sheet.addRows(sheet.getRowCount(), 1);
        sheet.setValue(sheet.getRowCount() - 1, 0, '合计');
        sheet.setFormula(sheet.getRowCount() - 1, 1, '=SUM(B1:B2)');
    }

    // 以下是添加数据校验的代码部分：
    // 先设置高亮显示
    spread.options.highlightInvalidData = true;
    // 创建校验条件，自定义
    var cCondition = new CustomerCondition();
    var validator1 = new GC.Spread.Sheets.DataValidation.DefaultDataValidator(cCondition);
    validator1.ignoreBlank(false);
    validator1.type(GC.Spread.Sheets.DataValidation.CriteriaType.custom);

    sheet.setDataValidator(-1, 1, validator1);
    spread.resumePaint();
}

// 用户自定义数据校验条件
function CustomerCondition() {
    var self = this;
    // 当前自定义条件名称
    self.conditionType = "CustomerCondition";
}
CustomerCondition.prototype = new GC.Spread.Sheets.ConditionalFormatting.Condition();
CustomerCondition.prototype.evaluate = function (evaluator, baseRow, baseColumn, actualValue) {
    // 在此设置判断条件，非数判断
    if (isNaN(parseFloat(actualValue))) {
        return false;
    } else {
        return true;
    }
}
var spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'), {
    tabStripVisible: false, // 隐藏sheet栏
    scrollbarMaxAlign: true, // 滚动条对齐表单最后一个数据
});
initSpread(spread, data);