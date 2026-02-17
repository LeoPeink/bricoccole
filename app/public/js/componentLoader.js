  async function loadInclude(selector, file) {
    try {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);

      const html = await response.text();
      const container = document.querySelector(selector);
      
      if (!container) {
        console.warn(`Elemento non trovato: ${selector}`);
        return;
      }

      container.innerHTML = html;
    } catch (error) {
      console.error(`Errore nel caricare ${file}:`, error);
    }
  }

  // Component loading con promise parallela e gestione della classe "ready" per l'effetto fade-in
document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([
        loadInclude("#meta_head", "/components/meta_head.html"),
        loadInclude("#header",    "/components/header.html"),
        loadInclude("#navbar",    "/components/navbar.html"),
        loadInclude("#footer",    "/components/footer.html"),
    ]);
    document.body.classList.add("ready");  
});