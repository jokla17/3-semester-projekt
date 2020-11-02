package OPCUaClient;

public class StopProduction {
    public static void main(String[] args) {
        OPCUaServerConnection client = new OPCUaServerConnection();
        client.stopProduction();;
    }
}
