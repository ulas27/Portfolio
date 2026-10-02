package com.example.map_st.util;

import android.content.Context;
import android.content.SharedPreferences;

/**
 * Small key-value store for goals. Keeps code easy to explain in a viva.
 */
public class AppPrefs {

    private static final String PREFS = "map_st_prefs";
    private static final String KEY_GOAL_MINUTES = "daily_goal_minutes";
    private static final String KEY_GOAL_NOTIFY_DAY = "goal_notify_day";

    private AppPrefs() {
    }

    private static SharedPreferences prefs(Context context) {
        return context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    /** 0 means goal notifications are off. */
    public static int getDailyGoalMinutes(Context context) {
        return prefs(context).getInt(KEY_GOAL_MINUTES, 0);
    }

    public static void setDailyGoalMinutes(Context context, int minutes) {
        int v = Math.max(0, minutes);
        prefs(context).edit().putInt(KEY_GOAL_MINUTES, v).apply();
    }

    /** Last calendar day (yyyy-MM-dd) we showed the goal notification, to avoid spamming. */
    public static String getGoalNotifyDay(Context context) {
        return prefs(context).getString(KEY_GOAL_NOTIFY_DAY, "");
    }

    public static void setGoalNotifyDay(Context context, String yyyyMmDd) {
        prefs(context).edit().putString(KEY_GOAL_NOTIFY_DAY, yyyyMmDd != null ? yyyyMmDd : "").apply();
    }
}
