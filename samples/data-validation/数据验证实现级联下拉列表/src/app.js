import * as GC from "@grapecity-software/spread-sheets";
import { arr } from "./data.js";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
init(spread);

function init(spread) {
    spread.setSheetCount(2);

    var sheet = spread.getActiveSheet();
    var sourceSheet = spread.getSheet(1);
    sourceSheet.name('级联数据源');
    //  初始化数据源sheet，定义自定义名称，数据验证规则通过自定义名称引用数据
    initAddressSource(sourceSheet, arr);

    sheet.setValue(0, 0, '省份');
    sheet.setValue(0, 1, '城市');
    sheet.setValue(0, 2, '区域');

    //  通过自定义名称引用单元格区域数据
    let provinceList = new GC.Spread.Sheets.DataValidation.createFormulaListValidator(sourceSheet.name() + "!省份");
    sheet.setDataValidator(1, 0, 10, 1, provinceList);

    let cityList = new GC.Spread.Sheets.DataValidation.createFormulaListValidator( 'INDIRECT("' + sourceSheet.name() + '!"&$A2)');
    sheet.setDataValidator(1, 1, 10, 1, cityList);

    let regionList = new GC.Spread.Sheets.DataValidation.createFormulaListValidator( 'INDIRECT("' + sourceSheet.name() + '!"&$A2&$B2)');
    sheet.setDataValidator(1, 2, 10, 1, regionList);

    spread.resumePaint();
}

function initAddressSource(sheet, source){
    sheet.suspendPaint();
    sheet.setColumnCount(100000);
    // 一级序列
    sheet.setValue(0, 0, "省份");
    let prRange = new GC.Spread.Sheets.Range(1, 0, source.length, 1);
    sheet.addCustomName("省份", "级联数据源!" + GC.Spread.Sheets.CalcEngine.rangesToFormula([prRange], 0, 0, GC.Spread.Sheets.CalcEngine.RangeReferenceRelative.allAbsolute, false));
    let cityIndex = 1;
    for (let i = 0; i < source.length; i++) {
        let pr = source[i];
        sheet.setValue(i + 1, 0 , pr.name);
        sheet.setValue(0, cityIndex, pr.name);
            
        let cityRange = new GC.Spread.Sheets.Range(1, cityIndex, pr.children.length, 1);
        sheet.addCustomName(pr.name, "级联数据源!" + GC.Spread.Sheets.CalcEngine.rangesToFormula([cityRange], 0, 0, GC.Spread.Sheets.CalcEngine.RangeReferenceRelative.allAbsolute, false));
        let regionIndex = cityIndex + 1;
        for (let j = 0; j < pr.children.length; j++) {
            let city = pr.children[j];
            sheet.setValue(j + 1, cityIndex , city.name);
            if (city.children) {
                let regionRange = new GC.Spread.Sheets.Range(1, regionIndex, city.children.length, 1);
                sheet.addCustomName(pr.name + city.name, "级联数据源!" + GC.Spread.Sheets.CalcEngine.rangesToFormula([regionRange], 0, 0, GC.Spread.Sheets.CalcEngine.RangeReferenceRelative.allAbsolute, false));
                sheet.setValue(0, regionIndex, pr.name + city.name);
                for(let k = 0; k < city.children.length; k++){
                    let region = city.children[k];
                    sheet.setValue(k + 1, regionIndex, region.name);
                }
                regionIndex++;
            }
        }
            
        cityIndex = regionIndex;
    }

    sheet.resumePaint();
}