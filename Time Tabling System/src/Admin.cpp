#include "Admin.hpp"
#include <iostream>
#include "utility.hpp"

Admin::Admin(DataManager& dm, AdminManager& adminMgr, TimetableManager& ttm)
    : dataManager(dm), adminManager(adminMgr), timetableManager(ttm) {}

    void Admin::showMenu() {
        int choice;
        do {
            std::cout << "\n--- Admin Menu ---\n";
            std::cout << "1. Manage Courses\n";
            std::cout << "2. Manage Lecturers\n";
            std::cout << "3. Manage Student Groups\n";
            std::cout << "4. Manage Timetable\n";
            std::cout << "5. Search Timetable\n";
            std::cout << "6. Logout\n";
            std::cout << "7. Add Student\n";
            std::cout << "Choice: ";
            std::cin >> choice;
            std::cin.ignore();
    
            switch (choice) {
                case 1:
                    adminManager.manageCourses();
                    break;
                case 2:
                    adminManager.manageInstructors();
                    break;
                case 3:
                    adminManager.manageStudentGroups();
                    break;
                case 4:
                    adminManager.manageTimetable();
                    break;
                case 5: {
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
                            timetableManager.searchByDay(query);
                            break;
                        case 2:
                            std::cout << "Enter module code: ";
                            std::getline(std::cin, query);
                            timetableManager.searchByModule(query);
                            break;
                        case 3:
                            std::cout << "Enter lecturer ID: ";
                            std::getline(std::cin, query);
                            timetableManager.searchByLecturer(query);
                            break;
                        default:
                            std::cout << "Invalid search choice.\n";
                            break;
                    }
                    break;
                }
                

                case 6:
                    std::cout << "Logging out...\n";
                    break;
                    case 7:
    adminManager.addStudent();
    break;

                default:
                    std::cout << "Invalid choice.\n";
            }
        } while (choice != 6);
    }
    

void Admin::sessionTypeMenu() {
    int choice;
    do {
        std::cout << "\n--- Session Type Menu ---\n";
        std::cout << "1. Manage Courses\n";
        std::cout << "2. Manage Instructors\n";
        std::cout << "3. Return\n";
        std::cout << "Choice: ";
        std::cin >> choice;

        switch (choice) {
            case 1:
                adminManager.manageCourses();
                break;
            case 2:
                adminManager.manageInstructors();
                break;
            case 3:
                std::cout << "Returning...\n";
                break;
            default:
                std::cout << "Invalid choice.\n";
        }
    } while (choice != 3);
}
