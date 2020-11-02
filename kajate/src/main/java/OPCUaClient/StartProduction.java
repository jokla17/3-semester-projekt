package OPCUaClient;

public class StartProduction {
    public static void main(String[] args) {
        OPCUaServerConnection client = new OPCUaServerConnection();
        client.startProduction();
    }
}
