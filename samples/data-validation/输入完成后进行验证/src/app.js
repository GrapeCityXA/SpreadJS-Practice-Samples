import * as GC from "@grapecity-software/spread-sheets";
 var spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'), {
        sheetCount: 1
    });
    // get spread object
    // var spread = GC.Spread.Sheets.findControl(document.getElementById('ss'));

    var numberValue = GC.Spread.Sheets.DataValidation.createNumberValidator(GC.Spread.Sheets.ConditionalFormatting.ComparisonOperators.between, "0", "999999", false);
    //numberValue.nullInput = 0;
    numberValue.showInputMessage(true);
    numberValue.inputTitle("tip");
    numberValue.inputMessage("enter a number");
    numberValue.ignoreBlank(false);
    spread.options.highlightInvalidData = true;

    var dv1 = new GC.Spread.Sheets.DataValidation.createListValidator("Fruit,Vegetable,Food");
    dv1.inputTitle("Please choose a category:");
    dv1.inputMessage("Fruit\nVegetableVegetable\nFood");
    dv1.ignoreBlank(false);

    var activeSheet = spread.getActiveSheet();
    activeSheet.setDataValidator(1, 1, numberValue);
    activeSheet.setDataValidator(2, 2, dv1);

    $("#get").click(function() {
        var activeSheet = spread.getActiveSheet();
        //console.log(numberValue.isValid(activeSheet, 1,1 , activeSheet.getCell(1,1).value()))

        // console.log(activeSheet.isValid(1,1, 10));
        if (isSheetValid(activeSheet)) {
            alert("Success")
        } else {
            alert("Failed")
        }

    })

    // 遍历单元格的方式来判断是否通过验证
    function isSheetValid(sheet) {
        var rowCount = sheet.getRowCount(),
            colCount = sheet.getColumnCount();
        var isValid = true;

        for (var row = 0; row < rowCount; row++) {
            for (var col = 0; col < colCount; col++) {
                if (!sheet.isValid(row, col, sheet.getValue(row, col))) {
                    isValid = false;
                    break;
                }
            }
        }
        return isValid;
    }

    // 采用脏数据的方式来判断是否通过验证
    function isSheetValidNew(sheet) {
        var rowCount = sheet.getRowCount(),
            colCount = sheet.getColumnCount();
        var isValid = true;
        var cells = sheet.getDirtyCells();

        for (var i = 0; i < cells.length; i++) {
            var dirtyCell = cells[i];
            var row = dirtyCell.row,
                col = dirtyCell.col;

            if (!sheet.isValid(row, col, sheet.getValue(row, col))) {
                isValid = false;
                break;
            }
        }
        return isValid;
    }