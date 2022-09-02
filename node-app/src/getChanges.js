const sftop = require("./dbModel/softwarelistmgr");
const malop = require("./dbModel/maliciousSoftwareList");
const win = require('./windowsList.js');
const lnx = require('./linuxList.js');


exports.getChanges = async (selfIp, isAdmin=0)=>{
    return new Promise((resolve,reject)=>{
        let osType = process.platform;
        if (osType == "linux") {
            //Linux
            lnx.getAllInstalledSoftware()
            .then((x) => {
                // console.log(x);
                x=JSON.parse(x);
                getChangesHelper(x,selfIp,isAdmin)
                .then((y)=>{
                    resolve({"res":y});
                })
                .catch((err)=>{
                    reject(err);
                })
            })
            .catch((err) => reject(err));
            //     .then((x) => res.send(x)).catch((err) => res.send(err));
            // obj ={"res": []};
            // resolve(obj);
        }
        else if (osType == "win32") {
            //Windows
            win.getAllInstalledSoftware()
                .then((x) => {
                    // console.log(x);
                    x=JSON.parse(x);
                    getChangesHelper(x,selfIp,isAdmin)
                    .then((y)=>{
                        resolve({"res":y});
                    })
                    .catch((err)=>{
                        reject(err);
                    })
                }).catch((err) => reject(err));
            // console.log(softwareDetails)
        }
        else {
            reject("Unsupported OS");
        }
    })
    
};


getChangesHelper= (latestList, selfIp, isAdmin=0) =>{
    // console.log(latestList);
    latestList = latestList.res;
    // console.log(latestList);
    return new Promise((resolve,reject)=>{
        sftop.getSoftwareList(selfIp)
        .then((oldList)=>{
            // console.log("Latest:\n",latestList,"\nOLd\n",oldList);
            // oldList = JSON.parse(oldList);
            // oldList = oldList.res;
            console.log(oldList);
            let diffList=new Array();
            // console.log(typeof(oldList),typeof(latestList));
            //find inserted softwares
            for(let i=0;i<latestList.length;i++){
                let inserted = true;
                for(let j=0;j<oldList.length;j++){
                    if(latestList[i].softwareName==oldList[j].softwareName){
                        inserted = false;
                        break;
                    }
                }
                if(inserted){
                    let obj = latestList[i];
                    obj.op = "installed";
                    diffList.push(obj);
                }
            }
            //find inserted softwares
            for(let i=0;i<oldList.length;i++){
                let deleted = true;
                for(let j=0;j<latestList.length;j++){
                    if(latestList[j].softwareName==oldList[i].softwareName){
                        deleted = false;
                        break;
                    }
                }
                if(deleted){
                    let obj = oldList[i];
                    obj.op = "uninstalled";
                    diffList.push(obj);
                }
            }
            console.log(diffList);

            return (diffList);
        })
        .then(async(diffList)=>{
            //update db
            if(isAdmin){
                await sftop.deleteAllSoftwaresForIp(selfIp);
                for (let i = 0; i < latestList.length; i++) {
                    latestList[i].ip = selfIp;
                    if(latestList[i].softwareName)
                        sftop.insertSoftware(latestList[i]);
                }
            }
            // console.log(diffList);
            resolve(diffList);
        })
        .catch((err)=>{
            reject("Could not fetch Changes!");
        })
    })
}
