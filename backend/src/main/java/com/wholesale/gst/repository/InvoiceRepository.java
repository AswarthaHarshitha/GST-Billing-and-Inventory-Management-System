package com.wholesale.gst.repository;

import com.wholesale.gst.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findByInvoiceDateBetween(LocalDate from, LocalDate to);

    List<Invoice> findByCustomer_Id(Long customerId);

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    @Query("SELECT MAX(i.id) FROM Invoice i")
    Optional<Long> findMaxId();

    @Query("SELECT COALESCE(SUM(i.grandTotal), 0) FROM Invoice i WHERE i.invoiceDate BETWEEN :from AND :to")
    Double totalSalesBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(i.cgstAmount + i.sgstAmount + i.igstAmount), 0) FROM Invoice i WHERE i.invoiceDate BETWEEN :from AND :to")
    Double totalTaxBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(i.cgstAmount), 0) FROM Invoice i WHERE i.invoiceDate BETWEEN :from AND :to")
    Double totalCgstBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(i.sgstAmount), 0) FROM Invoice i WHERE i.invoiceDate BETWEEN :from AND :to")
    Double totalSgstBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(i.igstAmount), 0) FROM Invoice i WHERE i.invoiceDate BETWEEN :from AND :to")
    Double totalIgstBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(i.subtotal), 0) FROM Invoice i WHERE i.invoiceDate BETWEEN :from AND :to")
    Double totalTaxableValueBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    long countByInvoiceDateBetween(LocalDate from, LocalDate to);
}
