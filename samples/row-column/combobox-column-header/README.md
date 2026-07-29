# Custom Column Header Dropdowns in SpreadJS

This example demonstrates how to implement a custom dropdown menu inside the column header area in SpreadJS. By inheriting from the `ColumnHeader` cell type and overriding its core lifecycle methods, we embed an interactive dropdown selector within column header cells. Users can click a dropdown icon on the right side of the column header cell to choose different options.

This functionality is suitable for scenarios where users need to filter columns, switch views, or set column-level configurations directly from the column headers.

---

## Core Scenarios & Solutions

- **Interactive Headers**: Standard column headers only display static text. This example embeds interactive UI components inside header cells.
- **Custom Rendering & Event Handling**: Defines how to draw custom icons using Canvas and capture clicks inside specific coordinates of the column header.
- **State Preservation**: Uses SpreadJS's cell Tag metadata mechanism to store and retrieve selected values.
- **Reusable Cell Types**: Creates a reusable cell type that can be easily applied to multiple columns.

---

## Implementation Details

### 1. Define the Custom Header Cell Type

Inherit from `GC.Spread.Sheets.CellTypes.ColumnHeader` to create `DropdownHeaderCellType`, defining default options and button dimensions:

```javascript
function DrowdownHeaderCellType() {
  this.BUTTON_WIDTH = 17;
  this.ITEMS = [
    {
      text: "text1",
      value: "value1",
    },
    {
      text: "text2",
      value: "value2",
    },
    {
      text: "text3",
      value: "value3",
    },
    {
      text: "text4",
      value: "value4",
    },
  ];
  GC.Spread.Sheets.CellTypes.ColumnHeader.apply(this);
}
DrowdownHeaderCellType.prototype =
  new GC.Spread.Sheets.CellTypes.ColumnHeader();
```

### 2. Paint the Dropdown Icon

Override the `paint` method to draw a triangle dropdown arrow on the right side of the cell header:

```javascript
DrowdownHeaderCellType.prototype.paint = function (
  ctx,
  value,
  x,
  y,
  w,
  h,
  style,
  context,
) {
  GC.Spread.Sheets.CellTypes.ColumnHeader.prototype.paint.apply(
    this,
    arguments,
  );
  var btnWidth = this.BUTTON_WIDTH;
  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.fillStyle = "black";
  ctx.moveTo(x + w - btnWidth + 3, y + (h - 2) / 2 - 2.5);
  ctx.lineTo(x + w - btnWidth + 6, y + (h - 2) / 2 + 3.5);
  ctx.lineTo(x + w - btnWidth + 9, y + (h - 2) / 2 - 2.5);
  ctx.fill();
  ctx.restore();
};
```

This method first renders the default column header background and text, and then uses the HTML Canvas API to draw a downward arrow.

### 3. Establish the Click Target Area

Override `getHitInfo` to determine if a click coordinate falls within the dropdown button's bounding box:

```javascript
DrowdownHeaderCellType.prototype.getHitInfo = function (
  x,
  y,
  cellStyle,
  cellRect,
  context,
) {
  var x2 = cellRect.x + cellRect.width;
  var sheetArea = context.sheetArea,
    sheet = context.sheet;
  var info = {
    x: x,
    y: y,
    row: context.row,
    col: context.col,
    cellStyle: cellStyle,
    cellRect: cellRect,
    sheetArea: sheetArea,
    sheet: sheet,
  };

  if (x2 - this.BUTTON_WIDTH <= x && x < x2) {
    info.isReservedLocation = true; // Mark click area as reserved
  }
  return info;
};
```

If the mouse click is within 17 pixels of the right edge of the cell, `isReservedLocation` is set to `true`, indicating a click on the dropdown button.

### 4. Capture Click Events

Override `processMouseUp` to open the dropdown menu when a user clicks the button area:

```javascript
DrowdownHeaderCellType.prototype.processMouseUp = function (hitInfo) {
  if (hitInfo.isReservedLocation) {
    var sheet = hitInfo.sheet;
    var tag = sheet.getTag(hitInfo.row, hitInfo.col, hitInfo.sheetArea);
    if (!tag) {
      tag = {
        dropDown: {
          items: undefined,
          value: undefined,
        },
      };
    }
    var host = sheet.getParent().getHost();
    var offset = {
      top: host.offsetTop,
      left: host.offsetLeft,
    };
    this._showDropdown(
      host,
      offset,
      hitInfo.cellRect,
      tag.dropDown.items || this.ITEMS,
      tag.dropDown.value,
      hitInfo,
    );
  }
};
```

This method retrieves custom parameters from the cell's Tag metadata and triggers the dropdown menu renderer.

### 5. Render the Dropdown Selector Dynamically

The `_showDropdown` method dynamically injects an HTML `<select>` element and positions it over the active column header cell:

```javascript
DrowdownHeaderCellType.prototype._showDropdown = function (
  host,
  offset,
  cellRect,
  items,
  value,
  hitInfo,
) {
  if (!this._dropdownElement) {
    var span = document.createElement("div");
    span.style.position = "absolute";
    span.style.background = "#EEEEEE";
    span.style.border = "1px solid black";
    span.style.fontSize = "14px";
    host.insertBefore(span, null);
    this._dropdownElement = span;

    var mySelect = document.createElement("select");
    mySelect.id = "mySelect";
    mySelect.style.width = cellRect.width + "px";
    mySelect.style.height = cellRect.height + "px";
    for (var i = 0; i < items.length; i++) {
      mySelect.options.add(new Option(items[i].text, items[i].value));
    }
    if (value) {
      mySelect.value = value;
    }
    span.appendChild(mySelect);

    var self = this;
    mySelect.focus();
    mySelect.addEventListener("blur", function () {
      self._closeDropdown(host);
    });
    mySelect.addEventListener("change", function () {
      console.log(this.value);
      self._setTagValue(this.value, hitInfo);
    });
  }
  var tipElement = this._dropdownElement;
  var spanStyle = tipElement.style;
  spanStyle.top = offset.top + cellRect.y + "px";
  spanStyle.left = offset.left + cellRect.x + "px";
  spanStyle.width = cellRect.width + "px";
  spanStyle.height = cellRect.height + "px";
};
```

The dropdown hides automatically when it loses focus (`blur`). When a user selects a value (`change`), `_setTagValue` saves the new selection to the cell's Tag metadata.

### 6. Store Selections in Metadata

Store dropdown values and configurations in the column header cell's Tag metadata:

```javascript
sheet.getCell(0, 1, GC.Spread.Sheets.SheetArea.colHeader).tag({
  dropDown: {
    items: undefined, // Custom options (uses default ITEMS if undefined)
    value: "value3", // Default selected option
  },
});
```

---

## Technology Stack

- **SpreadJS 15.2.0**: Core spreadsheet components.
- **SystemJS 0.19.22**: JavaScript module loading.
- **TypeScript 4.1.2**: Script build compiler configurations.

---

## How to Run

### Installation & Execution

```bash
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open the page in your browser. You will see a dropdown arrow inside the header cell of column B.
2. Click the dropdown arrow to open the selection menu.
3. Select an option (e.g. text1, text2, text3, text4).
4. The dropdown closes automatically, saving your selection to the header cell's Tag metadata.
5. Open your browser console to inspect the selected value output.

---

## Features & Recommendations

### Pros

- **Interactive Headers**: Extends default column header functionality to support custom HTML overlays.
- **Clean Architecture**: Storing values in cell Tag metadata separates spreadsheet state from view logic.
- **Reusable Code**: Inherits from `ColumnHeader` to reuse built-in styling, keeping the codebase clean.
- **Responsive Layout**: Automatically aligns the dropdown menu to match changing column dimensions and positions.

### Recommendations for Production

- **Styling**: The native HTML `<select>` element has limited styling options. Replace it with custom dropdown elements from frameworks like Ant Design, Element UI, or React Select.
- **Dynamic Options**: Fetch and populate dropdown options asynchronously from backend endpoints instead of using hardcoded lists.
- **Trigger Actions**: Listen to change events to trigger actions like filtering grid data or updating calculations when a header value changes.

---

## Key Code Snippets

### Save Selected Values to Tag Metadata

```javascript
DrowdownHeaderCellType.prototype._setTagValue = function (value, hitInfo) {
  var sheet = hitInfo.sheet;
  var tag = sheet.getTag(hitInfo.row, hitInfo.col, hitInfo.sheetArea);
  if (!tag) {
    tag = {
      dropDown: {
        items: undefined,
        value: undefined,
      },
    };
  }
  if (!tag.dropDown) {
    tag.dropDown = {};
  }
  tag.dropDown.value = value;
  sheet.setTag(hitInfo.row, hitInfo.col, tag, hitInfo.sheetArea);
};
```

### Close the Dropdown Menu

```javascript
DrowdownHeaderCellType.prototype._closeDropdown = function (host) {
  if (this._dropdownElement) {
    try {
      host.removeChild(this._dropdownElement);
    } catch {}
    this._dropdownElement = undefined;
  }
};
```

This removes the dropdown element from the DOM and clears variables to ensure it is rebuilt correctly on the next click.

---

## Summary

This case study shows how to build custom cell types in SpreadJS by inheriting from `ColumnHeader` and overriding core lifecycle methods like `paint`, `getHitInfo`, and `processMouseUp`. Key takeaways:

1. Creating custom header cell types.
2. Painting custom elements using the Canvas API.
3. Detecting mouse clicks inside precise coordinates.
4. Managing cell state using Tag metadata.
5. Creating and positioning HTML elements dynamically.

This approach is highly useful for column sorting configurations, fast grid filtering, and layout controls.
