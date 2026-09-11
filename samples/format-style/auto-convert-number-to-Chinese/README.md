## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现数字到人民币大写金额的自动转换功能。通过使用 SpreadJS 的内置格式化器和公式，可以将阿拉伯数字自动转换为中文大写金额，支持两种场景：不含角分的整数金额转换和包含角分的完整金额转换。

该功能常用于财务报表、发票、合同等需要规范显示金额大写的业务场景，能够有效避免手动转换的错误，提高工作效率。

## 二、解决的问题

* **财务单据规范化**：在发票、收据、合同等正式文档中，金额需要同时显示阿拉伯数字和中文大写，本示例提供了自动化转换方案
* **数据录入效率**：用户只需输入数字，系统自动生成对应的大写金额，避免手动转换的繁琐和错误
* **多场景适配**：支持整数金额（不含角分）和小数金额（包含角分）两种转换模式，满足不同业务需求

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 使用 DBNum2 格式化器实现整数金额大写转换

SpreadJS 提供了 `[DBNum2][$-804]General` 格式化器，可以直接将数字转换为中文大写。该格式化器基于 Excel 的 DBNum 系列格式，其中 DBNum2 表示中文大写数字，$-804 表示中文（中国）区域设置。

```javascript
// 设置单元格公式：将多个单元格的数字拼接成完整金额
sheet.setFormula(1, 1, "=I5&J5&K5&L5&M5&N5&O5&P5&Q5");

// 应用 DBNum2 格式化器，自动转换为中文大写
sheet.setFormatter(1, 1, "[DBNum2][$-804]General");
```

这种方式适用于不含小数的整数金额，例如 123000000 会被转换为"壹亿贰仟叁佰万"。

#### 3.1.2 使用 CONCAT 和 TEXT 函数实现包含角分的金额转换

对于需要显示角分的金额，需要将整数部分和小数部分分别处理，然后拼接成完整的大写金额字符串。

```javascript
sheet.setFormula(4, 1, 
  '=CONCAT(TEXT(TRUNC(I5&J5&K5&L5&M5&N5&O5&P5&Q5),"[DBNUM2]")&"元",' +
  'IF(R5>0,TEXT(TRUNC(R5),"[DBNUM2]")&"角",""),' +
  'IF(S5>0,TEXT(TRUNC(S5),"[DBNUM2]")&"分",""))'
);
```

公式解析：

* `TRUNC(I5&J5&K5&L5&M5&N5&O5&P5&Q5)`：拼接并截取整数部分（元）
* `TEXT(...,"[DBNUM2]")`：将数字转换为中文大写
* `IF(R5>0,...)`：如果角位不为 0，则添加角的大写
* `IF(S5>0,...)`：如果分位不为 0，则添加分的大写
* `CONCAT(...)`：将元、角、分拼接成完整字符串

#### 3.1.3 加载预设工作簿数据

示例通过 `fromJSON` 方法加载预设的工作簿结构，包含了金额输入区域和显示区域的布局设置。

```javascript
import { bindFile } from "./bindFile.js";

// 加载预设的工作簿结构
spread.fromJSON(bindFile);
```

`bindFile.js` 中包含了完整的工作簿 JSON 数据，定义了单元格的样式、合并区域、列宽等配置，确保界面布局的一致性。

### 3.2 技术栈

* SpreadJS 16.2.2：核心表格组件
* SpreadJS Designer 16.2.2：设计器组件，提供可视化编辑界面
* SpreadJS 中文资源包：提供中文界面支持
* SystemJS：模块加载器
* TypeScript 4.1.2：类型支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开示例后，可以看到预设的金额输入区域（I5-S5 单元格）
2. 在对应的单元格中输入数字：
    * I5-Q5：分别对应亿、千、百、十、万、千、百、十、元位
    * R5：角位
    * S5：分位
3. 观察 B2 单元格：显示不含角分的整数金额大写
4. 观察 B5 单元格：显示包含角分的完整金额大写
5. 修改任意输入单元格的数字，大写金额会自动更新

## 五、功能特点

### 5.1 优点

* **实现简单**：利用 SpreadJS 内置的 DBNum2 格式化器，无需编写复杂的转换逻辑
* **自动更新**：基于公式驱动，输入数字变化时大写金额自动刷新
* **场景灵活**：同时支持整数金额和包含角分的金额转换，适应不同业务需求
* **可视化编辑**：集成 SpreadJS Designer，支持在设计器中直接调整布局和公式

### 5.2 局限性与扩展建议

* **输入方式限制**：当前需要在多个单元格中分别输入各位数字，可以扩展为支持直接输入完整数字的方式
* **格式固定**：大写金额的格式（如"元角分"的显示规则）是固定的，如需自定义格式（如"整"字结尾），需要修改公式逻辑
* **扩展建议**：可以将该功能封装为自定义函数，方便在其他工作表中复用

## 六、关键代码片段

### 整数金额转换核心代码

```javascript
// 拼接多个单元格的数字
sheet.setFormula(1, 1, "=I5&J5&K5&L5&M5&N5&O5&P5&Q5");

// 应用中文大写格式化器
sheet.setFormatter(1, 1, "[DBNum2][$-804]General");
```

### 包含角分的金额转换核心代码

```javascript
sheet.setFormula(4, 1, 
  '=CONCAT(' +
    'TEXT(TRUNC(I5&J5&K5&L5&M5&N5&O5&P5&Q5),"[DBNUM2]")&"元",' +
    'IF(R5>0,TEXT(TRUNC(R5),"[DBNUM2]")&"角",""),' +
    'IF(S5>0,TEXT(TRUNC(S5),"[DBNUM2]")&"分","")' +
  ')'
);
```

## 七、总结

本示例展示了 SpreadJS 在金额大写转换场景中的应用，核心价值在于利用内置的 DBNum2 格式化器和公式系统，实现了零代码或少量代码的自动化转换方案。

开发者可以从中学到：

* SpreadJS 的 DBNum 系列格式化器的使用方法
* 如何使用 TEXT 函数配合格式化器进行数字转换
* 如何使用 CONCAT 和 IF 函数构建复杂的字符串拼接逻辑
* 如何通过 fromJSON 加载预设的工作簿结构

该方案适用于需要在电子表格中自动生成规范金额大写的场景，如财务系统、报销单据、合同管理等，具有良好的扩展性和实用性。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
