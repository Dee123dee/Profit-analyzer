package com.profit.costestimation;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ProductCostEstimationApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Context Loads Successfully")
    void contextLoads() {
    }

    @Test
    @DisplayName("System Status API returns HTTP 200 with architecture layers")
    void shouldReturnSystemStatus() throws Exception {
        mockMvc.perform(get("/api/v1/system/status")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("UP"))
                .andExpect(jsonPath("$.data.application").value("Product Cost Estimation and Profit Analysis System"))
                .andExpect(jsonPath("$.data.architecture.exceptionHandling").value("Active (@RestControllerAdvice)"));
    }
}

