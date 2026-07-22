# Import WPS Cell-Embedded Images into SpreadJS

This example demonstrates how to correctly import Excel files containing WPS cell-embedded images into SpreadJS. WPS Office uses a proprietary `DISPIMG` function to implement cell-embedded images, which differs from standard Excel floating shapes. By parsing the internal XML structures of the XLSX file, extracting the image resources, and converting the formulas to SpreadJS's native `image()` function, this solution provides complete support for importing WPS cell-embedded images.

---

## Core Scenarios & Solutions

- **WPS Format Compatibility**: WPS Office uses the `DISPIMG` function to store cell-embedded images. SpreadJS cannot recognize this function out-of-the-box during standard imports, resulting in missing images.
- **Image Data Extraction**: Extract image data by parsing `cellimages.xml` and relation files within the ZIP structure of the XLSX file, mapping image IDs to actual image files.
- **Formula Translation**: Convert WPS's `DISPIMG` function into SpreadJS's supported `image()` function to ensure images display correctly inside cells.

---

## Implementation Details

### 1. Parse XLSX File Structure

Use SheetJS (XLSX.js) and JSZip libraries to parse the internal structure of the Excel file:

```javascript
const arrayBuffer = await file.arrayBuffer();
const workbook = XLSX.read(arrayBuffer, { type: "array" });
const zip = await JSZip.loadAsync(arrayBuffer);
```

An XLSX file is essentially a ZIP compressed package containing XML files. WPS cell-embedded image definitions are stored in `xl/cellimages.xml`, and the actual image files are saved in the `xl/media/` directory.

### 2. Locate DISPIMG Function Cells

Traverse all cells in the workbook to identify those utilizing the `DISPIMG` function:

```javascript
function findDispImgCells(workbook) {
  const results = [];
  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const cellAddresses = Object.keys(worksheet);

    cellAddresses.forEach((address) => {
      if (!address.startsWith("!") && worksheet[address].f) {
        const formula = worksheet[address].f;
        const match = formula.match(/DISPIMG\(\"([^\"]+)\",\s*(\d)\)/i);

        if (match) {
          results.push({
            address: `${sheetName}!${address}`,
            id: match[1],
            displayMode: parseInt(match[2]),
          });
        }
      }
    });
  });
  return results;
}
```

This function extracts parameters like the image ID and display mode using regular expressions.

### 3. Build Image Mapping Relations

Parse relation files (`_rels/*.rels`) inside the XLSX file to map relation IDs (rId) to the Base64 image strings:

```javascript
async function buildImageIdMap(zip) {
  const imageMap = new Map();
  const relFiles = [];

  zip.forEach((relativePath, file) => {
    if (
      (relativePath.startsWith("xl/drawings/_rels/") &&
        relativePath.endsWith(".rels")) ||
      (relativePath.startsWith("xl/_rels/") &&
        relativePath.endsWith("cellimages.xml.rels"))
    ) {
      relFiles.push(file);
    }
  });

  for (const file of relFiles) {
    const xmlContent = await file.async("text");
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

    const relationships = xmlDoc.getElementsByTagName("Relationship");
    for (let i = 0; i < relationships.length; i++) {
      const rel = relationships[i];
      const id = rel.getAttribute("Id");
      const target = rel.getAttribute("Target");

      if (target) {
        let filename = target.replace("../media/", "").replace("media/", "");
        const imgFile = zip.file(`xl/media/${filename}`);
        if (imgFile) {
          const blob = await imgFile.async("blob");
          let base64 = await blobToBase64(blob, imgFile);
          imageMap.set(id, base64);
        }
      }
    }
  }
  return imageMap;
}
```

### 4. Parse cellimages.xml to Map rId to Image Name

```javascript
async function cellImageRid2Id(zip) {
  let rid2id = new Map();
  let cellImgXmlFile;

  zip.forEach((relativePath, file) => {
    if (relativePath.startsWith("xl/cellimages.xml")) {
      cellImgXmlFile = file;
    }
  });

  let xmlContent = await cellImgXmlFile.async("text");
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
  const xdrPics = xmlDoc.getElementsByTagName("xdr:pic");

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

### 5. Convert to SpreadJS Native image() Function

Save the Base64 image strings in a hidden worksheet, then replace `DISPIMG` formulas with the native `image()` formula pointing to the hidden sheet coordinates:

```javascript
spread.import(file, function () {
  let srcSheet = new GC.Spread.Sheets.Worksheet("srcSheet");
  spread.addSheet(0, srcSheet);
  srcSheet.visible(GC.Spread.Sheets.SheetTabVisible.veryHidden);

  // Store Base64 strings in the hidden worksheet
  let row = 0;
  rid2base64.forEach((base64, rid) => {
    srcSheet.setValue(row, 0, base64);
    let formula = GC.Spread.Sheets.CalcEngine.rangeToFormula(
      new GC.Spread.Sheets.Range(row, 0, 1, 1),
    );
    rid2id.get(rid).forEach((id) => {
      id2cell.set(id, "srcSheet!" + formula);
    });
    row++;
  });

  // Replace DISPIMG formulas with image() formulas
  spread.suspendPaint();
  dispImgCells.forEach((info) => {
    let sheetName = info.address.split("!")[0];
    let addr = info.address.split("!")[1];
    let sheet = spread.getSheetFromName(sheetName);
    let range = GC.Spread.Sheets.CalcEngine.formulaToRange(sheet, addr);
    sheet.setFormula(range.row, range.col, `image(${id2cell.get(info.id)})`);
  });
  spread.resumePaint();
});
```

---

## Technology Stack

- **SpreadJS 17.0.8**: Spreadsheet engine.
- **SpreadJS IO 17.0.8**: Handles Excel imports/exports.
- **JSZip 3.10.1**: ZIP compression parsing.
- **SheetJS (XLSX) 0.18.5**: Excel file format parser.
- **SystemJS 0.19.22**: JavaScript module loader.

---

## How to Run

### Installation & Execution

```bash
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Click the **Download Template** link to get a sample Excel file containing WPS cell-embedded images.
2. Click **Choose File** and select the downloaded XLSX file.
3. Click **Parse and Import**.
4. The spreadsheet will render in SpreadJS with all cell-embedded images correctly loaded.

---

## Features & Recommendations

### Pros

- **Complete Compatibility**: Accurately imports and restores cell-embedded images generated by WPS Office.
- **Optimized Performance**: Uses `suspendPaint()` and `resumePaint()` to bundle updates and prevent rendering lags.
- **Clean Structure**: Stores Base64 files in a hidden worksheet to avoid cluttering main sheets.
- **Multiple Formats**: Supports typical formats including PNG, JPEG, GIF, WebP, and BMP.

### Limitations & Recommendations for Production

- **Bundle Size**: Requires pulling in JSZip and SheetJS, which increases the client-side footprint.
- **Large Files**: Processing speeds may slow down when reading files with many embedded images.
- **Recommended Improvements**: Add loading indicator prompts for longer parsing runs, optimize cell mapping logic, or consider server-side preprocess scripts for very large files.

---

## Key Code Snippets

### Converting Image Blobs to Base64

```javascript
function blobToBase64(blob, imgFile) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const fileName = imgFile.name.toLowerCase();
    let mimeType = "image/png"; // Default to PNG

    if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
      mimeType = "image/jpeg";
    } else if (fileName.endsWith(".gif")) {
      mimeType = "image/gif";
    } else if (fileName.endsWith(".webp")) {
      mimeType = "image/webp";
    } else if (fileName.endsWith(".bmp")) {
      mimeType = "image/bmp";
    }

    reader.onload = () =>
      resolve(`data:${mimeType};base64,` + reader.result.split(",")[1]);
    reader.readAsDataURL(blob);
  });
}
```

---
