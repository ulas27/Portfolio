package com.example.map_st.ui;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.provider.Settings;
import android.text.format.DateUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.example.map_st.R;
import com.example.map_st.data.DailySummaryEntity;
import com.example.map_st.data.SummaryRepository;
import com.example.map_st.usage.UsageReader;
import com.example.map_st.usage.UsageSnapshot;
import com.example.map_st.util.AppPrefs;
import com.example.map_st.util.DayKey;
import com.example.map_st.util.ScreenTimeNotifications;
import com.google.android.material.button.MaterialButton;

public class DashboardFragment extends Fragment {

    private TextView statusText;
    private TextView todayTotalText;
    private TextView pickupsText;
    private MaterialButton openAccessButton;
    private MaterialButton refreshButton;
    private TextView goalHintText;
    private SummaryRepository repo;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_dashboard, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        statusText = view.findViewById(R.id.text_status);
        todayTotalText = view.findViewById(R.id.text_today_total);
        pickupsText = view.findViewById(R.id.text_pickups);
        openAccessButton = view.findViewById(R.id.btn_open_access);
        refreshButton = view.findViewById(R.id.btn_refresh);
        goalHintText = view.findViewById(R.id.text_goal_hint);
        repo = new SummaryRepository(requireContext());

        openAccessButton.setOnClickListener(v -> {
            Context ctx = requireContext();
            Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            ctx.startActivity(intent);
        });

        refreshButton.setOnClickListener(v -> load());
    }

    @Override
    public void onResume() {
        super.onResume();
        load();
    }

    private void load() {
        Context ctx = requireContext();
        if (!UsageReader.hasUsageAccess(ctx)) {
            statusText.setText(R.string.dash_status_need_access);
            statusText.setVisibility(View.VISIBLE);
            openAccessButton.setVisibility(View.VISIBLE);
            refreshButton.setEnabled(false);
            todayTotalText.setText("\u2014");
            pickupsText.setText("\u2014");
            bindGoalHint(ctx);
            return;
        }

        openAccessButton.setVisibility(View.GONE);
        refreshButton.setEnabled(true);

        UsageSnapshot snap = UsageReader.readToday(ctx);
        statusText.setText("");
        statusText.setVisibility(View.GONE);
        todayTotalText.setText(formatDuration(snap.totalForegroundMs));
        pickupsText.setText(String.valueOf(snap.pickupsApprox));

        repo.save(new DailySummaryEntity(DayKey.today(), snap.totalForegroundMs, snap.pickupsApprox));

        ScreenTimeNotifications.maybeNotifyDailyGoalExceeded(ctx, snap.totalForegroundMs);
        bindGoalHint(ctx);
    }

    private void bindGoalHint(Context ctx) {
        int g = AppPrefs.getDailyGoalMinutes(ctx);
        if (g <= 0) {
            goalHintText.setText(R.string.dashboard_goal_off);
        } else {
            goalHintText.setText(getString(R.string.dashboard_goal_set, g));
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
