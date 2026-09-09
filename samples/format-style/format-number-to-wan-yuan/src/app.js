import * as GC from "@grapecity-software/spread-sheets";


let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

let sheet = spread.getActiveSheet()

sheet.setValue(0, 0, 7980)
function CustomNumberFormat(formatstr) {
    this.formatstr = formatstr;
}

CustomNumberFormat.prototype = new GC.Spread.Formatter.FormatterBase();

CustomNumberFormat.prototype.format = function (obj, formattedData) {
    if (typeof obj === "number") {
        return formatNumber(obj, formattedData, this.formatstr);
    } else if (typeof obj === "string") {

        if (Number.isFinite(+obj)) {
            return formatNumber(parseFloat(obj), formattedData, this.formatstr);
        }
    }
    return obj ? obj.toString() : "";
};
function formatNumber(value, formattedData, formatstr) {

    var generalformatter = new GC.Spread.Formatter.GeneralFormatter();
    generalformatter.formatString(formatstr);
    //在这里处理.给值除以10000，然后仍然应用传入的格式字符串做格式化
    console.log(value / 10000);
    return generalformatter.format(value / 10000, formattedData);

}
CustomNumberFormat.prototype.parse = function (str) {
    var generalformatter = new GC.Spread.Formatter.GeneralFormatter();
    generalformatter.formatString(this.formatstr);
    console.log(generalformatter.parse(str))
    return generalformatter.parse(str);
};
sheet.getRange(-1, -1, -1, -1).formatter(new CustomNumberFormat("#,##0.00万"));
