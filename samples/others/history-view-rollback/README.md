## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现单元格历史数据的保存、查看和回滚功能。当用户多次修改同一个单元格的值时，系统会自动记录每次修改的历史记录（包括时间戳、修改人、修改值），并通过自定义单元格类型在单元格右侧显示一个历史记录图标。鼠标悬停在图标上时，会弹出一个历史记录列表，用户可以查看所有历史版本并选择回滚到任意历史状态。

该示例适用于需要追踪数据变更历史、支持数据审计或提供撤销功能的业务场景，如财务报表、数据审核系统等。

## 二、解决的问题

* 数据变更追踪：在协作编辑或数据审核场景中，需要记录每个单元格的修改历史，包括修改时间、修改人和修改值
* 历史数据可视化：用户需要直观地查看某个单元格的所有历史版本，而不是通过外部日志系统
* 数据回滚能力：当发现数据错误时，用户可以快速回滚到任意历史版本，而不需要手动重新输入

## 三、实现思路

### 3.1 核心技术点

#### 利用单元格 Tag 存储历史记录

通过 SpreadJS 的 `setTag` 和 `getTag` API，将历史记录数组存储在单元格的 tag 属性中。每次编辑结束时，在 `EditEnded` 事件中捕获新值并追加到历史记录数组。

```javascript
spread.bind(GC.Spread.Sheets.Events.EditEnded, function (sender, args) {
    var sheet = args.sheet;
    var row = args.row;
    var col = args.col;
    var value = sheet.getValue(row, col);
    
    // 获取或初始化单元格 tag
    var cellTag = sheet.getTag(row, col);
    if (!cellTag || !cellTag.history) {
        cellTag = { history: [] };
        sheet.setTag(row, col, cellTag);
    }
    
    // 追加历史记录
    cellTag.history.push({
        time: new Date().getTime(),
        user: "testUser",
        value: value
    });
    
    // 当历史记录超过1条时，替换为自定义单元格类型
    var cellType = sheet.getCellType(row, col);
    if (!(cellType instanceof CustomHistoryCell) && cellTag.history.length > 1) {
        var hostDiv = document.getElementById('ss');
        sheet.setCellType(row, col, new CustomHistoryCell({ 
            x: hostDiv.offsetLeft, 
            y: hostDiv.offsetTop 
        }));
    }
});
```

#### 自定义单元格类型绘制历史图标

通过继承 `GC.Spread.Sheets.CellTypes.Text` 创建自定义单元格类型 `CustomHistoryCell`，在 `paint` 方法中绘制历史记录图标。

```javascript
function CustomHistoryCell(hostMargin) {
    this.typeName = "CustomHistoryCell";
    this.hostMargin = hostMargin;
    this.margin = 0;
    this.size = 20;
    this.backgroundImage = icon; // Base64 编码的图标
}

CustomHistoryCell.prototype = new GC.Spread.Sheets.CellTypes.Text();

CustomHistoryCell.prototype.paint = function (ctx, value, x, y, w, h, style, options) {
    // 先绘制文本内容（左对齐）
    style.hAlign = GC.Spread.Sheets.HorizontalAlign.left;
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, value, x, y, w, h, style, options);
    
    // 在单元格右侧绘制历史图标
    var startX = x + w - this.size - this.margin;
    var startY = y + (h - this.size) / 2 - this.margin;
    style.backgroundImage = this.backgroundImage;
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, "", startX, startY, this.size, this.size, style, options);
};
```

#### 鼠标交互与历史列表弹窗

通过 `getHitInfo` 方法判断鼠标是否点击在图标区域，在 `processMouseEnter` 方法中显示历史记录弹窗。

```javascript
CustomHistoryCell.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
    var hitX = x;
    var hitY = y;
    var startX = cellRect.x + cellRect.width - this.size + this.margin;
    var startY = cellRect.y + (cellRect.height - this.size) / 2 + this.margin;
    var endX = cellRect.x + cellRect.width - this.margin;
    var endY = cellRect.y + (cellRect.height + this.size) / 2 - this.margin;
    
    var info = {
        x: x, y: y, row: context.row, col: context.col,
        cellStyle: cellStyle, cellRect: cellRect, sheetArea: context.sheetArea
    };
    
    // 判断是否点击在图标区域
    if (hitX > startX && hitX < endX && hitY > startY && hitY < endY) {
        info.isReservedLocation = true;
    }
    return info;
};

CustomHistoryCell.prototype.processMouseEnter = function (hitInfo) {
    var sheet = hitInfo.sheet;
    if (sheet && hitInfo.isReservedLocation) {
        // 创建弹窗元素
        var div = document.createElement("div");
        $(div).css({
            "position": "absolute",
            "border": "1px #C0C0C0 solid",
            "box-shadow": "1px 2px 5px rgba(0,0,0,0.4)",
            "background": "white",
            "padding": 5
        }).attr("class", "toolTipElement");
        
        this._toolTipElement = div;
        showHistoryList(hitInfo.row, hitInfo.col, this, sheet);
        
        // 定位弹窗
        $(this._toolTipElement)
            .html($('#validateCellInfo').html())
            .css("top", hitInfo.y + this.hostMargin.y + 15)
            .css("left", hitInfo.x + this.hostMargin.x + 15);
        
        document.body.insertBefore(this._toolTipElement, null);
        $(this._toolTipElement).show("fast");
        return true;
    }
    return false;
};
```

#### 历史数据回滚功能

通过 `rollback` 函数实现回滚逻辑，截取历史记录数组到指定时间点，并更新单元格值。

```javascript
window.rollback = function(button) {
    button = $(button);
    var sheetName = button.attr("sheetName");
    var row = parseInt(button.attr("row"));
    var col = parseInt(button.attr("col"));
    var time = parseInt(button.attr("time"));
    
    var spread = GC.Spread.Sheets.findControl('ss');
    var sheet = spread.getSheetFromName(sheetName);
    var tag = sheet.getTag(row, col);
    var newTagHis = [];
    
    if (tag && tag.history) {
        // 截取历史记录到指定时间点
        for (let i = 0; i < tag.history.length; i++) {
            var item = tag.history[i];
            newTagHis.push(item);
            if (item.time == time) {
                sheet.setValue(row, col, item.value);
                break;
            }
        }
        
        // 如果回滚到最初状态，清空自定义单元格类型
        if (newTagHis.length <= 1) {
            sheet.setCellType(row, col, new GC.Spread.Sheets.CellTypes.Text());
        }
        
        tag.history = newTagHis;
        sheet.setTag(row, col, tag);
    }
    
    $(".toolTipElement").remove();
}
```

### 3.2 UI 交互流程

用户多次修改单元格 → 系统自动记录历史 → 单元格右侧显示历史图标 → 鼠标悬停图标 → 弹出历史记录列表 → 点击回滚按钮 → 单元格值恢复到指定版本

### 3.3 技术栈

* SpreadJS 15.0.0：核心表格控件
* jQuery 3.6.1：DOM 操作和事件处理
* Bootstrap 3.3.7：弹窗样式
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：类型支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件。

### 4.2 操作步骤

1. 打开示例页面，SpreadJS 表格会自动初始化
2. 选择任意单元格，输入一个值（例如输入 "100"）
3. 再次点击同一单元格，修改为另一个值（例如修改为 "200"）
4. 此时单元格右侧会出现一个历史记录图标
5. 将鼠标悬停在图标上，会弹出历史记录列表，显示所有修改记录
6. 点击任意历史记录行的"回滚"按钮，单元格值会恢复到该历史版本
7. 点击弹窗外任意位置，弹窗会自动关闭

## 五、功能特点

### 5.1 优点

* 非侵入式设计：历史记录存储在单元格 tag 中，不影响单元格的实际值和公式
* 可视化交互：通过自定义单元格类型和弹窗，提供直观的历史记录查看界面
* 灵活的回滚机制：支持回滚到任意历史版本，回滚后会自动截断后续历史记录
* 自动状态管理：当历史记录只有一条时，自动移除自定义单元格类型，恢复为普通文本单元格

### 5.2 局限性与扩展建议

* 当前实现仅支持通过输入修改内容的场景，不考虑拖拽、粘贴等操作。如需支持，可以监听 `ClipboardPasted`、`DragFillBlock` 等事件
* 历史记录存储在客户端内存中，刷新页面后会丢失。建议将历史记录持久化到服务器或 LocalStorage
* 时间戳显示为毫秒数，建议添加日期格式化函数，提升用户体验
* 修改人信息当前为硬编码的 "testUser"，实际应用中应从用户登录信息中获取

## 六、总结

本示例展示了如何利用 SpreadJS 的单元格 tag、自定义单元格类型和事件机制，实现一个完整的历史数据追踪和回滚系统。开发者可以从中学到以下知识点：

* 使用单元格 tag 存储自定义元数据
* 通过继承 `CellTypes.Text` 创建自定义单元格类型
* 重写 `paint`、`getHitInfo`、`processMouseEnter` 方法实现自定义渲染和交互
* 监听 `EditEnded` 事件捕获单元格编辑操作
* 动态切换单元格类型以适应不同状态

该方案适用于需要数据审计、版本控制或协作编辑的场景，具有良好的扩展性。开发者可以根据实际需求，扩展支持更多编辑操作类型、添加历史记录持久化、优化弹窗样式等。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
