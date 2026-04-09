package com.netzero.netzero.controller;

import com.netzero.netzero.dto.BudgetRequest;
import com.netzero.netzero.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/budget")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping("/optimize")
    public ResponseEntity<Map<String, Object>>
    optimize(
            @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(
                budgetService
                        .optimizeBudget(request));
    }
}