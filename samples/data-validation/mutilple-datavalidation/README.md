# Combine Multiple Validation Rules in SpreadJS

This example demonstrates how to implement data validation with multiple combined rules in SpreadJS. By leveraging the Conditional Formatting and Data Validation APIs, this solution implements complex date range verification logic. Specifically, it restricts user input in a designated column to dates falling between December 31, 2024, and December 31, 2025, automatically highlighting out-of-range inputs as invalid.

---

## Core Scenarios & Solutions

In enterprise business systems, data entries often require complex validation patterns, such as:

- Restricting values within specific ranges (e.g. project timelines, contract terms).
- Combining multiple constraints (e.g. validating that a value is greater than a minimum threshold but smaller than a maximum boundary).
- Highlighting invalid inputs immediately to guide user entry.

A single validation condition cannot address these needs. This example demonstrates how to combine multiple sub-conditions using logical operators (like `AND`) to create flexible validation rules.

---

## Implementation Details

### 1. Configure Base Conditions

Create two independent date conditions defining the lower and upper boundaries of the acceptable range:

```javascript
// Rule 1: Validate dates after or equal to December 31, 2024
var condition1 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
  GC.Spread.Sheets.ConditionalFormatting.ConditionType.dateCondition,
  {
    compareType:
      GC.Spread.Sheets.ConditionalFormatting.DateCompareType.afterEqualsTo,
    expected: new Date(2024, 11, 31),
  },
);

// Rule 2: Validate dates before or equal to December 31, 2025
var condition2 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
  GC.Spread.Sheets.ConditionalFormatting.ConditionType.dateCondition,
  {
    compareType:
      GC.Spread.Sheets.ConditionalFormatting.DateCompareType.beforeEqualsTo,
    expected: new Date(2025, 11, 31),
  },
);
```

Using the `dateCondition` type along with `afterEqualsTo` and `beforeEqualsTo` comparison types establishes the acceptable boundaries.

### 2. Combine Conditions Using Logical Operators

Combine the two base conditions into a single relation condition using a logical `AND` operator:

```javascript
// Combined Rule: Dates must fall between December 31, 2024 and December 31, 2025
var nCondition = new GC.Spread.Sheets.ConditionalFormatting.Condition(
  GC.Spread.Sheets.ConditionalFormatting.ConditionType.relationCondition,
  {
    compareType: GC.Spread.Sheets.ConditionalFormatting.LogicalOperators.and,
    item1: condition1,
    item2: condition2,
  },
);
```

This enforces the logic that both conditions must evaluate to true (i.e. date $\ge$ 2024/12/31 AND date $\le$ 2025/12/31).

### 3. Apply the Validator to the Target Range

Instantiate a `DefaultDataValidator` configuration object with the combined condition and apply it to the column range:

```javascript
var validator = new GC.Spread.Sheets.DataValidation.DefaultDataValidator(
  nCondition,
);
validator.type(GC.Spread.Sheets.DataValidation.CriteriaType.custom);
sheet
  .getRange(-1, 0, -1, 1, GC.Spread.Sheets.SheetArea.viewport)
  .validator(validator);
spread.options.highlightInvalidData = true;
```

- `getRange(-1, 0, -1, 1)` targets all cells within the first column (index 0).
- Enabling `highlightInvalidData` displays visual alerts (like red circles or borders) on cells containing invalid values.

---

## Technology Stack

- **SpreadJS v17.0.8**: Core spreadsheet engine.
- **SystemJS v0.19.22**: JavaScript module loading framework.

---

## How to Run

### Installation & Execution

```bash
# Install dependencies
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open the page in your browser. The first column is preloaded with two dates.
2. The date in the first row (`2025/10/31`) falls within the range, so it is displayed normally.
3. The date in the third row (`2026/01/31`) lies outside the boundary, so it is highlighted as invalid data.
4. Try inputting other dates in the first column:
   - Entering any date within the year 2025 saves normally.
   - Entering dates prior to December 31, 2024, or after December 31, 2025, triggers an invalid data highlight.

---

## Features & Recommendations

### Pros

- **Flexible Combinations**: Supports grouping multiple validation conditions using logical operators (`AND`/`OR`) to accommodate complex business rules.
- **Immediate Visual Alerts**: Enabling `highlightInvalidData` provides instant feedback to users when they input invalid values.
- **Highly Extensible**: Easily add more conditions or apply similar rules to other data types (such as numbers or text lengths).

### Recommendations for Production

- **Varying Data Types**: For non-date formats, use corresponding condition types (e.g. `numberCondition` or `textCondition`).
- **Provide Custom Error Messages**: Call `validator.errorMessage()` to define custom validation alerts, helping users understand why their input was rejected.
- **Display Input Tips**: Call `validator.inputMessage()` to show helper tooltips when users select the cell, guiding inputs beforehand.
- **OR Operator Scenarios**: Implement `LogicalOperators.or` to validate inputs that only need to satisfy one of several conditions.

---

## Key Code Snippets

### Full Validation Workflow Configuration

```javascript
// 1. Create sub-conditions
var condition1 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
  GC.Spread.Sheets.ConditionalFormatting.ConditionType.dateCondition,
  {
    compareType:
      GC.Spread.Sheets.ConditionalFormatting.DateCompareType.afterEqualsTo,
    expected: new Date(2024, 11, 31),
  },
);

var condition2 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
  GC.Spread.Sheets.ConditionalFormatting.ConditionType.dateCondition,
  {
    compareType:
      GC.Spread.Sheets.ConditionalFormatting.DateCompareType.beforeEqualsTo,
    expected: new Date(2025, 11, 31),
  },
);

// 2. Combine using logical AND
var nCondition = new GC.Spread.Sheets.ConditionalFormatting.Condition(
  GC.Spread.Sheets.ConditionalFormatting.ConditionType.relationCondition,
  {
    compareType: GC.Spread.Sheets.ConditionalFormatting.LogicalOperators.and,
    item1: condition1,
    item2: condition2,
  },
);

// 3. Create and apply the validator
var validator = new GC.Spread.Sheets.DataValidation.DefaultDataValidator(
  nCondition,
);
validator.type(GC.Spread.Sheets.DataValidation.CriteriaType.custom);
sheet
  .getRange(-1, 0, -1, 1, GC.Spread.Sheets.SheetArea.viewport)
  .validator(validator);

// 4. Highlight invalid entries
spread.options.highlightInvalidData = true;
```

---

## Summary

This case study shows how to implement multi-rule data validations in SpreadJS. Key learning points:

1. Creating validation conditions using `ConditionalFormatting.Condition`.
2. Combining conditions with `relationCondition` and logical operators.
3. Applying validators to specific cell ranges.
4. Toggling visual invalid data highlights on the sheet.

This pattern is highly useful for data entry forms, file importing checklists, and templates requiring cell value restrictions.
