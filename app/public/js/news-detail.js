/**
 * news-detail.js — Pagina singola news
 * Usato da: news-detail.html
 *
 * Legge il parametro ?slug= dalla URL e chiama GET /api/news/:slug
 */

// ── CONFIG ───────────────────────────────────────
const IMG_PATH = "/media/news/";

// ── HELPERS ──────────────────────────────────────
function formatDate(str) {
    if (!str) return "";
    return new Date(str.length === 10 ? str + "T12:00:00" : str)
        .toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
}

// ── LIGHTBOX ─────────────────────────────────────
function openLightbox(src, alt) {
    const lb  = document.getElementById("lightbox");
    const img = document.getElementById("lightbox-img");
    if (!lb || !img) return;
    img.src = src;
    img.alt = alt;
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    const lb = document.getElementById("lightbox");
    if (lb) lb.classList.remove("open");
    document.body.style.overflow = "";
}

// Chiudi lightbox con ESC
document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeLightbox();
});

// ── BUILD ARTICOLO ────────────────────────────────
function buildArticle(raw) {
    const title = raw.titolo_it || raw.titolo_en || "(senza titolo)";
    const text  = raw.testo_it  || raw.testo_en  || "";
    const date  = formatDate(raw.data);
    const cat   = raw.categoria || "";
    const foto  = Array.isArray(raw.foto) ? raw.foto : [];

    // Badge categoria
    const badgeHtml = cat
        ? `<span class="article-badge">${cat}</span>`
        : "";

    // Galleria
    let galleryHtml = "";
    if (foto.length > 0) {
        const singleClass = foto.length === 1 ? " single" : "";
        const imgs = foto.map(f => {
            const src = IMG_PATH + f;
            return `<img src="${src}" alt="${title}" loading="lazy"
                        onclick="openLightbox('${src}', '${title.replace(/'/g, "\\'")}')">`;
        }).join("");
        galleryHtml = `<div class="article-gallery${singleClass}">${imgs}</div>`;
    }

    // Aggiorna il titolo della tab del browser
    document.title = `BRICOCCOLE | ${title}`;

    return `
        <div class="article-header">
            <div class="article-meta">
                ${badgeHtml}
                <span class="article-date-big">${date}</span>
            </div>
            <h1 class="article-title-big">${title}</h1>
        </div>

        ${galleryHtml}

        <div class="article-body">
            ${text.replace(/\n/g, "<br>")}
        </div>`;
}

// ── FETCH ─────────────────────────────────────────
async function loadArticle() {
    const params = new URLSearchParams(window.location.search);
    const slug   = params.get("slug");
    const container = document.getElementById("article-content");

    if (!slug) {
        container.innerHTML = `<p style="color:var(--color-text-light);font-style:italic;">
            News non trovata. <a href="/news">Torna alle news</a>.
        </p>`;
        return;
    }

    try {
        const res = await fetch(`/api/news/${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error(`${res.status}`);
        const raw = await res.json();

        if (!raw || Object.keys(raw).length === 0) {
            container.innerHTML = `<p style="color:var(--color-text-light);font-style:italic;">
                News non trovata. <a href="/news">Torna alle news</a>.
            </p>`;
            return;
        }

        container.innerHTML = buildArticle(raw);

    } catch (err) {
        console.error("Errore caricamento articolo:", err);
        container.innerHTML = `<p style="color:var(--color-text-light);font-style:italic;">
            ⚠️ Errore nel caricamento. <a href="/news">Torna alle news</a>.
        </p>`;
    }
}

// ── INIT ──────────────────────────────────────────
document.addEventListener("DOMContentLoaded", loadArticle);