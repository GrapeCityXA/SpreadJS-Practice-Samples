## 一、Demo 概述

本示例演示了如何在 SpreadJS 中控制中英文文本的换行规则。通过切换不同的文化区域设置（Culture），可以实现中文和英文采用不同或相同的换行规则。该功能主要用于处理包含中文标点符号的文本在单元格中自动换行时的显示效果，特别是解决中文左括号"（"不能出现在行尾的排版规则问题。

## 二、解决的问题

在文本排版中，中文和英文有不同的换行规则。中文排版规则要求某些标点符号（如左括号"（"、左引号"""等）不能出现在行尾，而英文则没有这样的限制。本示例解决了以下问题：

- 在 SpreadJS 单元格中实现符合中文排版规范的自动换行
- 提供灵活的文化区域切换机制，支持中英文换行规则的动态切换
- 允许在英文文化区域下选择性地应用中文换行规则

## 三、实现思路

### 3.1 核心技术点

#### 文化区域管理（CultureManager）

SpreadJS 通过 `GC.Spread.Common.CultureManager` 提供文化区域管理功能。通过获取和修改 `TextFormat` 配置，可以控制文本的换行规则：

```javascript
// 获取中文文化区域的 TextFormat 配置
let zhTextFormat = JSON.parse(JSON.stringify(
    GC.Spread.Common.CultureManager.getCultureInfo("zh-cn").TextFormat
));

// 获取英文文化区域的 TextFormat 配置
let enTextFormat = JSON.parse(JSON.stringify(
    GC.Spread.Common.CultureManager.getCultureInfo("en-us").TextFormat
));
```

这里使用 `JSON.parse(JSON.stringify())` 进行深拷贝，避免直接修改原始配置对象。

#### 动态切换文化区域

通过 `culture()` 方法切换当前文化区域，并根据需要修改 `TextFormat` 配置：

```javascript
// 切换为中文文化区域
GC.Spread.Common.CultureManager.culture("zh-cn");
let currentCultureInfo = GC.Spread.Common.CultureManager.getCultureInfo();
currentCultureInfo.TextFormat = { ...zhTextFormat };
spread.refresh();
```

修改 `TextFormat` 后需要调用 `spread.refresh()` 刷新表格显示。

#### 单元格自动换行设置

为了观察换行效果，需要启用单元格的自动换行功能：

```javascript
sheet.setValue(1, 1, "中文左括号（不能在结尾");
sheet.getCell(1, 1).wordWrap(true);  // 启用自动换行
sheet.setRowHeight(1, 100);          // 设置行高
sheet.setColumnWidth(1, 100);        // 设置列宽
```

#### 防抖处理

由于文化区域切换和刷新需要一定时间，示例中实现了简单的防抖机制：

```javascript
function disableBtn() {
    btn1.disabled = true;
    btn2.disabled = true;
    setTimeout(function() {
        btn1.disabled = false;
        btn2.disabled = false;
    }, 2000);
}
```

### 3.2 UI 交互流程

用户操作 → 点击"切换为中文换行"按钮 → 应用中文 TextFormat → 刷新表格 → 观察换行效果

用户操作 → 点击"切换为英文换行"按钮 → 根据下拉框选择应用对应 TextFormat → 刷新表格 → 观察换行效果

### 3.3 技术栈

- @grapecity/spread-sheets: 17.0.8（核心表格组件）
- systemjs: ^0.19.22（模块加载器）
- systemjs-plugin-babel: 0.0.25（ES6 转译支持）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 使用本地服务器打开 index.html
# 例如使用 http-server 或 live-server
npx http-server
```

### 4.2 操作步骤

1. 打开页面后，可以看到单元格 B2 中显示文本"中文左括号（不能在结尾"
2. 观察文本的换行位置，注意左括号"（"的位置
3. 点击"切换为中文换行"按钮，观察文本按照中文排版规则换行（左括号不会出现在行尾）
4. 在下拉框中选择"否"，然后点击"切换为英文换行"按钮，观察文本按照英文规则换行
5. 在下拉框中选择"是"，然后点击"切换为英文换行"按钮，观察即使在英文文化区域下也应用中文换行规则
6. 注意：每次点击按钮后需要等待约 2 秒才能进行下一次操作

## 五、功能特点

### 5.1 优点

- 灵活的文化区域切换机制，支持中英文换行规则的独立控制
- 通过深拷贝 TextFormat 配置，避免污染原始配置
- 提供可视化的对比效果，便于理解不同换行规则的差异
- 实现了防抖机制，避免频繁操作导致的异常

### 5.2 局限性与扩展建议

- 当前示例仅展示了单个单元格的换行效果，实际应用中可能需要批量设置
- 防抖时间固定为 2 秒，可以根据实际性能优化这个时间
- 可以扩展支持更多文化区域的换行规则（如日文、韩文等）
- 可以添加更多测试文本，展示不同标点符号的换行规则

## 六、关键代码片段

### 文化区域配置的深拷贝

```javascript
let zhTextFormat = JSON.parse(JSON.stringify(
    GC.Spread.Common.CultureManager.getCultureInfo("zh-cn").TextFormat
));
let enTextFormat = JSON.parse(JSON.stringify(
    GC.Spread.Common.CultureManager.getCultureInfo("en-us").TextFormat
));
```

这段代码通过 JSON 序列化和反序列化实现深拷贝，确保后续修改不会影响原始配置。

### 条件应用 TextFormat

```javascript
document.querySelector("#button2").addEventListener("click", function () {
    disableBtn();
    GC.Spread.Common.CultureManager.culture("en-us");
    let se = document.getElementById("select");
    let currentCultureInfo = GC.Spread.Common.CultureManager.getCultureInfo();
    if (se.value == "是") {
        currentCultureInfo.TextFormat = { ...zhTextFormat };
    } else {
        currentCultureInfo.TextFormat = { ...enTextFormat };
    }
    spread.refresh();
});
```

这段代码实现了在英文文化区域下根据用户选择应用不同的 TextFormat 配置，展示了文化区域和换行规则的解耦。

## 七、总结

本示例展示了 SpreadJS 中文化区域管理和文本换行规则控制的核心功能。开发者可以从中学到：

- 如何使用 CultureManager 管理文化区域设置
- 如何获取和修改 TextFormat 配置
- 如何实现中英文换行规则的动态切换
- 如何处理配置对象的深拷贝问题

该方案适用于需要支持多语言排版规则的表格应用，特别是在处理中文文档时需要遵循中文排版规范的场景。通过灵活配置 TextFormat，可以满足不同语言和地区的排版需求。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/N8fyAnSWsEK4h3DqgeYtIg/)）
