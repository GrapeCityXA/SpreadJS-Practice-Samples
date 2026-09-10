## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现自定义单元格类型，以支持实时搜索高亮功能。当用户在搜索框中输入关键词时，表格中所有匹配的文本会自动以红色高亮显示，提供类似浏览器页面搜索（Ctrl+F）的用户体验。该功能通过继承 SpreadJS 的 Text 单元格类型并重写其渲染方法实现，适用于需要快速定位数据的场景。 

## 二、解决的问题

* **快速数据定位**：在大量数据中快速找到包含特定关键词的单元格，无需逐行查看
* **视觉反馈增强**：通过高亮显示匹配内容，让用户直观地看到搜索结果的位置和数量
* **实时搜索体验**：支持输入即搜索，无需点击按钮，提升交互流畅度

## 三、实现思路

### 3.1 自定义单元格类型

通过继承 `GC.Spread.Sheets.CellTypes.Text` 创建自定义单元格类型 `HighlightSearchCellType`，并重写 `paintValue` 方法来实现自定义渲染逻辑：

```javascript
function HighlightSearchCellType() {}
HighlightSearchCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();
```

### 3.2 文本分块算法

核心方法 `_generateSearchBlock` 使用正则表达式将单元格文本分割为多个块（block），每个块标记是否需要高亮：

```javascript
HighlightSearchCellType.prototype._generateSearchBlock = function(text, search) {
    if (text === "" || text === null || text === undefined || 
        search === "" || search === null || search === undefined) {
        return null;
    }
    var originalText = text.toLowerCase();
    var searchText = search.toLowerCase();
    var patt = new RegExp(searchText, "g");
    var result, blocks = [], start = 0, end = 0;
    
    while ((result = patt.exec(originalText)) != null) {
        end = patt.lastIndex - searchText.length;
        if (start < end) {
            // 普通文本块
            blocks.push({
                start: start,
                end: end,
                text: text.substring(start, end),
                highlight: false
            });
        }
        // 高亮文本块
        start = end;
        end = patt.lastIndex;
        blocks.push({
            start: start,
            end: end,
            text: text.substring(start, end),
            highlight: true
        });
        start = end;
    }
    return blocks;
}
```

该算法通过正则表达式的 `exec` 方法循环匹配所有关键词位置，将文本分为"普通块"和"高亮块"，支持同一单元格内多次匹配。

### 3.3 自定义渲染逻辑

重写 `paintValue` 方法，根据文本块的 `highlight` 属性分别渲染不同颜色：

```javascript
HighlightSearchCellType.prototype.paintValue = function(ctx, value, x, y, w, h, style, options) {
    var text = this.format(value, style.formatter);
    if (!text) return;
    
    ctx.save();
    ctx.rect(x, y, w, h);
    ctx.clip();
    
    var blocks = this._generateSearchBlock(text, options.sheet.searchText);
    if (blocks) {
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            if (block.highlight) {
                ctx.fillStyle = "red";  // 高亮部分使用红色
            } else {
                ctx.fillStyle = originalStyle;  // 普通部分使用原始颜色
            }
            ctx.fillText(block.text, x + 2, y + adjY);
            x += ctx.measureText(block.text).width;  // 累加文本宽度
        }
    } else {
        ctx.fillText(text, x + 2, y + adjY);
    }
    ctx.restore();
}
```

### 3.4 数据绑定与事件监听

通过 `bindColumns` 方法将自定义单元格类型应用到指定列，并监听搜索框的 `keyup` 事件触发重绘：

```javascript
var columnInfo = [{
    name: "LastName",
    displayName: "中文名",
    cellType: new HighlightSearchCellType(),
    size: 80
}, {
    name: "FirstName",
    displayName: "英文名",
    cellType: new HighlightSearchCellType(),
    size: 80
}];

sheet.setDataSource(getDataSource());
sheet.bindColumns(columnInfo);

document.getElementById("searchTxt").onkeyup = (function () {
    sheet.searchText = document.getElementById("searchTxt").value;
    spread.repaint();  // 触发重绘
});
```

### 3.5 技术栈

* SpreadJS 15.0.0：核心表格组件
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，表格会自动加载员工数据（包含中文名、英文名、电话、邮箱等字段）
2. 在页面顶部的搜索框中输入关键词（如"王"、"Sales"、"123"）
3. 表格中所有匹配的文本会立即以红色高亮显示
4. 修改或清空搜索框内容，高亮会实时更新

## 五、功能特点

### 5.1 优点

* **实时响应**：输入即搜索，无需额外操作
* **多列支持**：可同时在多个列中高亮显示匹配内容
* **大小写不敏感**：搜索时自动忽略大小写差异
* **多次匹配**：同一单元格内的多个匹配项都会被高亮

### 5.2 局限性与扩展建议

* **性能考虑**：当数据量极大时，每次输入都触发全表重绘可能影响性能，建议添加防抖（debounce）优化
* **高亮样式固定**：当前高亮颜色硬编码为红色，可扩展为支持自定义高亮样式（背景色、字体粗细等）
* **正则表达式支持**：可扩展为支持正则表达式搜索，提供更强大的匹配能力

## 六、关键代码片段

### 文本分块核心逻辑

```javascript
while ((result = patt.exec(originalText)) != null) {
    end = patt.lastIndex - searchText.length;
    if (start < end) {
        blocks.push({
            start: start,
            end: end,
            text: text.substring(start, end),
            highlight: false
        });
    }
    start = end;
    end = patt.lastIndex;
    blocks.push({
        start: start,
        end: end,
        text: text.substring(start, end),
        highlight: true
    });
    start = end;
}
```

该循环通过 `patt.lastIndex` 追踪匹配位置，确保所有匹配项都被正确标记。

### 搜索触发机制

```javascript
document.getElementById("searchTxt").onkeyup = (function () {
    sheet.searchText = document.getElementById("searchTxt").value;
    spread.repaint();
});
```

将搜索文本存储在 `sheet.searchText` 属性中，供自定义单元格类型的 `paintValue` 方法读取。

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的强大扩展能力，通过重写渲染方法实现了实时搜索高亮功能。开发者可以从中学到：

1. 如何继承和扩展 SpreadJS 内置单元格类型
2. Canvas 2D 渲染 API 的实际应用
3. 正则表达式在文本处理中的使用技巧
4. 数据绑定与自定义单元格类型的结合方式

该方案适用于需要快速数据检索的业务场景，如 CRM 系统、数据分析工具等。通过添加防抖优化和样式配置，可进一步提升用户体验和扩展性。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
