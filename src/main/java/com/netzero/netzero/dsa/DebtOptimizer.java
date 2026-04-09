package com.netzero.netzero.dsa;

import com.netzero.netzero.model.Settlement;
import java.util.*;

public class DebtOptimizer {

    // Core algorithm — minimizes transactions
    // using Min/Max Heap (PriorityQueue)
    public List<Settlement> optimize(
            Map<String, Double> netBalance,
            Map<String, String> userNames,
            Map<String, String> userUpiIds,
            String groupId) {

        List<Settlement> result =
                new ArrayList<>();

        // Max heap — creditors (positive balance)
        PriorityQueue<double[]> creditors =
                new PriorityQueue<>(
                        (a, b) -> Double.compare(b[0], a[0]));

        // Max heap — debtors (negative balance)
        PriorityQueue<double[]> debtors =
                new PriorityQueue<>(
                        (a, b) -> Double.compare(b[0], a[0]));

        // Map index to userId for heap lookup
        List<String> userIds = new ArrayList<>(
                netBalance.keySet());

        for (int i = 0; i < userIds.size(); i++) {
            String uid = userIds.get(i);
            double bal = netBalance.get(uid);
            if (bal > 0.01) {
                creditors.offer(
                        new double[]{bal, i});
            } else if (bal < -0.01) {
                debtors.offer(
                        new double[]{-bal, i});
            }
        }

        // Greedy matching
        while (!creditors.isEmpty() &&
                !debtors.isEmpty()) {

            double[] creditor = creditors.poll();
            double[] debtor  = debtors.poll();

            double settled = Math.min(
                    creditor[0], debtor[0]);

            String toUid = userIds.get(
                    (int) creditor[1]);
            String fromUid = userIds.get(
                    (int) debtor[1]);

            Settlement s = new Settlement();
            s.setGroupId(groupId);
            s.setFromUserId(fromUid);
            s.setFromUserName(
                    userNames.getOrDefault(
                            fromUid, fromUid));
            s.setToUserId(toUid);
            s.setToUserName(
                    userNames.getOrDefault(
                            toUid, toUid));
            s.setAmount(
                    Math.round(settled * 100.0)
                            / 100.0);
            s.setStatus("PENDING");
            s.setUpiId(userUpiIds
                    .getOrDefault(toUid, ""));
            result.add(s);

            double remaining =
                    creditor[0] - debtor[0];

            if (remaining > 0.01) {
                creditors.offer(
                        new double[]{remaining,
                                creditor[1]});
            } else if (remaining < -0.01) {
                debtors.offer(
                        new double[]{-remaining,
                                debtor[1]});
            }
        }

        return result;
    }
}