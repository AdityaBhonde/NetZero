package com.netzero.netzero.controller;

import com.netzero.netzero.model.Group;
import com.netzero.netzero.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    public ResponseEntity<Group> createGroup(
            @RequestBody Group group) {
        return ResponseEntity.ok(
                groupService.createGroup(group));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Group> getGroup(
            @PathVariable String id) {
        return ResponseEntity.ok(
                groupService.getGroup(id));
    }

    @GetMapping("/my/{userId}")
    public ResponseEntity<List<Group>>
    getMyGroups(
            @PathVariable String userId) {
        return ResponseEntity.ok(
                groupService.getMyGroups(userId));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<Group> addMember(
            @PathVariable String id,
            @RequestParam String userId) {
        return ResponseEntity.ok(
                groupService.addMember(id, userId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Group> updateStatus(
            @PathVariable String id,
            @RequestParam String status) {
        return ResponseEntity.ok(
                groupService.updateStatus(id, status));
    }
}