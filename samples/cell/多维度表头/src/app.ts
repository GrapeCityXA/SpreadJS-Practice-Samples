import GC from "@grapecity/spread-sheets";
import "@grapecity/spread-sheets-print";
import "@grapecity/spread-sheets-shapes";
import "@grapecity/spread-sheets-pivot-addon";
import "@grapecity/spread-sheets-tablesheet";
import "@grapecity/spread-sheets-io";
import "@grapecity/spread-sheets-reportsheet-addon"
import '@grapecity/spread-sheets-designer-resources-cn';
import '@grapecity/spread-sheets-designer';
import '@grapecity/spread-sheets-designer/styles/gc.spread.sheets.designer.min.css';
import {TableDivideCellType} from "./customType"
GC.Spread.Common.CultureManager.culture("en-us");

let config = (GC.Spread.Sheets as any).Designer.DefaultConfig
config.commandMap = {
    DivideArea: {
			title: "自定义功能",
			text: "表头分区",
			bigButton: "true",
			commandName: "DivideArea",
            iconClass: "divide-area",
			execute: function () {
                document.getElementById("setHeader").style.display = 'block'
			}
		}
	}

config.ribbon[0].buttonGroups.unshift({
		"label": "自定义功能",
		"commandGroup": {
			"children": [
				{
					"direction": "vertical",
					"commands": [
						"DivideArea"
					]
				}
			]
		}
	});

const designer = new (GC.Spread.Sheets as any).Designer.Designer(document.getElementById('app'),config);
const spread = designer.getWorkbook();
let sheet:GC.Spread.Sheets.Worksheet = spread.getActiveSheet();
let content = {
    count: 4,
    text:["班级","姓名","年龄","性别"]
}
sheet.setValue(0,0,content)
sheet.setRowHeight(0,60)
sheet.setColumnWidth(0,160)
sheet.setCellType(0,0,new TableDivideCellType())

document.getElementById("cancel").onclick = () => {
    document.getElementById("setHeader").style.display = 'none'
}

document.getElementById("confirm").onclick = () => {
    let content = {
        count: document.getElementById("area-count").value,
        text : document.getElementById("area-content").value.split("|")
     }
     if(content.count != content.text.length){
        alert("分区数量与分区内容不对应，请确认分区信息")
     }else{
        let sheet =spread.getActiveSheetOrSheetTab()
        if(sheet instanceof GC.Spread.Sheets.Worksheet){
             let activeRow = sheet.getActiveRowIndex()
            let activeCol = sheet.getActiveColumnIndex()
            sheet.getCell(activeRow,activeCol).value(content).cellType(new TableDivideCellType())
            document.getElementById("setHeader").style.display = 'none'
        }else if(sheet instanceof GC.Spread.Report.ReportSheet){
            let activeRow = sheet.getTemplate().getActiveRowIndex()
            let activeCol = sheet.getTemplate().getActiveColumnIndex()
            sheet.getTemplate().getCell(activeRow,activeCol).value(content).cellType(new TableDivideCellType())
            document.getElementById("setHeader").style.display = 'none'
        }else{
            console.log('不是目标表')
        }
       
     }
    
}
