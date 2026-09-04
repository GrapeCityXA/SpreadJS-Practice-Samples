## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现大型 Excel 文件的按需加载优化方案。当处理包含大量工作表的 Excel 文件时，一次性加载所有数据会导致页面卡顿和内存占用过高。该示例通过"懒加载"策略，在初始化时仅加载第一个工作表的数据，其他工作表仅创建标签页，当用户切换到某个工作表时才动态加载该工作表的数据，从而显著提升大文件的加载性能和用户体验。

## 二、解决的问题

- **初始加载性能问题**：包含几十个甚至上百个工作表的 Excel 文件，一次性加载所有数据会导致页面长时间无响应
- **内存占用优化**：用户通常只会查看部分工作表，预加载所有数据会造成内存浪费
- **用户体验提升**：通过按需加载，用户可以快速看到界面并开始操作，而不需要等待所有数据加载完成

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 工作表结构预加载

在初始化阶段，后端分析 Excel 文件获取所有工作表的名称列表，前端根据名称列表创建空白工作表，仅显示标签页而不加载数据：

```javascript
// 后端分析出的工作表名称列表
const sheetList = [
    '明细表检查',
    '00 其他财务及法律文件',
    '填表说明',
    // ... 更多工作表
]

// 移除默认工作表
spread.removeSheet(0)

// 批量创建空白工作表
sheetList.forEach((v, index) => {
    spread.addSheet(0, new GC.Spread.Sheets.Worksheet(v))
})

// 设置默认激活的工作表
activeName = '明细表检查'
spread.setActiveSheet('明细表检查')
```

#### 3.1.2 按需加载机制

通过监听 `SheetTabClick` 事件，在用户切换工作表时判断该工作表是否已加载数据，如果未加载则触发数据加载逻辑：

```javascript
// 记录已加载数据的工作表
let loadDataSheets = []
let activeName = ''

// 监听工作表切换事件
spread.bind(GC.Spread.Sheets.Events.SheetTabClick, (e, args) => {
    activeName = args.sheetName
    // 第一次切换到该工作表时加载数据
    if (loadDataSheets.indexOf(activeName) === -1) {
        spread.suspendPaint()
        loadSheetData()
        loadDataSheets.push(activeName)
    }
})
```

#### 3.1.3 性能优化策略

在加载数据时，通过暂停绘制和计算服务来提升性能，数据加载完成后再恢复：

```javascript
function loadSheetData() {
    let sheetIndex = spread.getSheetIndex(activeName)
    
    // 开启按需计算模式
    spread.options.calcOnDemand = true
    // 暂停计算服务
    spread.suspendCalcService(true)
    
    // 加载数据（实际项目中应从后端获取）
    spread.getSheet(sheetIndex).setValue(0, 0, activeName)
    
    // 恢复计算服务但不重新计算公式
    spread.resumeCalcService(false)
    // 恢复绘制
    spread.resumePaint()
}
```

### 3.2 技术栈

- **SpreadJS**: 15.0.0 - 核心表格组件
- **SystemJS**: 0.19.22 - 模块加载器
- **TypeScript**: 4.1.2 - 类型支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到底部有大量工作表标签页（共 81 个）
2. 初始状态下仅第一个工作表"明细表检查"加载了数据
3. 点击任意其他工作表标签页，系统会动态加载该工作表的数据
4. 控制台会输出 "loaded..." 提示数据加载完成
5. 已加载过的工作表再次切换时不会重复加载

## 五、功能特点

### 5.1 优点

- **快速启动**：初始化时间大幅缩短，用户可以立即看到界面
- **内存友好**：仅加载用户实际访问的工作表数据，减少内存占用
- **无感知加载**：通过暂停绘制和计算，数据加载过程对用户几乎无感知
- **可扩展性强**：适用于任意数量的工作表，理论上支持无限扩展

### 5.2 局限性与扩展建议

- **当前实现**：示例中使用 `setValue` 模拟数据加载，实际项目需要对接后端 API
- **扩展建议**：
  - 添加 Loading 动画提示用户数据正在加载
  - 实现数据预加载策略（如预加载相邻工作表）
  - 添加数据缓存机制，避免重复请求后端
  - 对于 SpreadJS 16+ 版本，可以使用官方的懒加载 API 实现更优雅的方案

## 六、关键代码片段

### 6.1 初始化配置

```javascript
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'), {
    calcOnDemand: true  // 开启按需计算模式
})
```

### 6.2 数据加载函数

```javascript
function loadSheetData() {
    let sheetIndex = spread.getSheetIndex(activeName)
    
    // 实际项目中应该是异步请求
    // let sheetJson = await getSheetJson(urlinfo)
    
    spread.options.calcOnDemand = true
    spread.suspendCalcService(true)
    spread.getSheet(sheetIndex).setValue(0, 0, activeName)
    
    console.log('loaded...')
    spread.resumeCalcService(false)
    spread.resumePaint()
}
```

## 七、总结

本示例提供了一个实用的大文件性能优化方案，特别适合处理包含大量工作表的 Excel 文件。开发者可以从中学到：

- 如何使用事件监听实现按需加载机制
- SpreadJS 性能优化的核心 API（suspendPaint、suspendCalcService、calcOnDemand）
- 前后端协作的数据加载架构设计
- 内存和性能优化的实践思路

该方案可以直接应用于财务报表、数据分析等需要处理大型 Excel 文件的业务场景，通过简单的改造即可对接实际的后端数据接口。对于使用 SpreadJS 16+ 版本的项目，建议参考官方懒加载 API 文档以获得更完善的功能支持。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/_kTVSdc-40WCl8k4AgtYVA/)）
