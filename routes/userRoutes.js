const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

// Récupérer tous les utilisateurs
router.get('/', userController.getAllUsers);

// Récupérer un utilisateur par son ID
router.get('/:id', userController.getUserById);

// Créer un utilisateur
router.post('/', userController.createUser);

// Supprimer un utilisateur
router.delete('/:id', userController.deleteUser);

module.exports = router;