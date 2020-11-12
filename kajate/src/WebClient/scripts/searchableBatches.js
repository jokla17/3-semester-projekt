$(document).ready(() => {
    /**
     * Search functionality
     */
    $("#btnSearch").click(() => {
        $("#searchDropdown").empty();

        fetch("http://localhost:3000/search", {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : '{"BatchId" : ' +  $("#tfSearch").val() + '}'
        })
        .then(response => response.json())
        .then(json => {
            let url = new URL("http://127.0.0.1:5500/kajate/src/WebClient/singlebatch.html"); 
            url.searchParams.append('batch_id', json.BatchId); 
            
            $("#searchDropdown").append("<a href=" + url +"><p>Batch " +  json.BatchId + "</p></a>");
        });
    });

    /**
     * Show single search batch
     */
    let singleBatchContents = () => {
        let address = window.location.search;
        let urlParams = new URLSearchParams(address);
        let id = urlParams.get("batch_id");

        fetch("http://localhost:3000/search", {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : '{"BatchId" : ' +  id + '}'
        })
        .then(response => response.json())
        .then(json => {
            // Values
            $("#singleBatch").append(
                "<h2>Batch report (" + json.BatchId +")</h2>",
                "<p>Speed (Products pr. minute): <i>" + json.CurSpeed + "</i></p>",
                "<p>Processed products: <i>" + json.Logs.ProdProcessedCount[json.Logs.ProdProcessedCount.length - 1] + "</i></p>",
                "<p>Defective products: <i>" + json.Logs.ProdDefectiveCount[json.Logs.ProdDefectiveCount.length - 1] + "</i></p>",
                );

            // Logs
            $("#singleBatch").append("<h3>Logs</h3>");
            $("#singleBatch").append("<div></div>");
            $("#singleBatch div").attr("id", "singleBatchLogs");
            $("#singleBatchLogs").addClass("flexDirectionRow flexCenterMultipleRows flexWrap");

            let logResults = (identifier, jsonProperty) => {
                $("#singleBatchLogs").append("<ul id=" + identifier +"></ul>");
                $("#" + identifier).append("<li><b>" + identifier + "</b></li>");

                for (let i = 0; i < jsonProperty.length; i++) {
                    $("#" + identifier).append("<li>" + jsonProperty[i] + "</li>");

                    // Logs displayed
                    if (i >= 10) {
                        $("#" + identifier).append("<li> ... </li>");
                        break;
                    }
                }
            }

            logResults("ProdProcessedCount", json.Logs.ProdProcessedCount);
            logResults("ProdDefectiveCount", json.Logs.ProdDefectiveCount);
            logResults("Temperature", json.Logs.Temperature);
            logResults("Vibration", json.Logs.Vibration);
            logResults("Humidity", json.Logs.Humidity);

            // Button
            $("#singleBatch").append("<button class=\"buttonDefault buttonSuccess\">SAVE AS PDF</button>");
        });
    }
    singleBatchContents();
});