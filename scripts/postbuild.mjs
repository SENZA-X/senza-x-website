// Postbuild: 覆盖 Astro i18n 自动生成的根跳转页面
// 改为 JS 客户端语言检测 + 立即重定向到 /en/index.html 或 /zh/index.html
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distRoot = join(__dirname, '..', 'dist');
const indexPath = join(distRoot, 'index.html');

const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>SENZA.X</title>
<script>
  var lang = (navigator.language || 'en').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en';
  window.location.replace('/' + lang + '/index.html');
</script>
<meta http-equiv="refresh" content="0;url=/en/index.html">
</head>
<body style="margin:0;padding:40px;text-align:center;font-family:sans-serif;background:#0a0a0a;color:#fff;">
<p>Redirecting to <a href="/en/index.html" style="color:#fff;">SENZA.X</a>...</p>
</body>
</html>
`;

writeFileSync(indexPath, redirectHtml);
console.log('[postbuild] Root index.html overwritten with JS language redirect');
