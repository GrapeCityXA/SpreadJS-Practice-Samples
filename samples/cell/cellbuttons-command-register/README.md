# Registering Commands for Cell Buttons (cellButtons) in SpreadJS

SpreadJS allows embedding multiple predefined buttons (`cellButtons`) inside sheet cells. These buttons can execute various commands when clicked.

You can configure cell buttons to trigger:

1. SpreadJS built-in commands
2. Anonymous functions
3. Custom registered commands (via CommandManager)

---

## 1. Trigger Built-in Commands

You can bind a cell button to one of SpreadJS's built-in commands by passing its name string to the `command` property:

```javascript
let style1 = new GC.Spread.Sheets.Style();
style1.cellButtons = [
  {
    imageType: GC.Spread.Sheets.ButtonImageType.dropdown,
    command: "openColorPicker", // Open the color picker
  },
];
sheet.setStyle(1, 3, style1);
```

---

## 2. Trigger Anonymous Functions

You can directly assign an anonymous callback function to the `command` property without registering it globally:

```javascript
let style2 = new GC.Spread.Sheets.Style();
style2.cellButtons = [
  {
    imageType: GC.Spread.Sheets.ButtonImageType.dropdown,
    command: function () {
      alert("Anonymous function triggered!");
    },
  },
];
sheet.setStyle(3, 3, style2);
```

---

## 3. Register and Trigger Custom Commands

For reusable logic or undo-redo support, register a custom command with the sheet's `CommandManager` and bind it to the button by name:

```javascript
// Define and register the command
let command = {
  canUndo: true,
  execute: function (context, options, isUndo) {
    alert("Custom command executed!");
  },
};
let commandManager = spread.commandManager();
commandManager.register("alertSth", command);

// Bind the command to the cell buttons style
let style3 = new GC.Spread.Sheets.Style();
style3.cellButtons = [
  {
    imageType: GC.Spread.Sheets.ButtonImageType.dropdown,
    command: "alertSth", // Reference the registered command name
  },
];
sheet.setStyle(5, 3, style3);
```
