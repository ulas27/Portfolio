#ifndef TIMETABLE_ENTRY_HPP
#define TIMETABLE_ENTRY_HPP

#include <string>

struct TimetableEntry {
  int weekNumber;
  std::string lecturerID;
  std::string day;
  std::string time;
  std::string moduleCode;
  std::string groupID;
  std::string sessionType;
  std::string roomID;
  std::string lecturerName;
  std::string groupName;
  std::string roomDisplayName;
  std::string notes;
  std::string endTime;  // <-- EKLENDİ

  TimetableEntry() = default;

  TimetableEntry(int weekNumber,
                 const std::string& lecturerID,
                 const std::string& day,
                 const std::string& time,
                 const std::string& moduleCode,
                 const std::string& groupID,
                 const std::string& sessionType,
                 const std::string& roomID)
      : weekNumber(weekNumber),
        lecturerID(lecturerID),
        day(day),
        time(time),
        moduleCode(moduleCode),
        groupID(groupID),
        sessionType(sessionType),
        roomID(roomID) {}
};

#endif // TIMETABLE_ENTRY_HPP
