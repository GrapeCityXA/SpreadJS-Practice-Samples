import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";

var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

function initSpread(spread) {
  var sheet = spread.getActiveSheet();

  sheet.setCellType(
    0,
    1,
    new DrowdownHeaderCellType(),
    GC.Spread.Sheets.SheetArea.colHeader,
  );
  sheet.getCell(0, 1, GC.Spread.Sheets.SheetArea.colHeader).tag({
    dropDown: {
      items: undefined,
      value: "value3",
    },
  });
}

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
  ctx.restore();
};
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
    info.isReservedLocation = true;
  }
  return info;
};

DrowdownHeaderCellType.prototype.processMouseUp = function (hitInfo) {
  if (hitInfo.isReservedLocation) {
    var sheet = hitInfo.sheet;
    var tag = sheet.getTag(hitInfo.row, hitInfo.col, hitInfo.sheetArea);
    if (!tag) {
      //first time
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
    // span.style.boxShadow = "5px 5px 5px rgba(0,0,0,0.4)";
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
    // mySelect.click();

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
DrowdownHeaderCellType.prototype._closeDropdown = function (host) {
  if (this._dropdownElement) {
    try {
      host.removeChild(this._dropdownElement);
    } catch {}
    this._dropdownElement = undefined;
  }
};

initSpread(spread);
