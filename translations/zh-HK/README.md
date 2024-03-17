<p align="center">
  <img width="144px" height="144px" src="https://raw.githubusercontent.com/IronKinoko/asset/master/e-hentai-view/icon.png"/>
</p>

<h1 align="center">EHentaiView</h1>

[English](/README.md) | 簡體中文

**如果 Chrome 瀏覽器版本>=84，則會造成的無法查看圖片** [點此修覆](./FAQ.md#4-windows-瀏覽器看不到畫廊圖片)

**_如果你習慣在 PC 端瀏覽 exhentai，可以使用[IronKinoko/e-hentai-infinite-scroll](https://github.com/IronKinoko/e-hentai-infinite-scroll)_**

## 截圖

<div style="display: flex;">
<img src="https://raw.githubusercontent.com/IronKinoko/asset/master/e-hentai-view/dark-zh.png" width="25%" title="home"/>
<img src="https://raw.githubusercontent.com/IronKinoko/asset/master/e-hentai-view/light-en.png" width="25%" title="home" />
<img src="https://raw.githubusercontent.com/IronKinoko/asset/master/e-hentai-view/detail.png" width="25%" title="detail"/>
</div>

## 項目定位

項目主要服務於 IOS, 其他設備可以查看[同類推薦](#同類推薦)

項目采用 PWA 技術, 用瀏覽器頁面模擬原生 APP, 便於分發維護

項目部署在谷歌雲上, 需要翻墻訪問. **網頁中 ex 的圖源並不需要翻墻**

## 特色

1. 該項目添加了 PWA 功能，可以在 ios/android 安裝到桌面使用
2. 該項目適配了手機/PC 端，讓手機看 exhentai 更方便

## 使用

**由於存在跨域問題，無法直接使用 exhentai 的圖片，你需要先登錄過 e-hentai**

項目目前只在 docker 中運行

```
docker run -d -p 80:8080 --restart always ironkinoko/e-hentai-view
```

瀏覽器訪問 http://localhost

更多查看 https://hub.docker.com/r/ironkinoko/e-hentai-view

<img src="https://raw.githubusercontent.com/IronKinoko/asset/master/e-hentai-view/login.gif" width="25%" title="login"/>

## 常見問題

如果存在看不到圖片的問題, 請看[這里](./FAQ.md)

## 安裝到桌面(PWA)

<img src="https://raw.githubusercontent.com/IronKinoko/asset/master/e-hentai-view/pwa_install.gif" width="25%" title="IOS PWA 安裝"/>

## 開發

```shell
# 首次運行請先安裝依賴
# npm
npm install
npm run dev:server
npm run dev:app
#yarn
yarn
yarn run dev:server
yarn run dev:app
```

## 同類推薦

- PC 端 建議直接使用 exhentai 官網瀏覽，配合 **_[IronKinoko/e-hentai-infinite-scroll](https://github.com/IronKinoko/e-hentai-infinite-scroll)_** 更方便
- 安卓端 推薦使用[seven332/EhViewer](https://github.com/seven332/EhViewer)原生 APP 訪問

## 特別感謝

- [seven332/EhViewer](https://github.com/seven332/EhViewer)
