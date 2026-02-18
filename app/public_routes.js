const express = require("express");
const router = express.Router();
const dbOperator = require("./db_ops.js");
const db = require("./db.js");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

// AGGIUNGI ALLE DEP DI DOCKER
//LOGIN DI UN UTENTE
router.post("/auth/signin", async (req, res) => {
  const { username, password } = req.body; 
  //print debug line on server
  console.log("Attempting login for user:", username , "with password:", password, 'DELETE ME!!!'); //TODO DELETE ME
  const u = { username, password }; //pulizia del body
  try {
    const user = await dbOperator.askDbOneDocument("users", u);
    if (JSON.stringify(user) !== "{}") 
      {
      const payload = { username: user.username };
      const secret = "secret"; 
      let token = jwt.sign({ username: user.username }, secret); //crea token
      res.cookie("token", token, { httpOnly: true }); //securecookie salvato nel browser
      console.log("USER " + user.username + " LOGGED IN!");
      res.redirect("/index");
    } else {
      console.log("LOGIN ERROR!"); //log the error on server
      res.status(401).redirect("/login?error=1"); //redirect to login with error query parameter
    }
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * GET /api/news
 * 
 * Restituisce l'elenco delle news dalla collection "news" di MongoDB.
 * Le news sono ordinate dalla più recente alla più vecchia.
 * 
 * Query params opzionali:
 *   ?limit=N    → limita il numero di news restituite (default: 10)
 *   ?featured=1 → restituisce solo la news in primo piano (featured: true)
 * 
 * Struttura attesa di ogni documento nella collection "news":
 * {
 *   title:    string,       // Titolo della news
 *   date:     Date,         // Data di pubblicazione
 *   summary:  string,       // Testo breve / sommario
 *   text:     string,       // Testo completo (opzionale)
 *   image:    string,       // Path immagine (opzionale, es. "/media/foto.png")
 *   imageAlt: string,       // Alt text immagine (opzionale)
 *   link:     string,       // Link collegato (opzionale, es. "/disponibili")
 *   featured: boolean       // Se true, viene mostrata come articolo in evidenza
 * }
 */

// ================================================================
// PATCH PER public_routes.js
// Incolla questi due blocchi DENTRO public_routes.js, prima di module.exports
// ================================================================

/**
 * GET /api/news
 * Lista delle news ordinate dalla più recente, con paginazione.
 *
 * Query params:
 *   ?limit=N   → quante news per pagina (default: 8)
 *   ?skip=N    → offset per lo scroll infinito (default: 0)
 */
router.get("/news", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;
        const skip  = parseInt(req.query.skip)  || 0;

        const result = await dbOperator.askDbAllDocuments(
            "news",
            { pubblicato: true },
            { data: -1 },
            limit,
            skip
        );

        res.json(result);
    } catch (error) {
        console.error("Errore /api/news:", error);
        res.status(500).json({ message: "Errore durante il recupero delle news" });
    }
});

/**
 * GET /api/news/:slug
 * Singola news per slug — usata dalla pagina di dettaglio.
 */
router.get("/news/:slug", async (req, res) => {
    try {
        const result = await dbOperator.askDbOneDocument("news", {
            slug: req.params.slug,
            pubblicato: true
        });

        if (!result || Object.keys(result).length === 0) {
            return res.status(404).json({ message: "News non trovata" });
        }

        res.json(result);
    } catch (error) {
        console.error("Errore /api/news/:slug:", error);
        res.status(500).json({ message: "Errore durante il recupero della news" });
    }
});
/*
//REGISTRAZIONE DI UN UTENTE
router.post("/auth/signup", async (req, res) => {
  if(!req.body.username || !req.body.password || !req.body.name || !req.body.surname)
  {
    res.status(400).json({ message: "Campi mancanti" });
    return;
  }
  const result = await dbOperator.insertDocument("users", req.body);
  switch (result) {
    case true:
      res
        .status(201)
        .json({ message: "inserimento dell'utente eseguito con successo" });
      break;
    case 11000:
      res.status(409).json({ message: "Username già esistente" });
      break;
    default:
      res
        .status(500)
        .json({ message: "Errore durante l'inserimento dell'utente" });
      break;
  }
});

//ELENCO ASTE CON FILTRI
router.get("/auctions", async (req, res) => {

  let query = {};
  if (req.query.title) {
    query.title = { $regex: "^.*" + req.query.title + ".*$", $options: "i" }; //ricerca testo
  }
  if (req.query.uid) {
    query.creatorId = req.query.uid; //id esatto
  }
  if (req.query.winnerId) {
    query.winnerId = req.query.winnerId; //id esatto
  }
  try {
    const result = await dbOperator.askDbAllDocuments("auctions", query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Errore durante la ricerca delle aste" });
  }

});

//DETTAGLI DI UNA SINGOLA ASTA
router.get("/auctions/:id", async (req, res) => {

  let query;
  try {
    query = { _id: new ObjectId(req.params.id) };
  } catch (error) {
    res.status(400).redirect("/index");
  }
  try {
    const result = await dbOperator.askDbOneDocument("auctions", query);
    //console.log(result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Errore durante la ricerca dell'asta" });
  }

});

//RICERCA DI UN UTENTE
router.get("/users/:id", async (req, res) => {

  let query;
  try {
    query = { _id: new ObjectId(req.params.id) };
  } catch (error) {
    res.status(400).redirect("/index");
  }
  try
  {
    const result = await dbOperator.askDbOneDocument("users", query);
  }
  catch (error)
  {
    res.status(500).json({ message: "Errore durante la ricerca dell'utente" });
  }
  res.json(result);

});

//VITTORIA ASTA
router.put("/auctions/:id/winner", async (req, res) => {
  let query;
  try {
    query = { _id: new ObjectId(req.params.id) };
  } catch (error) {
    res.status(400).redirect("/index");
  }
  query = { ...query, winnerId: req.body.winnerId };
  try
  {
      const result = await dbOperator.editOneDocument("auctions", query);
      res.json(result);
  }
  catch (error)
  {
      res.status(500).json({ message: "Errore durante l'aggiornamento dell'asta" });
  }
  res.json(result);
});

//RICERCA DI PIU' UTENTI CON FILTRO SU USERNAME
router.get("/users", async (req, res) => {

  let query = {};
  //console.log(req.query.q);
  if (req.query.username) {
    query.username = {
      $regex: "^.*" + req.query.username + ".*$",
      $options: "i",
    }; //ricerca testo
  }
  try{
      const result = await dbOperator.askDbAllDocuments("users", query);
      res.json(result);
  }
  catch (error)
  {
      res.status(500).json({ message: "Errore durante la ricerca degli utenti" });
  }
  res.json(result);
});

//GENERAZIONE DINAMICA DELLA NAVBAR //TODO PULISCI CODICE
router.get("/navbar", async (req, res) => {
  const fs = require("fs");
  const path = require("path");
  const publicDir = path.join(__dirname, "/public");
  const restrictedDir = path.join(__dirname, "/restricted");

  try {
    let allHtmlFiles = [];
    const publicFiles = fs.readdirSync(publicDir);
    const publicHtmlFiles = publicFiles.filter((file) =>
      file.endsWith(".html")
    );
    // I file pubblici vengono aggiunti così come sono
    allHtmlFiles = allHtmlFiles.concat(publicHtmlFiles);
    //console.log(allHtmlFiles);
    const restrictedFiles = fs.readdirSync(restrictedDir);
    const restrictedHtmlFiles = restrictedFiles.filter((file) =>
      file.endsWith(".html")
    );

    // Modifica qui: Prependiamo "/restricted/" a ogni nome di file ristretto
    const formattedRestrictedHtmlFiles = restrictedHtmlFiles.map(
      (file) => `restricted/${file}`
    );
    allHtmlFiles = allHtmlFiles.concat(formattedRestrictedHtmlFiles);
    //console.log(allHtmlFiles);

    res.json(allHtmlFiles);
  } catch (error) {
    console.error("Errore durante la lettura dei file HTML:", error);
    res.status(500).json({ error: "Errore durante la lettura dei file HTML" });
  }
});

//ELENCO OFFERTE DI UNA SINGOLA ASTA
router.get("/auctions/:id/bids", async (req, res) => {
  let query;
  try {
    query = { _id: new ObjectId(req.params.id) };
  } catch (error) {
    res.status(400).redirect("/index");
  }
  try {
  const result = await dbOperator.askDbOneDocument("auctions", query);
  } catch (error) {
    res.status(500).json({ message: "Errore durante la ricerca dell'asta" });
  }
  res.send({ bids: result.bids });
});
*/
module.exports = router; // Esporta il router per essere utilizzato in altri file

