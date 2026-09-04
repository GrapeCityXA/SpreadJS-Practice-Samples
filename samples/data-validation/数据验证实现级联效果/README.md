## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现级联下拉列表功能。通过数据验证和自定义名称的结合使用，当用户在 A 列选择省份时，B 列会自动显示该省份对应的城市列表；当选择城市后，C 列会显示该城市对应的辖区列表。这种三级联动效果常用于地址选择、分类筛选等业务场景。

该示例采用了"码表"工作表作为数据源，通过 INDIRECT 函数动态引用自定义名称，实现了灵活的级联数据验证机制。

## 二、解决的问题

- **动态下拉选项**：根据上级选择自动更新下级可选项，避免用户选择不匹配的数据组合
- **数据关联管理**：通过自定义名称统一管理省市区三级数据的映射关系
- **用户体验优化**：当上级选项变更时，自动清空下级已选数据，防止数据不一致

## 三、实现思路

### 3.1 数据源组织

在独立的"码表"工作表中按层级组织数据：第一行存储省份列表，第二至三行存储各省份对应的城市，第四至七行存储各城市对应的辖区。这种结构化存储方式便于通过自定义名称进行引用。

```javascript
// 初始化数据源表
sheet1.name("码表")
sheet1.setArray(0, 0, [
    ['陕西省', '广东省', '湖南省', '四川省', "福建省"]
])

sheet1.setArray(1, 0, [
    ['宝鸡市', '湛江市', "长沙市", "成都市", "厦门市"],
    ["西安市", "广州市", "株洲市", "眉山市", "福州市"]
])

sheet1.setArray(3, 0, [
    ['金台区', '坡头区', "芙蓉区", "金牛区", "集美区"],
    ['金台1区', '坡头1区', "芙蓉1区", "金牛1区", "集美1区"],
    ['雁塔区', '白云区', "荷塘区", "东坡区", "台江区"],
    ['雁塔1区', '白云1区', "荷塘1区", "东坡1区", "台江1区"]
])
```

### 3.2 自定义名称映射

通过 `addCustomName` 方法为每个省份和城市创建命名引用，将文本值与对应的数据区域关联起来。这是实现级联的关键机制。

```javascript
// 添加省份列表的自定义名称
spread.addCustomName('省份', '=码表!$A$1:$E$1', 0, 0);

// 为每个省份添加对应城市列表的自定义名称
spread.addCustomName('陕西省', '=码表!$A$2:$A$3', 1, 0);
spread.addCustomName('广东省', '=码表!$B$2:$B$3', 1, 1);
spread.addCustomName('湖南省', '=码表!$C$2:$C$3', 1, 2);

// 为每个城市添加对应辖区列表的自定义名称
spread.addCustomName('宝鸡市', '=码表!$A$4:$A$5', 3, 0);
spread.addCustomName('湛江市', '=码表!$B$4:$B$5', 3, 1);
spread.addCustomName('西安市', '=码表!$A$6:$A$7', 5, 0);
```

### 3.3 公式数据验证

使用 `createFormulaListValidator` 创建基于公式的数据验证器。A 列直接引用"省份"名称，B 列和 C 列通过 INDIRECT 函数动态引用上级单元格的值作为自定义名称。

```javascript
// A列：省份下拉列表
let dv = GC.Spread.Sheets.DataValidation.createFormulaListValidator("=省份");
sheet.setDataValidator(1, 0, 5, 1, dv, GC.Spread.Sheets.SheetArea.viewport);

// B列：城市下拉列表（根据A列值动态变化）
let dv1 = GC.Spread.Sheets.DataValidation.createFormulaListValidator("=INDIRECT(A2)");
sheet.setDataValidator(1, 1, 5, 1, dv1, GC.Spread.Sheets.SheetArea.viewport);

// C列：辖区下拉列表（根据B列值动态变化）
let dv2 = GC.Spread.Sheets.DataValidation.createFormulaListValidator("=INDIRECT(B2)");
sheet.setDataValidator(1, 2, 5, 1, dv2, GC.Spread.Sheets.SheetArea.viewport);
```

### 3.4 级联清空机制

监听 `ValueChanged` 事件，当 A 列（省份）的值发生变化时，自动清空该行 B 列和 C 列的数据，确保数据一致性。

```javascript
sheet.bind(GC.Spread.Sheets.Events.ValueChanged, function (e, info) {
    if (info.col === 0 && info.row !== 0) {
        sheet.clear(
            info.row,
            info.col + 1,
            1,
            2,
            GC.Spread.Sheets.SheetArea.viewport,
            GC.Spread.Sheets.StorageType.data
        );
    }
});
```

### 3.5 技术栈

- @grapecity/spread-sheets: 15.0.0
- SystemJS: 0.19.22（模块加载器）
- TypeScript: 4.1.2

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后，在 A 列任意行点击下拉箭头，选择一个省份（如"广东省"）
2. 点击同行 B 列，下拉列表会自动显示该省份对应的城市（如"湛江市"、"广州市"）
3. 选择城市后，点击 C 列，下拉列表会显示该城市对应的辖区
4. 如果修改 A 列的省份选择，B 列和 C 列的数据会自动清空

## 五、功能特点

### 5.1 优点

- **数据一致性保障**：通过自动清空机制防止出现"广东省-西安市"这类不匹配的数据组合
- **维护性强**：数据源集中在"码表"工作表，修改数据时无需调整代码逻辑
- **扩展性好**：可轻松扩展到四级、五级级联，只需添加更多自定义名称和数据验证器

### 5.2 局限性与扩展建议

- **数据量限制**：当前方案需要为每个选项创建自定义名称，数据量大时会导致名称管理复杂
- **扩展建议**：对于大规模数据，可考虑使用动态数据源（如 JSON 数据 + 自定义单元格类型）或服务端接口实时查询

## 六、总结

本示例展示了 SpreadJS 中实现级联下拉列表的经典方案，核心价值在于：

- 掌握 `addCustomName` 和 `INDIRECT` 函数的组合使用
- 理解公式数据验证器的动态引用机制
- 学习通过事件监听实现数据联动清空

该方案适用于层级关系明确、数据量适中的业务场景，如地址选择、商品分类、组织架构等。对于需要处理海量数据或复杂查询逻辑的场景，建议结合服务端接口或自定义单元格类型实现更灵活的解决方案。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/pm1kJrTImUW-P37aornc4g/)）
