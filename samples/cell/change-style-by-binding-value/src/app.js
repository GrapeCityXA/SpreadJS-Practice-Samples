import * as GC from "@grapecity-software/spread-sheets";


let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

// 自定义单元格--开始
function customText() { }
customText.prototype = new GC.Spread.Sheets.CellTypes.Text()
customText.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
    let { row, col, sheet } = context
    // 拿到bindingPath，比如table.0.text
    let bindingPath = sheet.getBindingPath(row, col)
    // 拿到数据源
    let dataSource
    if (sheet.getDataSource()) {
        dataSource = sheet.getDataSource().getSource()
    }

    if (bindingPath && dataSource) {
        // 拿到绑定路径的上一级，比如绑定的是table.0.text，就拿到table.0，因为这一级存储了是否有变化的信息
        let keys = bindingPath.split(".")  // keys = ["table", "0", "text"]
        keys.pop() // keys = ["table", "0"]

        // 创建一个临时的对象，一层一层往里找绑定路径对应的变量
        let tempObj = JSON.parse(JSON.stringify(dataSource))
        keys.forEach(key => {
            tempObj = tempObj[key]
        })
        // tempObj={
        //     text: "aaaa",
        //     hasColor: true
        // }

        // 如果backColor为true，那么设置backColor为red
        if (tempObj.hasColor) {
            style.backColor = "red"
        }
    }
    // 执行单元格渲染原本的内部函数
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, arguments)
    return
}
// 自定义单元格--结束

let sheet = spread.getActiveSheet()
sheet.setCellType(0, 0, new customText())
sheet.setCellType(1, 0, new customText())
sheet.setBindingPath(0, 0, "table.0.text")
sheet.setBindingPath(1, 0, "table.1.text")
sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource({
    table: [{
        text: "aaaa",
        hasColor: true
    }, {
        text: "bbbb",
        hasColor: false
    }]
}))
