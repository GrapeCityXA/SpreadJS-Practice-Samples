import * as GC from "@grapecity-software/spread-sheets";
        // Title:获取指定区域
        // Description：点击按钮，在下方详情区域显示内容
        // Tag:toJSON、fromJSON
        
        
        // not done
        // $(document).ready(function () {

        var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

        var spreadDetail = new GC.Spread.Sheets.Workbook(document.getElementById("ss1"));
        initDetailSpread(spreadDetail);

        var editingRange;
        $("#getRangeDetail").click(function() {
            var jsonString = JSON.stringify(spread.toJSON());
            spreadDetail.fromJSON(JSON.parse(jsonString))
            var sheet = spread.getActiveSheet();
            editingRange = sheet.getSelections()[0]
            initDetailSpread(spreadDetail, editingRange);
        })

        $("#updateData").click(function() {
            var sheet = spreadDetail.getActiveSheet();
            var sourceSheet = spread.getSheetFromName(sheet.name());
            if (sheet.hasPendingChanges()) {
                var dirtyCells = sheet.getDirtyCells()
                for (var i = 0; i < dirtyCells.length; i++) {
                    var cell = dirtyCells[i];
                    if (cell.row >= editingRange.row && cell.row < editingRange.row + editingRange.rowCount && cell.col >= editingRange.col && cell.col < editingRange.col + editingRange.colCount) {
                        var formula = sheet.getFormula(cell.row, cell.col);
                        if (formula) {
                            sourceSheet.setFormula(cell.row, cell.col, formula);
                        } else {
                            var value = sheet.getValue(cell.row, cell.col);
                            sourceSheet.setValue(cell.row, cell.col, value);
                        }
                    }
                }
            }


        })


        var sheet = spread.getActiveSheet();
        spread.suspendPaint();
        var style = new GC.Spread.Sheets.Style();
        style.locked = false;
        style.backColor = "lightGreen";
        sheet.setStyle(1, 1, style);
        sheet.setStyle(1, 2, style);
        sheet.setStyle(5, 1, style);
        sheet.setStyle(5, 2, style);
        sheet.setStyle(8, -1, style);
        sheet.setStyle(9, -1, style);
        sheet.setStyle(12, -1, style);
        sheet.setStyle(13, -1, style);
        sheet.setStyle(-1, 8, style);
        sheet.setStyle(-1, 9, style);
        sheet.setStyle(-1, 12, style);
        sheet.setStyle(-1, 13, style);
        var style2 = new GC.Spread.Sheets.Style();
        style2.locked = true;
        style2.backColor = "gray";
        sheet.setStyle(13, 1, style2);
        sheet.setStyle(1, 13, style2);

        sheet.setValue(0, 0, 0)
        sheet.setValue(0, 1, 1)
        sheet.setValue(0, 2, 2)
        sheet.setValue(0, 3, 3)
        sheet.setValue(0, 4, 4)
        sheet.setValue(0, 5, 5)
        sheet.setValue(1, 0, 1)
        sheet.setValue(2, 0, 2)
        sheet.setValue(3, 0, 3)
        sheet.setValue(4, 0, 4)
        sheet.setValue(5, 0, 5)


        spread.resumePaint();

        // sheet.options.isProtected = true;

        function initDetailSpread(spread, range) {
            spread.suspendPaint();
            spread.options.tabStripVisible = false;
            spread.options.scrollIgnoreHidden = true;
            spread.options.scrollbarMaxAlign = true;
            spread.options.scrollbarShowMax = true;
            var sheet = spread.getActiveSheet(),
                rowCount = sheet.getRowCount(),
                colCount = sheet.getColumnCount();
            if (range) {
                if (range.row > 0) {
                    sheet.getRange(0, -1, range.row, -1).visible(false);
                }
                if (range.col > 0) {
                    sheet.getRange(-1, 0, -1, range.col).visible(false);
                }

                if (range.row + range.rowCount < rowCount) {
                    sheet.getRange(range.row + range.rowCount, -1, rowCount - (range.row + range.rowCount), -1).visible(false);
                }
                if (range.col + range.colCount < colCount) {
                    sheet.getRange(-1, range.col + range.colCount, -1, colCount - (range.col + range.colCount)).visible(false);
                }
            }
            sheet.options.sheetAreaOffset = {
                left: 5,
                top: 5
            };
            sheet.options.rowHeaderVisible = false;
            sheet.options.colHeaderVisible = false;
            sheet.zoom(sheet.zoom() * 1.2);
            sheet.clearPendingChanges();
            spread.resumePaint();
        }