package com.netzero.netzero.repository;

import com.netzero.netzero.model.Group;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface GroupRepository
        extends MongoRepository<Group, String> {
    List<Group> findByMemberIdsContaining(String userId);
    List<Group> findByCreatedBy(String userId);
}