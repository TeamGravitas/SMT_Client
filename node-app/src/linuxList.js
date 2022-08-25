const { exec } = require("child_process");

const getAllInstalledSoftware = async () => {
    return new Promise ((resolve, reject) => {
        resolve(
            getDesktopSoftwares()
        
            .then(async (desktopSoftwares)=>{
                
                let software_version_date=await getVersionDate(desktopSoftwares);
                let response=new Array();
                for(let i=0;i<software_version_date.length;i++){
                    let obj = {
                        softwareName: software_version_date[i][0],
                        version: software_version_date[i][1],
                        dateInstalled: software_version_date[i][2]
                    }
                    response.push(obj);
                }
                obj ={
                    "res": obj
                };
                return JSON.stringify(response);
            }
        ));
    })
};


async function getDesktopSoftwares(){
    let softwares;
    return new Promise((resolve,reject)=>{
        exec('ls /usr/share/applications | awk -F \'.desktop\' \' { print $1}\' -', (error, stdout, stderr) => {
            if (error) {
                reject(console.log(`error: ${error.message}`));
            }
            if (stderr) {
                reject(console.log(`stderr: ${stderr}`));
            }
            softwares = stdout.split('\n');
            resolve(softwares);
        });
    })
};

function getVersionDate(desktopSoftwares){
    let software_version_date=new Array();
    return new Promise((resolve,reject)=>{
        exec('grep " installed" /var/log/dpkg.log*', (error, stdout, stderr) => {
            if (error) {
                resolve(date_softwares);
            }
            if (stderr) {
                reject(console.log(`stderr: ${stderr}`));
            }
            let stringArray = stdout.split('\n');
            for(let i=0;i<stringArray.length;i++){
                let temp = stringArray[i].split(' ');
                let dateinstalled = temp[0];
                let version = temp[5];
                let softwarename = temp[4];
                temp = [softwarename,version,dateinstalled];
                software_version_date.push(temp);
            }
            let newSoftwareList = new Array();
            for(let i=0;i<desktopSoftwares.length;i++){
                let j=0;
                while(j<software_version_date.length && desktopSoftwares[i]){
                    if(software_version_date[j][0]&&software_version_date[j][0].indexOf(desktopSoftwares[i])!=-1){
                        let temp = [desktopSoftwares[i],software_version_date[j][1],software_version_date[j][2]];
                        newSoftwareList.push(temp);
                        break;
                    }
                    j++;
                }
            }
            resolve(newSoftwareList);
        });
    })
};

module.exports = exports = {
    getAllInstalledSoftware: getAllInstalledSoftware
};