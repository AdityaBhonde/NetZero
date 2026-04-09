package com.netzero.netzero.controller;

import com.netzero.netzero.model.Settlement;
import com.netzero.netzero.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/settlements")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService
            settlementService;

    @PostMapping("/optimize/{groupId}")
    public ResponseEntity<List<Settlement>>
    optimize(
            @PathVariable String groupId) {
        return ResponseEntity.ok(
                settlementService
                        .optimizeAndSave(groupId));
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<List<Settlement>>
    getSettlements(
            @PathVariable String groupId) {
        return ResponseEntity.ok(
                settlementService
                        .getSettlements(groupId));
    }

    @PutMapping("/pay/{id}")
    public ResponseEntity<Settlement> markPaid(
            @PathVariable String id) {
        return ResponseEntity.ok(
                settlementService.markAsPaid(id));
    }
}