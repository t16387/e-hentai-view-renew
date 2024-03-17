<p align="center">
  <img width="144px" height="144px" src="https://raw.githubusercontent.com/IronKinoko/asset/master/e-hentai-view/icon.png"/>
</p>

<h1 align="center">EHentaiView 常見問題</h1>

## 1. IOS 看不到畫廊圖片

**需要關閉 Safari 的`阻止跨網站跟蹤`才能正常查看預覽圖**

`設置 -> Safari瀏覽器 -> 關閉“阻止跨網站跟蹤”`

<div style="display: flex;">
<img src="https://raw.githubusercontent.com/IronKinoko/asset/master/e-hentai-view/setting.PNG" width="25%" title="設置"/>
<img src="https://raw.githubusercontent.com/IronKinoko/asset/master/e-hentai-view/safari.PNG" width="25%" title="Safari瀏覽器"/>
</div>

## 2. IOS PWA 模式下切換應用後界面卡死

這是`IOS 13.x`版本的 bug, 你可以升級`IOS14`徹底解決這個問題

`設置 -> 通用 -> 軟件更新`

## 3. mac 系統 Safari 瀏覽器看不到圖片

**需要關閉 Safari 的`阻止跨網站跟蹤`才能正常查看預覽圖**

`Safari 瀏覽器 -> 偏好設置 -> 隱私 -> 關閉“阻止跨站跟蹤”`

## 4. Windows 瀏覽器看不到畫廊圖片

**這個問題常見於瀏覽器版本過高,Cookie 安全策略變更導致看不到圖**

如果你正在使用下列瀏覽器:

- Chrome 瀏覽器,並且版本>=80
- 新版 edge 瀏覽器(chrome 內核)

請執行以下操作:

- 覆制一段 [JavaScript 代碼](https://raw.githubusercontent.com/IronKinoko/asset/master/e-hentai-view/fixChromeExhentaiCookie.js)
- 訪問 [exhentai.org](https://exhentai.org)
- 按下`F12`, 點擊`控制台(console)`標簽
- 粘貼代碼並`回車(Enter)`執行
- 返回 EhentaiView 刷新頁面,即可正常查看圖片
