
const User = require('../models/userModel');
const Article = require('../models/articleModel'); 
const {
    estNonVide,
    estEmailValide
} = require('../utils/validators');

// 1. Obtenir un utilisateur par son ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                error: `Utilisateur ${req.params.id} introuvable`
            });
        }

        res.status(200).json(user);
    } catch (err) {
    if (err.name === 'CastError') {
        return res.status(400).json({
            message: 'Identifiant de ressource invalide (format ObjectId attendu)'
        });
    }

    res.status(500).json({
        message: err.message
    });
}
};

// 2. Obtenir tous les utilisateurs avec filtre par rôle
const getAllUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const filtre = role ? { role } : {};

        const users = await User.find(filtre);

        res.status(200).json({
            total: users.length,
            users
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// 3. Créer un nouvel utilisateur
const createUser = async (req, res) => {
    try {
        const { name, email, age, role } = req.body;

        if (!estNonVide(name)) {
            return res.status(400).json({
                error: 'Le nom est obligatoire'
            });
        }

        if (!estEmailValide(email)) {
            return res.status(400).json({
                error: "L'email est invalide"
            });
        }

        const emailNormalise = email.trim().toLowerCase();

        const exists = await User.findOne({
            email: emailNormalise
        });

        if (exists) {
            return res.status(409).json({
                error: 'Cet email est déjà utilisé'
            });
        }

        const nouvelUser = await User.create({
            name: name.trim(),
            email: emailNormalise,
            age,
            role: role || 'user'
        });

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            user: nouvelUser
        });
    } catch (err) {
        res.status(err.code === 11000 ? 409 : 400).json({
            error: err.code === 11000
                ? 'Cet email est déjà utilisé'
                : err.message
        });
    }
};

// 4. Supprimer un utilisateur en protégeant les articles
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier que l'utilisateur existe
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                error: 'Utilisateur introuvable'
            });
        }

        // Vérifier si l'utilisateur possède des articles
        const articleExiste = await Article.findOne({
            author: id
        });

        if (articleExiste) {
            return res.status(400).json({
                message:
                    'Impossible de supprimer un utilisateur ayant des articles publiés'
            });
        }

        // Supprimer l'utilisateur seulement s'il n'a aucun article
        await User.findByIdAndDelete(id);

        res.status(200).json({
            message: 'Utilisateur supprimé avec succès'
        });

    } catch (err) {
        res.status(400).json({
            error: 'Identifiant utilisateur invalide'
        });
    }
};

// Exporter les fonctions avec les anciens noms
module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    deleteUser
};
