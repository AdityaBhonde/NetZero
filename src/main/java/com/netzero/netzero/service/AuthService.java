package com.netzero.netzero.service;

import com.netzero.netzero.config.JwtUtil;
import com.netzero.netzero.dto.*;
import com.netzero.netzero.model.User;
import com.netzero.netzero.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(
            RegisterRequest request) {

        if (userRepository.existsByEmail(
                request.getEmail())) {
            throw new RuntimeException(
                    "Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(
                request.getPassword()));
        user.setUpiId(request.getUpiId());

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(
                user.getEmail());

        return new AuthResponse(
                token, user.getId(),
                user.getName(), user.getEmail(),
                user.getUpiId());
    }

    public AuthResponse login(
            LoginRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {
            throw new RuntimeException(
                    "Invalid password");
        }

        String token = jwtUtil.generateToken(
                user.getEmail());

        return new AuthResponse(
                token, user.getId(),
                user.getName(), user.getEmail(),
                user.getUpiId());
    }
}