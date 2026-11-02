/*
 * build-index.js
 *
 * Scans this folder (and every sub folder) for report .html files, reads the check marks in the
 * file / folder names, and writes a static index.html. In that page you click a folder to enter it,
 * click again to go deeper, and open any report from there.
 *
 *   check marks in the name      status shown in index.html
 *   -----------------------      ---------------------------------
 *   (none)                       Not marked yet
 *   one check                    Done (HTML only)
 *   two checks                   Done + migrated into the code
 *   three checks                 Final (100%)
 *
 * The folder name counts too: a file inside "Some Report ✔️✔️✔️" gets at least three checks.
 * The highest count found on the file name or any parent folder name is used.
 *
 * GitHub Pages can only serve static files, so it can't scan folders by itself.
 * Run this script before you push, so index.html is up to date:
 *
 *     node build-index.js
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = __dirname;
const OUTPUT = path.join(ROOT, "index.html");
const SKIP_DIRS = new Set([".git", ".github", "node_modules"]);
const CHECK = /[✔✅]/g;                                                // ✔  ✅
const STRIP = /[✔✅️‍\u{1F7E0}-\u{1F7EB}]/gu;                // check marks and coloured square emoji

const countChecks = (name) => (name.match(CHECK) || []).length;
const cleanName = (name) => name.replace(STRIP, "").replace(/\s{2,}/g, " ").trim();
const byName = (a, b) => a.localeCompare(b, undefined, { numeric: true });

const STATUS = {
    0: { key: "unmarked", label: "Not marked", hint: "No check mark yet" },
    1: { key: "done", label: "Done", hint: "Report is done (HTML only)" },
    2: { key: "migrated", label: "Done + migrated", hint: "Done and already moved into the code" },
    3: { key: "final", label: "Final", hint: "Final, 100% complete" },
};

function lastUpdated(fullPath) {
    try {
        const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", fullPath], { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] })
            .toString().trim();
        if (out) return out;
    } catch (e) { /* not a git repo, or git is missing */ }
    return fs.statSync(fullPath).mtime.toISOString().slice(0, 10);
}

// Builds { t: "d", name, children: [...] }; folders without any report inside are left out.
function build(dir, name, parentChecks) {
    const node = { t: "d", name, children: [] };

    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => byName(a.name, b.name))) {
        const full = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (SKIP_DIRS.has(entry.name)) continue;
            const child = build(full, cleanName(entry.name), Math.max(parentChecks, countChecks(entry.name)));
            if (child.children.length) node.children.push(child);
            continue;
        }

        if (!/\.html?$/i.test(entry.name)) continue;
        if (path.resolve(full) === path.resolve(OUTPUT)) continue;

        const level = Math.min(3, Math.max(parentChecks, countChecks(entry.name)));
        node.children.push({
            t: "f",
            name: cleanName(entry.name.replace(/\.html?$/i, "")),
            level,
            status: STATUS[level].key,
            href: path.relative(ROOT, full).split(path.sep).map(encodeURIComponent).join("/"),
            updated: lastUpdated(full),
        });
    }

    // folders first, then reports
    node.children.sort((a, b) => (a.t === b.t ? byName(a.name, b.name) : a.t === "d" ? -1 : 1));
    return node;
}

const tree = build(ROOT, "Home", 0);

const countFiles = (node) => node.children.reduce((n, c) => n + (c.t === "f" ? 1 : countFiles(c)), 0);
const total = countFiles(tree);

const data = JSON.stringify({ generated: new Date().toISOString().slice(0, 10), statuses: STATUS, tree }).replace(/</g, "\\u003c");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Fee Reports</title>
<style>
:root {
    --bg: #f6f6f4; --card: #ffffff; --text: #1d1d1b; --muted: #6b6b66; --line: #e3e2dc; --hover: #f1f0ea;
    --final: #166534; --final-bg: #dcfce7; --migrated: #0f766e; --migrated-bg: #ccfbf1;
    --done: #92400e; --done-bg: #fef3c7; --unmarked: #57534e; --unmarked-bg: #ecebe6;
    --accent: #111111; --folder: #b7791f;
}
@media (prefers-color-scheme: dark) {
    :root {
        --bg: #161615; --card: #1f1f1d; --text: #efefeb; --muted: #a3a39c; --line: #343431; --hover: #292927;
        --final: #86efac; --final-bg: #14301e; --migrated: #5eead4; --migrated-bg: #0f2e2b;
        --done: #fcd34d; --done-bg: #35290d; --unmarked: #c8c7c0; --unmarked-bg: #2a2a27;
        --accent: #f4f4f0; --folder: #f0b84a;
    }
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); font: 15px/1.5 -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
.wrap { max-width: 1040px; margin: 0 auto; padding: 32px 16px 64px; }
h1 { font-size: 26px; font-weight: 600; margin: 0 0 4px; }
.sub { color: var(--muted); margin: 0 0 18px; }
.crumbs { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; margin: 0 0 16px; font-size: 14px; }
.crumbs a { color: var(--muted); text-decoration: none; padding: 2px 4px; border-radius: 6px; }
.crumbs a:hover { color: var(--text); background: var(--hover); }
.crumbs .cur { font-weight: 600; padding: 2px 4px; }
.crumbs .sep { color: var(--muted); }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 14px; }
.stat { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 10px 14px; cursor: pointer; text-align: left; font: inherit; color: inherit; }
.stat:hover { border-color: var(--muted); }
.stat.active { outline: 2px solid var(--accent); outline-offset: -1px; }
.stat .n { font-size: 22px; font-weight: 600; display: block; line-height: 1.2; }
.stat .l { color: var(--muted); font-size: 13px; }
.legend { color: var(--muted); font-size: 13px; margin: 0 0 14px; display: flex; flex-wrap: wrap; gap: 6px 16px; }
.toolbar { margin-bottom: 18px; }
.toolbar input { width: 100%; padding: 10px 12px; border: 1px solid var(--line); border-radius: 8px; background: var(--card); color: var(--text); font: inherit; }
.list { background: var(--card); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
.row { display: grid; grid-template-columns: 28px 1fr auto auto auto; gap: 12px; align-items: center; padding: 12px 14px; border-top: 1px solid var(--line); color: inherit; text-decoration: none; }
.row:first-child { border-top: none; }
a.row.folder:hover { background: var(--hover); }
.row .ico { width: 22px; height: 22px; display: block; }
.row.folder .ico { color: var(--folder); }
.row.file .ico { color: var(--muted); }
.row .name { font-weight: 500; word-break: break-word; }
.row .name small { display: block; color: var(--muted); font-weight: 400; font-size: 12px; }
.row .date { color: var(--muted); font-size: 13px; white-space: nowrap; }
.chips { display: flex; flex-wrap: wrap; gap: 4px; justify-content: flex-end; }
.badge { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 999px; white-space: nowrap; }
.badge.final { color: var(--final); background: var(--final-bg); }
.badge.migrated { color: var(--migrated); background: var(--migrated-bg); }
.badge.done { color: var(--done); background: var(--done-bg); }
.badge.unmarked { color: var(--unmarked); background: var(--unmarked-bg); }
.go { color: var(--muted); font-size: 18px; line-height: 1; }
.open { text-decoration: none; color: var(--bg); background: var(--accent); padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; white-space: nowrap; }
.open:hover { opacity: .85; }
.empty { text-align: center; color: var(--muted); padding: 40px 0; }
.where { color: var(--muted); font-size: 12px; font-weight: 400; display: block; }
@media (max-width: 640px) {
    .row { grid-template-columns: 24px 1fr auto; }
    .row .date, .row .chips { display: none; }
}
</style>
</head>
<body>
<div class="wrap">
    <h1>Fee Reports</h1>
    <p class="sub" id="sub"></p>

    <div class="crumbs" id="crumbs"></div>
    <div class="stats" id="stats"></div>

    <div class="legend">
        <span><span class="badge unmarked">Not marked</span> no check</span>
        <span><span class="badge done">Done</span> one check, HTML only</span>
        <span><span class="badge migrated">Done + migrated</span> two checks, already in the code</span>
        <span><span class="badge final">Final</span> three checks, 100% complete</span>
    </div>

    <div class="toolbar"><input id="q" type="search" placeholder="Search in this folder..." autocomplete="off"></div>
    <div id="out"></div>
</div>

<script>
var DATA = ${data};
var STATUS_KEYS = ["final", "migrated", "done", "unmarked"];
var STATUS_LABEL = { final: "Final", migrated: "Done + migrated", done: "Done", unmarked: "Not marked" };
var filter = "all";

var ICON_FOLDER = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>';
var ICON_FILE = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>';

function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

function currentPath() {
    var h = location.hash.replace(/^#\\/?/, "");
    return h ? h.split("/").map(decodeURIComponent) : [];
}
function hashFor(path) { return "#/" + path.map(encodeURIComponent).join("/"); }

function resolve(path) {
    var node = DATA.tree, ok = [];
    for (var i = 0; i < path.length; i++) {
        var next = node.children.filter(function (c) { return c.t === "d" && c.name === path[i]; })[0];
        if (!next) break;
        node = next; ok.push(path[i]);
    }
    return { node: node, path: ok };
}

function files(node, out) {
    node.children.forEach(function (c) { if (c.t === "f") out.push(c); else files(c, out); });
    return out;
}
function countBy(list) {
    var c = { all: list.length, final: 0, migrated: 0, done: 0, unmarked: 0 };
    list.forEach(function (f) { c[f.status]++; });
    return c;
}
function matches(f) { return filter === "all" || f.status === filter; }

function renderCrumbs(path) {
    var html = '<a href="#/">Home</a>';
    path.forEach(function (name, i) {
        html += '<span class="sep">/</span>';
        html += i === path.length - 1 ? '<span class="cur">' + esc(name) + '</span>' : '<a href="' + hashFor(path.slice(0, i + 1)) + '">' + esc(name) + '</a>';
    });
    document.getElementById("crumbs").innerHTML = html;
}

function renderStats(node) {
    var c = countBy(files(node, []));
    var items = [["all", "All reports"], ["final", "Final"], ["migrated", "Done + migrated"], ["done", "Done"], ["unmarked", "Not marked"]];
    document.getElementById("stats").innerHTML = items.map(function (i) {
        return '<button class="stat' + (filter === i[0] ? " active" : "") + '" data-f="' + i[0] + '"><span class="n">' + c[i[0]] + '</span><span class="l">' + i[1] + '</span></button>';
    }).join("");
    Array.prototype.forEach.call(document.querySelectorAll(".stat"), function (b) {
        b.onclick = function () { filter = b.getAttribute("data-f"); render(); };
    });
}

function fileRow(f, where) {
    return '<div class="row file">' + ICON_FILE +
        '<span class="name">' + esc(f.name) + (where ? '<span class="where">' + esc(where) + '</span>' : '') + '</span>' +
        '<span class="chips"><span class="badge ' + f.status + '" title="' + esc(DATA.statuses[f.level].hint) + '">' + esc(DATA.statuses[f.level].label) + '</span></span>' +
        '<span class="date">' + esc(f.updated) + '</span>' +
        '<a class="open" href="' + f.href + '" target="_blank" rel="noopener">Open</a></div>';
}

function folderRow(folder, path) {
    var list = files(folder, []).filter(matches);
    if (!list.length) return "";
    var c = countBy(list);
    var chips = STATUS_KEYS.filter(function (k) { return c[k]; }).map(function (k) { return '<span class="badge ' + k + '">' + c[k] + " " + STATUS_LABEL[k] + "</span>"; }).join("");
    var sub = folder.children.filter(function (x) { return x.t === "d"; }).length;
    return '<a class="row folder" href="' + hashFor(path.concat(folder.name)) + '">' + ICON_FOLDER +
        '<span class="name">' + esc(folder.name) + '<small>' + list.length + (list.length === 1 ? " report" : " reports") + (sub ? " - " + sub + (sub === 1 ? " folder" : " folders") : "") + '</small></span>' +
        '<span class="chips">' + chips + '</span><span class="date"></span><span class="go">&rsaquo;</span></a>';
}

function render() {
    var r = resolve(currentPath());
    var node = r.node, path = r.path;
    renderCrumbs(path);
    renderStats(node);

    var q = document.getElementById("q").value.trim().toLowerCase();
    var out = document.getElementById("out");

    if (q) {   // search: flat list of every matching report inside this folder
        var found = files(node, []).filter(function (f) { return matches(f) && f.name.toLowerCase().indexOf(q) !== -1; });
        out.innerHTML = found.length ? '<div class="list">' + found.map(function (f) { return fileRow(f, ""); }).join("") + "</div>" : '<div class="empty">No reports found.</div>';
        return;
    }

    var rows = node.children.map(function (c) { return c.t === "d" ? folderRow(c, path) : (matches(c) ? fileRow(c) : ""); }).join("");
    out.innerHTML = rows ? '<div class="list">' + rows + "</div>" : '<div class="empty">Nothing in this folder for the selected status.</div>';
}

var total = files(DATA.tree, []).length;
document.getElementById("sub").textContent = total + " reports - index built on " + DATA.generated;
document.getElementById("q").addEventListener("input", render);
window.addEventListener("hashchange", function () { document.getElementById("q").value = ""; render(); });
render();
</script>
</body>
</html>
`;

fs.writeFileSync(OUTPUT, html);

const all = [];
(function collect(n) { n.children.forEach((c) => (c.t === "f" ? all.push(c) : collect(c))); })(tree);
console.log("index.html written: " + total + " reports");
["final", "migrated", "done", "unmarked"].forEach((k) => console.log("  " + k + ": " + all.filter((r) => r.status === k).length));
