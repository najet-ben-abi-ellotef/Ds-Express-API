const express = require ('express') ; 
const app = express ();
const PORT = 3001;
app.use(express.json());
let prochainId=4;

app . get('/', (req , res) => {
res . json ({ message : " Bonjour , je suis l’API du blog " }) ;
}) ;


const articles = [
{ id: 1 , title : 'Bienvenue sur le blog ', author : 'Admin' } ,
{ id: 2 , title : 'Mon premier serveur Express ', author : 'Aya' } ,
{ id: 3 , title : 'Tester une API avec Postman ', author : 'Aya' }
];

app . get('/api/articles', (req , res) => {
const { author } = req. query ; // = const author = req. query . author ;
let resultat = articles ;
if ( author ) { // si le client a précisé ? author =...
resultat = articles.filter (a => a. author === author ) ;
}
res . json ({ total : resultat.length , articles:resultat }) ;
}) ;

// GET / api/ articles -> tous les articles
app.get('/api/articles' , (req , res) => {
res.json ({ total : articles.length , articles:articles }) ;
}) ;



app . get('/api/articles/:id', (req , res) => {
const id = Number ( req. params .id) ; // "2" -> 2
const article = articles.find (a => a.id === id) ;
if (! article ) {
return res. status (404).json ({ error : `Article ${id} introuvable` }) ;
}
res . json ( article ) ;
}) ;


app.post ('/api/articles', (req , res) => {
const {title,author} = req.body; // déstructuration (é tape 5)

if (!title || !author) { // validation : les deux champs sont obligatoires
return res.status(400).json({ error: "Le titre et l’auteur sont obligatoires" }) ;
}

const nouvelArticle = {id: prochainId,title : title,author : author };
prochainId = prochainId + 1;
articles.push(nouvelArticle ) ;
res.status(201).json({message :'Article créé',article:nouvelArticle}) ;
}) ;
////Exercice 1///
app.get('/about', (req, res) => {
    res.json({
        application: "APP S1",
        author: "Najet",
        version: "1"
    });
});

const users = [
    {
        id: 1,
        name: "Aya",
        email: "Aya@gmail.com"
    },
    {
        id: 2,
        name: "Youssef",
        email: "Youssef@gmail.com"
    },
    {
        id: 3,
        name: "Nour",
        email: "Nour@gmail.com"
    }
];
////
app.get('/api/users', (req, res) => {

    const { name } = req.query;

    let resultat = users;

    if (name) {
        resultat = users.filter(
            u => u.name === name
        );
    }

    res.json(resultat);
});

/////
app.get('/api/users', (req, res) => {
    res.json(users);
});
////
app.get('/api/users/:id', (req, res) => {

    const id = Number(req.params.id);

    const user = users.find(
        u => u.id === id
    );

    if (!user) {
        return res.status(404).json({
            error: `Utilisateur ${id} introuvable`
        });
    }

    res.json(user);
});

//REQ POST 
app.post('/contact', (req, res) => {

    const { email, message } = req.body;

    if (!email || !message) {
        return res.status(400).json({
            error: "L'email et le message sont obligatoires"
        });
    }

    res.status(200).json({
        message: "Merci, votre message a bien été reçu"
    });
});

// 4. dé marrer le serveur : il attend les requêtes sur le port 3000
app.listen (PORT , () => {
console . log(`Serveur disponible sur http :// localhost :${ PORT }`) ;
}) ;
