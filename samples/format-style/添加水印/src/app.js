import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-print"
import html2canvas from 'html2canvas';

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

let pic
html2canvas(document.getElementById("capture")).then(function (canvas) {
    pic = canvas.toDataURL()
    spread.options.backgroundImage = pic
    spread.options.backgroundImageLayout = GC.Spread.Sheets.ImageLayout.none;
    setTimeout(() => {
        document.getElementById("ssvp_vp").style.backgroundRepeat = "repeat"

    }, 10);
})



