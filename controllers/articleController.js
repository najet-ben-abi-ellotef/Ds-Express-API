
const Article = require('../models/articleModel');

// 1. Récupérer tous les articles avec les informations de l'auteur
const getAllArticles = async (req, res) => {
    try {
        const { author } = req.query;
        let filtre = {};

        if (author) {
            const User = require('../models/userModel');

            const users = await User.find({
                name: author
            }).select('_id');

            const authorIds = users.map(user => user._id);
            filtre.author = { $in: authorIds };
        }

        const articles = await Article.find(filtre)
            .populate('author', 'name email role');

        res.status(200).json({
            total: articles.length,
            articles
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. Récupérer un article par son ID
const getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
            .populate('author', 'name email');

        if (!article) {
            return res.status(404).json({
                message: 'Article introuvable'
            });
        }

        res.status(200).json(article);

    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({
                message: 'Identifiant de ressource invalide (format ObjectId attendu)'
            });
        }

        res.status(500).json({ message: err.message });
    }
};

// 3. Créer un article (route protégée par JWT)
const createArticle = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: 'Titre et contenu obligatoires'
            });
        }

        // L'auteur vient du token JWT vérifié
        const newArticle = await Article.create({
            title,
            content,
            author: req.user._id
        });

        const populated = await newArticle.populate(
            'author',
            'name email role'
        );

        res.status(201).json(populated);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 4. Modifier un article : auteur ou administrateur
const updateArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({
                message: 'Article non trouvé'
            });
        }

        // Vérification des droits de propriété
        if (
            article.author.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                message: "Action interdite : vous n'êtes pas l'auteur de cet article"
            });
        }

        if (req.body.title !== undefined) {
            article.title = req.body.title;
        }

        if (req.body.content !== undefined) {
            article.content = req.body.content;
        }

        const updated = await article.save();

        const populated = await updated.populate(
            'author',
            'name email role'
        );

        res.status(200).json(populated);

    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({
                message: 'Identifiant invalide'
            });
        }

        res.status(500).json({ message: err.message });
    }
};

// 5. Supprimer un article : auteur ou administrateur
const deleteArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({
                message: 'Article non trouvé'
            });
        }

        // Vérification des droits de propriété
        if (
            article.author.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                message: "Action interdite : vous n'êtes pas l'auteur de cet article"
            });
        }

        await Article.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: 'Article supprimé avec succès',
            id: req.params.id
        });

    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({
                message: 'Identifiant invalide'
            });
        }

        res.status(500).json({ message: err.message });
    }
};
// GET /api/articles/my-articles
const getMyArticles = async (req, res) => {
    try {
        const articles = await Article.find({
            author: req.user._id
        });

        res.status(200).json({
            total: articles.length,
            articles
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

// Exporter les fonctions avec les anciens noms
module.exports = {
    getAllArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    getMyArticles
};
