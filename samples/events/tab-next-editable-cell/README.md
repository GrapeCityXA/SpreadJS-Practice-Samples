## 一、Demo 概述

本示例展示了如何在 SpreadJS 中自定义 Tab 键的行为，实现在受保护的工作表中按 Tab 键时自动跳转到下一个可编辑（未锁定）单元格的功能。在默认情况下，Tab 键会按顺序跳转到相邻单元格，但在工作表保护模式下，这种行为可能不符合实际需求。通过自定义命令和快捷键绑定，可以让用户在填写表单时更高效地在可编辑区域之间切换。

## 二、解决的问题

在实际业务场景中，经常需要创建带有固定格式的表单或模板，其中只有特定单元格允许用户编辑。例如：

* 数据录入表单：只允许用户填写特定的输入字段，其他说明文字和标题不可修改
* 财务报表模板：只开放数据输入单元格，公式和格式单元格需要保护
* 问卷调查表：只允许填写答案区域，问题描述区域锁定

在这些场景下，用户希望按 Tab 键时能够智能跳过锁定的单元格，直接跳转到下一个可编辑单元格，而不是按照默认的顺序逐个遍历所有单元格。

## 三、实现思路

### 3.1 设置工作表保护和可编辑单元格

首先需要设置工作表的保护状态，并标记哪些单元格是可编辑的：

```javascript
// 创建未锁定样式（绿色背景标识可编辑单元格）
var unLockedStyle = new GC.Spread.Sheets.Style();
unLockedStyle.backColor = "lightgreen";

// 设置特定单元格为可编辑状态
activeSheet.setStyle(0, 0, unLockedStyle);
activeSheet.getCell(0, 0).locked(false);
activeSheet.setStyle(3, 3, unLockedStyle);
activeSheet.getCell(3, 3).locked(false);
// ... 其他可编辑单元格

// 启用工作表保护
activeSheet.options.isProtected = true;
```

这里使用 `locked(false)` 方法将单元格设置为未锁定状态，同时使用浅绿色背景作为视觉提示。

### 3.2 注册自定义 Tab 命令

核心实现是通过 `commandManager` 注册一个自定义命令，实现智能跳转逻辑：

```javascript
spread.commandManager().register('mytab', function(spread) {
    spread.suspendEvent();
    var startRow, startCol, row, col, searchStartRow, searchStartCol;
    var isLocked;
    var activeSheet = spread.getActiveSheet();
    startRow = activeSheet.getActiveRowIndex();
    startCol = activeSheet.getActiveColumnIndex();
    
    var rowCount = activeSheet.getRowCount();
    var colCount = activeSheet.getColumnCount();
    
    // 第一阶段：从当前位置向后搜索
    searchStartRow = startRow;
    for (row = startRow; row < rowCount; row++) {
        searchStartCol = row === startRow ? startCol + 1 : 0;
        
        if (searchStartCol == colCount) {
            row++;
            searchStartCol = 0;
        }
        
        for (col = searchStartCol; col < colCount; col++) {
            isLocked = activeSheet.getCell(row, col).locked();
            if (!isLocked) {
                if (!activeSheet.endEdit()) {
                    return
                }
                activeSheet.setActiveCell(row, col);
                return;
            }
        }
    }
    
    // 第二阶段：从头开始搜索到当前位置
    for (row = 0; row < rowCount; row++) {
        for (col = 0; col < colCount; col++) {
            if (row === startRow && col === startCol) {
                return
            }
            
            isLocked = activeSheet.getCell(row, col).locked();
            if (!isLocked) {
                if (!activeSheet.endEdit()) {
                    return
                }
                activeSheet.setActiveCell(row, col);
                return;
            }
        }
    }
    spread.resumeEvent();
});
```

搜索逻辑分为两个阶段：

1. 从当前单元格的下一个位置开始向后搜索，直到工作表末尾
2. 如果没有找到，则从工作表开头搜索到当前位置（循环跳转）

### 3.3 绑定快捷键

最后需要解除默认 Tab 键绑定，并将自定义命令绑定到 Tab 键：

```javascript
// 清除默认 Tab 键绑定
spread.commandManager().setShortcutKey(null, GC.Spread.Commands.Key.tab, false, false, false, false);

// 绑定自定义命令到 Tab 键
spread.commandManager().setShortcutKey('mytab', GC.Spread.Commands.Key.tab, false, false, false, false);
```

### 3.4 技术栈

* SpreadJS 15.0.0：核心表格控件
* TypeScript 4.1.2：开发语言
* SystemJS 0.19.22：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，可以看到工作表中有多个浅绿色背景的单元格（可编辑区域）
2. 点击任意一个绿色单元格，使其成为活动单元格
3. 按下 Tab 键，焦点会自动跳转到下一个绿色单元格
4. 继续按 Tab 键，会按照从左到右、从上到下的顺序循环跳转所有可编辑单元格
5. 尝试点击非绿色单元格，会发现无法编辑（受保护状态）

## 五、功能特点

### 5.1 优点

* 提升用户体验：用户无需手动点击或使用方向键寻找可编辑单元格
* 循环跳转：到达最后一个可编辑单元格后会自动回到第一个，适合连续录入场景
* 视觉提示：使用颜色标识可编辑区域，用户一目了然
* 灵活扩展：可以根据业务需求调整搜索逻辑和跳转规则

### 5.2 局限性与扩展建议

当前实现的局限性：

* 只支持 Tab 键向前跳转，不支持 Shift+Tab 反向跳转
* 搜索算法是线性遍历，在大型工作表中可能存在性能问题

扩展建议：

* 添加 Shift+Tab 反向跳转功能
* 对可编辑单元格位置进行预缓存，避免每次按键都遍历整个工作表
* 支持跨工作表跳转
* 支持按区域分组跳转（例如只在当前表单区域内跳转）

## 六、关键代码片段

### 6.1 单元格锁定状态检查

```javascript
isLocked = activeSheet.getCell(row, col).locked();
if (!isLocked) {
    if (!activeSheet.endEdit()) {
        return
    }
    activeSheet.setActiveCell(row, col);
    return;
}
```

通过 `locked()` 方法获取单元格的锁定状态，找到未锁定单元格后调用 `endEdit()` 结束当前编辑，然后使用 `setActiveCell()` 激活目标单元格。

### 6.2 事件挂起与恢复

```javascript
spread.suspendEvent();
// ... 执行跳转逻辑
spread.resumeEvent();
```

在执行跳转逻辑期间挂起事件触发，避免中间状态触发不必要的事件，提升性能。

## 七、总结

本示例展示了 SpreadJS 命令系统的强大扩展能力，通过自定义命令和快捷键绑定，可以轻松实现符合业务需求的交互行为。开发者可以从中学到：

* 如何使用 `commandManager` 注册自定义命令
* 如何重新绑定快捷键
* 如何实现单元格锁定状态的检查和跳转逻辑
* 如何在保护模式下创建可编辑的表单区域

该方案适用于各种需要表单保护和定制化导航的场景，具有良好的扩展性，可以根据实际需求调整搜索策略和跳转规则。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
