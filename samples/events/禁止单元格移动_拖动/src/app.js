import * as GC from "@grapecity-software/spread-sheets";



const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();
sheet.setValue(1,1,"请选择任意单元格后，尝试拖动")


// 方案1，通过拖动事件控制，更加灵活，可以根据拖动单元格的目标和起始位置，判断是否允许拖动
sheet.bind(GC.Spread.Sheets.Events.DragDropBlock, function (e, args) {
    console.log(args)
    args.cancel = true;
});

// 方案2，通过option控制，更简单，但是灵活性稍差
// spread.options.allowUserDragDrop = false;
