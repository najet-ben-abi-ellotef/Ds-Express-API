const express = require('express');
const articleRoutes = require('./routes/articleRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = 3001;

// Middleware global
app.use(express.json()); // indispensable pour lire le corps JSON (req.body)

// Montage du routeur sous le préfixe '/api/articles'
app.use('/api/articles', articleRoutes);

app.use('/api/users', userRoutes);
// Route d'accueil pour tester le statut général du serveur
app.get('/', (req, res) => {
    res.json({
        message: 'API du Blog - Serveur Modulaire Opérationnel (SoC)'
    });
});

app.get('/about', (req, res) => {
    res.json({
        application: "APP S1",
        author: "Najet",
        version: "1"
    });
});


// 4. dé marrer le serveur : il attend les requêtes sur le port 3000
app.listen (PORT , () => {
console . log(`Serveur disponible sur http :// localhost :${ PORT }`) ;
}) ;
