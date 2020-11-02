package OPCUaClient;

public class ResetProduction {
    public static void main(String[] args) {
        OPCUaServerConnection client = new OPCUaServerConnection();
        client.resetProduction();
    }
}
