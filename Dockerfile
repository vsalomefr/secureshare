# Utilise une image Node légère
FROM node:18-alpine

# Répertoire de travail dans le conteneur
WORKDIR /app

# Copie des fichiers permettant d'installer les dépendances
COPY package*.json ./

# Installation des dépendances en mode production
RUN npm install --production

# Copie du reste du projet dans l'image
COPY . .

# Le serveur Express écoute sur le port 3000
EXPOSE 3000

# Commande de lancement du serveur
CMD ["node", "server.js"]
