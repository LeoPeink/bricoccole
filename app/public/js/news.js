/**
 * news.js
 * Carica dinamicamente le news dalla API e le inserisce nella pagina news.html
 * 
 * DA INCLUDERE in news.html:
 *   <script src="/js/news.js" defer></script>
 * 
 * La pagina news.html deve avere:
 *   - <section class="content-section"> con dentro:
 *       - <div id="featured-news-container"></div>   ← articolo in evidenza
 *       - <div class="secondary-news" id="news-list"></div>  ← news secondarie
 */


// ──────────────────────────────────────────────
// CONFIGURAZIONE
// ──────────────────────────────────────────────
const NEWS_LIMIT = 10; // Quante news caricare in totale


// ──────────────────────────────────────────────
// FETCH DELLE NEWS DAL SERVER
// ──────────────────────────────────────────────

/**
 * Recupera le news dall'API.
 * @param {number} limit - Numero massimo di news da ricevere
 * @returns {Promise<Array>} - Array di oggetti news
 */
async function fetchNews(limit = NEWS_LIMIT) {
  const response = await fetch(`/api/news?limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Errore API: ${response.status}`);
  }
  return await response.json();
}


// ──────────────────────────────────────────────
// COSTRUZIONE HTML
// ──────────────────────────────────────────────

/**
 * Formatta una data ISO in formato italiano leggibile.
 * Es. "2025-05-10T00:00:00.000Z" → "10 Maggio 2025"
 * @param {string} dateString
 * @returns {string}
 */
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Crea l'HTML per l'articolo in primo piano (featured).
 * @param {object} news
 * @returns {string} HTML string
 */
function buildFeaturedArticle(news) {
  const imageSection = news.image
    ? `<div class="article-image">
        <img src="${news.image}" alt="${news.imageAlt || news.title}" class="featured-image">
       </div>`
    : "";

  const titleContent = news.link
    ? `<a href="${news.link}">${news.title}</a>`
    : news.title;

  return `
    <article class="featured-article">
      <div class="article-content">
        <h3 class="article-title">${titleContent}</h3>
        <p class="article-date">${formatDate(news.date)}</p>
        <p class="article-text">${news.text || news.summary || ""}</p>
      </div>
      ${imageSection}
    </article>
  `;
}

/**
 * Crea l'HTML per una news secondaria.
 * @param {object} news
 * @returns {string} HTML string
 */
function buildNewsItem(news) {
  const titleContent = news.link
    ? `<a href="${news.link}">${news.title}</a>`
    : news.title;

  return `
    <article class="news-item">
      <h4 class="news-title">${titleContent}</h4>
      <p class="news-date">${formatDate(news.date)}</p>
      <p class="news-summary">${news.summary || ""}</p>
    </article>
  `;
}

/**
 * Mostra un messaggio di errore nei container.
 */
function showError(message) {
  const featuredContainer = document.getElementById("featured-news-container");
  const newsList = document.getElementById("news-list");

  const errorHtml = `<p class="news-summary" style="color: var(--color-text-light); font-style: italic;">${message}</p>`;

  if (featuredContainer) featuredContainer.innerHTML = errorHtml;
  if (newsList) newsList.innerHTML = "";
}


// ──────────────────────────────────────────────
// RENDERING NELLA PAGINA
// ──────────────────────────────────────────────

/**
 * Renderizza le news nei rispettivi container HTML.
 * La prima news con `featured: true` va nell'articolo in evidenza.
 * Le restanti vanno nella lista secondaria.
 * @param {Array} newsList
 */
function renderNews(newsList) {
  const featuredContainer = document.getElementById("featured-news-container");
  const secondaryContainer = document.getElementById("news-list");

  if (!newsList || newsList.length === 0) {
    showError("Nessuna news disponibile al momento.");
    return;
  }

  // Separa la news featured dalle secondarie
  const featuredIndex = newsList.findIndex((n) => n.featured === true);
  let featuredNews = null;
  let secondaryNews = [...newsList];

  if (featuredIndex !== -1) {
    featuredNews = newsList[featuredIndex];
    secondaryNews = newsList.filter((_, i) => i !== featuredIndex);
  } else {
    // Se nessuna ha featured=true, usa la prima come featured
    featuredNews = newsList[0];
    secondaryNews = newsList.slice(1);
  }

  // Render articolo in evidenza
  if (featuredContainer) {
    featuredContainer.innerHTML = buildFeaturedArticle(featuredNews);
  }

  // Render news secondarie
  if (secondaryContainer) {
    if (secondaryNews.length === 0) {
      secondaryContainer.innerHTML = "";
    } else {
      secondaryContainer.innerHTML = secondaryNews.map(buildNewsItem).join("");
    }
  }
}


// ──────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const news = await fetchNews(NEWS_LIMIT);
    renderNews(news);
  } catch (error) {
    console.error("Errore nel caricamento delle news:", error);
    showError("Impossibile caricare le news. Riprova più tardi.");
  }
});