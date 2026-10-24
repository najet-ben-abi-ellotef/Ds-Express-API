
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// 1. Protéger les routes privées avec JWT
const protect = async (req, res, next) => {
    let token;

    // Vérifier la présence du token dans Authorization
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        try {
            // Extraire le token
            token = req.headers.authorization.split(' ')[1];

            // Vérifier la signature et la validité du token
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            // Récupérer l'utilisateur sans son mot de passe
            req.user = await User.findById(decoded.id)
                .select('-password');

            if (!req.user) {
                return res.status(401).json({
                    message: 'Non autorisé, utilisateur introuvable'
                });
            }

            // Passer au middleware suivant
            return next();

        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    message: 'Votre session a expiré, veuillez vous reconnecter'
                });
            }

            return res.status(401).json({
                message: 'Token invalide, accès non autorisé'
            });
        }
 }
    // Aucun token fourni
    return res.status(401).json({
        message: 'Non autorisé, aucun token fourni'
    });
};

// 2. Réserver l'accès aux administrateurs
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }

    return res.status(403).json({
        message: 'Accès refusé : droits administrateur requis'
    });
};

module.exports = {
    protect,
    adminOnly
};
