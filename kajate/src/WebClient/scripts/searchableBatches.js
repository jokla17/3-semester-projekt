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
            // Show all batches
            if ($("#tfSearch").val() == "") {
                for (let i = 0; i < json.length; i++) {
                    let url = new URL("http://127.0.0.1:5500/kajate/src/WebClient/SingleBatch.html"); 
                    url.searchParams.append('batch_id', json[i].BatchId); 

                    $("#searchDropdown").append("<a href=" + url +"><p>Batch " +  json[i].BatchId + "</p></a>");
                }
                return
            }

            // Show specific batch
            let url = new URL("http://127.0.0.1:5500/kajate/src/WebClient/singlebatch.html"); 
            url.searchParams.append('batch_id', json.BatchId); 
            $("#searchDropdown").append("<a href=" + url +"><p>Batch " +  json.BatchId + "</p></a>");  
        });
    });
});