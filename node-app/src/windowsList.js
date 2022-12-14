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
                
                // let obj={
                //     softwareName:"VLC media player" ,
                //     version: "3.0.16",
                //     dateInstalled: 20220204,
                //     uninstallString: '"C:\\Program Files\\VideoLAN\\VLC\\uninstall.exe"',
                //     systemComponent: 0
                // }
                // y.push(obj);
                // console.log(x);
                x.forEach(e => {
                    if (e.DisplayName && e.InstallDate && e.InstallDate.length > 0){
                        let obj={
                            softwareName:e.DisplayName ,
                            version:  e.DisplayVersion,
                            dateInstalled: e.InstallDate,
                            uninstallString: e.UninstallString,
                            systemComponent: e.SystemComponent,
                            size: e.EstimatedSize
                        }
                        if(obj.systemComponent!=1){
                            // if()
                            // console.log(y);
                            // console.log(Number(obj.size));
                            obj.size=Number(obj.size);
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
//     // getAllInstalledSoftware();   
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

// if (`${uninstallString}` -like "msiexec*") {$ARGS=(`${uninstallString}` -split ' ')[1] -replace '/I','/X ') + ' /q' Start-Process msiexec.exe -ArgumentList $ARGS -Wait} else { $UNINSTALL_COMMAND=(`${uninstallString}` -split '\"')[1])$UNINSTALL_ARGS=(`${uninstallString}` -split '\"')[2]) + ' /S'Start-Process $UNINSTALL_COMMAND -ArgumentList $UNINSTALL_ARGS -Wait}

// `if (${uninstallString} -like 'msiexec*') {   $ARGS=((${uninstallString} -split ' ')[1] -replace '/I','/X ') + ' /q' Start-Process msiexec.exe -ArgumentList $ARGS -Wait } else { $UNINSTALL_COMMAND=((${uninstallString} -split '\"')[1]) $UNINSTALL_ARGS=((${uninstallString} -split '\"')[2]) + ' /S' Start-Process $UNINSTALL_COMMAND -ArgumentList $UNINSTALL_ARGS -Wait}`


const uninstallSoftware = (uninstallString) => {
    //uninstall windows program with uninstallString
    uninstallCommand=getUninstallCommand(uninstallString);
    console.log(uninstallCommand);
    return new Promise((resolve, reject) => {
        //exec to run .cmd file
        exec(uninstallCommand, (error, stdout, stderr) => {
            if (error) {
                console.log("error", error);
                reject({"err":  "Failed to uninstall"});
                return;
            }
            if (stderr) {
                console.log("stderr",stderr);
                reject({"err: " : stderr});
                return;
            }
            console.log("Uninstalled Successfully");
            resolve({"res": "sucess"});
        })
    });
    // uninstallCommand=`if (${uninstallString} -like 'msiexec*') {   $ARGS=((${uninstallString} -split ' ')[1] -replace '/I','/X ') + ' /q' Start-Process msiexec.exe -ArgumentList $ARGS -Wait } else { $UNINSTALL_COMMAND=((${uninstallString} -split '\"')[1]) $UNINSTALL_ARGS=((${uninstallString} -split '\"')[2]) + ' /S' Start-Process $UNINSTALL_COMMAND -ArgumentList $UNINSTALL_ARGS -Wait}`;
   
};

// uninstallSoftware('\"C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\104.1.42.97\\Installer\\setup.exe\" --uninstall --system-level');

// uninstallSoftware('\"C:\\Program Files\\VideoLAN\\VLC\\uninstall.exe\" --uninstall --system-level');
// uninstallSoftware(`MsiExec.exe /I{B206C51C-27D2-4251-95E2-B4B28DE80633}`)

// .catch(x=>console.log(x));
// MsiExec.exe /I{E98621B6-AA42-4390-93AF-4C3D2C557258}
function getUninstallCommand(uninstallString){
    // let uninstallString=uninstallObject.unistallString;
    // let uninstallName=uninstallObject.uninstallName;

    let command='';
    if(uninstallString.search("MsiExec")!=-1){
        uninstallString = uninstallString.split(' ')[1];
        let id=uninstallString.split('{')[1].split('}')[0];

        command= `winget uninstall --id "{${id}}" -h --accept-source-agreements`;
        // console.log(command);
    }
    else
        command = uninstallString+' /S';
    return command;
}
module.exports = exports = {
    getAllInstalledSoftware: getAllInstalledSoftware,
    uninstallSoftware: uninstallSoftware
};