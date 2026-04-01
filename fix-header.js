const fs = require('fs');
const path = require('path');

const headerPath = path.join(__dirname, 'views', 'partials', 'header.ejs');

fs.readFile(headerPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Erreur:', err);
        return;
    }

    const newMetaLine = '    <meta name="description"\n        content="<%= typeof description !== \'undefined\' ? description : \'Confort Plus vous propose des voyages et hébergements de qualité à petits prix.\' %>">';
    
    const updated = data.replace(
        /<meta name="description".*?>/s,
        newMetaLine
    );
    
    fs.writeFile(headerPath, updated, 'utf8', (err) => {
        if (err) {
            console.error('Erreur écriture:', err);
        } else {
            console.log('✅ Header.ejs corrigé avec succès !');
            console.log('🔄 Redémarrez le serveur');
        }
    });
});