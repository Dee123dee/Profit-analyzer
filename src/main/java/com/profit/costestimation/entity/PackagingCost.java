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
@Table(name = "packaging_costs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackagingCost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Builder.Default
    @Column(name = "packaging_material_cost", nullable = false, precision = 19, scale = 4)
    private BigDecimal packagingMaterialCost = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "labels_and_printing_cost", nullable = false, precision = 19, scale = 4)
    private BigDecimal labelsAndPrintingCost = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "additional_packaging_cost", nullable = false, precision = 19, scale = 4)
    private BigDecimal additionalPackagingCost = BigDecimal.ZERO;

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

    public BigDecimal getTotalPackagingCost() {
        BigDecimal total = BigDecimal.ZERO;
        if (packagingMaterialCost != null) total = total.add(packagingMaterialCost);
        if (labelsAndPrintingCost != null) total = total.add(labelsAndPrintingCost);
        if (additionalPackagingCost != null) total = total.add(additionalPackagingCost);
        return total;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PackagingCost that)) return false;
        if (id != null && that.id != null) return Objects.equals(id, that.id);
        return Objects.equals(product, that.product) && Objects.equals(effectiveFrom, that.effectiveFrom);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}

