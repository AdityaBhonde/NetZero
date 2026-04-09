package com.netzero.netzero.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "groups")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Group {

    @Id
    private String id;

    private String name;
    private String description;
    private Double totalBudget;
    private String createdBy;
    private List<String> memberIds = new ArrayList<>();
    private String status = "ACTIVE";

    @CreatedDate
    private LocalDateTime createdAt;
}