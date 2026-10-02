package com.example.map_st.util;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

public class DayKey {
    private DayKey() {
    }

    /** Midnight at the start of the day that is {@code daysBeforeToday} days before today (0 = today). */
    public static long startOfDayMillis(int daysBeforeToday) {
        Calendar cal = Calendar.getInstance(Locale.getDefault());
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        cal.add(Calendar.DAY_OF_YEAR, -daysBeforeToday);
        return cal.getTimeInMillis();
    }

    public static String today() {
        return format(new Date());
    }

    public static String format(Date d) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        return sdf.format(d);
    }

    public static String formatDayMillis(long dayStartMillis) {
        return format(new Date(dayStartMillis));
    }
}

