# Implement custom EVALUATE function in SpreadJS

This example demonstrates how to implement a custom function in SpreadJS that mimics Excel's macro-enabled `EVALUATE` function. The `EVALUATE` function dynamically parses and calculates formula strings in real-time, which is useful when formulas need to be constructed and executed dynamically.

By inheriting from SpreadJS's `CalcEngine.Functions.Function` class, this example creates a custom `EVALUATE` function to calculate formula strings on the fly.

---

## Core Scenarios & Solutions

- **Dynamic Formula Evaluation**: In certain workflows, formula strings are generated dynamically based on user choices or databases instead of being hardcoded into cell attributes. The `EVALUATE` function translates these string formulas into actual mathematical results.
- **Excel Compatibility**: SpreadJS does not support Excel's macro-enabled `EVALUATE` function by default. Implementing this custom function helps preserve formula compatibility when migrating spreadsheets from Excel.

---

## Implementation Details

### 1. Extend the Function Class

Create a custom function class by subclassing `GC.Spread.CalcEngine.Functions.Function`, defining the function name and parameter bounds:

```javascript
function FactorialFunction() {
  this.name = "EVALUATE"; // Formula name to register
  this.maxArgs = 1; // Maximum argument count
  this.minArgs = 1; // Minimum argument count
}
FactorialFunction.prototype = new GC.Spread.CalcEngine.Functions.Function();
```

### 2. Override Lifecycle Methods

Override three key methods to implement the custom formula logic:

- `acceptsReference()`: Configure whether the function accepts cell coordinate references as inputs.
- `isContextSensitive()`: Mark the function as context-sensitive (dependent on the active sheet context).
- `evaluate()`: Implement the core math resolver, parsing and evaluating the formula string using the `evaluateFormula` API.

```javascript
// Accept cell references
FactorialFunction.prototype.acceptsReference = function () {
  return true;
};

// Mark as context-sensitive
FactorialFunction.prototype.isContextSensitive = function () {
  return true;
};

// Evaluate formula string
FactorialFunction.prototype.evaluate = function (arg) {
  let formulaString = arg.Lf.arguments[0].value;

  // Evaluate the formula string directly without writing it to a cell
  let value = GC.Spread.Sheets.CalcEngine.evaluateFormula(
    sheet,
    formulaString,
    0,
    0,
  );
  return value;
};
```

### 3. Register and Use the Function

Register the custom function with the worksheet using `addCustomFunction`. Once registered, you can use it in cell formulas:

```javascript
let factorial = new FactorialFunction();
sheet.addCustomFunction(factorial);

// Evaluate the sum of A1 and A2
sheet.setFormula(3, 0, '=EVALUATE("SUM(A1:A2)")');
```

---

## Technology Stack

- **@grapecity-software/spread-sheets**: 19.0.3 (Core Engine).
- **SystemJS**: 0.19.22 (Module Loader).
- **TypeScript**: 4.1.2.

---

## How to Run

### Installation & Execution

```bash
# Install dependencies
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open the page in your browser. Cells `A1` and `A2` are preloaded with the values `2` and `3`.
2. Click **Add a Custom Function** at the top of the page.
3. Observe cell `A4`, which displays the calculated result `5` (the sum of `A1` and `A2`).
4. Modify the values in cell `A1` or `A2`. Cell `A4` will recalculate automatically.

---

## Features & Recommendations

### Pros

- **High Flexibility**: Build and calculate any valid SpreadJS formula string on the fly.
- **Excel Compatibility**: Replicates the macro-enabled `EVALUATE` function to ease workbook migrations.
- **Extensibility**: Serve as a boilerplate to build custom calculators using SpreadJS's custom function framework.

### Recommendations for Production

- **Error Handling**: The basic code does not handle invalid formula strings. Wrap `evaluateFormula()` in a `try-catch` block to handle syntax errors gracefully.
- **Caching**: Implement a cache map to store calculations for duplicate formula strings, optimizing performance for frequently called cells.

---

## Key Code Snippets

### The `evaluateFormula` API

The `evaluateFormula` API evaluates formula strings directly without needing to assign them to cells:

```javascript
// Parameter descriptions:
// sheet: worksheet context
// formulaString: formula string to evaluate
// 0, 0: base coordinate (used to resolve relative cell references)
let value = GC.Spread.Sheets.CalcEngine.evaluateFormula(
  sheet,
  formulaString,
  0,
  0,
);
```

---

## Summary

This case study shows how to implement custom formulas in SpreadJS. Key takeaways:

1. Creating custom formulas by inheriting from `CalcEngine.Functions.Function`.
2. Setting properties like `acceptsReference` and `isContextSensitive`.
3. Resolving formula strings programmatically using `evaluateFormula`.
4. Registering custom functions using `addCustomFunction`.

This pattern is highly useful for building dynamic calculation builders, importing complex Excel workbooks, and executing run-time formulas.
