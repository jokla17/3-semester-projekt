package OPCUaClient.JarProducers;

import OPCUaClient.ProductionManager;

public class ResetProduction {
    public static void main(String[] args) {
        ProductionManager client = new ProductionManager();
        client.resetProduction();
    }
}
