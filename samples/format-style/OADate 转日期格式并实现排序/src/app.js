import * as GC from "@grapecity-software/spread-sheets";
/**
 * oADate类型日期或时间戳日期转换为"yyy-MM-dd hh:mm:ss"类型展示
 * 同时给表格每列补充筛选功能
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet();
//构造数据源
let datasource = [
    { name: 'Alice', age: 27, birthday: '/OADate(44382.57994212963)/', position: 'PM' },
    { name: 'Alice1', age: 27, birthday: '/OADate(44382.57994212963)/', position: 'PM' },
    { name: 'Alice2', age: 27, birthday: '/OADate(44382.57994212963)/', position: 'PM' },
    { name: 'Alice3', age: 27, birthday: 1497605107000, position: 'PM' },
    { name: 'Alice4', age: 27, birthday: 1497605068000, position: 'PM' },
    { name: 'Alice5', age: 27, birthday: 1497605102000, position: 'PM' },
    { name: 'Alice6', age: 27, birthday: 1497605049000, position: 'PM' },
    { name: 'Alice7', age: 27, birthday: 1497605099000, position: 'PM' },
    { name: 'Alice8', age: 27, birthday: 1497605054000, position: 'PM' },
    { name: 'Alice9', age: 27, birthday: 1497605080000, position: 'PM' },
    { name: 'Alice10', age: 27, birthday: 1497605055000, position: 'PM' },
    { name: 'Alice11', age: 27, birthday: 1497605097000, position: 'PM' }
];
//按照正则表达式匹配日期数据，然后转换为Date类型
function fromOADate(date) {
    let oaDateReg = new RegExp('^/OADate\\(([-+]?(\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)\\)/\\s*$');
    if (typeof date === "string" && oaDateReg.test(date)) {
        let oadate = parseFloat(date.match(oaDateReg)[1]);
        let ms = (oadate * 86400000 * 1440 - 25569 * 86400000 * 1440 + new Date((oadate - 25569) * 86400000).getTimezoneOffset() * 86400000) / 1440;
        return new Date(ms);
    } else {
        return date;
    }
}
//构造表头信息
let colInfo = [{
    name: 'name',
    displayName: '姓名'
},
{
    name: 'age',
    displayName: 'Age'
},
{
    name: 'birthday',
    displayName: '生日',
    formatter: 'yyyy-MM-dd hh:mm:ss',
    //转换日期列数据
    value: function (row, value) {
        if (arguments.length === 1 && typeof (row.birthday) === 'string') {
            row.birthday = fromOADate(row.birthday).valueOf();
        } else {
            return new Date(row.birthday);
        }
    }
},
{
    name: 'position',
    displayName: 'Position',
    isHideFilter: false
}
];

//表格设置排序，筛选
function setRowFilter(sheet) {
    let rowCount, colCount;
    rowCount = sheet.getRowCount();
    colCount = sheet.getColumnCount();
    sheet.rowFilter(new GC.Spread.Sheets.Filter.HideRowFilter(new GC.Spread.Sheets.Range(0, 0, rowCount, colCount)));
}

//重新定义表格默认样式
function resetDefaultStyle(sheet) {
    //给单元格设置默认样式
    sheet.defaults.rowHeight = 26;
    sheet.defaults.colHeaderRowHeight = 30;
    sheet.defaults.colWidth = 200;
    sheet.options.protectionOptions = {
        allowFilter: true,
        allowSort: true,
        allowResizeRows: true,
        allowResizeColumns: true,
        allowEditObjects: true
    };
    let defaultStyle = sheet.getDefaultStyle();
    defaultStyle.foreColor = "#666666";
    defaultStyle.font = '9pt "Helvetica Neue", Helvetica, Microsoft Yahei, Hiragino Sans GB, WenQuanYi Micro Hei, sans-serif';
    defaultStyle.vAlign = GC.Spread.Sheets.VerticalAlign.center;
    defaultStyle.hAlign = GC.Spread.Sheets.HorizontalAlign.center;
    sheet.setDefaultStyle(defaultStyle);
    sheet.setDefaultStyle(defaultStyle, GC.Spread.Sheets.SheetArea.colHeader);
    sheet.setDefaultStyle(defaultStyle, GC.Spread.Sheets.SheetArea.colHeader);
}

//给表格设置数据源、样式信息、添加过滤功能
sheet.autoGenerateColumns = true;
sheet.setDataSource(datasource);
sheet.bindColumns(colInfo);
resetDefaultStyle(sheet);
setRowFilter(sheet);

