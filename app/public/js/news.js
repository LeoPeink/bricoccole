/**
 * news.js — Feed news con scroll infinito
 * Usato da: news.html
 */

// ── CONFIG ──────────────────────────────────────
const PAGE_SIZE = 2;
const IMG_PATH  = "/media/news/";
const EMOJI_MAP = { expo: "🏆", cuccioli: "🐱", default: "📰" };

// ── STATO ───────────────────────────────────────
let currentPage = 0;
let isLoading   = false;
let allLoaded   = false;

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
    return EMOJI_MAP[(cat || "").toLowerCase().trim()] || EMOJI_MAP.default;
}

// ── BUILD CARD ───────────────────────────────────
function buildCard(raw) {
    const title = raw.titolo_it || raw.titolo_en || "(senza titolo)";
    const date  = formatDate(raw.data);
    const text  = raw.testo_it  || raw.testo_en  || "";
    const cat   = raw.categoria || "";
    const slug  = raw.slug      || "";
    const foto  = Array.isArray(raw.foto) && raw.foto.length > 0 ? raw.foto[0] : null;
    const link  = `/news-detail?slug=${encodeURIComponent(slug)}`;
    const emoji = categoryEmoji(cat);

    // Se c'è una foto, proviamo a mostrarla.
    // onerror: se l'immagine non carica, sostituiamo con il placeholder emoji.
    const imageHtml = foto
        ? `<img class="news-card-image"
                src="${IMG_PATH}${foto}"
                alt="${title}"
                loading="lazy"
                onerror="this.replaceWith(Object.assign(document.createElement('div'), {className:'news-card-image-placeholder', textContent:'${emoji}'}));">`
        : `<div class="news-card-image-placeholder">${emoji}</div>`;

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

        if (data.length === 0 && currentPage === 0) {
            feed.innerHTML = `
                <div class="news-empty">
                    <div class="news-empty-icon">📭</div>
                    <p>Nessuna news disponibile al momento.</p>
                </div>`;
        } else {
            data.forEach(raw => {
                feed.insertAdjacentHTML("beforeend", buildCard(raw));
            });
        }

        currentPage++;

        if (data.length < PAGE_SIZE) {
            allLoaded = true;
            if (loader) loader.style.display = "none";
            if (endMsg && currentPage > 1) endMsg.style.display = "block";
        }

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
    const sentinel = document.getElementById("news-sentinel");

    if (!sentinel || !("IntersectionObserver" in window)) {
        loadNextPage();
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) loadNextPage();
    }, { rootMargin: "300px" });

    observer.observe(sentinel);
}

// ── INIT ─────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    setupInfiniteScroll();
});