package com.netzero.netzero.dto;

import java.util.List;

public class ItineraryResponse {
    public List<ItineraryRequest.LocationDTO> optimizedRoute;
    public double totalDistance;
}
