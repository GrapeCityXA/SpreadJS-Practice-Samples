import * as GC from "@grapecity-software/spread-sheets";

import "jquery";
import "jquery-ui-dist";

GC.Spread.Sheets.LicenseKey = "";

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

let vpRect = (vpRect = document.getElementById("ss").getBoundingClientRect());

let currentCell, dateInput;

jQuery.datepicker.setDefaults({
  onSelect: (date) => {
    let { row, col } = currentCell;
    let value = spread.getActiveSheet().getValue(row, col);
    if (!value) {
      spread.getActiveSheet().setValue(row, col, " ");
    }
    value = spread.getActiveSheet().getValue(row, col);
    let arr = value.split(" ");
    arr[currentCell.index] = date;
    spread.getActiveSheet().setValue(row, col, arr.join(" "));
    $(dateInput).datepicker("hide");
    $(dateInput).datepicker("destroy");
    document.querySelector("body").removeChild(dateInput);
  },
});

let style = new GC.Spread.Sheets.Style();

function showDatepicker(cellRect) {
  document.querySelectorAll(".date-input").forEach((ele) => {
    ele.remove();
  });
  dateInput = document.createElement("input");
  dateInput.classList = ["date-input"];
  dateInput.style.top = cellRect.y + vpRect.top + "px";
  dateInput.style.left = cellRect.x + vpRect.left + "px";
  document.querySelector("body").appendChild(dateInput);
  $(dateInput).datepicker();
  $(dateInput).datepicker("show");
}

style.cellButtons = [
  {
    caption: "按钮1",
    command: function (sheet, row, col) {
      let cellRect = sheet.getCellRect(row, col);
      currentCell = { row, col, index: 0 };
      showDatepicker(cellRect);
    },
  },
  {
    caption: "按钮2",
    command: function (sheet, row, col) {
      let cellRect = sheet.getCellRect(row, col);
      currentCell = { row, col, index: 1 };
      showDatepicker(cellRect);
    },
  },
];
spread.getActiveSheet().setStyle(0, 0, style);
spread.getActiveSheet().setColumnWidth(0, 400);
