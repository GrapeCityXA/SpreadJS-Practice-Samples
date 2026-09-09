## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现两个高级自定义功能：一是在单元格中添加带图片的自定义按钮组，支持点击触发自定义操作；二是在列头实现全选复选框功能，点击列头复选框可以批量勾选或取消该列所有行的复选框。这两个功能结合数据绑定机制，为表格提供了更丰富的交互体验。

该示例适用于需要在表格中实现批量操作、行级操作按钮（如编辑、删除）以及列级全选控制的业务场景，例如数据管理系统、审批流程表单等。

## 二、解决的问题

- **单元格操作按钮需求**：在传统表格中，每行数据通常需要提供编辑、删除等操作入口，本示例通过自定义单元格类型实现了带图标的操作按钮组，提升用户体验
- **列头全选功能**：在包含复选框列的表格中，用户需要快速全选或取消全选所有行，通过自定义列头复选框实现批量操作
- **图文混排交互**：实现单元格内图片与文字的组合显示，并支持独立的点击事件响应

## 三、实现思路

### 3.1 核心技术点

#### 自定义单元格类型 - 图文按钮组

通过继承 `GC.Spread.Sheets.CellTypes.Base` 创建自定义单元格类型 `MutipHyperLinkPictureCellType`，实现图片与文字的组合渲染：

```javascript
function MutipHyperLinkPictureCellType(items, size, isHorizontal) {
    this.typeName = "MutipHyperLinkPictureCellType";
    this._size = size || 22;
    this._isHorizontal = isHorizontal || false;
    this._items = items || [];
    this._valueArr = [];
}

MutipHyperLinkPictureCellType.prototype = new spreadNS.CellTypes.Base();
```

在 `paint` 方法中实现图文混排渲染逻辑：

```javascript
MutipHyperLinkPictureCellType.prototype.paint = function(ctx, value, x, y, w, h, style, options) {
    GC.Spread.Sheets.CellTypes.Base.prototype.paint.call(this, ctx, '', x, y, w, h, style, options);
    
    for (var i = 0; i < value.length; i++) {
        var backgroundImgStyle = new GC.Spread.Sheets.Style();
        backgroundImgStyle.backgroundImage = value[i].url;
        
        const pictureWidth = 20;
        const pictureHeight = 20;
        const groupWidth = 60;
        
        // 渲染文字
        GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, value[i].text, 
            startX + pictureWidth + i * groupWidth, startY + 10 - size / 2, 
            width + 10, size, hyperStyle, options);
        
        // 渲染图片
        GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(this, ctx, "", 
            startX + i * 60, startY, pictureWidth, pictureHeight, 
            backgroundImgStyle, options);
    }
};
```

#### 点击事件处理

通过 `getHitInfo` 和 `processMouseUp` 方法实现点击区域检测和事件响应：

```javascript
MutipHyperLinkPictureCellType.prototype.getHitInfo = function(x, y, cellStyle, cellRect, context) {
    var info = {
        x: x, y: y, row: context.row, col: context.col,
        cellStyle: cellStyle, cellRect: cellRect, sheetArea: context.sheetArea
    };
    
    for (var i = 0; i < this._valueArr.length; i++) {
        if (x > cellRect.x + i * width + pictureWidth && 
            x < cellRect.x + oddNum * groupWidth + width - 20) {
            info.isReservedLocation = true;
            info.reservedLocation = i;
            info.fuc = this._valueArr[i].fuc;
            break;
        }
    }
    return info;
};

MutipHyperLinkPictureCellType.prototype.processMouseUp = function(hitInfo) {
    if (hitInfo.isReservedLocation && hitInfo.reservedLocation >= 0) {
        var mm = hitInfo.fuc;
        mm(); // 执行自定义回调函数
        return true;
    }
    return false;
};
```

#### 列头全选复选框

创建自定义列头复选框类型 `HeaderCheckBoxCellType`，继承自 `GC.Spread.Sheets.CellTypes.CheckBox`：

```javascript
function HeaderCheckBoxCellType() {
    spreadNS.CellTypes.CheckBox.apply(this);
}

HeaderCheckBoxCellType.prototype = new spreadNS.CellTypes.CheckBox();

HeaderCheckBoxCellType.prototype.processMouseUp = function(hitInfo) {
    var sheet = hitInfo.sheet, col = hitInfo.col, sheetArea = hitInfo.sheetArea;
    var tag = sheet.getTag(hitInfo.row, col, sheetArea);
    
    if (tag === undefined || tag === null) {
        sheet.setTag(hitInfo.row, col, true, sheetArea);
    } else {
        sheet.setTag(hitInfo.row, col, !tag, sheetArea);
    }
    
    tag = sheet.getTag(hitInfo.row, col, sheetArea);
    sheet.suspendPaint();
    for (var i = 0; i < sheet.getRowCount(); i++) {
        var cell = sheet.getCell(i, col);
        if (cell.cellType() instanceof GC.Spread.Sheets.CellTypes.CheckBox) {
            cell.value(tag);
        }
    }
    sheet.resumePaint();
};
```

#### 列头与数据行复选框联动

通过监听 `ButtonClicked` 事件实现数据行复选框变化时自动更新列头状态：

```javascript
spread.bind(GC.Spread.Sheets.Events.ButtonClicked, function(e, args) {
    var sheet = args.sheet, row = args.row, col = args.col;
    var cellType = sheet.getCellType(row, col);
    
    if (cellType instanceof GC.Spread.Sheets.CellTypes.CheckBox) {
        var colHeaderCell = sheet.getCell(0, col, GC.Spread.Sheets.SheetArea.colHeader);
        if (colHeaderCell.cellType() instanceof HeaderCheckBoxCellType) {
            var checkStatus = true;
            for (var i = 0; i < sheet.getRowCount(); i++) {
                var cell = sheet.getCell(i, col);
                if (cell.cellType() instanceof GC.Spread.Sheets.CellTypes.CheckBox && !cell.value()) {
                    checkStatus = false;
                    break;
                }
            }
            colHeaderCell.tag(checkStatus);
            sheet.repaint();
        }
    }
});
```

### 3.2 技术栈

- SpreadJS 15.0.0 - 核心表格控件
- SpreadJS TableSheet 15.0.0 - 表格扩展功能
- TypeScript 4.1.2 - 类型支持
- SystemJS 0.19.22 - 模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，表格会自动加载包含 3 行数据的示例
2. 点击列头第一列的复选框，可以全选或取消全选该列所有行
3. 单独勾选或取消某行的复选框，当所有行都勾选时，列头复选框自动勾选；反之自动取消
4. 在"操作"列中，每行显示"编辑"和"修改"两个带图标的按钮
5. 点击"编辑"或"修改"按钮，会触发对应的 `edit(i)` 或 `update(i)` 函数（当前为 alert 提示）

## 五、功能特点

### 5.1 优点

- **高度可定制**：自定义单元格类型支持灵活的渲染逻辑和交互行为
- **用户体验优化**：图文混排的操作按钮比纯文本链接更直观
- **批量操作便捷**：列头全选功能大幅提升批量操作效率
- **双向联动**：列头与数据行复选框状态自动同步，逻辑严谨

### 5.2 局限性与扩展建议

- **图片加载性能**：当前使用远程图片 URL，建议改用本地图标或 Base64 编码提升加载速度
- **按钮样式固定**：按钮间距和尺寸硬编码，可改为通过参数配置
- **扩展建议**：
  - 可以扩展支持更多按钮（当前为 2 个）
  - 可以添加按钮禁用状态和权限控制
  - 可以实现按钮的 hover 效果和 tooltip 提示

## 六、关键代码片段

### 单元格数据绑定

```javascript
var cell = sheet.getCell(i, 5);
cell.foreColor("green");
cell.cellType(rbCellType);
cell.value([{
    text: "编辑",
    url: "https://www.google.com.hk/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
    fuc: function() { edit(i) }
}, {
    text: "修改",
    url: "https://www.baidu.com/img/bd_logo1.png",
    fuc: function() { update(i) }
}]);
```

### 列头复选框设置

```javascript
sheet.setCellType(0, 0, new HeaderCheckBoxCellType(), spreadNS.SheetArea.colHeader);
```

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的强大能力，通过继承基础单元格类型并重写渲染和事件处理方法，可以实现复杂的业务交互需求。开发者可以从中学到：

- 自定义单元格类型的完整实现流程（构造函数、paint、getHitInfo、processMouseUp 等方法）
- Canvas 绘图 API 在单元格渲染中的应用
- 事件监听与状态联动的实现机制
- 数据绑定与自定义单元格类型的结合使用

该方案适用于需要在表格中实现复杂交互控件的场景，具有良好的扩展性，可以根据实际需求定制更多功能。


### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/3a4nyMnIhkqCRcdDcGbCcw/)）
