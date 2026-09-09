## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现基于用户等级的单元格编辑权限控制。通过将权限信息存储在单元格的 tag 属性中，并结合工作表保护功能，实现了不同用户等级对特定单元格区域的差异化访问控制。示例中定义了一级用户和二级用户两种角色，并通过下拉菜单切换用户身份，受限区域会以蓝色背景高亮显示。

该方案适用于多用户协作场景，例如财务报表中需要限制普通员工只能编辑特定区域，而管理层可以编辑更多区域的需求。

## 二、解决的问题

在实际业务场景中，经常需要对电子表格的编辑权限进行精细化控制：

- **多角色权限管理**：不同用户等级需要对同一工作表的不同区域拥有不同的编辑权限
- **可视化权限提示**：用户需要直观地看到哪些区域是受限的，避免误操作
- **灵活的权限配置**：权限信息需要与单元格数据一起保存，便于持久化和传输

## 三、实现思路

### 3.1 使用 tag 属性存储权限信息

SpreadJS 的单元格 tag 属性可以存储任意自定义数据。本示例利用 tag 存储 JSON 格式的权限配置，标记哪些用户等级不能编辑该单元格：

```javascript
// 在 JSON 数据中为单元格设置 tag
"tag": "{\"primaryUser\":true,\"secondaryUser\":true}"  // 一级和二级用户都不能编辑
"tag": "{\"secondaryUser\":true}"  // 仅二级用户不能编辑
```

这种方式的优势在于权限信息与单元格数据绑定，可以通过 `fromJSON/toJSON` 方法实现持久化。

### 3.2 工作表保护机制

通过设置工作表保护并配合单元格的 `locked` 属性，实现权限控制：

```javascript
// 设置默认样式为不锁定（允许编辑）
let defaultStyle = sheet.getDefaultStyle();
defaultStyle.locked = false;
sheet.setDefaultStyle(defaultStyle);

// 开启工作表保护
sheet.options.isProtected = true;
```

当工作表保护开启后，只有 `locked` 为 `false` 的单元格才能编辑。

### 3.3 动态权限应用

根据当前用户等级，遍历所有单元格的 tag 信息，动态设置单元格的锁定状态和背景色：

```javascript
function adjustAuthor(currentUser) {
    sheet.suspendPaint();  // 暂停绘制提升性能
    
    // 清空所有样式
    sheet.clear(0, 0, sheet.getRowCount(), sheet.getColumnCount(), 
                GC.Spread.Sheets.SheetArea.viewport, 
                GC.Spread.Sheets.StorageType.style);
    
    // 遍历所有单元格
    for (let i = 0; i < sheet.getRowCount(); i++) {
        for (let j = 0; j < sheet.getColumnCount(); j++) {
            if (sheet.getTag(i, j)) {
                let info = JSON.parse(sheet.getTag(i, j));
                // 如果当前用户在限制列表中，设置为不可编辑
                if (info[currentUser]) {
                    let range = sheet.getRange(i, j, 1, 1);
                    range.backColor('#9cf');  // 蓝色背景标识
                    range.locked(true);       // 锁定单元格
                }
            }
        }
    }
    
    sheet.resumePaint();  // 恢复绘制
}
```

### 3.4 用户切换交互

通过监听下拉菜单的 `onchange` 事件，实现用户身份切换：

```javascript
document.getElementById('user').onchange = function(e) {
    adjustAuthor(e.target.value);
}
```

### 3.5 技术栈

- **@grapecity/spread-sheets**: 15.0.0（核心表格组件）
- **TypeScript**: ^4.1.2（类型支持）
- **SystemJS**: ^0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，默认以"二级用户"身份登录
2. 观察表格中的蓝色区域（D3:F5 和 J3:L5），这些区域对当前用户不可编辑
3. 尝试点击蓝色区域，会发现无法输入内容
4. 切换下拉菜单为"一级用户"
5. 观察 J3:L5 区域变为可编辑（蓝色消失），而 D3:F5 区域仍然受限

## 五、功能特点

### 5.1 优点

- **灵活的权限配置**：通过 tag 属性可以为每个单元格单独配置权限，支持多级用户体系
- **可视化反馈**：受限区域通过背景色高亮，用户体验友好
- **数据持久化**：权限信息随工作簿数据一起保存，无需额外存储
- **性能优化**：使用 `suspendPaint/resumePaint` 避免频繁重绘

### 5.2 局限性与扩展建议

- **大数据量性能**：当前实现需要遍历所有单元格，对于超大表格可能存在性能瓶颈，建议改为仅遍历有 tag 的单元格
- **权限验证**：当前仅在前端控制，实际应用中应结合后端验证，防止绕过前端限制
- **扩展方向**：可以增加更多用户等级、支持单元格级别的读写分离、集成真实的用户认证系统

## 六、关键代码片段

### 权限信息的 JSON 结构

```javascript
// 示例 1：一级和二级用户都不能编辑
{
  "primaryUser": true,
  "secondaryUser": true
}

// 示例 2：仅二级用户不能编辑
{
  "secondaryUser": true
}
```

### 清空样式的正确方式

```javascript
// 使用 clear 方法清空指定区域的样式
sheet.clear(
    0, 0,                                    // 起始行列
    sheet.getRowCount(), sheet.getColumnCount(),  // 行列数
    GC.Spread.Sheets.SheetArea.viewport,     // 视口区域
    GC.Spread.Sheets.StorageType.style       // 仅清空样式
);
```

## 七、总结

本示例展示了 SpreadJS 中实现细粒度权限控制的完整方案，核心价值在于：

- 掌握 tag 属性的高级应用，实现自定义元数据存储
- 理解工作表保护与单元格锁定的配合机制
- 学习如何通过样式反馈提升用户体验
- 了解性能优化技巧（suspendPaint/resumePaint）

该方案适用于需要多角色协作的表格应用，如预算管理系统、审批流程表单等场景。开发者可以在此基础上扩展更复杂的权限模型，例如结合后端 API 实现动态权限加载、支持行列级别的权限控制等。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/RqVkiyHFSkuKrA12B8dtLA/)）
