package com.netzero.netzero.repository;

import com.netzero.netzero.model.Settlement;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface SettlementRepository
        extends MongoRepository<Settlement, String> {
    List<Settlement> findByGroupId(String groupId);
    List<Settlement> findByFromUserIdAndStatus(
            String userId, String status);
    void deleteByGroupId(String groupId);
}