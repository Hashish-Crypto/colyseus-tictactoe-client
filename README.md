# Tic Tac Toe - Cocos Creator & Colyseus

Turn-based demonstration project using [Colyseus 0.14.0](https://www.colyseus.io/) and [Cocos Creator 3.4.2](https://www.cocos.com/en/creator).

## Running the server locally

From the root of the project:

```
git clone https://github.com/Hashish-Crypto/colyseus-tictactoe.git
cd colyseus-tictactoe
cd Server
npm install
npm start
```

Open Cocos Dashboard and add this project.

## Prerequisites for development

Install Cocos Creator [cocos.com/en/creator/download](https://www.cocos.com/en/creator/download)

Install Visual Studio Code: [code.visualstudio.com/download](https://code.visualstudio.com/download)

Install Git Bash: [git-scm.com/download/win](https://git-scm.com/download/win)

Install nvm-windows, choose nvm-setup.zip:
[github.com/coreybutler/nvm-windows/releases](https://github.com/coreybutler/nvm-windows/releases)

Open Git Bash as system administrator:

```bash
# Install Node and NPM
nvm install latest
nvm current
nvm use 17.6.0
node -v
npm -v

# Install Yarn
npm install -g yarn
yarn -v
```
