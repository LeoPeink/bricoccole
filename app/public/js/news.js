/**
 * news.js — Feed news con scroll infinito
 * Usato da: news.html
 *
 * Routing: la pagina singola è /news-detail?slug=SLUG
 */

// ── CONFIG ──────────────────────────────────────
const PAGE_SIZE   = 8;    // news per "pagina"
const IMG_PATH    = "/media/news/";
const EMOJI_MAP   = { expo: "🏆", cuccioli: "🐱", default: "📰" };

// ── STATO ───────────────────────────────────────
let currentPage   = 0;
let isLoading     = false;
let allLoaded     = false;

// ── HELPERS ─────────────────────────────────────
function formatDate(str) {
    if (!str) return "";
    return new Date(str.length === 10 ? str + "T12:00:00" : str)
        .toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
}

function excerpt(text, maxChars = 160) {
    if (!text) return "";
    return text.length > maxChars ? text.slice(0, maxChars).trimEnd() + "…" : text;
}

function categoryEmoji(cat) {
    return EMOJI_MAP[cat] || EMOJI_MAP.default;
}

// ── BUILD CARD ───────────────────────────────────
function buildCard(raw) {
    const title   = raw.titolo_it || raw.titolo_en || "(senza titolo)";
    const date    = formatDate(raw.data);
    const text    = raw.testo_it  || raw.testo_en  || "";
    const cat     = raw.categoria || "";
    const slug    = raw.slug      || "";
    const foto    = Array.isArray(raw.foto) && raw.foto.length > 0 ? raw.foto[0] : null;
    const link    = `/news-detail?slug=${encodeURIComponent(slug)}`;

    const imageHtml = foto
        ? `<img class="news-card-image" src="${IMG_PATH}${foto}" alt="${title}" loading="lazy">`
        : `<div class="news-card-image-placeholder">${categoryEmoji(cat)}</div>`;

    const badgeHtml = cat
        ? `<span class="news-card-badge">${cat}</span>`
        : "";

    return `
        <a class="news-card" href="${link}">
            ${imageHtml}
            <div class="news-card-body">
                <div class="news-card-meta">
                    ${badgeHtml}
                    <span class="news-card-date">${date}</span>
                </div>
                <h3 class="news-card-title">${title}</h3>
                <p class="news-card-excerpt">${excerpt(text)}</p>
            </div>
            <div class="news-card-footer">Leggi tutto →</div>
        </a>`;
}

// ── FETCH ────────────────────────────────────────
async function loadNextPage() {
    if (isLoading || allLoaded) return;
    isLoading = true;

    const loader = document.getElementById("news-loader");
    const endMsg = document.getElementById("news-end");
    const feed   = document.getElementById("news-feed");

    if (loader) loader.style.display = "block";

    try {
        const skip = currentPage * PAGE_SIZE;
        const res  = await fetch(`/api/news?limit=${PAGE_SIZE}&skip=${skip}`);
        if (!res.ok) throw new Error(`Errore ${res.status}`);
        const data = await res.json();

        if (data.length === 0 || data.length < PAGE_SIZE) {
            allLoaded = true;
            if (loader) loader.style.display = "none";
            if (feed.children.length === 0 && data.length === 0) {
                feed.innerHTML = `
                    <div class="news-empty">
                        <div class="news-empty-icon">📭</div>
                        <p>Nessuna news disponibile al momento.</p>
                    </div>`;
            }
            if (endMsg && feed.children.length > 0) endMsg.style.display = "block";
        }

        data.forEach(raw => {
            feed.insertAdjacentHTML("beforeend", buildCard(raw));
        });

        currentPage++;
    } catch (err) {
        console.error("Errore caricamento news:", err);
        if (loader) loader.innerHTML = "⚠️ Errore nel caricamento. Riprova più tardi.";
    } finally {
        isLoading = false;
        if (!allLoaded && loader) loader.style.display = "none";
    }
}

// ── SCROLL INFINITO ──────────────────────────────
function setupInfiniteScroll() {
    const sentinel = document.getElementById("news-loader");
    if (!sentinel || !("IntersectionObserver" in window)) {
        // Fallback: carica tutto subito
        loadNextPage();
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) loadNextPage();
    }, { rootMargin: "200px" });

    observer.observe(sentinel);
}

// ── INIT ─────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    setupInfiniteScroll();
});