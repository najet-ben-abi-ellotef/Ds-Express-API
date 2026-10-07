const {
    estNonVide,
    estEmailValide
} = require('../utils/validators');

let users = [

    {
        id: 1,
        name: 'Admin',
        email: 'admin@gmail.com',
        role: 'admin'
    },
    {
        id: 2,
        name: 'Aya',
        email: 'aya@gmail.com',
        role: 'author'
    }
];
let prochainUserId = 3;

/// get user by id
const getUserById = (req, res) => {
    const id = Number(req.params.id);

    const user = users.find(user => user.id === id);

    if (!user) {
        return res.status(404).json({
            error: `Utilisateur ${id} introuvable`
        });
    }

    res.status(200).json(user);
};

const getAllUsers = (req, res) => {
    const { role } = req.query;

    let resultat = users;

    if (role) {
        resultat = users.filter(user => user.role === role);
    }

    res.status(200).json({
        total: resultat.length,
        users: resultat
    });
};
 
// créer un nouveau user
const createUser = (req, res) => {
    const { name, email, role } = req.body;
    
    // Vérifier que le nom n'est pas vide
    if (!estNonVide(name)) {
        return res.status(400).json({
            error: 'Le nom est obligatoire'
        });
    }
    // Vérifier que l'email est valide
    if (!estEmailValide(email)) {
        return res.status(400).json({
            error: 'L\'email est invalide'
        });
    }
    const nouvelUser = {
        id: prochainUserId++,
        name,
        email,
        role: role || 'user'
    };

    users.push(nouvelUser);

    res.status(201).json({
        message: 'Utilisateur créé',
        user: nouvelUser
    });
};

// delete user
const deleteUser = (req, res) => {
    const id = Number(req.params.id);

    const userExiste = users.some(user => user.id === id);

    if (!userExiste) {
        return res.status(404).json({
            error: `Impossible de supprimer : utilisateur ${id} introuvable`
        });
    }

    users = users.filter(user => user.id !== id);

    res.status(200).json({
        message: `Utilisateur ${id} supprimé avec succès`
    });
};
/// export 
module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    deleteUser
};