package com.example.map_st.usage;

public class AppUsageItem {
    public final String packageName;
    public final String appLabel;
    public final long foregroundMs;

    public AppUsageItem(String packageName, String appLabel, long foregroundMs) {
        this.packageName = packageName;
        this.appLabel = appLabel;
        this.foregroundMs = foregroundMs;
    }
}

