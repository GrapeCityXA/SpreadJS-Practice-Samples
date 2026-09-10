## 一、Demo 概述

本示例演示了如何通过重写 SpreadJS 的 `toJSON` 方法，在序列化工作簿数据时携带用户自定义属性。通过扩展 `Style` 对象的 `toJSON` 方法，开发者可以将自定义的业务数据（如标记、元数据等）一并保存到 JSON 文件中，实现更灵活的数据持久化方案。

该示例展示了在单元格样式对象上添加自定义属性 `AAA`，并通过原型链方法重写确保该属性在调用 `spread.toJSON()` 时被正确序列化输出。

## 二、解决的问题

在实际业务场景中，开发者经常需要在 SpreadJS 的标准数据结构之外存储额外的业务信息，例如：

* 为特定单元格或样式添加业务标识（如审批状态、数据来源标记）
* 在导出/导入工作簿时保留自定义元数据
* 实现跨系统的数据交换时携带扩展字段

SpreadJS 默认的 `toJSON` 方法只会序列化标准属性，自定义属性会被忽略。本示例通过重写原型方法解决了这一限制，使得自定义数据能够完整地参与序列化和反序列化流程。

## 三、实现思路

### 3.1 核心技术点

#### 扩展样式对象并添加自定义属性

首先创建一个 `Style` 对象并为其添加自定义属性 `AAA`，同时设置标准样式属性：

```javascript
var mystyle = new GC.Spread.Sheets.Style();
mystyle.AAA = 1;  // 自定义属性
mystyle.backColor = "green";  // 标准样式属性
sheet.setStyle(0, 0, mystyle);
```

这里的 `AAA` 属性是完全自定义的，不属于 SpreadJS 的标准 API，但可以通过 JavaScript 的动态特性直接添加到对象上。

#### 保存原始 toJSON 方法引用

在重写之前，需要保存原始方法的引用，以便在新方法中调用原有逻辑：

```javascript
var oldToJson = GC.Spread.Sheets.Style.prototype.toJSON;
```

这是一种常见的装饰器模式，确保不会丢失原有功能。

#### 重写 toJSON 方法实现自定义序列化

通过原型链重写 `toJSON` 方法，在保留原有序列化逻辑的基础上添加自定义属性：

```javascript
GC.Spread.Sheets.Style.prototype.toJSON = function() {
    // 调用原始方法获取标准 JSON 对象
    var json = oldToJson.apply(this, arguments);
    // 添加自定义属性到 JSON 对象
    json.AAA = this.AAA;
    // 可选：将序列化结果显示在单元格中用于调试
    sheet.setValue(1, 1, JSON.stringify(json));
    return json;
}
```

关键点：

* 使用 `apply` 方法确保 `this` 上下文正确传递
* 在原始 JSON 对象基础上添加自定义属性
* 返回扩展后的 JSON 对象

#### 触发序列化并验证结果

调用 `spread.toJSON()` 触发完整的工作簿序列化，自定义属性会被包含在输出中：

```javascript
let fullJson = JSON.stringify(spread.toJSON());
sheet.setValue(3, 3, fullJson);
```

序列化后的 JSON 字符串会显示在单元格 (3,3) 中，方便开发者验证自定义属性是否成功携带。

### 3.2 技术栈

* SpreadJS 15.0.0 - 核心表格控件
* SystemJS 0.19.22 - 模块加载器
* TypeScript 4.1.2 - 类型支持（可选）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
# 或使用本地服务器（推荐）
npx http-server -p 8080
```

### 4.2 操作步骤

1. 打开页面后，会自动执行代码初始化
2. 观察单元格 (0,0) 的背景色为绿色（标准样式属性生效）
3. 查看单元格 (1,1) 显示的样式对象 JSON，确认包含 `AAA` 属性
4. 查看单元格 (3,3) 显示的完整工作簿 JSON，在样式定义部分可以找到自定义属性

## 五、功能特点

### 5.1 优点

* 无侵入性扩展：通过原型链重写实现，不修改 SpreadJS 源码
* 向后兼容：保留原有 `toJSON` 方法的所有功能
* 灵活性高：可以为任意 SpreadJS 对象添加自定义序列化逻辑
* 易于维护：代码结构清晰，扩展点明确

### 5.2 局限性与扩展建议

当前实现的局限性：

* 只重写了 `Style` 对象的 `toJSON` 方法，如需为其他对象（如 `Cell`、`Sheet`）添加自定义属性，需要分别重写
* 没有实现对应的 `fromJSON` 方法，导入 JSON 时自定义属性不会自动恢复到对象上

扩展建议：

* 配套实现 `fromJSON` 方法，确保序列化和反序列化的完整性
* 建立统一的自定义属性命名规范（如使用 `custom_` 前缀），避免与未来 SpreadJS 版本的新增属性冲突
* 考虑使用 TypeScript 接口扩展来获得类型提示支持

## 六、关键代码片段

完整的方法重写实现：

```javascript
// 保存原始方法引用
var oldToJson = GC.Spread.Sheets.Style.prototype.toJSON;

// 重写 toJSON 方法
GC.Spread.Sheets.Style.prototype.toJSON = function() {
    // 调用原始方法，保留标准序列化逻辑
    var json = oldToJson.apply(this, arguments);
    
    // 添加自定义属性
    json.AAA = this.AAA;
    
    // 调试输出（可选）
    sheet.setValue(1, 1, JSON.stringify(json));
    
    return json;
}
```

## 七、总结

本示例展示了 SpreadJS 高度可扩展的架构设计，通过原型链方法重写，开发者可以在不修改源码的前提下实现深度定制。这种技术在以下场景中特别有价值：

* 需要在标准数据结构中嵌入业务元数据
* 实现自定义的数据持久化方案
* 与后端系统进行复杂数据交换时携带额外信息

开发者可以从中学到：

* JavaScript 原型链的实际应用
* 装饰器模式在方法扩展中的使用
* SpreadJS 序列化机制的工作原理
* 如何在不破坏原有功能的前提下扩展第三方库

该方案适用于需要在 SpreadJS 标准数据模型之外存储额外信息的所有场景，具有良好的扩展性和可维护性。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
