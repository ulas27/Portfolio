#pragma once
#include <vector>
#include <string>
#include <iostream>
#include <algorithm>

#include "Module.hpp"
#include "Lecturer.hpp"
#include "Room.hpp"
#include "StudentGroup.hpp"
#include "TimeSlot.hpp"
#include "Session.hpp"
#include "SessionType.hpp"
#include "TimetableEntry.hpp"
#include "Student.hpp"

class DataManager {
private:
    std::vector<Module> modules;
    std::vector<Lecturer> instructors;
    std::vector<Room> rooms;
    std::vector<StudentGroup> studentGroups;
    std::vector<TimeSlot> timeslots;
    std::vector<Session> sessions;
    std::vector<SessionType> sessionTypes;
    std::vector<TimetableEntry> timetable;
    std::vector<Student> students;
    std::vector<TimetableEntry> timetableEntries;


    bool equalsIgnoreCase(const std::string& a, const std::string& b) const;

public:
    // Student Group management
    const std::vector<StudentGroup>& getAllStudentGroups() const;
    const StudentGroup* getStudentGroupById(const std::string& id) const;
    bool removeStudentGroup(const std::string& id);
    void saveStudentsToFile();
    void loadStudentsFromFile(const std::string& filename); // yeni
    const Student* getStudentByIdAndName(const std::string& id, const std::string& name) const;



    bool saveTimetableToFile(const std::string& filename);
    void loadLecturers();

    void loadTimetable();
    void saveTimetable();
    bool deleteTimetableEntry(const std::string& code, const std::string& day, const std::string& time);
    std::vector<TimetableEntry> searchEntriesByModule(const std::string& moduleCode) const;
    std::vector<TimetableEntry> searchEntriesByLecturer(const std::string& lecturerID) const;
    std::vector<TimetableEntry> searchEntriesByGroup(const std::string& groupID) const;
    std::vector<TimetableEntry> searchEntriesByTime(const std::string& time) const;
    std::vector<TimetableEntry> searchEntriesByDay(const std::string& day) const;

    void updateModuleCodeInTimetable(const std::string& oldCode, const std::string& newCode);



     // Constructor
     std::vector<TimetableEntry>& getTimetableEntries();
     const std::vector<TimetableEntry>& getTimetableEntries() const;
     

    // Export
    void exportTimetableToCSV(const std::string& studentName, int week, const std::string& filename) const;

    // Session Types
    void addSessionType(const std::string& name);
    void listSessionTypes() const;
    void editSessionType(const std::string& oldName, const std::string& newName);
    void deleteSessionType(const std::string& name);

    // Modules
    void loadModules();
    void saveModules();
    std::vector<Module>& getModules();

    // Timetable
    std::vector<TimetableEntry>& getTimetable();
    void loadData();

    // Adders
    void addRoom(const Room& room);
    void addLecturer(const Lecturer& lecturer);
    void addModule(const Module& module);
    void addStudentGroup(const StudentGroup& group);
    void addStudent(const Student& student);
    void addTimetableEntry(const TimetableEntry& entry);
    void saveLecturers();
    const std::vector<Student>& getStudents() const;

    // Getters
    const std::vector<Lecturer>& getLecturers() const { return instructors; }
    std::vector<Lecturer>& getLecturers();

    const std::vector<Room>& getRooms() const { return rooms; }
    const std::vector<StudentGroup>& getStudentGroups() const { return studentGroups; }
    const std::vector<SessionType>& getSessionTypes() const { return sessionTypes; }

    // Lookups
    const Lecturer* getLecturerById(const std::string& id) const;
    const Module* getModuleByCode(const std::string& code) const;
    const Room* getRoomById(const std::string& id) const;
    const Student* getStudentById(const std::string& id) const;
};
