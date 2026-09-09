import * as GC from "@grapecity-software/spread-sheets";
/**
 * 用户点击某列数值时，其关联单元格的下拉选项会随之变动
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'), {
    sheetCount: 2
});

//初始化表单
let sheet = spread.getSheet(0)
let sheet1 = spread.getSheet(1)

sheet.setValue(0, 0, "省份")
sheet.setValue(0, 1, "城市")
sheet.setValue(0, 2, "辖区")

//初始化数据源表
sheet1.name("码表")
sheet1.setArray(0, 0, [
    ['陕西省', '广东省', '湖南省', '四川省', "福建省"]
])

sheet1.setArray(1, 0, [
    ['宝鸡市', '湛江市', "长沙市", "成都市", "厦门市"],
    ["西安市", "广州市", "株洲市", "眉山市", "福州市"]
])

sheet1.setArray(3, 0, [
    ['金台区', '坡头区', "芙蓉区", "金牛区", "集美区"],
    ['金台1区', '坡头1区', "芙蓉1区", "金牛1区", "集美1区"],
    ['雁塔区', '白云区', "荷塘区", "东坡区", "台江区"],
    ['雁塔1区', '白云1区', "荷塘1区", "东坡1区", "台江1区"]
])

//添加自定义名称
spread.addCustomName('省份', '=码表!$A$1:$E$1', 0, 0);

spread.addCustomName('陕西省', '=码表!$A$2:$A$3', 1, 0);
spread.addCustomName('广东省', '=码表!$B$2:$B$3', 1, 1);
spread.addCustomName('湖南省', '=码表!$C$2:$C$3', 1, 2);
spread.addCustomName('四川省', '=码表!$D$2:$D$3', 1, 3);
spread.addCustomName('福建省', '=码表!$E$2:$E$3', 1, 4);

spread.addCustomName('宝鸡市', '=码表!$A$4:$A$5', 3, 0);
spread.addCustomName('湛江市', '=码表!$B$4:$B$5', 3, 1);
spread.addCustomName('长沙市', '=码表!$C$4:$C$5', 3, 2);
spread.addCustomName('成都市', '=码表!$D$4:$D$5', 3, 3);
spread.addCustomName('厦门市', '=码表!$E$4:$E$5', 3, 4);

spread.addCustomName('西安市', '=码表!$A$6:$A$7', 5, 0);
spread.addCustomName('广州市', '=码表!$B$6:$B$7', 5, 1);
spread.addCustomName('株洲市', '=码表!$C$6:$C$7', 5, 2);
spread.addCustomName('眉山市', '=码表!$D$6:$D$7', 5, 3);
spread.addCustomName('福州市', '=码表!$E$6:$E$7', 5, 4);

//设置公式列表数据验证
let dv = GC.Spread.Sheets.DataValidation.createFormulaListValidator("=省份");
sheet.setDataValidator(1, 0, 5, 1, dv, GC.Spread.Sheets.SheetArea.viewport);

let dv1 = GC.Spread.Sheets.DataValidation.createFormulaListValidator("=INDIRECT(A2)");
sheet.setDataValidator(1, 1, 5, 1, dv1, GC.Spread.Sheets.SheetArea.viewport);

let dv2 = GC.Spread.Sheets.DataValidation.createFormulaListValidator("=INDIRECT(B2)");
sheet.setDataValidator(1, 2, 5, 1, dv2, GC.Spread.Sheets.SheetArea.viewport);

sheet.setArray(1, 0, [
    ['广东省', '湛江市', '坡头区'],
    ['陕西省', '西安市', '雁塔区'],
    ['四川省', '成都区', '金牛区'],
    ['福建省', '厦门市', '集美区'],
    ['湖南省', '长沙市', '芙蓉区']
])

//清除单元格数据
sheet.bind(GC.Spread.Sheets.Events.ValueChanged, function (e, info) {
    if (info.col === 0 && info.row !== 0) {
        sheet.clear(
            info.row,
            info.col + 1,
            1,
            2,
            GC.Spread.Sheets.SheetArea.viewport,
            GC.Spread.Sheets.StorageType.data
        );
    }
});