# Integrate ECharts and Export to PDF in SpreadJS

This example demonstrates how to integrate the popular visualization library **ECharts** into SpreadJS spreadsheets, enabling dynamic interactions between data grids and charts, as well as supporting exporting worksheets containing custom charts directly to PDF files.

Three types of ECharts graphs (bar, pie, line) are embedded into the spreadsheet as SpreadJS Floating Objects. When users modify cell values in the table, the charts automatically refresh to maintain data consistency.

This design is suitable for scenarios requiring rich data visualizations within spreadsheets and options to download formatted reports as PDFs for business archives.

---

## Core Scenarios & Solutions

- **Third-party Chart Integration**: Standard spreadsheet charts are limited. Integrating ECharts unlocks hundreds of visualization templates and interactive chart types.
- **Bi-directional Data Linking**: Captures grid edits and redraws charts in real time.
- **Exporting Canvas Charts to PDF**: ECharts charts are rendered on HTML Canvas elements, which are ignored by standard spreadsheet-to-PDF exporters. This example resolves this by converting Canvas nodes into base64 images and replacing the Floating Objects with Picture Objects in a temporary workbook during export.
- **Performance Lazy Loading**: Loading many charts at once can slow down rendering. This example uses viewport scroll handlers to instantiate ECharts components only when their boundaries enter the view area.

---

## Implementation Details

### 1. Embed ECharts Containers using Floating Objects

SpreadJS Floating Objects allow overlaying custom HTML elements on top of the cell grid. This function creates container divs and positions them at precise row and column coordinates:

```javascript
function initFloatingObject(sheet, chart) {
  // Initialize a new Floating Object
  var customFloatingObject =
    new GC.Spread.Sheets.FloatingObjects.FloatingObject(chart.id);
  customFloatingObject.startRow(chart.startRow);
  customFloatingObject.startColumn(chart.startColumn);
  customFloatingObject.endColumn(chart.endColumn);
  customFloatingObject.endRow(chart.endRow);

  // Create ECharts wrapper div
  var div = document.createElement("div");
  div.innerHTML =
    '<div id="' + chart.id + '" style="width: 500px;height:300px; "></div>';
  $(div).css({
    background: "#FFFFFF",
  });

  // Mount the div and add the Floating Object to the sheet
  customFloatingObject.content(div);
  sheet.floatingObjects.add(customFloatingObject);
}
```

### 2. Configure Event-driven Data-to-Chart Syncing

Create standard SpreadJS Tables to serve as data sources and listen to the `ValueChanged` event to trigger chart refreshes when cells mutate:

```javascript
// Add Table from data source
var chartTable = sheet.tables.addFromDataSource(
  chart.tableName,
  chart.startRow + 1,
  1,
  chart.source,
  GC.Spread.Sheets.Tables.TableThemes.medium2,
);

// Listen to value changes
spread.bind(GC.Spread.Sheets.Events.ValueChanged, function (s, e) {
  var row = e.row;
  var col = e.col;

  for (var chart in charts) {
    var range = new GC.Spread.Sheets.Range(
      charts[chart].table.row,
      charts[chart].table.col,
      charts[chart].table.rowCount,
      charts[chart].table.colCount,
    );
    if (range.contains(row, col, 1, 1)) {
      refreshCharts(
        charts[chart].id,
        getChartDataFromTables(charts[chart].source),
      );
      break;
    }
  }
});
```

### 3. Implement Lazy Loading for Scroll Optimizations

Listen to the sheet's `TopRowChanged` event, checking the vertical scroll coordinate to load ECharts widgets only when their container rows come into view:

```javascript
spread.bind(GC.Spread.Sheets.Events.TopRowChanged, function (s, e) {
  var newTopRow = e.newTopRow;

  if (
    charts["bar"].startRow - defaultShowRows < newTopRow &&
    !charts["bar"].echart
  ) {
    initCharts(charts["bar"]);
  }
  // Repeat the check for other charts...
});
```

### 4. Convert Canvas Charts to Images during PDF Exports

To include the charts in the exported PDF, the script creates a temporary clone of the workbook, converts the ECharts Canvas elements into Base64 image strings, swaps the Floating Objects with standard Picture elements, and exports the workbook to PDF:

```javascript
$("#exportPDF").click(function () {
  // Clone workbook to protect active editor states
  tempSpread.fromJSON(
    JSON.parse(
      JSON.stringify(
        spread.toJSON({
          includeBindingSource: true,
        }),
      ),
    ),
  );

  let tempSheet = tempSpread.getSheet(0);

  for (var chart in charts) {
    // Remove the interactive Floating Object
    tempSheet.floatingObjects.remove(charts[chart].id);

    // Ensure the chart has been initialized
    if (!charts[chart].echart) {
      sheet.showCell(
        charts[chart].startRow,
        charts[chart].startColumn,
        GC.Spread.Sheets.VerticalPosition.top,
        GC.Spread.Sheets.HorizontalPosition.left,
      );
      initCharts(charts[chart]);
    }

    // Export chart canvas as Base64 image
    var img = charts[chart].echart.getDataURL();

    // Place the static image at the same coordinates
    var picture = tempSheet.pictures.add(charts[chart].id, img, 0, 0, 100, 100);
    picture.startRow(charts[chart].startRow);
    picture.startColumn(charts[chart].startColumn);
    picture.endColumn(charts[chart].endColumn);
    picture.endRow(charts[chart].endRow);
  }

  // Export PDF
  tempSpread.savePDF(
    function (blob) {
      saveAs(blob, "download.pdf");
    },
    function (error) {
      console.log(error);
    },
  );
});
```

---

## Technology Stack

- **SpreadJS 19.0.3**: Core spreadsheet components.
- **@grapecity-software/spread-sheets-pdf 19.0.3**: Workbook-to-PDF export handlers.
- **@grapecity-software/spread-sheets-print 19.0.3**: Sheet pagination configurations.
- **ECharts (latest)**: Interactive visualization charting engine.
- **file-saver 2.0.5**: Client-side downloader helper.
- **jQuery 3.6.1**: DOM manipulations.

---

## How to Run

### Installation & Execution

```bash
# Install packages
npm install
```

Open `index.html` using a local development web server (e.g. Live Server).

### Steps to Test

1. Open `index.html` in your browser. The page will initialize with three data tables.
2. Scroll down. The ECharts widgets will render automatically as they enter the viewport.
3. Modify numeric values inside any table row. The linked ECharts chart will update instantly.
4. Click **Export PDF**. The browser will download `download.pdf` containing the spreadsheet layout and the rendered charts.

---

## Features & Recommendations

### Pros

- **Interactive Charts**: Unlocks all ECharts features (like themes and advanced tooltips) inside SpreadJS.
- **Optimized Performance**: Lazy loading prevents rendering lag when loading multiple charts.
- **Reliable Exports**: Swapping Canvas nodes for static images ensures charts display correctly in the exported PDF.

### Recommendations for Production

- **PDF CJK Fonts**: To prevent Chinese/Japanese/Korean characters from displaying as gibberish in the exported PDF, configure a fallback font using `PDFFontsManager.fallbackFont`.
- **Disable Chart Animations**: Set `animation: false` in your ECharts configurations. This ensures charts are fully rendered when exporting them to images.

---

## Key Code Snippets

### Map Table Data to ECharts Format

```javascript
function getChartDataFromTables(tableSource) {
  var categoriesArr = [];
  var dataArr = [];
  for (var prop in tableSource[0]) {
    categoriesArr.push(prop);
    dataArr.push(tableSource[0][prop]);
  }
  return {
    categories: categoriesArr,
    data: dataArr,
  };
}
```

### Refresh Charts

```javascript
function refreshCharts(id, data) {
  var myChart = echarts.getInstanceByDom(document.getElementById(id));
  if (myChart) {
    switch (id) {
      case "barChart":
        myChart.setOption({
          xAxis: { data: data.categories },
          series: [{ data: data.data }],
        });
        break;
      case "pieChart":
        var dataArr = [];
        for (var i = 0; i < data.categories.length; i++) {
          dataArr.push({
            value: data.data[i],
            name: data.categories[i],
          });
        }
        myChart.setOption({
          legend: { data: data.categories },
          series: [{ data: dataArr }],
        });
        break;
    }
  }
}
```

---

## Summary

This case study shows how to integrate third-party visualization libraries in SpreadJS and export them to PDF. Key takeaways:

1. Creating custom overlays with `FloatingObject`.
2. Handling grid updates using `ValueChanged` event bindings.
3. Implementing lazy loading using scroll position detectors (`TopRowChanged`).
4. Staging PDF exports by cloning workbooks and converting HTML Canvas elements to static images.

This architecture is useful for corporate reporting sheets, dashboard views, and business reports.
