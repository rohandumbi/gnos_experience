import {View} from '../core/view';
import {Chart} from 'chart.js';
import {ExpitReportModel} from '../models/expitReportModel';
import {UnitModel} from '../models/unitModel';
import {ProductModel} from '../models/productModel';
import {ProductJoinModel} from '../models/productJoinModel';
import {ExpressionModel} from '../models/expressionModel';
import {GradeModel} from '../models/gradeModel';
import {ReportModel} from '../models/reportModel';
import {TextFieldModel} from '../models/textFieldModel';
import {ProcessJoinModel} from '../models/processJoinModel';
import {PitGroupModel} from '../models/pitGroupModel';
import {ScenarioCollection} from '../models/scenarioCollection';

export class ReportView extends View {

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.scenarioId = options.scenario.id;
        this.scenarioName = options.scenario.name;
        this.scenarioTimePeriod = options.scenario.timePeriod;
        this.scenarioStartYear = options.scenario.startYear;
        this.unitModel = new UnitModel({projectId: options.projectId});
        this.productModel = new ProductModel({projectId: options.projectId});
        this.productJoinModel = new ProductJoinModel({projectId: options.projectId});
        this.expressionModel = new ExpressionModel({projectId: options.projectId});
        this.gradeModel = new GradeModel({projectId: options.projectId});
        this.reportModel = new ReportModel({projectId: options.projectId});
        this.textFieldModel = new TextFieldModel({projectId: options.projectId});
        this.processJoinModel = new ProcessJoinModel({projectId: options.projectId});
        this.pitGroupModel = new PitGroupModel({projectId: options.projectId});
        this.scenarioCollection = new ScenarioCollection({projectId: options.projectId});
    }

    getHtml() {
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/reportView.html", function (data) {
                resolve(data);
            })
        });
        return promise;
    }

    createStackBar(reportData) {
        if (this.myChart) {
            this.myChart.destroy();
        }
        this.ctx = this.$el.find('#myChart');
        var labels = [];
        var valueMap = {};
        for (let key of Object.keys(reportData)) {
            labels.push(key);
            var yearlyDataArray = reportData[key];
            yearlyDataArray.forEach(function (yearlyData) {
                var name = yearlyData.name;
                var mapEntry = valueMap[name];
                if (!mapEntry) {//field is not present in map yet
                    valueMap[name] = {};
                }
                valueMap[name][key] = yearlyData.value;
            });
        }
        console.log(valueMap);
        //next extra steps are required to populate atleast a 0 value
        //for the periods in which the group(PIT/DESTINATION) is absent
        for (let key of Object.keys(valueMap)) {
            var groupName = key;
            var yearlyValuesObject = valueMap[groupName]
            labels.forEach(function (year) {
                if (!yearlyValuesObject[year]) {
                    valueMap[groupName][year] = 0;
                }
            });
        }
        console.log(valueMap);
        var dataSets = [];
        for (let key of Object.keys(valueMap)) {
            var groupName = key;
            var yearlyValuesObject = valueMap[groupName];
            //var hue = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
            var colorCode = (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256));
            var background = 'rgba(' + colorCode + ', 0.7)';
            var border = 'rgba(' + colorCode + ', 1)';
            var dataSetEntry = {
                label: groupName,
                stack: 'Stack 0',
                backgroundColor: background,
                borderColor: border,
                borderWidth: 1
            };
            var data = [];
            for (let key of Object.keys(yearlyValuesObject)) {
                data.push(yearlyValuesObject[key]);
            }
            dataSetEntry['data'] = data;
            dataSets.push(dataSetEntry);
        }
        labels.length = 0;
        for (let j = 0; j < this.scenarioTimePeriod; j++) {
            labels.push(this.scenarioStartYear + j);
        }

        this.myChart = new Chart(this.ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: dataSets
            },
            options: {
                scales: {
                    xAxes: [{
                        stacked: true,
                    }],
                    yAxes: [{
                        stacked: true,
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }

    fetchExpitReport(options) {
        this.expitReportModel = new ExpitReportModel({projectId: this.projectId});
        this.expitReportModel.add({
            dataObject: options.formData,
            success: function (data) {
                options.success(data);
            },
            error: function (data) {
                alert("Error fetching report data:" + data);
                if (options.error) options.error(data);
            }
        });
    }

    loadExpitGroupByPit() {
        var that = this;
        if (this.myChart) {
            this.myChart.destroy();
        }
        var formData = {
            scenario_name: this.scenarioName,
            group_by: "PIT"
        }
        this.fetchExpitReport({
            formData: formData,
            success: function (data) {
                that.createStackBar(data);
            }
        });
    }

    loadExpitGroupByDestination() {
        var that = this;
        if (this.myChart) {
            this.myChart.destroy();
        }
        var formData = {
            scenario_name: this.scenarioName,
            group_by: "DESTINATION_TYPE"
        }
        this.fetchExpitReport({
            formData: formData,
            success: function (data) {
                that.createStackBar(data);
            }
        });
    }

    createLineGraph(reportData) {
        if (this.myChart) {
            this.myChart.destroy();
        }
        this.ctx = this.$el.find('#myChart');
        var labels = [];
        var data = [];
        for (let key of Object.keys(reportData)) {
            //labels.push(key);
            data.push(reportData[key])
        }
        for (let j = 0; j < this.scenarioTimePeriod; j++) {
            labels.push(this.scenarioStartYear + j);
        }

        var barChartData = {
            labels: labels,
            datasets: [{
                label: 'Aggregate',
                type: 'bar',
                data: data,
                stack: 'Stack 0',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
                yAxisID: 'y-axis-1'
            }, {
                label: "Grades",
                type: 'line',
                data: data,
                fill: false,
                borderColor: '#EC932F',
                backgroundColor: '#EC932F',
                pointBorderColor: '#EC932F',
                pointBackgroundColor: '#EC932F',
                pointHoverBackgroundColor: '#EC932F',
                pointHoverBorderColor: '#EC932F',
                yAxisID: 'y-axis-2'
            }]
        };
        if (this.myChart) {
            this.myChart.destroy();
        }
        this.ctx = this.$el.find('#myChart');
        this.myChart = new Chart(this.ctx, {
            type: 'bar',
            data: barChartData,
            options: {
                responsive: true,
                tooltips: {
                    mode: 'label'
                },
                elements: {
                    line: {
                        fill: false
                    }
                },
                scales: {
                    xAxes: [{
                        display: true,
                        gridLines: {
                            display: true
                        },
                        labels: {
                            show: true,
                        }
                    }],
                    yAxes: [{
                        type: "linear",
                        display: true,
                        position: "left",
                        id: "y-axis-1",
                        gridLines: {
                            display: false
                        },
                        labels: {
                            show: true,

                        }
                    }, {
                        type: "linear",
                        display: true,
                        position: "right",
                        id: "y-axis-2",
                        gridLines: {
                            display: false
                        },
                        labels: {
                            show: true,

                        }
                    }]
                }
            }
        });
    }

    createSimpleBar(reportData) {
        if (this.myChart) {
            this.myChart.destroy();
        }
        this.ctx = this.$el.find('#myChart');
        var labels = [];
        var data = [];
        for (let key of Object.keys(reportData)) {
            //labels.push(key);
            data.push(reportData[key]);
        }
        for (let j = 0; j < this.scenarioTimePeriod; j++) {
            labels.push(this.scenarioStartYear + j);
        }
        this.myChart = new Chart(this.ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total',
                    data: data,
                    stack: 'Stack 0',
                    backgroundColor: 'rgba(153, 102, 255, 0.7)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }

    loadSimpleExpit() {
        var that = this;
        if (this.myChart) {
            this.myChart.destroy();
        }
        var formData = {
            scenario_name: this.scenarioName
        }
        this.fetchExpitReport({
            formData: formData,
            success: function (data) {
                that.createSimpleBar(data);
            }
        });
    }

    loadGraph() {
        var data = {
            labels: ["January", "February", "March", "April", "May", "June", "July"],
            datasets: [
                {
                    label: "My First dataset",
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: "rgba(75,192,192,0.4)",
                    borderColor: "rgba(75,192,192,1)",
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: "rgba(75,192,192,1)",
                    pointBackgroundColor: "#fff",
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "rgba(75,192,192,1)",
                    pointHoverBorderColor: "rgba(220,220,220,1)",
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: [65, 59, 80, 81, 56, 55, 40],
                    spanGaps: false,
                }
            ]
        };
        if (this.myChart) {
            this.myChart.destroy();
        }
        this.ctx = this.$el.find('#myChart');
        this.myChart = new Chart(this.ctx, {
            type: 'line',
            data: data
        });
    }

    loadMixedGraph() {
        var barChartData = {
            labels: ["January", "February", "March", "April", "May", "June"],
            datasets: [{
                label: '# of Majority Votes',
                type: 'bar',
                data: [12, 19, 3, 5, 2, 3],
                stack: 'Stack 0',
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }, {
                label: "Sales",
                type: 'line',
                data: [51, 65, 40, 49, 60, 37],
                fill: false,
                borderColor: '#EC932F',
                backgroundColor: '#EC932F',
                pointBorderColor: '#EC932F',
                pointBackgroundColor: '#EC932F',
                pointHoverBackgroundColor: '#EC932F',
                pointHoverBorderColor: '#EC932F',
                yAxisID: 'y-axis-2'
            }]
        };
        if (this.myChart) {
            this.myChart.destroy();
        }
        this.ctx = this.$el.find('#myChart');
        this.myChart = new Chart(this.ctx, {
            type: 'bar',
            data: barChartData,
            options: {
                responsive: true,
                tooltips: {
                    mode: 'label'
                },
                elements: {
                    line: {
                        fill: false
                    }
                },
                scales: {
                    xAxes: [{
                        display: true,
                        gridLines: {
                            display: true
                        },
                        labels: {
                            show: true,
                        }
                    }],
                    yAxes: [{
                        type: "linear",
                        display: true,
                        position: "left",
                        id: "y-axis-1",
                        gridLines: {
                            display: false
                        },
                        labels: {
                            show: true,

                        }
                    }, {
                        type: "linear",
                        display: true,
                        position: "right",
                        id: "y-axis-2",
                        gridLines: {
                            display: false
                        },
                        labels: {
                            show: true,

                        }
                    }]
                }
            }
        });
    }

    fetchScenarios() {
        var that = this;
        this.scenarioCollection.fetch({
            success: function (data) {
                that.scenarios = data;
                var $modalBody = '';
                that.scenarios.forEach(function (scenario) {
                    $modalBody += ('<div class="checkbox">' +
                    '<label class="checkbox">' +
                    '<input name="scenario" type="checkbox" checked="checked" value="' + scenario.id + '"/>' + scenario.name +
                    '</label>' +
                    '</div>')
                });
                that.$el.find('#scenarioModal').find('.modal-body').append($modalBody);
            },
            error: function (data) {
                alert('Could not fetch scenario list: ' + data);
            }
        });
    }

    onDomLoaded() {
        this.fetchScenarios();
        this.fetchExpressions();
        this.fetchTextFields();
        this.loadSavedReport();
        //this.bindEvents();
        //this.loadSimpleExpit();
    }

    loadSavedReport() {
        var savedReportData = JSON.parse(localStorage.getItem('Report-' + this.projectId));
        if (savedReportData) {
            this.fetchReportData(savedReportData);
        }
    }

    fetchTextFields() {
        var that = this;
        this.textFieldModel.fetch({
            success: function (data) {
                that.textFields = data;
                that.fetchProcessJoins();
            },
            error: function () {
                alert('Error fetching text fields');
            }
        });
    }

    fetchProcessJoins() {
        var that = this;
        this.processJoinModel.fetch({
            success: function (data) {
                that.processJoins = data;
                that.fetchPitGroups();
            },
            error: function () {
                alert('Error fetching process joins');
            }
        });
    }

    fetchPitGroups() {
        var that = this;
        this.pitGroupModel.fetch({
            success: function (data) {
                that.pitGroups = data;
                that.populateGroupByOptions();
            },
            error: function () {
                alert('Error fetching pit groups');
            }
        });
    }

    populateGroupByOptions() {
        var options = '';
        var fieldOptGroup = '<optgroup label="Input Fields">';
        var processJoinOptGroup = '<optgroup label="Process Joins">';
        var destinationOptGroup = '<optgroup label="Destinations">';
        var pitGroupOptGroup = '<optgroup label="Pit Groups">';
        var endTag = '</optgroup>';

        this.textFields.forEach(function (textField) {
            fieldOptGroup += '<option data-value="' + textField.name + '" data-grouptype="2">' + textField.name + '</option>';
        });

        this.processJoins.forEach(function (processJoin) {
            processJoinOptGroup += '<option data-value="' + processJoin.name + '" data-grouptype="3">' + processJoin.name + '</option>';
        });

        destinationOptGroup += '<option data-value="destination_type" data-grouptype="4">Destination Type</option>';
        destinationOptGroup += '<option data-value="destination" data-grouptype="5">Destination</option>';

        this.pitGroups.forEach(function (pitGroup) {
            pitGroupOptGroup += '<option data-value="' + pitGroup.name + '" data-grouptype="6">' + pitGroup.name + '</option>';
        });

        fieldOptGroup += endTag;
        processJoinOptGroup += endTag;
        destinationOptGroup += endTag;
        pitGroupOptGroup += endTag;

        options += fieldOptGroup;
        options += processJoinOptGroup;
        options += destinationOptGroup;
        options += pitGroupOptGroup;

        this.$el.find('#group-selector').append(options);
    }

    fetchExpressions() {
        var that = this;
        this.expressionModel.fetch({
            success: function (data) {
                that.expressions = data;
                that.bindEvents();
            },
            error: function (data) {
                alert('Error fetching expressions');
            }
        });
    }

    bindEvents() {
        var that = this;
        this.$el.find('#show-report').click(function (event) {
            that.loadReportGraph();
        });
        this.$el.find('#export-report').click(function (event) {
            that.exportReportGraph();
        });
        this.$el.find('#datatype-selector').change(function (event) {
            var dataType = $(this).find(':selected').data('datatype');
            switch (dataType) {
                case 1:
                    //that.loadSimpleExpit();
                    that.loadUnits();
                    break;
                case 2:
                    //that.loadExpitGroupByPit();
                    that.loadExpressions();
                    break;
                case 3:
                    //that.loadExpitGroupByDestination();
                    that.loadProducts();
                    break;
                case 4:
                    that.loadProductJoins();
                    break;
                case 5:
                    that.loadTruckHours();
                    break;
                case 6:
                    that.loadGrade();
                    break;

                default:
                    that.loadUnits();
            }

        });
    }

    exportReportGraph() {
        var selectedScenarioIds = [];
        this.$el.find('input:checkbox[name=scenario]:checked').each(function () {
            selectedScenarioIds.push(parseInt($(this).val(), 10));
        });
        var body = {
            "scenarioIds": selectedScenarioIds
        }
        var req = new XMLHttpRequest();
        req.open("POST", 'http://localhost:4567/project/' + this.projectId + '/report/csv', true);
        req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        req.responseType = "blob";

        req.onload = function (event) {
            var blob = req.response;
            //console.log(blob.size);
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = "Report_" + new Date() + ".csv";
            link.click();
        };

        req.send(JSON.stringify(body));
    }

    loadReportGraph() {
        var that = this;
        var scenarioName = this.scenarioName;
        var reportType = this.$el.find('#report-selector').find(':selected').data('reporttype');
        var dataType = this.$el.find('#datatype-selector').find(':selected').data('datatype');
        var dataName = this.$el.find('#data-selector').find(':selected').data('dataname');
        var gradeType = this.$el.find('#data-selector').find(':selected').data('gradetype');
        var groupType = this.$el.find('#group-selector').find(':selected').data('grouptype');
        var groupName = this.$el.find('#group-selector').find(':selected').data('value');

        if (!scenarioName || !reportType || !dataType || !dataName) {
            alert('An input field is missing');
        } else {
            var dataObject = {};
            dataObject['scenario_name'] = scenarioName;
            dataObject['report_type'] = reportType;
            dataObject['data_type'] = dataType;
            dataObject['data_name'] = dataName;
            dataObject['group_type'] = parseInt(groupType)
            if (gradeType) {
                dataObject['grade_type'] = gradeType;
            }
            if (dataObject['group_type'] > 1) {
                dataObject['group_by'] = groupName;
            }
            //dataObject['group_by'] = groupType;
            console.log(dataObject);
            this.fetchReportData(dataObject);
        }
    }

    fetchReportData(dataObject) {
        var that = this;
        this.reportModel.add({
            dataObject: dataObject,
            success: function (data) {
                //console.log(data);
                localStorage.setItem('Report-' + that.projectId, JSON.stringify(dataObject));
                if (dataObject['data_type'] === 6) {
                    that.createLineGraph(data);
                } else if (dataObject['group_type'] > 1) {
                    that.createStackBar(data);
                } else {
                    that.createSimpleBar(data);
                }
            },
            error: function (data) {
                alert('Error fetching report data');
            }
        })
    }

    loadUnits() {
        var that = this;
        this.unitModel.fetch({
            success: function (data) {
                that.units = data;
                var options = '';
                that.units.forEach(function (unit) {
                    options += '<option data-dataname="' + unit.name + '">' + unit.name + '</option>';
                });
                that.$el.find('#data-selector').html(options);
            },
            error: function (data) {
                alert('Error fetching units');
            }
        });
    }

    loadExpressions() {
        var options = '';
        this.expressions.forEach(function (expression) {
            if (!expression.isGrade) {
                options += '<option data-dataname="' + expression.name + '">' + expression.name + '</option>';
            }
        });
        this.$el.find('#data-selector').html(options);
    }

    loadProducts() {
        var that = this;
        this.productModel.fetch({
            success: function (data) {
                that.products = data;
                var options = '';
                that.products.forEach(function (product) {
                    options += '<option data-dataname="' + product.name + '">' + product.name + '</option>';
                });
                that.$el.find('#data-selector').html(options);
            },
            error: function (data) {
                alert('Error fetching products');
            }
        });
    }

    loadProductJoins() {
        var that = this;
        this.productJoinModel.fetch({
            success: function (data) {
                that.productJoins = data;
                var options = '';
                that.productJoins.forEach(function (productJoin) {
                    options += '<option data-dataname="' + productJoin.name + '">' + productJoin.name + '</option>';
                });
                that.$el.find('#data-selector').html(options);
            },
            error: function (data) {
                alert('Error fetching product joins');
            }
        });
    }

    loadTruckHours() {
        var options = '<option data-dataname="TOTAL_TH">TOTAL_TH</option>';
        this.$el.find('#data-selector').html(options);
    }

    loadGrade() {
        var that = this;
        this.gradeModel.fetch({
            success: function (data) {
                that.grades = data;
                var options = '';
                that.grades.forEach(function (grade) {
                    options += '<option data-gradetype="1" data-dataname="' + grade.name + '">' + grade.name + '</option>';
                });
                that.expressions.forEach(function (expression) {
                    if (expression.isGrade) {
                        options += '<option data-gradetype="2" data-dataname="' + expression.name + '">' + expression.name + '</option>';
                    }
                });
                that.$el.find('#data-selector').html(options);
            },
            error: function (data) {
                alert('Error fetching grades');
            }
        });
    }
}
