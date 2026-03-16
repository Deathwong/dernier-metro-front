# Infrastructure README

## Contexte

Ce projet correspond au frontend de `Dernier Metro`.

Le frontend est :

- build avec Vite
- packagé dans une image Docker
- servi par Nginx dans un conteneur Docker
- deploie depuis Jenkins sur une VM Azure

L'API backend n'est pas hebergee sur cette meme VM. Elle est accessible sur :

```text
http://158.158.16.119:5001
```

La VM Azure qui heberge le frontend est accessible sur :

```text
http://68.221.175.78/
```

## Architecture actuelle

### Composants

- `VM Azure`
  - heberge Jenkins dans un conteneur Docker
  - heberge le conteneur frontend en production
- `Jenkins`
  - recupere le code source du frontend
  - execute la pipeline CI/CD
  - build l'image Docker du frontend
  - redeploie le conteneur frontend
- `Frontend container`
  - image basee sur `nginx:alpine`
  - expose le site sur le port `80`
- `API externe`
  - service HTTP separe
  - URL injectee au build via variable d'environnement Jenkins

### Vue simplifiee

```text
Git repository
    |
    v
Jenkins on Azure VM
    |
    +--> npm ci
    +--> npm test
    +--> npm run build
    +--> docker build
    +--> docker run -p 80:80
    |
    v
Frontend container on Azure VM
    |
    v
Users
    |
    v
API externe: http://158.158.16.119:5001
```

## Pipeline Jenkins

Le pipeline actuelle est definie dans [Jenkinsfile](/C:/Users/Jefrido/WebstormProjects/dernier-metro-front/Jenkinsfile).

### Etapes

1. `Checkout`
   Jenkins recupere le code depuis le SCM.

2. `Install`
   Execution de :

   ```bash
   npm ci
   ```

3. `Test`
   Execution de :

   ```bash
   npm test
   ```

4. `Build`
   Execution de :

   ```bash
   npm run build
   ```

5. `Build Docker Image`
   Construction de l'image frontend avec injection de `VITE_API_BASE_URL`.

6. `Deploy`
   Suppression de l'ancien conteneur puis lancement du nouveau conteneur sur le port `80`.

### Condition de deploiement

Le stage `Deploy` ne s'execute que si :

```text
env.GIT_BRANCH == 'origin/master'
```

Important :

- si la branche principale du projet devient `main`, il faudra ajuster cette condition
- aujourd'hui la pipeline est donc alignee sur `master`

## Secrets et variables Jenkins

La pipeline utilise :

```text
VITE_API_BASE_URL = credentials('VITE_API_BASE_URL')
```

### Recommandation

Dans Jenkins, creer une credential ou une variable securisee pour :

- `VITE_API_BASE_URL`

Exemple de valeur actuelle :

```text
http://158.158.16.119:5001
```

Cette valeur ne doit pas etre mise en dur dans le `Jenkinsfile`.

## Docker

### Image de build

Le build est defini dans [Dockerfile](/C:/Users/Jefrido/WebstormProjects/dernier-metro-front/Dockerfile).

Le Dockerfile utilise un build multi-stage :

1. image `node:20-alpine`
2. build Vite
3. image finale `nginx:1.27-alpine`

### Runtime

Le frontend est servi par Nginx avec la configuration :

- [default.conf](/C:/Users/Jefrido/WebstormProjects/dernier-metro-front/nginx/default.conf)

Le fallback SPA est gere avec :

```nginx
try_files $uri $uri/ /index.html;
```

## Ports et exposition

### VM Azure

- `80/tcp`
  - sert le frontend
- `8080/tcp`
  - acces Jenkins expose publiquement
- `50000/tcp`
  - port agent Jenkins si utilise

### Recommandation reseau

- n'exposer publiquement que le strict necessaire
- Jenkins est actuellement expose publiquement, ce qui augmente la surface d'attaque
- proteger Jenkins derriere une IP autorisee, un VPN ou un reverse proxy est fortement recommande
- verifier les NSG Azure et les regles firewall de la VM

## Prerequis machine

La VM Azure doit disposer de :

- Docker fonctionnel
- acces internet pour recuperer les images Docker et les dependances npm
- suffisamment d'espace disque pour les images et les workspaces Jenkins

Si la pipeline execute `npm ci` directement dans le conteneur Jenkins, ce conteneur doit aussi disposer de :

- Node.js
- npm

## Verification operationnelle

### Verifier le frontend

Depuis la VM :

```bash
curl -I http://localhost
```

### Verifier le conteneur frontend

```bash
docker ps --filter "name=dernier-metro-front"
docker logs --tail 100 dernier-metro-front
```

### Verifier Jenkins

```bash
docker ps --filter "name=jenkins"
docker logs --tail 100 jenkins
```

### Acces public

- Frontend : `http://68.221.175.78/`
- Jenkins : verifier le port `8080` sur cette meme VM si l'acces public est conserve

### Verifier l'API distante

```bash
curl http://158.158.16.119:5001/health
```

## Risques et points d'attention

- Le frontend depend d'une API hebergee sur une autre machine. Si cette API tombe, le site reste accessible mais les donnees ne remontent plus.
- La pipeline deploie localement sur la VM Azure. Il n'y a pas, a ce stade, de registry Docker intermediaire.
- Le deploiement remplace directement le conteneur en place. Il n'y a pas de strategie blue/green ou rollback automatise.
- Si Jenkins est expose sur Internet, il faut durcir sa securite.
- Jenkins est actuellement expose publiquement.
- La branche de deploiement est actuellement `master` dans la pipeline.

## Ameliorations recommandees

- ajouter un reverse proxy TLS devant le frontend et Jenkins
- ajouter un healthcheck Docker pour le conteneur frontend
- publier l'image dans une registry plutot que de deployer uniquement en local
- ajouter une strategie de rollback
- monitorer la VM, Jenkins et le conteneur frontend
- documenter le mode exact d'execution du conteneur Jenkins

## Etat documente

Ce document decrit l'etat d'infrastructure deduit du repository et des informations fournies :

- Jenkins tourne dans Docker sur la VM Azure
- Jenkins est lance via `docker run`
- Jenkins est expose publiquement
- le frontend est deploie via la pipeline Jenkins
- l'API est externe a la VM frontend

Si tu veux, je peux ensuite produire une version 2 plus precise avec :

- le nom ou l'IP publique de la VM Azure
- la commande exacte de lancement du conteneur Jenkins
- les ports effectivement ouverts
- le mode de persistance de `jenkins_home`
- les commandes de maintenance et rollback
