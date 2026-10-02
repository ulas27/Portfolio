package com.example.map_st.data;

import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;

import java.util.List;

@Dao
public interface DailySummaryDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void upsert(DailySummaryEntity entity);

    @Query("SELECT * FROM daily_summary ORDER BY day DESC LIMIT :limit")
    List<DailySummaryEntity> getLatest(int limit);
}

