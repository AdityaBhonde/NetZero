package com.netzero.netzero.controller;

import com.netzero.netzero.dsa.ItineraryOptimizer;
import com.netzero.netzero.dto.ItineraryRequest;
import com.netzero.netzero.dto.ItineraryResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/itinerary")
@CrossOrigin("*")
public class ItineraryController {

    @PostMapping("/optimize")
    public ItineraryResponse optimize(@RequestBody ItineraryRequest req) {
        ItineraryOptimizer.TSPResult result = ItineraryOptimizer.solveTSP(req.places);
        ItineraryResponse res = new ItineraryResponse();
        res.optimizedRoute = result.path;
        res.totalDistance = result.distance;
        return res;
    }
}
