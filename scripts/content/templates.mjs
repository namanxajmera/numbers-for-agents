// HTML shells for generated content pages and section hubs.
import { escapeHtml, inline } from "./markdown.mjs";

export const SITE = "https://numberforagents.com";

const NAV = [
  ["/guides/", "Guides"],
  ["/compare/", "Compare"],
  ["/use-cases/", "Use cases"],
  ["/docs", "API docs"],
];

const FOOTER = [
  ["/guides/", "Guides"],
  ["/compare/", "Compare"],
  ["/use-cases/", "Use cases"],
  ["/docs", "API docs"],
  ["/about", "About"],
  ["/contact", "Contact"],
  ["/privacy", "Privacy"],
  ["/llms.txt", "llms.txt"],
];

const links = (items) => items.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join("\n          ");

function jsonLd(data) {
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n  </script>`;
}

export function plainText(markdown) {
  return markdown.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*`]/g, "");
}

function breadcrumbLd(trail) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${SITE}${path}`,
    })),
  };
}

function breadcrumbNav(trail) {
  const items = trail.map(([name, path], i) =>
    i === trail.length - 1 ? `<li aria-current="page">${escapeHtml(name)}</li>` : `<li><a href="${path}">${escapeHtml(name)}</a></li>`,
  );
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${items.join("")}</ol></nav>`;
}

function waitlistBox(source) {
  return `<section class="guide-cta" aria-labelledby="cta-heading">
        <h2 id="cta-heading">Get a phone number for your agent</h2>
        <p>Numbers for Agents is an API for agent phone lines: numbers, SMS, call webhooks, SIP, and WebSocket media. It is in private beta. Join the waitlist for early access and pricing.</p>
        <form class="waitlist-form" data-waitlist-form data-source="${source}" action="/api/waitlist" method="post">
          <label for="cta-email">Work email</label>
          <div class="waitlist-row">
            <input type="email" id="cta-email" name="email" required autocomplete="email" placeholder="you@company.com" aria-describedby="cta-message">
            <button type="submit" class="btn btn-primary">Join the waitlist</button>
          </div>
          <div class="hp-field" aria-hidden="true">
            <label for="cta-company">Company</label>
            <input type="text" id="cta-company" name="company" tabindex="-1" autocomplete="off">
          </div>
          <p class="form-message" id="cta-message" data-form-message role="status" aria-live="polite"></p>
        </form>
      </section>`;
}

function shell({ title, description, path, ogType, schemas, main, markdownPath }) {
  const url = `${SITE}${path}`;
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${t}</title>
  <meta name="description" content="${d}">
  <link rel="canonical" href="${url}">
  <link rel="alternate" type="text/markdown" href="${SITE}${markdownPath}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:site_name" content="Numbers for Agents">
  <meta property="og:title" content="${t}">
  <meta property="og:description" content="${d}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}/og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#0a0b0d">
  <link rel="stylesheet" href="/styles.css">
  ${schemas.map(jsonLd).join("\n  ")}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-nav">
    <div class="container">
      <a class="wordmark" href="/">Numbers for Agents</a>
      <nav aria-label="Primary">
        <ul class="nav-links">
          ${links(NAV)}
        </ul>
      </nav>
      <a class="btn btn-primary" href="/#waitlist">Join the waitlist</a>
    </div>
  </header>

  <main id="main">
${main}
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <p><a href="mailto:hello@numberforagents.com">hello@numberforagents.com</a></p>
      <ul class="footer-links">
          ${links(FOOTER)}
      </ul>
      <p>&copy; 2026 Numbers for Agents</p>
    </div>
  </footer>

  <script src="/analytics.js" defer></script>
  <script src="/main.js" defer></script>
</body>
</html>
`;
}

function toc(headings) {
  if (headings.length < 4) return "";
  const items = headings.map((h) => `<li><a href="#${h.id}">${inline(h.text)}</a></li>`).join("");
  return `<nav class="toc" aria-label="On this page"><p>On this page</p><ol>${items}</ol></nav>`;
}

/** page: { meta, path, mdPath, section, html, headings, faq, related, readMinutes } */
export function articlePage(page) {
  const { meta, path, section } = page;
  const trail = [["Home", "/"], [section.name, section.path], [meta.h1, path]];
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: meta.h1,
      description: meta.description,
      datePublished: meta.published,
      dateModified: meta.updated,
      mainEntityOfPage: `${SITE}${path}`,
      image: `${SITE}/og.png`,
      author: { "@type": "Organization", name: "Numbers for Agents", url: SITE },
      publisher: { "@type": "Organization", name: "Numbers for Agents", url: SITE, logo: { "@type": "ImageObject", url: `${SITE}/og.png` } },
    },
    breadcrumbLd(trail),
  ];
  if (page.faq.length) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faq.map((qa) => ({
        "@type": "Question",
        name: qa.question,
        acceptedAnswer: { "@type": "Answer", text: plainText(qa.answer) },
      })),
    });
  }
  const related = page.related.length
    ? `<aside class="guide-related">
        <h2>Related</h2>
        <ul>
          ${page.related.map((r) => `<li><a href="${r.path}">${escapeHtml(r.meta.h1)}</a></li>`).join("\n          ")}
        </ul>
      </aside>`
    : "";
  const main = `    <header class="guide-header">
      <div class="container">
        ${breadcrumbNav(trail)}
        <h1>${escapeHtml(meta.h1)}</h1>
        <p class="guide-meta">Updated <time datetime="${meta.updated}">${formatDate(meta.updated)}</time> · About ${page.readMinutes} min read</p>
      </div>
    </header>

    <article class="guide-body container">
      ${toc(page.headings)}
      ${page.html}
      ${waitlistBox(page.slug)}
      ${related}
    </article>`;
  return shell({ title: meta.title, description: meta.description, path, ogType: "article", schemas, main, markdownPath: page.mdPath });
}

/** section: { name, path, title, description, intro }, pages: sorted pages */
export function hubPage(section, pages) {
  const trail = [["Home", "/"], [section.name, section.path]];
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: section.title,
      description: section.description,
      url: `${SITE}${section.path}`,
      hasPart: pages.map((p) => ({ "@type": "TechArticle", headline: p.meta.h1, url: `${SITE}${p.path}` })),
    },
    breadcrumbLd(trail),
  ];
  const cards = pages
    .map((p) => `<article class="feature-card">
            <h2><a href="${p.path}">${escapeHtml(p.meta.h1)}</a></h2>
            <p>${escapeHtml(p.meta.description)}</p>
          </article>`)
    .join("\n          ");
  const main = `    <header class="guide-header">
      <div class="container">
        ${breadcrumbNav(trail)}
        <h1>${escapeHtml(section.h1)}</h1>
        <p class="guide-meta">${escapeHtml(section.intro)}</p>
      </div>
    </header>

    <section class="hub" aria-label="${escapeHtml(section.name)}">
      <div class="container">
        <div class="feature-grid hub-grid">
          ${cards}
        </div>
      </div>
    </section>`;
  return shell({ title: section.title, description: section.description, path: section.path, ogType: "website", schemas, main, markdownPath: `${section.path}index.md` });
}

export function formatDate(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}
