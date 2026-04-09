package com.netzero.netzero.repository;

import com.netzero.netzero.model.Expense;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ExpenseRepository
        extends MongoRepository<Expense, String> {
    List<Expense> findByGroupId(String groupId);
    List<Expense> findByPaidBy(String userId);
}