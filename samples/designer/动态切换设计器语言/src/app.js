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
import "@grapecity-software/spread-sheets-designer-resources-en"
import "@grapecity-software/spread-sheets-designer"



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

import resource from "./resources.js"

// resource是在切换为不同语言时，通过JSON.stringify(GC.Spread.Sheets.Designer.getResources())生成的
// 需注意生成此资源时要引入所有的包，包括三个付费插件（报表、透视表、甘特图），否则会报错

document.querySelector("#ch").addEventListener("click", () => {
    GC.Spread.Common.CultureManager.culture("zh-cn");
    GC.Spread.Sheets.Designer.setResources(JSON.parse(resource.cn))
    let config = GC.Spread.Sheets.Designer.DefaultConfig;
    designer.setConfig(config);
});

document.querySelector("#en").addEventListener("click", () => {
    GC.Spread.Common.CultureManager.culture("en-us");
    GC.Spread.Sheets.Designer.setResources(JSON.parse(resource.en))
    let config = GC.Spread.Sheets.Designer.DefaultConfig;
    designer.setConfig(config);
});


