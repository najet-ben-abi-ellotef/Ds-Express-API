
const Article = require('../models/articleModel');
const User = require('../models/userModel');

// 1. Récupérer tous les articles avec les informations de l'auteur
// GET /api/articles?author=...
const getAllArticles = async (req, res) => {
    try {
        const { author } = req.query;

        let filtre = {};

        // Filtrer par nom de l'auteur
        if (author) {
            const users = await User.find({
                name: author
            }).select('_id');

            const authorIds = users.map(user => user._id);

            filtre.author = { $in: authorIds };
        }

        const articles = await Article.find(filtre)
            .populate('author', 'name email');

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

// 2. Récupérer un article par son ID
// GET /api/articles/:id
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

    res.status(500).json({
        message: err.message
    });
}
};

// 3. Créer un nouvel article lié à un auteur
// POST /api/articles
const createArticle = async (req, res) => {
    try {
        const { title, content, authorId } = req.body;

        if (!title || !content || !authorId) {
            return res.status(400).json({
                message: 'title, content et authorId sont obligatoires'
            });
        }

        // Vérifier que l'auteur existe dans MongoDB
        const author = await User.findById(authorId);

        if (!author) {
            return res.status(404).json({
                message: 'Auteur introuvable'
            });
        }

        // Créer l'article dans MongoDB
        const newArticle = await Article.create({
            title,
            content,
            author: authorId
        });

        // Retourner les informations de l'auteur
        const populatedArticle = await newArticle.populate(
            'author',
            'name email'
        );

        res.status(201).json(populatedArticle);

    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
};

// 4. Mettre à jour un article
// PUT /api/articles/:id
const updateArticle = async (req, res) => {
    try {
        const { title, content, authorId } = req.body;

        const modifications = {};

        if (title !== undefined) {
            modifications.title = title;
        }

        if (content !== undefined) {
            modifications.content = content;
        }

        // Vérifier le nouvel auteur si authorId est fourni
        if (authorId !== undefined) {
            const author = await User.findById(authorId);

            if (!author) {
                return res.status(404).json({
                    message: 'Auteur introuvable'
                });
            }

            modifications.author = authorId;
        }

        const article = await Article.findByIdAndUpdate(
            req.params.id,
            modifications,
            {
                new: true,
                runValidators: true
            }
        ).populate('author', 'name email');

        if (!article) {
            return res.status(404).json({
                message: 'Article introuvable pour la mise à jour'
            });
        }

        res.status(200).json({
            message: 'Article mis à jour avec succès',
            article
        });

    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
};

// 5. Supprimer un article
// DELETE /api/articles/:id
const deleteArticle = async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(
            req.params.id
        );

        if (!article) {
            return res.status(404).json({
                message: 'Article introuvable'
            });
        }

        res.status(200).json({
            message: 'Article supprimé avec succès',
            article
        });

    } catch (err) {
        res.status(400).json({
            message: 'Identifiant article invalide'
        });
    }
};

// Exporter les fonctions avec les anciens noms
module.exports = {
    getAllArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle
};
