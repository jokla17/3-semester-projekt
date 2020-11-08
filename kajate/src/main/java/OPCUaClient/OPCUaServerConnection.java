package OPCUaClient;

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

public class OPCUaServerConnection {
    private String opcServerAddress = "opc.tcp://localhost:4840";
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

    private OpcUaClient OpcClient = connectToOPCUAServer();

    // Singleton instance
    private static OPCUaServerConnection instance = new OPCUaServerConnection();
    
    public static OPCUaServerConnection getInstance() {
        return instance;
    }
    
    // Constructor
    public OPCUaServerConnection () {}

    //All tags, nodeidentifiers maps to readable string
    HashMap<String, String> nodeIdMap = new HashMap<String, String>();
    {{
        nodeIdMap.put("::Program:Cube.Admin.ProdProcessedCount",    "ProdProcessedCount");
        nodeIdMap.put("::Program:Cube.Admin.ProdDefectiveCount",    "ProdDefectiveCount");
        nodeIdMap.put("::Program:Cube.Admin.StopReason.Id",         "StopReasonId");
        nodeIdMap.put("::Program:Cube.Admin.StopReason.Value",      "StopReasonValue");
        nodeIdMap.put("::Program:Cube.Admin.Parameter[0]",          "ProductId");

        nodeIdMap.put("::Program:Cube.Status.StateCurrent",         "State");
        nodeIdMap.put("::Program:Cube.Status.MachSpeed",            "Speed");
        nodeIdMap.put("::Program:Cube.Status.CurMachSpeed",         "CurSpeed");
        nodeIdMap.put("::Program:Cube.Status.Parameter[0]",         "BatchId");
        nodeIdMap.put("::Program:Cube.Status.Parameter[1]",         "Products");
        nodeIdMap.put("::Program:Cube.Status.Parameter[2]",         "Humidity");
        nodeIdMap.put("::Program:Cube.Status.Parameter[3]",         "Temperature");
        nodeIdMap.put("::Program:Cube.Status.Parameter[4]",         "Vibration");

        nodeIdMap.put( "::Program:Cube.Command.Parameter[0].Value", "SetBatchId");
        nodeIdMap.put( "::Program:Cube.Command.Parameter[1].Value", "SetType");
        nodeIdMap.put( "::Program:Cube.Command.Parameter[2].Value", "SetAmount");
        nodeIdMap.put( "::Program:Cube.Command.CntrlCmd",           "SetCntrlCmd");
        nodeIdMap.put( "::Program:Cube.Command.CmdChangeRequest",   "SetCmdChangeRequest");
        nodeIdMap.put( "::Program:Cube.Command.MachSpeed",          "SetMachSpeed");
    }};

    //Misc tags *read-only
    HashMap<String, String> adminTags = new HashMap<String, String>();
    {{
        adminTags.put("ProdProcessedCount",     "::Program:Cube.Admin.ProdProcessedCount"); //Total amount of produced products
        adminTags.put("ProdDefectiveCount",     "::Program:Cube.Admin.ProdDefectiveCount"); //Total amount of defective products
        adminTags.put("StopReasonId",           "::Program:Cube.Admin.StopReason.Id");      //[10]Empty Inventory;[11]Maintenance Needed;[12]Manual Stop;[13]Motor Power Loss;[14]Manual Abort
        adminTags.put("StopReasonValue",        "::Program:Cube.Admin.StopReason.Value");   //not sure.. could be the descriptions that fit the above id's
        adminTags.put("ProductId",              "::Program:Cube.Admin.Parameter[0]");       //Id of product in batch
    }};

    //PackTags for reading values *read-only
    HashMap<String, String> statusTags = new HashMap<String, String>();
    {{
        statusTags.put("State",         "::Program:Cube.Status.StateCurrent");  //Current state
        statusTags.put("Speed",         "::Program:Cube.Status.MachSpeed");     //Current machine speed in products per minute
        statusTags.put("CurSpeed",      "::Program:Cube.Status.CurMachSpeed");  //Normalized machine speed (0-100)
        statusTags.put("BatchId",       "::Program:Cube.Status.Parameter[0].Value");  //Current batch id
        statusTags.put("Products",      "::Program:Cube.Status.Parameter[1].Value");  //Products in current batch
        statusTags.put("Humidity",      "::Program:Cube.Status.Parameter[2].Value");  //Relative humidity
        statusTags.put("Temperature",   "::Program:Cube.Status.Parameter[3].Value");  //Temperature
        statusTags.put("Vibration",     "::Program:Cube.Status.Parameter[4].Value");  //Vibration
    }};

    //PackTags for writing commands *read-write
    HashMap<String, String> commandTags = new HashMap<String, String>();
    {{
        commandTags.put("BatchId",          "::Program:Cube.Command.Parameter[0].Value");   //float | Id for the next batch
        commandTags.put("Type",             "::Program:Cube.Command.Parameter[1].Value");   //float | Type of next batch | [0]pilsner;[1]wheat;[2]IPA;[3]Stout;[4]Ale;[5]Alcohol-free
        commandTags.put("Amount",           "::Program:Cube.Command.Parameter[2].Value");   //float | Amount of products in the next batch
        commandTags.put("CntrlCmd",         "::Program:Cube.Command.CntrlCmd");             //int | [1]reset;[2]start;[3]stop;[4]abort;[5]clear
        commandTags.put("CmdChangeRequest", "::Program:Cube.Command.CmdChangeRequest");     //bool | [true]starts system with given inputs;[false]idle
        commandTags.put("MachSpeed",        "::Program:Cube.Command.MachSpeed");            //float | BEWARE of different beer types
    }};

    HashMap<String, Integer> cntrlCmds = new HashMap <String, Integer>();
    {{
        cntrlCmds.put("Reset", 1);
        cntrlCmds.put("Start", 2);
        cntrlCmds.put("Stop", 3);
        cntrlCmds.put("Abort", 4);
        cntrlCmds.put("Clear", 5);
    }};

    // Connect to OPCUA server, return a new connected OpcUaClient
    private OpcUaClient connectToOPCUAServer () {
        OpcUaClient client = null;

        try {
            List<EndpointDescription> endpoints = DiscoveryClient.getEndpoints(opcServerAddress).get();
            OpcUaClientConfigBuilder cfg = new OpcUaClientConfigBuilder();
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
            DataValue dataValueOne = getInstance().OpcClient.readValue(0, TimestampsToReturn.Both, nodeIdOne).get();
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

    private void subscribeToEndpoint(String identifier){
        try {
        Thread.sleep(1000);
        // Node to subscribe to and what to read
        NodeId nodeId = new NodeId(6, identifier);
        ReadValueId readValueId = new ReadValueId(nodeId, AttributeId.Value.uid(), null, null);
        // Imporant: client handle must be unique per item
        UInteger clientHandle = Unsigned.uint(clientHandles.getAndIncrement());
        MonitoringParameters parameters = new MonitoringParameters (clientHandle, 1000.0, null, Unsigned.uint(10), true);
        // Creation request
        MonitoredItemCreateRequest request = new MonitoredItemCreateRequest(readValueId, MonitoringMode.Reporting, parameters);
        // Setting the consumer after the subscription creation
        BiConsumer<UaMonitoredItem, Integer> onItemCreated = (item, id) -> item.setValueConsumer(OPCUaServerConnection::onSubscriptionValue);
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
        
        Thread.sleep(30000);
        //Thread.sleep(Math.round((float) getInstance().getParameters()[4]) / 60 * 1000); // Sleep (1500 is 1.5 sec)
        subscription.deleteMonitoredItems(items);
        } catch (Exception ex) {
            ex.printStackTrace();
        }

    }

    private static void onSubscriptionValue(UaMonitoredItem item, DataValue value) {
        // One time values in map
        getInstance().dataset.put("CurSpeed", getInstance().readEndPoint(getInstance().statusTags.get("CurSpeed")));
        getInstance().dataset.put("Speed", getInstance().readEndPoint(getInstance().statusTags.get("Speed")));
        getInstance().dataset.put("BatchId", getInstance().readEndPoint(getInstance().statusTags.get("BatchId")));
        getInstance().dataset.put("Products", getInstance().readEndPoint(getInstance().statusTags.get("Products")));

        // Logging values in map
        String identifier = getInstance().nodeIdMap.get(item.getReadValueId().getNodeId().getIdentifier().toString());
        getInstance().logs.get(identifier).add(value.getValue().getValue());
        getInstance().logs.get("Humidity").add(getInstance().readEndPoint(getInstance().statusTags.get("Humidity")));
        getInstance().logs.get("Temperature").add(getInstance().readEndPoint(getInstance().statusTags.get("Temperature")));
        getInstance().logs.get("Vibration").add(getInstance().readEndPoint(getInstance().statusTags.get("Vibration")));
        getInstance().logs.get("ProdDefectiveCount").add(getInstance().readEndPoint(getInstance().adminTags.get("ProdDefectiveCount")));
        getInstance().dataset.put("Logs", getInstance().logs);

        // Print into java console
        System.out.println("Subscription value received: item=" + item.getReadValueId().getNodeId() + ", value=" + value.getValue());
        System.out.println("CurSpeed: " + getInstance().dataset.get("CurSpeed"));
        System.out.println("Speed: " + getInstance().dataset.get("Speed"));
        System.out.println("BatchId: " + getInstance().dataset.get("BatchId"));
        System.out.println("Products: " + getInstance().dataset.get("Products"));
        System.out.println("Logs: " + getInstance().dataset.get("Logs"));

        // Send put request
        WebRequestHandler.getInstance().putRequest(getInstance().dataset);
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
 