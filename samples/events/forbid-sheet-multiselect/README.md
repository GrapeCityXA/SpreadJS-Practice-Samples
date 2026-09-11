## 一、Demo 概述

本示例演示了如何在 SpreadJS 中禁止用户同时选中多个工作表（Sheet）。在默认情况下，用户可以按住 Ctrl 键点击多个 Sheet 标签页来实现多选，但在某些业务场景下需要限制这一行为，确保用户每次只能操作单个工作表。该示例通过监听 SheetChanging 事件并取消多选操作来实现此功能。

## 二、解决的问题

在实际应用中，多 Sheet 选择可能会带来以下问题：

- **数据安全性**：防止用户批量操作多个工作表，避免误操作导致数据错误
- **权限控制**：在需要精细化权限管理的场景下，限制用户只能操作当前激活的工作表
- **业务逻辑简化**：某些业务流程要求用户专注于单个工作表的编辑，避免跨表操作的复杂性

## 三、实现思路

### 3.1 核心技术点

#### 监听 SheetChanging 事件并拦截多选操作

通过监听 `SheetChanging` 事件，在用户尝试选中新的 Sheet 时进行判断。如果当前已有 Sheet 处于选中状态，则取消本次选择操作，从而阻止多选行为。

```javascript
spread.bind(GC.Spread.Sheets.Events.SheetChanging, function(s, e){
    console.log(s, e);
    if(e.newValue && e.propertyName === "isSelected"){
        if(spread.getSheet(spread.getActiveSheetIndex()).isSelected()){
            e.cancel = true;
        }
    }
});
```

**实现原理**：
- `SheetChanging` 事件在工作表属性即将改变时触发
- `e.propertyName === "isSelected"` 判断是否为选中状态的变化
- `e.newValue` 为 true 表示用户正在尝试选中新的 Sheet
- `spread.getActiveSheetIndex()` 获取当前激活的工作表索引
- `isSelected()` 检查该工作表是否已被选中
- `e.cancel = true` 取消本次操作，阻止多选

### 3.2 技术栈

- **SpreadJS**: 15.0.0（核心表格组件库）
- **SystemJS**: 0.19.22（模块加载器）
- **TypeScript**: 4.1.2（支持 TypeScript 开发）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html`
2. 页面会显示一个包含 5 个工作表的 SpreadJS 实例
3. 按住 Ctrl 键，尝试点击多个 Sheet 标签页
4. 观察结果：只有第一个点击的 Sheet 会被选中，后续的多选操作会被阻止
5. 打开浏览器控制台，可以看到事件触发的日志信息

## 五、功能特点

### 5.1 优点

- **实现简单**：仅需几行代码即可实现功能，无需复杂的状态管理
- **性能高效**：事件拦截机制不影响正常的单 Sheet 切换操作
- **用户体验友好**：阻止操作是静默的，不会弹出错误提示，避免干扰用户

### 5.2 扩展建议

- 可以添加提示信息，告知用户为何无法多选工作表
- 可以结合权限系统，针对不同用户角色设置不同的多选策略
- 可以扩展为允许特定条件下的多选（如仅允许相邻 Sheet 多选）

## 六、关键代码片段

### 事件绑定与拦截逻辑

```javascript
// 创建包含 5 个工作表的 Workbook 实例
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {sheetCount: 5});

// 绑定 SheetChanging 事件
spread.bind(GC.Spread.Sheets.Events.SheetChanging, function(s, e){
    console.log(s, e); // 输出事件对象，便于调试
    
    // 判断是否为选中状态的变化
    if(e.newValue && e.propertyName === "isSelected"){
        // 检查当前激活的工作表是否已被选中
        if(spread.getSheet(spread.getActiveSheetIndex()).isSelected()){
            e.cancel = true; // 取消本次选择操作
        }
    }
});
```

## 七、总结

本示例展示了如何通过 SpreadJS 的事件机制实现禁止工作表多选的功能。开发者可以从中学到：

- SpreadJS 的 `SheetChanging` 事件的使用方法
- 如何通过 `e.cancel` 取消事件的默认行为
- 工作表选中状态的判断和控制技巧

该方案适用于需要严格控制用户操作范围的场景，如数据录入系统、报表审批流程等。通过简单的事件拦截，即可有效防止用户误操作，提升系统的安全性和可控性。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
