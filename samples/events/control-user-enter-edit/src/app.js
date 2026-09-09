import * as GC from "@grapecity-software/spread-sheets";
import { getJson } from "./json.js";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
spread.fromJSON(getJson())

spread.bind(GC.Spread.Sheets.Events.EditStarting, function (sender, args) {
    let r = args.row;
    let c = args.col;
    // 单元格按钮
    let cellButtons = args.sheet.getCell(r, c).cellButtons()
    if (cellButtons) {
        args.cancel = true;
    }
    // 数据验证
    let dataValidator = args.sheet.getDataValidator(r, c)
    if(dataValidator.type() == GC.Spread.Sheets.DataValidation.CriteriaType.list) {
        args.cancel = true
    }
});