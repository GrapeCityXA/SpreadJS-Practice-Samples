import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();


function CustomEllipsisCellType() { }
CustomEllipsisCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();

CustomEllipsisCellType.prototype.paint = function (ctx, value, x, y, width, height, style, context) {
    console.log(value)
    // 调用父类绘制方法
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, arguments);
    // 判断是否需要显示省略号（可以根据内容长度或样式判断）
    if (this._mouseEnter && this.isEllipsisNeeded(context.row, context.col, context.sheet)) {
        // 创建自定义 tooltip
        var tooltip = document.createElement("div");
        tooltip.style.position = "absolute";
        tooltip.style.background = "#fff";
        tooltip.style.border = "1px solid #ccc";
        tooltip.style.padding = "4px 8px";
        tooltip.style.zIndex = "9999";
        tooltip.innerHTML = value;
        // 设置 tooltip 位置
        var rect = context.sheet.getCellRect(context.row, context.col);
        console.log(rect)
        tooltip.style.left = (rect.width + x + 20) + "px";
        tooltip.style.top = (rect.height + y + 20) + "px";

        document.body.appendChild(tooltip);


        this._tooltip = tooltip;
    }
};

CustomEllipsisCellType.prototype.processMouseEnter = function (hitInfo) {
    this._mouseEnter = true;
    hitInfo.sheet.repaint();
};

CustomEllipsisCellType.prototype.processMouseLeave = function (hitInfo) {
    this._mouseEnter = false;
    if (this._tooltip) {
        this._tooltip.remove();
        this._tooltip = null;
    }
    hitInfo.sheet.repaint();
};

CustomEllipsisCellType.prototype.getHitInfo = function (x, y, style, cellRect, context) {
    if (context) {
        return {
            x: x,
            y: y,
            row: context.row,
            col: context.col,
            cellRect: cellRect,
            cellStyle: style,
            sheetArea: context.sheetArea,
            isReservedLocation: false,
            sheet: context.sheet,
            context: context
        };
    }
};

CustomEllipsisCellType.prototype.isEllipsisNeeded = function (row, col, sheet) {
    let instance = new GC.Spread.Sheets.CellTypes.Text();
    let needWidth = instance.getAutoFitWidth(
        sheet.getValue(row, col), // 单元格中的值
        sheet.getText(row, col), // 单元格中显示的文本
        sheet.getActualStyle(row, col), // 当前单元格的样式
        sheet.zoom(), // 表格当前的缩放比例
        {
            "sheet": sheet,
            "row": row,
            "col": col,
            "sheetArea": GC.Spread.Sheets.SheetArea.viewport
        }
    );
    let cellWidth = sheet.getCellRect(row, col).width
    return needWidth >= cellWidth
};



let style = new GC.Spread.Sheets.Style()
style.showEllipsis = true
sheet.setStyle(1, 1, style)

let customCellType = new CustomEllipsisCellType();
sheet.getCell(1, 1).cellType(customCellType);


sheet.setValue(1, 1, "你的童年我的童年好像都一样，小小肩膀大大书包上呀上学堂")