var schedule = require('node-schedule');
const nodemailer = require('nodemailer');
// const {getDiffSoftware} = require('./ROUTE_FOR_DIFF_SOFTWARE');
const fs = require('fs');
// //************************************Scheduler /************************************/

// //Scheduler to schedule the task to run every day every hour
// var j = schedule.scheduleJob('1 * * * *', schedulerForMail);
let maliciousSoftwares = [];
//Scheduler helper function
function schedulerForMail() {
    //Call the function to call all the ip's and get the latest software installed
    maliciousSoftwareToSend = "";
    getDiffSoftware().then((x) => {
        el.forEach((element) => {
            if (isMalicious(x)) {
                maliciousSoftwaresToSend = maliciousSoftwareToSend.concat("Name: " + x.softwareName + " Version" + x.version + "\n");
            }
        });
        //Send the mail to the user
        sendMail(maliciousSoftwareToSend);

    }).catch((err) => {
        console.log(err);
    });
}

function sendMail(maliciousSoftwareToSend) {
    let ip = getMyIP();
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
    }).catch((err) => {
        console.log(err);
    });
}
//get localhost ip
function getMyIP() {
    var ip = require("ip");
    // console.dir ( ip.address() );
    console.log("IP",ip.address());
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
        console.log(maliciousSoftwares);
        // schedulerForMail();
    });
})();

//Just calling function one time, when the app is started
// schedulerForMail();
// getMaliciousSoftware();
// console.log(getMyIP());