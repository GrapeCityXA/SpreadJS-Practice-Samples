import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-resources-zh"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-resources-zh"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"
import {bindFile} from "./bindFile.js"
GC.Spread.Common.CultureManager.culture("zh-cn")



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")

let spread = designer.getWorkbook()
/***
 * 该功能使用UI即可实现，详细可参考论坛贴：
 * https://gcdn.grapecity.com.cn/forum.php?mod=viewthread&tid=197797&page=1&extra=#pid728221
 * demo侧重用代码实现
 */
spread.fromJSON(bindFile)
let sheet = spread.getActiveSheet()
// 设置单元格格式化
sheet.setFormula(1,1,"=I5&J5&K5&L5&M5&N5&O5&P5&Q5")
sheet.setFormatter(1,1,"[DBNum2][$-804]General")
// 设置包含角分的人民币公式
sheet.setFormula(4,1,'=CONCAT(TEXT(TRUNC(I5&J5&K5&L5&M5&N5&O5&P5&Q5),"[DBNUM2]")&"元",IF(R5>0,TEXT(TRUNC(R5),"[DBNUM2]")&"角",""),IF(S5>0,TEXT(TRUNC(S5),"[DBNUM2]")&"分",""))')











