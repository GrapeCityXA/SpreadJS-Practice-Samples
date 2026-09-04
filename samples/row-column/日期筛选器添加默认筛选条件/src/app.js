import * as GC from "@grapecity-software/spread-sheets";
/**
 * 当某一区域内容为时间类型时，添加筛选时，包含默认的筛选项。
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));
let sheet = spread.getActiveSheet();

//初始化表单
sheet.setArray(1,0,[[new Date('2021-09-09')],[new Date('2021-09-07')],[new Date('2021-09-05')]])
sheet.setFormatter(-1,0,'YYYY-MM-DD')
sheet.getCell(-1,0).width(200)

//第一列添加时间筛选器
sheet.rowFilter(new GC.Spread.Sheets.Filter.HideRowFilter(new GC.Spread.Sheets.Range(1,0,sheet.getRowCount()-1,3)))

//添加默认筛选条件
let condition = new GC.Spread.Sheets.ConditionalFormatting.Condition(GC.Spread.Sheets.ConditionalFormatting.ConditionType.dateCondition,{
    compareType: GC.Spread.Sheets.ConditionalFormatting.DateCompareType.equalsTo,
    //默认筛选条件为"2021-09-05"
    expected: new Date('2021-09-05')
})

let rowFilter = sheet.rowFilter()
rowFilter.addFilterItem(0,condition)
rowFilter.filter(0)