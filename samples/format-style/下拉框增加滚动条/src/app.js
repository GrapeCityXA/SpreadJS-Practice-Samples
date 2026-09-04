import * as GC from "@grapecity-software/spread-sheets";


const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

// 下拉选项列表
const fruits = [
    "苹果", "香蕉", "樱桃", "榴莲", "接骨木莓",
    "无花果", "葡萄", "蜜瓜", "奇异果", "柠檬",
    "芒果", "油桃", "橙子", "木瓜", "石榴",
    "覆盆子", "草莓", "柑橘", "西瓜", "百香果"
]

let style = new GC.Spread.Sheets.Style()
style.cellButtons = [{
    command: "openList",
    imageType: GC.Spread.Sheets.ButtonImageType.dropdown
}]
style.dropDowns = [{
    option: {
        items: fruits.map(v => {
            return {
                text: v,
                value: v
            }
        }),
        valueType: GC.Spread.Sheets.DropdownListValue.string
    },
    type: GC.Spread.Sheets.DropDownType.list
}]

sheet.setStyle(1, 1, style)
sheet.setColumnWidth(1, 200)