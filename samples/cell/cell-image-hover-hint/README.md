# Cell Image Hover Tooltip in SpreadJS

This example demonstrates how to implement a custom cell type in SpreadJS to display icons inside cells and show dynamic tooltips upon mouse hover. Two custom cell types are implemented: one renders a single warning icon on the right side of the cell value, and the other displays multiple icons side-by-side, supporting interactive tooltips revealing unique information for each individual icon.

---

## Core Scenarios & Solutions

- **Status Signaling**: Embed icons directly within table cells to signify alert levels or status marks.
- **Dynamic Tooltips**: Display interactive, floating info boxes when hovering the mouse cursor over cells, improving user context.
- **Independent Multi-Element Hits**: Support hit testing inside a single cell containing multiple icons, mapping a distinct tooltip string to each icon coordinate.
- **Extensible Cell Types**: Offers a structured template to design custom rendering and mouse interactions.

---

## Implementation Details

### 1. Configure Custom Cell Types

Inherit from SpreadJS's built-in CellTypes to design your custom types. This sample defines two formats:

```javascript
// WarningCellType - displays a single icon alongside text
var WarningCellType = function (icon) {
  this.icon = icon;
};
WarningCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();

// IconCellType - displays multiple icons with unique tooltips
var IconCellType = function (icon, count, infos) {
  this.icon = icon;
  this.count = count;
  this.Infos = infos;
};
IconCellType.prototype = new GC.Spread.Sheets.CellTypes.Base();
```

### 2. Custom Drawing (paint) Logic

Override the `paint` method to draw icons on the Canvas. WarningCellType places a single icon at the rightmost boundary of the cell area:

```javascript
WarningCellType.prototype.paint = function (
  ctx,
  value,
  x,
  y,
  w,
  h,
  style,
  context,
) {
  // Render text value first using parent's painter
  GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(
    this,
    ctx,
    value,
    x,
    y,
    w,
    h,
    style,
    context,
  );
  // Draw the icon on the right
  ctx.drawImage(this.icon, x + w - h + 3, y + 3, h - 6, h - 6);
};
```

IconCellType loops to draw multiple icons sequentially from right to left:

```javascript
IconCellType.prototype.paint = function (
  ctx,
  value,
  x,
  y,
  w,
  h,
  style,
  context,
) {
  GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(
    this,
    ctx,
    value,
    x,
    y,
    w,
    h,
    style,
    context,
  );
  // Draw multiple icons in a loop
  for (var i = 1; i <= this.count; i++) {
    ctx.drawImage(this.icon, x + w - (h - 3) * i, y + 3, h - 6, h - 6);
  }
};
```

### 3. Detect Hover Coordinates (Hit Testing)

Implement `getHitInfo` to calculate which icon the mouse cursor is currently hovering over:

```javascript
IconCellType.prototype.getHitInfo = function (
  x,
  y,
  cellStyle,
  cellRect,
  context,
) {
  // Calculate which icon index is clicked/hovered based on coordinates
  var index =
    x - (cellRect.x + cellRect.width - (cellRect.height - 3) * this.count) > 0
      ? Math.floor(
          (x -
            (cellRect.x +
              cellRect.width -
              (cellRect.height - 3) * this.count)) /
            (cellRect.height - 3),
        )
      : -1;
  return {
    x: x,
    y: y,
    row: context.row,
    col: context.col,
    cellStyle: cellStyle,
    cellRect: cellRect,
    sheetArea: context.sheetArea,
    reservedLocationIndex: index, // Custom attribute storing the targeted icon index
  };
};
```

### 4. Manage Tooltip Popups

Use `processMouseMove` and `processMouseLeave` to control the visibility and coordinates of the tooltip element:

```javascript
IconCellType.prototype.processMouseMove = function (hitinfo) {
  if (hitinfo.reservedLocationIndex >= 0) {
    if (this._toolTipElement) {
      // Update the existing tooltip element
      $(this._toolTipElement)
        .text(
          "move in " +
            hitinfo.reservedLocationIndex +
            " and Info is: " +
            this.Infos[hitinfo.reservedLocationIndex],
        )
        .css("top", hitinfo.y + 15)
        .css("left", hitinfo.x + 15);
    } else {
      // Create the tooltip container
      var div = document.createElement("div");
      $(div)
        .css("position", "absolute")
        .css("border", "1px #C0C0C0 solid")
        .css("box-shadow", "1px 2px 5px rgba(0,0,0,0.4)")
        .css("font", "9pt Arial")
        .css("background", "white")
        .css("padding", 5);

      this._toolTipElement = div;
      $(this._toolTipElement)
        .text("Cell [R:" + hitinfo.row + "] : [C:" + hitinfo.col + "]")
        .css("top", hitinfo.y + 15)
        .css("left", hitinfo.x + 15);
      $(this._toolTipElement).hide();
      document.body.insertBefore(this._toolTipElement, null);
      $(this._toolTipElement).show("fast");
    }
  } else {
    // Remove the tooltip when leaving the icon area
    if (this._toolTipElement) {
      document.body.removeChild(this._toolTipElement);
      this._toolTipElement = null;
    }
  }
};

IconCellType.prototype.processMouseLeave = function (hitinfo) {
  if (this._toolTipElement) {
    document.body.removeChild(this._toolTipElement);
    this._toolTipElement = null;
  }
};
```

### 5. Apply Cell Types

Configure Base64 image sources and map cell types:

```javascript
// Load image source (Base64 URL)
var img = new Image();
img.src = "data:image/png;base64,iVBORw0KGgo...";
img.onload = function () {
  sheet.repaint();
};

// Assign WarningCellType
sheet.getCell(1, 1).value(22).cellType(new WarningCellType(img)).hAlign(0);

// Assign IconCellType showing 3 icons, each mapped to a description string
sheet
  .getCell(2, 1)
  .cellType(new IconCellType(img, 3, ["First", "Second", "Third"]));
```

---

## Technology Stack

- **SpreadJS 19.0.3**: Core spreadsheet components.
- **jQuery 3.6.1**: DOM query and animation handlers.
- **TypeScript 4.1.2**: Typed configurations.
- **SystemJS**: Script module loader.

---

## How to Run

### Installation & Execution

```bash
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open the page in your browser. You will see two cells containing icons.
2. Cell `B2` displays the number 22 alongside a warning icon.
3. Cell `B3` contains three warning icons displayed side-by-side.
4. Move your mouse cursor over the individual icons inside cell `B3`.
5. Notice that the tooltip text updates dynamically showing "First", "Second", or "Third" depending on the icon index.
6. The tooltip closes automatically when the mouse leaves the icon area.

---

## Features & Recommendations

### Pros

- **Decoupled Extensions**: Extends native drawing cycles without affecting sheet operations.
- **Multi-Element Hit Testing**: Determines active target coordinates accurately inside a single cell.
- **Visual Styles**: Tooltip boxes are rendered as standard DOM components, allowing custom CSS styling and jQuery transitions.
- **Embeddable Images**: Utilizing Base64 urls removes external file fetch overhead.

### Recommendations for Production

- **Boundary Collision**: Currently, tooltips are positioned at fixed offsets relative to the cursor. Add viewport checks to reposition tooltips when they hit the screen edge.
- **Icon Sizing**: The icon size matches cell heights. Consider parameterizing icon dimensions.
- **HTML Tooltips**: Render rich HTML templates (such as status tables or icons) inside the popup instead of simple text.

---

## Summary

This case study shows how to implement custom cell types in SpreadJS. Key learning points:

1. Creating custom cell classes inheriting from standard classes.
2. Rendering image objects inside the sheet Canvas using `paint`.
3. Implementing click/hover hit-testing with `getHitInfo`.
4. Creating and positioning DOM overlays dynamically.
5. Handling asynchronous image loads and repainting.

This pattern is highly useful for status flags, data validations, workflow progress bars, and custom grid toolbars.
