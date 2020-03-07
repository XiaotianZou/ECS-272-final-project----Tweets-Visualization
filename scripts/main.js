var data = null

function getData() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            data = JSON.parse(this.responseText)
            console.log(data)
        }
    }
    xhttp.open('GET', 'http://127.0.0.1:8000/getinfo', true)
    // xhttp.setRequestHeader('Content-Type', 'application/json')
    xhttp.send()
}