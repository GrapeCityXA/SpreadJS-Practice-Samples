## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer 中自定义工具栏组件，通过添加一个微调器（Spinner）控件来动态调整单元格文本的旋转角度。用户可以通过工具栏上的微调器控件，以 5 度为步长在 -360 到 360 度范围内调整选中单元格的文本方向，实现文本旋转效果的可视化控制。

该示例适用于需要在 SpreadJS Designer 中扩展自定义功能的场景，特别是需要添加交互式控件来控制单元格样式属性的需求。

## 二、解决的问题

- 扩展 SpreadJS Designer 的工具栏功能，添加自定义交互控件
- 提供可视化的文本旋转角度调整方式，替代手动输入角度值
- 实现单元格样式属性与工具栏控件的双向绑定，确保控件状态与单元格状态同步

## 三、实现思路

### 3.1 自定义命令配置

通过修改 `GC.Spread.Sheets.Designer.DefaultConfig` 的 `commandMap` 属性，注册一个名为 `MySpinner` 的自定义命令。该命令定义了微调器的基本属性、数值范围、执行逻辑和状态获取方法。

```javascript
let config = GC.Spread.Sheets.Designer.DefaultConfig
config.commandMap = {
    MySpinner: {
        title: "自定义功能",
        text: "微调器",
        bigButton: "true",
        commandName: "MySpinner",
        type: "spinner",
        commandOptions: {
            numberEditorOption: {
                min: -360,
                max: 360,
                step: 5,
            }
        },
        execute: function (context, propertyName, checked) {
            context.setData(SPINNERVAL, checked);
            let sheet = context.getWorkbook().getActiveSheet()
            let { row, col } = sheet.getSelections()[0]
            sheet.setTag(row, col, checked)
            let style = sheet.getStyle(row, col)
            style.textOrientation = context.getData(SPINNERVAL)
            sheet.setStyle(row, col, style)
        },
        getState: function (context, propertyName) {
            let sheet = context.getWorkbook().getActiveSheet()
            let { row, col } = sheet.getSelections()[0]
            let result = sheet.getTag(row, col)
            return result ? result : 0;
        }
    }
}
```

关键配置说明：
- `type: "spinner"` 指定控件类型为微调器
- `numberEditorOption` 定义数值范围（-360 到 360 度）和步长（5 度）
- `execute` 方法在用户调整微调器时触发，更新单元格的 `textOrientation` 样式属性
- `getState` 方法用于同步控件显示值与单元格当前状态

### 3.2 工具栏按钮组注册

将自定义命令添加到 Designer 的 Ribbon 工具栏中，创建一个新的按钮组并放置在第一个选项卡的最前面。

```javascript
config.ribbon[0].buttonGroups.unshift({
    "label": "自定义功能",
    "thumbnailClass": "welcome",
    "commandGroup": {
        "children": [
            {
                "direction": "vertical",
                "commands": [
                    "MySpinner"
                ]
            }
        ]
    }
});
```

使用 `unshift` 方法将自定义按钮组插入到工具栏的最前面，确保用户能够快速访问该功能。

### 3.3 单元格状态持久化

通过 `sheet.setTag()` 和 `sheet.getTag()` 方法将旋转角度值存储在单元格的 Tag 属性中，实现状态持久化。当用户切换选中单元格时，微调器能够自动显示该单元格的当前旋转角度。

```javascript
// 保存状态
sheet.setTag(row, col, checked)

// 读取状态
let result = sheet.getTag(row, col)
return result ? result : 0;
```

### 3.4 技术栈

- SpreadJS 16.0.1（核心表格控件）
- SpreadJS Designer 16.0.1（设计器组件）
- SystemJS 0.19.22（模块加载器）
- TypeScript 4.1.2（开发语言支持）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，Designer 会自动加载，A1 单元格已预设文本"这是一段文字"
2. 选中 A1 单元格（或任意其他单元格）
3. 在工具栏左侧找到"自定义功能"按钮组中的"微调器"控件
4. 点击微调器的上下箭头或直接输入数值，调整文本旋转角度
5. 观察单元格中文本的旋转效果
6. 切换到其他单元格，微调器会自动显示该单元格的当前旋转角度（如果之前设置过）

## 五、功能特点

### 5.1 优点

- 提供直观的可视化控件，用户无需记忆 API 或手动编写代码即可调整文本方向
- 实现了控件状态与单元格状态的双向绑定，切换单元格时自动同步显示
- 通过 Tag 属性持久化状态，确保旋转角度不会因为样式重置而丢失
- 代码结构清晰，易于扩展为其他类型的自定义控件

### 5.2 扩展建议

- 可以添加更多自定义控件（如颜色选择器、字体选择器等）到同一个按钮组
- 可以将微调器的范围和步长设置为可配置参数，适应不同的业务需求
- 可以添加撤销/重做功能支持，提升用户体验

## 六、关键代码片段

### 6.1 初始化单元格样式

```javascript
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()
sheet.setValue(0, 0, "这是一段文字")
sheet.setRowHeight(0, 100)
sheet.setColumnWidth(0, 100)
let style = new GC.Spread.Sheets.Style()
style.hAlign = GC.Spread.Sheets.HorizontalAlign.center;
style.vAlign = GC.Spread.Sheets.VerticalAlign.center;
sheet.setStyle(0, 0, style)
```

该代码段设置了 A1 单元格的初始状态，包括文本内容、行高、列宽和居中对齐样式，为演示文本旋转效果提供了良好的视觉基础。

## 七、总结

本示例展示了 SpreadJS Designer 的强大扩展能力，开发者可以通过配置 `commandMap` 和 `ribbon` 轻松添加自定义工具栏控件。通过学习本示例，开发者可以掌握：

- SpreadJS Designer 自定义命令的注册和配置方法
- 微调器（Spinner）控件的使用和参数设置
- 单元格样式属性（textOrientation）的动态修改
- 通过 Tag 属性实现单元格状态持久化
- 工具栏按钮组的布局和组织方式

该方案适用于需要在 SpreadJS Designer 中添加自定义交互控件的场景，具有良好的可扩展性，可以作为开发其他自定义功能的参考模板。

### 在线Demo（[全屏打开](https://jscodemine.grapecity.com/share/ot4vP5hIA06tNJQxlTdVJg/)）
