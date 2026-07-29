import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();
sheet.setColumnWidth(1, 200);
sheet.setColumnWidth(0, 100);
sheet.setValue(1, 0, "双击B2测试➡️");

setTimeout(function () {
  sheet.setCellType(1, 1, new DropdownMultiSelect());
}, 0);

//删除空,未知数组
function trimSpace(array) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] == "" || array[i] == null || typeof array[i] == "undefined") {
      array.splice(i, 1);
      i = i - 1;
    }
  }
  return array;
}

let selectList = [
  { name: "MUL1", value: 0 },
  { name: "MUL2", value: 1 },
  { name: "MUL3", value: 2 },
];
function DropdownMultiSelect() { }
DropdownMultiSelect.prototype = new GC.Spread.Sheets.CellTypes.Text();
DropdownMultiSelect.prototype.createEditorElement = function () {
  let div = document.createElement("div");
  let $div = $(div);
  $div.attr("id", "xm-select-container");
  return div;
};
DropdownMultiSelect.prototype.activateEditor = function (
  editorContext,
  cellStyle,
  cellRect,
) {
  if (editorContext) {
    let $editor = $(editorContext);
    GC.Spread.Sheets.CellTypes.Base.prototype.activateEditor.apply(
      this,
      arguments,
    );
    $editor.attr("gcUIElement", "gcEditingInput");
    let index = [];
    let disList = trimSpace(
      sheet
        .getText(sheet.getActiveRowIndex(), sheet.getActiveColumnIndex())
        .split(","),
    );
    for (let js = 0; js < selectList.length; ++js) {
      if (disList.indexOf(selectList[js].name) != -1) {
        index.push(selectList[js].value);
      }
    }
    if (disList.length == 0) {
      sheet.setValue(
        sheet.getActiveRowIndex(),
        sheet.getActiveColumnIndex(),
        "",
      );
    }
    xmSelect.render({
      el: "#xm-select-container",
      autoRow: true,
      direction: "down",
      language: "zn",
      data: selectList,
      model: {
        label: {
          type: "block",
          block: {
            showCount: 3,
            showIcon: true,
          },
        },
      },
      initValue: index,
      pageSize: 3,
      toolbar: {
        show: true,
        list: ["ALL"],
      },
      on: function (data) {
        let arr = data.arr;
        let nameStr = "";
        let indexList = [];
        for (let i = 0; i < arr.length; ++i) {
          nameStr += arr[i].name + ",";
          indexList.push(arr[i].value);
        }
        nameStr = nameStr.substr(0, nameStr.length - 1);
        sheet.setTag(
          sheet.getActiveRowIndex(),
          sheet.getActiveColumnIndex(),
          indexList,
        );
        sheet.setValue(
          sheet.getActiveRowIndex(),
          sheet.getActiveColumnIndex(),
          nameStr,
        );
      },
    });
  }
};
DropdownMultiSelect.prototype.setEditorValue = function (
  editor,
  value,
  context,
) {
  $(editor).val(value);
};
DropdownMultiSelect.prototype.getEditorValue = function (editor, context) {
  return $(editor).val();
};
DropdownMultiSelect.prototype.updateEditor = function (
  editorContext,
  cellStyle,
  cellRect,
) {
  if (editorContext) {
    let $editor = $(editorContext);
    $editor.css("width", cellRect.width);
    return { height: 300 };
  }
};
