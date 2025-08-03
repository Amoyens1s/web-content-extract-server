# Web Content Extract Server

基于 [web-content-extract](https://www.npmjs.com/package/web-content-extract) 库构建的简易网页内容提取服务器。

## 功能特性

- 提取网页主要内容，过滤广告、导航和其他非必要元素
- 将提取的内容转换为干净的 Markdown 格式
- 提取 SEO 元数据（默认启用）
- 支持 JSON 和 Markdown 两种输出格式
- 使用 Express 构建的轻量级 HTTP 服务器

## 安装和启动

```bash
# 安装依赖
npm install

# 启动服务器
node server.js
```

服务器将在 `http://0.0.0.0:8030` 上运行。

## API 接口

### GET /extract

提取指定网页的内容。

#### 参数

- `url` (必需): 要提取内容的网页 URL
- `seo` (可选): 是否包含 SEO 元数据，默认为 `true`
- `format` (可选): 输出格式，可选 `markdown` 或 `json`，默认为 `markdown`

#### 示例请求

提取网页内容并以 Markdown 格式返回：
```bash
curl "http://localhost:8030/extract?url=https://example.com"
```

提取网页内容并以 JSON 格式返回：
```bash
curl "http://localhost:8030/extract?url=https://example.com&format=json"
```

提取网页内容但不包含 SEO 元数据：
```bash
curl "http://localhost:8030/extract?url=https://example.com&seo=false"
```

#### 响应格式

当 `format=markdown` (默认) 时，返回纯文本 Markdown 内容。

当 `format=json` 时，返回 JSON 格式：
```json
{
  "content": "提取的Markdown内容",
  "title": "网页标题",
  "seo": {
    "title": "SEO标题",
    "description": "SEO描述",
    // ... 其他SEO元数据
  }
}
```

## 依赖

- [express](https://www.npmjs.com/package/express): Web 服务器框架
- [web-content-extract](https://www.npmjs.com/package/web-content-extract): 网页内容提取库

## 许可证

MIT