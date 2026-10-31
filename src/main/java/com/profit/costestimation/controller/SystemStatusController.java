package com.profit.costestimation.controller;

import com.profit.costestimation.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/system")
public class SystemStatusController {

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemStatus() {
        Map<String, Object> statusDetails = new LinkedHashMap<>();
        statusDetails.put("application", "Product Cost Estimation and Profit Analysis System");
        statusDetails.put("status", "UP");
        statusDetails.put("version", "1.0.0-SNAPSHOT");
        statusDetails.put("timestamp", LocalDateTime.now());
        statusDetails.put("architecture", Map.of(
                "controllerLayer", "Active",
                "serviceLayer", "Configured",
                "repositoryLayer", "Configured",
                "entityLayer", "Configured",
                "dtoLayer", "Active",
                "exceptionHandling", "Active (@RestControllerAdvice)",
                "configurationLayer", "Active"
        ));

        return ResponseEntity.ok(ApiResponse.success(statusDetails, "System is healthy and architecture initialized"));
    }
}

