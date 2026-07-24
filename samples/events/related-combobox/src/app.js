import * as GC from "@grapecity-software/spread-sheets";

GC.Spread.Sheets.LicenseKey = "";
/**
 * 更新一个下拉框的中值时，与之关联的其他下拉框的内容也发生变化
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet();
//创建C4单元格下拉框对象并将其应用到表单中
let combo1 = new GC.Spread.Sheets.CellTypes.ComboBox();
combo1.items([
  {
    text: "张老师",
    value: "MrZhang",
  },
  {
    text: "王老师",
    value: "MrWang",
  },
  {
    text: "李老师",
    value: "MrLi",
  },
]);
sheet.setCellType(3, 2, combo1, GC.Spread.Sheets.SheetArea.viewport);
combo1.editorValueType(GC.Spread.Sheets.CellTypes.EditorValueType.value);

// 创建下拉框单元格类型并应用于D4
let combo2 = new GC.Spread.Sheets.CellTypes.ComboBox();
combo2.items([
  {
    text: "英语",
    value: "English",
  },
  {
    text: "语文",
    value: "Chinese",
  },
  {
    text: "数学",
    value: "Math",
  },
]);
combo2.editorValueType(GC.Spread.Sheets.CellTypes.EditorValueType.value);
sheet.setCellType(3, 3, combo2, GC.Spread.Sheets.SheetArea.viewport);
sheet.setValue(3, 2, "MrZhang");
sheet.setValue(3, 3, "English");
//监听C4单元格值更新事件 更新关联下拉框D4的内容
sheet.bind(GC.Spread.Sheets.Events.ValueChanged, function (e, info) {
  let row = info.row;
  let col = info.col;
  if (row == 3 && col == 2) {
    let value = info.newValue;
    if (value == "MrZhang") {
      combo2.items([
        {
          text: "英语",
          value: "English",
        },
        {
          text: "语文",
          value: "Yuwen",
        },
        {
          text: "数学",
          value: "Shuxue",
        },
      ]);

      sheet.setCellType(3, 3, combo2, GC.Spread.Sheets.SheetArea.viewport);
      sheet.setValue(3, 3, "English");
    }
    if (value == "MrWang") {
      combo2.items([
        {
          text: "历史",
          value: "Lishi",
        },
        {
          text: "地理",
          value: "Dili",
        },
        {
          text: "政治",
          value: "Zhengzhi",
        },
      ]);
      sheet.setCellType(3, 3, combo2, GC.Spread.Sheets.SheetArea.viewport);
      sheet.setValue(3, 3, "Lishi");
    }
    if (value == "MrLi") {
      combo2.items([
        {
          text: "体育",
          value: "Tiyu",
        },
        {
          text: "音乐",
          value: "Yinyue",
        },
        {
          text: "美术",
          value: "Meishu",
        },
      ]);
      sheet.setCellType(3, 3, combo2, GC.Spread.Sheets.SheetArea.viewport);
      sheet.setValue(3, 3, "Tiyu");
    }
  }
});
