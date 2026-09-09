## 一、Demo 概述

本示例演示了如何在 SpreadJS Designer 中通过编程方式控制文件菜单的显示和隐藏。通过调用 Designer 的数据存储 API，开发者可以动态切换文件菜单的可见性，实现对设计器界面的灵活控制。

该功能适用于需要根据用户权限或业务场景动态调整设计器功能的应用场景，例如在只读模式下隐藏文件操作菜单，或在特定工作流程中限制用户对文件菜单的访问。

## 二、解决的问题

- **权限控制需求**：在多用户协作场景中，不同角色的用户可能需要不同的功能权限，通过控制文件菜单的显示可以限制普通用户的文件操作权限
- **界面简化需求**：在嵌入式应用或特定业务流程中，可能不需要完整的文件菜单功能，隐藏文件菜单可以简化界面，提升用户体验
- **动态功能切换**：根据应用状态或用户操作动态启用或禁用文件菜单，实现更灵活的交互控制

## 三、实现思路

### 3.1 核心技术点

#### 使用 Designer 数据存储 API 控制菜单显示

SpreadJS Designer 提供了 `getData()` 和 `setData()` 方法用于存储和读取自定义数据。通过特定的键名 `FileMenu_show`，可以控制文件菜单的显示状态。

```javascript
const FileMenuShow = "FileMenu_show"

document.getElementById("changeFileShow").onclick = function () {
    let isShow = designer.getData(FileMenuShow)
    designer.setData(FileMenuShow, !isShow)
}
```

实现逻辑：
1. 定义常量 `FileMenuShow` 作为数据存储的键名
2. 通过 `getData(FileMenuShow)` 获取当前文件菜单的显示状态
3. 使用 `setData(FileMenuShow, !isShow)` 切换状态（取反操作）
4. Designer 内部会监听该数据变化并自动更新文件菜单的显示状态

### 3.2 技术栈

- SpreadJS Designer 16.0.1：提供完整的电子表格设计器功能
- SystemJS：模块加载器，用于动态加载 ES6 模块
- TypeScript 4.1.2：提供类型支持（虽然示例使用 JavaScript）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html` 文件
2. 页面会加载 SpreadJS Designer 设计器
3. 点击页面顶部的"切换文件弹出菜单"按钮
4. 观察设计器左上角的文件菜单是否显示或隐藏
5. 可以多次点击按钮，验证菜单的显示状态在显示和隐藏之间切换

## 五、功能特点

### 5.1 优点

- **实现简单**：只需两行核心代码即可实现菜单控制功能
- **无侵入性**：通过 Designer 提供的标准 API 实现，不需要修改 Designer 内部代码
- **状态持久化**：使用 Designer 的数据存储机制，状态可以在 Designer 实例的生命周期内保持

### 5.2 局限性与扩展建议

- **状态不持久**：页面刷新后菜单状态会恢复默认，如需持久化可结合 localStorage 或后端存储
- **扩展方向**：可以扩展为控制更多 Designer 功能模块的显示，例如工具栏、侧边栏等，实现更细粒度的界面定制

## 六、总结

本示例展示了 SpreadJS Designer 中控制文件菜单显示的简单而实用的方法。开发者可以从中学到：

- Designer 数据存储 API 的使用方式
- 通过特定键名控制 Designer 内置功能的技巧
- 如何实现动态的界面功能切换

该方案适用于需要根据业务逻辑动态调整设计器功能的场景，具有良好的扩展性，可以作为实现更复杂权限控制和界面定制功能的基础。

### 在线Demo（[全屏打开](https://jscodemine.grapecity.com/share/tbrRXiwA0EiahCxu3ydBzw/)）
