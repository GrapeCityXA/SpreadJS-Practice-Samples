import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";
//需要引入ztree css js
// zTree is loaded from the local @ztree/ztree_v3 npm package in index.html.
var keyword_null = null,
  keyword_undefined = undefined;
var DefaultDropDownButtonWidth = 17;
var ComboTreeCellType = function () {
  ComboTreeCellType.treeID = 0;
};
ComboTreeCellType.prototype = new GC.Spread.Sheets.CellTypes.ComboBox();

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
        sheet.endEdit();
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
ComboTreeCellType.prototype.onItemSelect = function (data, treeId, treeNode) {
  console.log("data:" + data);
  console.log("treeId:" + treeId);
  console.log("treeNode:" + treeNode);
};
ComboTreeCellType.prototype.getEditorValue = function (editorContext, context) {
  var zTree = editorContext;
  if (this.selectedNode) {
    var row = context.row;
    var col = context.col;
    var cell = context.sheet.getCell(row, col);
    return this.selectedNode;
  }
  return "";
};

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

ComboTreeCellType.prototype.updateEditor = function (
  editorContext,
  cellStyle,
  cellRect,
  context,
) {
  var sheet = editorContext && context && context.sheet;
  if (!sheet) {
    return;
  }
  var comboBox = editorContext.comboBox;
  if (cellStyle && comboBox) {
    var render = sheet._render;
    // 将 Cell 样式设置给Combo
  }
  if (cellRect && comboBox) {
    var offset = $(editorContext.parentNode).position();

    $(editorContext).width(140);
    $(editorContext).height(200);
    return { height: 200, width: 140 };
  }
};

ComboTreeCellType.prototype.processMouseDown = function (hitInfo) {
  var sheet = hitInfo.sheet,
    sheetArea = hitInfo.sheetArea;
  if (
    (sheetArea === keyword_null ||
      sheetArea === keyword_undefined ||
      sheetArea === 3) /* viewport */ &&
    hitInfo.isReservedLocation &&
    sheet
  ) {
    sheet.startEdit();
  }
};

$(document).ready(function () {
  var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
    sheetCount: 2,
  });
  var sheet = spread.getActiveSheet();

  var items = [
    {
      id: 1,
      name: "北京",
      open: true,
      children: [
        {
          id: 11,
          name: "海淀区",
        },
        {
          id: 12,
          name: "朝阳区",
        },
      ],
    },
    {
      id: 2,
      name: "上海",
      open: true,
      children: [
        {
          id: 21,
          name: "浦东区",
        },
      ],
    },
    {
      id: 3,
      name: "天津",
    },
    {
      id: 4,
      name: "重庆",
    },
    {
      id: 5,
      name: "陕西省",
      open: true,
      children: [
        {
          id: 51,
          name: "西安市",
          children: [
            {
              id: 511,
              name: "雁塔区",
            },
            {
              id: 512,
              name: "莲湖区",
            },
          ],
        },
        {
          id: 52,
          name: "宝鸡市",
        },
      ],
    },
  ];

  var cellType = new ComboTreeCellType();
  cellType.items(items);

  sheet.setCellType(0, 0, cellType);
  sheet.setCellType(0, 2, cellType);
});
