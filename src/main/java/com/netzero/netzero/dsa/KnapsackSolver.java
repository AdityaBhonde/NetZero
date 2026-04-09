package com.netzero.netzero.dsa;

import java.util.*;

public class KnapsackSolver {

    public static class Item {
        public String name;
        public double cost;
        public int rating;
        public String category;

        public Item(String name, double cost,
                    int rating, String category) {
            this.name = name;
            this.cost = cost;
            this.rating = rating;
            this.category = category;
        }
    }

    public static class Result {
        public List<Item> selectedItems;
        public double totalCost;
        public int totalRating;
        public double savedAmount;
        public int[][] dpTable;
    }

    // 0/1 Knapsack DP
    public Result solve(List<Item> items,
                        double budget) {
        int n = items.size();
        int B = (int) budget;

        int[][] dp = new int[n + 1][B + 1];

        for (int i = 1; i <= n; i++) {
            Item item = items.get(i - 1);
            int cost = (int) item.cost;
            for (int w = 0; w <= B; w++) {
                dp[i][w] = dp[i-1][w];
                if (cost <= w) {
                    dp[i][w] = Math.max(
                            dp[i][w],
                            dp[i-1][w-cost]
                                    + item.rating);
                }
            }
        }

        // Backtrack to find selected items
        List<Item> selected = new ArrayList<>();
        int w = B;
        for (int i = n; i > 0; i--) {
            if (dp[i][w] != dp[i-1][w]) {
                selected.add(items.get(i-1));
                w -= (int) items.get(i-1).cost;
            }
        }

        Result result = new Result();
        result.selectedItems = selected;
        result.totalCost = selected.stream()
                .mapToDouble(item -> item.cost).sum();
        result.totalRating = dp[n][B];
        result.savedAmount = budget
                - result.totalCost;
        result.dpTable = dp;
        return result;
    }
}