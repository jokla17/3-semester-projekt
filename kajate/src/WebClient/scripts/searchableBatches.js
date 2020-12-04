$(document).ready(() => {
    /**
     * Search functionality
     */
    $("#btnSearch").click(() => {
        $("#searchDropdown").empty();

        // Send POST request to search route, which response with specific batch or all batches
        fetch("http://localhost:3000/search", {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : '{"BatchId" : ' + ($("#tfSearch").val() != "" ? $("#tfSearch").val() : 0) + '}'
        })
        .then(response => response.json())
        .then(json => {
            // Show specific batch
            let url = new URL("http://localhost:3000/SingleBatch.html"); 
            url.searchParams.append('batch_id', json.BatchId); 
            if (json.BatchId != undefined) {
                $("#searchDropdown").append("<a href=" + url +"><p>Batch " +  json.BatchId + "</p></a>");  
            }
        });
    });
});