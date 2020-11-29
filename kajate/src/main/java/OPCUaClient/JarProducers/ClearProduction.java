package OPCUaClient.JarProducers;

import OPCUaClient.ProductionManager;

public class ClearProduction {
    public static void main(String[] args) {
        ProductionManager client = new ProductionManager();
        client.clearProduction();
    }
}
