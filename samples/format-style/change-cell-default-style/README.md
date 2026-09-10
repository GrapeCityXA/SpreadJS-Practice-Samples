## 一、Demo 概述

本示例演示了如何在 SpreadJS 中修改单元格的默认样式，并结合工作表保护功能实现灵活的单元格锁定控制。通过将默认样式设置为未锁定状态，再对特定区域应用锁定样式，可以实现"默认可编辑，部分区域锁定"的效果。

该方案适用于需要保护部分关键数据区域，同时允许用户自由编辑其他单元格的场景，例如表单模板、数据录入界面等。

## 二、解决的问题

在实际业务中，常见的需求是：开启工作表保护后，大部分单元格允许用户编辑，仅少数关键区域（如公式、标题行）需要锁定。SpreadJS 默认情况下所有单元格的 `locked` 属性为 `true`，开启保护后全部不可编辑。本示例通过修改默认样式解决以下问题：

* 避免逐个单元格设置 `locked = false` 的繁琐操作
* 实现"默认可编辑，特定区域锁定"的反向保护逻辑
* 确保新建工作表和动态添加的单元格自动继承未锁定状态

## 三、实现思路

### 3.1 修改默认样式为未锁定状态

SpreadJS 的 `setDefaultStyle()` 方法可以修改工作表的默认单元格样式。通过创建一个 `locked = false` 的样式对象并应用到所有工作表，可以批量解除单元格锁定：

```javascript
let defaultStyle = new GC.Spread.Sheets.Style()
defaultStyle.locked = false

// 修改所有sheet的默认样式
for (let i = 0; i < spread.getSheetCount(); i++) {
    let sheet = spread.getSheet(i)
    sheet.setDefaultStyle(defaultStyle)
    sheet.options.isProtected = true
}
```

关键点：

* `setDefaultStyle()` 影响工作表中所有未显式设置样式的单元格
* 必须在开启 `isProtected = true` 之前设置默认样式
* 遍历所有工作表确保全局生效

### 3.2 监听工作表切换事件

为了确保用户新建的工作表也自动应用未锁定的默认样式，需要监听 `ActiveSheetChanged` 事件：

```javascript
spread.bind(GC.Spread.Sheets.Events.ActiveSheetChanged, function (sender, args) {
    args.newSheet.setDefaultStyle(defaultStyle)
});
```

这样可以保证动态创建的工作表与现有工作表行为一致。

### 3.3 对特定区域应用锁定样式

通过 `getRange()` 方法选中需要保护的区域，并设置 `locked = true` 和背景色作为视觉提示：

```javascript
let style = new GC.Spread.Sheets.Style()
style.backColor = "#f0f0f0"
style.locked = true
spread.getActiveSheet().getRange(3,3,5,5).setStyle(style)
```

此代码将第 4-8 行、第 4-8 列（共 5×5 区域）设置为灰色背景且锁定，用户无法编辑该区域。

### 3.4 技术栈

* SpreadJS 核心库：v16.0.5
* SpreadJS Designer：v16.0.5（提供可视化设计器界面）
* 中文资源包：`spread-sheets-resources-zh`、`spread-sheets-designer-resources-cn`

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后，可以看到 SpreadJS Designer 界面
2. 尝试编辑任意单元格，发现大部分单元格可以正常输入
3. 尝试编辑灰色背景区域（D4:H8），发现无法编辑
4. 点击"插入"菜单新建工作表，新工作表中的单元格同样默认可编辑
5. 在 Designer 中可以通过"保护工作表"功能查看保护状态

## 五、功能特点

### 5.1 优点

* 简化配置：通过修改默认样式一次性解决所有单元格的锁定状态，无需逐个设置
* 灵活控制：可以精确控制哪些区域锁定，哪些区域可编辑
* 视觉提示：通过背景色区分锁定区域和可编辑区域，提升用户体验
* 动态适配：监听事件确保新建工作表自动继承配置

### 5.2 扩展建议

* 可以结合条件格式或数据验证，对可编辑区域进行输入限制
* 可以通过 UI 控件（如按钮）动态切换保护状态，实现"编辑模式"和"查看模式"切换
* 对于复杂场景，可以使用 `protectionOptions` 精细控制允许的操作（如允许排序、筛选等）

## 六、关键代码片段

### 批量设置默认样式并开启保护

```javascript
let defaultStyle = new GC.Spread.Sheets.Style()
defaultStyle.locked = false

for (let i = 0; i < spread.getSheetCount(); i++) {
    let sheet = spread.getSheet(i)
    sheet.setDefaultStyle(defaultStyle)  // 设置默认样式
    sheet.options.isProtected = true     // 开启工作表保护
}
```

### 锁定特定区域

```javascript
let style = new GC.Spread.Sheets.Style()
style.backColor = "#f0f0f0"  // 灰色背景作为视觉提示
style.locked = true           // 锁定状态
spread.getActiveSheet().getRange(3,3,5,5).setStyle(style)  // 应用到 D4:H8 区域
```

## 七、总结

本示例展示了 SpreadJS 中修改默认样式和工作表保护的实用技巧，开发者可以从中学到：

* 如何使用 `setDefaultStyle()` 批量修改单元格样式
* 工作表保护机制的原理（`isProtected` + `locked` 属性）
* 如何通过事件监听实现动态配置
* 样式对象的创建和应用方法

该方案适用于需要灵活控制单元格编辑权限的场景，特别是在表单设计、数据录入模板等应用中具有较高的实用价值。通过合理设置默认样式和局部样式，可以在保护数据安全的同时，保持良好的用户交互体验。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
