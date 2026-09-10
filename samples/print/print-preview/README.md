## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现自定义打印预览功能。通过拦截默认的打印行为，将打印预览窗口以固定位置的 iframe 形式展示在页面中，并提供预览和取消预览的交互控制。该示例集成了 SpreadJS Designer 设计器，允许用户在可视化界面中编辑表格内容后进行打印预览。 

## 二、解决的问题

* 默认的浏览器打印预览窗口无法自定义样式和位置，用户体验不够灵活
* 需要在打印前隐藏行列标题，实现更干净的打印输出
* 需要提供可控的预览和取消预览交互，而不是直接触发浏览器打印对话框

## 三、实现思路

### 3.1 拦截打印事件并自定义预览窗口

通过监听 `BeforePrint` 事件，拦截 SpreadJS 的默认打印行为，获取打印预览的 iframe 元素并自定义其样式和位置：

```javascript
spread.bind(GC.Spread.Sheets.Events.BeforePrint, function(e, data){
    sjsiframe = data.iframe
    sjsiframe.style.width = '800px'
    sjsiframe.style.height = '600px'
    sjsiframe.style.position = 'fixed'
    sjsiframe.style.top = '50px'
    sjsiframe.style.left = '200px'
    sjsiframe.style.background = '#ffffff'
    data.cancel = true  // 取消默认打印行为
})
```

关键点：

* `data.iframe` 包含了打印预览的 iframe 元素
* 设置 `position: fixed` 实现固定定位
* `data.cancel = true` 阻止浏览器打印对话框弹出

### 3.2 配置打印信息并触发预览

在预览按钮的点击事件中，配置打印参数并触发打印流程：

```javascript
document.getElementById('preview').onclick = function(){
    let sheet = spread.getActiveSheet()
    let printInfo = new GC.Spread.Sheets.Print.PrintInfo()
    printInfo.showColumnHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide)
    printInfo.showRowHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide)
    sheet.printInfo(printInfo)
    spread.print()
}
```

关键点：

* 使用 `PrintInfo` 对象配置打印选项
* 隐藏行列标题以获得更简洁的打印效果
* 调用 `spread.print()` 触发打印流程，此时会触发 `BeforePrint` 事件

### 3.3 实现取消预览功能

通过将 iframe 尺寸设置为 0 来隐藏预览窗口：

```javascript
document.getElementById('cancel').onclick = function(){
    sjsiframe.style.width = 0
    sjsiframe.style.height = 0
}
```

### 3.4 技术栈

* SpreadJS 15.0.0：核心表格组件
* @grapecity/spread-sheets-print 15.0.0：打印功能模块
* @grapecity/spread-sheets-designer 15.0.0：可视化设计器
* SystemJS：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 在 SpreadJS Designer 中编辑表格内容
2. 点击"预览"按钮，打印预览窗口将以固定位置的 iframe 形式显示在页面中央
3. 查看预览效果，确认打印内容
4. 点击"取消预览"按钮关闭预览窗口
5. 如需实际打印，可在预览窗口中使用浏览器的打印功能

## 五、功能特点

### 5.1 优点

* 自定义预览窗口的位置和样式，提升用户体验
* 通过事件拦截机制实现灵活的打印流程控制
* 支持隐藏行列标题，输出更专业的打印效果
* 集成 Designer 设计器，提供完整的编辑和预览工作流

### 5.2 局限性与扩展建议

* 当前实现仅支持单次预览，关闭后需重新点击预览按钮
* 可扩展功能：
    * 添加打印设置面板（页边距、纸张方向等）
    * 支持多页预览和页码导航
    * 添加直接打印按钮，跳过预览步骤

## 六、总结

本示例展示了 SpreadJS 打印功能的高级定制能力。开发者可以学到：

* 如何使用 `BeforePrint` 事件拦截和自定义打印行为
* 如何配置 `PrintInfo` 对象控制打印输出
* 如何通过 iframe 样式控制实现自定义预览窗口
* 如何集成 SpreadJS Designer 提供完整的编辑和打印工作流

该方案适用于需要自定义打印预览界面的场景，特别是在企业级应用中需要提供统一的打印体验时。通过事件机制和 API 配置的结合，可以实现高度灵活的打印功能定制。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
