package com.profit.costestimation.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "machine_costs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MachineCost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Builder.Default
    @Column(name = "machine_depreciation_cost", nullable = false, precision = 19, scale = 4)
    private BigDecimal machineDepreciationCost = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "machine_operating_cost", nullable = false, precision = 19, scale = 4)
    private BigDecimal machineOperatingCost = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "maintenance_cost", nullable = false, precision = 19, scale = 4)
    private BigDecimal maintenanceCost = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "power_consumption_cost", nullable = false, precision = 19, scale = 4)
    private BigDecimal powerConsumptionCost = BigDecimal.ZERO;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "allocation_type", nullable = false, length = 20)
    private MachineCostAllocation allocationType = MachineCostAllocation.PER_UNIT;

    @Column(name = "effective_from", nullable = false)
    private LocalDateTime effectiveFrom;

    @Column(name = "effective_to")
    private LocalDateTime effectiveTo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public BigDecimal getTotalMachineExpense() {
        BigDecimal total = BigDecimal.ZERO;
        if (machineDepreciationCost != null) total = total.add(machineDepreciationCost);
        if (machineOperatingCost != null) total = total.add(machineOperatingCost);
        if (maintenanceCost != null) total = total.add(maintenanceCost);
        if (powerConsumptionCost != null) total = total.add(powerConsumptionCost);
        return total;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof MachineCost that)) return false;
        if (id != null && that.id != null) return Objects.equals(id, that.id);
        return Objects.equals(product, that.product) && Objects.equals(effectiveFrom, that.effectiveFrom);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}

