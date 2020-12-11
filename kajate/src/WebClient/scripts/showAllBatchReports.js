$(document).ready(() => {
let currentPage = 0; 
let rows_of_page = 10; 
let maxPage = 10;
let counter = 0;
let isFirstPage = true;
let isLastPage = false;

let nextPage = () => {
    fetch("http://localhost:3000/batches")
      .then(response => response.json())
      .then(json => {
        let isFirstPage = true;
        let isLastPage = false;
        if (rows_of_page > json.length){
          isLastPage = true;
        } else {
          isLastPage = false;
        }
        if (currentPage == 0){
          isFirstPage = true;
        } else {
          isFirstPage = false;
        }

        if(isLastPage){
          $("#btnNext").prop('disabled', true);
        } else {
          $("#btnNext").prop('disabled', false);
        }
        if(isFirstPage){
          $("#btnPrevious").prop('disabled', true);
        } else {
          $("#btnPrevious").prop('disabled', false);
        }

        let displayProductType = (productType) => {
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
              let url = new URL("http://localhost:3000/SingleBatch.html"); 
              url.searchParams.append('batch_id', json[i].BatchId); 
              
              $("#batchReportsTable").append("<tr onclick=\"window.location.href = '" + url + "';\" id='batchReportRow" + i + "'></tr>");
              $("#batchReportRow" + i).append("<td>" + json[i].BatchId + "</td>");
              $("#batchReportRow" + i).append("<td>" + displayProductType(json[i].ProductType) + "</td>");
              $("#batchReportRow" + i).append("<td>" + json[i].Logs.ProdProcessedCount[json[i].Logs.ProdProcessedCount.length - 1] + "</td>");
              $("#batchReportRow" + i).append("<td>" + json[i].OEE.toFixed(0) + "%</td>");
              
              counter++;
            }
        } catch (error) {}
      });
  }
  nextPage();

  $("#btnNext").click(() => {
    if (counter == maxPage){
      counter = 0;
      $("#batchReportsTable").empty();
      currentPage = currentPage + 10;
      rows_of_page = rows_of_page + 10;
      nextPage();
    }
  });
  
  $("#btnPrevious").click(() => {
    $("#batchReportsTable").empty();
    counter = 0;
    if (currentPage != 0) {
      currentPage = currentPage - 10;
      rows_of_page = rows_of_page - 10;
    }
    nextPage();
  });
});
