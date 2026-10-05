// User-agent classification for analytics rows. Order matters: first match wins.
// Each entry: [bucket, list of UA substrings]. Matching is case-insensitive.
const UA_RULES = [
  [
    "ai",
    [
      "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User",
      "Claude-SearchBot", "anthropic-ai", "PerplexityBot", "Perplexity-User",
      "CCBot", "Bytespider", "Amazonbot", "meta-externalagent",
      "meta-externalfetcher", "cohere-ai", "Diffbot", "YouBot", "DuckAssistBot",
      "MistralAI-User", "Google-CloudVertexBot", "AI2Bot", "Timpibot",
      "ImagesiftBot", "Omgilibot", "Kangaroo Bot",
    ],
  ],
  [
    "search",
    [
      "Googlebot", "Google-InspectionTool", "GoogleOther", "Storebot-Google",
      "AdsBot-Google", "bingbot", "Applebot", "DuckDuckBot", "YandexBot",
      "Baiduspider", "PetalBot", "SeznamBot", "Qwantbot", "Slurp", "MojeekBot",
    ],
  ],
  [
    "preview",
    [
      "facebookexternalhit", "facebookcatalog", "Twitterbot", "LinkedInBot",
      "Slackbot", "Slack-ImgProxy", "Discordbot", "TelegramBot", "WhatsApp",
      "redditbot", "Pinterestbot", "Embedly", "SkypeUriPreview",
    ],
  ],
  [
    "scanner",
    [
      "zgrab", "masscan", "Nmap", "Nuclei", "sqlmap", "Nikto", "CensysInspect",
      "Expanse", "LeakIX", "internet-measurement", "Palo Alto Networks",
      "ModatScanner", "httpx - Open-source",
    ],
  ],
  [
    "tool",
    [
      "curl/", "Wget", "python-requests", "python-httpx", "aiohttp",
      "Go-http-client", "node-fetch", "axios", "undici", "okhttp", "Java/",
      "libwww-perl", "HeadlessChrome", "PhantomJS", "Puppeteer", "Playwright",
      "UptimeRobot", "Pingdom", "StatusCake", "Chrome-Lighthouse",
    ],
  ],
];

const RULES_LOWER = UA_RULES.map(([bucket, names]) => [
  bucket,
  names.map((name) => [name.replace(/\/$/, ""), name.toLowerCase()]),
]);

const GENERIC_BOT_RE = /bot|crawl|spider|scrap|fetch|monitor|http-client/i;

// Cloud and hosting networks. A browser UA from one of these is almost never a person.
const DATACENTER_ASNS = new Set([
  16509, 14618, // Amazon AWS
  396982, 15169, 19527, // Google Cloud
  8075, // Microsoft Azure
  14061, // DigitalOcean
  16276, // OVH
  24940, // Hetzner
  63949, // Akamai Linode
  20473, // Vultr
  45102, // Alibaba Cloud
  132203, // Tencent Cloud
  31898, // Oracle Cloud
  12876, // Scaleway
]);

/**
 * Returns { bucket, agent }.
 * bucket: human | ai | search | preview | scanner | tool | datacenter | other_bot
 * agent: matched bot name, or null.
 */
export function classify(ua, asn) {
  const raw = String(ua || "").trim();
  if (!raw) return { bucket: "scanner", agent: "(empty)" };

  const lower = raw.toLowerCase();
  for (const [bucket, names] of RULES_LOWER) {
    for (const [name, nameLower] of names) {
      if (lower.includes(nameLower)) return { bucket, agent: name };
    }
  }

  if (GENERIC_BOT_RE.test(raw) || !raw.startsWith("Mozilla/")) {
    return { bucket: "other_bot", agent: null };
  }
  if (DATACENTER_ASNS.has(Number(asn))) {
    return { bucket: "datacenter", agent: null };
  }
  return { bucket: "human", agent: null };
}

const PROBE_RE =
  /(^|\/)\.(env|git|aws|ssh|svn|hg|DS_Store|htaccess|htpasswd|vscode|idea)|wp-|wordpress|phpmyadmin|xmlrpc|cgi-bin|\/vendor\/|actuator|server-status|\.(php|asp|aspx|jsp|cgi|sql|bak|old|zip|tar|gz|rar|7z|ini|ya?ml|log|conf|env)$/i;

/** True for vulnerability-scanner paths. These are never logged. */
export function isProbePath(path) {
  return PROBE_RE.test(path);
}
