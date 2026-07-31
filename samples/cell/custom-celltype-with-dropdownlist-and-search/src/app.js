import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio";
import "@grapecity-software/spread-sheets-charts";
import "@grapecity-software/spread-sheets-print";
import "@grapecity-software/spread-sheets-pdf";
import "@grapecity-software/spread-sheets-barcode";
import "@grapecity-software/spread-sheets-languagepackages";
import "@grapecity-software/spread-sheets-shapes";
import "@grapecity-software/spread-sheets-pivot-addon";
import "@grapecity-software/spread-sheets-designer-resources-cn";
import "@grapecity-software/spread-sheets-designer";

GC.Spread.Sheets.Designer.LicenseKey = "";
GC.Spread.Sheets.LicenseKey = "";

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container");
let spread = designer.getWorkbook();
let sheet = spread.getActiveSheet();

function MySelector() {
  this.typeName = "MySelector";
}
MySelector.prototype = new GC.Spread.Sheets.CellTypes.Base();
MySelector.prototype.paint = function (ctx, value, x, y, w, h, style, options) {
  if (value) {
    console.log("paint, value: ", value);
    GC.Spread.Sheets.CellTypes.Base.prototype.paint.apply(this, [
      ctx,
      value.value,
      x,
      y,
      w,
      h,
      style,
      options,
    ]);
  }
};
MySelector.prototype.updateEditor = function (
  editorContext,
  cellStyle,
  cellRect,
) {
  console.log("updateEditor: ", editorContext);
  if (editorContext) {
    editorContext.style.width = cellRect.width + "px";
    editorContext.style.height = 200;
    return { height: 200 };
  }
};
MySelector.prototype.createEditorElement = function () {
  console.log("this.typeName: ", this.typeName);
  //  容器以排布输入框和选择器
  var container = document.createElement("div");
  container.setAttribute("gcUIElement", "gcEditingInput");
  container.style.backgroundColor = "white";
  container.style.overflow = "hidden";
  container.style.display = "flex";
  container.style.minHeight = "200px";
  container.style.flexDirection = "column";

  //  输入框，显示或输入检索数据
  var searchInput = document.createElement("input");
  searchInput.placeholder = "请输入";
  container.appendChild(searchInput);

  //  选择器，列举各选项
  var list = document.createElement("select");
  list.multiple = true;
  // list.overflow = 'auto';
  var listItems = [
    { text: "苹果", value: "apple" },
    { text: "香蕉", value: "banana" },
    { text: "橙子", value: "orange" },
    { text: "樱桃", value: "cherry" },
    { text: "西瓜", value: "watermelon" },
    { text: "葡萄", value: "grape" },
    { text: "桃子", value: "peach" },
    { text: "其他水果", value: "ogan" },
  ];
  listItems.forEach((item) => {
    var listItem = document.createElement("option");
    listItem.textContent = item.text;
    listItem.value = item.value;
    list.appendChild(listItem);
  });
  list.style.flex = "1";
  list.style.minHeight = "100px";
  container.appendChild(list);

  // 输入框输入事件处理，实现模糊搜索
  searchInput.addEventListener("input", function () {
    const searchValue = this.value.toLowerCase();
    console.log("search value: ", searchValue);
    const options = list.options;
    console.log("options: ", options);
    for (let i = 0; i < options.length; i++) {
      const optionText = options[i].textContent.toLowerCase();
      if (optionText.includes(searchValue)) {
        console.log("included: ", optionText, ", ", searchValue);
        options[i].style.display = "block";
      } else {
        options[i].style.display = "none";
      }
    }
  });

  list.addEventListener("change", function () {
    const selectedOptions = Array.from(this.selectedOptions);
    const selectedTexts = [];
    console.log("...selectedOptions: ", selectedOptions);
    selectedOptions.forEach((option) => {
      const item = document.createElement("span");
      item.textContent = option.textContent;
      selectedTexts.push(option.value);
    });
    console.log("selectedTexts: ", selectedTexts);
    searchInput.value = selectedTexts.join(", ");
  });

  return container;
};
MySelector.prototype.getEditorValue = function (editorContext) {
  console.log("getEditorValue: ", editorContext);
  console.log("getEditorValue, value: ", editorContext.children[0].value);

  return { value: editorContext.children[0].value };
};
MySelector.prototype.setEditorValue = function (editorContext, value) {
  console.log("setEditorValue: ", editorContext, ", value: ", value);
  editorContext.children[0].value = value ? value.value : null;
  //  获取input输入框中的数据，对被选中项设置selected属性为true
  if (value && value.value) {
    var inputContent = value.value.split(", ");
    console.log("input content: ", inputContent);
    var selectList = editorContext.children[1];
    Array.from(selectList.options).forEach((item) => {
      if (inputContent.includes(item.value)) {
        item.selected = true;
      }
    });
  }
};
MySelector.prototype.isReservedKey = function (e) {
  return (
    e.keyCode === GC.Spread.Commands.Key.tab &&
    !e.ctrlKey &&
    !e.shiftKey &&
    !e.altKey
  );
};

sheet.setColumnWidth(1, 200);
sheet.setCellType(1, 1, new MySelector());
