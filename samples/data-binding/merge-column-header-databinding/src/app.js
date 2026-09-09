import * as GC from "@grapecity-software/spread-sheets";
// Title：列头数据绑定
// Description：对列头数据绑定
// Tag：列头，数据绑定
GC.Spread.Common.CultureManager.culture('zh-cn');


var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
    sheetCount: 3
});
var sheet = spread.getActiveSheet();
sheet.setRowCount(3, GC.Spread.Sheets.SheetArea.colHeader);
sheet.addSpan(0, 0, 3, 1, GC.Spread.Sheets.SheetArea.colHeader);
sheet.addSpan(0, 1, 3, 1, GC.Spread.Sheets.SheetArea.colHeader);
var datasource = [{
    name: 'Alice',
    age: 27,
    birthday: '1985/08/31',
    position: 'PM'
}];
// bindColumn one by one 
var nameColInfo = {
    name: 'name',
    displayName: 'Display Name',
    size: 70
};
var ageColInfo = {
    name: 'age',
    displayName: 'Age',
    size: 40,
    resizable: false
};
var birthdayColInfo = {
    name: 'birthday',
    displayName: 'Birthday',
    formatter: 'd/M/yy',
    size: 120
};
var positionColInfo = {
    name: 'position',
    displayName: 'Position',
    size: 50
};
sheet.autoGenerateColumns = false;
sheet.setDataSource(datasource);
sheet.bindColumn(0, nameColInfo);
sheet.bindColumn(1, birthdayColInfo);
sheet.bindColumn(2, ageColInfo);
sheet.bindColumn(3, positionColInfo);
sheet.addSpan(0, 1, 3, 1, GC.Spread.Sheets.SheetArea.colHeader);
sheet.setValue(0, 0, "name", GC.Spread.Sheets.SheetArea.colHeader);
sheet.setValue(0, 1, "birthday", GC.Spread.Sheets.SheetArea.colHeader);
sheet.setValue(2, 2, "age", GC.Spread.Sheets.SheetArea.colHeader);
sheet.setValue(2, 3, "position", GC.Spread.Sheets.SheetArea.colHeader);
