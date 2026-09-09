import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Common.CultureManager.culture('zh-cn');
var spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'), {
    sheetCount: 1
});
var sheet = spread.getActiveSheet();


class NumericFomatter extends GC.Spread.Formatter.GeneralFormatter {
    constructor(decimalDisplay = 2) {
        super()
        this._decimalDisplay = decimalDisplay
    }

    format(value) {
        if (isNaN(value) || value === null) {
            return value
        }
        
        value = this.toNonExponential(value)
        let arr = (value + "").split(".")
        let before = arr[0].length
        let after
        if (arr[1]) {
            after = arr[1].length
        } else {
            after = 0
        }
        let pattern = "#,##0."
        for (let i = 0; i < after || i < this._decimalDisplay; i++) {
            pattern += "0"
        }
        let formatter = new GC.Spread.Formatter.GeneralFormatter(pattern);
        return formatter.format(value)
    }

    toNonExponential(num) {
        let _num = parseFloat(num)
        let m = _num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
        return _num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
    }
}


sheet.setValue(0, 0, 0.00000001)
sheet.setValue(1, 0, 100)
sheet.setFormatter(-1, 0, new NumericFomatter(2))

sheet.setColumnWidth(0, 200)
