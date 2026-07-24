# Add Custom Context Menu Items in SpreadJS

This example demonstrates how to customize the context menu (right-click menu) in SpreadJS. By intercepting and extending the `contextMenu.onOpenMenu` method, developers can append custom items to the default context menu and register custom command handling logics for them. Furthermore, the example demonstrates how to dynamically show or hide menu items based on the cell coordinate selected by the user.

This solution is ideal for web spreadsheet applications requiring personalized shortcut menus, contextual action triggers, or conditional option visibility.

---

## Core Scenarios & Solutions

- **Extend Default Menus**: Intercept and append custom menu commands to the native built-in SpreadJS context menu.
- **Conditional Visibility**: Dynamically show or hide specific menu options depending on the active cell's location or cell properties.
- **Decoupled Command Binding**: Decouple layout and user actions by registering custom commands using the command manager framework.

---

## Implementation Details

### 1. Intercept and Extend Context Menu Items

Override the `spread.contextMenu.onOpenMenu` method to intercept menu data before it displays. Append your custom items to the `itemsDataForShown` list, then execute the original function to retain default behaviors:

```javascript
let oldF = spread.contextMenu.onOpenMenu;
spread.contextMenu.onOpenMenu = function (
  menuData,
  itemsDataForShown,
  hitInfo,
  spread,
) {
  itemsDataForShown.push(
    {
      text: "Custom Menu Item",
      name: "customContextMenu",
      command: "customCommand",
    },
    {
      text: "yustest",
      name: "customContextMenu",
      command: "customCommand",
    },
  );
  // Invoke original function to preserve default menu items
  oldF.apply(this, arguments);
};
```

**Key Parameter Definitions:**

- `menuData`: Raw, untouched menu definition structures.
- `itemsDataForShown`: The array of options that will be displayed in the menu. Add items to this list using `push`.
- `hitInfo`: Detailed location context regarding where the right-click was triggered.
- `spread`: The workbook instance.

### 2. Dynamically Control Menu Display

Condition menu options based on coordinates. The code snippet below hides the entire context menu when right-clicking on the second row (`row index = 1`):

```javascript
// Get currently selected area details
let sel = spread.getActiveSheet().getSelections()[0];
if (sel.row === 1) {
  // Clear all menu items to hide the context menu entirely
  itemsDataForShown.splice(0, itemsDataForShown.length);
}
```

This logic can be customized for real-world scenarios, such as hiding options for read-only rows, locked cells, or specific column indexes.

### 3. Register Custom Commands

Use `commandManager().register()` to register the command linked to your menu item. When clicked, it triggers the callback code:

```javascript
spread.commandManager().register("customCommand", {
  canUndo: false,
  execute: function (spread, options) {
    console.log(arguments);
  },
});
```

**Key Parameter Definitions:**

- `canUndo`: Defines whether the command can be undone via Ctrl+Z.
- `execute`: The callback function, receiving the workbook instance and context options.

---

## Technology Stack

- **SpreadJS 19.0.3**: The core spreadsheet engine.
- **SystemJS 0.19.22**: JavaScript module loading framework.
- **TypeScript 4.1.2**: Scripting environment setups.

---

## How to Run

### Installation & Execution

```bash
# Install dependencies
npm install

# Open index.html directly or using a local server (e.g. Live Server)
```

### Steps to Test

1. Open the page and right-click anywhere in the spreadsheet viewport.
2. Note the newly added options: **Custom Menu Item** and **yustest**.
3. Click either item and observe the arguments printed in the browser developer console.
4. Select any cell in the second row (`row index = 1`), right-click, and verify that the context menu is completely hidden.

---

## Features & Recommendations

### Pros

- **Non-destructive Extension**: Preserves default menu behaviors by forwarding arguments to the original method.
- **Flexible UI Actions**: Allows complete control over option visibility using context parameters.
- **Decoupled Architecture**: Leverages command-registry patterns to decouple UI elements from business logic.

### Limitations & Recommendations for Production

- **Advanced Menus**: The code shows simple text links. To add nested submenus, icons, or separators, extend the `menuData` array with appropriate nested options.
- **Parameter Context**: Pass rich context payloads (e.g., target row coordinates or values) inside the command `options` block.
- **Localization**: Connect menu strings to a localized bundle to switch labels dynamically according to language preferences.

---

## Summary

This case study shows how to customize context menus in SpreadJS. Key learning points:

1. Intercepting context menu openings with `onOpenMenu`.
2. Hiding menu items conditionally based on selection indices.
3. Implementing custom event triggers via the command manager.
4. Preserving original method actions when overriding APIs.
