import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

let tableStyle = GC.Spread.Sheets.Tables.TableThemes.light1;
let table = sheet.tables.add('table1', 0, 0, 4, 4, tableStyle);
// set value to the table
sheet.setArray(0, 0, [
    ['Id', 'Name', 'Age', 'Grade'],
    [1000, 'Tom', 23, 98],
    [1001, 'Bob', 29, 80],
    [1002, 'Tony', 53, 99]
])
sheet.getRange(1, 2, 3, 1).formatter("0.000%")
sheet.setColumnWidth(2, 400)
let tableFilter = table.rowFilter()
//控制表格第一列筛选按钮不显示
tableFilter.filterButtonVisible(0, false)

document.getElementById("btn").addEventListener("click", function () {
    let c1 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
        GC.Spread.Sheets.ConditionalFormatting.ConditionType.numberCondition,
        {
            compareType: GC.Spread.Sheets.ConditionalFormatting.GeneralComparisonOperators.greaterThan,
            expected: 25
        });
    let c2 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
        GC.Spread.Sheets.ConditionalFormatting.ConditionType.numberCondition,
        {
            compareType: GC.Spread.Sheets.ConditionalFormatting.GeneralComparisonOperators.lessThan,
            expected: 40
        });
    let c3 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
        GC.Spread.Sheets.ConditionalFormatting.ConditionType.relationCondition,
        {
            compareType: GC.Spread.Sheets.ConditionalFormatting.LogicalOperators.and,
            item1: c1,
            item2: c2
        });


    tableFilter.addFilterItem(2, c3);
    tableFilter.filter(2);

})