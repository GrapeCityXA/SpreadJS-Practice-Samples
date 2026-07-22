import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";
// Title：单元格动态数据绑定
// Description：单元格动态数据绑定
// Tag：数据绑定，单元格
GC.Spread.Common.CultureManager.culture("zh-cn");

$(document).ready(function () {
  var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
  var sheet = spread.getActiveSheet();
  sheet.getRange(0, -1, 2, -1).hAlign(GC.Spread.Sheets.HorizontalAlign.center);
  sheet.getRange(0, -1, 2, -1).vAlign(GC.Spread.Sheets.VerticalAlign.center);
  //绘制表头
  sheet.setValue(0, 0, "工号");
  sheet.setValue(0, 1, "姓名");
  sheet.setValue(0, 2, "部门");
  sheet.setValue(0, 3, "工资");
  sheet.setValue(1, 3, "基本工资");
  sheet.setValue(1, 4, "岗位津贴");
  sheet.setValue(1, 5, "金额");
  sheet.addSpan(0, 0, 2, 1);
  sheet.addSpan(0, 1, 2, 1);
  sheet.addSpan(0, 2, 2, 1);
  sheet.addSpan(0, 3, 1, 3);
  $("#addColumnHeader").click(function () {
    //这里动态表头信息是已知的，假设为4列,起始列已知为第三列之后
    sheet.addColumns(3, 4);
    sheet.setValue(0, 3, "非应税收入");
    sheet.setValue(1, 3, "报销");
    sheet.setValue(1, 4, "午餐补贴");
    sheet.setValue(1, 5, "差额补贴");
    sheet.setValue(1, 6, "金额");
    sheet.addSpan(0, 3, 1, 4);
  });
  $("#binddata").click(function () {
    //这里绑定的数据是已知的，而且与新增的动态列是匹配吻合的，假设数据源如下:
    var data = {
      datasource: [
        {
          id: "1",
          name: "Pencil",
          department: "admin",
          basepay: 2000,
          jobpay: 5000,
          subtotal: 7000,
          reimbursement: 200,
          allowance1: 400,
          allowance2: 400,
          total: 1000,
        },
      ],
    };
    var table = sheet.tables.add("tableRecords", 2, 0, 2, 10);
    table.autoGenerateColumns(false);
    var tableColumns = [];
    var names = [
      "id",
      "name",
      "department",
      "reimbursement",
      "allowance1",
      "allowance2",
      "total",
      "basepay",
      "jobpay",
      "subtotal",
    ];
    names.forEach(function (data, index) {
      var tableColumn = new GC.Spread.Sheets.Tables.TableColumn();
      tableColumn.name(names[index]);
      tableColumn.dataField(data);
      tableColumns.push(tableColumn);
    });
    table.bindColumns(tableColumns);
    table.bindingPath("datasource");
    var source = new GC.Spread.Sheets.Bindings.CellBindingSource(data);
    sheet.setDataSource(source);
    //隐藏表头
    table.showHeader(false);
    sheet.deleteRows(2, 1);
  });
});
