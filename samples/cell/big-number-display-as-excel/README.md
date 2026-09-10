## 一、Demo 概述

本示例展示了如何解决 SpreadJS 在处理超过 JavaScript 安全整数范围的大数字时出现的精度丢失问题。在 Excel 中，大数字（如 1234567891234567）会显示为 "1234567891234560.00"，而 SpreadJS 默认显示为 "1234567891234570"。通过重写单元格编辑器的取值方法，本示例实现了与 Excel 一致的大数字显示行为。 

该方案适用于需要在 SpreadJS 中处理超长数字（如身份证号、订单号、银行账号等）的场景，确保数据显示的准确性和与 Excel 的兼容性。

## 二、解决的问题

* **JavaScript 精度限制**：JavaScript 的 Number 类型只能安全表示 -(2^53 - 1) 到 2^53 - 1 之间的整数，超出范围的数字会发生精度丢失
* **与 Excel 行为不一致**：SpreadJS 默认的数字处理方式与 Excel 存在差异，导致相同数字在两个平台显示不同
* **数据准确性要求**：在金融、电商等业务场景中，大数字的精确显示至关重要，任何精度丢失都可能导致严重后果

## 三、实现思路

### 3.1 核心技术点

#### 重写 Text 单元格类型的 getEditorValue 方法

通过扩展 SpreadJS 的 `CellTypes.Text` 原型方法，在用户输入数字后、存储到单元格之前进行精度处理：

```javascript
let oldGetEditorValue = GC.Spread.Sheets.CellTypes.Text.prototype.getEditorValue;
GC.Spread.Sheets.CellTypes.Text.prototype.getEditorValue = function () {
    let val = oldGetEditorValue.apply(this, arguments);
    console.log("oldVal:" + val);
    
    // 判断是否为数字，并进行精度处理
    if (val && !isNaN(val)) {
        let digits = Math.pow(10, 14 - Math.floor(Math.log10(parseFloat(val))));
        val = Math.floor((parseFloat(val) + Number.EPSILON) * digits) / digits + "";
        console.log("newVal:" + val);
    }
    return val;
}
```

**实现原理**：

1. 保存原始的 `getEditorValue` 方法引用
2. 重写该方法，先调用原方法获取编辑器的原始值
3. 检查值是否为数字类型（使用 `isNaN` 判断）
4. 对数字进行精度截断处理：
    * 计算保留 14 位有效数字所需的缩放因子
    * 使用 `Number.EPSILON` 处理浮点数误差
    * 通过 `Math.floor` 截断多余精度
    * 转换回字符串返回

#### 精度计算公式

```javascript
let digits = Math.pow(10, 14 - Math.floor(Math.log10(parseFloat(val))));
val = Math.floor((parseFloat(val) + Number.EPSILON) * digits) / digits + "";
```

* `Math.log10(parseFloat(val))`：计算数字的位数（对数）
* `14 - Math.floor(...)`：确定需要保留的小数位数（总共保留 14 位有效数字）
* `Number.EPSILON`：JavaScript 最小精度值，用于修正浮点数运算误差
* `Math.floor`：向下取整，截断多余精度

### 3.2 技术栈

* **SpreadJS 16.0.1**：核心表格组件
* **SystemJS 0.19.22**：模块加载器
* **TypeScript 4.1.2**：开发语言（编译为 ES5）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 使用本地服务器打开 index.html
# 例如：使用 Live Server 或其他 HTTP 服务器
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html`
2. 在任意单元格中输入大数字，例如：`1234567891234567`
3. 按 Enter 键确认输入
4. 观察控制台输出的 `oldVal` 和 `newVal`，验证精度处理效果
5. 查看单元格显示值，应与 Excel 中的显示一致（"1234567891234560.00"）

## 五、功能特点

### 5.1 优点

* **与 Excel 行为一致**：确保大数字在 SpreadJS 和 Excel 中显示相同，提升兼容性
* **非侵入式实现**：通过原型扩展实现，不影响 SpreadJS 的其他功能
* **自动处理**：用户无需手动干预，输入大数字时自动进行精度处理
* **调试友好**：通过控制台输出处理前后的值，便于验证和调试

### 5.2 局限性与扩展建议

* **仅处理 Text 类型**：当前方案只重写了 `CellTypes.Text` 的方法，如果需要处理其他单元格类型，需要扩展相应的原型方法
* **固定精度规则**：当前保留 14 位有效数字，如果业务需要不同的精度规则，需要修改计算公式
* **扩展建议**：
    * 可以将精度位数作为配置参数，支持动态调整
    * 可以根据单元格格式（如货币、百分比）应用不同的精度策略
    * 对于需要完全保留原始字符串的场景（如身份证号），可以考虑使用字符串格式而非数字格式

## 六、关键代码片段

### 原型方法重写

```javascript
// 保存原始方法
let oldGetEditorValue = GC.Spread.Sheets.CellTypes.Text.prototype.getEditorValue;

// 重写方法
GC.Spread.Sheets.CellTypes.Text.prototype.getEditorValue = function () {
    let val = oldGetEditorValue.apply(this, arguments);
    
    // 对数字类型进行精度处理
    if (val && !isNaN(val)) {
        let digits = Math.pow(10, 14 - Math.floor(Math.log10(parseFloat(val))));
        val = Math.floor((parseFloat(val) + Number.EPSILON) * digits) / digits + "";
    }
    return val;
}
```

### SpreadJS 初始化

```javascript
import * as GC from "@grapecity/spread-sheets";

let spread = new GC.Spread.Sheets.Workbook("ss");
let sheet = spread.getActiveSheet();
```

## 七、总结

本示例提供了一个简洁有效的方案来解决 SpreadJS 中大数字精度丢失的问题。通过重写单元格编辑器的取值方法，开发者可以：

* 理解 JavaScript 数字精度限制的本质和解决思路
* 掌握 SpreadJS 原型扩展的方法
* 学习如何通过数学运算实现精度控制
* 确保应用与 Excel 的行为一致性

该方案适用于需要处理超长数字的各类业务场景，特别是金融、电商、政务等对数据准确性要求较高的领域。开发者可以根据实际需求调整精度规则，或扩展到其他单元格类型。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
