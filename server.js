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

// Formulaire de réservation COMPLET
app.post('/envoyer-reservation', (req, res) => {
    const {
        destination,
        dateDepart,
        dateRetour,
        nom,
        prenom,
        email,
        telephone,
        voyageurs,
        chambres,
        typeChambre,
        options,
        message,
        rgpd
    } = req.body;

    // Formatage des options (si plusieurs cases cochées, elles arrivent sous forme de tableau)
    let optionsTexte = options;
    if (Array.isArray(options)) {
        optionsTexte = options.join(', ');
    } else if (!options) {
        optionsTexte = 'Aucune option';
    }

    const mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: `🏝️ NOUVELLE RÉSERVATION - ${destination} - ${nom} ${prenom}`,
        text: `
╔══════════════════════════════════════════════════════════╗
║                 NOUVELLE DEMANDE DE RÉSERVATION          ║
╚══════════════════════════════════════════════════════════╝

📍 DESTINATION
   └─ ${destination}

📅 DATES
   ├─ Départ : ${dateDepart}
   └─ Retour  : ${dateRetour}

════════════════════════════════════════════════════════════

👤 INFORMATIONS CLIENT
   ├─ Nom complet : ${nom} ${prenom}
   ├─ Email       : ${email}
   └─ Téléphone   : ${telephone}

════════════════════════════════════════════════════════════

👥 DÉTAILS DU VOYAGE
   ├─ Voyageurs      : ${voyageurs}
   ├─ Chambres       : ${chambres || 'Non spécifié'}
   └─ Type de chambre: ${typeChambre || 'Standard'}

════════════════════════════════════════════════════════════

🍽️ OPTIONS SUPPLÉMENTAIRES
   └─ ${optionsTexte}

════════════════════════════════════════════════════════════

💬 MESSAGE / DEMANDE SPÉCIALE
   └─ ${message || 'Aucune demande particulière'}

════════════════════════════════════════════════════════════
✅ RGPD accepté : ${rgpd ? 'OUI' : 'NON (⚠️ Attention)'}
📅 Demande reçue le : ${new Date().toLocaleString('fr-FR')}

---
🌐 Site : https://confort-plus.onrender.com
📧 Email client : ${email}
☎️ Téléphone client : ${telephone}
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('❌ Erreur envoi réservation:', error);
            console.error('Détails de l\'erreur:', error.message);
            res.redirect('/404');
        } else {
            console.log('✅ Réservation envoyée avec succès!');
            console.log(`📧 Destinataire: ${process.env.EMAIL}`);
            console.log(`🏝️ Destination: ${destination} - ${voyageurs} voyageur(s)`);
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
╔══════════════════════════════════════════════════════════╗
║         🚀 SERVEUR CONFORT PLUS DÉMARRÉ !                ║
╠══════════════════════════════════════════════════════════╣
║  🌐 http://localhost:${port}                              ║
║  📧 Les emails seront envoyés à : ${process.env.EMAIL}    ║
║  ✉️  Nodemailer : prêt                                    ║
╚══════════════════════════════════════════════════════════╝
    `);
});