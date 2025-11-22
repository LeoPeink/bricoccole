const express = require("express"); //configuro Express come framework NodeJS
const app = express();
const port = 3000;

//IMPORTAZIONE MODULI
//---DB CONNECTION & OPERATIONS
//const db = require("./db.js"); // Importa il modulo per la connessione al database
//const { MongoClient } = require("mongodb");
//const dbOperator = require("./db_ops.js"); // Importa le funzioni


//---JWT & AUTHENTICATION
//const jwt = require("jsonwebtoken");
//const cookieParser = require("cookie-parser"); //per gestire i cookie //TODO AGGIUNGI ALLE DEP DI DOCKER
//app.use(cookieParser()); //permette di leggere i cookie nelle richieste


//--ROUTES
const public_routes = require("./public_routes.js"); // Importa il router per le richieste POST definito in routes_POST.js
const protected_routes = require("./protected_routes.js"); // Importa il router per le richieste POST definito in routes_POST.js

console.log("Inizializzo il server Express...");


//CONFIGIRAZIONE MIDDLEWARE
//app.use(express.json()); //necessario per gestire il corpo delle richieste in formato JSON nelle chiamate POST
//app.use(express.urlencoded({ extended: true })); //necessario per gestire il corpo delle richieste in formato x-www-form-urlencoded (es. form HTML)



//---RISORSE STATICHE + EXTENSION DELETER
app.use(express.static("public/", { extensions: ["","html","css","js"] })); //permette di chiamare /index invece di /index.html


//---ROUTE PUBBLICHE
//app.use("/api", public_routes); //collego le route definite in public_routes.js al web server


//---RISORSE PRIVATE
//app.use("/api", verifyToken, protected_routes);
//app.use("/restricted", verifyToken, express.static("restricted/", { extensions: ["","html"] }));




//LASTLY, ERROR PAGE AS LAST MATCH
app.use((req, res) => {
    res.status(404).sendFile('404.html' , {root: 'public' });
});






//UTILS
function verifyToken(req, res, next) {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, "secret", (err, payload) => {
      if (err) {
        res.status(403).redirect("/login");
      }
      else {next();}
    });
  } else {
        res.status(403).redirect("/login");
  }
}


//AVVIO IL SERVER
app.listen(port, () => {
  console.log(`Webserver in ascolto sulla porta ${port}`);
});
