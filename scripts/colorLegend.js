$('#angerCheckBox').change(function() {
    if($(this).prop('checked')) {
        d3.select('#angerSubBand')
            .transition(150)
            .style('opacity', 0.8)
    } else {
        d3.select('#angerSubBand')
            .transition(150)
            .style('opacity', 0.4)
    }
})

$('#anticipationCheckBox').change(function() {
    if($(this).prop('checked')) {
        d3.select('#anticipationSubBand')
            .transition(150)
            .style('opacity', 0.8)
    } else {
        d3.select('#anticipationSubBand')
            .transition(150)
            .style('opacity', 0.4)
    }
})

$('#disgustCheckBox').change(function() {
    if($(this).prop('checked')) {
        d3.select('#disgustSubBand')
            .transition(150)
            .style('opacity', 0.8)
    } else {
        d3.select('#disgustSubBand')
            .transition(150)
            .style('opacity', 0.4)
    }
})

$('#fearCheckBox').change(function() {
    if($(this).prop('checked')) {
        d3.select('#fearSubBand')
            .transition(150)
            .style('opacity', 0.8)
    } else {
        d3.select('#fearSubBand')
            .transition(150)
            .style('opacity', 0.4)
    }
})

$('#joyCheckBox').change(function() {
    if($(this).prop('checked')) {
        d3.select('#joySubBand')
            .transition(150)
            .style('opacity', 0.8)
    } else {
        d3.select('#joySubBand')
            .transition(150)
            .style('opacity', 0.4)
    }
})

$('#sadnessCheckBox').change(function() {
    if($(this).prop('checked')) {
        d3.select('#sadnessSubBand')
            .transition(150)
            .style('opacity', 0.8)
    } else {
        d3.select('#sadnessSubBand')
            .transition(150)
            .style('opacity', 0.4)
    }
})

$('#surpriseCheckBox').change(function() {
    if($(this).prop('checked')) {
        d3.select('#surpriseSubBand')
            .transition(150)
            .style('opacity', 0.8)
    } else {
        d3.select('#surpriseSubBand')
            .transition(150)
            .style('opacity', 0.4)
    }
})

$('#trustCheckBox').change(function() {
    if($(this).prop('checked')) {
        d3.select('#trustSubBand')
            .transition(150)
            .style('opacity', 0.8)
    } else {
        d3.select('#trustSubBand')
            .transition(150)
            .style('opacity', 0.4)
    }
})