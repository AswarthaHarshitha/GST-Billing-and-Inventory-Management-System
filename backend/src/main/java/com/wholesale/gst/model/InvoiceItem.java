package com.wholesale.gst.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "invoice_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private String productName;      // Snapshot at time of sale
    private String hsnCode;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    private String unit;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal rate;         // Price per unit

    @Column(precision = 10, scale = 2)
    private BigDecimal taxableValue; // quantity * rate

    @Column(precision = 5, scale = 2)
    private BigDecimal gstRate;      // e.g., 5.00

    @Column(precision = 10, scale = 2)
    private BigDecimal cgstRate;     // gstRate / 2

    @Column(precision = 10, scale = 2)
    private BigDecimal sgstRate;     // gstRate / 2

    @Column(precision = 10, scale = 2)
    private BigDecimal igstRate;     // for interstate

    @Column(precision = 10, scale = 2)
    private BigDecimal cgstAmount;

    @Column(precision = 10, scale = 2)
    private BigDecimal sgstAmount;

    @Column(precision = 10, scale = 2)
    private BigDecimal igstAmount;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalAmount;  // taxableValue + all taxes
}
