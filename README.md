# SecureShare - Partage Sécurisé de Mots de Passe

Solution professionnelle de partage temporaire et sécurisé de mots de passe pour votre entreprise de cybersécurité.

## 🔐 Fonctionnalités

- Génération de mots de passe personnalisables (longueur, types de caractères)
- Partage via liens temporaires avec expiration configurable (1-168h)
- Chiffrement AES-256-GCM côté serveur
- One-time use : le secret est supprimé après consultation
- Aucune base de données : stockage en mémoire RAM uniquement
- Rate limiting et protection contre les abus
- Interface moderne et professionnelle

## 🚀 Installation
```bash
# Cloner ou créer le projet
mkdir secure-password-share && cd secure-password-share

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env

# Lancer le serveur
npm start
```

## 📦 Déploiement

### Option 1 : Serveur Linux (Ubuntu/Debian)
```bash
# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cloner le projet
git clone <votre-repo>
cd secure-password-share
npm install

# Utiliser PM2 pour la production
sudo npm install -g pm2
pm2 start server.js --name secure-share
pm2 startup
pm2 save
```

### Option 2 : Docker
```dockerfile
# Créer un Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```
```bash
# Build et run
docker build -t secure-share .
docker run -d -p 3000:3000 --name secure-share secure-share
```

### Option 3 : Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name votredomaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Sécurité

- Chiffrement AES-256-GCM avec clés aléatoires
- Secrets en mémoire uniquement (pas de persistence)
- Rate limiting (100 req/15min par IP)
- Headers de sécurité (Helmet.js)
- One-time use automatique
- Expiration configurable

## 📊 API Endpoints

- `POST /api/secret` - Créer un secret
- `GET /api/secret/:id` - Récupérer un secret (one-time)
- `GET /api/stats` - Statistiques serveur

## ⚠️ Important

- Les secrets sont stockés en RAM et seront perdus au redémarrage du serveur
- Pour une haute disponibilité, utilisez Redis pour le stockage distribué
- Configurez HTTPS en production (Let's Encrypt)

## 🆘 Support

Pour toute question : contact@vsalome.fr# secureshare
