package OPCUaClient;

public class ClearProduction {
    public static void main(String[] args) {
        OPCUaServerConnection client = new OPCUaServerConnection();
        client.clearProduction();
    }
}
