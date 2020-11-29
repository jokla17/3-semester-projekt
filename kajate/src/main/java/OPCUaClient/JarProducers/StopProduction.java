package OPCUaClient.JarProducers;

import OPCUaClient.ProductionManager;

public class StopProduction {
    public static void main(String[] args) {
        ProductionManager client = new ProductionManager();
        client.stopProduction();
    }
}
