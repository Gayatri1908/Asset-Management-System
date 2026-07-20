package com.niyati.template;

import static org.junit.jupiter.api.Assertions.fail;

final class FeatureContractPlaceholder {
    private FeatureContractPlaceholder() {}

    static void failFeatureContractTest(String featureKey, String guidance) {
        fail("[NIYATI_TEMPLATE_BASELINE] " + featureKey + " contract test is not implemented yet. " + guidance);
    }
}
