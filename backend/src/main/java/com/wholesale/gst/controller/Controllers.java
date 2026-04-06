package com.wholesale.gst.controller;

import com.wholesale.gst.model.*;
import com.wholesale.gst.repository.*;
import com.wholesale.gst.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

// ─── Product Controller ──────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
class ProductController {

    private final ProductRepository productRepo;

    @GetMapping
    public List<Product> all() { return productRepo.findAll(); }

    @GetMapping("/{id}")
    public Product one(@PathVariable Long id) {
        return productRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @PostMapping
    public Product create(@RequestBody Product product) {
        return productRepo.save(product);
    }

    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @RequestBody Product updated) {
        updated.setId(id);
        return productRepo.save(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        productRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    @GetMapping("/low-stock")
    public List<Product> lowStock() {
        return productRepo.findByStockQtyLessThan(10);
    }

    @GetMapping("/search")
    public List<Product> search(@RequestParam String q) {
        return productRepo.findByNameContainingIgnoreCase(q);
    }
}

// ─── Customer Controller ─────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
class CustomerController {

    private final CustomerRepository customerRepo;

    @GetMapping
    public List<Customer> all() { return customerRepo.findAll(); }

    @GetMapping("/{id}")
    public Customer one(@PathVariable Long id) {
        return customerRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    @PostMapping
    public Customer create(@RequestBody Customer customer) {
        return customerRepo.save(customer);
    }

    @PutMapping("/{id}")
    public Customer update(@PathVariable Long id, @RequestBody Customer updated) {
        updated.setId(id);
        return customerRepo.save(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        customerRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    @GetMapping("/search")
    public List<Customer> search(@RequestParam String q) {
        return customerRepo.findByNameContainingIgnoreCase(q);
    }
}

// ─── Invoice Controller ──────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    public List<Invoice> all() { return invoiceService.getAllInvoices(); }

    @GetMapping("/{id}")
    public Invoice one(@PathVariable Long id) {
        return invoiceService.getById(id);
    }

    @PostMapping
    public Invoice create(@RequestBody Invoice invoice) {
        return invoiceService.createInvoice(invoice);
    }

    @GetMapping("/range")
    public List<Invoice> byDateRange(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return invoiceService.getByDateRange(from, to);
    }

    @GetMapping("/customer/{customerId}")
    public List<Invoice> byCustomer(@PathVariable Long customerId) {
        return invoiceService.getByDateRange(
            LocalDate.of(2000, 1, 1), LocalDate.now());
    }
}

// ─── GST Report Controller ───────────────────────────────────────────────────

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
class ReportController {

    private final InvoiceService invoiceService;

    @GetMapping("/gst-summary")
    public Map<String, Object> gstSummary(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        if (from == null) from = LocalDate.now().withDayOfMonth(1);
        if (to == null)   to = LocalDate.now();

        return invoiceService.getGstReport(from, to);
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        LocalDate today = LocalDate.now();
        return invoiceService.getGstReport(monthStart, today);
    }
}
