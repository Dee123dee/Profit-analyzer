package com.profit.costestimation.config;

import org.springframework.context.annotation.Configuration;

import java.math.RoundingMode;

/**
 * Global application configuration and financial calculation standards.
 */
@Configuration
public class AppConfig {

    /**
     * Standard rounding mode for all monetary and financial calculations.
     */
    public static final RoundingMode FINANCIAL_ROUNDING_MODE = RoundingMode.HALF_UP;

    /**
     * Standard scale for final currency amounts (e.g. INR values).
     */
    public static final int CURRENCY_SCALE = 2;

    /**
     * Standard scale for intermediate calculations and unit rates.
     */
    public static final int INTERMEDIATE_CALCULATION_SCALE = 4;

    /**
     * Standard scale for percentage values (e.g., profit margin %).
     */
    public static final int PERCENTAGE_SCALE = 2;
}

