/**
 * Dashboard model - data reshaping, variables, scales and configuration
 *
 * Copyright Robert Monfera
 */

dashboardData['Student Data'] = dashboardData['Student Data']['Student Name'].map(function(name, i) {
    var d = dashboardData['Student Data']
    var studentModel = {
        key: name,
        absentCount: d["Days Absent This Term Count"][i],
        tardyCount:  d["Days Tardy This Term Count"][i],
        absences: dashboardData['Absences'].filter(function(event) {return event[0] === name}).map(function(event) {return new Date(event[1])}),
        tardies: dashboardData['Tardies'].filter(function(event) {return event[0] === name}).map(function(event) {return new Date(event[1])}),
        currentReferralCount: d["Disciplinary Referrals This Term Count"][i],
        pastReferralCount: d["Disciplinary Referrals Last Term Count"][i],
        currentDetentionCount: d["Detentions This Term Count"][i],
        pastDetentionCount: d["Detentions Last Term Count"][i],
        assignmentsLateCount: d["Assignments Completed Late Count"][i],
        english: d["English Language Proficiency"][i] === 'Y',
        special: d["Special Ed Status"][i] === 'Y',
        problematic: d["Problematic"][i] === 'Y',
        assignmentScores: d["scores"][i].slice(5),
        meanAssignmentScore: d3.mean(d["scores"][i].slice(5).filter(identity)),
        standardScores: d["scores"][i].slice(0, 5).reverse(),
        grades: object(d["grades"][i].map(function(g, j) {
            function indexToKey(index) {
                switch(index) {
                    case 0: return 'current'
                    case 1: return 'goal'
                    case 2: return 'previous'
                }
            }
            return [indexToKey(j), g]
        }))
    }
    studentModel.allScores = studentModel.standardScores.concat(studentModel.assignmentScores)
    return studentModel
})

var dashboardVariables = {
    name: {
        key: 'name',
        groupAlias: 'namesGroup',
        headerAlias: 'Student',
        helpText: 'Student name\n[Click and hold for sorting]',
        smallHeaderAlias: 'Student name',
        dataType: 'string',
        variableType: 'nominal',
        defaultOrder: 'ascending',
        plucker: key
    },
    currentGrade: {
        key: 'currentGrade',
        groupAlias: 'courseGradesGroup',
        petiteHeaderAlias: 'YTD',
        headerAlias: 'Overall Course Grade',
        helpText: 'Current course grade and score\n[Default sorting is by score]',
        legendAlias: 'Current',
        smallHeaderAlias: 'Current grade',
        dataType: 'string',
        variableType: 'ordinal',
        defaultOrder: 'descending',
        plucker: function(student) {return student.grades.current},
        sorter: function(student) {return -d3.mean(student.assignmentScores.filter(identity))}
    },
    negligence: {
        key: 'negligence',
        headerAlias: 'Behavior',
        groupAlias: 'classDisciplineGroup',
        helpText: 'Behavioral problem counts\n[Click and hold for sorting based on detention (with double weight) plus referral]',
        dataType: 'numeric',
        variableType: 'cardinal',
        defaultOrder: 'descending',
        plucker: function(student) {return student.currentReferralCount + 2 * student.currentDetentionCount}
    },
    punishment: {
        key: 'punishment',
        groupAlias: 'behaviorGroup',
        dataType: 'numeric',
        variableType: 'cardinal',
        defaultOrder: 'descending',
        plucker: function(student) {return 5 * student.currentReferralCount + 15 * student.currentDetentionCount}
    },
    attendance: {
        key: 'negligence',
        groupAlias: 'classAttendanceGroup',
        headerAlias: 'Attendance',
        helpText: 'Attendance problem counts\n[Click and hold for sorting based on absent (with double weight) plus tardy]',
        dataType: 'numeric',
        variableType: 'cardinal',
        defaultOrder: 'descending',
        plucker: function(student) {return student.tardyCount + 2 * student.absentCount}
    },
    lastAssignmentScore: {
        key: 'lastAssignmentScore',
        groupAlias: 'assignmentScoresGroup',
        smallHeaderAlias: 'Last assign.',
        petiteHeaderAlias: 'Last',
        helpText: 'Last grade score (circle) and average (bar)\n[Click and hold for sorting based on last grade]',
        dataType: 'numeric',
        variableType: 'cardinal',
        defaultOrder: 'ascending',
        plucker: function(student) {return last(student.assignmentScores)}
    },
    lastAssessmentScore: {
        key: 'lastAssessmentScore',
        groupAlias: 'assessmentScoresGroup',
        headerAlias: 'Assessments',
        petiteHeaderAlias: 'Last ',
        helpText: 'Last assessment scores\n[Click and hold for sorting]',
        dataType: 'numeric',
        variableType: 'cardinal',
        defaultOrder: 'ascending',
        plucker: function(student) {return last(student.standardScores)}
    },
    meanAssignmentScore: {
        key: 'meanAssignmentScore',
        headerAlias: 'Assignments',
        helpText: 'Year to date assignment scores\n[Click and hold for sorting based on the average score]',
        dataType: 'numeric',
        variableType: 'cardinal',
        defaultOrder: 'ascending',
        plucker: function(student) {return d3.mean(student.assignmentScores.filter(identity))}
    },
    assignmentSpread: {
        key: 'assignmentSpread',
        petiteHeaderAlias: 'Spread',
        helpText: 'Spread of assignment scores\n[Click and hold for sorting based on the standard deviation]',
        dataType: 'numeric',
        variableType: 'cardinal',
        defaultOrder: 'descending',
        plucker: function(student) {return d3.deviation(student.assignmentScores.filter(identity))}
    },
    targetGrade: {
        key: 'targetGrade',
        legendAlias: 'Target',
        dataType: 'string',
        variableType: 'ordinal',
        defaultOrder: 'descending',
        plucker: function(student) {return student.grades.goal}
    },
    previousGrade: {
        key: 'previousGrade',
        legendAlias: 'Previous course',
        dataType: 'string',
        variableType: 'ordinal',
        defaultOrder: 'descending',
        plucker: function(student) {return student.grades.previous}
    },
    tardy: {
        key: 'tardy',
        legendAlias: 'Tardy',
        dataType: 'numeric',
        variableType: 'cardinal',
        defaultOrder: 'descending',
        plucker: function(student) {return student.tardyCount}
    },
    absent: {
        key: 'absent',
        legendAlias: 'Absent',
        dataType: 'numeric',
        variableType: 'cardinal',
        defaultOrder: 'descending',
        plucker: function(student) {return student.absentCount}
    },
    referrals: {
        key: 'referrals',
        legendAlias: 'Referrals',
        petiteHeaderAlias: 'Ref',
        helpText: 'Referrals count\n[Click and hold for sorting]',
        dataType: 'numeric',
        variableType: 'cardinal',
        defaultOrder: 'descending',
        plucker: function(student) {return student.currentReferralCount}
    },
    detentions: {
        key: 'detentions',
        legendAlias: 'Detentions',
        petiteHeaderAlias: 'Det',
        helpText: 'Detentions count\n[Click and hold for sorting]',
        dataType: 'numeric',
        variableType: 'cardinal',
        defaultOrder: 'descending',
        plucker: function(student) {return student.currentDetentionCount}
    },
    lateAssignment: {
        key: 'lateAssignment',
        smallHeaderAlias: 'Late assign.',
        petiteHeaderAlias: 'Late',
        helpText: 'Late assignment count\n[Click and hold for sorting]',
        dataType: 'numeric',
        variableType: 'cardinal',
        defaultOrder: 'descending',
        plucker: function(student) {return student.assignmentsLateCount}
    },
    aboveHighThreshold: {
        key: 'aboveHighThreshold',
        legendAlias: 'Above 85%',
        dataType: 'numeric',
        variableType: 'cardinal',
        defaultOrder: 'ascending',
        plucker: function(student) {return countBy(student.assignmentScores, function(x) {return x > 0.85})['true'] || 0}
    },
    belowLowThreshold: {
        key: 'belowLowThreshold',
        legendAlias: 'Below 67%',
        dataType: 'numeric',
        variableType: 'cardinal',
        defaultOrder: 'descending',
        plucker: function(student) {return countBy(student.assignmentScores, function(x) {return x !== 0 && x < 0.67})['true'] || 0}
    },
    currentYearMeanAssignmentScore: {
        key: 'currentYearMeanAssignmentScore',
        legendAlias: 'Assignments',
        dataType: 'numeric',
        variableType: 'cardinal',
        defaultOrder: 'ascending',
        plucker: function(student) {return d3.mean(student.assignmentScores)}
    },
    pastYearsMeanAssignmentScore: {
        key: 'pastYearsMeanAssignmentScore',
        legendAlias: 'Past assessmts',
        petiteHeaderAlias: 'Last 5',
        helpText: "Past 5 years' assignment scores\n[Click and hold for sorting based on the average]",
        dataType: 'numeric',
        variableType: 'cardinal',
        defaultOrder: 'ascending',
        plucker: function(student) {return d3.mean(student.standardScores)}
    },
    specialEducation: {
        key: 'specialEducation',
        legendAlias: 'Special education',
        dataType: 'boolean',
        variableType: 'cardinal',
        defaultOrder: 'descending',
        plucker: function(student) {return student.special}
    },
    languageDifficulties: {
        key: 'languageDifficulties',
        legendAlias: 'Language difficulties',
        dataType: 'boolean',
        variableType: 'cardinal',
        defaultOrder: 'descending',
        plucker: function(student) {return !student.english}
    },
    assignmentScoreTemplate: {
        key: 'assignmentScoreTemplate',
        axisAlias: 'assignmentScoresGroup',
        dataType: 'numeric',
        variableType: 'cardinal',
        defaultOrder: 'ascending',
        pluckerMaker: function(i) {return function(student) {return student.allScores[i]}}
    }
}

var defaultSortVariable = dashboardVariables['currentGrade']

var dashboardSettings = {
    variables: dashboardVariables,
    table: {
        sort: {
            sortVariable: defaultSortVariable
        },
        studentSelection: {
            selectedStudents: {},
            brushable: false,
            brushInProgress: false
        }
    }

}

function sortedByThis(identifierType, identifier) {
    var sortSettings = dashboardSettings.table.sort
    var sortVariable = sortSettings.sortVariable
    return sortVariable && sortVariable[identifierType] === identifier
}

function rowSorter(sortSettings) {
    var v = sortSettings.sortVariable
    var order = v.defaultOrder
    var plucker = v.sorter || v.plucker
    return {
        sorter: function rowSorterClosure(d) {return plucker(d)},
        variable: v,
        order: order
    }
}

function keptStudentFilterFunction(d) {
    var selectedStudents = dashboardSettings.table.studentSelection.selectedStudents
    return selectedStudents[d] || !Object.keys(selectedStudents).length
}

function keptStudentData(d) {
    return d['Student Data'].filter(function(student) {return keptStudentFilterFunction(student.key)})
}

function makeRowData(d) {
    var rowData = d["Student Data"]
    var sorter = rowSorter(dashboardSettings.table.sort)
    var needsToReverse = sorter.order === 'descending'
    var ascendingRowData = sortBy(needsToReverse ? rowData.reverse() : rowData, sorter.sorter)
    var sortedRowData = needsToReverse ? ascendingRowData.reverse() : ascendingRowData
    d["Student Data"] = sortedRowData // this retains the stable sorting (sortBy is stable, but if we don't persist it, then it's just stable sorting relative to the original order, rather than the previous order

    ;(function formBlocks() {
        // fixme extract, break up, refactor etc. this monstrous block
        var k, currentStudent, valueMaker, currentValue, prevValue = NaN, rowGroupOffsetCount = -1, groupable;
        var quantiles = [0.2, 0.4, 0.6, 0.8];
        if (sorter.variable.variableType === 'ordinal' || sorter.variable.dataType === 'boolean') {
            groupable = true
            valueMaker = sorter.variable.plucker
        } else if (sorter.variable.variableType === 'cardinal') {
            groupable = true
            var rawValues = sortedRowData.map(sorter.variable.plucker)
            if (Object.keys(countBy(rawValues, identity)).length <= 5) {
                valueMaker = sorter.variable.plucker
            } else {
                var quantileValues = quantiles.map(function (p) {
                    return d3.quantile(rawValues, p)
                })
                valueMaker = function (d) {
                    var result = 0;
                    for (var n = 0; n < quantileValues.length; n++) {
                        if (sorter.variable.plucker(d) >= quantileValues[n]) {
                            result = n + 1
                        } else {
                            break
                        }
                    }
                    return result
                }
            }
        }

        for (k = 0; k < d["Student Data"].length; k++) {
            currentStudent = d["Student Data"][k]
            if (!groupable) {
                currentStudent.rowGroupOffsetCount = 0
                continue
            }
            currentValue = valueMaker(currentStudent)
            if (currentValue !== prevValue) {
                rowGroupOffsetCount++
                prevValue = currentValue
            }
            currentStudent.rowGroupOffsetCount = rowGroupOffsetCount
        }
    })()

    return sortedRowData
}

/**
 * Scales: bridging the view / viewModel boundary
 */

function calculateScales() {

    var s = {}

    s.rowPitch = 28
    s.rowBandRange = s.rowPitch / 1.3

    s.gradesDomain = ['F', 'D', 'C', 'B', 'A']

    var shamiksCellWidthRange = [0, 104]

    var gradesRange = [0, 80]
    var gradesRangeExtent = gradesRange[1] - gradesRange[0]

    s.gradeScale = d3.scale.ordinal()
        .domain(s.gradesDomain)
        .rangePoints(gradesRange)

    s.scoreToGrade = function(d) {
        return s.gradesDomain[Math.floor((d - 0.50001) / 0.1)]
    }

    s.gradeOverlayScale = d3.scale.linear()
        .domain([0.5, 1])
        .range([gradesRange[0] - gradesRangeExtent / 10, gradesRange[1] + gradesRangeExtent / 10])

    s.violationDayScale = d3.scale.linear()
        .domain([0, 20])
        .range(shamiksCellWidthRange)

    s.violationSeverityOpacityScale = d3.scale.linear()
        .domain([0, 3])
        .range([1, 0.1])

    s.scoreTemporalScale = d3.scale.linear()
        .domain([0, 9]) // fixme adapt the scale for the actual number of scores
        .range(shamiksCellWidthRange)

    var bandThresholds = [0.4, 0.6, 0.7, 0.8, 0.9, 1]

    function sortedNumbers(population) {
        return population.filter(defined).sort(d3.ascending)
    }

    var outlierClassifications = ['lowOutlier', 'normal', 'highOutlier']
    var outlierClassificationIndex = function(classification) {
        return outlierClassifications.indexOf(classification)
    }

    function makeOutlierScale(population) {
        var iqrDistanceMultiplier = 1 // Stephen Few's Introduction of Bandlines requires a multiplier of 1.5; we deviate here to show outliers on the dashboard
        var values = sortedNumbers(population)
        var iqr = [d3.quantile(values, 0.25), d3.quantile(values, 0.75)]
        var midspread = iqr[1] - iqr[0]
        return d3.scale.threshold()
            .domain([
                iqr[0] - iqrDistanceMultiplier * midspread,
                iqr[1] + iqrDistanceMultiplier * midspread ])
            .range(outlierClassifications)
    }

    function medianLineBand(population) {
        var median = d3.median(population)
        return [median, median]
    }

    var assignmentScores = [].concat.apply([], dashboardData['Student Data'].map(property('assignmentScores')))
    var assessmentScores = [].concat.apply([], dashboardData['Student Data'].map(property('standardScores')))

    s.assignmentOutlierScale = makeOutlierScale(assignmentScores)
    s.assessmentOutlierScale = makeOutlierScale(assessmentScores)

    s.assignmentBands = window2(bandThresholds).concat([medianLineBand(assignmentScores)])
    s.assessmentBands = window2(bandThresholds).concat([medianLineBand(assessmentScores)])

    s.bandLinePointRScale = function(classification) {
        return [2.5, 1.5, 3][outlierClassificationIndex(classification)]
    }
    s.sparkStripPointRScale = function(classification) {
        return 2 // r = 2 on the spark strip irrespective of possible outlier status
    }

    var assignmentScoreVerticalDomain = d3.extent(bandThresholds) // fixme adapt the scale for the actual score domain

    var assignmentScoreCount = 7 //  5 past assignments and 2 future assignments

    var assignmentScoreDomain = [0, assignmentScoreCount - 1]

    s.assignmentScoreTemporalScale = d3.scale.linear()
        .domain(assignmentScoreDomain) // fixme adapt the scale for the actual number of scores
        .range([2, 74])

    s.assignmentScoreTemporalScale2 = d3.scale.linear()
        .domain(assignmentScoreVerticalDomain)
        .range([2, 50])

    s.assessmentScoreTemporalScale = d3.scale.linear()
        .domain([0, 4]) // fixme adapt the scale for the actual number of scores
        .range([0, 58])

    var scoreRange = [s.rowBandRange / 2 , -s.rowBandRange  / 2]

    s.assessmentScoreScale = d3.scale.linear()
        .domain([0.5, 1]) // fixme adapt the scale for the actual score domain
        .range(scoreRange)

    s.assignmentScoreVerticalScale = d3.scale.linear()
        .domain(assignmentScoreVerticalDomain)
        .range(scoreRange)

    s.assignmentScoreVerticalScaleLarge = d3.scale.linear()
        .domain(assignmentScoreVerticalDomain)
        .range([s.rowBandRange * 2 , -s.rowBandRange])

    s.assignmentScoreHorizontalScale = d3.scale.linear()
        .domain(assignmentScoreVerticalDomain)
        .range([0, 98])

    s.scoreBandScale = d3.scale.ordinal()
        .domain(d3.range(6))
        .rangePoints([0, 100], 1)


    return s
}
