import * as GC from "@grapecity-software/spread-sheets";

import bindCustomNameBox from "./nameMgr/nameMgrCore";



let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
bindCustomNameBox(spread, "btn")