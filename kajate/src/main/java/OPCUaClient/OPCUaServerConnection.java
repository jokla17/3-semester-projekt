package OPCUaClient;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.Flow.Subscription;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.BiConsumer;
import java.lang.Math;

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

    Object[] parameters = {
        1, //opcode reset
        true, //execute
        (float) 2, //batchId
        (float) 0, //type
        (float) 20, //amount
        (float) 120, //machspeed
        2, //opcode start
        true}; //execute

    public Object[] getParameters() {
        return parameters;
    }

    // Singleton instance
    private static OPCUaServerConnection instance = new OPCUaServerConnection();
    public static OPCUaServerConnection getInstance() {
        return instance;
    }
    
    // Constructor
    public OPCUaServerConnection () {}

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
    private String readEndPoint(int nodeId, String identifier) {
        String readValue = null;

        try {
            NodeId nodeIdOne = new NodeId(nodeId, identifier);
            DataValue dataValueOne = connectToOPCUAServer().readValue(0, TimestampsToReturn.Both, nodeIdOne).get();
            Variant variantOne = dataValueOne.getValue();
            readValue = variantOne.getValue().toString();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return readValue;
    }

    // Write to specific endpoint
    private void writeToEndpoint(int node, String identifier, Object value){
        try {
            NodeId nodeId = new NodeId(node, identifier);
            getInstance().connectToOPCUAServer().writeValue(nodeId, DataValue.valueOnly(new Variant(value))).get(); 
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static AtomicLong clientHandles = new AtomicLong(1L);

    private void subscribeToEndpoint(int node, String identifier){
        try {
        Thread.sleep(1000);
        // Node to subscribe to and what to read
        NodeId nodeId = new NodeId(node, identifier);
        ReadValueId readValueId = new ReadValueId(nodeId, AttributeId.Value.uid(), null, null);

        // Imporant: client handle must be unique per item
        UInteger clientHandle = Unsigned.uint(clientHandles.getAndIncrement());
        MonitoringParameters parameters = new MonitoringParameters (
            clientHandle,
            1000.0,
            null,
            Unsigned.uint(10),
            true
        );
        
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
        System.out.println("Subscription value received: item=" + item.getReadValueId().getNodeId() + ", value=" + value.getValue());
    }

    public void startProduction(/* maybe give input parameters at a later point */){
        getInstance().writeToEndpoint(6, "::Program:Cube.Command.CntrlCmd", getInstance().getParameters()[0]);
        getInstance().writeToEndpoint(6, "::Program:Cube.Command.CmdChangeRequest", getInstance().getParameters()[1]);
        getInstance().writeToEndpoint(6, "::Program:Cube.Command.Parameter[0].Value", getInstance().getParameters()[2]); // batch id
        getInstance().writeToEndpoint(6, "::Program:Cube.Command.Parameter[1].Value", getInstance().getParameters()[3]); // beer type
        getInstance().writeToEndpoint(6, "::Program:Cube.Command.Parameter[2].Value", getInstance().getParameters()[4]); // amount to produce
        getInstance().writeToEndpoint(6, "::Program:Cube.Command.MachSpeed", getInstance().getParameters()[5]); // Machine speed
        getInstance().writeToEndpoint(6, "::Program:Cube.Command.CntrlCmd", getInstance().getParameters()[6]);
        getInstance().writeToEndpoint(6, "::Program:Cube.Command.CmdChangeRequest", getInstance().getParameters()[7]);
    }
    
    public static void main (String[]args){
        getInstance().writeToEndpoint(6, "::Program:Cube.Command.CntrlCmd", getInstance().getParameters()[0]);
        getInstance().writeToEndpoint(6, "::Program:Cube.Command.CmdChangeRequest", getInstance().getParameters()[1]);
        getInstance().writeToEndpoint(6, "::Program:Cube.Command.Parameter[0].Value", getInstance().getParameters()[2]); // batch id
        getInstance().writeToEndpoint(6, "::Program:Cube.Command.Parameter[1].Value", getInstance().getParameters()[3]); // beer type
        getInstance().writeToEndpoint(6, "::Program:Cube.Command.Parameter[2].Value", getInstance().getParameters()[4]); // amount to produce
        getInstance().writeToEndpoint(6, "::Program:Cube.Command.MachSpeed", getInstance().getParameters()[5]); // Machine speed
        getInstance().writeToEndpoint(6, "::Program:Cube.Command.CntrlCmd", getInstance().getParameters()[6]);
        getInstance().writeToEndpoint(6, "::Program:Cube.Command.CmdChangeRequest", getInstance().getParameters()[7]);
    
        getInstance().subscribeToEndpoint(6, "::Program:Cube.Admin.ProdProcessedCount"); //subscribes to the data on ProdProcessedCount
        
    }
}
 