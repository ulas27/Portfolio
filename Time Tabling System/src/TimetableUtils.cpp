#include "TimetableUtils.hpp"
#include <iostream>

void printTimetableEntry(const TimetableEntry& entry) {
    std::cout << "Module: " << entry.moduleCode
              << ", Lecturer ID: " << entry.lecturerID
              << ", Group ID: " << entry.groupID
              << ", Day: " << entry.day
              << ", Time: " << entry.time << std::endl;
}
