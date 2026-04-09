package com.netzero.netzero.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class ExpenseRequest {
    private String title;
    private Double amount;
    private String category;
    private String paidBy;
    private String groupId;
    private List<String> splitAmong;
    private String splitType;
    private Map<String, Double> customSplits;
}