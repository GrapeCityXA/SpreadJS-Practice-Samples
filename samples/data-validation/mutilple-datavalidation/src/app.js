import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

//  数据校验规则：2024年12月31日之后的日期
var condition1 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
  GC.Spread.Sheets.ConditionalFormatting.ConditionType.dateCondition,
  {
    compareType:
      GC.Spread.Sheets.ConditionalFormatting.DateCompareType.afterEqualsTo,
    expected: new Date(2024, 11, 31),
  },
);
//  数据校验规则：2025年12月31日之前的日期
var condition2 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
  GC.Spread.Sheets.ConditionalFormatting.ConditionType.dateCondition,
  {
    compareType:
      GC.Spread.Sheets.ConditionalFormatting.DateCompareType.beforeEqualsTo,
    expected: new Date(2025, 11, 31),
  },
);
//  数据校验规则：2024年12月31日至2025年12月31日之间的日期
var nCondition = new GC.Spread.Sheets.ConditionalFormatting.Condition(
  GC.Spread.Sheets.ConditionalFormatting.ConditionType.relationCondition,
  {
    compareType: GC.Spread.Sheets.ConditionalFormatting.LogicalOperators.and,
    item1: condition1,
    item2: condition2,
  },
);

var validator = new GC.Spread.Sheets.DataValidation.DefaultDataValidator(
  nCondition,
);
validator.type(GC.Spread.Sheets.DataValidation.CriteriaType.custom);
sheet
  .getRange(-1, 0, -1, 1, GC.Spread.Sheets.SheetArea.viewport)
  .validator(validator);
spread.options.highlightInvalidData = true;
//  合规数据日期：2025年10月31日
sheet.setValue(0, 0, new Date(2025, 9, 31));
//  不合规数据日期：2025年1月31日
sheet.setValue(2, 0, new Date(2025, 12, 31));
sheet.autoFitColumn(0);
