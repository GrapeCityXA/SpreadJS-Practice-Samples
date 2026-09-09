## 一、Demo 概述

本示例展示了如何在 SpreadJS 中自定义右键菜单，实现手写签名功能。用户可以通过右键菜单打开签名面板，使用鼠标或触控设备进行手写签名，签名完成后会自动插入到选中的单元格中作为图片。该示例结合了 SpreadJS 的自定义菜单 API 和 Canvas 绘图技术，提供了一个实用的电子签名解决方案。

## 二、解决的问题

* **电子签名需求**：在电子表格中需要用户手写签名的场景，如合同审批、文档确认等
* **自定义菜单扩展**：展示如何扩展 SpreadJS 的右键菜单，添加自定义功能
* **jSignature 绘图集成**：演示如何将 jSignature 绘制的内容转换为图片并插入到表格中
* **用户体验优化**：提供直观的签名界面，支持重写和确认操作

## 三、实现思路

### 3.1 自定义右键菜单项

通过 SpreadJS 的 `commandManager` 注册自定义命令，并将其添加到右键菜单中：

```javascript
var commandManager = spread.commandManager();
commandManager.register("openSignaturePanel", {
    canUndo: false,
    execute: function (context, options, isUndo) {
        if(document.getElementById("signArea")){
            document.getElementById("signArea").style.visibility = 'visible'
        }
    }
});

spread.contextMenu.menuData.push({
    text: "手写签名",
    name: "customSignature",
    command: "openSignaturePanel",
    workArea: "viewport"
});
```

### 3.2 jSignature 签名面板实现

引入jquery和jSignature的包：

```javascript
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jSignature/2.1.3/jSignature.min.js"></script>
```

### 3.3 签名图片插入

将 Canvas 内容转换为 Base64 图片，并插入到指定单元格：

```javascript
document.getElementById("confirm").onclick = function(){
    let datapair = "data:" + $("#sign").jSignature("getData")  
    let sheet = spread.getActiveSheet()
        let row = sheet.getActiveRowIndex()
        let col = sheet.getActiveColumnIndex()
        let picture = sheet.shapes.addPictureShape(`${sheet.name()}-${row}-${col}}`, datapair,0,0,100,100);
        picture.startRow(row)
        picture.endRow(row + 1)
        picture.startColumn(col)
        picture.endColumn(col + 1)
        picture.startRowOffset(0);
        picture.startColumnOffset(0);
        picture.endRowOffset(0);
        picture.endColumnOffset(0);
        picture.allowResize(false)
        picture.allowMove(false)
        picture.allowRotate(false)
        $("#sign").jSignature("reset") 
        document.getElementById("signArea").style.visibility = 'hidden'
}
```

### 3.4 技术栈

* **SpreadJS**：表格核心库，提供自定义菜单和图片插入功能
* **jSignature**：用于实现手写签名的绘图功能
* **原生 JavaScript**：处理 DOM 操作和事件监听

## 四、使用说明

### 4.1 运行方式

直接在浏览器中打开 `index.html` 文件即可运行，无需安装依赖。

### 4.2 操作步骤

1. 在表格中选中任意单元格
2. 右键点击单元格，选择"手写签名"菜单项
3. 在弹出的签名面板中使用鼠标绘制签名
4. 点击"重写"按钮可清空画布重新签名
5. 点击"确认"按钮将签名插入到单元格中
6. 点击"取消"按钮关闭面板

## 五、功能特点

### 5.1 优点

* **操作直观**：通过右键菜单快速调用签名功能，符合用户习惯
* **实现简洁**：使用原生 Canvas API，无需引入额外的签名库
* **灵活扩展**：可以轻松调整签名面板样式、画笔粗细、颜色等参数
* **兼容性好**：基于标准 Web API，支持主流浏览器

### 5.2 局限性与扩展建议

* **触控支持**：当前实现仅支持鼠标操作，可以添加 `touchstart`、`touchmove`、`touchend` 事件以支持移动设备
* **签名质量**：简单的线条绘制可能不够平滑，可以考虑使用贝塞尔曲线优化
* **签名管理**：可以添加签名保存功能，允许用户重复使用常用签名
* **权限控制**：在实际应用中可能需要添加签名验证和权限管理机制

## 六、关键代码片段

### 清空画布功能

```javascript
document.getElementById("clear").onclick = function(){
   $("#sign").jSignature("reset") 
}
```

### 

## 七、总结

本示例展示了 SpreadJS 自定义菜单和图片插入功能的实际应用，开发者可以从中学到：

1. 如何注册和使用 SpreadJS 的自定义命令
2. 如何扩展右键菜单添加自定义功能
3. jSignature 绘图 API 的基本使用方法
4. 如何将 jSignature 内容转换为图片并插入到表格中
5. 模态对话框的实现方式

该方案适用于需要在电子表格中集成手写签名功能的场景，如在线审批系统、电子合同平台等。通过扩展，还可以实现更复杂的绘图功能，如图表标注、自由绘制等。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/J3pmyCRu-E2So03AQvnX7g/)）
