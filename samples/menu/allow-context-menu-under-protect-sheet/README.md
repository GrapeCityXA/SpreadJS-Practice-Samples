## 一、Demo 概述

本示例演示了如何在 SpreadJS 工作表处于保护状态时，通过自定义右键菜单实现特定菜单项的启用。在默认情况下，当工作表被保护后，右键菜单中的大部分操作（如隐藏行、取消隐藏行等）会被自动禁用。本示例通过继承 `ContextMenu` 类并重写 `onOpenMenu` 方法，实现了在保护状态下仍然可以使用"隐藏行"和"取消隐藏行"功能。

## 二、解决的问题

在实际业务场景中，工作表保护是一个常见需求，用于防止用户误操作或恶意修改数据。但有时我们需要在保护状态下保留某些特定功能的可用性，例如：

* 允许用户在保护状态下隐藏或显示某些行，以便更好地查看数据
* 在数据审核场景中，允许审核人员调整视图但不能修改数据
* 在报表展示场景中，允许用户自定义显示内容但保护底层数据结构

默认的工作表保护机制会禁用所有可能影响工作表结构的操作，但这种"一刀切"的方式在某些场景下过于严格。本示例提供了一种灵活的解决方案，允许开发者精确控制哪些右键菜单项在保护状态下仍然可用。

## 三、实现思路

### 3.1 继承 ContextMenu 类

通过 JavaScript 原型链继承 SpreadJS 的 `ContextMenu` 类，创建自定义右键菜单类：

```javascript
function ContextMenu() {}
ContextMenu.prototype = new GC.Spread.Sheets.ContextMenu.ContextMenu(spread);
```

这种继承方式允许我们保留原有右键菜单的所有功能，同时可以重写特定方法来实现自定义逻辑。

### 3.2 重写 onOpenMenu 方法

`onOpenMenu` 方法在右键菜单弹出前触发，可以用来修改菜单项的属性：

```javascript
ContextMenu.prototype.onOpenMenu = function(menuData, itemsDataForShown, hitInfo, spread) {
    for (let i = 0; i < itemsDataForShown.length; i++) {
        var item = itemsDataForShown[i];
        if (item.name === "gc.spread.hideRows") {
            item.text = "隐藏（改写）"
            item.disable = false;
        } else if (item.name === "gc.spread.unhideRows") {
            item.text = "取消隐藏（改写）"
            item.disable = false;
        }
    }
};
```

关键参数说明：

* `menuData`：右键菜单的完整数据
* `itemsDataForShown`：即将显示的菜单项数组
* `hitInfo`：鼠标点击位置的信息
* `spread`：Workbook 实例

通过遍历 `itemsDataForShown` 数组，找到目标菜单项（通过 `item.name` 识别），然后修改其 `disable` 属性为 `false`，即可在保护状态下启用该菜单项。

### 3.3 应用自定义右键菜单

将自定义的右键菜单实例赋值给 Workbook 的 `contextMenu` 属性：

```javascript
spread.contextMenu = new ContextMenu();
```

### 3.4 设置工作表保护

通过 `options.isProtected` 属性启用工作表保护：

```javascript
sheet.options.isProtected = true;
```

### 3.5 技术栈

* SpreadJS：15.0.0
* TypeScript：^4.1.2
* SystemJS：^0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开示例页面，可以看到一个受保护的工作表
2. 在第 4 行第 1 列（显示提示文字的单元格）附近点击右键
3. 在弹出的右键菜单中，可以看到"隐藏（改写）"和"取消隐藏（改写）"选项是可用的（非灰色）
4. 点击"隐藏（改写）"可以隐藏当前行
5. 在隐藏行的上方或下方右键，点击"取消隐藏（改写）"可以恢复显示

## 五、功能特点

### 5.1 优点

* 灵活性高：可以精确控制哪些菜单项在保护状态下可用
* 实现简单：只需继承 ContextMenu 类并重写一个方法
* 不影响其他功能：保留了原有右键菜单的所有其他功能
* 可扩展性强：可以根据业务需求自定义更多菜单项的行为

### 5.2 局限性与扩展建议

当前实现仅针对"隐藏行"和"取消隐藏行"两个菜单项进行了自定义。如果需要启用更多菜单项，可以在 `onOpenMenu` 方法中添加更多的条件判断。

扩展建议：

* 可以根据用户权限动态控制菜单项的可用性
* 可以添加自定义菜单项，实现更复杂的业务逻辑
* 可以结合 `hitInfo` 参数，根据点击位置的不同显示不同的菜单项

## 六、关键代码片段

### 自定义右键菜单的完整实现

```javascript
// 1. 定义自定义右键菜单类
function ContextMenu() {}
ContextMenu.prototype = new GC.Spread.Sheets.ContextMenu.ContextMenu(spread);

// 2. 重写 onOpenMenu 方法
ContextMenu.prototype.onOpenMenu = function(menuData, itemsDataForShown, hitInfo, spread) {
    for (let i = 0; i < itemsDataForShown.length; i++) {
        var item = itemsDataForShown[i];
        // 启用"隐藏行"菜单项
        if (item.name === "gc.spread.hideRows") {
            item.text = "隐藏（改写）"
            item.disable = false;
        } 
        // 启用"取消隐藏行"菜单项
        else if (item.name === "gc.spread.unhideRows") {
            item.text = "取消隐藏（改写）"
            item.disable = false;
        }
    }
};

// 3. 应用自定义右键菜单
spread.contextMenu = new ContextMenu();
```

## 七、总结

本示例展示了如何在 SpreadJS 工作表保护状态下实现右键菜单的精细化控制。通过继承 `ContextMenu` 类并重写 `onOpenMenu` 方法，开发者可以灵活地控制哪些菜单项在保护状态下仍然可用，从而在数据安全和用户体验之间找到平衡点。

开发者可以从本示例中学到：

* SpreadJS 右键菜单的自定义机制
* JavaScript 原型链继承的实际应用
* 工作表保护功能的灵活配置
* 如何通过菜单项的 `name` 属性精确定位和修改特定菜单项

该方案适用于需要在保护状态下保留部分操作权限的场景，具有良好的扩展性，可以根据实际业务需求进行定制化开发。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
