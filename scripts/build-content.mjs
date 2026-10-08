// Builds content pages from content/<section>/<slug>.md into public/.
// Run after editing anything in content/:  node scripts/build-content.mjs
// Writes, per page: public/<section>/<slug>.html and the Markdown twin <slug>.md.
// Also writes each section hub, sitemap.xml, the content list in llms.txt, and llms-full.txt.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { extractFaq, parseFrontmatter, renderMarkdown } from "./content/markdown.mjs";
import { SITE, articlePage, hubPage } from "./content/templates.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const CONTENT = join(ROOT, "content");
const PUBLIC = join(ROOT, "public");

const SECTIONS = [
  {
    dir: "guides",
    name: "Guides",
    h1: "Guides: phone numbers for AI agents",
    title: "Guides: Phone Numbers, SMS, and Voice for AI Agents | Numbers for Agents",
    description: "Step-by-step guides for giving AI agents real phone numbers: SMS, inbound calls, Vapi and Retell setup, A2P 10DLC, and MCP.",
    intro: "Step-by-step guides for developers who connect AI agents to real phone numbers.",
  },
  {
    dir: "compare",
    name: "Compare",
    h1: "Compare phone number providers for AI agents",
    title: "Compare Phone Number APIs for AI Agents | Numbers for Agents",
    description: "Side-by-side comparisons of phone number and telephony APIs for AI agents: Twilio, Telnyx, Vapi numbers, AgentPhone, and more.",
    intro: "Fair, sourced comparisons of the telephony options for AI voice and SMS agents.",
  },
  {
    dir: "use-cases",
    name: "Use cases",
    h1: "Use cases: what AI agents do with a phone number",
    title: "AI Agent Phone Number Use Cases | Numbers for Agents",
    description: "How teams use phone numbers for AI agents: AI receptionists, appointment reminder agents, and one number per customer on agent platforms.",
    intro: "Common jobs for an AI agent with its own phone line, and what each one needs.",
  },
].map((s) => ({ ...s, path: `/${s.dir}/` }));

// Hand-written pages. lastmod comes from the last git commit that touched the file.
const STATIC_PAGES = [
  ["/", "index.html", "1.0"],
  ["/docs", "docs.html", "0.9"],
  ["/about", "about.html", "0.5"],
  ["/contact", "contact.html", "0.5"],
  ["/privacy", "privacy.html", "0.3"],
];

const today = new Date().toISOString().slice(0, 10);

function gitDate(file) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", file], { cwd: ROOT }).toString().trim();
    const dirty = execFileSync("git", ["status", "--porcelain", "--", file], { cwd: ROOT }).toString().trim();
    return dirty || !out ? today : out;
  } catch {
    return today;
  }
}

function absolutize(markdown) {
  return markdown.replace(/\]\((\/[^)\s]*)\)/g, `](${SITE}$1)`);
}

function loadPages(section) {
  const dir = join(CONTENT, section.dir);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const { meta, body } = parseFrontmatter(readFileSync(join(dir, file), "utf8"));
      for (const key of ["title", "description", "h1", "published", "updated"]) {
        if (!meta[key]) throw new Error(`${section.dir}/${file}: missing frontmatter "${key}"`);
      }
      const slug = file.replace(/\.md$/, "");
      const { html, headings } = renderMarkdown(body);
      return {
        meta,
        body,
        slug,
        section,
        html,
        headings,
        faq: extractFaq(body),
        order: Number(meta.order || 99),
        path: `/${section.dir}/${slug}`,
        mdPath: `/${section.dir}/${slug}.md`,
        readMinutes: Math.max(1, Math.round(body.split(/\s+/).length / 220)),
      };
    })
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

function twin(page) {
  const header = `# ${page.meta.h1}\n\n> ${page.meta.description}\n>\n> Source: ${SITE}${page.path} · Updated ${page.meta.updated} · Numbers for Agents`;
  return `${header}\n\n${absolutize(page.body)}\n`;
}

function hubTwin(section, pages) {
  const list = pages.map((p) => `- [${p.meta.h1}](${SITE}${p.path}): ${p.meta.description}`).join("\n");
  return `# ${section.h1}\n\n${section.intro}\n\n${list}\n`;
}

function sitemap(bySection) {
  const newest = (pages) => pages.map((p) => p.meta.updated).sort().at(-1) || today;
  const entries = [
    ...STATIC_PAGES.map(([path, file, priority]) => [path, gitDate(`public/${file}`), priority]),
    ...bySection.map(({ section, pages }) => [section.path, newest(pages), "0.8"]),
    ...bySection.flatMap(({ pages }) => pages.map((p) => [p.path, p.meta.updated, "0.7"])),
  ];
  const urls = entries
    .map(([path, lastmod, priority]) => `  <url>\n    <loc>${SITE}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

// Replaces everything between "## Guides" and "## Company" in llms.txt.
function updateLlmsTxt(bySection) {
  const file = join(PUBLIC, "llms.txt");
  const text = readFileSync(file, "utf8");
  const start = text.indexOf("## Guides");
  const end = text.indexOf("## Company");
  if (start < 0 || end < start) throw new Error('llms.txt needs "## Guides" before "## Company"');
  const blocks = bySection
    .map(({ section, pages }) => {
      const list = pages.map((p) => `- [${p.meta.h1}](${SITE}${p.path}): ${p.meta.description}`).join("\n");
      return `## ${section.name}\n\n${list}\n`;
    })
    .join("\n");
  writeFileSync(file, `${text.slice(0, start)}${blocks}\n${text.slice(end)}`);
}

function llmsFull(bySection) {
  const intro = readFileSync(join(PUBLIC, "index.md"), "utf8").trim();
  const docs = bySection.flatMap(({ pages }) => pages.map(twin));
  return [`${intro}\n`, ...docs].join("\n---\n\n");
}

function build() {
  const bySection = SECTIONS.map((section) => ({ section, pages: loadPages(section) }));
  const all = bySection.flatMap((s) => s.pages);
  const byPath = new Map(all.map((p) => [p.path, p]));

  for (const page of all) {
    page.related = (page.meta.related || "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => {
        if (!byPath.has(p)) throw new Error(`${page.path}: related page ${p} does not exist`);
        return byPath.get(p);
      });
  }

  for (const { section, pages } of bySection) {
    const outDir = join(PUBLIC, section.dir);
    mkdirSync(outDir, { recursive: true });
    for (const page of pages) {
      writeFileSync(join(outDir, `${page.slug}.html`), articlePage(page));
      writeFileSync(join(outDir, `${page.slug}.md`), twin(page));
    }
    writeFileSync(join(outDir, "index.html"), hubPage(section, pages));
    writeFileSync(join(outDir, "index.md"), hubTwin(section, pages));
  }

  writeFileSync(join(PUBLIC, "sitemap.xml"), sitemap(bySection));
  updateLlmsTxt(bySection);
  writeFileSync(join(PUBLIC, "llms-full.txt"), llmsFull(bySection));
  console.log(`Built ${all.length} pages in ${SECTIONS.length} sections.`);
}

build();
