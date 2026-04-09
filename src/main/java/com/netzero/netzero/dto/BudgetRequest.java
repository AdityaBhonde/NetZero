package com.netzero.netzero.dto;

import lombok.Data;
import java.util.List;

@Data
public class BudgetRequest {
    private String groupId;
    private Double totalBudget;
    private List<BudgetItemDto> items;

    @Data
    public static class BudgetItemDto {
        private String name;
        private Double cost;
        private Integer rating;
        private String category;
    }
}