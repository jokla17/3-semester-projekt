/**
 * Show single search batch
 */
let singleBatchContents = () => {
    let address = window.location.search;
    let urlParams = new URLSearchParams(address);
    let id = urlParams.get("batch_id");

    fetch("http://localhost:3000/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: '{"BatchId" : ' + id + '}'
    })
        .then(response => response.json())
        .then(json => {
            let prodProcessedCount = json.Logs.ProdProcessedCount[json.Logs.ProdProcessedCount.length - 1];
            let prodDefectiveCount = json.Logs.ProdDefectiveCount[json.Logs.ProdDefectiveCount.length - 1];

            // Batch Id
            $("#singleBatch").append("<h2>Batch report (" + json.BatchId + ")</h2>");

            // Batch values
            $("#singleBatch").append("<div id=\"singleBatchHeader\"></div>")

            // Detect correct type of beer
            let productType = null;
            switch (json.ProductType) {
                case 0: productType = "Pilsner"; break;
                case 1: productType = "Wheat"; break;
                case 2: productType = "IPA"; break;
                case 3: productType = "Stout"; break;
                case 4: productType = "Ale"; break;
                case 5: productType = "Alchohol-free"; break;
            }

            $("#singleBatchHeader").append("<div class=\"flexDirectionRow flexSpaceBetween\"><p>Date and time:</p><p><i>" + json.DateTime + "</i></p></div>");
            $("#singleBatchHeader").append("<div class=\"flexDirectionRow flexSpaceBetween\"><p>Product type:</p><p><i>" + productType + "</i></p></div>");
            $("#singleBatchHeader").append("<div class=\"flexDirectionRow flexSpaceBetween\"><p>Processed products:</p><p><i>" + prodProcessedCount + "</i></p></div>");
            $("#singleBatchHeader").append("<div class=\"flexDirectionRow flexSpaceBetween\"><p>Acceptable products:</p><p><i>" + (prodProcessedCount - prodDefectiveCount) + "</i></p></div>");
            $("#singleBatchHeader").append("<div class=\"flexDirectionRow flexSpaceBetween\"><p>Defective products:</p><p><i>" + prodDefectiveCount + "</i></p></div>");
            $("#singleBatchHeader").append("<div class=\"flexDirectionRow flexSpaceBetween\"><p>Speed (Products pr. minute):</p><p><i>" + json.Speed + "</i></p></div>");
            $("#singleBatchHeader").append("<div class=\"flexDirectionRow flexSpaceBetween\"><p>Amount of time used:</p><p><i>" + json.TimeSpent / 1000 + " sec</i></p></div>");
            $("#singleBatchHeader").append("<div class=\"flexDirectionRow flexSpaceBetween\"><p>Overall Equipment Effectiveness (OEE):</p><p><i>" + json.OEE + " %</i></p></div>");
            $("#singleBatchHeader").append("<div class=\"flexDirectionRow flexSpaceBetween\"><p>Error (Dif. between set amount and acceptable products):</p><p><i>" + json.Error + "</i></p></div>");

            // Buttons
            $("#singleBatch").append("<button id=\"btnShowStates\" class=\"buttonDefault buttonSuccess\">SHOW STATES</button>");
            $("#singleBatch").append("<button id=\"btnShowLogs\"class=\"buttonDefault buttonSuccess\">Show Logs</button>");
            $("#singleBatch").append("<button class=\"buttonDefault buttonSuccess\">SAVE AS PDF</button>");
            $("#btnShowLogs").click(() => { $("#singleBatchLogs").toggle("slow"); });
            $("#btnShowStates").click(() => { $("#singleBatchStates").toggle("slow"); });

            // Logs
            $("#singleBatch").append(("<div id=\"singleBatchLogs\"></div>"));
            $("#singleBatchLogs").hide();
            $("#singleBatchLogs").addClass("flexDirectionRow flexLeft flexWrap");

            let logResults = (identifier, jsonProperty) => {
                $("#singleBatchLogs").append("<ul id=" + identifier + "></ul>");
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

            // State tracker   
            $("#singleBatch").append("<div id=\"singleBatchStates\" class=\"flexDirectionColumn\"></div>");    
            $("#singleBatchStates").hide();
            for (let i = 0; i < json.StateTracker.length; i++) {
                $("#singleBatchStates").append(
                    "<ul>" +
                    "<li class=\"flexDirectionRow flexSpaceBetween\"><p>State: </p><p><i>" + json.StateTracker[i].key  + "</i></p></li>" +
                    "<li class=\"flexDirectionRow flexSpaceBetween\"><p>Activated: </p><p><i>" + json.StateTracker[i].value.Activated + "</i></p></li>" +
                    "<li class=\"flexDirectionRow flexSpaceBetween\"><p>Ended: </p><p><i>" + json.StateTracker[i].value.Ended + "</i></p></li>" +
                    "<li class=\"flexDirectionRow flexSpaceBetween\"><p>Time in state: </p><p><i>" + json.StateTracker[i].value.TimeInState  + " sec</p></li>" +
                    "</ul>");
            }
        });
}
singleBatchContents();