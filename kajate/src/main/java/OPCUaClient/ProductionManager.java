package OPCUaClient;

import java.util.Date;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.BiConsumer;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.eclipse.milo.opcua.sdk.client.OpcUaClient;
import org.eclipse.milo.opcua.sdk.client.api.config.OpcUaClientConfigBuilder;
import org.eclipse.milo.opcua.sdk.client.api.subscriptions.UaMonitoredItem;
import org.eclipse.milo.opcua.sdk.client.api.subscriptions.UaSubscription;
import org.eclipse.milo.opcua.stack.client.DiscoveryClient;
import org.eclipse.milo.opcua.stack.core.AttributeId;
import org.eclipse.milo.opcua.stack.core.types.builtin.DataValue;
import org.eclipse.milo.opcua.stack.core.types.builtin.NodeId;
import org.eclipse.milo.opcua.stack.core.types.builtin.Variant;
import org.eclipse.milo.opcua.stack.core.types.enumerated.MonitoringMode;
import org.eclipse.milo.opcua.stack.core.types.enumerated.TimestampsToReturn;
import org.eclipse.milo.opcua.stack.core.types.structured.EndpointDescription;
import org.eclipse.milo.opcua.stack.core.types.structured.MonitoredItemCreateRequest;
import org.eclipse.milo.opcua.stack.core.types.structured.MonitoringParameters;
import org.eclipse.milo.opcua.stack.core.types.structured.ReadValueId;
import org.eclipse.milo.opcua.stack.core.types.builtin.unsigned.UInteger;
import org.eclipse.milo.opcua.stack.core.types.builtin.unsigned.Unsigned;

public class ProductionManager implements tags{
    private String opcServerAddress = "opc.tcp://localhost:4840"; // opc.tcp://192.168.0.122:4840
    private static AtomicLong clientHandles = new AtomicLong(1L);
    // Dataset and log maps
    private HashMap<String, Object> dataset = new HashMap<String, Object>();
    Map<String, ArrayList<Object>> logs = new TreeMap<String, ArrayList<Object>>();{
        logs.put("ProdProcessedCount", new ArrayList<Object>());
        logs.put("Humidity", new ArrayList<Object>());
        logs.put("Temperature", new ArrayList<Object>());
        logs.put("Vibration", new ArrayList<Object>());
        logs.put("ProdDefectiveCount", new ArrayList<Object>());
    };
    private StateTracker stateTracker = new StateTracker();
    private OpcUaClient session = connectToOPCUAServer();

    // Singleton instance
    private static ProductionManager instance = new ProductionManager();
    
    public static ProductionManager getInstance() {
        return instance;
    }
    
    // Constructor
    public ProductionManager () {}

    // Connect to OPCUA server, return a new connected OpcUaClient
    private OpcUaClient connectToOPCUAServer () {
        OpcUaClient client = null;

        try {
            List<EndpointDescription> endpoints = DiscoveryClient.getEndpoints(opcServerAddress).get();
            //EndpointDescription configPoint = EndpointUtil.updateUrl(endpoints.get(0), "192.168.0.122", 4840);
            OpcUaClientConfigBuilder cfg = new OpcUaClientConfigBuilder();
            //cfg.setEndpoint(configPoint);
            cfg.setEndpoint(endpoints.get(0));
            client = OpcUaClient.create(cfg.build());
            client.connect().get();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return client;
    }

    // Read specific endpoint
    private float readEndPoint(String identifier) {
        float readValue = 0;
        try {
            NodeId nodeIdOne = new NodeId(6, identifier);
            DataValue dataValueOne = getInstance().session.readValue(0, TimestampsToReturn.Both, nodeIdOne).get();
            Variant variantOne = dataValueOne.getValue();
            if (variantOne.getValue() == null){
                readValue = 0;
            } else {
                readValue = Float.parseFloat(variantOne.getValue().toString());   
            }     
        } catch (Exception e) {
            e.printStackTrace();
        }
        return readValue;
    }

    // Write to specific endpoint
    private void writeToEndpoint(String identifier, Object value){

        try {
            NodeId nodeId = new NodeId(6, identifier);
            getInstance().connectToOPCUAServer().writeValue(nodeId, DataValue.valueOnly(new Variant(value))).get(); 
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Wait time
    String responseTest = WebRequestHandler.getInstance().getRequest();
    Gson gsonTest = new Gson();
    JsonObject speed = gsonTest.fromJson(responseTest, JsonObject.class);
    double timeSpent = 0;

    private void subscribeToEndpoint(String identifier){
        try {
        // Node to subscribe to and what to read
        NodeId nodeId = new NodeId(6, identifier);
        ReadValueId readValueId = new ReadValueId(nodeId, AttributeId.Value.uid(), null, null);
        // Imporant: client handle must be unique per item
        UInteger clientHandle = Unsigned.uint(clientHandles.getAndIncrement());
        MonitoringParameters parameters = new MonitoringParameters (clientHandle, 1000.0, null, Unsigned.uint(10), true);
        // Creation request
        MonitoredItemCreateRequest request = new MonitoredItemCreateRequest(readValueId, MonitoringMode.Reporting, parameters);
        // Setting the consumer after the subscription creation
        BiConsumer<UaMonitoredItem, Integer> onItemCreated = (item, id) -> item.setValueConsumer(ProductionManager::onSubscriptionValue);
        // Subscribe: create a subscription @ 1000ms
        UaSubscription subscription = getInstance().connectToOPCUAServer().getSubscriptionManager().createSubscription(1000.0).get();
        List<UaMonitoredItem> items = subscription.createMonitoredItems(TimestampsToReturn.Both, Arrays.asList(request), onItemCreated).get();
        for (UaMonitoredItem item : items) {
            if (item.getStatusCode().isGood()) {
                System.out.println("Item created for nodeId=" + item.getReadValueId().getNodeId());
            } else {
                System.out.println("Failed to create item for nodeId=" + item.getReadValueId().getNodeId() + " (status=" + item.getStatusCode() + ")");
            }
        }
        
        timeSpent = ((readEndPoint(statusTags.get("Products"))/speed.get("tfMachineSpeed").getAsFloat())*60000)+6000;
        Thread.sleep((long)timeSpent);

        subscription.deleteMonitoredItems(items);
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    private static void onSubscriptionValue(UaMonitoredItem item, DataValue value) {
        Gson gson = new Gson();
        JsonObject jobj = gson.fromJson(WebRequestHandler.getInstance().getRequest(), JsonObject.class);

        // One time values in map
        getInstance().dataset.put("ProductType", (int) jobj.get("slProductType").getAsFloat());
        getInstance().dataset.put("CurSpeed", getInstance().readEndPoint(tags.statusTags.get("CurSpeed")));
        getInstance().dataset.put("Speed", getInstance().readEndPoint(tags.statusTags.get("Speed")));
        getInstance().dataset.put("BatchId", getInstance().readEndPoint(tags.statusTags.get("BatchId")));
        getInstance().dataset.put("Products", getInstance().readEndPoint(tags.statusTags.get("Products")));
        getInstance().dataset.put("TimeSpent", getInstance().timeSpent);
        getInstance().dataset.put("OEE", getInstance().OEECalculation());
        getInstance().dataset.put("Error", getInstance().errorCalulation());
        getInstance().dataset.put("DateTime", getInstance().currentDate());

        List<Object> list = new ArrayList<Object>(getInstance().stateTracker.trackStates((int) getInstance().readEndPoint(tags.statusTags.get("State"))).entrySet());
        getInstance().dataset.put("StateTracker", list);
        ;
        // Logging values in map
        String identifier = tags.nodeIdMap.get(item.getReadValueId().getNodeId().getIdentifier().toString());
        getInstance().logs.get(identifier).add(value.getValue().getValue());
        getInstance().logs.get("Humidity").add(getInstance().readEndPoint(tags.statusTags.get("Humidity")));
        getInstance().logs.get("Temperature").add(getInstance().readEndPoint(tags.statusTags.get("Temperature")));
        getInstance().logs.get("Vibration").add(getInstance().readEndPoint(tags.statusTags.get("Vibration")));
        getInstance().logs.get("ProdDefectiveCount").add(getInstance().readEndPoint(tags.adminTags.get("ProdDefectiveCount")));
        getInstance().dataset.put("Logs", getInstance().logs);

        // Print into java console
        System.out.println("Subscription value received: item=" + item.getReadValueId().getNodeId() + ", value=" + value.getValue());
        System.out.println("ProductType: " + getInstance().dataset.get("ProductType"));
        System.out.println("CurSpeed: " + getInstance().dataset.get("CurSpeed"));
        System.out.println("Speed: " + getInstance().dataset.get("Speed"));
        System.out.println("BatchId: " + getInstance().dataset.get("BatchId"));
        System.out.println("Products: " + getInstance().dataset.get("Products"));
        System.out.println("TimeSpent: " + getInstance().dataset.get("TimeSpent"));
        System.out.println("OEE: " + getInstance().dataset.get("OEE"));
        System.out.println("Error: " + getInstance().dataset.get("Error"));
        System.out.println("Logs: " + getInstance().dataset.get("Logs"));
        System.out.println("StateTracker" + getInstance().dataset.get("StateTracker"));
        System.out.println("DateTime" + getInstance().dataset.get("DateTime"));

        // Send put request
        WebRequestHandler.getInstance().putRequest(getInstance().dataset);
    }

    // OEE
    private double OEECalculation() {
        float goodCount = getInstance().readEndPoint(statusTags.get("Products")) - getInstance().readEndPoint(tags.adminTags.get("ProdDefectiveCount"));
        double plannedProductionTime =  (((readEndPoint(statusTags.get("Products")) / speed.get("tfMachineSpeed").getAsFloat())*60000))/1000;
        float idealCycleTime = 60 / getInstance().readEndPoint(statusTags.get("Speed"));
        double OEE = ((goodCount * idealCycleTime) / plannedProductionTime) * 100;
        return OEE;
    }
    
    // Error
    private double errorCalulation() {
        float goodCount = getInstance().readEndPoint(statusTags.get("Products")) - getInstance().readEndPoint(tags.adminTags.get("ProdDefectiveCount"));
        float errorCalc = (getInstance().readEndPoint(statusTags.get("Products"))-goodCount);
        return errorCalc;
    }

    // Time and date
    public String currentDate() {
        Date date = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
        return formatter.format(date);     
     }


    // Start production
    public void startProduction(){
        String response = WebRequestHandler.getInstance().getRequest();

        Gson gson = new Gson();
        JsonObject jobj = gson.fromJson(response, JsonObject.class);

        float batchID = jobj.get("tfBatchId").getAsFloat();
        float productType = jobj.get("slProductType").getAsFloat();
        float productAmount = jobj.get("tfProductAmount").getAsFloat(); 
        float machineSpeed = jobj.get("tfMachineSpeed").getAsFloat();

        writeToEndpoint(commandTags.get("CntrlCmd"), cntrlCmds.get("Reset"));  
        writeToEndpoint(commandTags.get("CmdChangeRequest"), true);                    
        writeToEndpoint(commandTags.get("BatchId"), batchID);                 
        writeToEndpoint(commandTags.get("Type"), (float) productType);      
        writeToEndpoint(commandTags.get("Amount"), productAmount);          
        writeToEndpoint(commandTags.get("MachSpeed"), machineSpeed);            
        writeToEndpoint(commandTags.get("CntrlCmd"), cntrlCmds.get("Start"));  
        writeToEndpoint(commandTags.get("CmdChangeRequest"), true);                    

        // Subscribes to the data on ProdProcessedCount
        getInstance().subscribeToEndpoint(adminTags.get("ProdProcessedCount"));
    }
    
    
    // Stop production
    public void stopProduction(){
        writeToEndpoint(commandTags.get("CntrlCmd"), cntrlCmds.get("Stop"));  
        writeToEndpoint(commandTags.get("CmdChangeRequest"), true); 
        getInstance().resetProduction();
    }

    // Clear production
    public void clearProduction(){
        writeToEndpoint(commandTags.get("CntrlCmd"), cntrlCmds.get("Clear")); 
        writeToEndpoint(commandTags.get("CmdChangeRequest"), true);  
        getInstance().resetProduction();
    }

    // Reset production
    public void resetProduction(){
        writeToEndpoint(commandTags.get("CntrlCmd"), cntrlCmds.get("Reset"));  
        writeToEndpoint(commandTags.get("CmdChangeRequest"),true); 
    }

    // Abort production
    public void abortProduction(){
        writeToEndpoint(commandTags.get("CntrlCmd"), cntrlCmds.get("Abort"));  
        writeToEndpoint(commandTags.get("CmdChangeRequest"), true); 
        getInstance().resetProduction();
    }
}
 