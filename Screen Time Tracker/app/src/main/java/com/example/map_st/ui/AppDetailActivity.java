package com.example.map_st.ui;

import android.os.Bundle;
import android.text.format.DateUtils;
import android.view.MenuItem;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.map_st.R;
import com.example.map_st.usage.PkgDayUsage;
import com.example.map_st.usage.UsageReader;
import com.example.map_st.util.DayKey;
import com.google.android.material.appbar.MaterialToolbar;

import java.util.List;

public class AppDetailActivity extends AppCompatActivity {

    public static final String EXTRA_PACKAGE_NAME = "extra_package_name";
    public static final String EXTRA_APP_LABEL = "extra_app_label";

    private String packageName;
    private String appLabel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_app_detail);

        packageName = getIntent().getStringExtra(EXTRA_PACKAGE_NAME);
        appLabel = getIntent().getStringExtra(EXTRA_APP_LABEL);
        if (packageName == null) packageName = "";
        if (appLabel == null || appLabel.isEmpty()) appLabel = packageName;

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(R.string.app_detail_title);
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }

        TextView nameView = findViewById(R.id.text_app_label);
        TextView pkgView = findViewById(R.id.text_package_name);
        TextView todayView = findViewById(R.id.text_today_for_pkg);
        RecyclerView recycler = findViewById(R.id.recycler_pkg_days);

        nameView.setText(appLabel);
        pkgView.setText(packageName);

        recycler.setLayoutManager(new LinearLayoutManager(this));
        recycler.setNestedScrollingEnabled(false);
        recycler.setHasFixedSize(true);
        PkgDayAdapter dayAdapter = new PkgDayAdapter();
        recycler.setAdapter(dayAdapter);

        if (!UsageReader.hasUsageAccess(this)) {
            todayView.setText(getString(R.string.usage_access_needed_short));
            return;
        }

        long todayStart = DayKey.startOfDayMillis(0);
        long now = System.currentTimeMillis();
        long todayMs = UsageReader.readPackageForegroundMs(this, packageName, todayStart, now);
        todayView.setText(getString(R.string.today_screen_time_fmt, formatDuration(todayMs)));

        List<PkgDayUsage> days = UsageReader.readPackageLast7Days(this, packageName);
        dayAdapter.submit(days);
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            finish();
            return true;
        }
        return super.onOptionsItemSelected(item);
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
