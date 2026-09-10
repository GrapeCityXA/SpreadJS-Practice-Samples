# camershape-to-image

### 问题：如何将照相机选中的区域转换为图片

***

#### 背景：

spreadjs区域快照功能目前有很多客户在使用，有时候，我们想要把快照直接保存为图片导出，spreadjs目前也没有直接保存图片方法可以将区域快照转换为图片,但是通过获取到对应的canvas可以这样来转换并导出图片

#### 方案：

区域快照对象通过cameraShapeBuffer获取到对应的canvas，再通过toDataURL即可转换为对应格式图片的base64数据，比如下面的代码，转换为了png，然后下载即可
获取到base64数据，注意，新老版本的接口有点变化：

```auto
// 新版本
let imgUrl = sheet.shapes.get("camera shape 1").toImageSrc()
// 老版本
let imgUrl = sheet.cameraShapes[0].cameraShapeBuffer.toDataURL('image/png')
```

下载图片，传入上面返回的imgUrl

```auto
function downloadImg(imgUrl) {
    let aLink = document.createElement("a"); // 创建一个a标签
    let blob = base64ToBlob(imgUrl);
    let event = document.createEvent("HTMLEvents");
    event.initEvent("click", true, true);
    let date = new Date()
    aLink.download = date.getTime() + "." + blob.type.split("/")[1]; // 使用时间戳给文件命名
    aLink.href = URL.createObjectURL(blob);
    aLink.click();
}
```

其中，base64ToBlob方法的实现如下，它可以将上述的base64数据（imgUrl）转换为图片blob流：：

```auto
function base64ToBlob(code) {
    let parts = code.split(";base64,");
    let contentType = parts[0].split(":")[1];
    let raw = window.atob(parts[1]);
    let rawLength = raw.length;
    let uint8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; i++) {
        uint8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uint8Array], { type: contentType });
}
```

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
