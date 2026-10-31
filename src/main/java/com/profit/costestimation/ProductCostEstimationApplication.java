package com.profit.costestimation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class ProductCostEstimationApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProductCostEstimationApplication.class, args);
    }
}

