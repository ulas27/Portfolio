#ifndef STUDENTMANAGER_HPP
#define STUDENTMANAGER_HPP

#include "User.hpp"
#include "DataManager.hpp"
#include "Student.hpp"
#include <string>

class StudentManager : public User {
private:
    DataManager& dataManager;
    Student* currentStudent = nullptr;

public:
    StudentManager(DataManager& dm);
    
    void setCurrentStudent(Student* student);
    void viewTimetable(int week);
    void searchByLecturer(const std::string& lecturerName);
    void exportToCSV(int week);
    void showMenu(); 

};

#endif
