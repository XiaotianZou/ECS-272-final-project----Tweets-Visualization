var data = null
var allTweets = null

function getData() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(this.responseText).data
            // console.log(data)

            allTweets = []
            data.forEach(function (d) {
                for (var j = 0; j < d['time'].length; j++) {
                    var o = {}
                    o['text'] = d['words'][j]
                    var time = new Date(d['time'][j])
                    // o['time'] = time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate()
                    o['time'] = time
                    allTweets.push(o)
                }
            })

            onChangeBandGraph()
        }
    }
    xhttp.open('GET', 'http://127.0.0.1:8000/getinfo', true)
    // xhttp.setRequestHeader('Content-Type', 'application/json')
    xhttp.send()
}