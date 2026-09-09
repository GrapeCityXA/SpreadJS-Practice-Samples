import * as GC from "@grapecity-software/spread-sheets";


const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();
sheet.setValue(1, 1, "请在任意单元格输入错误的公式")
sheet.setValue(3, 1, "例如：=S S()")
spread.options.allowInvalidFormula = true;

spread.bind(GC.Spread.Sheets.Events.EditEnding, function (e, info) {
    if (info.committed && info.editingText) {
        let sheet = info.sheet,
            spread = sheet.getParent();
        try {
            let expression = GC.Spread.Sheets.CalcEngine.formulaToExpression(
                sheet,
                info.editingText,
                0,
                0,
                spread.options.referenceStyle === GC.Spread.Sheets.CalcEngine.ReferenceStyle.r1c1
            );
        } catch (err) {
            alert("公式出现错误")
        }
    }
});