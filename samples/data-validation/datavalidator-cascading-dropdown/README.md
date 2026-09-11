## 一、Demo 概述

本示例展示了如何使用 SpreadJS 的数据验证功能实现三级级联下拉列表（省份-城市-区域）。通过自定义名称（Custom Name）和 INDIRECT 函数的组合，实现了下拉列表之间的动态联动效果。当用户选择省份后，城市下拉列表会自动显示该省份下的城市；选择城市后，区域下拉列表会自动显示该城市下的区域。

该示例适用于需要多级联动选择的业务场景，如地址选择、分类筛选、组织架构选择等。

## 二、解决的问题

* **多级数据联动选择**：在表格中实现省市区三级联动下拉选择，避免用户手动输入错误
* **数据源集中管理**：将所有级联数据存储在独立的数据源工作表中，便于维护和更新
* **动态数据验证**：根据上级选择动态更新下级可选项，提升用户体验
* **数据规范化**：通过下拉列表限制用户输入，确保数据的一致性和准确性

## 三、实现思路

### 3.1 数据源工作表初始化

核心思路是在独立的工作表中按列存储各级数据，并为每个数据区域定义自定义名称。数据源采用树形结构（省份 -> 城市 -> 区域），通过遍历将数据平铺到工作表的不同列中。

```javascript
function initAddressSource(sheet, source){
    sheet.suspendPaint();
    sheet.setColumnCount(100000);
    
    // 定义省份列的自定义名称
    sheet.setValue(0, 0, "省份");
    let prRange = new GC.Spread.Sheets.Range(1, 0, source.length, 1);
    sheet.addCustomName("省份", "级联数据源!" + GC.Spread.Sheets.CalcEngine.rangesToFormula([prRange], 0, 0, GC.Spread.Sheets.CalcEngine.RangeReferenceRelative.allAbsolute, false));
    
    let cityIndex = 1;
    for (let i = 0; i < source.length; i++) {
        let pr = source[i];
        sheet.setValue(i + 1, 0 , pr.name);
        sheet.setValue(0, cityIndex, pr.name);
        
        // 为每个省份的城市列表定义自定义名称（名称为省份名）
        let cityRange = new GC.Spread.Sheets.Range(1, cityIndex, pr.children.length, 1);
        sheet.addCustomName(pr.name, "级联数据源!" + GC.Spread.Sheets.CalcEngine.rangesToFormula([cityRange], 0, 0, GC.Spread.Sheets.CalcEngine.RangeReferenceRelative.allAbsolute, false));
        
        // 遍历城市，为每个城市的区域列表定义自定义名称（名称为"省份+城市"）
        let regionIndex = cityIndex + 1;
        for (let j = 0; j < pr.children.length; j++) {
            let city = pr.children[j];
            sheet.setValue(j + 1, cityIndex , city.name);
            if (city.children) {
                let regionRange = new GC.Spread.Sheets.Range(1, regionIndex, city.children.length, 1);
                sheet.addCustomName(pr.name + city.name, "级联数据源!" + GC.Spread.Sheets.CalcEngine.rangesToFormula([regionRange], 0, 0, GC.Spread.Sheets.CalcEngine.RangeReferenceRelative.allAbsolute, false));
                sheet.setValue(0, regionIndex, pr.name + city.name);
                for(let k = 0; k < city.children.length; k++){
                    let region = city.children[k];
                    sheet.setValue(k + 1, regionIndex, region.name);
                }
                regionIndex++;
            }
        }
        cityIndex = regionIndex;
    }
    sheet.resumePaint();
}
```

### 3.2 级联数据验证规则设置

通过 `createFormulaListValidator` 方法创建基于公式的数据验证规则。关键在于使用 INDIRECT 函数动态引用自定义名称，实现级联效果。

**省份下拉列表**（静态引用）：

```javascript
let provinceList = new GC.Spread.Sheets.DataValidation.createFormulaListValidator(sourceSheet.name() + "!省份");
sheet.setDataValidator(1, 0, 10, 1, provinceList);
```

**城市下拉列表**（动态引用省份单元格）：

```javascript
let cityList = new GC.Spread.Sheets.DataValidation.createFormulaListValidator('INDIRECT("' + sourceSheet.name() + '!\"&$A2)');
sheet.setDataValidator(1, 1, 10, 1, cityList);
```

**区域下拉列表**（动态引用省份+城市单元格）：

```javascript
let regionList = new GC.Spread.Sheets.DataValidation.createFormulaListValidator('INDIRECT("' + sourceSheet.name() + '!\"&$A2&$B2)');
sheet.setDataValidator(1, 2, 10, 1, regionList);
```

### 3.3 技术栈

* **@grapecity/spread-sheets**: 17.0.8（核心表格组件）
* **systemjs**: ^0.19.22（模块加载器）
* **systemjs-plugin-babel**: 0.0.25（ES6 模块支持）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到两个工作表：主工作表和"级联数据源"工作表
2. 在主工作表的第二行开始，点击"省份"列的单元格，会出现省份下拉列表
3. 选择一个省份后，点击同一行的"城市"列单元格，会出现该省份下的城市列表
4. 选择城市后，点击"区域"列单元格，会出现该城市下的区域列表
5. 可以在多行中重复此操作，每行的级联关系独立生效

## 五、功能特点

### 5.1 优点

* **数据源与展示分离**：数据源存储在独立工作表中，便于批量维护和更新
* **公式驱动的动态联动**：利用 INDIRECT 函数实现纯公式级联，无需编写复杂的事件监听代码
* **可扩展性强**：支持任意层级的级联关系，只需按相同模式添加自定义名称和验证规则
* **性能优化**：使用 `suspendPaint()` 和 `resumePaint()` 减少渲染次数，提升初始化性能

### 5.2 局限性与扩展建议

* **数据源结构固定**：当前实现要求数据源为三层树形结构，如需支持更多层级需修改初始化逻辑
* **自定义名称命名规则**：使用"省份+城市"作为区域的自定义名称，如果名称重复会导致冲突
* **扩展建议**：
    * 可以添加数据验证失败的提示信息，提升用户体验
    * 可以在选择变更时自动清空下级单元格的内容，避免数据不一致
    * 可以将数据源从代码中分离，改为从服务器动态加载

## 六、关键代码片段

### 自定义名称定义

```javascript
// 使用 addCustomName 方法定义自定义名称
// 参数1：名称（如"省份"、"北京市"、"北京市市辖区"）
// 参数2：引用的单元格区域公式（绝对引用）
sheet.addCustomName("省份", "级联数据源!$A$2:$A$35");
sheet.addCustomName("北京市", "级联数据源!$B$2:$B$2");
sheet.addCustomName("北京市市辖区", "级联数据源!$C$2:$C$17");
```

### INDIRECT 函数的使用

```javascript
// INDIRECT 函数将文本字符串转换为单元格引用
// 通过拼接单元格值（$A2）动态构造自定义名称
'INDIRECT("级联数据源!"&$A2)'  // 引用名称为 $A2 单元格值的自定义名称
'INDIRECT("级联数据源!"&$A2&$B2)'  // 引用名称为 $A2+$B2 拼接值的自定义名称
```

## 七、总结

本示例展示了 SpreadJS 数据验证功能的高级应用，通过自定义名称和 INDIRECT 函数的巧妙组合，实现了纯公式驱动的多级级联下拉列表。开发者可以从中学到：

* 如何使用自定义名称管理动态数据源
* 如何利用 INDIRECT 函数实现动态单元格引用
* 如何设计可扩展的级联数据结构
* 如何优化大量数据初始化的性能

该方案适用于需要多级联动选择的各类业务场景，具有良好的可维护性和扩展性。通过修改数据源结构和自定义名称定义规则，可以轻松扩展到更多层级的级联关系。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
