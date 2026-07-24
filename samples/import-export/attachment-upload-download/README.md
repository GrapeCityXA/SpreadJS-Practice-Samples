# SpreadJS Attachment Upload and Export

This example demonstrates how to implement attachment management in a SpreadJS worksheet, including uploading attachments to cells, downloading cell attachments, clearing attachments, and exporting the workbook along with all attachments as a ZIP file. This functionality is achieved through custom commands, cell tags, and hyperlink mechanisms. It is suitable for business scenarios that require associating external files with spreadsheet data, such as contract management and expense reports.

---

## Core Scenarios & Solutions

- **Associate Attachments with Cells**: Store file references inside cell Tags, enabling data-related file management.
- **Visualized Attachment Operations**: Render attachments as hyperlinks, allowing users to click and download directly.
- **Batch Export**: Pack the workbook and all associated attachments into a single ZIP file for archiving and distribution.
- **Attachment Lifecycle Management**: Support full operations including uploading, downloading, and deleting attachments.

---

## Implementation Details

### 1. Store Attachment Metadata Using Tag

Bind the attachment file object and metadata to the cell using the cell's `tag` property:

```javascript
sheet.setTag(row, col, {
  type: hyerlinkType, // Identifies this cell as an attachment type
  fileInfo: file, // Stores the file object (in a real-world project, this should be the file path on the server)
});
```

### 2. Implement Operations via Custom Commands

Register custom commands to handle downloading and removing attachments:

```javascript
// Register download attachment command
spread.commandManager().register("downloadAttachFile", {
  canUndo: false,
  execute: function (context, options, isUndo) {
    let sheet = context.getActiveSheet();
    let row = sheet.getActiveRowIndex();
    let col = sheet.getActiveColumnIndex();
    let cellTag = sheet.getTag(row, col);
    if (cellTag && cellTag.type == hyerlinkType) {
      saveAs(cellTag.fileInfo, cellTag.fileInfo.name);
    }
  },
});

// Register remove attachment command
spread.commandManager().register("removeAttachFile", {
  canUndo: false,
  execute: function (context, options, isUndo) {
    let { sheet, row, col } = options;
    let cellTag = sheet.getTag(row, col);
    if (cellTag && cellTag.type == hyerlinkType) {
      sheet.clear(
        row,
        col,
        1,
        1,
        GC.Spread.Sheets.SheetArea.viewport,
        GC.Spread.Sheets.StorageType.data | GC.Spread.Sheets.StorageType.tag,
      );
      sheet.refresh();
    }
  },
});
```

### 3. Bind Hyperlinks to Custom Commands

Style the cell as a hyperlink and bind it to the download command:

```javascript
sheet.setHyperlink(
  row,
  col,
  {
    url: file.name,
    linkColor: "#0066cc",
    visitedLinkColor: "#3399ff",
    drawUnderline: true,
    command: "downloadAttachFile", // Bind the custom command
  },
  GC.Spread.Sheets.SheetArea.viewport,
);
```

### 4. Pack Workbook and Attachments

Iterate through all worksheets and cells to collect attachments using the `JSZip` library, and pack them together with the exported Excel workbook:

```javascript
function loadAllFiles() {
  let zip = new JSZip();
  let sheetCount = spread.getSheetCount();

  // Traverse sheets and cells to collect attachments
  for (let i = 0; i < sheetCount; i++) {
    let sheet = spread.getSheet(i);
    let rowCount = sheet.getRowCount();
    let colCount = sheet.getColumnCount();
    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < colCount; col++) {
        let cellTag = sheet.getTag(row, col);
        if (
          sheet.getHyperlink(row, col) &&
          cellTag &&
          cellTag.type == hyerlinkType
        ) {
          zip.file("name.jpg", cellTag.fileInfo, { binary: true });
        }
      }
    }
  }

  // Export workbook and add to ZIP
  spread.export(function (blob) {
    zip.file("MainWorkbook.xlsx", blob, { binary: true });
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "download.zip");
    });
  });
}
```

---

## User Interaction Flow

1. Click the **Upload Attachment** button.
2. Select a file in the file dialog and click submit.
3. The active cell displays the file name styled as a hyperlink.
4. Click the hyperlink to download the attachment.
5. Select the cell and click the **Clear Attachment** button to delete it.
6. Click the **Pack & Download** button to export the workbook and all attachments as a ZIP file.

---

## Technology Stack

- **SpreadJS 19.0.3**: Core spreadsheet component.
- **SpreadJS IO 16.2.0**: Excel import and export features.
- **JSZip 3.10.0**: ZIP file generation.
- **FileSaver 2.0.5**: File saving functionality.
- **SystemJS 0.19.22**: Module loader.

---

## How to Run

### Installation & Execution

```bash
npm install
# Open index.html directly in a browser
```

### Steps to Test

1. Click any cell in the sheet to make it active.
2. Click **Upload Attachment** and choose a file from your system.
3. Click **Submit**. The file name will be written into the cell as a hyperlink.
4. Click the hyperlink to download the file.
5. Select the cell with the attachment and click **Clear Attachment** to remove it.
6. Click **Pack & Download** to download the package (`download.zip`) containing the spreadsheet and attachments.

---

## Key Features & Suggestions

### Pros

- **Intuitive Management**: Visualized attachment links improve user experience.
- **Extensible Design**: Based on cell tags and custom commands, making it easy to add more functions.
- **Complete Export Solution**: Bundling spreadsheet and documents meets compliance and archiving needs.
- **Decoupled Commands**: Leveraging command managers ensures cleaner, more maintainable code.

### Limitations & Recommendations for Production

As a pure client-side demo, file objects are stored temporarily in memory. For production applications:

- **File Uploading**: Upload files to a dedicated file server (e.g., OSS/S3). The cell Tag `fileInfo` should store the file's URL path instead of a JavaScript `File` object.
- **File Downloading**: Fetch files via HTTP GET requests returning Blobs, rather than referencing client-side File objects directly.
- **File Deletion**: Ensure deleting a file in the worksheet triggers a server-side cleanup API to prevent orphaned files.
- **Handling Filename Conflicts**: Use unique identifiers (e.g., UUIDs or timestamps) for files inside the ZIP package to prevent duplicate name overwriting.

---

## Key Code Snippets

### Attachment Upload Logic

```javascript
function hasAttachFile(sheet, row, col, file) {
  sheet.setValue(row, col, file.name);
  sheet.setTag(row, col, {
    type: hyerlinkType,
    fileInfo: file, // In production, save the file server path here
  });
  sheet.setHyperlink(
    row,
    col,
    {
      url: file.name,
      linkColor: "#0066cc",
      visitedLinkColor: "#3399ff",
      drawUnderline: true,
      command: "downloadAttachFile",
    },
    GC.Spread.Sheets.SheetArea.viewport,
  );
}
```

### Save and Load Workbook State

```javascript
// Save workbook structure to memory
document.getElementById("fileSaver").onclick = function () {
  submitFile = spread.toJSON();
  spread.clearSheets();
  spread.addSheet(0);
};

// Load workbook structure from memory
document.getElementById("loadSubmitFile").onclick = function () {
  spread.fromJSON(submitFile);
};
```

---
