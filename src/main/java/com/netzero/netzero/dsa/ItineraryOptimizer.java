package com.netzero.netzero.dsa;

import com.netzero.netzero.dto.ItineraryRequest.LocationDTO;
import java.util.ArrayList;
import java.util.List;

public class ItineraryOptimizer {
    
    // Haversine formula to compute great-circle distance between two points on a spherical surface (the Earth)
    private static double calculateHaversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Convert to kilometers
    }

    public static double[][] getDistanceMatrix(List<LocationDTO> places) {
        int n = places.size();
        double[][] dist = new double[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i == j) {
                    dist[i][j] = 0;
                } else {
                    dist[i][j] = calculateHaversine(places.get(i).lat, places.get(i).lon, places.get(j).lat, places.get(j).lon);
                    dist[j][i] = dist[i][j]; // symmetric graph
                }
            }
        }
        return dist;
    }

    public static class TSPResult {
        public List<LocationDTO> path;
        public double distance;
    }

    // Solves the Traveling Salesperson Problem using Dynamic Programming with Bitmask
    // Time Complexity: O(n^2 * 2^n), securely processing exact physical earthly coordinates
    public static TSPResult solveTSP(List<LocationDTO> places) {
        int n = places.size();
        if (n == 0) return new TSPResult() {{ path = new ArrayList<>(); distance = 0; }};
        if (n == 1) return new TSPResult() {{ path = new ArrayList<>(places); distance = 0; }};
        
        double[][] dist = getDistanceMatrix(places);
        int VISITED_ALL = (1 << n) - 1;
        double[][] dp = new double[1 << n][n];
        int[][] parent = new int[1 << n][n];

        for (int i = 0; i < (1 << n); i++) {
            for (int j = 0; j < n; j++) {
                dp[i][j] = Double.MAX_VALUE;
                parent[i][j] = -1;
            }
        }

        // We assume node 0 is the true starting point (e.g. Base/Hotel coordinate)
        dp[1][0] = 0;
        
        for (int mask = 1; mask < (1 << n); mask++) {
            for (int i = 0; i < n; i++) {
                if ((mask & (1 << i)) != 0 && dp[mask][i] != Double.MAX_VALUE) {
                    for (int j = 0; j < n; j++) {
                        if ((mask & (1 << j)) == 0) {
                            int nextMask = mask | (1 << j);
                            double newDist = dp[mask][i] + dist[i][j];
                            if (newDist < dp[nextMask][j]) {
                                dp[nextMask][j] = newDist;
                                parent[nextMask][j] = i;
                            }
                        }
                    }
                }
            }
        }
        
        // Find optimal loop back to base
        double minPath = Double.MAX_VALUE;
        int lastNode = -1;
        for (int i = 1; i < n; i++) {
            if (dp[VISITED_ALL][i] + dist[i][0] < minPath) {
                minPath = dp[VISITED_ALL][i] + dist[i][0];
                lastNode = i;
            }
        }
        
        List<Integer> pathIndices = new ArrayList<>();
        int currMask = VISITED_ALL;
        int currNode = lastNode;
        
        while(currNode != -1) {
            pathIndices.add(0, currNode);
            int prevNode = parent[currMask][currNode];
            currMask = currMask ^ (1 << currNode);
            currNode = prevNode;
        }
        pathIndices.add(0);
        
        List<LocationDTO> optimalPath = new ArrayList<>();
        for (int idx : pathIndices) {
            optimalPath.add(places.get(idx));
        }

        TSPResult res = new TSPResult();
        res.path = optimalPath;
        res.distance = minPath;
        return res;
    }
}
