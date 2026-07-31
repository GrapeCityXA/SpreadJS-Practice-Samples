# Render a Pixel-Art Super Mario in SpreadJS

This example demonstrates how to create pixel art using SpreadJS's cell background color features. By treating each spreadsheet cell as a single pixel and applying background colors, we draw the classic Super Mario character. The cells are colored sequentially using an animation timer, creating a drawing effect.

This solution illustrates a creative use case for SpreadJS, which can be applied to data visualizations, retro games, and educational visual art.

---

## Core Scenarios & Solutions

- **Grid Pixel Art**: Re-purposes a standard spreadsheet grid as a canvas of color blocks.
- **Rendering Animations**: Uses a timer delay to render cells one by one, creating a drawing animation.
- **Creative Visuals**: Expands on standard spreadsheet usage to show the flexibility of the styling APIs.

---

## Implementation Details

### 1. Initialize the Sheet Canvas

Resize the worksheet dimensions and column widths to create square pixel blocks:

```javascript
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet();
spread.suspendPaint();
sheet.setColumnCount(50);
for (let i = 0; i < sheet.getColumnCount(); i++) {
  sheet.setColumnWidth(i, 20);
}
spread.options.scrollbarMaxAlign = true;
spread.resumePaint();
```

Wrapping structural changes in `suspendPaint()` and `resumePaint()` improves browser performance. A column width of 20 pixels creates square cells that work well for retro pixel art.

### 2. Design the Pixel Command Queue

Define a command array to store coordinate parameters and color labels for each pixel:

```javascript
let commandArr = [];

for (let i = 16; i < 22; i++) {
  let command = {};
  command.row = 3;
  command.col = i;
  command.backColor = "red";
  commandArr.push(command);
}
```

Each command object contains:

- `row`: Target row coordinate.
- `col`: Target column coordinate.
- `backColor`: The background color string (supports HTML names, hex codes, RGB values, or theme indices).

### 3. Define the Character Data Map

Define the sprite layout using loops and conditional logic to map the different parts of Mario:

```javascript
// Row index 5: Hat brim and upper face details
for (let i = 15; i < 23; i++) {
  let command = {};
  command.row = 5;
  command.col = i;
  if (i < 19 || i == 21) {
    command.backColor = "Accent 2 -50"; // Brown hair/hat details
  } else {
    command.backColor = "rgb(251,162,80)"; // Peach skin tone
  }
  commandArr.push(command);
}
```

The sprite is constructed across 16 rows using three main colors:

- `red`: Hat and overalls.
- `Accent 2 -50`: Brown details (hair, sideburns, and boots).
- `rgb(251,162,80)`: Skin tone.

### 4. Implement Animated Rendering

Use a recursive `setTimeout` loop to pop and render pixels one by one:

```javascript
document.getElementById("work").onclick = function () {
  executeCmd(commandArr);
};

function executeCmd(cmdArr) {
  setTimeout(function () {
    let i = cmdArr.length - 1;
    // Paint cell color
    sheet.getCell(cmdArr[i].row, cmdArr[i].col).backColor(cmdArr[i].backColor);
    cmdArr.pop();
    if (cmdArr.length !== 0) {
      executeCmd(cmdArr);
    }
  }, 20);
}
```

This paints a cell every 20 milliseconds, drawing the character progressively over 3 to 4 seconds.

---

## Technology Stack

- **SpreadJS 19.0.3**: Core spreadsheet components.
- **SystemJS 0.19.22**: JavaScript module loading.
- **TypeScript 4.1.2**: Script build compiler setups.

---

## How to Run

### Installation & Execution

```bash
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open the page in your browser. You will see an empty spreadsheet grid next to a **Render Mario** (or "生成马里奥") button.
2. Click **Render Mario**.
3. Watch the pixel art draw onto the grid cell-by-cell (taking about 3–4 seconds to complete).
4. The completed Mario sprite will display on the sheet.

---

## Features & Recommendations

### Pros

- **Creative Visuals**: Explores non-traditional uses for spreadsheets, showing the creative flexibility of style attributes.
- **Smooth Animations**: The recursive timeout loop creates a smooth drawing effect.
- **Simple Extensibility**: The sprite data is defined in clean loops, making it easy to swap color variables to paint other assets.

### Recommendations for Production

- **Image Parsers**: Writing pixel maps manually is time-consuming. Write or use an image parser script to automatically convert PNG/JPG sprites into coordinate color arrays.
- **Render Optimizations**: For large pixel art, suspend rendering updates using `suspendPaint()` before drawing, or group cell updates together.
- **Playback Controls**: Add controls to pause, reset, or speed up the drawing animation.

---

## Key Code Snippets

### Set Cell Background Color

```javascript
sheet.getCell(row, col).backColor(color);
```

This is the core SpreadJS API used to style cell backgrounds. It supports multiple formats:

- Color names: `"red"`, `"blue"`.
- RGB values: `"rgb(251, 162, 80)"`.
- Theme colors: `"Accent 2 -50"`.

### Recursive Loop Pattern

```javascript
function executeCmd(cmdArr) {
  setTimeout(function () {
    // Execute operation
    cmdArr.pop();
    if (cmdArr.length !== 0) {
      executeCmd(cmdArr); // Recursive call
    }
  }, 20);
}
```

Using a recursive timeout loop instead of a standard `for` loop ensures a consistent delay between frames, which is perfect for rendering UI animations.

---

## Summary

This case study shows how to use cell background properties to create custom visuals in SpreadJS. Key takeaways:

1. Modifying cell styles using the `backColor()` API.
2. Implementing animations with recursive timeout loops.
3. Structuring visual data as coordinate arrays.
4. Using paint suspension to optimize layout changes.

This pattern is useful for dashboards, interactive tutorials, games, and creative visualizations in SpreadJS.
