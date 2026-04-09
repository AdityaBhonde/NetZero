package com.netzero.netzero.dsa;

public class SegmentTree {

    private double[] tree;
    private int n;

    public SegmentTree(double[] arr) {
        n = arr.length;
        tree = new double[4 * n];
        build(arr, 0, 0, n - 1);
    }

    private void build(double[] arr,
                       int node, int start,
                       int end) {
        if (start == end) {
            tree[node] = arr[start];
        } else {
            int mid = (start + end) / 2;
            build(arr, 2*node+1, start, mid);
            build(arr, 2*node+2, mid+1, end);
            tree[node] = tree[2*node+1]
                    + tree[2*node+2];
        }
    }

    // Range sum query O(log n)
    public double query(int l, int r) {
        return query(0, 0, n-1, l, r);
    }

    private double query(int node, int start,
                         int end, int l, int r) {
        if (r < start || end < l) return 0;
        if (l <= start && end <= r)
            return tree[node];
        int mid = (start + end) / 2;
        return query(2*node+1, start, mid, l, r)
                + query(2*node+2, mid+1, end, l, r);
    }

    // Point update O(log n)
    public void update(int idx, double val) {
        update(0, 0, n-1, idx, val);
    }

    private void update(int node, int start,
                        int end, int idx,
                        double val) {
        if (start == end) {
            tree[node] = val;
        } else {
            int mid = (start + end) / 2;
            if (idx <= mid)
                update(2*node+1, start, mid,
                        idx, val);
            else
                update(2*node+2, mid+1, end,
                        idx, val);
            tree[node] = tree[2*node+1]
                    + tree[2*node+2];
        }
    }
}