package com.wholesale.gst.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;         // e.g., Sugar, Atta, Oil, Rice

    @Column(nullable = false)
    private String hsnCode;      // HSN code for GST

    private String unit;         // KG, LTR, BAG, QUINTAL

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal purchasePrice;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal sellingPrice;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal gstRate;  // 0, 5, 12, 18, 28

    @Column(nullable = false)
    private Integer stockQty;

    private String category;     // FOOD_GRAIN, EDIBLE_OIL, etc.
}
