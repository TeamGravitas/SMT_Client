var schedule = require('node-schedule');
const nodemailer = require('nodemailer');
const win = require('./windowsList.js');
const lnx = require('./linuxList.js');

const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.in',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'kingtemp204000@zohomail.in',
        pass: 'a21nUfe8ryLX',
    },
});

// const {getDiffSoftware} = require('./ROUTE_FOR_DIFF_SOFTWARE');
const fs = require('fs');
// //************************************Scheduler /************************************/

// //Scheduler to schedule the task to run every day every hour
// var j = schedule.scheduleJob('1 * * * * *', schedulerForMail);
let maliciousSoftwares = [];
let mailedSoftware = [];
//Scheduler helper function
function schedulerForMail() {
    console.log("Scheduler");
    //Call the function to call all the ip's and get the latest software installed
    maliciousSoftwareToSend = "";
    toInsertToMailSoftware = [];
    toDeleteFromMailSoftware = [];
    let osType = process.platform;
    if (osType == "linux") {
        lnx.getAllInstalledSoftware().then((x) => {

            x = JSON.parse(x).res;
            x.forEach((el) => {
                // console.log(el.softwareName);
                if (isMalicious(el.softwareName)) {
                    if (!mailedSoftware.includes(el.softwareName)) {
                        toInsertToMailSoftware.push(el.softwareName);
                    }
                }
            })
            mailedSoftware.forEach((el) => {
                let flag = true;
                x.forEach((xel) => {
                    if (el == xel.softwareName) {
                        flag = false;
                    }
                })
                if (flag) toDeleteFromMailSoftware.push(el);
            })
            maliciousSoftwareToSend = toInsertToMailSoftware.join("\n");
            toDeleteFromMailSoftware.forEach((el) => {
                mailedSoftware.splice(mailedSoftware.indexOf(el), 1);
            })
            toInsertToMailSoftware.forEach((el) => {
                mailedSoftware.push(el);
            })
            // console.log(maliciousSoftwareToSend);
            if (maliciousSoftwareToSend.length > 0) {
                sendMail(maliciousSoftwareToSend);
            }
        });
    }
    else if (osType == "win32") {
        win.getAllInstalledSoftware().then((x) => {

            x = JSON.parse(x).res;
            x.forEach((el) => {
                // console.log(el.softwareName);
                if (isMalicious(el.softwareName)) {
                    if (!mailedSoftware.includes(el.softwareName)) {
                        toInsertToMailSoftware.push(el.softwareName);
                    }
                }
            })
            mailedSoftware.forEach((el) => {
                let flag = true;
                x.forEach((xel) => {
                    if (el == xel.softwareName) {
                        flag = false;
                    }
                })
                if (flag) toDeleteFromMailSoftware.push(el);
            })
            maliciousSoftwareToSend = toInsertToMailSoftware.join("\n");
            toDeleteFromMailSoftware.forEach((el) => {
                mailedSoftware.splice(mailedSoftware.indexOf(el), 1);
            })
            toInsertToMailSoftware.forEach((el) => {
                mailedSoftware.push(el);
            })
            // console.log(maliciousSoftwareToSend);
            if (maliciousSoftwareToSend.length > 0) {
                sendMail(maliciousSoftwareToSend);
            }
        });
    }

    // getDiffSoftware().then((x) => {
    //     el.forEach((element) => {
    //         if (maliciousSoftwares.contains()) {
    //             maliciousSoftwaresToSend = maliciousSoftwareToSend.concat("Name: " + x.softwareName + " Version" + x.version + "\n");
    //         }
    //     });
    //Send the mail to the user
    // sendMail(maliciousSoftwareToSend);

    // }).catch((err) => {
    //     console.log(err);
    // });
}
//Function for malicious software
function isMalicious(software) {
    return maliciousSoftwares.includes(software);
}
function sendMail(maliciousSoftwareToSend) {
    let ip = getMyIP();
    // console.log(maliciousSoftwareToSend.length);
    let mailOptions = {
        from: 'kingtemp204000@zohomail.in',
        to: 'abdurrahman@iitbhilai.ac.in',
        subject: `Malicious Software Detected in IP: ${ip}`,
        text: `Malicious Softwares are installed on the system:\n ${maliciousSoftwareToSend}`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    })
}
//get localhost ip
function getMyIP() {
    var ip = require("ip");
    // console.dir ( ip.address() );
    // console.log("IP",ip.address());
    return ip.address();
    // var os = require('os');
    // var interfaces = os.networkInterfaces();
    // for (var k in interfaces) {
    //     for (var k2 in interfaces[k]) {
    //         var address = interfaces[k][k2];
    //         if (address.family === 'IPv4' && !address.internal) {
    //             return address.address;
    //         }
    //     }
    // }
    // //Just in case it reaches here
    // console.log("Failed to fetch my ip via system call");
    // return '192.168.0.0';
}

//Run at startup
(() => {
    //read file 
    fs.readFile('./src/maliciousSoftware.txt', 'utf8', function (err, data) {
        if (err) throw err;
        data = data.split('\n')
        data.forEach(el => {
            if (el[el.length - 1] == '\r')
                maliciousSoftwares.push(el.slice(0, el.length - 1));
            else
                maliciousSoftwares.push(el);
        });
        // console.log(maliciousSoftwares);
        // schedulerForMail();
    });
})();

//Just calling function one time, when the app is started
// schedulerForMail();

// getMaliciousSoftware();
// console.log(getMyIP());
var j;
exports.schedulerHelper=()=>{
    schedulerForMail();
    j = schedule.scheduleJob('1 * * * * *', schedulerForMail);
    return "Scheduler started";
};