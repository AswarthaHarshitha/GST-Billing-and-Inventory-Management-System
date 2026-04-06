package com.wholesale.gst.repository;

import com.wholesale.gst.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

// ── Product Repository ──────────────────────────────────────────────────────
interface ProductRepo extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);
    List<Product> findByStockQtyLessThan(int qty);
}

// ── Customer Repository ─────────────────────────────────────────────────────
interface CustomerRepo extends JpaRepository<Customer, Long> {
    List<Customer> findByNameContainingIgnoreCase(String name);
    Optional<Customer> findByGstin(String gstin);
}

// ── Invoice Repository ──────────────────────────────────────────────────────
interface InvoiceRepo extends JpaRepository<Invoice, Long> {

    List<Invoice> findByInvoiceDateBetween(LocalDate from, LocalDate to);

    List<Invoice> findByCustomer_Id(Long customerId);

    @Query("SELECT MAX(i.invoiceNumber) FROM Invoice i WHERE i.invoiceNumber LIKE 'INV-%'")
    Optional<String> findLatestInvoiceNumber();

    @Query("SELECT i FROM Invoice i WHERE i.invoiceDate BETWEEN :from AND :to AND i.supplyType = :type")
    List<Invoice> findByDateRangeAndSupplyType(
        @Param("from") LocalDate from,
        @Param("to") LocalDate to,
        @Param("type") String type
    );

    @Query("SELECT SUM(i.grandTotal) FROM Invoice i WHERE i.invoiceDate BETWEEN :from AND :to")
    Double totalSalesBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT SUM(i.cgstAmount + i.sgstAmount + i.igstAmount) FROM Invoice i WHERE i.invoiceDate BETWEEN :from AND :to")
    Double totalTaxBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);
}

// ── InvoiceItem Repository ──────────────────────────────────────────────────
interface InvoiceItemRepo extends JpaRepository<InvoiceItem, Long> {
    List<InvoiceItem> findByInvoice_Id(Long invoiceId);
}
