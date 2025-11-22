const express = require("express");
const router = express.Router();
//const jwt = require("jsonwebtoken");
//const dbOperator = require("./db_ops.js");
//const { ObjectId } = require("mongodb"); // Importa ObjectId dal modulo mongodb
//const { sendGETRequest } = require("./public/js/lib_requests.js");

//ELENCO ROUTES PROTETTE DA LOGIN
/*
//INSERIMENTO DI UNA NUOVA ASTA
router.post("/auctions", async (req, res) => {
  if(!req.body.title || !req.body.description || !req.body.creatorId || !req.body.startingBid || !req.body.endDate) {
    res.status(400).json({ message: "Errore: Dati dell'asta incompleti" });
    return;
  }
  if(req.body.title.length < 1 || req.body.title.length > 50 || req.body.description.length < 1 || req.body.description.length > 500) {
    res.status(400).json({ message: "Errore: Titolo e descrizione devono rispettare i limiti di lunghezza" });
    return;
  }
  if(new Date(req.body.endDate) <= new Date()) {
    res.status(400).json({ message: "Errore: La data di fine asta deve essere nel futuro" });
    return;
  }
  if(isNaN(req.body.startingBid) || req.body.startingBid <= 0) {
    res.status(400).json({ message: "Errore: Il prezzo di partenza deve essere un numero positivo" });
    return;
  }
  if(req.body.startingBid % 1 != 0 && req.body.startingBid.toString().split(".")[1].length > 2) {
    res.status(400).json({ message: "Errore: Il prezzo di partenza può avere al massimo due cifre decimali" });
    return;
  }
  const result = await dbOperator.insertDocument("auctions", req.body);
  switch (result) {
    case true:
      res
        .status(201)
        .json({ message: "inserimento dell'asta eseguito con successo" });
      break;
    default:
      res
        .status(500)
        .json({ message: "Errore durante l'inserimento dell'asta" });
      break;
  }
});

// Esempio di un endpoint API GET semplice
router.get("/prova", (req, res) => {
  console.log("API CALL: /api/prova");
  res.json({ message: "CLIENT  CHIAMA - SERVER RISPONDE!" }); // Risponde con un JSON
});

//INFORMAZIONI SULL'UTENTE LOGGATO
router.get("/whoami", async (req, res) => {
  //pesca le informazioni dell'utente dal DB usando come query il cookie
  const username = {
    username: jwt.verify(req.cookies.token, "secret").username,
  }; //estrai lo username dal cookie, qualora l'utente sia loggatos
  //console.log('ROUTER: username='+username);
  //chiedi al DB TUTTO SU QUELL'USER
  answer = await dbOperator.askDbOneDocument("users", username); 
  res.json(answer);
});

//INSERIMENTO DI UNA NUOVA OFFERTA
router.post("/auctions/:id/bids", async (req, res) => {
  const bid = req.body;
  //console.log('body (bid):' + JSON.stringify(req.body));
  //console.log('_id:' + req.params.id);
  objectId = ObjectId.createFromHexString(req.params.id);
  const result = await dbOperator.insertAuctionBid(objectId, bid);
  res.json(result);
});

//CANCELLAZIONE DELL'ASTA
router.delete("/auctions/:id", async (req, res) => {
  let query;
  try {
    query = { _id: new ObjectId(req.params.id) }; //filtro per avere l'asta giusta
  } catch (error) {
    res.status(400).redirect("/index");
  }

  try {
    const user = await dbOperator.askDbOneDocument("users", {
      username: jwt.verify(req.cookies.token, "secret").username,
    });
    const auction = await dbOperator.askDbOneDocument("auctions", query);
    const userId = user._id.toString();
    if (userId === auction.creatorId) {
      const result = await dbOperator.deleteOneDocument("auctions", query);
      res.status(200).json(result);
    } else {
      res
        .status(403)
        .json({ message: "Errore durante la cancellazione dell'asta" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Errore durante la cancellazione dell'asta" });
  }
});

//MODIFICA DELL'ASTA
router.put("/auctions/:id", async (req, res) => {
  let query;
  try {
    query = { _id: new ObjectId(req.params.id) }; //filtro per avere l'asta giusta
  } catch (error) {
    res.status(400).redirect("/index");
  }

  try {
    const user = await dbOperator.askDbOneDocument("users", {
      username: jwt.verify(req.cookies.token, "secret").username,
    }); //estrai lo user (se loggato)
    const auction = await dbOperator.askDbOneDocument("auctions", query);
    const userId = user._id.toString();
    if (userId === auction.creatorId) {
      query = { ...query, ...req.body };
      const result = await dbOperator.editOneDocument("auctions", { ...query });
      if (result.acknowledged) {
        if (result.modifiedCount === 1) {
          res.status(200).json({ message: "Asta modificata con successo" });
        } else {
          res
            .status(200)
            .json({ message: "Nessuna modifica apportata all'asta" });
        }
      } else {
        res
          .status(500)
          .json({ message: "Errore durante la modifica dell'asta" });
      }
    } else {
      res.status(403).json({ message: "Errore durante la modifica dell'asta" });
    }
  } catch (error) {
    res.status(500).json({ message: "Errore durante la modifica dell'asta" });
  }
});
*/
module.exports = router; // Esporta il router per essere utilizzato in altri file
