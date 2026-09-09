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


var fileMenuPanelTemplate = GC.Spread.Sheets.Designer.getTemplate(GC.Spread.Sheets.Designer.TemplateNames.FileMenuPanelTemplate)
console.log(fileMenuPanelTemplate)
/***去掉导出按钮
 *  注意：使用的产品版本不同，层级关系可能有差异
 *  需要结合产品版本去写代码，可以观察fileMenuPanelTemplate结构，确定要删除的按钮处于那一层
 * **/

fileMenuPanelTemplate.content[0].children[0].children[0].children[0].children[5].items.splice(1, 1);
GC.Spread.Sheets.Designer.registerTemplate(GC.Spread.Sheets.Designer.TemplateNames.FileMenuPanelTemplate, fileMenuPanelTemplate)



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
// 修改默认的打开选项为导入
designer.setData("fileMenuSetting", {activeCategory_main: "Import"})

// 这是另一种修改默认打开选项的方式，通过拦截并修改option实现
// let getFileMenuOption = GC.Spread.Sheets.Designer.FileMenuHandler.getFileMenuOption;
// GC.Spread.Sheets.Designer.FileMenuHandler.getFileMenuOption = function (context) {
//     let fileMenuSetting = (context.getData("fileMenuSetting") || {});
//     let option = getFileMenuOption.apply(this, arguments);
//     // 可以打印option查看其他选项
//     console.log(option)
//     if (!fileMenuSetting.activeCategory_main) {
//         option.activeCategory_main = "Import"
//     }
//     return option;
// }


let spread = designer.getWorkbook()

spread.setSheetCount(5)

let sheet = spread.getActiveSheet()

sheet.setValue(0,0,'grapecity')





