const { exec, execSync } = require('child_process');
var fs = require('fs');
path = require('path');

const MAX_BUFFER_SIZE = 1024 * 5000;

const getQueryStringArray = () => {
    switch (process.arch) {
        case 'x64': return [
            getWindowsCommandPath() + '\\REG QUERY HKLM\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ /s',
            getWindowsCommandPath() + '\\REG QUERY HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ /s',
            // getWindowsCommandPath() + '\\REG QUERY HKCU\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ /s',
            getWindowsCommandPath() + '\\REG QUERY HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ /s'
        ];
        default: return [
            getWindowsCommandPath() + '\\REG QUERY HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ /s'
        ];
    }
};

const getWindowsCommandPath = () => {
    if (process.arch === 'ia32' && process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) {
        return '%windir%\\sysnative\\cmd.exe /c %windir%\\System32'
    } else {
        return '%windir%\\System32';
    }
};

const getAllInstalledSoftwareHelper = () => {
    return new Promise((resolve, reject) => {
        const resolvers = [];
        const rejectors = [];
        const execPromises = [];

        getQueryStringArray().forEach((queryString, index) => {
            execPromises.push(new Promise((execRes, execRej) => {
                resolvers.push(execRes);
                rejectors.push(execRej);
            }));

            exec(queryString, { maxBuffer: MAX_BUFFER_SIZE }, (err, stdout, stderr) => {
                if (!err) {
                    resolvers[index](stdout.toString());
                } else {
                    rejectors[index](stderr.toString());
                }
            });
        });

        Promise.all(execPromises).then(resultsArray => {
            const fullList = resultsArray.slice(1).reduce((accumulatingList, queryResult) => {
                return accumulatingList + queryResult.trimRight();
            }, resultsArray[0].trim());
            resolve(processCmdOutput(fullList));
        }).catch(error => {
            reject(error);
        });
    })
};

const getAllInstalledSoftwareHelperSync = () => {
    const resultsArray = getQueryStringArray().map((queryString) => {
        return execSync(queryString).toString();
    });
    const fullList = resultsArray.slice(1).reduce((accumulatingList, queryResult) => {
        return accumulatingList + queryResult.trimRight();
    }, resultsArray[0].trim());
    return processCmdOutput(fullList);
};

const processCmdOutput = (fullList) => {
    const softwareList = [];
    fullList.split(/^HKEY_LOCAL_MACHINE/m).forEach((softwareBlock, index) => {
        if (index == 0) return;
        const softwareObject = {};
        let lastKey = '';
        let lastValue = '';

        const softwareLines = softwareBlock.split(/\r?\n/);
        softwareObject['RegistryDirName'] = softwareLines.shift().match(/^(\\[^\\]+)*?\\([^\\]+)\s*$/)[2];
        softwareLines.forEach(infoLine => {
            if (infoLine.trim()) {
                let infoTokens = infoLine.match(/^\s+(.+?)\s+REG_[^ ]+\s*(.*)/);
                if (infoTokens) {
                    infoTokens.shift();
                    lastKey = infoTokens[0];
                    lastValue = infoTokens[1];
                } else {
                    lastValue = lastValue + '\n' + infoLine;
                }
                softwareObject[lastKey] = lastValue;
            }
        });
        softwareList.push(softwareObject);
    });
    return softwareList;
};



const getAllInstalledSoftware = () => {
    return new Promise ((resolve, reject) => {
        getAllInstalledSoftwareHelper()
            .then((x) => {
                let y = [];
                // console.log(x);
                x.forEach(e => {
                    if (e.DisplayName && e.InstallDate && e.InstallDate.length > 0){
                        let obj={
                            softwareName:e.DisplayName ,
                            version:  e.DisplayVersion,
                            dateInstalled: e.InstallDate,
                            uninstallString: e.UninstallString,
                            systemComponent: e.SystemComponent
                        }
                        if(obj.systemComponent!=1){
                            // if()
                            // console.log(y);
                            y.push(obj);
                        }
                    }
                });
                // console.log(y);
                y={
                    "res": y,
                    "os": "win"
                };
                resolve(JSON.stringify(y));
        });
    });
};


// {
//     getAllInstalledSoftware();   
// }


// const getAllInstalledSoftware = () => {
//     return new Promise((resolve, reject) => {
//         //exec to run .cmd file
//         exec(".\\src\\" + 'getInstalledSoftware.cmd', (error, stdout, stderr) => {
//             {

//                 filePath = path.join(__dirname, '../software.txt');
//                 console.log(filePath);
//                 fs.readFile(filePath, { encoding: 'utf-8' }, function (err, stdout) {
//                     if (!err) {
//                         // console.log('received data: ' + data);
//                         str = stdout.toString().split('\n');
//                         console.log("Print Started");
//                         for (let i = 0; i < 100; i++)
//                             console.log(i, " ", str[i]);
//                         console.log("Print Ended");
//                         // console.log("Here",str);
//                         softwares = new Array()
//                         let count = 0;
//                         for (let i = 2; i < str.length; i += 8) {
//                             let valid = true;
//                             for (let j = 0; j < 7; j++) {
//                                 if (str[i + j] == undefined || (str[i + j].split(':')[1]) == undefined) {
//                                     valid = false;
//                                     break;
//                                 }
//                                 // if(++count<50)
//                                 //     console.log(str[i+j]);
//                             }
//                             if (!valid)
//                                 continue;
//                             let obj = {
//                                 softwareName: (str[i].split(':')[1]).trim(),
//                                 version: (str[i + 1].split(':')[1]).trim(),
//                                 // uninstallString:(str[i+2].split(':')[1]).trim(),
//                                 uninstallString: (str[i + 2].slice(17)).trim(),
//                                 dateInstalled: (str[i + 3].split(':')[1]).trim(),
//                                 estimatedSize: (str[i + 4].split(':')[1]).trim(),
//                                 systemComponent: (str[i + 5].split(':')[1]).trim()
//                             }
//                             // console.log(obj);
//                             // if(obj.systemComponent!='1'){
//                             if (obj.dateInstalled.length > 0) {
//                                 let temp = obj.dateInstalled;
//                                 //format date to dd-mm-yyyy
//                                 obj.dateInstalled = temp.slice(6, 8) + "-" + temp.slice(4, 6) + "-" + temp.slice(0, 4);
//                                 // obj.dateInstalled=temp.slice(0,temp.length-1);
//                                 // }
//                                 softwares.push(obj);
//                             }

//                         }
//                         // console.log(softwares);
//                         y = softwares;
//                         y = {
//                             "res": softwares,
//                             "os": "win"
//                         };
//                         // console.log(y);
//                         resolve(JSON.stringify(y));

//                     } else {
//                         console.log(err);
//                     }
//                 });
//             }

//             if (stderr) {
//                 reject(console.log(`stderr: ${stderr}`));
//                 // return;
//             }
//             // softwares = stdout;
//             // console.log(stdout);

//             // resolve(softwares);
//         });

//     })
// }


// // testSoftware();
// // exec('ls',{'shell'})
// getAllInstalledSoftware();


module.exports = exports = {
    getAllInstalledSoftware: getAllInstalledSoftware
};