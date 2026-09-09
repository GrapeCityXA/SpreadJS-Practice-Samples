import * as GC from "@grapecity-software/spread-sheets";


const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

sheet.setValue(3, 1, 1)
sheet.setValue(4, 1, 2)
sheet.setFormula(5, 1, "=SUM(B4:B5)")
sheet.setValue(5, 0, "求和：")
sheet.getRange(5, 0, 1, 2).fontWeight("bold")
sheet.setValue(1, 0, "请修改B4或B5的值，并在浏览器F12的控制台查看打印信息")

spread.bind(GC.Spread.Sheets.Events.ValueChanged, function (e, info) {
    let dependents = info.sheet.getDependents(info.row, info.col);
    let _spread = info.sheet.getParent()
    dependents.forEach(dep => {
        let _sheet = _spread.getSheetFromName(dep.sheetName)
        let _oldVal = _sheet.getValue(dep.row, dep.col)
        dep.oldVal = _oldVal
    })
    setTimeout(() => {
        dependents.forEach(dep => {
            let _sheet = _spread.getSheetFromName(dep.sheetName)
            let _newVal = _sheet.getValue(dep.row, dep.col)
            dep.newVal = _newVal

            console.log(`公式位置：${dep.row}, ${dep.col}, 值变化：${dep.oldVal} —> ${dep.newVal}`)
        })
                
    }, 0);
});