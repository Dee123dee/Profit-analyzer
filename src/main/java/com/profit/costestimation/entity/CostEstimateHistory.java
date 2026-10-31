package com.profit.costestimation.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "cost_estimate_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CostEstimateHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cost_estimate_id", nullable = false)
    private CostEstimate costEstimate;

    @Column(name = "change_trigger", nullable = false, length = 100)
    private String changeTrigger;

    @Column(name = "previous_total_cost", precision = 19, scale = 4)
    private BigDecimal previousTotalCost;

    @Column(name = "new_total_cost", nullable = false, precision = 19, scale = 4)
    private BigDecimal newTotalCost;

    @Column(name = "previous_cost_per_unit", precision = 19, scale = 4)
    private BigDecimal previousCostPerUnit;

    @Column(name = "new_cost_per_unit", nullable = false, precision = 19, scale = 4)
    private BigDecimal newCostPerUnit;

    @Column(name = "previous_profit_per_unit", precision = 19, scale = 4)
    private BigDecimal previousProfitPerUnit;

    @Column(name = "new_profit_per_unit", nullable = false, precision = 19, scale = 4)
    private BigDecimal newProfitPerUnit;

    @Column(name = "previous_profit_margin", precision = 7, scale = 4)
    private BigDecimal previousProfitMargin;

    @Column(name = "new_profit_margin", nullable = false, precision = 7, scale = 4)
    private BigDecimal newProfitMargin;

    @Column(name = "version", nullable = false)
    private Integer version;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CostEstimateHistory that)) return false;
        if (id != null && that.id != null) return Objects.equals(id, that.id);
        return Objects.equals(costEstimate, that.costEstimate) && Objects.equals(createdAt, that.createdAt);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}

