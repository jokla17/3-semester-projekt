$(document).ready(() => {
    let append = () => {
        $("#productsChartContainer").append("<h3 style=\"text-align: center; padding-top: 5px;\">Total, defect and acceptable products</h3> " +
            "<canvas id=\"productsChart\" width=\"400\" height=\"400\"></canvas>");
        $("#prodProcessedChartContainer").append("<h3 style=\"text-align: center; padding-top: 5px;\">Produced products over time</h3>" +
            "<canvas id=\"prodProcessedChart\" width=\"400\" height=\"400\"></canvas>");
        $("#stateChartContainer").append("<h3 style=\"text-align: center; padding-top: 5px;\">Time spent in different states</h3>" +
            "<canvas id=\"stateChart\" width=\"400\" height=\"400\"></canvas>");
    }
    append();

    //associate submit-button with a request to the DB
    $("#btnSubmit").click(() => {
        $("#productsChartContainer").empty();
        $("#prodProcessedChartContainer").empty();
        $("#stateChartContainer").empty();
        append();

        fetch("http://localhost:3000/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: '{"BatchId" : ' + document.getElementById("BatchId").value + '}'
        })
            .then(response => response.json())
            .then(json => {
                let prodData = json.Logs.ProdProcessedCount;
                let defData = json.Logs.ProdDefectiveCount;
                let humData = json.Logs.Humidity;
                let tempData = json.Logs.Temperature;
                let vibData = json.Logs.Vibration;
                let oeeData = json.OEE;
                let typeData = json.ProductType;
                let speedData = json.Speed;
                let timeData = json.TimeSpent;
                let errorData = json.Error;
                let stateData = json.StateTracker;


                //bar chart
                let defCount = defData[defData.length - 1];
                let accCount = prodData[prodData.length - 1] - defData[defData.length - 1];
                let data = [defCount, accCount];

                var ctx = document.getElementById('productsChart');
                var barChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: [''],
                        datasets: [{
                            label: 'Acceptable Products',
                            data: [accCount],
                            backgroundColor: "rgba(13, 255, 0, 0.5)",
                            borderWidth: 0
                        }, {
                            label: 'Defect Products',
                            data: [defCount],
                            backgroundColor: "rgba(243, 98, 98, 1)",
                            borderWidth: 0
                        }]
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                },
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Amount'
                                }
                            }]
                        }
                    }
                });

                //line chart
                let time = [];
                for (let i = 0; i < prodData.length; i++) {
                    time[i] = i;
                }
                var prodElem = document.getElementById('prodProcessedChart');
                var lineChart = new Chart(prodElem, {
                    type: 'line',
                    data: {
                        labels: time,
                        datasets: [{
                            label: "Total products",
                            data: prodData,
                            backgroundColor: "rgba(13, 255, 0, 0.5)",
                            lineTension: 0.2
                        }, {
                            label: "Defective products",
                            data: defData,
                            backgroundColor: "rgba(243, 98, 98, 1)",
                            lineTension: 0.2
                        }]
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Amount'
                                }
                            }],
                            xAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Time'
                                }
                            }]
                        }
                    }
                });

                //radar chart
                let states = [];
                let durations = [];
                stateData.forEach(o => {
                    states.push(o.key);
                    durations.push(o.value.TimeInState);
                });
                var stateElem = document.getElementById("stateChart");
                var stateChart = new Chart(stateElem, {
                    type: 'pie',
                    data: {
                        labels: states,
                        datasets: [{
                            label: "Time spent in different machine states (seconds)",
                            data: durations,
                            backgroundColor: [
                                'rgba(255, 0, 0, 0.5)',
                                'rgba(0, 255, 0, 0.5)',
                                'rgba(0, 0, 255, 0.5)',
                                'rgba(255, 255, 0, 0.5)',
                                'rgba(0, 255, 255, 0.5)',
                                'rgba(255, 0, 255, 0.5)',
                                'rgba(125, 10, 125, 0.5)',
                                'rgba(125, 0, 0, 0.5)',
                                'rgba(0, 125, 0, 0.5)',
                                'rgba(0, 0, 125, 0.5)',
                                'rgba(120, 255, 54, 0.5)',
                                'rgba(50, 0, 130, 0.5)',
                                'rgba(125, 125, 0, 0.5)',
                                'rgba(125, 0, 125, 0.5)',
                                'rgba(0, 125, 125, 0.5)',
                                'rgba(87, 255, 87, 0.5)',
                                'rgba(255, 87, 87, 0.5)']
                        }]
                    },
                    options: {
                    }
                });

            });
    });
});