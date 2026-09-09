import * as GC from "@grapecity-software/spread-sheets";

/**
 * 通过重写toJson方法，用户可将一些自定义信息，比如下面示例中的AAA属性,在调用spread.toJson方法时带出到生成的json文件中.
 */
  var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
      sheetCount: 1
  })
  var sheet = spread.getActiveSheet();
  //声明一个样式对象 并为其属性赋值
  var mystyle = new GC.Spread.Sheets.Style();
  mystyle.AAA = 1;
  mystyle.backColor = "green";
  sheet.setStyle(0, 0, mystyle);
  var oldToJson = GC.Spread.Sheets.Style.prototype.toJSON;
  //重写Style的toJson方法
  GC.Spread.Sheets.Style.prototype.toJSON = function() {
      //通过apply使其具有oldToJson的所有方法和属性
      var json = oldToJson.apply(this, arguments);
      //新增属性AAA
      json.AAA = this.AAA;
      sheet.setValue(1,1,JSON.stringify(json));
      return json;
  }
  let fullJson = JSON.stringify(spread.toJSON());
  sheet.setValue(3,3,fullJson)
