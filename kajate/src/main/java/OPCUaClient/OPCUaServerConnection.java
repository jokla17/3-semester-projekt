package OPCUaClient;

import java.util.List;
import org.eclipse.milo.opcua.sdk.client.OpcUaClient;
import org.eclipse.milo.opcua.sdk.client.api.config.OpcUaClientConfigBuilder;
import org.eclipse.milo.opcua.stack.client.DiscoveryClient;
import org.eclipse.milo.opcua.stack.core.types.builtin.DataValue;
import org.eclipse.milo.opcua.stack.core.types.builtin.NodeId;
import org.eclipse.milo.opcua.stack.core.types.builtin.Variant;
import org.eclipse.milo.opcua.stack.core.types.enumerated.TimestampsToReturn;
import org.eclipse.milo.opcua.stack.core.types.structured.EndpointDescription;

public class OPCUaServerConnection {
    private String opcServerAddress = "opc.tcp://localhost:4840";

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

    public static void main(String[] args) {
        OPCUaServerConnection osc = new OPCUaServerConnection();

        System.out.println("ProdProcessedCount: " + osc.readEndPoint(6, "::Program:Cube.Admin.ProdProcessedCount"));
        System.out.println("CurMachSpeed: " + osc.readEndPoint(6, "::Program:Cube.Status.CurMachSpeed"));
    }
}