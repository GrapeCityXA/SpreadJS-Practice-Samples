## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现按住 Shift 键时通过鼠标滚轮进行横向滚动的功能。在默认情况下，鼠标滚轮只能实现纵向滚动，但在处理列数较多的表格时，用户往往需要便捷的横向滚动方式。该示例通过监听鼠标滚轮事件并结合 Shift 键状态，实现了类似 Excel 的横向滚动交互体验。

需要注意的是，从 SpreadJS V18 版本开始，此功能已作为默认特性内置到产品中，无需额外代码实现。本示例主要用于展示在 V18 之前版本中如何通过事件监听实现该功能。

## 二、解决的问题

在实际的电子表格应用中，用户经常需要处理列数较多的数据表格。传统的横向滚动方式（拖动滚动条或使用方向键）操作效率较低，用户体验不佳。该示例解决了以下问题：

- 提供更符合用户习惯的横向滚动方式（按住 Shift + 鼠标滚轮）
- 提升处理宽表格数据时的操作效率
- 实现与 Excel 等主流电子表格软件一致的交互体验

## 三、实现思路

### 3.1 核心技术点

#### 监听视口滚轮事件

通过获取 SpreadJS 视口元素（ID 为 `vp_vp`）并添加 `wheel` 事件监听器，捕获用户的鼠标滚轮操作：

```javascript
document.getElementById("vp_vp").addEventListener("wheel", function (arg) {
    let sheet = spread.getActiveSheet()
    if (arg.shiftKey) {
        let scrollValue = -arg.wheelDelta
        sheet.scroll(0, scrollValue)
    } else {
        let scrollValue = -arg.wheelDelta / 3
        sheet.scroll(scrollValue, 0)
    }
})
```

#### 判断 Shift 键状态

通过事件对象的 `shiftKey` 属性判断用户是否按住了 Shift 键，从而决定滚动方向：

- 当 `arg.shiftKey` 为 `true` 时，执行横向滚动
- 当 `arg.shiftKey` 为 `false` 时，执行纵向滚动

#### 调用 scroll 方法实现滚动

使用 SpreadJS 的 `sheet.scroll(x, y)` 方法控制表格滚动：

- `sheet.scroll(0, scrollValue)`：横向滚动，第一个参数为 0 表示纵向不滚动
- `sheet.scroll(scrollValue, 0)`：纵向滚动，第二个参数为 0 表示横向不滚动

滚动值通过 `-arg.wheelDelta` 计算，负号用于确保滚动方向与鼠标滚轮方向一致。纵向滚动时除以 3 是为了调整滚动速度，使其更加平滑。

### 3.2 技术栈

- SpreadJS 16.0.1：核心电子表格组件
- SpreadJS Designer 16.0.1：设计器组件
- SystemJS：模块加载器
- TypeScript 4.1.2：开发语言

## 四、使用说明

### 4.1 运行方式

1. 安装依赖：

```bash
npm install
```

2. 在浏览器中打开 `index.html` 文件

### 4.2 操作步骤

1. 打开示例页面后，会看到一个包含 200 列的 SpreadJS Designer 实例
2. 不按任何键，直接滚动鼠标滚轮，表格会纵向滚动
3. 按住 Shift 键，然后滚动鼠标滚轮，表格会横向滚动
4. 释放 Shift 键后，滚动行为恢复为纵向滚动

## 五、功能特点

### 5.1 优点

- 实现简单，代码量少，仅需 10 行左右的核心代码
- 交互体验与 Excel 等主流电子表格软件保持一致
- 提升了处理宽表格时的操作效率
- 兼容 SpreadJS Designer 环境

### 5.2 局限性与扩展建议

- 该实现依赖于固定的 DOM 元素 ID（`vp_vp`），如果 SpreadJS 内部结构发生变化，可能需要调整代码
- 滚动速度通过固定系数（除以 3）调整，可以考虑增加配置项让用户自定义滚动速度
- 从 SpreadJS V18 版本开始，该功能已内置，建议升级到新版本以获得更好的兼容性和性能

## 六、关键代码片段

### 完整的事件监听实现

```javascript
// 获取视口元素并添加滚轮事件监听
document.getElementById("vp_vp").addEventListener("wheel", function (arg) {
    let sheet = spread.getActiveSheet()
    
    // 判断是否按住 Shift 键
    if (arg.shiftKey) {
        // 按住 Shift 键时，横向滚动
        let scrollValue = -arg.wheelDelta
        sheet.scroll(0, scrollValue)
    } else {
        // 未按 Shift 键时，纵向滚动
        let scrollValue = -arg.wheelDelta / 3
        sheet.scroll(scrollValue, 0)
    }
})
```

### 初始化 SpreadJS Designer

```javascript
// 创建 Designer 实例
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")

// 获取工作簿和活动工作表
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

// 设置列数为 200，便于测试横向滚动
sheet.setColumnCount(200)
```

## 七、总结

本示例展示了如何通过监听鼠标滚轮事件和判断 Shift 键状态，实现 SpreadJS 中的横向滚动功能。该方案代码简洁，易于理解和实现，适用于 SpreadJS V18 之前的版本。

开发者可以从本示例中学到：

- 如何监听 SpreadJS 视口的鼠标事件
- 如何使用 `sheet.scroll()` 方法控制表格滚动
- 如何通过事件对象的 `shiftKey` 属性判断键盘状态
- 如何调整滚动速度以优化用户体验

该方案适用于需要增强横向滚动体验的电子表格应用场景。对于使用 SpreadJS V18 及以上版本的项目，建议直接使用内置的横向滚动功能，无需额外实现。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/hy0y8-6sbECbufw6rlc8BA/)）
