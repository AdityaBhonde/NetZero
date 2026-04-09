package com.netzero.netzero.service;

import com.netzero.netzero.model.Group;
import com.netzero.netzero.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;

    public Group createGroup(Group group) {
        if (!group.getMemberIds()
                .contains(group.getCreatedBy())) {
            group.getMemberIds()
                    .add(group.getCreatedBy());
        }
        return groupRepository.save(group);
    }

    public Group getGroup(String id) {
        return groupRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Group not found"));
    }

    public List<Group> getMyGroups(String userId){
        return groupRepository
                .findByMemberIdsContaining(userId);
    }

    public Group addMember(String groupId,
                           String userId) {
        Group group = getGroup(groupId);
        if (!group.getMemberIds()
                .contains(userId)) {
            group.getMemberIds().add(userId);
            groupRepository.save(group);
        }
        return group;
    }

    public Group updateStatus(String groupId,
                              String status) {
        Group group = getGroup(groupId);
        group.setStatus(status);
        return groupRepository.save(group);
    }
}