package com.netzero.netzero.controller;

import com.netzero.netzero.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService
            analyticsService;

    @GetMapping("/{groupId}")
    public ResponseEntity<Map<String, Object>>
    getAnalytics(
            @PathVariable String groupId) {
        return ResponseEntity.ok(
                analyticsService
                        .getAnalytics(groupId));
    }
}