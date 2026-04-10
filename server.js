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

// ===== ROUTES PAGES PRINCIPALES =====
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

// ===== NOUVELLES ROUTES SERVICES =====
// Page Tourisme
app.get('/tourisme', (req, res) => {
    res.render('tourisme', {
        title: 'Tourisme - Confort Plus',
        description: 'Découvrez nos circuits touristiques et visites guidées'
    });
});

// Page Événementiel
app.get('/evenementiel', (req, res) => {
    res.render('evenementiel', {
        title: 'Événementiel - Confort Plus',
        description: 'Organisation de mariages, anniversaires et séminaires'
    });
});

// Page Premium
app.get('/premium', (req, res) => {
    res.render('premium', {
        title: 'Premium - Confort Plus',
        description: 'Services VIP et expériences exclusives'
    });
});

// Page Mentions légales (RGPD)
app.get('/mentions-legales', (req, res) => {
    res.render('mentions-legales', {
        title: 'Mentions légales - Confort Plus',
        description: 'Informations légales et politique de confidentialité'
    });
});

// Page À propos
app.get('/apropos', (req, res) => {
    res.render('apropos');
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

// Nouvelles pages
app.get('/voyages', (req, res) => {
    res.render('voyages');
});

app.get('/international', (req, res) => {
    res.render('international');
});

app.get('/devis', (req, res) => {
    res.render('devis');
});

app.get('/assistance', (req, res) => {
    res.render('assistance');
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

// Formulaire pour les demandes de devis (tourisme, événementiel, premium)
app.post('/envoyer-devis', (req, res) => {
    const {
        service,
        nom,
        prenom,
        email,
        telephone,
        date,
        participants,
        budget,
        message
    } = req.body;

    const mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: `📋 DEMANDE DE DEVIS - ${service} - ${nom} ${prenom}`,
        text: `
╔══════════════════════════════════════════════════════════╗
║                 DEMANDE DE DEVIS                         ║
╚══════════════════════════════════════════════════════════╝

🎯 SERVICE DEMANDÉ
   └─ ${service}

════════════════════════════════════════════════════════════

👤 INFORMATIONS CLIENT
   ├─ Nom complet : ${nom} ${prenom}
   ├─ Email       : ${email}
   └─ Téléphone   : ${telephone}

════════════════════════════════════════════════════════════

📋 DÉTAILS DE LA DEMANDE
   ├─ Date souhaitée   : ${date || 'Non spécifiée'}
   ├─ Participants     : ${participants || 'Non spécifié'}
   ├─ Budget estimé    : ${budget || 'Non spécifié'}
   └─ Message          : ${message || 'Aucun message'}

════════════════════════════════════════════════════════════

📅 Demande reçue le : ${new Date().toLocaleString('fr-FR')}

---
🌐 Site : https://confort-plus.onrender.com
📧 Email client : ${email}
☎️ Téléphone client : ${telephone}
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('❌ Erreur envoi devis:', error);
            res.redirect('/404');
        } else {
            console.log('✅ Demande de devis envoyée avec succès!');
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
╠══════════════════════════════════════════════════════════╣
║  📄 Pages disponibles :                                  ║
║     - /               (Accueil)                          ║
║     - /destinations   (Destinations)                     ║
║     - /reservation    (Réservation)                      ║
║     - /contact        (Contact)                          ║
║     - /tourisme       (Tourisme)                         ║
║     - /evenementiel   (Événementiel)                     ║
║     - /premium        (Premium)                          ║
║     - /mentions-legales (Mentions légales)               ║
╚══════════════════════════════════════════════════════════╝
    `);
});