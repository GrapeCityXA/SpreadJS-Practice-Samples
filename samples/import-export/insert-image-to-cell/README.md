# Insert Images into Specific Cells in SpreadJS

This example demonstrates how to load image files from a local file system and insert them into designated cell coordinates in SpreadJS. When a user selects an image using the HTML file input, the script retrieves the current active cell coordinates and places the image at the calculated pixel location.

This solution is suitable for reports, data dashboards, catalog listings, and applications requiring dynamic image inserts.

---

## Core Scenarios & Solutions

- **Local Image Loading**: Provides a straightforward method for users to select local images and display them inside spreadsheets.
- **Dynamic Coordinates**: Automatically calculates screen offset coordinates based on the selected cell's row, column index, width, and height.
- **Asynchronous File Handling**: Employs the HTML5 FileReader API to parse files asynchronously, preventing UI lockups.

---

## Implementation Details

### 1. Read Local Images Using FileReader

Utilize the HTML5 `FileReader` API to load local image bytes asynchronously and convert them to a Base64 Data URL payload:

```javascript
file = document.getElementById("fileDemo").files[0];
reader = new FileReader();
// Read file contents as a Base64-encoded URL
reader.readAsDataURL(file);
// Trigger insertion callback once loading succeeds
reader.onload = function () {
  timestamp = Date.parse(new Date());
  picture = sheet.pictures.add(
    timestamp.toString(),
    this.result,
    startCol * colWidth,
    startRow * rowHeight,
  );
};
```

### 2. Calculate Cell Screen Offsets

Retrieve the active cell's row index, column index, and cell dimensions to determine the pixel offsets:

```javascript
startRow = sheet.getActiveRowIndex();
startCol = sheet.getActiveColumnIndex();
rowHeight = sheet.getRowHeight();
colWidth = sheet.getColumnWidth();
```

The top-left coordinates of the image are calculated using `startCol * colWidth` and `startRow * rowHeight`.

### 3. Add Pictures to the Sheet

Call the SpreadJS `pictures.add()` API to insert the Base64 image payload into the sheet workspace:

```javascript
picture = sheet.pictures.add(
  timestamp.toString(), // Unique ID for the picture instance
  this.result, // Base64 image data payload
  startCol * colWidth, // X coordinate offset (pixels)
  startRow * rowHeight, // Y coordinate offset (pixels)
);
```

---

## Technology Stack

- **SpreadJS 19.0.3**: Core spreadsheet components.
- **SystemJS 0.19.22**: JavaScript module loading.
- **TypeScript 4.1.2**: Project compilation configurations.
- **FileReader API**: Native HTML5 file reader.

---

## How to Run

### Installation & Execution

```bash
# Install dependencies
npm install

# Run using a local development server
npx http-server
```

Open `index.html` in your browser.

### Steps to Test

1. Open the page in your browser.
2. Click any cell inside the worksheet to select it.
3. Click the **Choose File** button at the top.
4. Select an image file (e.g. JPG, PNG, GIF).
5. The selected image will automatically insert at the selected cell coordinate.

---

## Features & Recommendations

### Pros

- **Straightforward Interaction**: Selecting a file instantly inserts it, requiring no complex configurations.
- **Context-aware Positioning**: Placing images at the active cell matches standard spreadsheet behaviors.
- **Async Operations**: File parsing does not block main rendering cycles.
- **Avoid ID Collisions**: Utilizing timestamps for image IDs prevents naming conflicts.

### Recommendations for Production

- **Static Dimensions**: The image keeps its original size. Update the logic to scale images to fit cell dimensions (e.g., matching row height and column width).
- **No File Type Checks**: Add validation checks on the file input to reject non-image file formats or files exceeding size thresholds.
- **Error Handling**: Implement try-catch blocks to catch file loading failures and show descriptions to the user.
- **Batch Processing**: Extend the script to accept multiple file selections and distribute them across adjacent rows.

---

## Key Code Snippets

### Full Image Insertion Logic

```javascript
let startRow, startCol, rowHeight, colWidth, file, reader, timestamp;

function addPic() {
  // Get active cell coordinates
  startRow = sheet.getActiveRowIndex();
  startCol = sheet.getActiveColumnIndex();

  // Retrieve cell dimensions
  rowHeight = sheet.getRowHeight();
  colWidth = sheet.getColumnWidth();

  // Fetch the selected file reference
  file = document.getElementById("fileDemo").files[0];
  reader = new FileReader();

  // Read the file as a Base64 string
  reader.readAsDataURL(file);

  // On load, add the image to the sheet
  reader.onload = function () {
    timestamp = Date.parse(new Date());
    picture = sheet.pictures.add(
      timestamp.toString(),
      this.result,
      startCol * colWidth,
      startRow * rowHeight,
    );
  };
}

// Bind to file input changes
document.getElementById("fileDemo").addEventListener("change", addPic);
```

---

## Summary

This case study shows how to insert images dynamically in SpreadJS. Key takeaways:

1. Initializing and parsing local files with the `FileReader` API.
2. Accessing row and column indices and sheet dimensions.
3. Drawing images on the workspace using the `sheet.pictures.add()` API.
4. Working with file change listener triggers.

This pattern is highly useful for product catalogs, employee directories, barcode listings, and invoice templates.
