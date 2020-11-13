$(document).ready(() => {
    /**
     *  Webserver available functionality
     */
    let checkConnectivity = () => {
        $("#btnServerConnectivity").attr("disabled", true);

        $("#btnServerConnectivity").text("Loading...");
        $("#btnServerConnectivity").removeClass("buttonSuccess buttonWarning");

        fetch("http://localhost:3000/opcua_data")
        .then(() => {
            $("#btnServerConnectivity").text("Server is online!");
            $("#btnServerConnectivity").addClass("buttonSuccess");
            
            $("button").attr("disabled", false);
            $("input:submit").attr("disabled", false);
        })
        .catch(() => {
            $("#btnServerConnectivity").text("Server is offline, Try again?");
            $("#btnServerConnectivity").addClass("buttonWarning");
            
            $("button").attr("disabled", true);
            $("input:submit").attr("disabled", true);
        }).finally(() => {
            $("#btnServerConnectivity").attr("disabled", false);
        });
    }

    checkConnectivity();
    setInterval(() => checkConnectivity(), 30000);

    $("#btnServerConnectivity").click(() => {
        $("#btnServerConnectivity").attr("disabled", true);
        checkConnectivity();
    });

    /**
     * Datetime 
     */
    setInterval(() => {
        $("#dateTime").text(new Date().toLocaleString());
    }, 10);
});