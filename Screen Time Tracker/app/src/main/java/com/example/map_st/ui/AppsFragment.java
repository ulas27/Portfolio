package com.example.map_st.ui;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.provider.Settings;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.map_st.R;
import com.example.map_st.usage.AppUsageItem;
import com.example.map_st.usage.UsageReader;
import com.google.android.material.button.MaterialButton;

import java.util.Collections;
import java.util.List;

public class AppsFragment extends Fragment {

    private TextView statusText;
    private MaterialButton openAccessButton;
    private MaterialButton refreshButton;
    private RecyclerView recyclerView;
    private AppUsageAdapter adapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_apps, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        statusText = view.findViewById(R.id.text_status);
        openAccessButton = view.findViewById(R.id.btn_open_access);
        refreshButton = view.findViewById(R.id.btn_refresh);
        recyclerView = view.findViewById(R.id.recycler_apps);

        recyclerView.setLayoutManager(new LinearLayoutManager(requireContext()));
        adapter = new AppUsageAdapter(item -> {
            Intent i = new Intent(requireContext(), AppDetailActivity.class);
            i.putExtra(AppDetailActivity.EXTRA_PACKAGE_NAME, item.packageName);
            i.putExtra(AppDetailActivity.EXTRA_APP_LABEL, item.appLabel);
            startActivity(i);
        });
        recyclerView.setAdapter(adapter);

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
            statusText.setText(R.string.apps_status_need);
            openAccessButton.setVisibility(View.VISIBLE);
            refreshButton.setEnabled(false);
            adapter.submit(Collections.emptyList());
            return;
        }

        openAccessButton.setVisibility(View.GONE);
        refreshButton.setEnabled(true);
        statusText.setText(R.string.apps_status_ok);

        List<AppUsageItem> items = UsageReader.readTodayTopApps(ctx, 25);
        adapter.submit(items);
    }
}
