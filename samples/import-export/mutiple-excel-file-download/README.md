# Export and Package Multiple Excel Files as ZIP

This example demonstrates how to batch export multiple SpreadJS workbooks into separate Excel files and automatically package them into a single ZIP file for downloading—all in a single click. This solution is implemented entirely on the client side without needing backend server resources, making it suitable for business scenarios requiring the batch export of multiple independent workbooks.

---

## Core Scenarios & Solutions

In actual business applications, users often need to export multiple independent SpreadJS workbooks simultaneously (e.g., reports from different departments or multiple data analysis results). Exporting them one by one requires the user to click the download button repeatedly, which is tedious and inefficient. This example addresses this pain point by:

- Batch exporting multiple workbooks to separate Excel files with a single click.
- Packaging all files into a ZIP archive automatically.
- Processing purely on the frontend to avoid server-side overhead.
- Providing a streamlined user experience with minimal actions.

---

## Implementation Details

### 1. Initialize Workbook Instances

Create multiple independent SpreadJS workbook instances, each bound to a different DOM element:

```javascript
var spread1 = new GC.Spread.Sheets.Workbook(document.getElementById("ss1"));
spread1.getActiveSheet().setValue(0, 0, "spread1");
var spread2 = new GC.Spread.Sheets.Workbook(document.getElementById("ss2"));
spread2.getActiveSheet().setValue(0, 0, "spread2");
var spread3 = new GC.Spread.Sheets.Workbook(document.getElementById("ss3"));
spread3.getActiveSheet().setValue(0, 0, "spread3");

var spreads = [spread1, spread2, spread3];
```

The workbook instances are managed in the `spreads` array for convenient batch execution.

### 2. Zip Files on the Client Side

Use the `JSZip` library to create the ZIP container and add exported files:

```javascript
const zip = new JSZip();
if (!zip && spreads.length === 0) {
  return;
}

var fileName = "spread";
for (let i = 0; i < spreads.length; i++) {
  var spread = spreads[i];
  let file = "";
  spread.export(
    function (blob) {
      file = blob;
      // Add the exported Excel file to the ZIP container
      zip.file(fileName + (i + 1) + ".xlsx", file);
    },
    function (e) {
      console.log(e);
    },
  );
}
```

Each workbook calls the asynchronous `spread.export()` method to retrieve a file Blob, which is then added to the ZIP package via `zip.file()`.

### 3. Check for Async Completion

Because `spread.export()` runs asynchronously, we must wait for all exports to finish before zipping. A simple interval timer is used here:

```javascript
var intervalId = setInterval(function () {
  var files = zip.files;
  var len = 0;
  for (let file in files) {
    len++;
  }
  if (len === spreads.length) {
    // All files are exported, generate and download the ZIP file
    zip
      .generateAsync({
        type: "blob",
      })
      .then((content) => {
        saveAs(content, "spreads.zip");
      })
      .catch((err) => {
        console.log(err);
      });
    clearInterval(intervalId);
  }
}, 500);
```

The system checks the files in the ZIP package every 500 milliseconds. When the count matches the number of workbooks, it invokes `zip.generateAsync()` to generate the final ZIP Blob and triggers the download.

### 4. Trigger Download via FileSaver.js

The `saveAs()` method from FileSaver.js triggers the browser's download prompt:

```javascript
saveAs(content, "spreads.zip");
```

---

## Technology Stack

- **SpreadJS 19.0.3**: The core spreadsheet component.
- **@grapecity-software/spread-sheets-io 19.0.3**: Handles Excel import and export.
- **JSZip 3.1.5**: Client-side ZIP file generation.
- **FileSaver.js**: Client-side file downloading helper.
- **jQuery 3.6.1**: Simplifies DOM traversal and events.
- **SystemJS 0.19.22**: Module loader.

---

## How to Run

### Installation & Execution

```bash
# Install dependencies
npm install

# Open index.html directly in a browser
```

### Steps to Test

1. Upon opening the page, three independent SpreadJS workbooks will be displayed, each with its cell `A1` showing "spread1", "spread2", and "spread3" respectively.
2. Click the **Export Excel** button at the top of the page.
3. Wait about 1-2 seconds (depending on the amount of data). The browser will automatically download `spreads.zip`.
4. Extract the ZIP file to find three separate Excel files: `spread1.xlsx`, `spread2.xlsx`, and `spread3.xlsx`.

---

## Features & Recommendations

### Pros

- **Zero Server Overhead**: The conversion and packaging happen entirely on the client.
- **Improved Efficiency**: Users can download multiple files at once.
- **Simple Architecture**: Clean, straightforward code that is easy to extend for more worksheets.

### Limitations & Recommendations for Production

Using an interval polling timer to check for async completion has minor drawbacks:

- **Performance Overhead**: Polling every 500ms may lead to unnecessary checks.
- **No Direct Progress Tracking**: It is hard to report step-by-step progress to the user.
- **Error Propagation**: If a workbook fails to export, the system might poll indefinitely.

**Recommended Enhancements:**

1. **Use Promise wrappers**: Wrap the export callback in a Promise, allowing `Promise.all()` to orchestrate the asynchronous execution elegantly.
2. **Add a progress bar**: Display visual loading cues to keep the user informed.
3. **Robust error handling**: Implement catch blocks or timeout limits to handle potential export failures.
4. **Custom file naming**: Allow users to specify names for the exported Excel files and the ZIP package.
5. **Memory Management**: For extremely large workbooks or massive quantities of files, monitor memory usage and consider exporting in batches.

---

## Key Code Snippets

### Complete Batch Export Code

```javascript
$("#saveExcel").click(function () {
  const zip = new JSZip();
  if (!zip && spreads.length === 0) {
    return;
  }

  var fileName = "spread";
  // Iterate and export all workbooks
  for (let i = 0; i < spreads.length; i++) {
    var spread = spreads[i];
    let file = "";
    spread.export(
      function (blob) {
        file = blob;
        zip.file(fileName + (i + 1) + ".xlsx", file);
      },
      function (e) {
        console.log(e);
      },
    );
  }

  // Poll to check if all exports are complete
  var intervalId = setInterval(function () {
    var files = zip.files;
    var len = 0;
    for (let file in files) {
      len++;
    }
    if (len === spreads.length) {
      zip
        .generateAsync({
          type: "blob",
        })
        .then((content) => {
          saveAs(content, "spreads.zip");
        })
        .catch((err) => {
          console.log(err);
        });
      clearInterval(intervalId);
    }
  }, 500);
});
```

---
