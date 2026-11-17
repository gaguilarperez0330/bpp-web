import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const SRC = "src";
const onNetlify = Boolean(process.env.CONTEXT); // Netlify sets CONTEXT during builds

// Read intrinsic width/height from JPEG/PNG/WebP headers so every <img> reserves its space.
const sizeCache = new Map();
function imageSize(src) {
  if (!src || /^https?:/.test(src)) return null;
  if (sizeCache.has(src)) return sizeCache.get(src);
  let result = null;
  try {
    const buf = fs.readFileSync(path.join(SRC, decodeURI(src)));
    if (buf[0] === 0x89 && buf.toString("ascii", 1, 4) === "PNG") {
      result = { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    } else if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
      const chunk = buf.toString("ascii", 12, 16);
      if (chunk === "VP8X") result = { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
      else if (chunk === "VP8 ") result = { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
      else if (chunk === "VP8L") { const b = buf.readUInt32LE(21); result = { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 }; }
    } else if (buf[0] === 0xff && buf[1] === 0xd8) {
      let o = 2;
      while (o < buf.length) {
        if (buf[o] !== 0xff) { o++; continue; }
        const marker = buf[o + 1];
        const len = buf.readUInt16BE(o + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          result = { h: buf.readUInt16BE(o + 5), w: buf.readUInt16BE(o + 7) };
          break;
        }
        o += 2 + len;
      }
    }
  } catch { /* missing file: render without dimensions */ }
  sizeCache.set(src, result);
  return result;
}

// On Netlify, resize through the Image CDN; locally, serve the original file.
function imgUrl(src, width) {
  if (!src) return "";
  if (!onNetlify || /^https?:/.test(src) || src.endsWith(".svg")) return src;
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&q=80`;
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets", "src/images": "images", "src/files": "files", "src/_redirects": "_redirects", "src/admin/config.yml": "admin/config.yml" });
  eleventyConfig.addWatchTarget("src/assets/");

  eleventyConfig.addFilter("imgUrl", imgUrl);
  // /assets/css/main.css -> /assets/css/main.css?v=<content hash>: a changed file always gets a new URL,
  // so the year-long cache in netlify.toml never serves an old stylesheet (the ART from HEART lesson)
  eleventyConfig.addFilter("v", (url) => {
    try { return url + "?v=" + crypto.createHash("md5").update(fs.readFileSync(path.join(SRC, url))).digest("hex").slice(0, 10); }
    catch { return url; }
  });
  eleventyConfig.addFilter("imageSize", imageSize);

  // {% image src, alt, sizes, imgClass, loading, frameClass, focus %}
  // Every image sits in a .media frame: the frame carries the reveal from the page colour and the hover zoom.
  // focus is a CSS object-position ("50% 30%") so crops keep faces and details in frame.
  eleventyConfig.addShortcode("image", function (src, alt = "", sizes = "100vw", cls = "", loading = "lazy", frame = "", focus = "") {
    if (!src) return "";
    const dim = imageSize(src);
    const widths = [480, 800, 1200, 1800].filter((w) => !dim || w <= dim.w * 1.05);
    if (!widths.length) widths.push(dim.w);
    const srcset = onNetlify ? `srcset="${widths.map((w) => `${imgUrl(src, w)} ${w}w`).join(", ")}" sizes="${sizes}"` : "";
    const wh = dim ? `width="${dim.w}" height="${dim.h}"` : "";
    const esc = String(alt).replace(/"/g, "&quot;");
    const style = focus ? ` style="object-position:${focus}"` : "";
    const img = `<img src="${imgUrl(src, 1200)}" ${srcset} ${wh} alt="${esc}" class="${cls}" loading="${loading}" decoding="async"${style}${loading === "eager" ? ' fetchpriority="high"' : ""}>`;
    return `<span class="media${frame ? " " + frame : ""}">${img}</span>`;
  });

  const fmt = (d, opts) => new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", ...opts }).format(new Date(d));
  eleventyConfig.addFilter("date", (d, style = "long") => {
    if (!d) return "";
    if (style === "iso") return new Date(d).toISOString().slice(0, 10);
    if (style === "year") return fmt(d, { year: "numeric" });
    if (style === "short") return fmt(d, { day: "numeric", month: "short", year: "numeric" });
    return fmt(d, { day: "numeric", month: "long", year: "numeric" });
  });
  // "14 – 16 Nov 2025", "29 Apr – 16 Sept 2018", one day: "7 Oct 2021"
  eleventyConfig.addFilter("dateRange", (start, end) => {
    if (!start) return "";
    const s = new Date(start), e = end ? new Date(end) : null;
    const full = { day: "numeric", month: "short", year: "numeric" };
    if (!e || +e === +s) return fmt(s, full);
    if (s.getFullYear() !== e.getFullYear()) return `${fmt(s, full)} – ${fmt(e, full)}`;
    if (s.getMonth() !== e.getMonth()) return `${fmt(s, { day: "numeric", month: "short" })} – ${fmt(e, full)}`;
    return `${fmt(s, { day: "numeric" })} – ${fmt(e, full)}`;
  });
  // current | upcoming | past, worked out at build time so nothing needs archiving by hand
  eleventyConfig.addFilter("status", (start, end) => {
    const now = Date.now();
    if (start && new Date(start).getTime() > now) return "upcoming";
    if (new Date(end || start).getTime() + 864e5 >= now) return "current";
    return "past";
  });
  eleventyConfig.addFilter("byDate", (arr) => [...(arr || [])].sort((a, b) => new Date(b.start) - new Date(a.start)));
  // [{ year: "2025", items: [...] }, …] newest year first, for the exhibitions drop-downs
  eleventyConfig.addFilter("byYear", (arr) => {
    const groups = new Map();
    [...(arr || [])].sort((a, b) => new Date(b.start) - new Date(a.start)).forEach((x) => {
      const y = String(new Date(x.start).getFullYear());
      if (!groups.has(y)) groups.set(y, []);
      groups.get(y).push(x);
    });
    return [...groups].map(([year, items]) => ({ year, items }));
  });
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("where", (arr, key, val) => (arr || []).filter((x) => x[key] === val));
  eleventyConfig.addFilter("exclude", (arr, url) => (arr || []).filter((x) => x.url !== url));
  eleventyConfig.addFilter("absolute", (url, base) => new URL(url || "/", base).href);
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v));
  eleventyConfig.addFilter("striptags", (s) => String(s || "").replace(/<[^>]+>/g, ""));
  eleventyConfig.addFilter("isExternal", (url) => /^https?:/.test(url || ""));
  eleventyConfig.addFilter("md", (s) => (s ? eleventyConfig.markdownLibrary?.render(String(s)) ?? String(s) : ""));
  eleventyConfig.addFilter("mdInline", (s) => (s ? eleventyConfig.markdownLibrary?.renderInline(String(s)) ?? String(s) : ""));
  eleventyConfig.amendLibrary("md", (lib) => { lib.set({ html: true, breaks: false, linkify: false, typographer: true }); eleventyConfig.markdownLibrary = lib; });

  // projects: ordered by the "order" field (lowest first), so the artist decides the sequence
  eleventyConfig.addCollection("projects", (api) =>
    api.getFilteredByGlob("src/projects/*.md").filter((p) => !p.data.draft).sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99)));
  eleventyConfig.addFilter("neighbours", (arr, url) => {
    const i = (arr || []).findIndex((x) => x.url === url);
    return { prev: i > 0 ? arr[i - 1] : null, next: i >= 0 ? arr[i + 1] || null : null };
  });

  return {
    dir: { input: SRC, output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
}
