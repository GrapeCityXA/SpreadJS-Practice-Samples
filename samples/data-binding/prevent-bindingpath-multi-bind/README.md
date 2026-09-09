## 一、Demo 概述

本示例演示了如何在 SpreadJS Designer 中实现数据绑定时的字段唯一性约束。当用户尝试将同一个数据字段多次拖拽绑定到工作表的不同单元格时，系统会自动检测并阻止重复绑定操作，确保每个字段在工作表中只能绑定一次。

该功能适用于需要严格控制数据绑定规则的场景，例如表单设计、数据模板配置等，避免因重复绑定导致的数据混乱或逻辑错误。

## 二、解决的问题

- **防止数据字段重复绑定**：在数据绑定场景中，同一个字段被多次绑定到不同单元格会导致数据同步混乱，该示例通过拦截机制确保字段唯一性
- **提升用户体验**：通过即时提示告知用户字段已被绑定，避免用户在不知情的情况下创建无效绑定
- **保证数据一致性**：在表单或模板设计中，确保每个数据源字段与单元格的一对一映射关系

## 三、实现思路

### 3.1 核心技术点

#### 重写 bindingPath 方法实现拦截

通过重写 `GC.Spread.Sheets.CellRange.prototype.bindingPath` 方法，在设置绑定路径之前插入自定义的验证逻辑。这种方法拦截了所有绑定操作的入口，能够在绑定生效前进行检查。

```javascript
let oldSetBindingPath = GC.Spread.Sheets.CellRange.prototype.bindingPath
GC.Spread.Sheets.CellRange.prototype.bindingPath = function(field){
    console.log(field)
    let sheet = this.sheet
    let rc = sheet.getRowCount()
    let cc = sheet.getColumnCount()
    for(let r=0;r<rc;r++){
        for(let c=0;c<cc;c++){
            let path = sheet.getBindingPath(r,c)
            if(path&&path==field){
                alert("该字段已绑定")
                return
            }
        }
    }
    oldSetBindingPath.call(this,field)
}
```

#### 遍历检查已有绑定

在允许新绑定之前，遍历工作表的所有单元格，使用 `sheet.getBindingPath(r,c)` 获取每个单元格的绑定路径，与即将绑定的字段进行比对。如果发现相同字段已存在绑定，则弹出提示并终止操作。

#### 配置数据绑定架构

使用 JSON Schema 定义数据绑定的字段结构，并通过 Designer 的 `setData` 方法加载到设计器的数据绑定面板中：

```javascript
const bindSchema = {
    "$schema":"http://json-schema.org/draft-04/schema#",
    "properties":{
        "name":{
            "dataFieldType":"text",
            "type":"string"
        }
    },
    "type":"object"
}

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
designer.setData("treeNodeFromJson",JSON.stringify(bindSchema))
designer.setData("oldTreeNodeFromJson",JSON.stringify(bindSchema))
designer.setData('updatedTreeNode',JSON.stringify(bindSchema))
```

### 3.2 技术栈

- **SpreadJS 16.0.1**：核心电子表格引擎
- **SpreadJS Designer 16.0.1**：可视化设计器组件
- **SystemJS**：模块加载器
- **TypeScript 4.1.2**：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 使用本地服务器打开 index.html
# 例如使用 Live Server 或其他 HTTP 服务器
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html`
2. 点击设计器顶部菜单栏的"数据"选项卡
3. 选择"工作表绑定"功能
4. 从左侧数据字段面板中拖拽 `name` 字段到工作表的某个单元格
5. 再次尝试将 `name` 字段拖拽到另一个单元格
6. 系统会弹出提示"该字段已绑定"，阻止重复绑定操作

## 五、功能特点

### 5.1 优点

- **实现简洁**：通过原型链方法重写实现功能扩展，代码量少且易于维护
- **无侵入性**：不修改 SpreadJS 核心库，通过扩展机制实现自定义逻辑
- **实时验证**：在用户操作时立即进行检查，提供即时反馈
- **通用性强**：该方案可扩展到更复杂的绑定规则验证场景

### 5.2 局限性与扩展建议

- **性能考虑**：当前实现使用双重循环遍历所有单元格，在大型工作表中可能存在性能瓶颈。建议维护一个字段绑定映射表（Map 结构）来优化查询效率
- **提示方式**：使用 `alert` 弹窗可能影响用户体验，建议改用 Toast 通知或设计器内置的消息提示组件
- **扩展方向**：可以进一步扩展为支持字段绑定次数限制（如允许绑定 N 次）、跨工作表绑定检查等功能

## 六、关键代码片段

### 方法重写与原方法保存

```javascript
// 保存原始方法引用
let oldSetBindingPath = GC.Spread.Sheets.CellRange.prototype.bindingPath

// 重写方法，添加自定义逻辑
GC.Spread.Sheets.CellRange.prototype.bindingPath = function(field){
    // 自定义验证逻辑
    // ...
    
    // 验证通过后调用原方法
    oldSetBindingPath.call(this,field)
}
```

这种模式确保了在添加自定义逻辑的同时，不破坏原有功能的正常执行。

## 七、总结

本示例展示了如何通过扩展 SpreadJS API 实现自定义的数据绑定验证规则。开发者可以从中学到：

1. **原型链方法重写技术**：通过保存原方法引用并重写原型方法来扩展功能
2. **SpreadJS 绑定机制**：理解 `bindingPath` 方法的工作原理和 `getBindingPath` 的使用
3. **Designer 数据配置**：掌握如何通过 JSON Schema 配置数据绑定面板
4. **拦截器模式应用**：在不修改源码的情况下实现功能增强

该方案适用于需要对数据绑定行为进行精细控制的场景，具有良好的扩展性，可以根据实际业务需求调整验证规则和提示方式。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/_L7hGgd3K0eagVIR0YBQuQ/)）
