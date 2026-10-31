-- =============================================================================
-- Migration: V1__init_schema.sql
-- Description: Initial schema for Product Cost Estimation and Profit Analysis System
-- Engine: PostgreSQL 14+ compatible (with H2 PostgreSQL-mode compatibility)
-- Precision Standard: Monetary and Quantities NUMERIC(19,4), Percentages NUMERIC(7,4)
-- =============================================================================

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    product_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    selling_price_per_unit NUMERIC(19, 4) NOT NULL,
    default_batch_quantity NUMERIC(19, 4) NOT NULL DEFAULT 1.0000,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_products_selling_price CHECK (selling_price_per_unit >= 0),
    CONSTRAINT chk_products_batch_qty CHECK (default_batch_quantity > 0)
);

CREATE INDEX idx_products_code ON products(product_code);
CREATE INDEX idx_products_status ON products(status);

-- 2. Raw Materials Table
CREATE TABLE IF NOT EXISTS raw_materials (
    id BIGSERIAL PRIMARY KEY,
    material_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL,
    material_type VARCHAR(20) NOT NULL DEFAULT 'DOMESTIC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_materials_type CHECK (material_type IN ('DOMESTIC', 'IMPORTED'))
);

CREATE INDEX idx_materials_code ON raw_materials(material_code);
CREATE INDEX idx_materials_type ON raw_materials(material_type);

-- 3. Product Materials (Bill of Materials - BOM Association)
CREATE TABLE IF NOT EXISTS product_materials (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    raw_material_id BIGINT NOT NULL,
    quantity NUMERIC(19, 4) NOT NULL,
    scrap_percentage NUMERIC(7, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pm_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_pm_material FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id) ON DELETE RESTRICT,
    CONSTRAINT uq_product_material UNIQUE (product_id, raw_material_id),
    CONSTRAINT chk_pm_quantity CHECK (quantity > 0),
    CONSTRAINT chk_pm_scrap CHECK (scrap_percentage >= 0 AND scrap_percentage <= 100)
);

CREATE INDEX idx_pm_product_id ON product_materials(product_id);
CREATE INDEX idx_pm_material_id ON product_materials(raw_material_id);

-- 4. Currency Exchange Rates Table
CREATE TABLE IF NOT EXISTS currency_exchange_rates (
    id BIGSERIAL PRIMARY KEY,
    currency_code VARCHAR(3) NOT NULL,
    rate_to_inr NUMERIC(19, 4) NOT NULL,
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    source VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_exchange_rate CHECK (rate_to_inr > 0),
    CONSTRAINT chk_exchange_source CHECK (source IN ('MANUAL', 'API'))
);

CREATE INDEX idx_cer_code ON currency_exchange_rates(currency_code);
CREATE INDEX idx_cer_effective ON currency_exchange_rates(currency_code, effective_from, effective_to);

-- 5. Material Prices Table (Historical Pricing with Currency and Landed Overhead)
CREATE TABLE IF NOT EXISTS material_prices (
    id BIGSERIAL PRIMARY KEY,
    raw_material_id BIGINT NOT NULL,
    unit_price NUMERIC(19, 4) NOT NULL,
    currency_code VARCHAR(3) NOT NULL DEFAULT 'INR',
    exchange_rate_used NUMERIC(19, 4) NOT NULL DEFAULT 1.0000,
    freight_cost NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    import_duty_percentage NUMERIC(7, 4) NOT NULL DEFAULT 0.0000,
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mp_material FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id) ON DELETE CASCADE,
    CONSTRAINT chk_mp_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_mp_exchange_rate CHECK (exchange_rate_used > 0),
    CONSTRAINT chk_mp_freight CHECK (freight_cost >= 0),
    CONSTRAINT chk_mp_duty CHECK (import_duty_percentage >= 0 AND import_duty_percentage <= 100)
);

CREATE INDEX idx_mp_material_id ON material_prices(raw_material_id);
CREATE INDEX idx_mp_effective ON material_prices(raw_material_id, effective_from, effective_to);

-- 6. Manufacturing Costs Table
CREATE TABLE IF NOT EXISTS manufacturing_costs (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    labour_cost NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    operational_cost NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    other_manufacturing_cost NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mc_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT chk_mc_labour CHECK (labour_cost >= 0),
    CONSTRAINT chk_mc_operational CHECK (operational_cost >= 0),
    CONSTRAINT chk_mc_other CHECK (other_manufacturing_cost >= 0)
);

CREATE INDEX idx_mc_product_id ON manufacturing_costs(product_id);
CREATE INDEX idx_mc_effective ON manufacturing_costs(product_id, effective_from, effective_to);

-- 7. Machine Costs Table
CREATE TABLE IF NOT EXISTS machine_costs (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    machine_depreciation_cost NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    machine_operating_cost NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    maintenance_cost NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    power_consumption_cost NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    allocation_type VARCHAR(20) NOT NULL DEFAULT 'PER_UNIT',
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mach_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT chk_mach_depreciation CHECK (machine_depreciation_cost >= 0),
    CONSTRAINT chk_mach_operating CHECK (machine_operating_cost >= 0),
    CONSTRAINT chk_mach_maintenance CHECK (maintenance_cost >= 0),
    CONSTRAINT chk_mach_power CHECK (power_consumption_cost >= 0),
    CONSTRAINT chk_mach_allocation CHECK (allocation_type IN ('PER_UNIT', 'PER_BATCH'))
);

CREATE INDEX idx_mach_product_id ON machine_costs(product_id);
CREATE INDEX idx_mach_effective ON machine_costs(product_id, effective_from, effective_to);

-- 8. Packaging Costs Table
CREATE TABLE IF NOT EXISTS packaging_costs (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    packaging_material_cost NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    labels_and_printing_cost NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    additional_packaging_cost NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pack_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT chk_pack_material CHECK (packaging_material_cost >= 0),
    CONSTRAINT chk_pack_labels CHECK (labels_and_printing_cost >= 0),
    CONSTRAINT chk_pack_additional CHECK (additional_packaging_cost >= 0)
);

CREATE INDEX idx_pack_product_id ON packaging_costs(product_id);
CREATE INDEX idx_pack_effective ON packaging_costs(product_id, effective_from, effective_to);

-- 9. Sterilisation Costs Table
CREATE TABLE IF NOT EXISTS sterilisation_costs (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    process_charge NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    equipment_usage_charge NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    other_sterilisation_expense NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ster_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT chk_ster_process CHECK (process_charge >= 0),
    CONSTRAINT chk_ster_equipment CHECK (equipment_usage_charge >= 0),
    CONSTRAINT chk_ster_other CHECK (other_sterilisation_expense >= 0)
);

CREATE INDEX idx_ster_product_id ON sterilisation_costs(product_id);
CREATE INDEX idx_ster_effective ON sterilisation_costs(product_id, effective_from, effective_to);

-- 10. Cost Estimates Table
CREATE TABLE IF NOT EXISTS cost_estimates (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    batch_quantity NUMERIC(19, 4) NOT NULL,
    raw_material_cost NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    manufacturing_cost NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    machine_cost NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    packaging_cost NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    sterilisation_cost NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    total_production_cost NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    cost_per_unit NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    selling_price_per_unit NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    profit_per_unit NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    total_profit NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    profit_margin_percentage NUMERIC(7, 4) NOT NULL DEFAULT 0.0000,
    calculation_breakdown TEXT,
    version INT NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_est_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT chk_est_batch_qty CHECK (batch_quantity > 0),
    CONSTRAINT chk_est_version CHECK (version > 0),
    CONSTRAINT chk_est_status CHECK (status IN ('ACTIVE', 'ARCHIVED', 'SUPERSEDED'))
);

CREATE INDEX idx_est_product_id ON cost_estimates(product_id);
CREATE INDEX idx_est_status ON cost_estimates(product_id, status);
CREATE INDEX idx_est_version ON cost_estimates(product_id, version);

-- 11. Cost Estimate History Table (Tracking Dynamic Changes & Audit Trails)
CREATE TABLE IF NOT EXISTS cost_estimate_history (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    cost_estimate_id BIGINT NOT NULL,
    change_trigger VARCHAR(100) NOT NULL,
    previous_total_cost NUMERIC(19, 4),
    new_total_cost NUMERIC(19, 4) NOT NULL,
    previous_cost_per_unit NUMERIC(19, 4),
    new_cost_per_unit NUMERIC(19, 4) NOT NULL,
    previous_profit_per_unit NUMERIC(19, 4),
    new_profit_per_unit NUMERIC(19, 4) NOT NULL,
    previous_profit_margin NUMERIC(7, 4),
    new_profit_margin NUMERIC(7, 4) NOT NULL,
    version INT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ceh_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_ceh_estimate FOREIGN KEY (cost_estimate_id) REFERENCES cost_estimates(id) ON DELETE CASCADE
);

CREATE INDEX idx_ceh_product_id ON cost_estimate_history(product_id);
CREATE INDEX idx_ceh_estimate_id ON cost_estimate_history(cost_estimate_id);

