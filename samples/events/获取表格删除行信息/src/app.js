import * as GC from "@grapecity-software/spread-sheets";


const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

// 定义表格数据：员工信息表
const headers = ["员工编号", "姓名", "部门", "职位", "月薪(元)"]
const data = [
  ["EMP001", "张伟", "研发部", "高级工程师", 18000],
  ["EMP002", "李娜", "市场部", "市场经理", 15000],
  ["EMP003", "王芳", "人事部", "HR专员", 10000],
  ["EMP004", "赵磊", "研发部", "前端开发", 14000],
  ["EMP005", "陈静", "财务部", "会计", 12000],
  ["EMP006", "刘洋", "研发部", "后端开发", 16000],
  ["EMP007", "周婷", "市场部", "品牌专员", 11000],
  ["EMP008", "吴强", "运营部", "运营总监", 20000],
  ["EMP009", "郑雪", "研发部", "测试工程师", 13000],
  ["EMP010", "孙浩", "销售部", "销售代表", 9000],
]

// 写入表头
headers.forEach((header, col) => {
  sheet.setValue(0, col, header)
})

// 写入数据
data.forEach((row, rowIndex) => {
  row.forEach((cell, col) => {
    sheet.setValue(rowIndex + 1, col, cell)
  })
})

// 创建 Table（从第0行第0列，共11行5列，含表头）
sheet.tables.add("员工信息表", 0, 0, 11, 5, GC.Spread.Sheets.Tables.TableThemes.medium2)

// 设置列宽
sheet.setColumnWidth(0, 90)
sheet.setColumnWidth(1, 80)
sheet.setColumnWidth(2, 90)
sheet.setColumnWidth(3, 120)
sheet.setColumnWidth(4, 100)


let deletTableRows = GC.Spread.Sheets.Commands.tableDeleteRowsForContextMenu.execute;

GC.Spread.Sheets.Commands.tableDeleteRowsForContextMenu.execute = function (
  content,
  options,
  isUndo
) {
  console.log(options);
  if (isUndo) {
    console.log("undoAction");
  } else {
    let sheet = content.getSheetFromName(options.sheetName);
    let table = sheet.tables.findByName(options.tableName)
    let changeRows = options.selections;
    console.log(
      sheet.getArray(
        changeRows[0].row,
        0,
        changeRows[0].rowCount,
        table.dataRange().colCount
      )
    );
  }
  return deletTableRows.apply(this, arguments);
};

