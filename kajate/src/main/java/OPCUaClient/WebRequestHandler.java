package OPCUaClient;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.HashMap;
import java.util.Map;

import com.google.gson.Gson;

public class WebRequestHandler {
    private static WebRequestHandler webRequestHandler = new WebRequestHandler();
    
    private HttpClient client = HttpClient.newHttpClient();
    
    public static WebRequestHandler getInstance(){
        return webRequestHandler;
    }

    public String getRequest() {
        String response = null;
        try {
            HttpRequest request = HttpRequest.newBuilder().uri(URI.create("http://localhost:3000/form_data"))
            .GET()
            .build();
            HttpResponse<String> res = client.send(request, HttpResponse.BodyHandlers.ofString());
            response = res.body();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return response;
    }

    public void postRequest() {
        String requestBody = "{\"name\": \"sven\"}";
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("http://localhost:3000"))
                    .header("Content-Type", "application/json")
                    .POST(BodyPublishers.ofString(requestBody))
                    .build();
    
            HttpResponse<Void> res = client.send(request, BodyHandlers.discarding());
            System.out.println(res.statusCode());
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    public void putRequest(HashMap<String, Object> dataset) {
        // Map key value pairs
        Map<String, Object> map = dataset;  
        // Used to help converting to JSON and from string
        Gson gson = new Gson(); 

        // String declared and initialized with a json object (which is a string)
        String requestBody = gson.toJson(map);
        try {
            HttpRequest request = HttpRequest.newBuilder() 
                    .uri(URI.create("http://localhost:3000/opcua_data")) 
                    .header("Content-Type", "application/json") 
                    .PUT(BodyPublishers.ofString(requestBody))
                    .build();
    
            HttpResponse<Void> res = client.send(request, BodyHandlers.discarding());
            System.out.println(res.statusCode());
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    public static void main (String[]args) {
        System.out.println(getInstance().getRequest());
    }
}