### 问题：如何自定义纸张尺寸的对话框

***

#### 背景：

当前组件版编辑器支持用户选择纸张类型，但是如果要自定义纸张的宽高，目前没有提供对应的UI界面。页面设置对话框中也无法设置。

#### 实现方法：

先来看一下UI具体的效果：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260313.934f55.png?width=400)
1\. 添加一个对话框模板template
对话框模板定义了对话框中的元素。可以看到里面添加了2个NumberEditor，并且bindingPath分别为width和height，用于绑定宽高变量。
2\. 新建一个命令，用于弹出对话框
这段代码新建了一个命令，通过调用showDialog方法，传入了宽高参数，弹出刚刚创建的对话框，并且在对话框确认关闭后拿到修改的数据来进行应用。
3\. 应用上述模板和命令到编辑器中
4\. 处理页面设置对话框重置纸张宽高的问题
由于编辑器本身不支持自定义纸张尺寸，所以页面设置对话框在关闭时会把sheet的自定义纸张宽高重置为0，需要监听这个操作来避免此问题。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/V82jhwOYrUeO2-wILusIbQ/){:target="_blank"}）
