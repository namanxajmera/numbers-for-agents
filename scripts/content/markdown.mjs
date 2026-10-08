// Minimal Markdown to HTML for content/ pages. No dependencies.
// Supports: ## and ### headings, paragraphs, - and 1. lists, ``` fences,
// | tables |, > callouts, **bold**, *em*, `code`, and [links](url).

export function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[`*[\]()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function linkAttrs(url) {
  return /^https?:\/\//.test(url) ? ' rel="noopener"' : "";
}

export function inline(text) {
  const codes = [];
  let out = escapeHtml(text).replace(/`([^`]+)`/g, (_, code) => {
    codes.push(code);
    return `\u0000${codes.length - 1}\u0000`;
  });
  out = out
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => `<a href="${url}"${linkAttrs(url)}>${label}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[Number(i)]}</code>`);
}

function splitRow(line) {
  return line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
}

function renderTable(lines) {
  const [head, , ...rows] = lines;
  const th = splitRow(head).map((c) => `<th scope="col">${inline(c)}</th>`).join("");
  const body = rows
    .map((row) => `<tr>${splitRow(row).map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
    .join("\n");
  return `<div class="table-wrap"><table>\n<thead><tr>${th}</tr></thead>\n<tbody>\n${body}\n</tbody>\n</table></div>`;
}

function renderList(lines, ordered) {
  const tag = ordered ? "ol" : "ul";
  const items = lines.map((l) => `<li>${inline(l.replace(/^(\s*[-*]|\s*\d+\.)\s+/, ""))}</li>`);
  return `<${tag}>\n${items.join("\n")}\n</${tag}>`;
}

const BLOCKS = [
  { test: (l) => /^\|/.test(l), render: renderTable },
  { test: (l) => /^\s*[-*] /.test(l), render: (ls) => renderList(ls, false) },
  { test: (l) => /^\s*\d+\. /.test(l), render: (ls) => renderList(ls, true) },
  {
    test: (l) => /^> ?/.test(l),
    render: (ls) => `<aside class="callout"><p>${inline(ls.map((l) => l.replace(/^> ?/, "")).join(" "))}</p></aside>`,
  },
];

function heading(line) {
  const level = line.startsWith("### ") ? 3 : 2;
  const text = line.slice(level + 1).trim();
  return { html: `<h${level} id="${slugify(text)}">${inline(text)}</h${level}>`, level, text };
}

/** Returns { html, headings } where headings lists every ## heading as { id, text }. */
export function renderMarkdown(source) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  const headings = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith("```")) {
      const code = [];
      for (i++; i < lines.length && !lines[i].startsWith("```"); i++) code.push(lines[i]);
      out.push(`<pre class="code-block"><code>${escapeHtml(code.join("\n"))}</code></pre>`);
      i++;
      continue;
    }
    if (/^#{2,3} /.test(line)) {
      const h = heading(line);
      if (h.level === 2) headings.push({ id: slugify(h.text), text: h.text });
      out.push(h.html);
      i++;
      continue;
    }
    const block = BLOCKS.find((b) => b.test(line));
    const group = [];
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith("```") && !/^#{2,3} /.test(lines[i])) {
      if (block ? !block.test(lines[i]) : BLOCKS.some((b) => b.test(lines[i]))) break;
      group.push(lines[i]);
      i++;
    }
    out.push(block ? block.render(group) : `<p>${inline(group.join(" "))}</p>`);
  }
  return { html: out.join("\n"), headings };
}

/** Splits "---\nkey: value\n---\nbody" into { meta, body }. */
export function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Missing frontmatter");
  const meta = {};
  for (const line of match[1].split("\n")) {
    const at = line.indexOf(":");
    if (at > 0) meta[line.slice(0, at).trim()] = line.slice(at + 1).trim();
  }
  return { meta, body: match[2].trim() };
}

/** Pulls Q&A pairs out of a "## FAQ" section: ### question, then answer paragraphs. */
export function extractFaq(body) {
  const section = body.split(/^## /m).find((s) => /^(FAQ|Frequently asked questions)\b/.test(s));
  if (!section) return [];
  return section
    .split(/^### /m)
    .slice(1)
    .map((block) => {
      const [question, ...rest] = block.split("\n");
      return { question: question.trim(), answer: rest.join(" ").replace(/\s+/g, " ").trim() };
    })
    .filter((qa) => qa.answer);
}
