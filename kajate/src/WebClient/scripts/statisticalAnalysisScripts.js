const Chart = require('chart.js');

const ctx = document.getElementById('myChart');
const myChart = new Chart (ctx, {
    type: 'bar',
    data: {
        labels: ['Wahid', 'Emma','Jonas', 'Karthi', 'Andreas', 'Arem'],
        datasets: [{
            label: 'Indsats fra 1-10',
            data: [10, 10, 3, 10, 10, 10],
            backgroundColor:[
                'rgba(13, 255, 0, 0.5)',
                'rgba(242, 0, 255, 0.5)',
                'rgba(255, 0, 0, 0.5)',
                'rgba(255, 132, 0, 0.5)',
                'rgba(0, 183, 255, 0.5)',
                'rgba(47, 0, 255, 0.5)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
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