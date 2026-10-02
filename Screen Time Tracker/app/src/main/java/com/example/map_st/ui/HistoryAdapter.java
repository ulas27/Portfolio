package com.example.map_st.ui;

import android.text.format.DateUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.map_st.R;
import com.example.map_st.data.DailySummaryEntity;

import java.util.ArrayList;
import java.util.List;

public class HistoryAdapter extends RecyclerView.Adapter<HistoryAdapter.VH> {

    private final List<DailySummaryEntity> items = new ArrayList<>();
    private long maxMs = 1L;

    public void submit(List<DailySummaryEntity> list) {
        items.clear();
        maxMs = 1L;
        if (list != null) {
            items.addAll(list);
            for (DailySummaryEntity e : list) {
                if (e != null && e.totalForegroundMs > maxMs) maxMs = e.totalForegroundMs;
            }
        }
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.row_history_day, parent, false);
        return new VH(v);
    }

    @Override
    public void onBindViewHolder(@NonNull VH h, int position) {
        DailySummaryEntity e = items.get(position);
        h.day.setText(e.day);
        h.time.setText(formatDuration(e.totalForegroundMs));
        h.pickups.setText("App opens: " + e.pickupsApprox);
        int progress = (int) Math.min(100, (e.totalForegroundMs * 100) / maxMs);
        h.bar.setProgress(progress);
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class VH extends RecyclerView.ViewHolder {
        final TextView day;
        final TextView time;
        final TextView pickups;
        final ProgressBar bar;

        VH(@NonNull View itemView) {
            super(itemView);
            day = itemView.findViewById(R.id.text_day);
            time = itemView.findViewById(R.id.text_time);
            pickups = itemView.findViewById(R.id.text_pickups);
            bar = itemView.findViewById(R.id.progress_bar);
        }
    }

    private String formatDuration(long millis) {
        if (millis < 0) millis = 0;
        long minutes = millis / DateUtils.MINUTE_IN_MILLIS;
        long hours = minutes / 60;
        long remMin = minutes % 60;
        if (hours <= 0) return remMin + " min";
        return hours + " h " + remMin + " min";
    }
}

