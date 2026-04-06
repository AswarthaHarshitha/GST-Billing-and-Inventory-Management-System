package com.wholesale.gst.config;

import com.wholesale.gst.model.*;
import com.wholesale.gst.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final ProductRepository productRepo;
    private final CustomerRepository customerRepo;

    @Override
    public void run(String... args) {
        // ── Seed Products ────────────────────────────────────────────────────
        if (productRepo.count() == 0) {
            productRepo.save(Product.builder()
                .name("Sugar").hsnCode("1701").unit("KG")
                .purchasePrice(new BigDecimal("40.00"))
                .sellingPrice(new BigDecimal("45.00"))
                .gstRate(new BigDecimal("5")).stockQty(500)
                .category("FOOD_GRAIN").build());

            productRepo.save(Product.builder()
                .name("Wheat Flour (Atta)").hsnCode("1101").unit("KG")
                .purchasePrice(new BigDecimal("28.00"))
                .sellingPrice(new BigDecimal("32.00"))
                .gstRate(new BigDecimal("0")).stockQty(1000)
                .category("FOOD_GRAIN").build());

            productRepo.save(Product.builder()
                .name("Refined Sunflower Oil").hsnCode("1512").unit("LTR")
                .purchasePrice(new BigDecimal("110.00"))
                .sellingPrice(new BigDecimal("125.00"))
                .gstRate(new BigDecimal("5")).stockQty(200)
                .category("EDIBLE_OIL").build());

            productRepo.save(Product.builder()
                .name("Rice (Sona Masoori)").hsnCode("1006").unit("KG")
                .purchasePrice(new BigDecimal("50.00"))
                .sellingPrice(new BigDecimal("58.00"))
                .gstRate(new BigDecimal("5")).stockQty(800)
                .category("FOOD_GRAIN").build());

            productRepo.save(Product.builder()
                .name("Rice (Basmati)").hsnCode("1006").unit("KG")
                .purchasePrice(new BigDecimal("90.00"))
                .sellingPrice(new BigDecimal("105.00"))
                .gstRate(new BigDecimal("5")).stockQty(300)
                .category("FOOD_GRAIN").build());

            productRepo.save(Product.builder()
                .name("Groundnut Oil").hsnCode("1508").unit("LTR")
                .purchasePrice(new BigDecimal("150.00"))
                .sellingPrice(new BigDecimal("170.00"))
                .gstRate(new BigDecimal("5")).stockQty(150)
                .category("EDIBLE_OIL").build());

            productRepo.save(Product.builder()
                .name("Palm Oil").hsnCode("1511").unit("LTR")
                .purchasePrice(new BigDecimal("95.00"))
                .sellingPrice(new BigDecimal("108.00"))
                .gstRate(new BigDecimal("5")).stockQty(250)
                .category("EDIBLE_OIL").build());

            productRepo.save(Product.builder()
                .name("Salt (Iodised)").hsnCode("2501").unit("KG")
                .purchasePrice(new BigDecimal("12.00"))
                .sellingPrice(new BigDecimal("15.00"))
                .gstRate(new BigDecimal("0")).stockQty(600)
                .category("SPICES").build());
        }

        // ── Seed Customers ───────────────────────────────────────────────────
        if (customerRepo.count() == 0) {
            customerRepo.save(Customer.builder()
                .name("Ravi Kirana Store")
                .phone("9876543210")
                .address("Main Bazaar, Vijayawada, Andhra Pradesh")
                .gstin("37AABCA1234B1Z5")
                .state("Andhra Pradesh").stateCode("37")
                .isGstRegistered(true)
                .creditLimit(50000.0).outstandingAmount(0.0).build());

            customerRepo.save(Customer.builder()
                .name("Lakshmi General Stores")
                .phone("9876543211")
                .address("Gandhi Nagar, Guntur, Andhra Pradesh")
                .state("Andhra Pradesh").stateCode("37")
                .isGstRegistered(false)
                .creditLimit(20000.0).outstandingAmount(5000.0).build());

            customerRepo.save(Customer.builder()
                .name("Sri Venkateshwara Traders")
                .phone("9876543212")
                .address("MG Road, Hyderabad, Telangana")
                .gstin("36AABCT5678C1Z2")
                .state("Telangana").stateCode("36")
                .isGstRegistered(true)
                .creditLimit(100000.0).outstandingAmount(0.0).build());
        }
    }
}
