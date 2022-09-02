const electron = require('electron')
const express = require('express');
const win = require('./windowsList.js');
const lnx = require('./linuxList.js');
const { exec } = require("child_process");
const os = require("os");
const e = require('express');
const sftop = require("./dbModel/softwarelistmgr");
const malop = require("./dbModel/maliciousSoftwareList");
const chg = require("./getChanges");
const { schedulerHelper } = require("./scheduler.js");
//Setting local storage for node, so that can store authorized IP address
var LocalStorage = require('node-localstorage').LocalStorage;
let localStorage
if (typeof localStorage === "undefined" || localStorage === null) {
    localStorage = new LocalStorage('./scratch');
}

let windowApp = electron.app;
let BrowserWindow = electron.BrowserWindow;

const app = express();
app.use(express.json());

app.get('/installedSoftware', async (req, res) => {
    //check is request is from authorized IP address
    let ip =  req.ip;
    let ip4 = ip.split(":");
    ip4=ip4[ip4.length - 1];
    console.log("Request from IP : " + ip4);
    console.log("Auth IP from local storage : " + localStorage.getItem("ip"));
    let unauthorizedFlag = (ip4 != localStorage.getItem("ip"));
    // unauthorizedFlag=false //Remove this true to enable authorization
 
    if (unauthorizedFlag) {
        console.log("Unauthorized request from " + req.ip);
        res.json({ "err": "unauthorized" })
        return;
    }
    else {
        console.log("Authorized Request for getting installed software from " + req.ip);
        let osType = process.platform;
        // let osType=os.platform();
        console.log(osType);
        if (osType == "linux") {
            //Linux
            lnx.getAllInstalledSoftware()
                .then((x) => res.send(x)).catch((err) => res.send(err));
        }
        else if (osType == "win32") {
            //Windows
            win.getAllInstalledSoftware()
                .then((x) => {
                    // console.log(x);

                    res.send(x)
                }).catch((err) => res.send(err));
            // console.log(softwareDetails)
        }
        else {
            res.send("Unsupported OS");
        }
    }

    // res.send("OK");
});

app.post('/getChanges', async (req, res) => {
    //check is request is from authorized IP address
    let ip =  req.ip;
    let ip4 = ip.split(":");
    ip4=ip4[ip4.length - 1];
    let selfIp = req.body.ip;
    console.log("This is my ip: ",selfIp);
    console.log("Changes Requested from IP : " + ip4);
    console.log("Auth IP from local storage : " + localStorage.getItem("ip"));
    let unauthorizedFlag = (ip4 != localStorage.getItem("ip"));
    // unauthorizedFlag=false //Remove this true to enable authorization
 
    if (unauthorizedFlag) {
        console.log("Unauthorized request from " + req.ip);
        res.json({ "err": "unauthorized" })
        return;
    }
    else {
        console.log("Authorized Request for getting installed software from " + req.ip);
        let osType = process.platform;
        // let osType=os.platform();
        console.log(osType);
        chg.getChanges(selfIp,1)
        .then((y)=>{
            res.send(y);
        })
        .catch((err)=>{
            res.send(err);
        });
    }

    // res.send("OK");
});

app.post('/uninstallSoftware', async (req, res) => {
    //check is request is from authorized IP address
    let ip =  req.ip;
    let ip4 = ip.split(":");
    ip4=ip4[ip4.length - 1];
    console.log("Request from IP : " + ip4);
    console.log("Auth IP from local storage : " + localStorage.getItem("ip"));
    let unauthorizedFlag = (ip4 != localStorage.getItem("ip"));
    // unauthorizedFlag=false //Remove this true to enable authorization
    console.log(req.body.uninstallString);
    if (unauthorizedFlag) {
        console.log("Unauthorized request from " + req.ip);
        res.json({ "err": "unauthorized" })
        return;
    }
    else {
        console.log("Authorized Request for uninstalling software from " + req.ip);
        let osType = process.platform;
        // let osType=os.platform();
        console.log(osType);
        if (osType == "linux") {
            //Linux
            lnx.uninstallSoftware(req.body.uninstallString)
                .then((x) => res.send(x)).catch((err) => res.send(err));
        }
        else if (osType == "win32") {
            //Windows
            win.uninstallSoftware(req.body.uninstallString)
                .then((x) => {
                    res.send(x)
                })
                .catch((err) => {
                    // console.log(err);
                    res.send(err);
                });
            // console.log(softwareDetails)
        }
        else {
            res.send("Unsupported OS");
        }
    }  
})

app.get('/home', (req, res) => {
    res.send("HomePage")
});
app.get('/', (req, res) => {
    res.redirect('/home');
});



app.post('/insertIP', (req, res) => {
    //insert ip from json req to local storage
    // console.log(req.body.ip);
    if (localStorage.getItem("ip") != null) {
        res.sendStatus(401).json({ "err": "Already Configured!" })
        return;
    }
    localStorage.setItem("ip", req.body.ip);
    res.send("OK Inserted ip");
    //close electron window but open process
    let win = BrowserWindow.getFocusedWindow();
    // win.close();
    //close electron window and process
    win.destroy();
    // process.exit();

});

async function createTables() {
    await sftop.createSoftwareTable();
    await malop.createMaliciousSoftwareTable();
    await malop.fillMaliciouTable();
    // .catch(()=>{
    //     console.log("Entries already filled in malicious dataset!");
    // });
}

app.listen(5000,async (e) => {
    await createTables();
    console.log(`listening on port 5000`);
    schedulerHelper();
});







/************************Electron ******************/
{
    //delete ip from local storage to check
    // function deleteIP() {
    //     localStorage.removeItem("ip");
    // }
    // {
    //     deleteIP();
    // }
    //if ip is present in local storage
    if (localStorage.getItem("ip") == null) {
        const createWindow = () => {
            const winElectron = new BrowserWindow({
                parent: null,
                // full screen default
                frame: false,
                alwaysOnTop: true,
                height: 400,
                width: 600
            })

            winElectron.loadFile('./src/frontend/login.html')
        }

        windowApp.whenReady().then(() => {
            createWindow()

        });
        windowApp.on("will-quit", (e) => {
            // winElectron.close();
            e.preventDefault();
        });
    }
}



