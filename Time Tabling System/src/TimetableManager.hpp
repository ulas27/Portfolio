#pragma once
#include "AdminManager.hpp"
#include "TimetableEntry.hpp"
#include "DataManager.hpp" 
#include <vector>
#include <string>
#include "Room.hpp"
#include "Lecturer.hpp"
#include "Module.hpp"
#include "StudentGroup.hpp"
#include "Student.hpp"
#include "TimetableUtils.hpp"

class TimetableManager {
private:
    std::vector<TimetableEntry> entries;
    std::vector<Room> rooms;
    std::vector<Lecturer> lecturers;
    std::vector<Module> modules;
    std::vector<StudentGroup> studentGroups;
    std::vector<TimetableEntry> timetableEntries;
    DataManager* dataManager = nullptr;
    std::string studentGroupID;
    std::vector<Student> students;

public:
    DataManager& getDataManager();
    void displayEntry(const TimetableEntry& entry) const;

    void searchByModule();
    void searchByLecturer();
    void searchByGroup();
    void searchByTime();

    const Student* findStudentByIdAndName(const std::string& id, const std::string& name) const;
    const Lecturer* findLecturerByID(const std::string& id) const;
    void addEntry(const TimetableEntry& entry);
    void displayTimetableByGroupAndWeek(const std::string& group, int week) const;
    bool hasConflict(const TimetableEntry& newEntry) const;
    void exportTimetableToCSV(const std::string& group, int week, const std::string& filename) const;
    void addRoom(const Room& room);
    void addLecturer(const Lecturer& lecturer);
    void addModule(const Module& module);
    void addStudentGroup(const StudentGroup& group);
    void addStudent(const Student& student);
    void addTimetableEntry(const TimetableEntry& entry);
    
    void setDataManager(DataManager* dm) {
        dataManager = dm;
    }

    void searchByDay(const std::string& day) const;
    void searchByModule(const std::string& moduleCode) const;
    void searchByLecturer(const std::string& lecturerID) const;
    void viewTimetableForStudent(const std::string& studentName, const std::string& groupID);
    void deleteTimetableEntry();
    void populateDisplayNames(TimetableEntry& entry) const;
    void editTimetableEntry();
};
