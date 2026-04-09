package com.netzero.netzero.repository;

import com.netzero.netzero.model.BudgetItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BudgetItemRepository
        extends MongoRepository<BudgetItem, String> {
    List<BudgetItem> findByGroupId(String groupId);
    void deleteByGroupId(String groupId);
}