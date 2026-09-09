import * as GC from "@grapecity-software/spread-sheets";
/**
 * 状态栏中显示单元格中输入的内容
 */

//创建InputStatus的构造函数 返回StatusItem对象
function InputStatus(name, options) {
    GC.Spread.Sheets.StatusBar.StatusItem.call(this, name, options);
}
//为InputStatus的显式原型赋值为StatusItem对象【默认为空对象】
InputStatus.prototype = new GC.Spread.Sheets.StatusBar.StatusItem();
//给InputStatus对象添加onCreateItemView方法：添加两个span标签
InputStatus.prototype.onCreateItemView = function (container) {
    let statusBarDiv = this.contentDiv = document.createElement('div');
    statusBarDiv.innerHTML = '<span>输入值：</span><span></span>';
    container.appendChild(statusBarDiv);
};
//给InputStatus对象添加updateText方法：动态更新第二个标签的文本内容
InputStatus.prototype.updateText = function (text) {
    this.contentDiv.children[1].innerText = text;
};

let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));
let statusBar = new GC.Spread.Sheets.StatusBar.StatusBar(document.getElementById('statusBar'));
//statusBar的上下文对象为WorkBook实例
statusBar.bind(spread);
//创建一个inputStatus对象，并添加到statusBar上
let inputStatus = new InputStatus('InputStatus', { tipText: 'InputStatus' });
statusBar.add(inputStatus);
//更新按钮触发状态栏信息的变更
document.getElementById('update').onclick = function () {
    inputStatus.updateText(document.getElementById('inputValue').value);
}