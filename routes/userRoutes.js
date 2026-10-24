
const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const {
    protect,
    adminOnly
} = require('../middlewares/authMiddleware');

// Routes d'authentification publiques
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Route privée protégée par JWT
router.get('/profile', protect, userController.getUserProfile);

router.put('/update-password', protect, userController.updatePassword);
// Route réservée aux administrateurs
router.get('/', protect, adminOnly, userController.getAllUsers);

// Promouvoir un utilisateur en administrateur
router.put('/:id/role', protect, adminOnly, userController.promoteToAdmin);
// Récupérer un utilisateur par son ID
router.get('/:id', userController.getUserById);

// Créer un utilisateur
router.post('/', userController.createUser);

// Supprimer un utilisateur
router.delete('/:id', userController.deleteUser);

module.exports = router;
