# Integrate File Upload Buttons in SpreadJS Cells

This example demonstrates how to customize file upload functionality in SpreadJS by embedding button controls inside cells. This allows for user-friendly file selection and upload workflows. By wrapping a standard, hidden HTML file input element inside SpreadJS's button cell types, this solution seamlessly integrates file management into the spreadsheet layout.

---

## Core Scenarios & Solutions

- **UI Inconsistency**: Standard HTML `<input type="file">` controls do not blend naturally with spreadsheet grids. Integrating them inside cell buttons maintains UI consistency.
- **Inline Triggers**: Click actions directly inside the grid cells open the operating system's file browser without directing users to external panels.
- **Visual File Lists**: Selected file names are automatically written to adjacent cells, enabling a clear file management panel inside the sheet.
- **Separated Upload Control**: Offers independent "Choose" and "Upload" triggers so users can double-check file titles before pushing uploads to the server.

---

## Implementation Details

### 1. Configure Button Cell Types

Instantiate SpreadJS `CellTypes.Button` elements to serve as file selectors and upload submission triggers:

```javascript
var b1 = new GC.Spread.Sheets.CellTypes.Button();
b1.text("Choose File");
sheet.setCellType(3, 3, b1, GC.Spread.Sheets.SheetArea.viewport);
sheet.autoFitColumn(3);
sheet.autoFitRow(3);

var b2 = new GC.Spread.Sheets.CellTypes.Button();
b2.text("Upload");
sheet.setCellType(3, 4, b2, GC.Spread.Sheets.SheetArea.viewport);
sheet.autoFitColumn(4);
```

### 2. Handle Button Clicks

Bind a callback handler to the `ButtonClicked` event. Inspect the text of the button to determine whether to trigger the file browser window or the file upload request:

```javascript
spread.bind(GC.Spread.Sheets.Events.ButtonClicked, function (e, args) {
  var sheet = args.sheet,
    row = args.row,
    col = args.col;
  var cellType = sheet.getCellType(row, col);
  if (cellType instanceof GC.Spread.Sheets.CellTypes.Button) {
    if (cellType.text() === "Choose File") {
      $("#file").click(); // Click the hidden HTML input element
    }
    if (cellType.text() === "Upload") {
      alert("Upload started"); // Invoke upload logic here
    }
  }
});
```

### 3. Display Selected File Names

Listen to the file input's `change` event, parse the list of selected files, and write the file names into the sheet cells sequentially with thick borders:

```javascript
$("#file").change(function () {
  spread.suspendPaint(); // Suspend painting to optimize rendering speed
  var uploadFileArr = document.getElementById("file").files;
  for (var i = 0; i < uploadFileArr.length; i++) {
    sheet.setValue(3 + i, 2, uploadFileArr[i].name);
    sheet
      .getCell(3 + i, 2, GC.Spread.Sheets.SheetArea.viewport)
      .setBorder(
        new GC.Spread.Sheets.LineBorder(
          "black",
          GC.Spread.Sheets.LineStyle.thick,
        ),
        { all: true },
        3,
      );
  }
  sheet.autoFitColumn(2);
  spread.resumePaint(); // Resume painting
});
```

---

## User Interaction Flow

1. The user clicks the **Choose File** cell button.
2. The hidden `<input id="file" type="file">` element is programmatically clicked, opening the OS file chooser dialog.
3. The user selects one or more files and submits.
4. The list of file names is populated row-by-row starting at cell `C4`.
5. The user clicks the **Upload** cell button to send the selected files to the server.

---

## Technology Stack

- **SpreadJS 19.0.3**: The core spreadsheet engine.
- **jQuery 3.6.1**: Simplified DOM querying and event binding.
- **SystemJS 0.19.22**: JavaScript module loading.
- **TypeScript 4.1.2**: Script compile setups.

---

## How to Run

### Installation & Execution

```bash
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open the page in your browser. Cell `D4` renders a **Choose File** button, and cell `E4` renders an **Upload** button.
2. Click **Choose File** to open the system file chooser.
3. Select one or more files (multi-selection is supported).
4. The names of the chosen files will populate column `C`, starting at row `C4`.
5. Click **Upload** to trigger the upload logic (displays a test alert).

---

## Features & Recommendations

### Pros

- **Unified Interface**: Keeps the file upload interface styled consistently within the spreadsheet.
- **Enhanced UX**: Selecting files directly inside the grid is natural and intuitive.
- **Multi-File Support**: Handles multiple file selections and displays them row-by-row.
- **Optimized Performance**: Bundling writes within `suspendPaint()` and `resumePaint()` prevent grid lag during batch updates.

### Recommendations for Production

- **Implement FormData Uploads**: Replace the test alert with a real upload script (e.g. using `FormData` and AJAX requests).
- **Expand Metadata**: Display file sizes, types, and upload progress bars in adjacent columns.
- **File Deletion**: Add a delete button cell next to each file row to let users remove selected files.
- **Validation**: Implement file size limits and file format restrictions.

---

## Key Code Snippets

### Hidden File Input Element

```html
<input id="file" type="file" multiple="multiple" style="display:none" />
```

We hide the native file browser element using `display:none` and programmatically trigger it using jQuery's `click()` method, keeping the UI clean and unified.

---

## Summary

This case study shows how to link standard HTML elements with cell components. Key learning points:

1. Creating and configuring cell buttons.
2. Listening to button cell interactions via `ButtonClicked` events.
3. Mapping HTML file input values to spreadsheet cell coordinates.
4. Managing performance using paint suspension blocks.

This architecture is useful for uploading bulk records, managing spreadsheet attachments, and submitting form logs with related file documents.
