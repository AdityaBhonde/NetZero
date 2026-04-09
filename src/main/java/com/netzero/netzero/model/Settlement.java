package com.netzero.netzero.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "settlements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Settlement {

    @Id
    private String id;

    private String groupId;
    private String fromUserId;
    private String fromUserName;
    private String toUserId;
    private String toUserName;
    private Double amount;
    private String status = "PENDING";
    private String upiId;

    @CreatedDate
    private LocalDateTime createdAt;
}