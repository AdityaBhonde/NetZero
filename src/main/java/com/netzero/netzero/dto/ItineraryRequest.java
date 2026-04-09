package com.netzero.netzero.dto;

import java.util.List;

public class ItineraryRequest {
    public String groupId;
    public List<LocationDTO> places;

    public static class LocationDTO {
        public String name;
        public double lat;
        public double lon;
        
        public LocationDTO() {}
        public LocationDTO(String name, double lat, double lon) {
            this.name = name; this.lat = lat; this.lon = lon;
        }
    }
}
