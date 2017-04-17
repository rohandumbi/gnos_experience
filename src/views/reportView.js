import {View} from '../core/view';
import {Chart} from 'chart.js';
import {ExpitReportModel} from '../models/expitReportModel';
import {UnitModel} from '../models/unitModel';
import {ProductModel} from '../models/productModel';
import {ProductJoinModel} from '../models/productJoinModel';
import {ExpressionModel} from '../models/expressionModel';
import {GradeModel} from '../models/gradeModel';
import {ReportModel} from '../models/reportModel';

export class ReportView extends View {

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.scenarioId = options.scenario.id;
        this.scenarioName = options.scenario.name;
        this.unitModel = new UnitModel({projectId: options.projectId});
        this.productModel = new ProductModel({projectId: options.projectId});
        this.productJoinModel = new ProductJoinModel({projectId: options.projectId});
        this.expressionModel = new ExpressionModel({projectId: options.projectId});
        this.gradeModel = new GradeModel({projectId: options.projectId});
        this.reportModel = new ReportModel({projectId: options.projectId});
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
        this.ctx = this.$el.find('#myChart');
        var labels = [];
        //var valueMap = new Map();
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
                valueMap[name][key] = yearlyData.quantity;
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
            var background = 'rgba(' + colorCode + ', 0.2)';
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

    createSimpleBar(reportData) {
        if (this.myChart) {
            this.myChart.destroy();
        }
        this.ctx = this.$el.find('#myChart');
        var labels = [];
        var data = [];
        for (let key of Object.keys(reportData)) {
            labels.push(key);
            data.push(reportData[key])
        }
        this.myChart = new Chart(this.ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total',
                    data: data,
                    stack: 'Stack 0',
                    /*backgroundColor: [
                     'rgba(153, 102, 255, 0.2)'
                     /!*'rgba(255, 99, 132, 0.2)',
                     'rgba(54, 162, 235, 0.2)',
                     'rgba(255, 206, 86, 0.2)',
                     'rgba(75, 192, 192, 0.2)',
                     'rgba(153, 102, 255, 0.2)',
                     'rgba(255, 159, 64, 0.2)'*!/
                     ],*/
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    /*borderColor: [
                     'rgba(153, 102, 255, 1)'
                     /!*'rgba(255,99,132,1)',
                     'rgba(54, 162, 235, 1)',
                     'rgba(255, 206, 86, 1)',
                     'rgba(75, 192, 192, 1)',
                     'rgba(153, 102, 255, 1)',
                     'rgba(255, 159, 64, 1)'*!/
                     ],*/
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

    onDomLoaded() {
        this.fetchExpressions();
        //this.bindEvents();
        //this.loadSimpleExpit();
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
                    deafult:
                        that.loadUnits();
            }

        });
    }

    loadReportGraph() {
        var that = this;
        var scenarioName = this.scenarioName;
        var reportType = this.$el.find('#report-selector').find(':selected').data('reporttype');
        var dataType = this.$el.find('#datatype-selector').find(':selected').data('datatype');
        var dataName = this.$el.find('#data-selector').find(':selected').data('dataname');
        var gradeType = this.$el.find('#data-selector').find(':selected').data('gradetype');
        var groupType = this.$el.find('#group-selector').find(':selected').data('grouptype');

        if (!scenarioName || !reportType || !dataType || !dataName || !groupType) {
            alert('An input field is missing');
        } else {
            var dataObject = {};
            dataObject['scenario_name'] = scenarioName;
            dataObject['report_type'] = reportType;
            dataObject['data_type'] = dataType;
            dataObject['data_name'] = dataName;
            if (gradeType) {
                dataObject['grade_type'] = gradeType;
            }
            //dataObject['group_by'] = groupType;
            console.log(dataObject);
            this.reportModel.add({
                dataObject: dataObject,
                success: function (data) {
                    //console.log(data);
                    that.createSimpleBar(data);
                },
                error: function (data) {
                    alert('Error fetching report data');
                }
            })
        }
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
