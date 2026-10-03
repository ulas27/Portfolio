#include <iostream>
#include <string>
#include <algorithm>
#include "Admin.hpp"
#include "AdminManager.hpp"
#include "Student.hpp"
#include "DataManager.hpp"
#include "Lecturer.hpp"
#include "Module.hpp"
#include "Room.hpp"
#include "StudentGroup.hpp"
#include "TimetableEntry.hpp"
#include "TimetableManager.hpp"
#include "StudentManager.hpp"
#include "utility.hpp"
#include <limits>

int main() {
    DataManager dataManager;
    TimetableManager manager;
    manager.setDataManager(&dataManager);
    StudentManager studentManager(dataManager);
    AdminManager adminManager(dataManager);

    dataManager.loadData();
    dataManager.loadStudentsFromFile("student.txt");

    // 🔥 Room eklemesi - burada MAE202'yi tanıtıyoruz
    manager.addRoom(Room("mae202", "MAE202", 30));

    adminManager.setTimetableManager(&manager);
    dataManager.saveStudentsToFile();

    std::cout << "=== NTU Timetabling System ===" << std::endl;
    std::cout << "1. Admin Login\n2. Student Login\nChoice: ";

    int choice;
    std::cin >> choice;
    std::cin.ignore();

    if (choice == 1) {
        std::string username, password;
        std::cout << "Enter admin username: ";
        std::getline(std::cin, username);
        std::cout << "Enter admin password: ";
        std::getline(std::cin, password);

        if (toLower(username) == "admin" && toLower(password) == "admin123") {
            Admin admin(dataManager, adminManager, manager);
            admin.showMenu();
        } else {
            std::cout << "Invalid credentials.\n";
        }
    } else if (choice == 2) {
        std::string enteredID, enteredName;
        std::cout << "Enter Student ID: ";
        std::getline(std::cin >> std::ws, enteredID);
        std::cout << "Enter Student Name: ";
        std::getline(std::cin >> std::ws, enteredName);

        Student* foundStudent = nullptr;

        for (auto& student : dataManager.getStudents()) {
            if (toLower(student.getId()) == toLower(enteredID) &&
                toLower(student.getName()) == toLower(enteredName)) {
                foundStudent = new Student(student.getId(), student.getName(), student.getGroupID(), dataManager, manager);
                break;
            }
        }

        if (foundStudent) {
            studentManager.setCurrentStudent(foundStudent);
            foundStudent->showMenu();
            delete foundStudent;
        } else {
            std::cout << "Student not found. Please check your name and ID.\n";
        }
    } else {
        std::cout << "Invalid choice!" << std::endl;
    }


    

    return 0;
}
