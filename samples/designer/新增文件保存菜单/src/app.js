import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-io"
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
import {TemplateListComponent} from './templateListComponent.js'


GC.Spread.Sheets.Designer.Designer.RegisterComponent("TemplateList", TemplateListComponent)


var fileMenu = GC.Spread.Sheets.Designer.getTemplate(GC.Spread.Sheets.Designer.TemplateNames.FileMenuPanelTemplate);
fileMenu.content[0].children[0].children[0].children[0].children.push({type: "LabelLine", margin: "5px 0 0 0", className: 'seprater-line'})
// 在文件菜单中加入保存选项
fileMenu.content[0].children[0].children[0].children[0].children.push({type: 'List', className: 'file-menu-category-list', bindingPath: "saveServer", items:[{text: "保存(自定义)"}]})
GC.Spread.Sheets.Designer.registerTemplate(GC.Spread.Sheets.Designer.TemplateNames.FileMenuPanelTemplate, fileMenu)

// 添加自定义模板选项
// fileMenu.content[0].children[0].children[1].children[0].children.push({type: "TemplateList", bindingPath: "newWithTemplate", items: [{"text": "新目标"}]})

let oldProcessPropertyChanged = GC.Spread.Sheets.Designer.FileMenuHandler.processPropertyChanged;
GC.Spread.Sheets.Designer.FileMenuHandler.processPropertyChanged = function(context, propertyName, newValue){
    // 响应保存按钮点击
    if(propertyName === "saveServer"){
        alert("Save")
    }
    else if(propertyName === "newWithTemplate"){
        alert("newWithTemplate" + newValue)
        GC.Spread.Sheets.Designer.FileMenuHandler.hideFileMenu(context)
    }
    else{
        oldProcessPropertyChanged.apply(this, arguments)
    }
}



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")

let spread = designer.getWorkbook()

spread.setSheetCount(5)

let sheet = spread.getActiveSheet()

sheet.setValue(0,0,'grapecity')





