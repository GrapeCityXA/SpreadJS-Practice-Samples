## 一、Demo 概述

本示例演示了如何在 SpreadJS Designer 中自定义粘贴行为，实现 Ctrl+V 粘贴时只粘贴单元格的值和公式，而不复制其他格式属性（如背景色、字体等）。通过监听 `ClipboardPasting` 事件并取消默认粘贴行为，开发者可以精确控制粘贴逻辑，满足特定的业务需求。

## 二、解决的问题

在实际的电子表格应用中，用户经常需要只复制数据内容而不带格式。默认的粘贴行为会将源单元格的所有属性（包括样式、格式、公式等）一并复制到目标区域，这在某些场景下并不符合需求。本示例解决了以下问题：

- 避免粘贴时带入不必要的格式样式（如背景色、字体颜色等）
- 保留公式的逻辑关系，确保计算功能正常
- 对于非公式单元格，只粘贴纯值，保持目标区域的原有格式
- 提供可定制的粘贴逻辑，满足企业级应用的个性化需求

## 三、实现思路

### 3.1 核心技术点

#### 监听 ClipboardPasting 事件

通过监听 SpreadJS 的 `ClipboardPasting` 事件，可以在粘贴操作发生前拦截并自定义处理逻辑：

```javascript
spread.bind(GC.Spread.Sheets.Events.ClipboardPasting, (sender, args) => {
    // 取消默认的粘贴
    args.cancel = true
    // 从哪里获取数据
    args.fromRange
    // 数据粘贴到哪里
    args.cellRange
})
```

关键参数说明：
- `args.cancel = true`：取消默认粘贴行为，由自定义逻辑接管
- `args.fromRange`：源数据区域的范围信息（行、列、行数、列数）
- `args.cellRange`：目标粘贴区域的范围信息

#### 遍历源区域并判断单元格类型

通过双重循环遍历源区域的所有单元格，判断每个单元格是否包含公式：

```javascript
for (let i = 0; i < args.fromRange.rowCount; i++) {
    for (let j = 0; j < args.fromRange.colCount; j++) {
        // 获取源单元格
        let sourceCell = spread.getActiveSheet().getCell(
            args.fromRange.row + i, 
            args.fromRange.col + j
        )
        let formula = sourceCell.formula()
        let value = sourceCell.value()
        
        // 获取目标单元格
        let destinationCell = spread.getActiveSheet().getCell(
            args.cellRange.row + i, 
            args.cellRange.col + j
        )
    }
}
```

#### 按类型粘贴数据

根据源单元格是否包含公式，分别处理粘贴逻辑：

```javascript
if (formula) {
    // 如果有公式，粘贴公式
    destinationCell.formula(formula)
} else {
    // 否则只粘贴值
    destinationCell.value(value)
}
```

这种处理方式确保：
- 公式单元格保留计算逻辑
- 普通单元格只复制数据值
- 目标单元格的原有格式不受影响

### 3.2 技术栈

- SpreadJS 核心库：v17.0.8
- SpreadJS Designer：v17.0.8（提供完整的设计器界面）
- SystemJS：v0.19.22（模块加载器）
- 其他扩展模块：图表、打印、PDF、条形码、透视表等

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 使用本地服务器打开 index.html
# 推荐使用 Live Server 或其他 HTTP 服务器
```

### 4.2 操作步骤

1. 打开示例后，可以看到 A1:A3 单元格已预设数据：
   - A1：数值 1（背景色为红色）
   - A2：文本 '1'（背景色为红色）
   - A3：公式 `=sum(1)`（背景色为红色）

2. 选中 A1:A3 区域，按 Ctrl+C 复制

3. 选中其他单元格（如 B1），按 Ctrl+V 粘贴

4. 观察结果：
   - B1 粘贴了数值 1，但没有红色背景
   - B2 粘贴了文本 '1'，但没有红色背景
   - B3 粘贴了公式 `=sum(1)`，但没有红色背景

5. 打开浏览器控制台，可以看到 `ClipboardPasting` 事件的详细参数输出

## 五、功能特点

### 5.1 优点

- 精确控制粘贴行为，避免格式污染
- 保留公式的计算逻辑，确保数据准确性
- 代码简洁清晰，易于理解和扩展
- 适用于需要严格控制数据格式的企业应用场景

### 5.2 局限性与扩展建议

当前实现的局限性：
- 只处理了值和公式，未考虑其他属性（如数据验证、批注等）
- 未处理跨工作表粘贴的场景
- 未考虑粘贴区域超出工作表边界的情况

扩展建议：
- 可以添加配置选项，让用户选择是否保留特定格式（如字体、对齐方式）
- 可以扩展为"选择性粘贴"功能，提供多种粘贴模式
- 可以添加撤销/重做支持，提升用户体验
- 可以处理合并单元格的粘贴逻辑

## 六、关键代码片段

### 初始化 Designer 和测试数据

```javascript
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

// 设置测试数据
sheet.setValue(0, 0, 1)           // A1: 数值
sheet.setValue(1, 0, '1')         // A2: 文本
sheet.setFormula(2, 0, '=sum(1)') // A3: 公式
sheet.getRange(0, 0, 3, 1).backColor('red') // 设置红色背景
```

### 自定义粘贴逻辑完整实现

```javascript
spread.bind(GC.Spread.Sheets.Events.ClipboardPasting, (sender, args) => {
    console.log(args)
    args.cancel = true // 取消默认粘贴

    for (let i = 0; i < args.fromRange.rowCount; i++) {
        for (let j = 0; j < args.fromRange.colCount; j++) {
            let sourceCell = spread.getActiveSheet().getCell(
                args.fromRange.row + i, 
                args.fromRange.col + j
            )
            let formula = sourceCell.formula()
            let value = sourceCell.value()
            
            let destinationCell = spread.getActiveSheet().getCell(
                args.cellRange.row + i, 
                args.cellRange.col + j
            )
            
            if (formula) {
                destinationCell.formula(formula)
            } else {
                destinationCell.value(value)
            }
        }
    }
})
```

## 七、总结

本示例展示了如何通过监听 `ClipboardPasting` 事件来自定义 SpreadJS 的粘贴行为。开发者可以从中学到：

- SpreadJS 事件系统的使用方法
- 如何取消默认行为并实现自定义逻辑
- 单元格公式和值的获取与设置方法
- 区域遍历和单元格操作的基本技巧

该方案适用于需要精确控制数据粘贴行为的场景，如财务报表系统、数据分析平台等。通过扩展该逻辑，可以实现更复杂的选择性粘贴功能，满足不同的业务需求。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/jDFhksepF0S8EKmEW3RUSQ/)）
