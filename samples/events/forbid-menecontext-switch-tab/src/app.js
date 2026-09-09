import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
spread.setSheetCount(3)
spread.getSheet(0).setValue(0, 0, "Sheet1")
spread.getSheet(1).setValue(0, 0, "Sheet2")
spread.getSheet(2).setValue(0, 0, "Sheet3")

let rightClick = false
spread.bind(GC.Spread.Sheets.Events.ActiveSheetChanging, function (sender, args) {
    //取消表单切换
    if (rightClick) {
        args.cancel = true
    }
    rightClick = false
});


idFuzzySelect("tabStrip").addEventListener("mouseup", function (arg) {
    console.log(arg)
    // 鼠标右键点击
    if (arg.button == 2) {
        rightClick = true
        setTimeout(() => {
            rightClick = false
        }, 50);
    }
})

function idFuzzySelect(str) {
    let all = document.querySelectorAll('*')

    for (let i = 0; i < all.length; i++) {
        if (all[i].id.indexOf(str) > -1) {
            return all[i]
        }
    }
}
