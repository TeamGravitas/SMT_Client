//function to insert ip in local storage
//add event listener to the button
document.getElementById("btnInsertIP").addEventListener("click", insertIP);

function insertIP() {
    let ip=document.getElementById("inputIP").value;
    if(ValidateIPaddress(ip)==false){
        // alert("Invalid IP Address");
        document.getElementById("inputIP").value="";
        document.getElementById("inputIP").placeholder="Invalid IP Address";
        return;
    }
    console.log("Frontend IP: " + ip);
    fetch("http://localhost:5000/insertIP", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "ip": ip
            })
        })
        .then(data => {
            console.log(data);
            document.getElementById("inputIP").value="";
            document.getElementById("inputIP").placeholder="Please Enter IP address again";
        })
        .catch(err => console.log(err));

}

function ValidateIPaddress(ipaddress) {  
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {  
      return (true)  
    }   
    return (false)  
  }

