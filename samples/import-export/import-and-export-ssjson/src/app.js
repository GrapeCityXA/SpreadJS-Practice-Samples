import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";
/**
 * 导入：加载本地.ssjson文件上传到浏览器，解析json文件实例化spread对象,显示到页面。
 * 导出：将当前spread保存为ssjson文件
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
function loadSsjson() {
  let file = document.getElementById("fileDemo").files[0];
  let reader = new FileReader();
  reader.readAsText(file, "UTF-8");
  reader.onload = function (e) {
    let fileStr = e.target.result;
    alert(fileStr);
    let jsonObj = JSON.parse(fileStr);

    spread.fromJSON(jsonObj);
  };
}

function exportSsjon() {
  let fileJson = JSON.stringify(spread.toJSON());
  let eleLink = document.createElement("a");
  eleLink.setAttribute("id", "download");
  eleLink.download = "test.ssjson";
  eleLink.style.display = "none";
  // 字符转转换为blob对象
  let blob = new Blob([fileJson]);
  eleLink.href = URL.createObjectURL(blob);
  document.body.appendChild(eleLink);
  // 触发点击
  eleLink.click();
  // 然后移除
  document.body.removeChild(eleLink);
}

document.getElementById("loadSsjon").onclick = loadSsjson;
document.getElementById("exportSsjson").onclick = exportSsjon;
