const express = require('express');
const crypto = require('crypto');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Stockage en mémoire des secrets (RAM seulement, pas de DB)
const secrets = new Map();

// Sécurité
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com", "https://cdn.tailwindcss.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "data:"],
        },
    },
}));

app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Trop de requêtes, veuillez réessayer plus tard.'
});

app.use('/api/', limiter);

// Nettoyage automatique des secrets expirés
setInterval(() => {
    const now = Date.now();
    for (const [id, secret] of secrets.entries()) {
        if (now > secret.expires) {
            secrets.delete(id);
            console.log(`🗑️  Secret ${id} supprimé (expiré)`);
        }
    }
}, 60000);

// API: Créer un secret
app.post('/api/secret', (req, res) => {
    try {
        const { password, expiration, oneTimeUse } = req.body;
        
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ error: 'Mot de passe invalide' });
        }
        
        if (!expiration || expiration < 0.5 || expiration > 72) {
            return res.status(400).json({ error: 'Durée d\'expiration invalide (0.5-72h)' });
        }
        
        const id = crypto.randomBytes(16).toString('hex');
        const key = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        
        let encrypted = cipher.update(password, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        
        const expirationTime = Date.now() + (expiration * 60 * 60 * 1000);
        secrets.set(id, {
            data: encrypted,
            key: key.toString('hex'),
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex'),
            expires: expirationTime,
            oneTimeUse: oneTimeUse !== false, // Par défaut true
            accessed: false
        });
        
        console.log(`✅ Secret ${id} créé, expire dans ${expiration}h, oneTimeUse: ${oneTimeUse !== false}`);
        
        res.json({ 
            id,
            expiresAt: new Date(expirationTime).toISOString()
        });
    } catch (error) {
        console.error('❌ Erreur création secret:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// API: Récupérer un secret (one-time use optionnel)
app.get('/api/secret/:id', (req, res) => {
    try {
        const { id } = req.params;
        const secret = secrets.get(id);
        
        if (!secret) {
            return res.status(404).json({ error: 'Secret introuvable ou expiré' });
        }
        
        if (Date.now() > secret.expires) {
            secrets.delete(id);
            return res.status(410).json({ error: 'Secret expiré' });
        }
        
        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            Buffer.from(secret.key, 'hex'),
            Buffer.from(secret.iv, 'hex')
        );
        decipher.setAuthTag(Buffer.from(secret.authTag, 'hex'));
        
        let decrypted = decipher.update(secret.data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        const wasOneTime = secret.oneTimeUse;
        
        // Suppression seulement si oneTimeUse est activé
        if (secret.oneTimeUse) {
            secrets.delete(id);
            console.log(`🔓 Secret ${id} récupéré et supprimé (one-time)`);
        } else {
            console.log(`🔓 Secret ${id} récupéré (réutilisable)`);
        }
        
        res.json({ 
            password: decrypted,
            oneTimeUse: wasOneTime
        });
    } catch (error) {
        console.error('❌ Erreur récupération secret:', error);
        res.status(500).json({ error: 'Erreur déchiffrement' });
    }
});

// API: Statistiques enrichies
app.get('/api/stats', (req, res) => {
    const now = Date.now();
    let expiredCount = 0;
    let oneTimeCount = 0;
    let multiUseCount = 0;
    
    // Compter les secrets expirés et par type
    for (const [id, secret] of secrets.entries()) {
        if (now > secret.expires) {
            expiredCount++;
        } else {
            if (secret.oneTimeUse) {
                oneTimeCount++;
            } else {
                multiUseCount++;
            }
        }
    }
    
    res.json({
        activeSecrets: secrets.size - expiredCount,
        totalSecrets: secrets.size,
        expiredSecrets: expiredCount,
        oneTimeSecrets: oneTimeCount,
        multiUseSecrets: multiUseCount,
        uptime: Math.floor(process.uptime()),
        memoryUsage: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid,
        cpuUsage: process.cpuUsage(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Route pour la page de stats
app.get('/stats', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'stats.html'));
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Route catch-all
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║         🔒 SecureShare Server - RUNNING              ║
╠═══════════════════════════════════════════════════════╣
║  URL Local:    http://localhost:${PORT}                ║
║  Stats:        http://localhost:${PORT}/stats         ║
╚═══════════════════════════════════════════════════════╝
    `);
});

process.on('SIGTERM', () => {
    console.log('⚠️  SIGTERM reçu, nettoyage...');
    secrets.clear();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n⚠️  Arrêt du serveur...');
    secrets.clear();
    process.exit(0);
});