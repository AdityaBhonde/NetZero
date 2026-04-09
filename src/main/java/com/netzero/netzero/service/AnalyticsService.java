package com.netzero.netzero.service;

import com.netzero.netzero.dsa.SegmentTree;
import com.netzero.netzero.model.Expense;
import com.netzero.netzero.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ExpenseRepository
            expenseRepository;

    public Map<String, Object> getAnalytics(
            String groupId) {

        List<Expense> expenses =
                expenseRepository
                        .findByGroupId(groupId);

        Map<String, Object> result =
                new HashMap<>();

        // 1. Total spent
        double total = expenses.stream()
                .mapToDouble(Expense::getAmount)
                .sum();
        result.put("totalSpent", total);

        // 2. Category breakdown (HashMap)
        Map<String, Double> byCategory =
                new HashMap<>();
        for (Expense e : expenses) {
            byCategory.merge(
                    e.getCategory() != null ?
                            e.getCategory() : "OTHER",
                    e.getAmount(), Double::sum);
        }
        result.put("byCategory", byCategory);

        // 3. Per person spending (HashMap)
        Map<String, Double> byPerson =
                new HashMap<>();
        for (Expense e : expenses) {
            byPerson.merge(e.getPaidBy(),
                    e.getAmount(), Double::sum);
        }
        result.put("byPerson", byPerson);

        // 4. Daily spending (TreeMap = sorted)
        TreeMap<String, Double> byDay =
                new TreeMap<>();
        for (Expense e : expenses) {
            if (e.getCreatedAt() != null) {
                String day = e.getCreatedAt()
                        .toLocalDate().toString();
                byDay.merge(day, e.getAmount(),
                        Double::sum);
            }
        }
        result.put("byDay", byDay);

        // 5. Segment Tree range query
        if (!byDay.isEmpty()) {
            double[] dailyAmounts = byDay.values()
                    .stream()
                    .mapToDouble(Double::doubleValue)
                    .toArray();
            SegmentTree segTree =
                    new SegmentTree(dailyAmounts);

            // Total of first half of trip
            int mid = dailyAmounts.length / 2;
            result.put("firstHalfSpend",
                    segTree.query(0, mid));
            result.put("secondHalfSpend",
                    segTree.query(mid + 1,
                            dailyAmounts.length - 1));
        }

        // 6. Top spender
        byPerson.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .ifPresent(e ->
                        result.put("topSpender",
                                e.getKey()));

        result.put("totalExpenses",
                expenses.size());

        return result;
    }
}