### 问题:为什么导出成PDF后，图片丢失？

#### 背景：

由用户在导出PDF后，发现图片丢失，深入调研后发现，其丢失的图片实际是一个图片链接hotlinking，\*\*image."https://www.wmtst.com/download/0/user/signature/27026952870796083220200606192249.png"。
直接点击此里链接，发现触发了浏览器的安全策略的，也就是浏览器拿不到这个图片资源，因此画布无法渲染出该图像。
找到了问题所在，如何解决该问题呢？

#### 解决方案：

我们提供了一个有效的方案：在添加到SpreadJS之前，我们将图片改为base64编码

```js
let imageUrl = 'http://xxxx/xx';            
let xhr = new XMLHttpRequest();
xhr.onload = function () {
    let reader = new FileReader();
    reader.onloadend = function () {
        console.log(reader.result);
    }
    reader.readAsDataURL(xhr.response);
};
xhr.open('GET', imageUrl);
xhr.responseType = 'blob';
xhr.send(); 
```

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/1rjPKNcEdUuCyonwwR8qKQ/){:target="_blank"}）
