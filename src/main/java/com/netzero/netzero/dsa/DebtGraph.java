package com.netzero.netzero.dsa;

import java.util.*;

public class DebtGraph {

    // adjacency: from -> (to -> amount)
    private Map<String, Map<String, Double>> graph
            = new HashMap<>();

    public void addDebt(String from,
                        String to,
                        double amount) {
        graph.computeIfAbsent(from,
                        k -> new HashMap<>())
                .merge(to, amount, Double::sum);
    }

    public Map<String, Double> getNetBalances() {
        Map<String, Double> balance =
                new HashMap<>();

        for (String from : graph.keySet()) {
            for (Map.Entry<String, Double> entry
                    : graph.get(from).entrySet()) {
                String to = entry.getKey();
                double amt = entry.getValue();
                balance.merge(from, -amt,
                        Double::sum);
                balance.merge(to, amt,
                        Double::sum);
            }
        }
        return balance;
    }

    // Returns list of cycles found
    public List<List<String>> detectCycles() {
        List<List<String>> cycles =
                new ArrayList<>();
        Set<String> visited = new HashSet<>();
        Set<String> recStack = new HashSet<>();
        Map<String, String> parent =
                new HashMap<>();

        Set<String> allNodes = new HashSet<>();
        allNodes.addAll(graph.keySet());
        for (Map<String, Double> edges
                : graph.values()) {
            allNodes.addAll(edges.keySet());
        }

        for (String node : allNodes) {
            if (!visited.contains(node)) {
                dfs(node, visited, recStack,
                        parent, cycles);
            }
        }
        return cycles;
    }

    private void dfs(String node,
                     Set<String> visited,
                     Set<String> recStack,
                     Map<String, String> parent,
                     List<List<String>> cycles) {
        visited.add(node);
        recStack.add(node);

        Map<String, Double> neighbors =
                graph.getOrDefault(node,
                        new HashMap<>());

        for (String neighbor : neighbors.keySet()) {
            if (!visited.contains(neighbor)) {
                parent.put(neighbor, node);
                dfs(neighbor, visited, recStack,
                        parent, cycles);
            } else if (recStack.contains(neighbor)){
                // Cycle found
                List<String> cycle =
                        new ArrayList<>();
                cycle.add(neighbor);
                String curr = node;
                while (!curr.equals(neighbor)) {
                    cycle.add(curr);
                    curr = parent.getOrDefault(
                            curr, neighbor);
                }
                cycle.add(neighbor);
                Collections.reverse(cycle);
                cycles.add(cycle);
            }
        }
        recStack.remove(node);
    }

    public Map<String, Map<String, Double>>
    getGraph() {
        return graph;
    }
}