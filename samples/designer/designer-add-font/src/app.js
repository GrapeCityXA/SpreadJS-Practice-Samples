import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-resources-zh"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"

// 工具栏下拉列表新增字体
let designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
let fontFamilyCmd = GC.Spread.Sheets.Designer.getCommand("fontFamily");
let customCNFont = [
    { value: "微软雅黑", text: "微软雅黑" },
    { value: "黑体", text: "黑体" },
    { value: "新宋体", text: "新宋体" }
];
fontFamilyCmd.dropdownList = customCNFont.concat(fontFamilyCmd.dropdownList);
designerConfig.commandMap = {};
designerConfig.commandMap["fontFamily"] = fontFamilyCmd

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig)

// 单元格格式化添加中文字体
let formatDialogTemplateName = GC.Spread.Sheets.Designer.TemplateNames.FormatDialogTemplate
var formatDialogTemplate = GC.Spread.Sheets.Designer.getTemplate(formatDialogTemplateName)
formatDialogTemplate.content[0].children[2].children[0].children[0].children[0].children[1].items.unshift(
    { value: "微软雅黑", text: "微软雅黑" },
    { value: "黑体", text: "黑体" },
    { value: "新宋体", text: "新宋体" }
)
GC.Spread.Sheets.Designer.registerTemplate(formatDialogTemplateName, formatDialogTemplate);

// 富文本编辑器中添加字体
let resource = GC.Spread.Sheets.Designer.getResources()
resource.ribbon.fontFamilies['ff24'] = {
    name: "微软雅黑", text: "微软雅黑",
}
resource.ribbon.fontFamilies['ff25'] = {
    name: "黑体", text: "黑体",
}
resource.ribbon.fontFamilies['ff26'] = {
    name: "新宋体", text: "新宋体",
}
GC.Spread.Sheets.Designer.setResources(resource);

// 以上为V18.1.0之前的方法，在V18.1.0之后，请使用下面这种更简洁的方式：
// var res = GC.Spread.Sheets.Designer.getResources();
// let reorganizeFontFamilies = [];
// reorganizeFontFamilies.push({ name: "微软雅黑", text: "微软雅黑" });
// reorganizeFontFamilies.push({ name: "黑体", text: "黑体" });
// reorganizeFontFamilies.push({ name: "新宋体", text: "新宋体" });
// reorganizeFontFamilies.push({ name: "仿宋", text: "仿宋" });
// reorganizeFontFamilies.push({ name: "隶书", text: "隶书" });
// reorganizeFontFamilies.push({ name: "楷体", text: "楷体" });
// Object.keys(res.ribbon.fontFamilies).forEach(function (key) {
//     reorganizeFontFamilies.push(res.ribbon.fontFamilies[key]);
// });
// res.ribbon.fontFamilies = {};
// reorganizeFontFamilies.forEach(function (item, index) {
//     res.ribbon.fontFamilies['ff' + (1 + index)] = item;
// });
// GC.Spread.Sheets.Designer.setResources(res);


