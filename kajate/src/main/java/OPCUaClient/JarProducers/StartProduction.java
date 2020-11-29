package OPCUaClient.JarProducers;

import OPCUaClient.ProductionManager;

public class StartProduction {
    public static void main(String[] args) {
        ProductionManager client = new ProductionManager();
        client.startProduction();
    }
}
