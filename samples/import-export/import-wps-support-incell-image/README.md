## 一、Demo 概述

本示例展示了如何在 SpreadJS 中正确导入包含 WPS 单元格内图片的 Excel 文件。WPS Office 使用特殊的 `DISPIMG` 函数来实现单元格内嵌图片功能，这种格式与标准的 Excel 浮动图片不同。该示例通过解析 XLSX 文件的内部 XML 结构，提取图片数据并转换为 SpreadJS 的 `image()` 函数，实现了对 WPS 单元格内图片的完整支持。 

## 二、解决的问题

* **WPS 格式兼容性**：WPS Office 使用 `DISPIMG` 函数存储单元格内图片，SpreadJS 默认导入时无法识别该函数，导致图片丢失
* **图片数据提取**：需要从 XLSX 文件的 ZIP 结构中解析 `cellimages.xml` 和关系文件，建立图片 ID 与实际图片文件的映射关系
* **公式转换**：将 WPS 的 `DISPIMG` 函数转换为 SpreadJS 支持的 `image()` 函数，确保图片正确显示

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 解析 XLSX 文件结构

使用 SheetJS (XLSX.js) 和 JSZip 库解析 Excel 文件的内部结构：

```javascript
const arrayBuffer = await file.arrayBuffer();
const workbook = XLSX.read(arrayBuffer, { type: 'array' });
const zip = await JSZip.loadAsync(arrayBuffer);
```

XLSX 文件本质上是一个 ZIP 压缩包，包含多个 XML 文件。WPS 的单元格内图片信息存储在 `xl/cellimages.xml` 文件中，图片文件存储在 `xl/media/` 目录下。

#### 3.1.2 查找 DISPIMG 函数单元格

遍历工作簿中的所有单元格，识别包含 `DISPIMG` 函数的单元格：

```javascript
function findDispImgCells(workbook) {
    const results = [];
    workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const cellAddresses = Object.keys(worksheet);
        
        cellAddresses.forEach(address => {
            if (!address.startsWith('!') && worksheet[address].f) {
                const formula = worksheet[address].f;
                const match = formula.match(/DISPIMG\(\"([^\"]+)\",\s*(\d)\)/i);
                
                if (match) {
                    results.push({
                        address: `${sheetName}!${address}`,
                        id: match[1],
                        displayMode: parseInt(match[2])
                    });
                }
            }
        });
    });
    return results;
}
```

该函数通过正则表达式提取 `DISPIMG` 函数的参数，包括图片 ID 和显示模式。

#### 3.1.3 构建图片映射关系

解析 XLSX 内部的关系文件（`_rels/*.rels`），建立关系 ID (rId) 到图片 Base64 数据的映射：

```javascript
async function buildImageIdMap(zip) {
    const imageMap = new Map();
    const relFiles = [];
    
    zip.forEach((relativePath, file) => {
        if ((relativePath.startsWith('xl/drawings/_rels/') && relativePath.endsWith('.rels')) || 
            (relativePath.startsWith('xl/_rels/') && relativePath.endsWith('cellimages.xml.rels'))) {
            relFiles.push(file);
        }
    });
    
    for (const file of relFiles) {
        const xmlContent = await file.async('text');
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
        
        const relationships = xmlDoc.getElementsByTagName('Relationship');
        for (let i = 0; i < relationships.length; i++) {
            const rel = relationships[i];
            const id = rel.getAttribute('Id');
            const target = rel.getAttribute('Target');
            
            if (target) {
                let filename = target.replace('../media/', '').replace('media/', '');
                const imgFile = zip.file(`xl/media/${filename}`);
                if (imgFile) {
                    const blob = await imgFile.async('blob');
                    let base64 = await blobToBase64(blob, imgFile);
                    imageMap.set(id, base64);
                }
            }
        }
    }
    return imageMap;
}
```

#### 3.1.4 解析 cellimages.xml 建立 rId 到图片 ID 的映射

```javascript
async function cellImageRid2Id(zip) {
    let rid2id = new Map();
    let cellImgXmlFile;
    
    zip.forEach((relativePath, file) => {
        if (relativePath.startsWith('xl/cellimages.xml')) {
            cellImgXmlFile = file;
        }
    });
    
    let xmlContent = await cellImgXmlFile.async('text');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    const xdrPics = xmlDoc.getElementsByTagName('xdr:pic');
    
    for (let i = 0; i < xdrPics.length; i++) {
        let p = xdrPics[i];
        let nameTag = p.getElementsByTagName("xdr:cNvPr")[0];
        let idTag = p.getElementsByTagName("a:blip")[0];
        let rid = idTag.getAttribute("r:embed");
        let id = nameTag.getAttribute("name");
        
        if (!rid2id.get(rid)) {
            rid2id.set(rid, []);
        }
        let arr = rid2id.get(rid);
        arr.push(id);
        rid2id.set(rid, arr);
    }
    return rid2id;
}
```

#### 3.1.5 转换为 SpreadJS 的 image() 函数

将图片 Base64 数据存储在隐藏工作表中，然后将 `DISPIMG` 函数替换为 SpreadJS 的 `image()` 函数：

```javascript
spread.import(file, function () {
    let srcSheet = new GC.Spread.Sheets.Worksheet("srcSheet");
    spread.addSheet(0, srcSheet);
    srcSheet.visible(GC.Spread.Sheets.SheetTabVisible.veryHidden);
    
    // 将 Base64 数据存储在隐藏工作表中
    let row = 0;
    rid2base64.forEach((base64, rid) => {
        srcSheet.setValue(row, 0, base64);
        let formula = GC.Spread.Sheets.CalcEngine.rangeToFormula(
            new GC.Spread.Sheets.Range(row, 0, 1, 1)
        );
        rid2id.get(rid).forEach(id => {
            id2cell.set(id, "srcSheet!" + formula);
        });
        row++;
    });
    
    // 替换 DISPIMG 函数为 image() 函数
    spread.suspendPaint();
    dispImgCells.forEach(info => {
        let sheetName = info.address.split("!")[0];
        let addr = info.address.split("!")[1];
        let sheet = spread.getSheetFromName(sheetName);
        let range = GC.Spread.Sheets.CalcEngine.formulaToRange(sheet, addr);
        sheet.setFormula(range.row, range.col, `image(${id2cell.get(info.id)})`);
    });
    spread.resumePaint();
});
```

### 3.2 技术栈

* **SpreadJS 17.0.8**：电子表格核心库
* **SpreadJS IO 17.0.8**：Excel 文件导入导出模块
* **JSZip 3.10.1**：ZIP 文件解析库
* **SheetJS (XLSX) 0.18.5**：Excel 文件解析库
* **SystemJS 0.19.22**：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

直接在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，点击"下载模板"链接下载包含 WPS 单元格内图片的示例文件
2. 点击"选择文件"按钮，选择包含 WPS 单元格内图片的 XLSX 文件
3. 点击"解析并导入"按钮
4. 系统会自动解析文件并在 SpreadJS 中显示，单元格内图片将正确显示

## 五、功能特点

### 5.1 优点

* **完整的 WPS 格式支持**：能够正确识别和导入 WPS Office 创建的单元格内图片
* **性能优化**：使用 `suspendPaint()` 和 `resumePaint()` 批量更新，避免频繁重绘
* **隐藏工作表存储**：将图片 Base64 数据存储在隐藏工作表中，避免污染用户界面
* **多图片格式支持**：自动识别 PNG、JPEG、GIF、WebP、BMP 等图片格式

### 5.2 局限性与扩展建议

* **依赖第三方库**：需要引入 JSZip 和 SheetJS 库来解析 XLSX 文件结构，增加了文件体积
* **性能考虑**：对于包含大量图片的文件，解析和转换过程可能较慢
* **扩展建议**：可以考虑添加进度提示、支持更多 WPS 特有功能、优化大文件处理性能

## 六、关键代码片段

### 图片 Blob 转 Base64

```javascript
function blobToBase64(blob, imgFile) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        const fileName = imgFile.name.toLowerCase();
        let mimeType = 'image/png'; // 默认使用 PNG
        
        if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
            mimeType = 'image/jpeg';
        } else if (fileName.endsWith('.gif')) {
            mimeType = 'image/gif';
        } else if (fileName.endsWith('.webp')) {
            mimeType = 'image/webp';
        } else if (fileName.endsWith('.bmp')) {
            mimeType = 'image/bmp';
        }
        
        reader.onload = () => resolve(`data:${mimeType};base64,` + reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
    });
}
```

该函数根据文件扩展名自动识别 MIME 类型，确保图片能够正确显示。

## 七、总结

本示例展示了如何通过深入解析 XLSX 文件的内部结构来实现对 WPS 单元格内图片的支持。开发者可以从中学到：

* XLSX 文件的 ZIP 结构和 XML 解析技术
* WPS Office 的 `DISPIMG` 函数工作原理
* SpreadJS 的 `image()` 函数使用方法
* 如何使用隐藏工作表存储辅助数据
* 性能优化技巧（批量更新、暂停重绘）

该方案适用于需要兼容 WPS Office 文件格式的企业应用场景，具有良好的扩展性，可以进一步支持更多 WPS 特有功能。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
