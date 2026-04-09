package com.netzero.netzero.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "budget_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetItem {

    @Id
    private String id;

    private String groupId;
    private String name;
    private Double cost;
    private Integer rating;
    private String category;
    private boolean selected = false;
}