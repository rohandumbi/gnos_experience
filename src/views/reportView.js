import {View} from '../core/view';
import {Chart} from 'chart.js';
export class ReportView extends View {

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.scenarioId = options.scenario.id;
    }

    getHtml() {
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/reportView.html", function (data) {
                resolve(data);
            })
        });
        return promise;
    }

    loadStackBar() {
        if (this.myChart) {
            this.myChart.destroy();
        }
        this.ctx = this.$el.find('#myChart');
        this.myChart = new Chart(this.ctx, {
            type: 'bar',
            data: {
                labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
                datasets: [{
                    label: '# of Majority Votes',
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
                },
                    {
                        label: '# of Minority Votes',
                        data: [4, 6, 1, 2, 2, 1],
                        stack: 'Stack 0',
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.5)',
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(255, 206, 86, 0.5)',
                            'rgba(75, 192, 192, 0.5)',
                            'rgba(153, 102, 255, 0.5)',
                            'rgba(255, 159, 64, 0.5)'
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
                    }]
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

    loadSimpleBar() {
        if (this.myChart) {
            this.myChart.destroy();
        }
        this.ctx = this.$el.find('#myChart');
        this.myChart = new Chart(this.ctx, {
            type: 'bar',
            data: {
                labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
                datasets: [{
                    label: '# of Majority Votes',
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
            labels: ["January", "February", "March", "April", "May", "June", "July"],
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
                data: [51, 65, 40, 49, 60, 37, 40],
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
        this.bindEvents();
        this.loadSimpleBar();
    }

    bindEvents() {
        var that = this;
        this.$el.find('#report-selector').change(function (event) {
            var graphType = $(this).find(':selected').data('type');
            switch (graphType) {
                case 1:
                    that.loadSimpleBar();
                    break;
                case 2:
                    that.loadStackBar();
                    break;
                case 3:
                    that.loadGraph();
                    break;
                case 4:
                    that.loadMixedGraph();
                    break;
                default:
                    that.loadSimpleBar();
            }

        });
    }
}
