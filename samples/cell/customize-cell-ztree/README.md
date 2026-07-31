# Integrate zTree Hierarchy Dropdown in SpreadJS Cells

This example demonstrates how to integrate the third-party tree plugin **zTree** inside SpreadJS by creating a custom cell type (`CellType`). Clicking on the cell pops up a hierarchical dropdown selector that supports multi-level selections (e.g., Province > City > District). Once a node is selected, the cell automatically updates to display the corresponding node name.

This solution is ideal for spreadsheets requiring hierarchical data inputs, such as geographic regions, organizational structures, or product category catalogs.

---

## Core Scenarios & Solutions

- **Hierarchical Selections**: Standard dropdown lists only display flat datasets, which fail to visualize parent-child relationships. Integrating zTree offers a collapsible, multi-level tree layout.
- **Structured Data Visualizations**: For nested configurations (regions, cost departments, inventory categories), tree selectors offer a cleaner user experience compared to massive, flat dropdown lists.
- **Third-party Library Integrations**: Showcases how to integrate mature, external UI libraries (like zTree) into customized cell types, providing developers with safe patterns for expanding SpreadJS.

---

## Implementation Details

### 1. Extend the ComboBox Cell Type

Subclass the built-in `GC.Spread.Sheets.CellTypes.ComboBox` to create `ComboTreeCellType`, retaining dropdown behaviors while custom editors are written:

```javascript
var ComboTreeCellType = function () {
  ComboTreeCellType.treeID = 0;
};
ComboTreeCellType.prototype = new GC.Spread.Sheets.CellTypes.ComboBox();
```

### 2. Instantiate the zTree Container

Override `createEditorElement` to return a container initialized with a zTree instance:

```javascript
ComboTreeCellType.prototype.createEditorElement = function (context) {
  var self = this,
    sheet = context.sheet;
  var zTree = $('<ul class="ztree"></ul>');
  self.treeID = "tree" + ComboTreeCellType.treeID++;
  var setting = {
    treeId: self.treeID,
    callback: {
      onClick: function (data, treeId, treeNode) {
        self.selectedNode = treeNode;
        sheet.endEdit(); // Automatically end cell editing upon selection
      },
    },
  };
  $.fn.zTree.init(zTree, setting, this.items());
  var editor = $(
    '<div gcUIElement="ComboTree" style="background-color:white;max-height:400px;border-style:solid;border-width:thin;border-color:black;overflow:scroll"></div>',
  );
  editor.append(zTree);
  editor[0].comboBox = zTree[0];
  return editor[0];
};
```

**Key Points:**

- Auto-generate a unique `treeID` per instance to prevent coordination conflicts when multiple cells instantiate zTree dropdowns.
- Listen to `onClick` callbacks to cache selected nodes and trigger `sheet.endEdit()`.
- Add scrollbars and bounds configurations to the popup editor.

### 3. Handle Editor Value Transitions

Override `getEditorValue` and `setEditorValue` to convert selected node JSON objects to cell values:

```javascript
ComboTreeCellType.prototype.getEditorValue = function (editorContext, context) {
  if (this.selectedNode) {
    return this.selectedNode; // Return the entire node object
  }
  return "";
};

ComboTreeCellType.prototype.setEditorValue = function (
  editorContext,
  value,
  context,
) {
  var treeObj = $.fn.zTree.getZTreeObj(self.treeID);
  var nodes = treeObj.getNodes();
  if (value) {
    var node = this.findNode(nodes, value);
    if (node) {
      treeObj.selectNode(node);
      this.selectedNode = node;
    } else {
      treeObj.selectNode(null);
    }
  } else {
    treeObj.selectNode(null);
  }
};
```

Storing the complete node object (including `id`, `name`, `children`, and other custom keys) in cell values retains context compared to simply saving text strings.

### 4. Custom paint (Rendering) Logic

Override `paint` to display only the node name in cells:

```javascript
var oldpaint = ComboTreeCellType.prototype.paint;
ComboTreeCellType.prototype.paint = function (
  ctx,
  value,
  x,
  y,
  w,
  h,
  style,
  options,
) {
  if (value) {
    oldpaint.call(this, ctx, value.name, x, y, w, h, style, options);
  } else {
    oldpaint.call(this, ctx, value, x, y, w, h, style, options);
  }
};
```

Since the cell value stores the complete JSON object, the painter must extract `value.name` for rendering.

### 5. Traverse Hierarchical Nodes

Implement a recursive `findNode` method to search for target nodes in deep tree structures:

```javascript
ComboTreeCellType.prototype.findNode = function (nodes, name) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].name === name) {
      return nodes[i];
    }
    if (nodes[i].children && nodes[i].children.length > 0) {
      var node = this.findNode(nodes[i].children, name);
      if (node) {
        return node;
      }
    }
  }
  return null;
};
```

---

## Technology Stack

- **SpreadJS 19.0.3**: Core spreadsheet components.
- **zTree 3.5.42**: Tree component library.
- **jQuery 3.6.1**: Dependency for zTree DOM utilities.
- **SystemJS 0.19.22**: JavaScript module loading.

---

## How to Run

### Installation & Execution

```bash
npm install
```

Open `index.html` directly in your browser. Since dependencies (jQuery and zTree) load via CDN, verify that your computer is connected to the internet.

### Steps to Test

1. Launch the page. You will see a spreadsheet where cells `A1` and `C1` are configured as tree selectors.
2. Click cell `A1` or `C1` to open the collapsible tree dropdown.
3. The menu displays hierarchical regions of China (e.g. "陕西省 > 西安市 > 雁塔区").
4. Click any child or parent node. The menu closes, and the node's name displays in the cell.
5. Click again to change selections.

---

## Features & Recommendations

### Pros

- **Hierarchical Layouts**: Shows parent-child relationships clearly, helping users search through large options lists.
- **Rich Context Storage**: Storing the JSON node object inside cell values makes it easy to read IDs, parent IDs, and properties later.
- **Highly Scalable**: Leverage zTree features (like checkboxes, search input filters, and async node lazy-loading) directly.

### Recommendations for Production

- **Bundle Size**: Since zTree requires jQuery, evaluate the impact on bundle sizes.
- **CSS Customization**: Modify default zTree CSS styling rules to fit your application's UI design.
- **Lazy Loading**: For large datasets (thousands of nodes), implement zTree's asynchronous nodes lazy loading API to prevent DOM rendering lag.
- **Enhancements**:
  - Add search input filters above the tree menu.
  - Enable checkbox multi-selections using zTree's checkbox configuration options.

---

## Key Code Snippets

### Tree Data Structure

```javascript
var items = [
  {
    id: 1,
    name: "Beijing",
    open: true,
    children: [
      { id: 11, name: "Haidian District" },
      { id: 12, name: "Chaoyang District" },
    ],
  },
  {
    id: 5,
    name: "Shaanxi",
    open: true,
    children: [
      {
        id: 51,
        name: "Xi'an",
        children: [
          { id: 511, name: "Yanta District" },
          { id: 512, name: "Lianhu District" },
        ],
      },
      { id: 52, name: "Baoji" },
    ],
  },
];
```

- `id`: Node identifier.
- `name`: Label displayed in the list and cell.
- `open`: Expand nodes by default.
- `children`: Nested arrays mapping child structures.

### Apply Custom CellType

```javascript
var cellType = new ComboTreeCellType();
cellType.items(items); // Load tree records

sheet.setCellType(0, 0, cellType); // Assign to A1
sheet.setCellType(0, 2, cellType); // Assign to C1
```

---

## Summary

This case study shows how to implement custom cell editors using third-party components. Key learning points:

1. Extending standard `ComboBox` cell types.
2. Initializing external widgets inside custom editor scopes.
3. Serializing and converting cell value payloads.
4. Custom cell painting logic.
5. Traversing hierarchical structures recursively.

This approach is highly useful for corporate directories, accounting cost categories, and nested classifications.
