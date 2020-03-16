var emotionTooltipWidth = 100

var emotionTooltipDIV = null

function initEmotionTooltip() {
    emotionTooltipDIV = d3.select('#emotionTooltip').style('width', emotionTooltipWidth + 'px')
}

function onChangeEmotionTooltip() {
    var valence = 0, arousal = 0, dominance = 0
    var sum = arraySum(data[hoveredEmotionBubbleIndex]['category'])
    for(var i = 0; i < data[hoveredEmotionBubbleIndex]['category'].length; i++) {
        valence += data[hoveredEmotionBubbleIndex]['category'][i] / sum * data[hoveredEmotionBubbleIndex]['valence'][i]
        arousal += data[hoveredEmotionBubbleIndex]['category'][i] / sum * data[hoveredEmotionBubbleIndex]['arousal'][i]
        dominance += data[hoveredEmotionBubbleIndex]['category'][i] / sum * data[hoveredEmotionBubbleIndex]['dominance'][i]
    }
    var html = ""
    html += "<p><i>Overall<i><br/><b>Valence: </b>"+valence.toFixed(2) + "<br/><b>Arousal: </b>" + arousal.toFixed(2) + "<br/><b>Dominance: </b>" + dominance.toFixed(2) + "</p>"
    for(var i = 0; i < data[hoveredEmotionBubbleIndex]['category'].length; i++) {
        if(data[hoveredEmotionBubbleIndex]['category'][i] == 0) continue
        html += "<p><span style=\"color:"+ emotionColors[i] +"\">" + emotionCategories[i] + "</span><br/><b>Valence: </b>"+data[hoveredEmotionBubbleIndex]['valence'][i].toFixed(2) + "<br/><b>Arousal: </b>" + data[hoveredEmotionBubbleIndex]['arousal'][i].toFixed(2) + "<br/><b>Dominance: </b>" + data[hoveredEmotionBubbleIndex]['dominance'][i].toFixed(2) + "<br/><b>Strength: </b>" + (data[hoveredEmotionBubbleIndex]['category'][i] / sum).toFixed(2)  +"</p>"
    }
    emotionTooltipDIV.html(html)
}