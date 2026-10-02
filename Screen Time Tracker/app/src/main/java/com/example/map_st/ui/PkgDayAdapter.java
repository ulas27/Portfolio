package com.example.map_st.ui;

import android.text.format.DateUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.map_st.R;
import com.example.map_st.usage.PkgDayUsage;

import java.util.ArrayList;
import java.util.List;

public class PkgDayAdapter extends RecyclerView.Adapter<PkgDayAdapter.VH> {

    private final List<PkgDayUsage> items = new ArrayList<>();

    public void submit(List<PkgDayUsage> list) {
        items.clear();
        if (list != null) items.addAll(list);
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.row_pkg_day, parent, false);
        return new VH(v);
    }

    @Override
    public void onBindViewHolder(@NonNull VH h, int position) {
        PkgDayUsage u = items.get(position);
        h.day.setText(u.day);
        h.time.setText(formatDuration(u.foregroundMs));
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class VH extends RecyclerView.ViewHolder {
        final TextView day;
        final TextView time;

        VH(@NonNull View itemView) {
            super(itemView);
            day = itemView.findViewById(R.id.text_day);
            time = itemView.findViewById(R.id.text_time);
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
