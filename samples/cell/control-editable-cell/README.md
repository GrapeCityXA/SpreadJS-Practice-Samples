## 一、Demo 概述

本示例展示了如何通过自定义单元格类型实现可视化的编辑权限控制。在单元格右上角显示一个图标按钮，当图标为对号（✓）时单元格处于锁定状态不可编辑，当图标为错号（✗）时单元格可以进行编辑。用户通过点击图标即可切换单元格的编辑状态，实现了直观的编辑权限管理。 

该方案适用于需要动态控制单元格编辑权限的场景，例如表单审批流程、数据录入权限管理等业务需求。

## 二、解决的问题

* **动态编辑权限控制**：在不刷新页面的情况下，允许用户通过点击按钮快速切换单元格的可编辑状态
* **可视化状态反馈**：通过图标直观地展示当前单元格是否可编辑，提升用户体验
* **细粒度权限管理**：可以针对单个单元格进行编辑权限控制，而不是整个工作表

## 三、实现思路

### 3.1 自定义单元格类型

通过继承 `GC.Spread.Sheets.CellTypes.Text` 创建自定义单元格类型，添加图标绘制和交互逻辑：

```javascript
function ImageCellType() {
    // iconFlag 用于判断按钮图片的切换
    this.iconFlag = true
}

// 继承文本单元格
ImageCellType.prototype = new GC.Spread.Sheets.CellTypes.Text()
```

### 3.2 自定义绘制逻辑

重写 `paint` 方法，在单元格右上角绘制状态图标：

```javascript
ImageCellType.prototype.paint = function (ctx, value, x, y, width, height, style, context) {
    // 先调用父类方法绘制文本内容
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, [ctx, value, x, y, width, height, style, context])
    
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x, y)
    
    // 根据 iconFlag 切换图片显示
    if (this.iconFlag) {
        ctx.drawImage(rightImg, x + width - 20, y, 20, 20)  // 对号图标
    } else {
        ctx.drawImage(errorImg, x + width - 20, y, 20, 20)  // 错号图标
    }
    
    ctx.restore()
    return
}
```

### 3.3 点击区域检测

通过 `getHitInfo` 方法定义图标的可点击区域（单元格右上角 20x20 像素区域）：

```javascript
ImageCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
    var info = {
        x: x,
        y: y,
        row: context.row,
        col: context.col,
        cellStyle: cellStyle,
        cellRect: cellRect,
        sheetArea: context.sheetArea
    };

    // 判断是否点击了图标区域
    if ((cellRect.x + cellRect.width - 20 < x) && (x < cellRect.x + cellRect.width) && 
        (cellRect.y < y) && (y < cellRect.y + 20)) {
        info.isReservedLocation = true;
    }

    return info;
}
```

### 3.4 鼠标事件处理

通过 `processMouseUp` 方法处理图标点击事件，切换图标状态并更新单元格锁定属性：

```javascript
ImageCellType.prototype.processMouseUp = function (hitInfo) {
    var sheet = hitInfo.sheet;
    var that = this;
    
    // 点击图标区域时切换状态
    if (sheet && hitInfo.isReservedLocation) {
        if (that.iconFlag) {
            that.iconFlag = false;
        } else {
            that.iconFlag = true;
        }
        
        // 根据图标状态更新单元格锁定状态
        let cell = hitInfo.sheet.getCell(hitInfo.row, hitInfo.col);
        cell.locked(that.iconFlag);
        sheet.repaint();
        return true;
    }
    return false;
};
```

### 3.5 应用自定义单元格并启用保护

```javascript
// 应用自定义单元格类型到 A1 单元格
sheet.setCellType(0, 0, new ImageCellType());

// 开启工作表保护，使 locked 属性生效
sheet.options.isProtected = true;

// 设置初始值
sheet.setValue(0, 0, "葡萄城");
```

### 3.6 技术栈

* **SpreadJS**: 15.0.0 - 核心表格组件
* **SystemJS**: 0.19.22 - 模块加载器
* **TypeScript**: 4.1.2 - 开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，A1 单元格显示"葡萄城"文字，右上角显示对号图标
2. 此时尝试双击 A1 单元格，无法进入编辑状态（单元格被锁定）
3. 点击 A1 单元格右上角的对号图标，图标切换为错号
4. 再次双击 A1 单元格，可以正常编辑内容
5. 编辑完成后，点击错号图标切换回对号，单元格重新锁定

## 五、功能特点

### 5.1 优点

* **交互直观**：通过可视化图标清晰展示单元格的编辑状态
* **操作便捷**：一键切换编辑权限，无需复杂的菜单操作
* **扩展性强**：可以轻松扩展到多个单元格，实现批量权限控制
* **代码简洁**：核心实现仅需重写三个方法（paint、getHitInfo、processMouseUp）

### 5.2 局限性与扩展建议

* **图标资源依赖外部链接**：当前使用在线图片资源，建议改为本地资源或 Base64 编码以提高稳定性
* **单一单元格应用**：示例仅演示了单个单元格的应用，实际项目中可以封装为批量应用函数
* **状态持久化**：当前状态仅存在于内存中，刷新页面后会重置，可以结合数据绑定实现状态持久化

## 六、关键代码片段

### 自定义单元格类型完整实现

```javascript
function ImageCellType() {
    this.iconFlag = true  // 默认锁定状态
}

// 继承文本单元格
ImageCellType.prototype = new GC.Spread.Sheets.CellTypes.Text()

// 自定义绘制
ImageCellType.prototype.paint = function (ctx, value, x, y, width, height, style, context) {
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, [ctx, value, x, y, width, height, style, context])
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x, y)
    if (this.iconFlag) {
        ctx.drawImage(rightImg, x + width - 20, y, 20, 20)
    } else {
        ctx.drawImage(errorImg, x + width - 20, y, 20, 20)
    }
    ctx.restore()
    return
}

// 点击区域检测
ImageCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
    var info = { /* ... */ };
    if ((cellRect.x + cellRect.width - 20 < x) && (x < cellRect.x + cellRect.width) && 
        (cellRect.y < y) && (y < cellRect.y + 20)) {
        info.isReservedLocation = true;
    }
    return info;
}

// 鼠标事件处理
ImageCellType.prototype.processMouseUp = function (hitInfo) {
    if (hitInfo.sheet && hitInfo.isReservedLocation) {
        this.iconFlag = !this.iconFlag;
        let cell = hitInfo.sheet.getCell(hitInfo.row, hitInfo.col);
        cell.locked(this.iconFlag);
        hitInfo.sheet.repaint();
        return true;
    }
    return false;
};
```

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的强大扩展能力，通过重写绘制和交互方法，实现了可视化的编辑权限控制功能。开发者可以从中学到：

* 如何继承和扩展 SpreadJS 内置单元格类型
* Canvas 绘图 API 在单元格自定义绘制中的应用
* 单元格点击区域检测和鼠标事件处理机制
* 单元格锁定属性与工作表保护的配合使用

该方案适用于需要动态控制单元格编辑权限的业务场景，可以根据实际需求扩展为更复杂的权限管理系统，例如结合用户角色、审批流程等实现更精细的权限控制。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
