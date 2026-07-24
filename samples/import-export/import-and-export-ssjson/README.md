# Import and Export SSJSON in SpreadJS

This example demonstrates how to implement the import and export of SSJSON files in SpreadJS. SSJSON is the native JSON serialization format of SpreadJS, containing the complete state information of a workbook (data, styles, formulas, configuration settings, etc.). This example provides a clean interface that allows users to load a local `.ssjson` file into the spreadsheet via a file picker or export the current workbook state as a `.ssjson` file for local download.

---

## Core Scenarios & Solutions

- **Local Data Persistence**: Save SpreadJS workbook states directly to local storage.
- **Complete State Restoration**: Preserve and restore the entire workbook state (including values, formatting, conditional styles, and formulas).
- **Lightweight Data Exchange**: Utilize a plain-text JSON structure to exchange spreadsheet data across different environments or platforms.

---

## Implementation Details

### 1. Import SSJSON Files

Read the selected file using the HTML5 File Reader API as plain text, parse it to a JSON object, and restore the workbook using SpreadJS's `fromJSON()` method:

```javascript
function loadSsjson() {
  let file = document.getElementById("fileDemo").files[0];
  let reader = new FileReader();
  reader.readAsText(file, "UTF-8");
  reader.onload = function (e) {
    let fileStr = e.target.result;
    let jsonObj = JSON.parse(fileStr);
    spread.fromJSON(jsonObj);
  };
}
```

### 2. Export SSJSON Files

Serialize the current workbook state using `toJSON()`, convert the JSON object to a string, wrap it inside a Blob, and trigger a browser download programmatically via a dynamic `<a>` tag:

```javascript
function exportSsjon() {
  let fileJson = JSON.stringify(spread.toJSON());
  let eleLink = document.createElement("a");
  eleLink.download = "test.ssjson";
  eleLink.style.display = "none";
  // Convert string to Blob object
  let blob = new Blob([fileJson]);
  eleLink.href = URL.createObjectURL(blob);
  document.body.appendChild(eleLink);
  // Trigger download click
  eleLink.click();
  // Remove element
  document.body.removeChild(eleLink);
}
```

---

## Technology Stack

- **SpreadJS 19.0.3**: The core spreadsheet engine.
- **SystemJS 0.19.22**: JavaScript module loading framework.
- **TypeScript 4.1.2**: Scripting language support.

---

## How to Run

### Installation & Execution

```bash
npm install
# Open index.html using a local development server (e.g. Live Server)
```

### Steps to Test

1. Launch the application in your browser. An empty spreadsheet along with a file input picker, an import button, and an export button will be shown.
2. **Import**: Click **Choose File** (or "选择文件"), select any valid `.ssjson` file, and click **Import SSJSON** to load it into the worksheet.
3. **Export**: Modify cells in the sheet, click **Export SSJSON**, and verify that the browser automatically downloads `test.ssjson`.

---

## Features & Recommendations

### Pros

- **Extremely Lightweight**: Built with less than 40 lines of core code.
- **Native Implementation**: Relies solely on native SpreadJS serialization APIs without additional dependencies.
- **Lossless Save**: Retains all formatting, charts, styles, and configurations.
- **Developer Friendly**: Structured as plain-text JSON, facilitating easy debugging and version control.

### Limitations & Recommendations for Production

- **Error Handling**: Missing validation steps for malformed JSON formats or corrupted files. Add `try-catch` structures around JSON parsing.
- **Hard-coded Filenames**: The download filename is fixed to `test.ssjson`. Update the export logic to prompt for or dynamically generate a filename.
- **Extended Features**: Scale the solution to support drag-and-drop file uploads and batch file export actions.

---

## Summary

This case study shows how to perform native serialization tasks in SpreadJS. Key takeaways:

1. Mastering SpreadJS serialization APIs: `toJSON()` and `fromJSON()`.
2. Handling files in the browser via HTML5 File Reader APIs.
3. Triggering programmatic file downloads using Blobs and `URL.createObjectURL`.
4. Integrating standard SystemJS module loaders.

This approach is highly useful for client-side document saves, workspace recovery states, and exporting data in lightweight text formats.
