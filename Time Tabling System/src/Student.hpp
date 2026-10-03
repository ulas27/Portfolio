#pragma once
#include <string>

class DataManager;
class TimetableManager;

class Student {
private:
    std::string studentID;
    std::string name;
    std::string groupID;
    DataManager* dataManager;
    TimetableManager* timetableManager;

public:
    Student(const std::string& id, const std::string& name, const std::string& group, DataManager& dm, TimetableManager& ttm);
    Student(const std::string& id, const std::string& name, const std::string& groupId);
    std::string getId() const { return studentID; }
    std::string getName() const { return name; }
    std::string getGroupID() const { return groupID; }
    void showTimetable();

    void showMenu();
    void displayInfo() const;
    void viewTimetable(int week) const;
    void addNotes(int week, const std::string& moduleCode, const std::string& notes);
    void exportMyTimetableToCSV(int week, const std::string& filename) const;
};
