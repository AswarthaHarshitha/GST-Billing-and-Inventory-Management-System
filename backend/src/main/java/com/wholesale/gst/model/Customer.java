package com.wholesale.gst.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String phone;
    private String email;

    @Column(length = 1000)
    private String address;

    private String gstin;        // Customer GSTIN (if registered)
    private String state;        // For IGST vs CGST+SGST determination
    private String stateCode;    // 2-digit state code

    private Boolean isGstRegistered;
    private Double creditLimit;
    private Double outstandingAmount;
}
