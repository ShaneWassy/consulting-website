// ===== Utilities =====
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function escapeHtml(str = "") {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ===== Header: mobile nav =====
const navToggle = $("#navToggle");
const nav = $("#nav");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // Close nav after clicking a link (mobile UX)
  $$("#nav a").forEach(a => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  // Close nav if you click outside
  document.addEventListener("click", (e) => {
    const clickedInside = nav.contains(e.target) || navToggle.contains(e.target);
    if (!clickedInside) {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

// ===== Active nav link on scroll =====
const sections = ["services", "work", "process", "pricing", "faq", "contact"]
  .map(id => document.getElementById(id))
  .filter(Boolean);

const navLinks = $$("#nav a").filter(a => a.getAttribute("href")?.startsWith("#"));

function setActiveNav() {
  const y = window.scrollY + 120;
  let currentId = "";

  for (const sec of sections) {
    const top = sec.offsetTop;
    const bottom = top + sec.offsetHeight;
    if (y >= top && y < bottom) {
      currentId = sec.id;
      break;
    }
  }

  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    const isActive = href === `#${currentId}`;
    link.classList.toggle("active", isActive);
  });
}
window.addEventListener("scroll", setActiveNav);
window.addEventListener("load", setActiveNav);

// ===== FAQ accordion =====
$$(".faq-q").forEach((btn) => {
  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true";
    // collapse others
    $$(".faq-q").forEach(b => b.setAttribute("aria-expanded", "false"));
    // toggle current
    btn.setAttribute("aria-expanded", expanded ? "false" : "true");
  });
});

// ===== Footer year =====
const year = $("#year");
if (year) year.textContent = String(new Date().getFullYear());

// ===== Contact form (mailto fallback) =====
const contactForm = $("#contactForm");
const formStatus = $("#formStatus");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(contactForm).entries());
    const ts = new Date().toISOString();
    const page = window.location.href;

    // Update to your real email
    const to = "theshanewasserman@gmail.com";

    const subject = encodeURIComponent(`New consulting inquiry: ${data.name || "Website"}`);
    const body = encodeURIComponent(
`Timestamp: ${ts}
Page: ${page}

Name: ${data.name || ""}
Email: ${data.email || ""}
Company: ${data.company || ""}
Budget: ${data.budget || ""}

Message:
${data.message || ""}`
    );

    if (formStatus) {
      formStatus.textContent = "Opening your email client…";
    }

    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;

    // Soft success message (mailto can’t confirm send)
    setTimeout(() => {
      if (formStatus) {
        formStatus.textContent = "If your email client didn’t open, copy your message and email me directly.";
      }
    }, 800);
  });
}

// ===== Chat widget (offline FAQ helper) =====
const chatLauncher = $("#chatLauncher");
const chatWindow = $("#chatWindow");
const chatClose = $("#chatClose");
const chatBody = $("#chatBody");
const chatForm = $("#chatForm");
const chatText = $("#chatText");

const faqBot = [
  { key: ["price", "pricing", "cost"], answer: "Pricing depends on scope. Many dashboard builds start around $1,500+. I can give a clear quote after a quick audit call." },
  { key: ["quickbooks", "fishbowl", "inventory"], answer: "Yes — I can help reconcile Fishbowl + QuickBooks, standardize definitions, and build exception reports so you can trust totals." },
  { key: ["time", "timeline", "how long"], answer: "Most clients get a usable dashboard or report pack in 2–4 weeks after data access is set up." },
  { key: ["tools", "power bi", "excel", "sql"], answer: "I work with SQL, Excel, and BI dashboards (Power BI or similar). The goal is a refreshable system your team can maintain." },
  { key: ["start", "next step", "call"], answer: "Next step is a 15-minute call. Use the contact form and mention your systems + goals, and I’ll reply with a plan." },
];

function addMsg(text, who = "bot") {
  if (!chatBody) return;
  const div = document.createElement("div");
  div.className = `msg ${who}`;
  div.innerHTML = escapeHtml(text);
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function botReply(userText) {
  const t = userText.toLowerCase();
  const hit = faqBot.find(item => item.key.some(k => t.includes(k)));
  return hit?.answer || "Got it. Tell me your data sources (ex: QuickBooks, Fishbowl, Shopify) and what you want to measure (revenue, COGS, inventory, margin, etc.).";
}

function openChat() {
  if (!chatWindow) return;
  chatWindow.hidden = false;
  addMsg("Hi! 👋 Ask me about services, pricing, or next steps.", "bot");
  chatText?.focus();
}

function closeChat() {
  resetChat();          // clear conversation
  chatWindow.hidden = true;
}

function resetChat() {
  if (!chatBody) return;
  chatBody.innerHTML = "";
}

if (chatLauncher && chatWindow) {
  chatLauncher.addEventListener("click", () => {
    if (chatWindow.hidden) openChat();
    else closeChat();
  });
}

if (chatClose) chatClose.addEventListener("click", closeChat);

if (chatForm) {
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = (chatText?.value || "").trim();
    if (!val) return;
    addMsg(val, "user");
    chatText.value = "";
    setTimeout(() => addMsg(botReply(val), "bot"), 250);
  });
}
