package com.example.map_st.data;

import androidx.annotation.NonNull;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "daily_summary")
public class DailySummaryEntity {
    @PrimaryKey
    @NonNull
    public String day; // yyyy-MM-dd

    public long totalForegroundMs;
    public int pickupsApprox;

    public DailySummaryEntity(@NonNull String day, long totalForegroundMs, int pickupsApprox) {
        this.day = day;
        this.totalForegroundMs = totalForegroundMs;
        this.pickupsApprox = pickupsApprox;
    }
}

