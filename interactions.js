/**
 * Dashboard interactions
 *
 * Copyright Robert Monfera
 */

function setTableSortOrder(sortVariable) {
    var sortSettings = dashboardSettings.table.sort
    if(sortSettings.lastTimedSort) {
        window.clearTimeout(sortSettings.lastTimedSort)
        sortSettings.lastTimedSort = null
    }
    if(sortVariable && sortVariable !== sortSettings.sortVariable) {
        sortSettings.sortVariable = sortVariable
        render()
        sortSettings.lastSortTime = new Date()
    }
}

function setDelayedTableSortOrder(variable, d) {
    d.delayed = window.setTimeout(function() {
        setTableSortOrder(variable)
    }, 300)
}

function setGroupHeaderTableSortOrder(className, d) {
    var variable = findWhere('groupAlias', className)(dashboardSettings.variables)
    setDelayedTableSortOrder(variable, d)
}

function setPetiteHeaderTableSortOrder(headerName, d) {
    var variable = findWhere('petiteHeaderAlias', headerName)(dashboardSettings.variables)
    setDelayedTableSortOrder(variable, d)
}

function resetTableSortOrder(d) {
    setTableSortOrder(defaultSortVariable)
    if(d.delayed) {
        window.clearTimeout(d.delayed)
        delete d.delayed
    }
}

function rowMouseDown(d) {
    var e = d3.event
    var studentSelection = dashboardSettings.table.studentSelection
    if(!studentSelection.brushable) {
        studentSelection.brushable = true
    }
    var cond = studentSelection.selectedStudents[d.key]
    studentSelection.currentSelectedStudents = {}
    if(cond) {
        studentSelection.selectedStudents = {}
        cancelSelection()
    } else {
        studentSelection.currentSelectedStudents.from = d.key
        studentSelection.currentSelectedStudents.to = d.key
        studentSelection.brushInProgress = true
        if(!(e.metaKey || e.ctrlKey) ) {
            studentSelection.selectedStudents = {}
        }
        studentSelection.selectedStudents[d.key] = true

        render()
    }
}

function rowMouseOver(d) {
    var studentSelection = dashboardSettings.table.studentSelection
    var selectedStudents = studentSelection.selectedStudents
    var currentSelectedStudents = studentSelection.currentSelectedStudents
    if(!studentSelection.brushable) {
        return
    }

    if(!studentSelection.brushInProgress) {
        if(Object.keys(selectedStudents).length > 0) {
            return;
        }
        currentSelectedStudents.from = d.key
        currentSelectedStudents.to = d.key
    }
    currentSelectedStudents.to = d.key
    var names = dashboardData['Student Data'].map(key)
    var indices = [studentSelection.currentSelectedStudents.from, studentSelection.currentSelectedStudents.to].map(function(name) {return names.indexOf(name)})
    var extent = d3.extent(indices)
    Object.keys(selectedStudents).forEach(function(key) {if(selectedStudents[key] === 'maybe') delete selectedStudents[key]})
    for(var i = extent[0]; i <= extent[1]; i++) {studentSelection.selectedStudents[names[i]] = 'maybe'}
    render()
}

function rowMouseUp() {
    var studentSelection = dashboardSettings.table.studentSelection
    var selectedStudents = studentSelection.selectedStudents
    Object.keys(selectedStudents).forEach(function(key) {selectedStudents[key] = true})
    if(!studentSelection.brushable) {
        return
    }
    if(studentSelection.brushInProgress) {
        studentSelection.brushInProgress = false
    }
}

function cancelSelection() {
    var studentSelection = dashboardSettings.table.studentSelection

    d3.event.preventDefault(); d3.event.stopPropagation();
    studentSelection.selectedStudents = {}
    studentSelection.brushInProgress = false
    studentSelection.brushable = false
    render()
}

var rowInteractions = {
    mousedown: rowMouseDown,
    mouseover: rowMouseOver,
    mouseup: rowMouseUp
}