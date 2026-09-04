## 一、Demo 概述

本示例演示如何在 SpreadJS Designer 中自定义右键菜单，通过过滤 `contextMenu.menuData` 数组来删除特定的菜单项。具体实现了在 Sheet 标签页右键菜单中移除"插入 Sheet"功能，展示了 SpreadJS 菜单系统的灵活定制能力。

该示例适用于需要限制用户操作权限、简化界面或符合特定业务规则的场景。

## 二、解决的问题

- **权限控制需求**：在某些业务场景下，需要限制用户动态添加工作表的能力，防止数据结构被随意修改
- **界面简化**：移除不常用或不需要的菜单项，减少用户操作的复杂度，提升用户体验
- **定制化需求**：根据不同的用户角色或业务场景，提供差异化的菜单功能

## 三、实现思路

### 3.1 获取并修改菜单数据

SpreadJS 的右键菜单通过 `spread.contextMenu.menuData` 属性进行管理，该属性是一个包含所有菜单项配置的数组。通过读取、过滤和重新赋值该数组，可以实现菜单项的删除。

```javascript
let menuData = spread.contextMenu.menuData
// 可以打开f12查看此变量
console.log(menuData)

menuData = menuData.filter(v => {
    // 删除插入sheet的右键菜单
    return v.command != "gc.spread.contextMenu.insertSheet"
})

spread.contextMenu.menuData = menuData
```

核心逻辑：
1. 获取当前的菜单数据数组
2. 使用 `filter` 方法过滤掉 `command` 为 `gc.spread.contextMenu.insertSheet` 的菜单项
3. 将过滤后的数组重新赋值给 `contextMenu.menuData`

### 3.2 技术栈

- **SpreadJS**: 16.0.1（核心表格组件）
- **SpreadJS Designer**: 16.0.1（设计器组件，提供完整的 Excel 编辑界面）
- **SystemJS**: 0.19.22（模块加载器）
- **TypeScript**: 4.1.2（开发语言）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html`
2. 在 Sheet 标签页区域点击右键
3. 观察右键菜单中已不存在"插入 Sheet"选项
4. 打开浏览器开发者工具（F12），在控制台中可以查看完整的 `menuData` 结构

## 五、功能特点

### 5.1 优点

- **实现简单**：只需几行代码即可完成菜单项的删除
- **灵活性高**：可以根据 `command` 属性精确定位并删除任意菜单项
- **无侵入性**：不影响其他菜单功能和 SpreadJS 的正常运行
- **易于扩展**：可以通过类似方式添加、修改或重新排序菜单项

### 5.2 扩展建议

- **批量删除**：可以扩展为删除多个菜单项，只需在 `filter` 条件中添加更多判断
- **动态控制**：结合用户权限系统，根据不同角色动态显示或隐藏菜单项
- **自定义菜单**：除了删除，还可以通过 `push` 方法向 `menuData` 添加自定义菜单项

## 六、关键代码片段

### 菜单数据结构查看

```javascript
let menuData = spread.contextMenu.menuData
console.log(menuData)
```

通过控制台输出可以查看完整的菜单数据结构，每个菜单项包含 `command`、`text`、`iconClass` 等属性，便于定位需要操作的菜单项。

### 过滤特定菜单项

```javascript
menuData = menuData.filter(v => {
    return v.command != "gc.spread.contextMenu.insertSheet"
})
spread.contextMenu.menuData = menuData
```

使用数组的 `filter` 方法是最简洁的删除方式，保留所有 `command` 不等于目标值的菜单项，然后重新赋值给 `contextMenu.menuData` 即可生效。

## 七、总结

本示例展示了 SpreadJS 右键菜单的定制能力，通过简单的数组操作即可实现菜单项的删除。开发者可以从中学到：

1. SpreadJS 右键菜单的数据结构和访问方式
2. 通过 `contextMenu.menuData` 属性进行菜单定制的方法
3. 使用 JavaScript 数组方法（filter）进行菜单项过滤的技巧

该方案适用于需要对用户操作进行限制或简化界面的场景，具有良好的扩展性，可以根据实际需求进行更复杂的菜单定制。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/UhDhXV2JJUyc_3jvszQJjA/)）
