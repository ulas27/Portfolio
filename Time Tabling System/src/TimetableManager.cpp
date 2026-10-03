#include <iostream>
#include <algorithm>
#include <cctype>
#include <limits>
#include "TimetableManager.hpp"
#include "Room.hpp"
#include "Lecturer.hpp"
#include "Module.hpp"
#include "StudentGroup.hpp"
#include "Student.hpp"
#include "TimetableEntry.hpp"
#include "utility.hpp"
#include "DataManager.hpp"

const Student* TimetableManager::findStudentByIdAndName(const std::string& id, const std::string& name) const {
    std::string searchId = toLower(id);
    std::string searchName = toLower(name);

    for (const auto& student : students) {
        if (toLower(student.getId()) == searchId && toLower(student.getName()) == searchName) {
            return &student;
        }
    }
    return nullptr;
}

const Lecturer* TimetableManager::findLecturerByID(const std::string& id) const {
    for (const auto& lecturer : lecturers) {
        if (toLower(lecturer.getID()) == toLower(id)) {
            return &lecturer;
        }
    }
    return nullptr;
}

void TimetableManager::populateDisplayNames(TimetableEntry& entry) const {
    const Lecturer* lecturer = dataManager->getLecturerById(entry.lecturerID);
    const Room* room = dataManager->getRoomById(entry.roomID);
    const StudentGroup* group = dataManager->getStudentGroupById(entry.groupID);

    if (lecturer) entry.lecturerName = lecturer->getName();
    if (room) entry.roomDisplayName = room->getName();
    if (group) entry.groupName = group->getName();
}

void TimetableManager::addRoom(const Room& room) { rooms.push_back(room); }
void TimetableManager::addLecturer(const Lecturer& lecturer) { lecturers.push_back(lecturer); }
void TimetableManager::addModule(const Module& module) { modules.push_back(module); }
void TimetableManager::addStudentGroup(const StudentGroup& group) { studentGroups.push_back(group); }
void TimetableManager::addStudent(const Student& student) { students.push_back(student); }

void TimetableManager::addTimetableEntry(const TimetableEntry& entry) {
    timetableEntries.push_back(entry);
    dataManager->addTimetableEntry(entry);
}

void TimetableManager::searchByDay(const std::string& day) const {
    std::string query = toLower(trim(day));
    bool found = false;

    for (const auto& entry : dataManager->getTimetable()) {
        if (toLower(entry.day) == query) {
            displayEntry(entry);
            found = true;
        }
    }

    if (!found) {
        std::cout << "No entries found for day: " << day << "\n";
    }
}

void TimetableManager::searchByModule(const std::string& moduleCode) const {
    std::string query = toLower(trim(moduleCode));
    bool found = false;

    for (const auto& entry : dataManager->getTimetable()) {
        if (toLower(entry.moduleCode) == query) {
            displayEntry(entry);
            found = true;
        }
    }

    if (!found) {
        std::cout << "No entries found for module code: " << moduleCode << "\n";
    }
}

void TimetableManager::searchByLecturer(const std::string& lecturerID) const {
    std::string query = toLower(trim(lecturerID));
    bool found = false;

    for (const auto& entry : dataManager->getTimetable()) {
        if (toLower(entry.lecturerID) == query) {
            displayEntry(entry);
            found = true;
        }
    }

    if (!found) {
        std::cout << "No entries found for lecturer ID: " << lecturerID << "\n";
    }
}

void TimetableManager::viewTimetableForStudent(const std::string& studentName, const std::string& groupID) {
    int week;
    std::cout << "Enter week number to view timetable (e.g., 1): ";
    std::cin >> week;

    bool found = false;

    for (auto entry : dataManager->getTimetable()) {
        if (toLower(entry.groupID) == toLower(groupID) && entry.weekNumber == week) {
            populateDisplayNames(entry); // Eksik isimleri doldur

            std::cout << entry.day << " " << entry.time << " | " << entry.moduleCode
                      << " (" << entry.sessionType << ") in " << entry.roomDisplayName
                      << " [Lecturer: " << entry.lecturerName << "]\n";

            found = true;
        }
    }

    if (!found) {
        std::cout << "No timetable entries found for week " << week << " and group " << groupID << ".\n";
    }
}


void TimetableManager::deleteTimetableEntry() {
    std::string moduleCode, day, time;
    std::cin.ignore();
    std::cout << "Enter module code of entry to delete: ";
    std::getline(std::cin, moduleCode);
    std::cout << "Enter day: ";
    std::getline(std::cin, day);
    std::cout << "Enter time: ";
    std::getline(std::cin, time);

    moduleCode = toLower(trim(moduleCode));
    day = toLower(trim(day));
    time = normalizeTime(time);

    auto& entries = dataManager->getTimetableEntries();
    auto it = std::remove_if(entries.begin(), entries.end(),
        [&](const TimetableEntry& entry) {
            return toLower(entry.moduleCode) == moduleCode &&
                   toLower(entry.day) == day &&
                   normalizeTime(entry.time) == time;
        });

    if (it != entries.end()) {
        entries.erase(it, entries.end());
        std::cout << "Timetable entry deleted successfully.\n";
        dataManager->saveTimetable();
    } else {
        std::cout << "No matching entry found to delete.\n";
    }
}

void TimetableManager::editTimetableEntry() {
    std::string code, day, time;

    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

    std::cout << "Enter module code of entry to edit: ";
    std::getline(std::cin, code);
    std::cout << "Enter day: ";
    std::getline(std::cin, day);
    std::cout << "Enter time: ";
    std::getline(std::cin, time);

    time = normalizeTime(time);
    bool found = false;

    for (auto& entry : dataManager->getTimetable()) {
        if (toLower(entry.moduleCode) == toLower(code) &&
            toLower(entry.day) == toLower(day) &&
            toLower(entry.time) == toLower(time)) {

            found = true;
            std::string newDay, newTime;

            std::cout << "Current Day: " << entry.day << "\n";
            std::cout << "Enter new day (leave empty to keep): ";
            std::getline(std::cin, newDay);
            if (!newDay.empty()) entry.day = newDay;

            std::cout << "Current Time: " << entry.time << "\n";
            std::cout << "Enter new time (leave empty to keep): ";
            std::getline(std::cin, newTime);
            if (!newTime.empty()) entry.time = normalizeTime(newTime);

            dataManager->saveTimetable();
            std::cout << "Timetable entry updated successfully.\n";
            break;
        }
    }

    if (!found) {
        std::cout << "No matching timetable entry found.\n";
    }
}

void TimetableManager::searchByGroup() {
    std::string groupID;
    std::cout << "Enter student group ID to search: ";
    std::getline(std::cin, groupID);

    auto results = dataManager->searchEntriesByGroup(groupID);

    if (results.empty()) {
        std::cout << "No entries found for group ID: " << groupID << "\n";
    } else {
        for (auto entry : results) {
            populateDisplayNames(entry);
            printTimetableEntry(entry);
        }
    }
}

void TimetableManager::searchByTime() {
    std::string time;
    std::cout << "Enter time (e.g. 10:00): ";
    std::getline(std::cin, time);
    time = normalizeTime(time);

    auto results = dataManager->searchEntriesByTime(time);

    if (results.empty()) {
        std::cout << "No entries found at time: " << time << "\n";
    } else {
        for (auto entry : results) {
            populateDisplayNames(entry);
            printTimetableEntry(entry);
        }
    }
}

void TimetableManager::displayEntry(const TimetableEntry& entry) const {
    TimetableEntry temp = entry;
    populateDisplayNames(temp);
    std::cout << temp.day << " " << temp.time
              << " | " << temp.moduleCode << " (" << temp.sessionType << ") in "
              << temp.roomDisplayName << " [Lecturer: " << temp.lecturerName << "]\n";
}
