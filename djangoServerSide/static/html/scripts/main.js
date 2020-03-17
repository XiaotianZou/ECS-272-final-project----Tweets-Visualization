var data = null
var allTweets = null

function getData() {
    var username = document.getElementById('twitterUserName').value
    if (username.length < 1) {
        alert('The username cannot be empty!')
    } else {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                data = JSON.parse(this.responseText).data

                data.forEach(function (d) {
                    for (var j = 0; j < d['time'].length; j++) {
                        d['time'][j] = new Date(d['time'][j])
                    }
                    d['earlyTime'] = d3.min(d['time'])
                })
                // console.log(data)
                data.sort(function (a, b) {
                    return (a['earlyTime'] > b['earlyTime']) ? 1 : -1
                })
                allTweets = []
                data.forEach(function (d) {
                    for (var j = 0; j < d['time'].length; j++) {
                        var o = {}
                        o['text'] = d['words'][j]
                        // var time = new Date(d['time'][j])
                        o['time'] = d['time'][j]
                        allTweets.push(o)
                    }
                })
                if(data.length < 2) {
                    alert('Sorry, we cannot visualize the emotion for you. Please write more tweets!')
                } else {
                    init()
                    onChangeBandGraph()
                    onChangeOverview()
                }
            } 
            if (this.readyState == 4 && this.status == 500) {
                alert('Sorry, we cannot visualize the emotion for you. Please check the correctness of username!')
            }
        }
        xhttp.open('GET', '../../getinfo/?id=' + username, true)
        // xhttp.setRequestHeader('Content-Type', 'application/json')
        xhttp.send()
    }
}

function init() {
    var input = document.getElementById('twitterUserName')
    input.addEventListener('keyup', function (event) {
        if (event.keyCode == 13) {
            event.preventDefault()
            document.getElementById('searchButton').click()
        }
    })

    initBandGraph()
    initTagCloud()
    initRawTweets()
    initScatterPlot()
    initOverview()
    initEmotionTooltip()
}

init()
