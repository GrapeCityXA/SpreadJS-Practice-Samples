import * as GC from "@grapecity-software/spread-sheets";


GC.Spread.Common.CultureManager.culture('zh-cn');
/**
 * 加载csv文件，显示到spreadJs的表格中
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));
let sheet = spread.getActiveSheet();
function csvChange(){
    //读取文件的文本信息
    let file = document.getElementById('fileDemo').files[0]
    let reader = new FileReader()
    reader.readAsText(file,"UTF-8")
    reader.onload = function(e){
        let fileStr = e.target.result
        //API https://demo.grapecity.com.cn/spreadjs/help/api/GC.Spread.Sheets.Worksheet.html#setCsv
        sheet.setCsv(0,0,fileStr,"\r\n",",")
    }
    reader.onerror = function(){
        console.log('error')
    }
}

document.addEventListener('change',csvChange)