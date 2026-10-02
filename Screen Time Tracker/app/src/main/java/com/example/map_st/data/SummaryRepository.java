package com.example.map_st.data;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class SummaryRepository {

    public interface Callback<T> {
        void onResult(T value);
    }

    private final DailySummaryDao dao;
    private final ExecutorService io = Executors.newSingleThreadExecutor();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    public SummaryRepository(Context context) {
        dao = AppDatabase.getInstance(context).dailySummaryDao();
    }

    public void save(DailySummaryEntity entity) {
        io.execute(() -> {
            try {
                dao.upsert(entity);
            } catch (RuntimeException ignored) {
                // Activity/fragment may be gone; avoid crashing on background write
            }
        });
    }

    public void loadLatest(int limit, Callback<List<DailySummaryEntity>> cb) {
        io.execute(() -> {
            List<DailySummaryEntity> list;
            try {
                list = dao.getLatest(limit);
                if (list == null) {
                    list = Collections.emptyList();
                }
            } catch (RuntimeException e) {
                // Includes CancellationException if the query is interrupted
                list = Collections.emptyList();
            }
            List<DailySummaryEntity> result = list;
            mainHandler.post(() -> cb.onResult(result));
        });
    }
}

