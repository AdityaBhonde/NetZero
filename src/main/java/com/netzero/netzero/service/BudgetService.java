package com.netzero.netzero.service;

import com.netzero.netzero.dsa.KnapsackSolver;
import com.netzero.netzero.dto.BudgetRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BudgetService {

    public Map<String, Object> optimizeBudget(
            BudgetRequest request) {

        List<KnapsackSolver.Item> items =
                new ArrayList<>();

        for (BudgetRequest.BudgetItemDto dto
                : request.getItems()) {
            items.add(new KnapsackSolver.Item(
                    dto.getName(),
                    dto.getCost(),
                    dto.getRating(),
                    dto.getCategory()));
        }

        KnapsackSolver solver =
                new KnapsackSolver();
        KnapsackSolver.Result result =
                solver.solve(items,
                        request.getTotalBudget());

        Map<String, Object> response =
                new HashMap<>();
        response.put("selectedItems",
                result.selectedItems);
        response.put("totalCost",
                result.totalCost);
        response.put("totalRating",
                result.totalRating);
        response.put("savedAmount",
                result.savedAmount);
        response.put("budget",
                request.getTotalBudget());

        return response;
    }
}