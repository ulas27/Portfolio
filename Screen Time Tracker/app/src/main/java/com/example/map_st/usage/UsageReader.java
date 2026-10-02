package com.example.map_st.usage;

import android.app.AppOpsManager;
import android.app.usage.UsageEvents;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Build;

import com.example.map_st.util.DayKey;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class UsageReader {

    private UsageReader() {
    }

    public static boolean hasUsageAccess(Context context) {
        AppOpsManager appOps = (AppOpsManager) context.getSystemService(Context.APP_OPS_SERVICE);
        int mode;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            mode = appOps.unsafeCheckOpNoThrow("android:get_usage_stats", android.os.Process.myUid(),
                    context.getPackageName());
        } else {
            mode = appOps.checkOpNoThrow("android:get_usage_stats", android.os.Process.myUid(),
                    context.getPackageName());
        }
        return mode == AppOpsManager.MODE_ALLOWED;
    }

    public static UsageSnapshot readToday(Context context) {
        long start = startOfTodayMs();
        long end = System.currentTimeMillis();

        UsageSnapshot snap = new UsageSnapshot();
        Map<String, Long> totals = readUsageTotals(context, start, end);
        long sum = 0L;
        for (Long v : totals.values()) {
            if (v != null) sum += v;
        }
        snap.totalForegroundMs = sum;
        snap.pickupsApprox = countPickupsApprox(context, start, end);
        return snap;
    }

    public static List<AppUsageItem> readTodayTopApps(Context context, int limit) {
        long start = startOfTodayMs();
        long end = System.currentTimeMillis();
        Map<String, Long> totals = readUsageTotals(context, start, end);

        List<Map.Entry<String, Long>> entries = new ArrayList<>(totals.entrySet());
        entries.sort((a, b) -> Long.compare(b.getValue(), a.getValue()));

        PackageManager pm = context.getPackageManager();
        List<AppUsageItem> out = new ArrayList<>();
        int added = 0;
        for (Map.Entry<String, Long> e : entries) {
            if (added >= limit) break;
            String pkg = e.getKey();
            long ms = e.getValue() != null ? e.getValue() : 0L;
            if (ms <= 0) continue;

            String label = pkg;
            try {
                ApplicationInfo info = pm.getApplicationInfo(pkg, 0);
                CharSequence cs = pm.getApplicationLabel(info);
                if (cs != null) label = cs.toString();
            } catch (PackageManager.NameNotFoundException ignored) {
            }

            out.add(new AppUsageItem(pkg, label, ms));
            added++;
        }
        return out;
    }

    /** Foreground time for one package between {@code start} and {@code end} (inclusive start, exclusive end is OK for our queries). */
    public static long readPackageForegroundMs(Context context, String packageName, long start, long end) {
        if (packageName == null) return 0L;
        Map<String, Long> totals = readUsageTotals(context, start, end);
        Long v = totals.get(packageName);
        return v == null ? 0L : v;
    }

    /** Last 7 calendar days including today; oldest first. Requires usage access. */
    public static List<PkgDayUsage> readPackageLast7Days(Context context, String packageName) {
        List<PkgDayUsage> out = new ArrayList<>();
        long now = System.currentTimeMillis();
        for (int d = 6; d >= 0; d--) {
            long dayStart = DayKey.startOfDayMillis(d);
            long dayEnd = (d == 0) ? now : DayKey.startOfDayMillis(d - 1);
            long ms = readPackageForegroundMs(context, packageName, dayStart, dayEnd);
            String key = DayKey.formatDayMillis(dayStart);
            out.add(new PkgDayUsage(key, ms));
        }
        return out;
    }

    private static Map<String, Long> readUsageTotals(Context context, long start, long end) {
        UsageStatsManager usm = (UsageStatsManager) context.getSystemService(Context.USAGE_STATS_SERVICE);
        if (usm == null) return Collections.emptyMap();

        List<UsageStats> stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, start, end);
        if (stats == null) return Collections.emptyMap();

        Map<String, Long> totals = new HashMap<>();
        for (UsageStats s : stats) {
            if (s == null) continue;
            String pkg = s.getPackageName();
            if (pkg == null) continue;
            long ms = s.getTotalTimeInForeground();
            Long prev = totals.get(pkg);
            totals.put(pkg, (prev == null ? 0L : prev) + ms);
        }
        return totals;
    }

    private static int countPickupsApprox(Context context, long start, long end) {
        UsageStatsManager usm = (UsageStatsManager) context.getSystemService(Context.USAGE_STATS_SERVICE);
        if (usm == null) return 0;

        UsageEvents events = usm.queryEvents(start, end);
        if (events == null) return 0;

        int count = 0;
        UsageEvents.Event e = new UsageEvents.Event();
        while (events.hasNextEvent()) {
            events.getNextEvent(e);
            if (e.getEventType() == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                count++;
            }
        }
        return count;
    }

    private static long startOfTodayMs() {
        Calendar cal = Calendar.getInstance(Locale.getDefault());
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal.getTimeInMillis();
    }
}

