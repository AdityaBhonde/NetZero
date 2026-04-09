package com.netzero.netzero.controller;

import com.netzero.netzero.dto.ExpenseRequest;
import com.netzero.netzero.model.Expense;
import com.netzero.netzero.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<Expense> addExpense(
            @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(
                expenseService.addExpense(request));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Expense>>
    getGroupExpenses(
            @PathVariable String groupId) {
        return ResponseEntity.ok(
                expenseService
                        .getGroupExpenses(groupId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable String id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.ok().build();
    }
}