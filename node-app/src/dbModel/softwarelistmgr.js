var dbmgr = require("./dbmgr")
var db = dbmgr.db;

exports.createSoftwareTable = () => {
    const query = "CREATE TABLE IF NOT EXISTS softwarelist (sid INTEGER PRIMARY KEY AUTOINCREMENT, softwareName TEXT NOT NULL UNIQUE,  uninstallString TEXT, isMalicious INTEGER NOT NULL, isMailed INTEGER DEFAULT 0, size INTEGER,version TEXT,dateInstalled TEXT NOT NULL, ip TEXT NOT NULL, CONSTRAINT fk_iplist FOREIGN KEY (ip)REFERENCES departments(ip));";
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

exports.getSoftwareList = (ip) => {
    console.log(ip);
    const query = "SELECT * FROM softwarelist WHERE ip=? ORDER BY softwareName ASC;";
    return new Promise((rs,rj) => {
        db.all(query, [ip], (err, rows) => {
        if (err) {
            rj(err);
        }
        rows.forEach((row) => {
            console.log(row);
        });
        rs(rows);   
    })});
}

exports.getIpWithSoftwareList = (softwareName) => {
    const query = "SELECT iplist.ip,os,dateAdded FROM softwarelist LEFT JOIN iplist on softwarelist.ip = iplist.ip WHERE softwareName LIKE ?;";
    softwareName = "%"+softwareName+"%";
    return new Promise((rs,rj) => {
        db.all(query, softwareName, (err, rows) => {
        if (err) {
            rj(err);
        }
        rows.forEach((row) => {
            console.log(row);
        });
        rs(rows);   
    })});
}

exports.insertSoftware = (softwareObj) => {
    const query = "INSERT INTO softwarelist(softwareName, uninstallString, isMalicious, size, version, dateInstalled, ip) VALUES(?, ?, ?, ?, ?, ?, ?);";
    return new Promise((rs,rj) => { 
        db.run(query, [softwareObj.softwareName, softwareObj.uninstallString,0, softwareObj.size,softwareObj.version, softwareObj.dateInstalled, softwareObj.ip], function(err) {
            if (err) {
                rj(err);
            }
            // get the last insert id
            // console.log(`A row has been inserted with rowid ${this.lastID}`);
            rs(this.lastID);
        })
    });
}

exports.deleteSoftware = (sid) => {
    const query = "DELETE FROM softwarelist WHERE sid = ?";
    return new Promise((rs,rj) => { 
        db.run(query, sid, function(err) {
            if (err) {
                rj(err);
            }
            // get the last insert id
            // console.log(`A row has been deleted with rowid ${this.changes}`);
            rs(this.changes);
        })
    });
}

exports.deleteAllSoftwaresForIp = (ip) => {
    const query = "DELETE FROM softwarelist WHERE ip = ?";
    return new Promise((rs,rj) => { 
        db.run(query, ip, function(err) {
            if (err) {
                rj(err);
            }
            // get the last insert id
            // console.log(`A row has been deleted with rowid ${this.changes}`);
            rs(this.changes);
        })
    });
}


exports.updateMalciousStatus = (maliciousSoftwareList, val) => {
    const query = `UPDATE softwarelist SET isMalicious = ? WHERE softwareName in (${ maliciousSoftwareList.map(() => "?").join(",") })`;
    // console.log(ipList, val);
    maliciousSoftwareList.unshift(val);
    // console.log(maliciousSoftwareList);
    return new Promise((rs,rj) => { 
        db.run(query, maliciousSoftwareList, function(err) {
            if (err) {
                rj(err);
            }
            // get the last insert id
            // console.log(`Number of rows updated ${this.changes}`);
            rs("Success");
        })
    });
}

exports.setMailStatus = (maliciousSoftwareList) => {
    const query = `UPDATE softwarelist SET isMailed = 1 WHERE softwareName in (${ maliciousSoftwareList.map(() => "?").join(",") })`;
    // console.log(ipList, val);
    // maliciousSoftwareList.unshift(val);
    // console.log(maliciousSoftwareList);
    return new Promise((rs,rj) => { 
        db.run(query, maliciousSoftwareList, function(err) {
            if (err) {
                rj(err);
            }
            // get the last insert id
            // console.log(`Number of rows updated ${this.changes}`);
            rs("Success");
        })
    });
}


// exports.createSoftwareTable();

// exports.insertSoftware({softwareName: "Python", isMalicious: 0, size: 20000, version: "3.8.1", dateInstalled: new Date().toDateString(), ip: "1.1.1.1"});
// exports.insertSoftware({softwareName: "VScode", isMalicious: 1, size: 200000, version: "20.8.1", dateInstalled: new Date().toDateString(), ip: "1.1.1.1"});
// exports.insertSoftware({softwareName: "ROS Melodic", isMalicious: 0, size: 2000000, version: "4.0.1", dateInstalled: new Date().toDateString(), ip: "2.2.2.2"});
// exports.insertSoftware({softwareName: "VLC media player", isMalicious: 0, size: 2000000, version: "4.0.1", dateInstalled: new Date().toDateString(), ip: "3.3.3.3"});
// exports.insertSoftware({softwareName: "UC browser", isMalicious: 0, size: 2000000, version: "4.0.1", dateInstalled: new Date().toDateString(), ip: "2.2.2.2"});
// exports.insertSoftware({softwareName: "TIk Tok", isMalicious: 0, size: 2000000, version: "4.0.1", dateInstalled: new Date().toDateString(), ip: "1.1.1.1"});
// exports.insertSoftware({softwareName: "CM Browers", isMalicious: 0, size: 2000000, version: "4.0.1", dateInstalled: new Date().toDateString(), ip: "1.1.1.1"});
// exports.getSoftwareList("192.168.198.120");
// exports.deleteSoftware(1);

// exports.markMalciousStatus();
// exports.getIpWithSoftwareList("VScode");