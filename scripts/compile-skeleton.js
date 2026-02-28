#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const babel = require("next/dist/compiled/babel/core");
const presetReact = require("next/dist/compiled/babel/preset-react");

const root = process.cwd();
const srcHtml = path.join(root, "lexnotes-skeleton.html");
const outJs = path.join(root, "public", "lexnotes-app.compiled.js");

function fail(msg) {
  console.error(`[compile-skeleton] ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(srcHtml)) fail("lexnotes-skeleton.html not found");

const html = fs.readFileSync(srcHtml, "utf8");
const m = html.match(
  /<script id="lexnotes-app-source" type="text\/plain">([\s\S]*?)<\/script>/
);
if (!m) fail('Missing <script id="lexnotes-app-source" type="text/plain">');

const source = m[1];
const transformed = babel.transformSync(source, {
  filename: "lexnotes-app-source.js",
  sourceType: "script",
  presets: [presetReact],
  comments: false,
  compact: false,
});

if (!transformed || !transformed.code) fail("Babel transform returned no output");

fs.mkdirSync(path.dirname(outJs), { recursive: true });
fs.writeFileSync(outJs, `${transformed.code}\n`, "utf8");
console.log(`[compile-skeleton] wrote ${path.relative(root, outJs)}`);

