#pragma once
#include <string>
#include <algorithm>
#include <cctype>

inline std::string trim(const std::string& str) {
    const auto strBegin = str.find_first_not_of(" \t\n\r\f\v");
    if (strBegin == std::string::npos)
        return "";

    const auto strEnd = str.find_last_not_of(" \t\n\r\f\v");
    const auto strRange = strEnd - strBegin + 1;

    return str.substr(strBegin, strRange);
}

inline std::string toLower(const std::string& str) {
    std::string lowered = str;
    std::transform(lowered.begin(), lowered.end(), lowered.begin(), ::tolower);
    return lowered;
}

inline std::string normalizeTime(const std::string& time) {
    std::string t = toLower(trim(time));
    std::replace(t.begin(), t.end(), '.', ':');

    // Saat formatı tek karakterden oluşabilir, örn: "9" → "09:00"
    if (t.size() == 1 && std::isdigit(t[0])) {
        return "0" + t + ":00";
    }

    // Eğer saat kısmı ":" içeriyorsa ve sadece saatse, dakikayı tamamla
    size_t colonPos = t.find(':');
    if (colonPos != std::string::npos) {
        std::string hour = t.substr(0, colonPos);
        std::string minute = t.substr(colonPos + 1);
        if (minute.empty()) minute = "00";
        if (hour.length() == 1) hour = "0" + hour;
        if (minute.length() == 1) minute = "0" + minute;
        return hour + ":" + minute;
    }

    // Eğer saat ve dakika yoksa, varsayalım ki tam sayı girildi → 9 → 09:00, 14 → 14:00
    if (std::all_of(t.begin(), t.end(), ::isdigit)) {
        if (t.length() == 1) t = "0" + t;
        return t + ":00";
    }

    return t; // zaten düzgünse olduğu gibi dön
}
