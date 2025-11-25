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

  // Carica tutti gli include necessari
  document.addEventListener("DOMContentLoaded", async () => {
    //TODO make it dynamic, call the server and ask which components to load.
    await loadInclude("#meta_head", "/components/meta_head.html");
    await loadInclude("#header", "/components/header.html");
    await loadInclude("#navbar", "/components/navbar.html");
    await loadInclude("#footer", "/components/footer.html");
  });