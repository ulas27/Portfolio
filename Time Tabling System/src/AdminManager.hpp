#pragma once
#include <vector>
#include <string>
#include "Module.hpp"
#include "Lecturer.hpp"
#include "DataManager.hpp"


class AdminManager {
private:
    std::vector<Module> modules;
    std::vector<Lecturer> lecturers;
    DataManager& dataManager;
    TimetableManager* timetableManager = nullptr;


public:
    AdminManager(DataManager& dm) : dataManager(dm) {}
    void manageStudentGroups();
    void addTimetableEntry();
    void addStudent();

    void manageCourses();
    void manageInstructors();
    void editTimetableEntry();


    // Course functions
    void addCourse();
    void listCourses();

    // Instructor functions
    void addInstructor();
    void listInstructors();

    void editCourse();
    void deleteCourse();
    void editInstructor();
    void deleteInstructor();
    
    void editLecturer();
    void deleteLecturer();
    void addLecturer();
    void listLecturers();
    void manageTimetable(); // yeni menü fonksiyonu
    void setTimetableManager(TimetableManager* tm); // setter

};
