# Virtual Glasses Try-On

基于 React、Vite、Tailwind CSS 和 MediaPipe Face Landmarker 的虚拟眼镜试戴前端原型。

在线体验：<https://hmycl3.github.io/virtual-glasses-tryon/>

## 启动

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`。

## 文件说明

- `src/App.jsx`：页面布局、上传流程、试戴合成、拖动/缩放/旋转、下载等交互。
- `src/services/faceLandmarker.js`：MediaPipe 人脸关键点检测，以及预留的 `generateTryOnResult(faceImage, glassesImage)` AI 接口。
- `src/styles.css`：Tailwind 入口和与参考图匹配的组件样式、桌面端布局。
- `src/main.jsx`：React 应用入口。
- `public/`：示例人脸照片与五种透明背景眼镜素材。
- `tailwind.config.js` / `postcss.config.js`：Tailwind 与 PostCSS 配置。
- `vite.config.mjs`：Vite 开发服务器与构建配置。
- `.github/workflows/deploy.yml`：GitHub Pages 自动构建与部署流程。
- `design-qa.md`：参考图与实现效果的视觉验收记录。

## 自动定位原理

生成时使用 Face Landmarker 读取 MediaPipe Face Mesh 的 33、263 号双眼外眼角关键点，根据两点中点、距离和连线角度自动计算眼镜的初始位置、宽度和旋转角。用户可继续手动调整。
