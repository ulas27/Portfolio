#include "StudentManager.hpp"
#include <iostream>
#include <cstddef>
#include <fstream>
#include <string> 
#include "utility.hpp"

StudentManager::StudentManager(DataManager& dm) : dataManager(dm) {}

void StudentManager::viewTimetable(int week) {
    if (!currentStudent) {
        std::cout << "No student is currently logged in.\n";
        return;
    }

    std::string studentGroupID = currentStudent->getGroupID();

    std::cout << "--- Week " << week << " Timetable for Group " << studentGroupID << " ---\n";
    for (const auto& entry : dataManager.getTimetable()) {
        if (entry.weekNumber == week && entry.groupID == studentGroupID) {
            std::cout << entry.day << " " << entry.time << " | "
                      << entry.moduleCode << " (" << entry.sessionType 
                      << ") in " << entry.roomDisplayName << "\n";
        }
    }
}

void StudentManager::searchByLecturer(const std::string& lecturerID) {
    if (!currentStudent) {
        std::cout << "No student is currently logged in.\n";
        return;
    }

    std::string studentGroupID = currentStudent->getGroupID();

    std::cout << "--- Sessions by Lecturer ID: " << lecturerID << " for Group " << studentGroupID << " ---\n";
    for (const auto& entry : dataManager.getTimetable()) {
        if (entry.lecturerID == lecturerID && entry.groupID == studentGroupID) {
            std::cout << "Week " << entry.weekNumber << ": " 
                      << entry.day << " " << entry.time << " | "
                      << entry.moduleCode << " (" << entry.sessionType 
                      << ") in " << entry.roomDisplayName << "\n";
        }
    }
}


void StudentManager::exportToCSV(int week) {
    if (!currentStudent) {
        std::cerr << "No student is currently logged in.\n";
        return;
    }

    std::string studentGroupID = currentStudent->getGroupID();
    std::ofstream file("week_" + std::to_string(week) + "_" + studentGroupID + ".csv");

    if (!file.is_open()) {
        std::cerr << "Dosya açılamadı!\n";
        return;
    }

    file << "Day,Time,Module,Type,Room\n";
    for (const auto& entry : dataManager.getTimetable()) {
        if (entry.weekNumber == week && entry.groupID == studentGroupID) {
            file << entry.day << "," << entry.time << "," 
                 << entry.moduleCode << "," << entry.sessionType 
                 << "," << entry.roomDisplayName << "\n";
        }
    }

    std::cout << "Exported to CSV!\n";
}

void StudentManager::setCurrentStudent(Student* student) {
    currentStudent = student;
}


void StudentManager::showMenu() {
    int choice;
    while (true) {
        std::cout << "\n1. View Timetable\n2. Search by Lecturer\n3. Export Week to CSV\n4. Logout\nChoice: ";
        std::cin >> choice;

        if (choice == 1) {
            int week;
            std::cout << "Enter week number: ";
            std::cin >> week;
            viewTimetable(week);
        } else if (choice == 2) {
            std::string lecturerID;
            std::cout << "Enter lecturer ID: ";
            std::cin >> lecturerID;
            searchByLecturer(lecturerID);
        } else if (choice == 3) {
            int week;
            std::cout << "Enter week number: ";
            std::cin >> week;
            exportToCSV(week);
        } else if (choice == 4) {
            std::cout << "Logging out...\n";
            break;
        } else {
            std::cout << "Invalid choice.\n";
        }
    }
}
