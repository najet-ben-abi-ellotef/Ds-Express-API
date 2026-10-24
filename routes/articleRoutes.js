
const express = require('express');
const router = express.Router();

const articleController = require('../controllers/articleController');
const { protect } = require('../middlewares/authMiddleware');

// Consultation publique
router.get('/', articleController.getAllArticles);
// Récupérer les articles de l'utilisateur connecté
router.get('/my-articles', protect, articleController.getMyArticles);
router.get('/:id', articleController.getArticleById);

// Opérations d'écriture protégées par JWT
router.post('/', protect, articleController.createArticle);
router.put('/:id', protect, articleController.updateArticle);
router.delete('/:id', protect, articleController.deleteArticle);

module.exports = router;
