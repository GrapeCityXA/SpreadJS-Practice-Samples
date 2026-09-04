import * as GC from "@grapecity-software/spread-sheets";
import { getData } from "./data.js";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

// 业务逻辑
const comboProvince = new GC.Spread.Sheets.CellTypes.ComboBox()
comboProvince.items([
    { text: '123 陕西', value: '123 陕西' },
    { text: '456 广东', value: '456 广东' },])
const comboShannxi = new GC.Spread.Sheets.CellTypes.ComboBox()
comboShannxi.items([
    { text: '123 西安', value: '123 西安' },
    { text: '456 宝鸡', value: '456 宝鸡' },])
const comboGuangdong = new GC.Spread.Sheets.CellTypes.ComboBox()
comboGuangdong.items([
    { text: '123 广州', value: '123 广州' },
    { text: '456 深圳', value: '456 深圳' },])
sheet.setCellType(0, 0, comboProvince, GC.Spread.Sheets.SheetArea.viewport)

// 如果A1单元格里的值是123 陕西，那么A2单元格类型设置成comboShannxi
sheet.bind(GC.Spread.Sheets.Events.ValueChanged, (e, info) => {
    if (info.row === 0 && info.col === 0) {
        const value = info.newValue
        console.log(value)
        if (value === '123 陕西') {
            sheet.setCellType(0, 1, comboShannxi, GC.Spread.Sheets.SheetArea.viewport)
        } else if (value === '456 广东') {
            sheet.setCellType(0, 1, comboGuangdong, GC.Spread.Sheets.SheetArea.viewport)
        }
    }
})
