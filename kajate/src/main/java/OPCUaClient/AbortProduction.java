package OPCUaClient;

public class AbortProduction {
    public static void main(String[] args) {
        OPCUaServerConnection client = new OPCUaServerConnection();
        client.abortProduction();
    }
}
