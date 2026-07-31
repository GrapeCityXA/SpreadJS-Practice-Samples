# Simulate Real-Time Data (RTD) Functions in SpreadJS

This example demonstrates how to implement an asynchronous data fetching feature in SpreadJS, simulating Excel's native RTD (Real-Time Data) functions. By creating a custom async function, cells are updated in real time. We also apply a debouncing strategy to control data request frequencies, ensuring that the system issues at most 1 batch request per second to reduce server-side load.

This design is suitable for scenarios where spreadsheet cells need to fetch external data asynchronously and refresh contents in real time, such as live stock tickers, sensor data dashboards, or dynamic reports.

---

## Core Scenarios & Solutions

- **Asynchronous Data Loading**: Resolves requests where cells depend on external API responses without blocking the main browser thread.
- **Request Throttling**: Merges multiple cell requests within a 1-second window into a single batch query, avoiding performance bottlenecks caused by high-frequency API hits.
- **Real-time Recomputations**: Mimics Excel's RTD formulas, automatically triggering recalculations when dependent cells are updated.

---

## Implementation Details

### 1. Extend the AsyncFunction Base Class

Inherit from `GC.Spread.CalcEngine.Functions.AsyncFunction` to register a custom `RTD` formula class:

```javascript
function rtd() {
  this.maxArgs = 3;
  this.minArgs = 1;
  this.name = "rtd";
  this.typeName = "ASUM_TYPE";
}

rtd.prototype = new GC.Spread.CalcEngine.Functions.AsyncFunction(
  "RTD",
  1,
  255,
  {
    description:
      "Adds two cell values and appends a randomized value asynchronously",
  },
);

// Configure arguments to accept cell coordinate references
rtd.prototype.acceptsReference = function (idx) {
  return idx === 0 || idx === 1;
};

// Display temporary loading placeholders while fetching
rtd.prototype.defaultValue = function () {
  return "Loading...";
};

// Implement asynchronous evaluation logic
rtd.prototype.evaluateAsync = function (context, arg1, arg2) {
  let uuid = genUuid();
  let v1 = arg1
    .getSource()
    .getSheet()
    .getValue(arg1.getRow(0), arg1.getColumn(0));
  let v2 = arg2
    .getSource()
    .getSheet()
    .getValue(arg2.getRow(0), arg2.getColumn(0));
  fetchData(uuid, v1 + v2, function (res) {
    context.setAsyncResult(res);
  });
};
```

### 2. Batch Request Debouncing

Buffer request items inside a temporary cache object and trigger a single batch HTTP mock payload after a 1-second timeout:

```javascript
let tempRes = {};
let timer = null;

function fetchData(uuid, arg, callback) {
  // Store request metadata
  tempRes[uuid] = {
    arg: arg,
    callback: callback,
  };
  clearTimeout(timer);
  // Trigger bulk request if no new mutations occur within 1 second
  timer = setTimeout(() => {
    // Mock server API delay (1 second)
    setTimeout(() => {
      console.log("Batch API query triggered!");
      Object.keys(tempRes).forEach((uuid) => {
        tempRes[uuid].callback(Math.random() + tempRes[uuid].arg);
      });
      tempRes = {};
      timer = null;
    }, 1000);
  }, 1000);
}
```

### 3. Register Custom Class Types

Override the `getTypeFromString` parser so the engine can serialize and deserialize the custom function type properly:

```javascript
const originalGetType = GC.Spread.Sheets.getTypeFromString;
GC.Spread.Sheets.getTypeFromString = function (typeString) {
  if (typeString === "ASUM_TYPE") {
    return rtd;
  }
  return originalGetType.apply(this, arguments);
};
```

---

## Technology Stack

- **SpreadJS 19.0.3**: Core spreadsheet engine.
- **SpreadJS Designer 17.0.8**: Interactive editor container.
- **SystemJS 0.19.22**: Module loading.

---

## How to Run

### Installation & Execution

```bash
# Install dependencies
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open the page in your browser. The grid will load and populate column `A` and `B` with integers.
2. After a 1-second delay, columns `C` will apply formulas `=RTD(A2, B2)`, `=RTD(A3, B3)`, and `=RTD(A4, B4)`.
3. The cells in column `C` will display "Loading..." temporarily.
4. After another 2 seconds, the cells resolve, displaying the evaluated results (Sum + Random Value).
5. Modify values inside column `A` or `B`. Verify that column `C` displays "Loading..." and recalculates.
6. Check your browser developer console. You will see that several requests were merged into a single "Batch API query triggered!" log.

---

## Features & Recommendations

### Pros

- **Request Optimization**: Aggregating queries drastically cuts HTTP request overhead and server processing load.
- **Loading Feedback**: Displaying placeholder text (e.g. "Loading...") prevents users from assuming the editor has frozen.
- **Auto-Update bindings**: Re-computes outputs automatically when parameter cells change values.

### Recommendations for Production

- **Backend Mappings**: Swap the mock setTimeout function with actual REST or GraphQL batch query endpoints.
- **Caching**: Implement a request cache key dictionary to prevent sending queries for duplicate input variables.
- **Error States**: Handle server failures by returning descriptive error labels using `context.setAsyncResult()`.

---

## Key Code Snippets

### UUID Generation

```javascript
function genUuid() {
  let timestamp = new Date().getTime();
  let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      const r = ((timestamp + Math.random() * 16) % 16) | 0;
      timestamp = Math.floor(timestamp / 16);
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    },
  );
  return uuid;
}
```

### Initial Data Layouts

```javascript
sheet.setValue(1, 0, 1);
sheet.setValue(2, 0, 2);
sheet.setValue(3, 0, 3);
sheet.setValue(1, 1, 4);
sheet.setValue(2, 1, 5);
sheet.setValue(3, 1, 6);
sheet.setValue(0, 2, "C = A + B + Random");

setTimeout(() => {
  sheet.setFormula(1, 2, "=RTD(A2, B2)");
  sheet.setFormula(2, 2, "=RTD(A3, B3)");
  sheet.setFormula(3, 2, "=RTD(A4, B4)");
}, 1000);
```

---

## Summary

This case study shows how to implement custom calculations in SpreadJS. Key takeaways:

1. Creating custom formulas by extending `AsyncFunction`.
2. Resolving arguments referencing other cells using `acceptsReference`.
3. Returning values asynchronously using `context.setAsyncResult`.
4. Delaying calls using debounce strategies.
5. Serializing class identifiers in string parsers.

This scheme is highly useful for corporate spreadsheets displaying stock prices, currency updates, IoT feeds, and real-time report summaries.
