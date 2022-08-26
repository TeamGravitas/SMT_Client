var dbmgr = require("./dbmgr")
var db = dbmgr.db;
const {readFileSync, promises: fsPromises} = require('fs');

exports.createMaliciousSoftwareTable = () => {
    const query = "CREATE TABLE IF NOT EXISTS maliciousSoftwareList (sid INTEGER PRIMARY KEY AUTOINCREMENT, softwareName TEXT NOT NULL UNIQUE);";
    return new Promise((rs,rj) => {
        db.run(query, (err) => {
            if (err) {
                console.log('Some Error Occured');
                rj(err);
            } else {
                console.log('Table Created');
                rs(true);
            }
        });
    })
    
};

exports.insertMaliciousSoftware = (softwareList) => {
    let placeholders = softwareList.map((software) => '(?)').join(',');
    const query = "INSERT INTO maliciousSoftwareList(softwareName) values " + placeholders;
    return new Promise((rs,rj) => { 
        db.run(query, softwareList, function(err) {
            if (err) {
                rj(err);
            }
            // get the last insert id
            // console.log(`A row has been inserted with rowid ${this.lastID}`);
            rs(this.lastID);
        })
    });
}

exports.getMaliciousSoftwareList = () => {
    const query = "SELECT softwareName FROM maliciousSoftwareList ORDER BY softwareName ASC;";
    return new Promise((rs,rj) => {
        db.all(query, (err, rows) => {
        if (err) {
            rj(err);
        }
        let maliciousList = []
        rows.forEach((row) => {
            console.log(row);
            maliciousList.push(row.softwareName);
        });
        rs(maliciousList);   
    })});
}

exports.fillMaliciouTable=()=>{
    let filename = "maliciousList.txt";
    const contents = readFileSync(filename, 'utf-8');
    const arr = contents.split(/\r?\n/);
    console.log(arr);
    exports.insertMaliciousSoftware(arr).then(async () => {
        exports.getMaliciousSoftwareList();
    })
}

// exports.createMaliciousSoftwareTable().then(() => {
//     let filename = "../maliciousList.txt";
//     const contents = readFileSync(filename, 'utf-8');
//     const arr = contents.split(/\r?\n/);
//     console.log(arr);
//     exports.insertMaliciousSoftware(arr).then(async () => {
//         exports.getMaliciousSoftwareList();
//     })
// })

// exports.insertMaliciousSoftware(["Transmission 3.00 (bb6b5a062e) (x64)"]).then(async () => {
//         exports.getMaliciousSoftwareList();
// })