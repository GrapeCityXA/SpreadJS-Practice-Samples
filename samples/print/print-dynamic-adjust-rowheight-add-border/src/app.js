import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-print"


import {json} from "./json.js"
const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
spread.fromJSON(json);


document.getElementById("myPrint2").addEventListener("click", function() {
                var tempSpread = new GC.Spread.Sheets.Workbook();
                tempSpread.suspendPaint();
                tempSpread.fromJSON(JSON.parse(JSON.stringify(spread.toJSON())));

                var sheetCount = tempSpread.getSheetCount();
                // 在本例中，仅需对”检验报告“做特殊设置,获取对应index
                var index = tempSpread.getSheetIndex("检验报告");
                var sheet = tempSpread.getSheet(index);
                // 固定打印区域
                var printInfo = sheet.printInfo();
                printInfo.repeatRowStart(1);
                printInfo.repeatRowEnd(4);
                tempSpread.print()

            })
            document.getElementById("myPrint").addEventListener("click", function () {
                // 如果用designer的打印按钮，通过BeforePrint事件监听来处理tempSpread
                /* spread.bind(GC.Spread.Sheets.Events.BeforePrint, function (e, data) {

                }); */

                // 新建临时spread
                var tempSpread = new GC.Spread.Sheets.Workbook();
                tempSpread.suspendPaint();
                tempSpread.fromJSON(JSON.parse(JSON.stringify(spread.toJSON())));

                var sheetCount = tempSpread.getSheetCount();
                // 在本例中，仅需对”检验报告“做特殊设置,获取对应index
                var index = tempSpread.getSheetIndex("检验报告");
                var sheet = tempSpread.getSheet(index);
                // 固定打印区域
                var printInfo = sheet.printInfo();
                printInfo.repeatRowStart(1);
                printInfo.repeatRowEnd(4);

                var pageInfo = tempSpread.pageInfo();
                //本文件中仅需对”检验报告“sheet添加下边框、插入一行等特殊处理
                var pages = pageInfo[index].pages;
                console.log(pages);
                //pages:当前sheet的分页信息
                for (var i = 0; i < pages.length; i++) {
                    var page = pages[i];
                    var topRowIndex = page.row;
                    var bottomRowIndex = page.row + page.rowCount - 1;
                    var colIndex = page.column;
                    var colCount = page.columnCount;
                    var lineStyle = GC.Spread.Sheets.LineStyle.thin;
                    var lineBorder = new GC.Spread.Sheets.LineBorder('red', lineStyle);
                    //对于非第一页
                    if (i != 0) {
                        // 设置上边框
                        sheet.getRange(topRowIndex, colIndex, 1, colCount).borderTop(lineBorder);
                    } else if (i != pages.length - 1) {
                        // 对于非最后一页,插入一行
                        sheet.addRows(bottomRowIndex, 1);
                        // 合并单元格
                        sheet.addSpan(bottomRowIndex, colIndex, 1, colCount);
                        sheet.getCell(bottomRowIndex, colIndex).hAlign(GC.Spread.Sheets.HorizontalAlign.center).value("----------以下空白-----------");
                        sheet.setRowHeight(bottomRowIndex, 30);
                        // 居中+设置边框
                        sheet.getRange(bottomRowIndex, colIndex, 1, colCount).borderBottom(lineBorder).borderRight(lineBorder).borderLeft(lineBorder);
                    }

                    // 对于最后一页
                    if (i == pages.length - 1) {
                        // 预估的行高（除去重复打印区域）
                        var paperSizeHeight = 840;
                        var rowsHeight = 0;
                        var blankRowIndex;
                        console.log(page.row, page.row + page.rowCount)
                        for (var n = page.row; n < page.row + page.rowCount + 1; n++) {
                            rowsHeight = rowsHeight + sheet.getRowHeight(n);
                            if (sheet.getValue(n, colIndex) === "----------以下空白-----------") {
                                blankRowIndex = n;
                            }
                        }
                        // 调整 以下空白 所在单元格行高
                        var newBlankHeight = paperSizeHeight - rowsHeight + sheet.getRowHeight(blankRowIndex);
                        console.log("newBlankHeight", newBlankHeight)
                        sheet.setRowHeight(blankRowIndex, newBlankHeight);
                    }
                }
                tempSpread.resumePaint();
                tempSpread.print();
            })