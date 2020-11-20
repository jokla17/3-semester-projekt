$(document).ready(() => {
    
    let currentPage = 0;
    let rows_of_page = 10;

    function nextPage() {
      fetch("http://localhost:3000/batches")
        .then(response => response.json())
        .then(json => {
          function displayProductType(productType) {
            let pt = "";
            switch (productType) {
              case 0:
                pt = "Pilsner";
                break;

              case 1:
                pt = "Wheat";
                break;

              case 2:
                pt = "IPA";
                break;

              case 3:
                pt = "Stout";
                break;

              case 4:
                pt = "Ale";
                break;

              case 5:
                pt = "Alcohol-free";
                break;
            }
            return pt;
          }

          $("#batchReportsTable").append("<tr><th>Batch ID</th><th>Beer Type</th><th>Amount Produced</th><th>Overall Equipment Effectiveness</th></tr>");
          
          try {
              for (let i = currentPage; i < rows_of_page; i++) {
                $("#batchReportsTable").append("<tr id='batchReportRow" + i + "'></tr>");
                $("#batchReportRow" + i).append("<td>" + json[i].BatchId + "</td>");
                $("#batchReportRow" + i).append("<td>" + displayProductType(json[i].ProductType) + "</td>");
                $("#batchReportRow" + i).append("<td>" + json[i].Products + "</td>");
                $("#batchReportRow" + i).append("<td>" + json[i].OEE + "%</td>");
              }
          } catch (error) {}
        });
    }

    nextPage();

    $("#btnNext").click(() => {
      $("#batchReportsTable").empty();
      currentPage = currentPage + 10;
      rows_of_page = rows_of_page + 10;
      nextPage();
    });

    $("#btnPrevious").click(() => {
      $("#batchReportsTable").empty();
      currentPage = currentPage - 10;
      rows_of_page = rows_of_page - 10;
      nextPage();
    });
  });
