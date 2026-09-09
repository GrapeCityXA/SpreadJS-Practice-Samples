import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getActiveSheet();
sheet.setValue(0, 0, 'ComboBox单元格类型');
sheet.setValue(0, 3, '数据验证序列');
sheet.setValue(0, 6, '样式下拉菜单');
sheet.setValue(0, 9, '表单控件ComboBox');
sheet.autoFitColumn(0);
sheet.autoFitColumn(3);
sheet.autoFitColumn(6);
sheet.autoFitColumn(9);

window.spread = spread;

var style = new GC.Spread.Sheets.Style();
style.backColor = 'yellow';
sheet.setStyle(0, 0, style);
sheet.setStyle(0, 3, style);
sheet.setStyle(0, 6, style);
sheet.setStyle(0, 9, style);

//  单元格类型ComboBox
var comboBoxCellType = new GC.Spread.Sheets.CellTypes.ComboBox();
comboBoxCellType.items([
    {
        text: 'one', 
        value: 1
    }, 
    {
        text: 'two', 
        value: 2
    }, 
    {
        text: 'three', 
        value: 3
    }, 
    {
        text: 'four', 
        value: 4
    }
]);
sheet.setCellType(0, 1, comboBoxCellType);

//  数据验证器序列
var listValidator = GC.Spread.Sheets.DataValidation.createListValidator('1,2,3,4');
sheet.setDataValidator(0, 4, listValidator);

//  Style下拉菜单
var dropDownStyle = new GC.Spread.Sheets.Style();
dropDownStyle.cellButtons = [
    {
        imageType: GC.Spread.Sheets.ButtonImageType.dropdown, 
        command: 'openList', 
        useButtonStyle: true
    }
];
dropDownStyle.dropDowns = [
    {
        type: GC.Spread.Sheets.DropDownType.list, 
        option: {
            items: [
                {
                    text: 'one', 
                    value: 1
                }, 
                {
                    text: 'two', 
                    value: 2
                }, 
                {
                    text: 'three', 
                    value: 3
                }, 
                {
                    text: 'four', 
                    value: 4
                }
            ]
        }
    }
];
sheet.setStyle(0, 7, dropDownStyle);

//  表单控件ComboBox
sheet.setValue(0, 10, 1);
sheet.setValue(1, 10, 2);
sheet.setValue(2, 10, 3);
sheet.setValue(3, 10, 4);
var comboBox = sheet.shapes.addFormControl("comboBox", GC.Spread.Sheets.Shapes.FormControlType.comboBox, 100, 50, 200, 30);
var options = comboBox.options();
options.inputRange = "K1:K4";
comboBox.options(options);