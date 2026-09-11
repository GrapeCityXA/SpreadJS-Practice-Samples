## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现拖拽移动整列的功能，并确保在拖拽过程中不覆盖目标位置的原有列，而是将原有列向后移动（插入模式）。通过重写 SpreadJS 内置的 `dragDrop` 命令，实现了更符合用户直觉的列拖拽行为。

## 二、解决的问题

* **默认拖拽行为的局限性**：SpreadJS 默认的拖拽行为在移动列时会覆盖目标位置的数据，这在某些场景下不符合用户预期
* **插入式移动需求**：用户希望拖拽列时能够像插入操作一样，将目标位置及后续的列向右推移，而不是直接替换
* **提升用户体验**：通过自定义拖拽逻辑，使列的移动操作更加灵活和安全

## 三、实现思路

### 3.1 核心技术点

#### 重写 dragDrop 命令

通过保存原始的 `dragDrop.execute` 方法，然后重写该方法来修改拖拽行为。关键在于判断拖拽操作是否针对整列（`fromRow === -1`）或整行（`fromColumn === -1`），如果是，则将 `option.insert` 设置为 `true`，强制使用插入模式。

```javascript
var oldDragDropExcecte = GC.Spread.Sheets.Commands.dragDrop.execute;
GC.Spread.Sheets.Commands.dragDrop.execute = function (context, option, isUndo) {
    if (option.fromRow === -1 || option.fromColumn === -1) {
        option.insert = true;
    }
    oldDragDropExcecte.call(this, context, option, isUndo);
}
```

**实现原理**：

* `option.fromRow === -1` 表示拖拽的是整列（行索引为 -1）
* `option.fromColumn === -1` 表示拖拽的是整行（列索引为 -1）
* 设置 `option.insert = true` 后，拖拽操作会以插入模式执行，而不是覆盖模式
* 使用 `call(this, ...)` 确保原始方法在正确的上下文中执行

#### 初始化工作簿和数据

创建 SpreadJS 工作簿实例，并在工作表中填充测试数据，方便用户测试拖拽功能。

```javascript
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getActiveSheet();

sheet.setValue(0, 0, 0);
sheet.setValue(0, 1, 1);
sheet.setValue(0, 2, 2);
sheet.setValue(0, 3, 3);
```

### 3.2 技术栈

* **@grapecity/spread-sheets**: 15.0.0 - SpreadJS 核心库
* **SystemJS**: 0.19.22 - 模块加载器
* **TypeScript**: 4.1.2 - 类型支持（虽然源码使用 JavaScript）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开 `index.html` 文件，页面会显示一个 SpreadJS 工作簿
2. 工作表第一行已预填充数据：0, 1, 2, 3
3. 点击列头选中整列（例如选中 A 列）
4. 按住鼠标左键拖拽列头到目标位置（例如拖拽到 C 列位置）
5. 释放鼠标，观察结果：原 C 列及后续列会向右移动，被拖拽的列插入到目标位置

## 五、功能特点

### 5.1 优点

* **非破坏性操作**：拖拽移动列时不会覆盖目标位置的数据，保证数据安全
* **实现简洁**：仅需重写一个命令方法，代码量少，易于维护
* **兼容性好**：基于 SpreadJS 内置命令扩展，不影响其他功能
* **用户体验优化**：符合用户对"移动"操作的直觉理解

### 5.2 局限性与扩展建议

* **全局影响**：当前实现会影响所有工作簿实例的拖拽行为，如果需要针对特定工作簿或工作表定制，需要在命令执行时增加条件判断
* **扩展方向**：可以添加配置选项，允许用户在运行时切换插入模式和覆盖模式

## 六、关键代码片段

### 命令重写的完整实现

```javascript
// 保存原始的 dragDrop 命令执行方法
var oldDragDropExcecte = GC.Spread.Sheets.Commands.dragDrop.execute;

// 重写 dragDrop 命令
GC.Spread.Sheets.Commands.dragDrop.execute = function (context, option, isUndo) {
    // 判断是否拖拽整列或整行
    // fromRow === -1 表示拖拽整列
    // fromColumn === -1 表示拖拽整行
    if (option.fromRow === -1 || option.fromColumn === -1) {
        // 强制使用插入模式
        option.insert = true;
    }
    // 调用原始方法执行拖拽操作
    oldDragDropExcecte.call(this, context, option, isUndo);
}
```

## 七、总结

本示例展示了如何通过重写 SpreadJS 内置命令来定制拖拽行为，这是一种强大的扩展机制。开发者可以从中学到：

1. **命令模式的应用**：SpreadJS 使用命令模式管理用户操作，通过重写命令可以灵活定制行为
2. **API 参数的理解**：理解 `fromRow`、`fromColumn` 和 `insert` 等参数的含义是实现定制功能的关键
3. **保存原始方法的技巧**：在重写方法前保存原始引用，确保可以调用原始逻辑
4. **最小化侵入原则**：通过简单的条件判断实现功能扩展，不影响其他功能的正常运行

该方案适用于需要定制拖拽行为的场景，特别是在数据编辑类应用中，可以有效防止用户误操作导致的数据覆盖问题。开发者可以基于此思路扩展更多自定义命令逻辑。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
