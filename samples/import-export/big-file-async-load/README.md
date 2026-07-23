# On-Demand (Lazy) Loading for Large Excel Files in SpreadJS

This example demonstrates how to implement an on-demand (lazy) loading performance optimization pattern in SpreadJS for large Excel files containing multiple worksheets. Loading all sheets and their data at once can result in browser freezing, lag, and high memory consumption. By implementing a "lazy loading" strategy, the system only loads data for the first worksheet during initialization and creates empty placeholder worksheets for the remaining sheets. The data for other sheets is fetched and loaded dynamically only when the user clicks on their respective tabs. This approach improves initial loading performance and user experience significantly.

---

## Core Scenarios & Solutions

- **Slow Initial Load**: For Excel workbooks containing dozens or hundreds of sheets, loading everything at once blocks the browser's main thread and results in a long, non-responsive loading state.
- **High Memory Footprint**: Users often view only a few tabs during a session. Pre-loading all tabs wastes significant browser memory.
- **Poor User Experience**: By loading on-demand, users can view and interact with the main worksheet almost immediately without waiting for the entire workbook to download and render.

---

## Implementation Details

### 1. Preload Worksheet Structures (Metadata Only)

During initialization, the backend analyzes the Excel file structures to extract sheet names. The frontend creates empty placeholder worksheets based on this list, showing only the tab headers without actual data:

```javascript
// Sheet name list parsed by the backend
const sheetList = [
  "Summary Check",
  "00 Financial & Legal Docs",
  "Instructions",
  // ... more sheet names
];

// Remove the default worksheet
spread.removeSheet(0);

// Create empty placeholder sheets in bulk
sheetList.forEach((v, index) => {
  spread.addSheet(0, new GC.Spread.Sheets.Worksheet(v));
});

// Set the default active sheet
activeName = "Summary Check";
spread.setActiveSheet("Summary Check");
```

### 2. On-Demand Data Loading Trigger

Listen to the `SheetTabClick` event. When the user switches to a worksheet, check if its data has already been loaded. If not, trigger the data loading logic:

```javascript
// Array to track worksheets that have already loaded data
let loadDataSheets = [];
let activeName = "";

// Bind worksheet tab click event
spread.bind(GC.Spread.Sheets.Events.SheetTabClick, (e, args) => {
  activeName = args.sheetName;
  // Load data only when switching to the sheet for the first time
  if (loadDataSheets.indexOf(activeName) === -1) {
    spread.suspendPaint();
    loadSheetData();
    loadDataSheets.push(activeName);
  }
});
```

### 3. Loading Performance Tuning

When writing data to the sheet, suspend workbook painting and calculation services to minimize rendering delays. Resume the services once the data writing operations are complete:

```javascript
function loadSheetData() {
  let sheetIndex = spread.getSheetIndex(activeName);

  // Enable calculate-on-demand mode
  spread.options.calcOnDemand = true;
  // Suspend calculation service
  spread.suspendCalcService(true);

  // Load cell values (in production, fetch this data from a server API)
  spread.getSheet(sheetIndex).setValue(0, 0, activeName);

  // Resume calculation service without forcing recalculation of existing formulas
  spread.resumeCalcService(false);
  // Resume workbook rendering
  spread.resumePaint();
}
```

---

## Technology Stack

- **SpreadJS 15.0.0**: Core spreadsheet component.
- **SystemJS 0.19.22**: JavaScript module loading framework.
- **TypeScript 4.1.2**: Scripting language support.

---

## How to Run

### Installation & Execution

```bash
# Install dependencies
npm install

# Open index.html directly in a browser
```

### Steps to Test

1. Launch the page in your browser. You will see a large number of sheets (81 in total) listed at the bottom.
2. Initially, only the first tab ("明细表检查" or "Summary Check") has data loaded.
3. Click any other worksheet tab. The application dynamically loads data for that worksheet on the fly.
4. Verify that "loaded..." is outputted to the developer console once loading is complete.
5. Switching back to an already loaded sheet does not trigger redundant load calls.

---

## Features & Recommendations

### Pros

- **Fast Application Startup**: Minimizes initial script processing delays, giving users immediate access.
- **Memory Friendly**: Limits memory usage to tabs actually visited by the user.
- **Smooth Interaction**: Suspending layout rendering and engine calculations ensures seamless transitions.
- **High Scalability**: Scales to workbooks with thousands of sheets.

### Limitations & Recommendations for Production

- **Mock Data Loading**: The demo uses `setValue` to mock the loading behavior. Real-world implementations should fetch JSON payloads asynchronously from a backend API.
- **Recommended Enhancements**:
  - Add visual loading spinners or placeholder skeletons while fetching sheet JSON.
  - Implement sheet pre-fetching strategies (e.g. pre-load adjacent worksheets).
  - Add client-side data caches to avoid requesting already loaded worksheets.
  - For projects using SpreadJS 16+, check the official Lazy Loading API documentation for advanced built-in features.

---

## Key Code Snippets

### Initial Calculations Configuration

```javascript
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
  calcOnDemand: true, // Enable calculate-on-demand mode
});
```

### Data Load Routine

```javascript
function loadSheetData() {
  let sheetIndex = spread.getSheetIndex(activeName);

  // Real-world implementation would fetch data asynchronously
  // let sheetJson = await getSheetJson(urlinfo);

  spread.options.calcOnDemand = true;
  spread.suspendCalcService(true);
  spread.getSheet(sheetIndex).setValue(0, 0, activeName);

  console.log("loaded...");
  spread.resumeCalcService(false);
  spread.resumePaint();
}
```

---

## Summary

This case study provides a practical optimization pattern for high-capacity files with many sheets. Key takeaways:

1. Binding event listeners to manage state transitions on-demand.
2. Controlling performance using `suspendPaint`, `suspendCalcService`, and `calcOnDemand`.
3. Creating dynamic workflow models to stream data from backend services.
4. Balancing browser memory and performance.

This lazy loading architecture is highly applicable to enterprise financial planning modules, large database grid exports, and complex multi-tab reporting tools.
