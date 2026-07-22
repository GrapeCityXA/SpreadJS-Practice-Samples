# SpreadJS Data Binding Basic Example

This example demonstrates the complete workflow of using SpreadJS's data binding feature, including designing form templates, loading data, cell/table two-way data binding, and retrieving/saving modified data.

---

## Core Scenarios & Solutions

### Problem: How to save JSON-formatted sheet fields to a database table?

For form-filling requirements, SpreadJS provides the following core capabilities:

1. **Entire Workbook Save & Load**:
   - **Save**: To save the state of the entire workbook (including styles, formulas, and structure), retrieve the full serialized JSON object via `JSON.stringify(spread.toJSON())` and send it to the server. Starting from SpreadJS V16, direct import/export of the new `.sjs` compressed file format is also supported.
   - **Load**: Fetch the JSON string from the database or file, and call `spread.fromJSON(JSON.parse(jsonString))` on the client side to restore it.

2. **Field-Level / Table Data Binding (Focus of this example)**:
   - If you only need to associate and bind **specific cell fields** or **data tables** in the sheet to corresponding fields in your business database, you can leverage SpreadJS's **Data Binding** feature.

---

## Step-by-Step Implementation Guide

### 1. Design the Data Binding Template

You can use the SpreadJS Desktop Designer or the [Online Web Designer](https://demo.grapecity.com.cn/SpreadJS/WebDesigner/) to visually design your templates:

- Under the **Data** tab in the ribbon, select **Sheet Binding** to define your data source schema structure.
- Drag the defined text fields or tables to the corresponding target cells on the worksheet to map the binding paths.
- Export the designed template as a `.ssjson` or `.sjs` file, which can be reused as a template for subsequent business operations.

![Template Design](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260309.788095.png?width=400)

### 2. Load the Template

In your frontend application, fetch the template file from the server, and open it in SpreadJS using the `fromJSON` method:

```javascript
// myTemplate is the fetched template JSON object
spread.fromJSON(myTemplate);
```

### 3. Set Up Data Binding

Bind your business data source (JSON object or array) to the worksheet. SpreadJS will automatically populate the cells according to the binding paths configured in the template:

```javascript
// dbSource is your business data source (can be retrieved from a backend API or constructed on the frontend)
let dataSource = new GC.Spread.Sheets.Bindings.CellBindingSource(dbSource);
sheet.setDataSource(dataSource);
```

### 4. Modify & Retrieve Updated Data Source

Once the user edits the cell values on the page, the changes are automatically synchronized back to the bound data source. You can retrieve the updated JSON data and send it to your backend when saving:

```javascript
// Retrieve the updated data source object
let updatedData = sheet.getDataSource().getSource();
console.log(updatedData);

// Send updatedData to your server API to save it to the database
```

![Get Data Source](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260309.b4c5d7.png?width=400)

---
