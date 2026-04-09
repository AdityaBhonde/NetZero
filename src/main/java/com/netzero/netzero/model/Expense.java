package com.netzero.netzero.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Document(collection = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Expense {

    @Id
    private String id;

    private String title;
    private Double amount;
    private String category;
    private String paidBy;
    private String groupId;
    private List<String> splitAmong = new ArrayList<>();
    private String splitType = "EQUAL";
    private Map<String, Double> customSplits = new HashMap<>();

    @CreatedDate
    private LocalDateTime createdAt;
}