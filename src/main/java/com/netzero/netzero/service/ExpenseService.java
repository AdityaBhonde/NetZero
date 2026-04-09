package com.netzero.netzero.service;

import com.netzero.netzero.dto.ExpenseRequest;
import com.netzero.netzero.model.Expense;
import com.netzero.netzero.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository
            expenseRepository;

    public Expense addExpense(
            ExpenseRequest request) {
        Expense expense = new Expense();
        expense.setTitle(request.getTitle());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setPaidBy(request.getPaidBy());
        expense.setGroupId(request.getGroupId());
        expense.setSplitAmong(
                request.getSplitAmong());
        expense.setSplitType(
                request.getSplitType());
        if (request.getCustomSplits() != null) {
            expense.setCustomSplits(
                    request.getCustomSplits());
        }
        return expenseRepository.save(expense);
    }

    public List<Expense> getGroupExpenses(
            String groupId) {
        return expenseRepository
                .findByGroupId(groupId);
    }

    public void deleteExpense(String id) {
        expenseRepository.deleteById(id);
    }
}