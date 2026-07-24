# Add Hover Tooltips to Cell Buttons in SpreadJS

This example demonstrates how to add mouse hover tooltip functionality to SpreadJS cell buttons. By extending the default `CellType`, it displays a helpful tooltip whenever the mouse pointer hovers over a cell button, and changes the cursor style to a pointer, creating a more intuitive user interaction flow.

---

## Core Scenarios & Solutions

Although SpreadJS's native cell button features are highly customizable, they lack built-in hover tooltips. Consequently, users cannot immediately identify what each button does. This example solves this issue by extending `CellType` to:

- Add custom hover tooltip text to cell buttons.
- Display a floating tooltip box automatically upon hover.
- Hide the tooltip box and reset the mouse cursor when the mouse leaves the button boundaries.
- Support configuring unique tooltip descriptions for multiple buttons in the same cell.

---

## Implementation Details

### 1. Extend the Cell Type

Inherit from `GC.Spread.Sheets.CellTypes.Text` to create a custom cell type `hoverCellType`, overriding `processMouseMove` and `processMouseLeave` to manage tooltip visibility:

```javascript
function hoverCellType() {}
hoverCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();

hoverCellType.prototype.processMouseMove = function (hitInfo) {
  if (!hitInfo.cellButtonHitInfo?.buttonConfig?.hoverText) {
    if (this._toolTipElement) {
      this._toolTipElement.style.display = "none";
    }
    return;
  }
  // Get host spreadsheet offset container position
  let containerPosition = {
    left: hitInfo.sheet.getParent().getHost().getBoundingClientRect().left,
    top: hitInfo.sheet.getParent().getHost().getBoundingClientRect().top,
  };
  let hoverText = hitInfo.cellButtonHitInfo.buttonConfig.hoverText;

  // Create or position the tooltip box
  if (this._toolTipElement) {
    this._toolTipElement.innerText = hoverText;
    this._toolTipElement.style.top =
      hitInfo.y + containerPosition.top - 40 + "px";
    this._toolTipElement.style.left =
      hitInfo.x + containerPosition.left - 30 + "px";
    this._toolTipElement.style.display = "block";
  } else {
    let div = document.createElement("div");
    div.style.position = "absolute";
    div.style.border = "1px #C0C0C0 solid";
    div.style.boxShadow = "1px 2px 5px rgba(0,0,0,0.4)";
    div.style.font = "9pt Arial";
    div.style.background = "white";
    div.style.padding = "5px";

    this._toolTipElement = div;
    this._toolTipElement.innerText = hoverText;
    document.body.insertBefore(this._toolTipElement, null);
    this._toolTipElement.style.display = "block";
  }
  changeCursor(true);
};
```

Override `processMouseLeave` to clean up the cursor and tooltip element when leaving the cell area:

```javascript
hoverCellType.prototype.processMouseLeave = function (hitInfo) {
  if (this._toolTipElement) {
    this._toolTipElement.style.display = "none";
  }
  changeCursor(false);
};
```

### 2. Switch Mouse Cursor Styles

Query the canvas element representing the spreadsheet viewport to dynamically toggle the `pointer` class:

```javascript
function changeCursor(type = false) {
  let canvas = document.querySelector(
    "canvas[gcuielement='gcWorksheetCanvas']",
  );
  if (canvas) {
    if (type) {
      canvas.classList.add("pointer");
    } else {
      canvas.classList.remove("pointer");
    }
  }
}
```

Define the CSS rule in your stylesheet:

```css
.pointer {
  cursor: pointer !important;
}
```

### 3. Define and Apply Button Mappings

Add a `hoverText` property to each button configuration object and apply them using styles:

```javascript
let cellButtons = [
  {
    imageType: GC.Spread.Sheets.ButtonImageType.custom,
    hoverText: "Delete",
    imageSrc: del,
    command: (sheet, row, col, option) => {
      alert("Delete clicked");
    },
  },
  {
    imageType: GC.Spread.Sheets.ButtonImageType.custom,
    hoverText: "Move Up",
    imageSrc: moveup,
    command: (sheet, row, col, option) => {
      alert("Move Up clicked");
    },
  },
  {
    imageType: GC.Spread.Sheets.ButtonImageType.custom,
    hoverText: "Move Down",
    imageSrc: movedown,
    command: (sheet, row, col, option) => {
      alert("Move Down clicked");
    },
  },
];

function setCellButtons(sheet, row, col, cellButtons) {
  let style = new GC.Spread.Sheets.Style();
  style.cellButtons = cellButtons;
  sheet.setStyle(row, col, style);
  sheet.setCellType(row, col, new hoverCellType());
}

setCellButtons(spread.getActiveSheet(), 1, 1, cellButtons);
```

---

## Technology Stack

- **SpreadJS 16.0.1**: Core spreadsheet library.
- **SystemJS 0.19.22**: JavaScript module loading framework.
- **TypeScript 4.1.2**: Script compile tools.

---

## How to Run

### Installation & Execution

```bash
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open the page in your browser. You will see three custom buttons inside cell `B2` (row index 1, column index 1).
2. Hover your mouse over any of the buttons. The matching tooltip message will pop up.
3. Observe that the mouse cursor updates to a pointer finger style when hovering over the button graphics.
4. Click any button to trigger its associated command event (e.g. an alert pop-up).

---

## Features & Recommendations

### Pros

- **User-friendly UX**: Clear tooltip indicators reveal what each action triggers before a user clicks.
- **Lightweight Structure**: Easily plugs in by subclassing standard CellTypes.
- **Multi-Button Support**: Independently displays unique hover messages for several buttons in the same grid.
- **Customizable**: The floating DIV style is fully customizable using standard CSS rules.

### Recommendations for Production

- **Debounce Tooltips**: Introduce a short timer delay (e.g., 200ms) before rendering tooltips to prevent erratic flashing when users move the mouse pointer quickly across cells.
- **Edge Collision Control**: Check viewport boundaries to adjust the tooltip coordinates automatically, avoiding cutting off tooltips near screen borders.
- **Rich Content**: Support HTML formatting inside the tooltip string for complex instructions or previews.

---

## Summary

This case study shows how to implement hover actions by subclassing standard components. Key learning points:

1. Extending and modifying standard `CellType` classes.
2. Hooking mouse callback events (`processMouseMove` and `processMouseLeave`).
3. Appending and styling elements dynamically inside the DOM.
4. Changing mouse styles using CSS toggles.

This pattern is highly useful for spreadsheets containing interactive inline action icons, such as database record selectors, file download controls, or row rearrangement scripts.
