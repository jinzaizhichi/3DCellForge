# 3DCellForge

[English](README.md) | [中文](README.zh-CN.md)

AI 驱动的交互式 3D 细胞生成与探索工作台。

3DCellForge 是一个 React + Three.js 原型，用于在浏览器里展示高质感的细胞 3D 场景。它支持 WebGL 拖拽旋转、滚轮缩放、左侧细胞类型 / 中央 3D 舞台 / 右侧工具区的工作台布局、截图、GLB 导出、历史上传默认收起、Demo 演示模式，以及通过 Tripo / Rodin / Hunyuan3D / JS Depth / 本地模型导入生成或加载 3D 模型。

## 演示视频

[![3DCellForge 演示视频](docs/demo/3DCellForge-demo-cover.jpg)](docs/demo/3DCellForge-demo-2026-05-10.mp4)

打开视频文件：[3DCellForge-demo-2026-05-10.mp4](docs/demo/3DCellForge-demo-2026-05-10.mp4)

## 功能

- 基于 React Three Fiber 的交互式细胞查看器。
- 三栏工作台：左侧 Cell Types，中间 WebGL 主舞台，右侧显微镜和生成工具。
- 支持拖拽旋转、滚轮缩放、结构隔离、细胞器 Inspect 和场景导出。
- Demo Mode 会隐藏左右工具区，只保留干净的大模型画面，适合截图和录屏。
- Recent Uploads 默认收起，历史上传 / 生成 / 导入模型不会持续干扰主列表。
- 自定义上传记录支持删除，并同步清理相关本地数据。
- 细胞器详情抽屉、显微镜参考图、对比面板、生物学笔记和图库操作。
- 支持 Tripo、Rodin、Hunyuan3D、JS Depth 和 Local GLB 多种模式。
- 生成后的 GLB 会缓存到本地，方便后续演示和截图。
- 内置 Khronos glTF 辅助参考模型，用于检查 GLB 加载和 PBR 材质表现。
- API Key 只放在服务端 `.env.local`，不会暴露到前端包里。

## 技术栈

- React
- Vite
- Three.js
- React Three Fiber
- Drei
- Framer Motion
- Tripo API 可选后端
- Hunyuan3D 本地 API 可选后端

## 快速开始

```bash
npm install
npm run dev
```

打开终端里显示的 Vite 地址即可。

## 工作台流程

默认页面会尽量减少干扰：

- 左侧 `Cell Types` 默认只显示官方细胞类型。
- 上传、生成、导入过的自定义模型会收进 `Recent Uploads`，默认折叠。
- 右侧 `Microscope View` 用来选择生成模式或导入本地 `.glb` / `.gltf`。
- 需要细胞器说明时，再点击 `Info` 或 `Inspect` 打开详情抽屉。
- 顶部点击 `Demo` 进入纯展示模式，适合截图、录屏、演示。

常用验证命令：

```bash
npm run lint
npm run build
npm run test
```

## 可选 Image-to-3D 后端

创建 `.env.local`：

```bash
cp .env.example .env.local
```

然后设置：

```bash
TRIPO_API_KEY=your_tripo_key
RODIN_API_KEY=your_rodin_api_key
API_HOST=127.0.0.1
```

如需启用 Hunyuan3D 本地备用模式，先启动你的 Hunyuan3D API 服务，再设置：

```bash
HUNYUAN_API_BASE=http://127.0.0.1:8081
HUNYUAN_CREATE_PATH=/send
HUNYUAN_STATUS_PATH=/status
```

3D 生成后端支持这些路径：

```text
Tripo   只走 Tripo 云端生成，默认模式
Rodin   只走 Hyper3D Rodin 云端生成
Auto    先 Tripo，再 Rodin，最后 Hunyuan 备用
Hunyuan 只走本地 Hunyuan3D
```

上传面板支持这些模式：

```text
Tripo       Tripo 云端 GLB 生成
Rodin       Hyper3D Rodin GLB 生成
Hunyuan     本地 Hunyuan3D GLB 生成
JS Depth    浏览器侧图片深度浮雕，WebGL 不可用时降级到透明 PNG 分层
Auto        Tripo -> Rodin -> Hunyuan -> JS Depth 依次降级
Local GLB   导入已有 .glb 或自包含 .gltf
```

Tripo 上传使用当前 STS 对象存储流程，然后创建 `image_to_model` 任务。生成后的 GLB 会被 Node 后端缓存到 `.generated-models/`，后续展示优先使用本地副本。
Rodin 上传使用 Hyper3D 的 multipart `/rodin` 任务接口，然后轮询 `/status` 并通过 `/download` 下载和缓存 GLB。

也可以从 Microscope View 的 Add Image 入口导入本地 `.glb` 或自包含 `.gltf`，导入后会成为自定义 Cell Type。

Hunyuan3D 本地 API 预期形式：

```text
POST /send
GET  /status/:uid
```

状态接口可以返回远程模型 URL，也可以返回 `model_base64` / `glb_base64` 这类 base64 GLB 字段。base64 GLB 会被缓存到 `.generated-models/` 并由 Node 后端提供访问。

启动后端：

```bash
npm run dev:api
```

启动前端：

```bash
npm run dev
```

默认情况下，前端会访问本地 Node 后端 `http://127.0.0.1:8787`。

## Demo 模型

仓库内置了一些缓存 GLB：

```text
public/generated-models/
```

这些模型可以让项目在不消耗 API credits 的情况下直接用于演示。

## 参考模型

Library 面板内置了远程 Khronos glTF Sample Models 作为辅助参考，用于检查材质和 GLB 加载：

- Transmission Test，CC0，Adobe via Khronos。
- Transmission Roughness Test，CC-BY 4.0，Ed Mackey / Analytical Graphics via Khronos。
- Mosquito In Amber，CC-BY 4.0，Loic Norgeot / Geoffrey Marchal / Sketchfab via Khronos。

这些模型从 Khronos 已归档样例仓库远程加载，不打包进本仓库。

## 安全

不要把真实 API Key 写进前端代码。密钥只放在 `.env.local`，该文件已被 git 忽略。

## License

MIT
