
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Article = require('../models/articleModel');

const {
    estNonVide,
    estEmailValide
} = require('../utils/validators');

// Générer un token JWT
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: '10d' }
    );
};

// 1. Inscription : POST /api/users/register
const registerUser = async (req, res) => {
    try {
        const { name, email, password, age } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Nom, email et mot de passe requis'
            });
        }

        if (!estNonVide(name) || !estEmailValide(email)) {
            return res.status(400).json({
                message: 'Nom ou email invalide'
            });
        }

        const emailNormalise = email.trim().toLowerCase();

        const userExists = await User.findOne({
            email: emailNormalise
        });

        if (userExists) {
            return res.status(409).json({
                message: 'Cet email est déjà utilisé'
            });
        }

        // Un nouvel utilisateur ne peut pas choisir le rôle admin
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: emailNormalise,
            password: hashedPassword,
            age,
            role: 'user'
        });

        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                message: 'Cet email est déjà utilisé'
            });
        }

        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: err.message
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

// 2. Connexion : POST /api/users/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email et mot de passe requis'
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: 'Identifiants invalides'
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: 'Identifiants invalides'
            });
        }

        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

///

const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // 1. Vérifier la présence des deux mots de passe
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                message: 'Ancien et nouveau mots de passe requis'
            });
        }

        // 2. Vérifier la longueur du nouveau mot de passe
        if (newPassword.length < 6) {
            return res.status(400).json({
                message: 'Le nouveau mot de passe doit comporter au moins 6 caractères'
            });
        }

        // 3. Récupérer l'utilisateur connecté depuis MongoDB
        // On recharge l'utilisateur car le middleware protect
        // exclut le mot de passe avec select('-password').
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(401).json({
                message: 'Utilisateur non autorisé'
            });
        }

        // 4. Vérifier l'ancien mot de passe
        const isMatch = await bcrypt.compare(
            oldPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: 'Ancien mot de passe incorrect'
            });
        }

        // 5. Hacher le nouveau mot de passe
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // 6. Enregistrer le changement dans MongoDB
        await user.save();

        // 7. Retourner le résultat
        return res.status(200).json({
            message: 'Mot de passe mis à jour avec succès'
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

///
// 3. Profil de l'utilisateur connecté
const getUserProfile = async (req, res) => {
    try {
        return res.status(200).json(req.user);
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// 4. Obtenir un utilisateur par son ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password');

        if (!user) {
            return res.status(404).json({
                error: `Utilisateur ${req.params.id} introuvable`
            });
        }

        return res.status(200).json(user);

    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({
                message: 'Identifiant de ressource invalide (format ObjectId attendu)'
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

// 5. Obtenir tous les utilisateurs avec filtre par rôle
const getAllUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const filtre = role ? { role } : {};

        const users = await User.find(filtre).select('-password');

        return res.status(200).json({
            total: users.length,
            users
        });

    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};

// 6. Créer un utilisateur : ancienne fonction conservée
const createUser = async (req, res) => {
    try {
        const { name, email, password, age, role } = req.body;

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

        if (!password) {
            return res.status(400).json({
                error: 'Le mot de passe est obligatoire'
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

        const hashedPassword = await bcrypt.hash(password, 10);

        const nouvelUser = await User.create({
            name: name.trim(),
            email: emailNormalise,
            password: hashedPassword,
            age,
            role: role || 'user'
        });

        return res.status(201).json({
            message: 'Utilisateur créé avec succès',
            user: {
                _id: nouvelUser._id,
                name: nouvelUser.name,
                email: nouvelUser.email,
                age: nouvelUser.age,
                role: nouvelUser.role
            }
        });

    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                error: err.message
            });
        }

        return res.status(err.code === 11000 ? 409 : 500).json({
            error: err.code === 11000
                ? 'Cet email est déjà utilisé'
                : err.message
        });
    }
};

// 7. Supprimer un utilisateur en protégeant les articles
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                error: 'Utilisateur introuvable'
            });
        }

        const articleExiste = await Article.findOne({
            author: id
        });

        if (articleExiste) {
            return res.status(400).json({
                message: 'Impossible de supprimer un utilisateur ayant des articles publiés'
            });
        }

        await User.findByIdAndDelete(id);

        return res.status(200).json({
            message: 'Utilisateur supprimé avec succès'
        });

    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({
                message: 'Identifiant de ressource invalide (format ObjectId attendu)'
            });
        }

        return res.status(500).json({
            error: err.message
        });
    }
};
// PUT /api/users/:id/role
const promoteToAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: 'Utilisateur introuvable'
            });
        }

        user.role = 'admin';
        await user.save();

        res.status(200).json({
            message: 'Utilisateur promu administrateur avec succès',
            user
        });
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

// Exporter toutes les fonctions
module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    getAllUsers,
    getUserById,
    createUser,
    deleteUser,
    updatePassword,
    promoteToAdmin
};
