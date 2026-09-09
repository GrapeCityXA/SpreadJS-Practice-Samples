import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"
// 默认字体改为宋体
GC.Spread.Sheets.Themes.Office.bodyFont("宋体")


// 工具栏下拉列表新增字体
let designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
let fontFamilyCmd = GC.Spread.Sheets.Designer.getCommand("fontFamily");
let customCNFont = [
    { value: "宋体", text: "宋体" }
];
fontFamilyCmd.dropdownList = customCNFont.concat(fontFamilyCmd.dropdownList);
designerConfig.commandMap = {};
designerConfig.commandMap["fontFamily"] = fontFamilyCmd
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig)
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()
sheet.setValue(0, 4, '你好')
sheet.getCell(2, 8).value("葡萄城").fontWeight('bold');


// 注册宋体，用于解决导出pdf乱码问题
const fontUrls = ['./static/simsun.ttf', './static/simsun-bold.ttf']
const registerServerFont = async () => {
    let promises = fontUrls.map(url => fetch(url))
    let results = await Promise.all(promises)
    let fontData = await Promise.all(results.map(res => res.arrayBuffer()))
    GC.Spread.Sheets.PDF.PDFFontsManager.registerFont("宋体", {
        "normal": fontData[0],
        "bold": fontData[1]
    })

    // 备用字体，如果xxx字体没有注册，则使用备用字体渲染pdf
    GC.Spread.Sheets.PDF.PDFFontsManager.fallbackFont = function () {
        return fontData[0]
    }

}
registerServerFont()



