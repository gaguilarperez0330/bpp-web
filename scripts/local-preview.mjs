// Makes a copy of the built site (_site) that opens by double-clicking index.html,
// without a web server: root-relative links become relative and folder links point at index.html.
// Images and PDFs are hard-linked, not copied, so the preview takes almost no extra disk space.
import fs from "node:fs";
import path from "node:path";

const SITE = "_site";
const OUT = "vista-previa";

fs.rmSync(OUT, { recursive: true, force: true });
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));

for (const file of walk(SITE)) {
  const rel = path.relative(SITE, file);
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (file.endsWith(".css")) {
    // Safari refuses web fonts loaded from file:// (no origin), so inline them into the stylesheet
    const css = fs.readFileSync(file, "utf8").replace(/url\("?(\.\.\/fonts\/[^")]+\.woff2)"?\)/g, (m, rel) => {
      const font = path.join(path.dirname(file), rel);
      return fs.existsSync(font) ? `url("data:font/woff2;base64,${fs.readFileSync(font).toString("base64")}")` : m;
    });
    fs.writeFileSync(dest, css);
    continue;
  }
  if (!file.endsWith(".html")) {
    try { fs.linkSync(file, dest); } catch { fs.copyFileSync(file, dest); }
    continue;
  }
  const depth = rel.split(path.sep).length - 1;
  const up = depth ? "../".repeat(depth) : "./";
  const toRelative = (url) => {
    const [, p, rest = ""] = url.match(/^([^?#]*)(.*)$/);
    let target = p;
    if (target.endsWith("/")) target += "index.html";
    else if (!path.extname(target) && fs.existsSync(path.join(SITE, target, "index.html"))) target += "/index.html";
    // file:// URLs cannot carry the ?v= cache key reliably (Safari reads it as part of the file name)
    return up + target.replace(/^\//, "") + (/^\?v=/.test(rest) ? "" : rest);
  };
  let html = fs.readFileSync(file, "utf8");
  // font preloads would be blocked on file:// too; the fonts are inlined in the stylesheet instead
  html = html.replace(/\s*<link rel="preload" href="[^"]+\.woff2" as="font"[^>]*>/g, "");
  html = html.replace(/\b(href|src|data-full|action)="(\/(?!\/)[^"]*)"/g, (_, attr, url) => `${attr}="${toRelative(url)}"`);
  html = html.replace(/\bsrcset="([^"]*)"/g, (_, set) => `srcset="${set.replace(/(^|,\s*)(\/(?!\/)[^\s,]+)/g, (m, sep, url) => sep + toRelative(url))}"`);
  fs.writeFileSync(dest, html);
}
console.log(`Local preview ready: ${path.resolve(OUT, "index.html")}`);
