package OPCUaClient.JarProducers;

import OPCUaClient.ProductionManager;

public class AbortProduction {
    public static void main(String[] args) {
        ProductionManager client = new ProductionManager();
        client.abortProduction();
    }
}
