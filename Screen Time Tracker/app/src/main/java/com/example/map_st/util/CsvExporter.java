package com.example.map_st.util;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;

import androidx.core.content.FileProvider;

import com.example.map_st.R;
import com.example.map_st.data.DailySummaryEntity;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

public class CsvExporter {

    private CsvExporter() {
    }

    public static File writeToCache(Context context, List<DailySummaryEntity> rows) throws IOException {
        File dir = new File(context.getCacheDir(), "exports");
        if (!dir.exists() && !dir.mkdirs()) {
            throw new IOException("Could not create export folder");
        }
        File out = new File(dir, "screen_time_history.csv");
        StringBuilder sb = new StringBuilder();
        sb.append("day,total_foreground_ms,pickups_approx\n");
        if (rows != null) {
            for (DailySummaryEntity e : rows) {
                if (e == null) continue;
                sb.append(e.day).append(',')
                        .append(e.totalForegroundMs).append(',')
                        .append(e.pickupsApprox).append('\n');
            }
        }
        try (FileOutputStream fos = new FileOutputStream(out)) {
            fos.write(sb.toString().getBytes(StandardCharsets.UTF_8));
        }
        return out;
    }

    public static Intent buildShareIntent(Context context, File file) {
        Uri uri = FileProvider.getUriForFile(
                context,
                context.getPackageName() + ".fileprovider",
                file
        );
        Intent send = new Intent(Intent.ACTION_SEND);
        send.setType("text/csv");
        send.putExtra(Intent.EXTRA_STREAM, uri);
        send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        return Intent.createChooser(send, context.getString(R.string.share_csv_chooser));
    }
}
