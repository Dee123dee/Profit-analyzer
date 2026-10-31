package com.profit.costestimation.entity;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "cost_estimates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CostEstimate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "batch_quantity", nullable = false, precision = 19, scale = 4)
    private BigDecimal batchQuantity;

    @Builder.Default
    @Column(name = "raw_material_cost", nullable = false, precision = 19, scale = 4)
    private BigDecimal rawMaterialCost = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "manufacturing_cost", nullable = false, precision = 19, scale = 4)
    private BigDecimal manufacturingCost = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "machine_cost", nullable = false, precision = 19, scale = 4)
    private BigDecimal machineCost = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "packaging_cost", nullable = false, precision = 19, scale = 4)
    private BigDecimal packagingCost = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "sterilisation_cost", nullable = false, precision = 19, scale = 4)
    private BigDecimal sterilisationCost = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_production_cost", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalProductionCost = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "cost_per_unit", nullable = false, precision = 19, scale = 4)
    private BigDecimal costPerUnit = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "selling_price_per_unit", nullable = false, precision = 19, scale = 4)
    private BigDecimal sellingPricePerUnit = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "profit_per_unit", nullable = false, precision = 19, scale = 4)
    private BigDecimal profitPerUnit = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_profit", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalProfit = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "profit_margin_percentage", nullable = false, precision = 7, scale = 4)
    private BigDecimal profitMarginPercentage = BigDecimal.ZERO;

    @Column(name = "calculation_breakdown", columnDefinition = "TEXT")
    private String calculationBreakdown;

    @Builder.Default
    @Column(name = "version", nullable = false)
    private Integer version = 1;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private EstimateStatus status = EstimateStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @OneToMany(mappedBy = "costEstimate", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CostEstimateHistory> histories = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CostEstimate that)) return false;
        if (id != null && that.id != null) return Objects.equals(id, that.id);
        return Objects.equals(product, that.product) && Objects.equals(version, that.version);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}

