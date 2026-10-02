package com.example.map_st.ui;

import android.text.format.DateUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.map_st.R;
import com.example.map_st.usage.AppUsageItem;

import java.util.ArrayList;
import java.util.List;

public class AppUsageAdapter extends RecyclerView.Adapter<AppUsageAdapter.VH> {

    public interface OnAppClickListener {
        void onAppClick(AppUsageItem item);
    }

    private final List<AppUsageItem> items = new ArrayList<>();
    private final OnAppClickListener clickListener;

    public AppUsageAdapter(OnAppClickListener clickListener) {
        this.clickListener = clickListener;
    }

    public void submit(List<AppUsageItem> newItems) {
        items.clear();
        if (newItems != null) items.addAll(newItems);
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.row_app_usage, parent, false);
        return new VH(v);
    }

    @Override
    public void onBindViewHolder(@NonNull VH holder, int position) {
        AppUsageItem item = items.get(position);
        holder.rank.setText(String.valueOf(position + 1));
        holder.name.setText(item.appLabel);
        holder.pkg.setText(item.packageName);
        holder.time.setText(formatDuration(item.foregroundMs));
        holder.itemView.setOnClickListener(v -> {
            if (clickListener != null) clickListener.onAppClick(item);
        });
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class VH extends RecyclerView.ViewHolder {
        final TextView rank;
        final TextView name;
        final TextView pkg;
        final TextView time;

        VH(@NonNull View itemView) {
            super(itemView);
            rank = itemView.findViewById(R.id.text_rank);
            name = itemView.findViewById(R.id.text_app_name);
            pkg = itemView.findViewById(R.id.text_app_pkg);
            time = itemView.findViewById(R.id.text_app_time);
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

