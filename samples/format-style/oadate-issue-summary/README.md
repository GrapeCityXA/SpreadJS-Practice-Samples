# OADate Troubleshooting & FAQ in SpreadJS

For developers working with date values in SpreadJS, exporting or importing JSON payloads often reveals that date objects are serialized and saved as `OADate` formats (e.g., `"/OADate(42065)/"`).

This design choice—shared by Microsoft Excel—resolves timezone differences and serialization conflicts when saving date types across diverse environments.

This document summarizes the common challenges related to OADate and provides technical solutions for multiple runtime environments.

---

## FAQ 1: The Relationship Between OADate and the Year 1900

### Description

When retrieving values from date cells in SpreadJS, you might receive strings formatted like `/OADate(42065)/`.
An OADate represents the fractional number of days elapsed since midnight, December 30, 1899.

SpreadJS acts as a parser: it renders dates in standard formats for frontend users while saving them as OADate structures in JSON payloads. This ensures data is serialized reliably when written to or retrieved from database engines.

### The 1900 Leap Year Discrepancy

There is a known calculation discrepancy between Excel and JavaScript concerning the year 1900. Excel incorrectly treats 1900 as a leap year (adding February 29, 1900), whereas 1900 was actually a common year. Because of this, date calculations in Excel are off by one day for any dates prior to March 1, 1900. From March 1, 1900 onward, JavaScript dates align with Excel.

If you need your application to align with Excel for historic dates, check if the date falls between January 0, 1900 and February 29, 1900. If it does, subtract one day in your SpreadJS logic.

_Note: OADate is a Microsoft format commonly generated when C# backend servers transmit DateTime types to web frontends._

---

## FAQ 2: Why Does `getDataSource()` Return Date Values in OADate Format?

### Problematic Code Pattern

```javascript
function initSpreadJs(spread) {
  var spreadNS = GC.Spread.Sheets;
  var sheet = spread.getActiveSheet();

  var colInfos = [
    { name: "date", displayName: "Date", formatter: "yyyy-MM-dd" },
  ];

  sheet.bindColumns(colInfos);
  sheet.setDataSource([{ data: "1" }]);
}
```

### Reason

Applying a date `formatter` causes SpreadJS to automatically cast the underlying data type to a Date object, storing it as an OADate. This also happens when the `autoFormatter` engine is triggered.

To prevent values in your data source from being auto-cast to OADate, apply date formatting on your backend server and send dates to the frontend as standard string values.

---

## FAQ 3: How to Transfer Date Strings Between Frontend and Backend

To keep dates formatted as strings during data transfer, choose one of the following methods:

### Method 1: Write Date Values as String Constants

Write string values directly into cells instead of passing Date objects:

```javascript
sheet.setValue(0, 0, "2011-11-11");
```

### Method 2: Set the Cell Formatter to Text (`@`)

Explicitly configure the target columns or cells to format as text:

```javascript
sheet.setFormatter(-1, 3, "@");
```

To apply this across the entire worksheet, modify the sheet's default style:

```javascript
var defaultStyle = sheet.getDefaultStyle();
defaultStyle.formatter = "@";
sheet.setDefaultStyle(defaultStyle);
```

### Method 3: Configure Cell Format in the UI

In SpreadJS Designer, select the cells, format them as **Text**, and then enter the date string.

![SpreadJS Designer Text Format](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.3802ef.png?width=800)

Once these configurations are applied, cell values are stored and retrieved as strings. You can still apply display formatters later to style the date strings as needed.

---

## FAQ 4: Convert Standard Dates to OADate in Different Environments

Here are examples of how to convert standard dates to the OADate format across different programming languages:

### C# / .NET

```csharp
DateTime date = DateTime.Now;
double oadate = date.ToOADate();
```

### Python

```python
from datetime import datetime

date = datetime.now()
oadate = (date - datetime(1899, 12, 30)).total_seconds() / (24 * 60 * 60)
```

### JavaScript

```javascript
var date = new Date();
var oadate =
  (date.getTime() - Date.parse("1899-12-30")) / (24 * 60 * 60 * 1000);
```

### Java

```java
import java.util.Date;

Date date = new Date();
// Note: Java's Date constructor deprecates years offset from 1900, months are 0-indexed
double oadate = (date.getTime() - new Date(1899 - 1900, 11, 30).getTime()) / (24 * 60 * 60 * 1000.0);
```

If you are using GrapeCity's **GcExcel** library, you can auto-parse date strings to OADates by enabling `autoParse` before binding data:

```java
// Example input data: "Date": "2011-11-11 11:11:22"
workbook.setAutoParse(true);
```

---

## FAQ 5: Convert OADate to Standard Dates in Different Environments

### JavaScript

```javascript
function fromOADate(date) {
  var oaDateReg = new RegExp(
    "^/OADate\\(([-+]?(\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)\\)/\\s*",
  );

  if (typeof date === "string" && oaDateReg.test(date)) {
    var oadate = parseFloat(date.match(oaDateReg)[1]);
    var ms =
      (oadate * 86400000 * 1440 -
        25569 * 86400000 * 1440 +
        new Date((oadate - 25569) * 86400000).getTimezoneOffset() * 86400000) /
      1440;
    return new Date(ms);
  } else {
    return date;
  }
}
```

_Tip: You can also use SpreadJS cell tags to convert OADate values, as the `tag` API automatically parses matching formats:_

```javascript
sheet.tag("/OADate(44542)/");
var date = sheet.tag(); // Returns parsed JS Date object
```

### Custom Data Binding Conversions

To convert OADate values during data binding, define a getter/setter function in your column configuration:

```javascript
var sheet = spread.getSheet(0);
sheet.autoGenerateColumns = false;
var colInfos = [
  { name: "id", displayName: "ID" },
  { name: "name", displayName: "Name", size: 100 },
  {
    name: "date",
    displayName: "Date",
    size: 80,
    formatter: "yyyy/mm/dd",
    value: function (item, value) {
      if (arguments.length === 2) {
        // Setter: Convert OADate string to Date timestamp
        sheet.tag(value);
        let tempDate = sheet.tag();
        if (tempDate instanceof Date) {
          item.date = tempDate.getTime();
        } else {
          item.date = value;
        }
      } else {
        // Getter: Return Date object from timestamp
        if (item.date && item.date > 631123200000) {
          return new Date(item.date);
        } else {
          return item.date;
        }
      }
    },
  },
  { name: "date", displayName: "DateValue", size: 80 },
];
sheet.bindColumns(colInfos);
sheet.setDataSource([{ id: 1, date: 1817740800000 }, {}, {}]);
```

You can also implement this using a converter function:

```javascript
// Example column config:
// { name: "birthday", displayName: "Birthday", size: 100, value: birthdayConverter }

function birthdayConverter(item, value) {
  if (arguments.length === 1) {
    return item["birthday"]();
  } else {
    item["birthday"](tryConvertOADateToDate(value));
  }
}

function tryConvertOADateToDate(t) {
  var _jsonOADateRegExp = new RegExp(
    "^/OADate\\(([-+]?(\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)\\)/\\s*$",
  );
  if (typeof t === "string" && t.charAt(0) === "/") {
    if (_jsonOADateRegExp.test(t)) {
      var x = t.match(_jsonOADateRegExp);
      t = fromOADate(parseFloat(x[1]));
    }
  }
  return t;
}

function fromOADate(oadate) {
  var offsetDay = oadate - 25569;
  var date = new Date(offsetDay * 86400000);
  var adjustValue = offsetDay >= 0 ? 1 : -1;
  return new Date(
    (oadate * 86400000 * 1440 +
      adjustValue -
      25569 * 86400000 * 1440 +
      date.getTimezoneOffset() * 86400000) /
      1440,
  );
}
```

### Java

```java
import java.util.Date;
import java.util.Calendar;
import java.text.SimpleDateFormat;
import java.text.ParseException;

public class Test {
    public static void main(String[] args) throws ParseException {
        long d = 44542;
        double mantissa = d - (long) d;
        double hour = mantissa * 24;
        double min = (hour - (long) hour) * 60;
        double sec = (min - (long) min) * 60;

        SimpleDateFormat myFormat = new SimpleDateFormat("dd MM yyyy");
        Date baseDate = myFormat.parse("30 12 1899");
        Calendar c = Calendar.getInstance();
        c.setTime(baseDate);
        c.add(Calendar.DATE, (int) d);
        c.add(Calendar.HOUR, (int) hour);
        c.add(Calendar.MINUTE, (int) min);
        c.add(Calendar.SECOND, (int) sec);

        System.out.println(c.getTime());
    }
}
```

### C# / .NET

```csharp
System.DateTime.FromOADate(44542);
```

---

## FAQ 6: String-Formatted Dates in Data Bindings Do Not Auto-Format

### Description

If date values are bound to the data source as raw strings, the spreadsheet's display formatter will not parse them automatically.

To resolve this, use the `value` method in the column configuration to act as a converter between the raw data source and the cell display value:

```javascript
tableColumn1.value(function (item, value) {
  if (arguments.length > 1) {
    // Setter: Parse OADate string to formatted date string
    var oaTest = new RegExp(
      "^/OADate\\(([-+]?(\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)\\)/\\s*$",
    );
    if (oaTest.test(value)) {
      var x = value.match(oaTest);
      var formatter = new GC.Spread.Formatter.GeneralFormatter("yyyy-mm-dd");
      item["date"] = formatter.format(new Date(parseFloat(x[1])));
    } else {
      item["date"] = value;
    }
  } else {
    // Getter: Return parsed Date object to the sheet
    return new Date(item.date);
  }
});
```

_Note: The check `arguments.length > 1` distinguishes between the getter and setter phases of the data binding lifecycle. The block runs as a setter when data synchronizes from the sheet to the data source, and as a getter when loading data into the sheet._

See the GrapeCity Help Forum thread for more details: [Date Format Conversion in Data Binding](https://gcdn.grapecity.com.cn/showtopic-184249-1-1.html).

---

## FAQ 7: How to Embed a Date Picker inside SpreadJS

To embed a date/time picker inside spreadsheet cells, follow the official tutorial: [SpreadJS DateTimePicker Demo](https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/features/cells/drop-downs/date-time-picker/purejs).
