package com.example.map_st.util;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;

import com.example.map_st.R;

/**
 * One notification channel + a single "goal exceeded" ping per day.
 */
public class ScreenTimeNotifications {

    private static final String CHANNEL_ID = "screen_time_goal";
    private static final int NOTIFY_ID_GOAL = 1001;

    private ScreenTimeNotifications() {
    }

    public static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager nm = context.getSystemService(NotificationManager.class);
        if (nm == null) return;
        NotificationChannel ch = new NotificationChannel(
                CHANNEL_ID,
                context.getString(R.string.notif_channel_name),
                NotificationManager.IMPORTANCE_DEFAULT
        );
        nm.createNotificationChannel(ch);
    }

    /**
     * If daily goal is set and today's usage is above it, show at most one notification per calendar day.
     */
    public static void maybeNotifyDailyGoalExceeded(Context context, long todayForegroundMs) {
        int goalMin = AppPrefs.getDailyGoalMinutes(context);
        if (goalMin <= 0) return;

        long goalMs = goalMin * 60_000L;
        if (todayForegroundMs < goalMs) return;

        String today = DayKey.today();
        if (today.equals(AppPrefs.getGoalNotifyDay(context))) return;

        if (Build.VERSION.SDK_INT >= 33) {
            int granted = ContextCompat.checkSelfPermission(context, android.Manifest.permission.POST_NOTIFICATIONS);
            if (granted != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                return;
            }
        }

        ensureChannel(context);

        NotificationCompat.Builder b = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(context.getString(R.string.notif_goal_title))
                .setContentText(context.getString(R.string.notif_goal_text, goalMin))
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setAutoCancel(true);

        NotificationManagerCompat.from(context).notify(NOTIFY_ID_GOAL, b.build());
        AppPrefs.setGoalNotifyDay(context, today);
    }
}
