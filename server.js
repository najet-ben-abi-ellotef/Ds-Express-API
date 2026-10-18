const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const articleRoutes = require('./routes/articleRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config () ;

const app = express();

const PORT = process.env.PORT || 3001;


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

//

 // Connexion à MongoDB Atlas puis démarrage du serveur
(async () => {
    try {
        // 1. Établir la connexion à MongoDB
        await connectDB(process.env.MONGODB_URI);

        // 2. Démarrer le serveur HTTP
        app.listen(PORT, () => {
            console.log(`Serveur MERN en écoute sur http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error(
            'Erreur critique au démarrage du serveur :',
            err.message
        );

        process.exit(1);
    }
})();

