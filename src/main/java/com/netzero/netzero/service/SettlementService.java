package com.netzero.netzero.service;

import com.netzero.netzero.dsa.*;
import com.netzero.netzero.model.*;
import com.netzero.netzero.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SettlementService {

    private final ExpenseRepository
            expenseRepository;
    private final SettlementRepository
            settlementRepository;
    private final UserRepository userRepository;

    public List<Settlement> optimizeAndSave(
            String groupId) {

        // Delete old settlements for this group
        settlementRepository
                .deleteByGroupId(groupId);

        List<Expense> expenses =
                expenseRepository
                        .findByGroupId(groupId);

        // Build debt graph
        DebtGraph debtGraph = new DebtGraph();
        Map<String, Double> netBalance =
                new HashMap<>();

        for (Expense expense : expenses) {
            String paidBy = expense.getPaidBy();
            double amount = expense.getAmount();
            List<String> splitAmong =
                    expense.getSplitAmong();

            if (splitAmong == null ||
                    splitAmong.isEmpty()) continue;

            if ("EQUAL".equals(
                    expense.getSplitType())) {
                double share = amount /
                        splitAmong.size();
                for (String member : splitAmong) {
                    if (!member.equals(paidBy)) {
                        debtGraph.addDebt(
                                member, paidBy, share);
                        netBalance.merge(
                                member, -share,
                                Double::sum);
                        netBalance.merge(
                                paidBy, share,
                                Double::sum);
                    }
                }
            } else if ("CUSTOM".equals(
                    expense.getSplitType())) {
                Map<String, Double> splits =
                        expense.getCustomSplits();
                if (splits != null) {
                    for (Map.Entry<String, Double>
                            e : splits.entrySet()) {
                        if (!e.getKey()
                                .equals(paidBy)) {
                            debtGraph.addDebt(
                                    e.getKey(),
                                    paidBy,
                                    e.getValue());
                            netBalance.merge(
                                    e.getKey(),
                                    -e.getValue(),
                                    Double::sum);
                            netBalance.merge(
                                    paidBy,
                                    e.getValue(),
                                    Double::sum);
                        }
                    }
                }
            }
        }

        // Get user info for settlements
        Map<String, String> userNames =
                new HashMap<>();
        Map<String, String> userUpiIds =
                new HashMap<>();

        Set<String> allUserIds = new HashSet<>();
        allUserIds.addAll(netBalance.keySet());

        for (String uid : allUserIds) {
            userRepository.findById(uid)
                    .ifPresent(u -> {
                        userNames.put(uid, u.getName());
                        userUpiIds.put(uid,
                                u.getUpiId() != null ?
                                        u.getUpiId() : "");
                    });
        }

        // Optimize using Heap
        DebtOptimizer optimizer =
                new DebtOptimizer();
        List<Settlement> settlements =
                optimizer.optimize(
                        netBalance, userNames,
                        userUpiIds, groupId);

        // Save and return
        return settlementRepository
                .saveAll(settlements);
    }

    public List<Settlement> getSettlements(
            String groupId) {
        return settlementRepository
                .findByGroupId(groupId);
    }

    public Settlement markAsPaid(String id) {
        Settlement s = settlementRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Settlement not found"));
        s.setStatus("PAID");
        return settlementRepository.save(s);
    }
}