import * as GC from "@grapecity-software/spread-sheets";
import { getData } from "./data.js";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();
sheet.setDataSource(getData());
