# Software-Monitoring-Tool---Node
Software Monitoring Tool app for Node side

Install NodeJs and npm:-

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
nvm ls-remote
nvm install v16.13.1
nvm use v16.13.1
nvm alias default 16.13.1
nvm use default
```


Now git clone the repo and go to folder having package.json

Now Install dependancies:-
```
cd node-app
npm i
```

To run while development:
```
npm run start
```

Package the app:
```
//linux: Run the following on a linux system
npm run package-linux

//windows: Run the following on a linux system
npm run package-win
```

To run a packaged app:
```
//linux: Download the release folder and inside the folder run-
sudo chown root:root chrome-sandbox
sudo chmod 4755 chrome-sandbox
./node-app

// windows: Download the release folder and insider the folder run the- 
// node-app.exe file (ignore the warnings)
```
