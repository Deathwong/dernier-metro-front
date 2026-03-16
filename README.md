# Dernier Metro Front

Frontend React du projet Dernier Metro.

L'application consomme une API REST pour :

- lister les stations
- afficher le prochain metro
- indiquer si le service est ferme

## Stack

- React 18
- Vite
- Vitest
- Testing Library

## Prerequis

- Node.js 20+
- npm

## Installation

```bash
npm install
```

## Variables d'environnement

Le frontend utilise `VITE_API_BASE_URL` pour savoir quelle API appeler.

Exemple local dans `.env.local` :

```bash
VITE_API_BASE_URL=http://localhost:5001
```

Important :

- ne pas versionner de valeurs sensibles
- en CI/CD, definir `VITE_API_BASE_URL` dans Jenkins

## Lancer en local

```bash
npm run dev
```

Vite demarre en general sur :

```text
http://localhost:5173
```

## Tests

Lancer tous les tests frontend :

```bash
npm test
```

Mode watch :

```bash
npm run test:watch
```

## Build production

```bash
npm run build
```

Le build genere les fichiers statiques dans `dist/`.

## Structure utile

```text
src/
  App.jsx          interface principale
  App.test.jsx     tests frontend
  api.js           appels HTTP vers l'API
  main.jsx         point d'entree React
  styles.css       styles globaux
```

## Jenkins

Le projet contient un `Jenkinsfile` simple pour :

1. installer les dependances
2. lancer les tests
3. builder le frontend
4. construire une image Docker
5. deployer sur la VM Azure

La variable `VITE_API_BASE_URL` doit etre definie dans Jenkins.

Documentation associee :

- `JENKINS_AZURE_VM.md`

## Docker

Le `Dockerfile` est utile uniquement si tu veux deployer le frontend avec Docker.

Si tu choisis un deploiement sans Docker, il faudra simplifier la pipeline Jenkins et servir `dist/` directement avec Nginx ou Apache.
