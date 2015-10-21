var root = d3.selectAll('svg')

function stopScrolling(touchEvent) {touchEvent.preventDefault();}
document.addEventListener( 'touchstart' , stopScrolling , false )
document.addEventListener( 'touchmove' , stopScrolling , false )

window.setTimeout(render, 0)
