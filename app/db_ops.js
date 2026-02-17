
const { connectToDatabase, disconnectFromDatabase } = require("./db"); // Importa la funzione di connessione al DB
const express = require("express");
const app = express(); //crea il server web

/**
 * Recupera tutti i documenti da una collection, con query opzionale.
 * Supporta ordinamento e limite per le news.
 * 
 * @param {string} collectionName - Nome della collection MongoDB
 * @param {object} query          - Filtro opzionale (default: {})
 * @param {object} sort           - Ordinamento opzionale (default: {})
 * @param {number} limit          - Numero massimo di risultati (default: 0 = tutti)
 * @returns {Array}               - Array di documenti
 */
async function askDbAllDocuments(collectionName, query = {}, sort = {}, limit = 0) {
  try {
    const db = await connectToDatabase();
    let cursor = db.collection(collectionName).find(query).sort(sort);
    if (limit > 0) cursor = cursor.limit(limit);
    const result = await cursor.toArray();
    return result ?? [];
  } catch (error) {
    console.log(error);
    throw new Error("Errore nella lettura dal database");
  }
}

//cerca l'oggetto object  nel db
async function askDbOneDocument(collectionName,query) {
  try
  {
    const db = await connectToDatabase();
    //const result = await db.collection(collectionName).find().toArray();

    const result = await db.collection(collectionName).findOne(query);

    console.log(result);
    if(result === null)
    {
      return {};
    }
    else
    {
      return result;
    }
  }
  catch(error)
  {
    console.log(error);
    throw new Error("Errore nella lettura dal database");
  }
}

/*
//elimina l'oggetto object dal db]
async function deleteOneDocument(collectionName,query){
  try
  {
    const db = await connectToDatabase();
    if (query._id === undefined || query._id === null) 
          {throw new Error("L'ID univoco del documento da cancellare non è stato fornito nella query.");}
    const result = await db.collection(collectionName).deleteOne(query);

    return result.acknowledged;
  } 
  catch (error) 
  {
    //console.error(`Errore durante la cancellazione in ${collectionName}:`, error);
    throw new Error("Errore durante la cancellazione");
  }
}

async function editOneDocument(collectionName, query) {
    try {
        const db = await connectToDatabase();
        const collection = db.collection(collectionName);
        if (query._id === undefined || query._id === null) 
          {throw new Error("L'ID univoco del documento da aggiornare non è stato fornito nella query.");}

        const result = await collection.updateOne({_id: query._id}, {$set: query}); 

        if (result.matchedCount === 0) {
            //console.log("Nessun documento corrisponde all'ID fornito per l'aggiornamento.");
            throw new Error("Nessun documento corrisponde all'ID fornito per l'aggiornamento.");
        }
        return result;
    } catch (error) 
    {
        //console.error("Errore durante l'aggiornamento del documento:", error);
        throw new Error("Errore durante l'aggiornamento del documento");

    }
}


async function insertDocument(collectionName, object) {
  try {                 
    const db = await connectToDatabase(); // Ottiene l'istanza del database
    const collection = db.collection(collectionName); // Seleziona la collezione
    const result = await collection.insertOne(object); // Esegue l'inserimento
    return result.acknowledged;
  } 
  catch (error) 
  {
    console.log(error.code);
    if (error.code == 11000) { // Codice errore MongoDB per chiave duplicata
      return error.code;
    }
    console.error(`Errore durante l'inserimento in ${collectionName}:`, error);
    throw { type: 'GENERIC_DB_ERROR', message: 'Errore generico durante l\'inserimento nel database' };
  }
}


async function insertAuctionBid(objectId, bid) {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("auctions");
    const date = new Date().toISOString();
    //fetch current auction data
    const auction = await askDbOneDocument("auctions", { _id: objectId });
    if(auction.endDate < date)
    {
      return { acknowledged: false, message: "Asta scaduta, impossibile fare offerte." };
    }

    const result = await collection.updateOne(
      {
      "_id": objectId,
      "endDate": { "$gt": date },
      "currentBid": { "$lt": bid.amount },
      "startingBid": { "$lte": bid.amount },
      },
      {
      $push: { "bids": bid },
      $set: {"currentBid": bid.amount}
    });

    if (result.matchedCount === 0) {
      
      return { acknowledged: false, message: "Asta non trovata, scaduta, o offerta non valida (non superiore all'attuale)." };
    }
    return { acknowledged: result.acknowledged, modifiedCount: result.modifiedCount, message: "Asta aggiornata con successo con la nuova offerta." };
  }
  catch (error) {
    //console.error(`Errore durante l'aggiornamento della bid per l'asta ${objectId}:`, error);
    throw new Error("Errore durante l'aggiornamento della bid per l'asta");
  }
}

*/

module.exports = 
{
  askDbAllDocuments,
  askDbOneDocument,
  //insertDocument,
  //insertAuctionBid,
  //deleteOneDocument,
  //editOneDocument
}