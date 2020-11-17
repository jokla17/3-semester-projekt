$(document).ready(() => {
    let append = () => {
        $("#productsChartContainer").append("<h3 style=\"text-align: center;\">Total, defect and acceptable products</h3> " + 
        "<canvas id=\"productsChart\" width=\"400\" height=\"400\"></canvas>");
        $("#prodProcessedChartContainer").append("<h3 style=\"text-align: center;\">Produced products over time</h3>" + 
        "<canvas id=\"prodProcessedChart\" width=\"400\" height=\"400\"></canvas>");
        $("#stateChartContainer").append("<h3 style=\"text-align: center;\">Time spent in different states</h3>" + 
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
                // INSERT: let stateData = json.Logs.States;

                //bar chart
                let defCount = defData[defData.length - 1];
                let accCount = prodData[prodData.length - 1] - defData[defData.length - 1];
                let data = [defCount, accCount];

                var ctx = document.getElementById('productsChart');
                var barChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Defect Products', 'Acceptable Products'],
                        datasets: [{
                            label: 'Amount of beer',
                            data: data,
                            backgroundColor: [
                                "rgba(243, 98, 98, 1)",
                                "rgba(13, 255, 0, 0.5)"
                            ],
                            borderWidth: 0
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
                            label: "Totalt products over time",
                            data: prodData,
                            backgroundColor: "rgba(13, 255, 0, 0.5)",
                            lineTension: 0.2
                        }, {
                            label: "Total defective products over time",
                            data: defData,
                            backgroundColor: "rgba(243, 98, 98, 1)",
                            lineTension: 0.2
                        }]
                    },
                    options: {

                    }
                });

                //radar chart
                var stateElem = document.getElementById("stateChart");
                var stateChart = new Chart(stateElem, {
                    type: 'pie',
                    data: {
                        labels: ["Deactivated", "Clearing", "Stopped", "Starting", "Idle", "Suspended", "Execute", "Stopping", "Aborting", "Aborted", "Holding", "Held", "Resetting", "Completing", "Complete", "Deactivating", "Activating"],
                        datasets: [{
                            label: "Time spent in different machine states",
                            data: [100, 40, 30, 5, 45, 23, 90, 50, 30, 10, 5, 15, 60, 70, 5, 12, 51], //insert "dddata" variable here in the future
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