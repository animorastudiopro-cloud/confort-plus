// ===== CONFIGURATION INITIALE =====
require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// ===== MIDDLEWARES =====
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ===== CONFIGURATION EMAIL (GMAIL) =====
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

// ===== ROUTES PAGES =====
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/destinations', (req, res) => {
    res.render('destinations');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/reservation', (req, res) => {
    res.render('reservation');
});

app.get('/merci', (req, res) => {
    res.render('merci');
});

// ===== ROUTES FORMULAIRES =====

// Formulaire de contact
app.post('/envoyer-contact', (req, res) => {
    const { nom, email, message } = req.body;

    const mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: `📬 Nouveau message de ${nom} - Confort Plus`,
        text: `
👤 NOM: ${nom}
📧 EMAIL: ${email}
💬 MESSAGE:
${message}
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('❌ Erreur envoi email:', error);
            res.redirect('/404');
        } else {
            console.log('✅ Email envoyé:', info.response);
            res.redirect('/merci');
        }
    });
});

// Formulaire de réservation
app.post('/envoyer-reservation', (req, res) => {
    const { destination, dateDepart, dateRetour, voyageurs } = req.body;

    const mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: '🏝️ Nouvelle demande de réservation',
        text: `
📍 DESTINATION: ${destination}
📅 DÉPART: ${dateDepart}
📅 RETOUR: ${dateRetour}
👥 VOYAGEURS: ${voyageurs}
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('❌ Erreur envoi réservation:', error);
            res.redirect('/404');
        } else {
            console.log('✅ Réservation envoyée:', info.response);
            res.redirect('/merci');
        }
    });
});

// ===== PAGE 404 =====
app.use((req, res) => {
    res.status(404).render('404');
});

// ===== DÉMARRAGE DU SERVEUR =====
app.listen(port, () => {
    console.log(`
🚀 Serveur Confort Plus démarré !
🌐 http://localhost:${port}
📧 Les emails seront envoyés à : ${process.env.EMAIL}
    `);
});