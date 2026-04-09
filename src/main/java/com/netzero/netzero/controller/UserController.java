package com.netzero.netzero.controller;

import com.netzero.netzero.model.User;
import com.netzero.netzero.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/search")
    public ResponseEntity<?> searchByEmail(
            @RequestParam String email) {
        Optional<User> user =
                userRepository.findByEmail(email);
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User u = user.get();
        return ResponseEntity.ok(Map.of(
                "userId", u.getId(),
                "name",   u.getName(),
                "email",  u.getEmail(),
                "upiId",  u.getUpiId() != null
                           ? u.getUpiId() : ""
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @PathVariable String id) {
        return userRepository.findById(id)
                .map(u -> ResponseEntity.ok(Map.of(
                        "userId", u.getId(),
                        "name",   u.getName(),
                        "email",  u.getEmail(),
                        "upiId",  u.getUpiId() != null
                                   ? u.getUpiId() : ""
                )))
                .orElse(ResponseEntity.notFound().build());
    }
}
