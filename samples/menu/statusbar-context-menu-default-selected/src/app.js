import * as GC from "@grapecity-software/spread-sheets";

/**
 * workSheet默认显示全部的状态栏选项
 */
GC.Spread.Common.CultureManager.culture('zh-cn');
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));

//将状态栏挂在到一个div上
let statusBar = new GC.Spread.Sheets.StatusBar.StatusBar(
    document.getElementById('bar')
)
//绑定StatusBar的上下文
statusBar.bind(spread)

//默认展示所有的状态子项
let items = statusBar.all()
for (let i = 0; i < items.length; i++) {
    if (!items[i].visible) {
        items[i].visible = true
    }
}