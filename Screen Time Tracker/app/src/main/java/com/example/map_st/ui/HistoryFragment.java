package com.example.map_st.ui;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.map_st.R;
import com.example.map_st.data.DailySummaryEntity;
import com.example.map_st.data.SummaryRepository;
import com.example.map_st.util.AppPrefs;
import com.example.map_st.util.CsvExporter;

import java.io.IOException;
import java.util.List;

public class HistoryFragment extends Fragment {

    private TextView infoText;
    private EditText editGoal;
    private RecyclerView recycler;
    private HistoryAdapter adapter;
    private SummaryRepository repo;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_history, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        infoText = view.findViewById(R.id.text_info);
        editGoal = view.findViewById(R.id.edit_goal_minutes);
        recycler = view.findViewById(R.id.recycler_history);
        Button saveGoal = view.findViewById(R.id.btn_save_goal);
        Button export = view.findViewById(R.id.btn_export_csv);

        recycler.setLayoutManager(new LinearLayoutManager(requireContext()));
        adapter = new HistoryAdapter();
        recycler.setAdapter(adapter);

        repo = new SummaryRepository(requireContext());

        saveGoal.setOnClickListener(v -> {
            int minutes = parseGoalMinutes(editGoal.getText().toString());
            AppPrefs.setDailyGoalMinutes(requireContext(), minutes);
            Toast.makeText(requireContext(), R.string.toast_goal_saved, Toast.LENGTH_SHORT).show();
        });

        export.setOnClickListener(v -> repo.loadLatest(90, this::shareExport));
    }

    @Override
    public void onResume() {
        super.onResume();
        editGoal.setText(String.valueOf(AppPrefs.getDailyGoalMinutes(requireContext())));
        load();
    }

    private void load() {
        infoText.setText(R.string.history_info_default);
        repo.loadLatest(7, list -> {
            if (!isAdded()) return;
            adapter.submit(list);
            if (list == null || list.isEmpty()) {
                infoText.setText(R.string.history_empty);
            }
        });
    }

    private void shareExport(List<DailySummaryEntity> list) {
        if (!isAdded()) return;
        if (list == null || list.isEmpty()) {
            Toast.makeText(requireContext(), R.string.toast_export_empty, Toast.LENGTH_SHORT).show();
            return;
        }
        try {
            java.io.File file = CsvExporter.writeToCache(requireContext(), list);
            startActivity(CsvExporter.buildShareIntent(requireContext(), file));
        } catch (IOException e) {
            Toast.makeText(requireContext(), R.string.toast_export_failed, Toast.LENGTH_SHORT).show();
        }
    }

    private static int parseGoalMinutes(String raw) {
        String s = raw == null ? "" : raw.trim();
        if (s.isEmpty()) return 0;
        try {
            return Math.max(0, Integer.parseInt(s));
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
