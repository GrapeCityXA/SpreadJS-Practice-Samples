### 问题：如何实现输入提示？

***

Placeholder 是一个很常用的功能，可以向用户提供有关输入字段所期望的值或格式的提示。
那么在SpreadJS中该如何实现呢？

#### 一、watermark

SpreadJS提供了 watermark 样式属性，它的作用如名称所示，可以在单元格中设置水印效果。
这和我们所说的”placeholder“有类似的样式效果。
效果如下：
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.1f9487.png?width=400)

参考代码：

```js
var type = new GC.Spread.Sheets.Style();
type.watermark = "请输入用户名：";
sheet.setStyle(0, 1, type);
```

#### 二、DefaultValue

除了水印功能，SpreadJS在v16版本推出了[默认值](https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/features/cells/cell-default-value/purejs)的功能，用户可以设置默认值，如
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.735396.png)
用户可以在默认值基础上编辑，输入真正的默认值。
用法如下：

```javascript
sheet.setDefaultValue(1,1,'请输入邮箱')
```

或者是

```javascript
sheet.getCell(2,2).defaultValue('请输入密码')
```

#### 三、掩码

关于掩码的描述，可以 参考[gitHub](https://github.com/RobinHerbots/Inputmask)的详细介绍。
输入[掩码](https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/features/cells/mask/purejs)通过确保预定义的格式来帮助用户进行输入。这对于日期、数字、电话号码等很有用。
如果想设置此单元格电话号码：

```javascript
 var style = new GC.Spread.Sheets.Style();
    style.mask = {
        pattern: '[a0]{1,}@[a0]{1,}.(com|cn|gov|edu)'
    }
```

通过上述代码，直接在style中定义mask ,可以校验Email地址。那么它与数据验证的关系是什么呢？
数据验证是数据输入后验证数据的有效性，但是掩码可以在输入过程中校验，如果输入不符合的内容，将输入无效。
如下图所示：当单元格获取焦点时，提示\_@\_.com
![image](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/b33c4f64-6b99-4132-a675-8dc7b59765f1/image.5be5d1.png)

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/4kfecqiCiE6BXuHtMScL7w/){:target="_blank"}）
