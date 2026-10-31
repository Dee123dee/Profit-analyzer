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
@Table(name = "sterilisation_costs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SterilisationCost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Builder.Default
    @Column(name = "process_charge", nullable = false, precision = 19, scale = 4)
    private BigDecimal processCharge = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "equipment_usage_charge", nullable = false, precision = 19, scale = 4)
    private BigDecimal equipmentUsageCharge = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "other_sterilisation_expense", nullable = false, precision = 19, scale = 4)
    private BigDecimal otherSterilisationExpense = BigDecimal.ZERO;

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

    public BigDecimal getTotalSterilisationCost() {
        BigDecimal total = BigDecimal.ZERO;
        if (processCharge != null) total = total.add(processCharge);
        if (equipmentUsageCharge != null) total = total.add(equipmentUsageCharge);
        if (otherSterilisationExpense != null) total = total.add(otherSterilisationExpense);
        return total;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SterilisationCost that)) return false;
        if (id != null && that.id != null) return Objects.equals(id, that.id);
        return Objects.equals(product, that.product) && Objects.equals(effectiveFrom, that.effectiveFrom);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}

