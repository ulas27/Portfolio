#include "Student.hpp"
#include <iostream>
#include <fstream>
#include "TimetableManager.hpp"
#include "DataManager.hpp"
#include "TimetableEntry.hpp"
#include "utility.hpp"

Student::Student(const std::string& id, const std::string& name, const std::string& group)
    : studentID(id), name(name), groupID(group), dataManager(nullptr), timetableManager(nullptr) {}

Student::Student(const std::string& id, const std::string& name, const std::string& group, DataManager& dm, TimetableManager& ttm)
    : studentID(id), name(name), groupID(group), dataManager(&dm), timetableManager(&ttm) {}

void Student::displayInfo() const {
    std::cout << "Student Name: " << name << "\n";
    std::cout << "Student ID: " << studentID << "\n";
    std::cout << "Group ID: " << groupID << "\n";
}

void Student::viewTimetable(int week) const {
    std::cout << "--- Week " << week << " Timetable for " << name << " ---\n";
    for (const auto& entry : dataManager->getTimetable()) {
        if (entry.weekNumber == week && entry.groupID == groupID) {
            std::cout << entry.day << " " << entry.time << " | "
                      << entry.moduleCode << " (" << entry.sessionType 
                      << ") in " << entry.roomID << "\n";
        }
    }
}

void Student::addNotes(int week, const std::string& moduleCode, const std::string& notes) {
    std::string filename = "notes_" + studentID + ".txt";
    std::ofstream file(filename, std::ios::app);
    if (file.is_open()) {
        file << "Week " << week << " - " << moduleCode << ":\n" << notes << "\n\n";
        std::cout << "Notes saved to " << filename << "\n";
    } else {
        std::cerr << "Couldn't open notes file.\n";
    }
}

void Student::exportMyTimetableToCSV(int week, const std::string& filename) const {
    dataManager->exportTimetableToCSV(groupID, week, filename);
}

void Student::showMenu() {
    int choice;
    do {
        std::cout << "\n--- Student Menu ---\n";
        std::cout << "1. View My Timetable\n";
        std::cout << "2. Search Timetable\n";
        std::cout << "3. Logout\n";
        std::cout << "Choice: ";
        std::cin >> choice;
        std::cin.ignore();

        switch (choice) {
            case 1:
                timetableManager->viewTimetableForStudent(name, groupID);
                break;
            case 2: {
                std::cout << "\nSearch Options:\n";
                std::cout << "1. By Day\n";
                std::cout << "2. By Module Code\n";
                std::cout << "3. By Lecturer ID\n";
                int searchChoice;
                std::cin >> searchChoice;
                std::cin.ignore();

                std::string query;
                switch (searchChoice) {
                    case 1:
                        std::cout << "Enter day: ";
                        std::getline(std::cin, query);
                        timetableManager->searchByDay(query);
                        break;
                    case 2:
                        std::cout << "Enter module code: ";
                        std::getline(std::cin, query);
                        timetableManager->searchByModule(query);
                        break;
                    case 3:
                        std::cout << "Enter lecturer ID: ";
                        std::getline(std::cin, query);
                        timetableManager->searchByLecturer(query);
                        break;
                    default:
                        std::cout << "Invalid search choice.\n";
                        break;
                }
                break;
            }
            case 3:
                std::cout << "Logging out...\n";
                break;
            default:
                std::cout << "Invalid choice.\n";
        }
    } while (choice != 3);
}

void Student::showTimetable() {
    std::cout << "\n📅 Timetable for Alice (S001) - Week 1:\n";
    std::cout << "------------------------------------------------------\n";
    std::cout << "Day      | Time  | Module       | Lecturer   | Room\n";
    std::cout << "------------------------------------------------------\n";
    std::cout << "Monday   | 10:00 | Intro to CS  | Dr Smith   | MAE 202\n";
    std::cout << "------------------------------------------------------\n";
}
