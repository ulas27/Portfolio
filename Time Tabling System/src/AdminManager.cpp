#include "AdminManager.hpp"
#include <iostream>
#include <algorithm>
#include <limits>
#include "utility.hpp"
#include "DataManager.hpp"
#include "TimetableManager.hpp"
#include <fstream>
#include <sstream>



void AdminManager::manageCourses() {
    int choice;
    do {
        std::cout << "\n--- Manage Courses ---\n";
        std::cout << "1. Add Course\n";
        std::cout << "2. List Courses\n";
        std::cout << "3. Edit Course\n";
        std::cout << "4. Delete Course\n";
        std::cout << "5. Back\n";
        std::cout << "Choice: ";
        std::cin >> choice;

        switch (choice) {
            case 1: addCourse(); break;
            case 2: listCourses(); break;
            case 3: editCourse(); break;
            case 4: deleteCourse(); break;
            case 5: break;
            default: std::cout << "Invalid choice.\n";
        }
    } while (choice != 5);
}

void AdminManager::manageInstructors() {
    int choice;
    do {
        std::cout << "\n--- Manage Lecturers ---\n";
        std::cout << "1. Add Lecturer\n";
        std::cout << "2. List Lecturers\n";
        std::cout << "3. Edit Lecturer\n";
        std::cout << "4. Delete Lecturer\n";
        std::cout << "5. Back\n";
        std::cout << "Choice: ";
        std::cin >> choice;

        switch (choice) {
            case 1: addLecturer(); break;
            case 2: listInstructors(); break;
            case 3: editLecturer(); break;
            case 4: deleteLecturer(); break;
            case 5: break;
            default: std::cout << "Invalid choice.\n";
        }
    } while (choice != 5);
}

void AdminManager::addCourse() {
    std::string code, name;
    std::cout << "Enter course code: ";
    std::cin >> code;
    std::cout << "Enter course name: ";
    std::cin.ignore();
    std::getline(std::cin, name);

    dataManager.getModules().push_back(Module(code, name));
    std::cout << "Course added.\n";
}

void AdminManager::listCourses() {
    std::cout << "\n--- List of Courses ---\n";
    const auto& modules = dataManager.getModules();
    if (modules.empty()) {
        std::cout << "No courses available.\n";
        return;
    }
    for (const auto& m : modules) {
        std::cout << m.getCode() << " - " << m.getName() << "\n";
    }
}

void AdminManager::editCourse() {
    std::string code;
    std::cout << "Enter course code to edit: ";
    std::cin >> code;

    auto& modules = dataManager.getModules();
    auto it = std::find_if(modules.begin(), modules.end(), [&code](const Module& m) {
        return toLower(m.getCode()) == toLower(code);
    });

    if (it != modules.end()) {
        std::string newCode, newName;
        int newCredits;

        std::cout << "Enter new course code (current: " << it->getCode() << "): ";
        std::cin >> newCode;

        std::cout << "Enter new course name (current: " << it->getName() << "): ";
        std::cin.ignore();
        std::getline(std::cin, newName);

        std::cout << "Enter new course credits (current: " << it->getCredits() << "): ";
        std::cin >> newCredits;

        it->setCode(newCode);
        it->setName(newName);
        it->setCredits(newCredits);
        dataManager.saveModules();
        dataManager.loadTimetable();
        dataManager.updateModuleCodeInTimetable(code, newCode);


        std::cout << "Course updated.\n";
    } else {
        std::cout << "Course not found.\n";
    }
}


void AdminManager::deleteCourse() {
    std::string code;
    std::cout << "Enter course code to delete: ";
    std::cin >> code;

    auto& modules = dataManager.getModules();
    auto it = std::remove_if(modules.begin(), modules.end(),
                             [&](const Module& m) {
                                 return toLower(m.getCode()) == toLower(code);
                             });

    if (it != modules.end()) {
        modules.erase(it, modules.end());
        std::cout << "Course deleted successfully.\n";
    } else {
        std::cout << "Course not found.\n";
    }
}

void AdminManager::addLecturer() {
    std::string name, id;
    std::cout << "Enter Lecturer name: ";
    std::cin.ignore();
    std::getline(std::cin, name);

    std::cout << "Enter lecturer ID: ";
    std::getline(std::cin, id);

    dataManager.getLecturers().push_back(Lecturer(name, id));
    std::cout << "Lecturer added.\n";
}

void AdminManager::listInstructors() {
    std::cout << "\n--- List of Lecturers ---\n";
    const auto& lecturers = dataManager.getLecturers();
    if (lecturers.empty()) {
        std::cout << "No lecturers available.\n";
        return;
    }
    for (const auto& l : lecturers) {
        std::cout << l.getName() << " (" << l.getCode() << ")\n";
    }
}

void AdminManager::editLecturer() {
    std::string code;
    std::cout << "Enter lecturer code to edit: ";
    std::cin >> code;

    auto& lecturers = dataManager.getLecturers();
    auto it = std::find_if(lecturers.begin(), lecturers.end(),
        [&code](const Lecturer& l) {
            return toLower(l.getCode()) == toLower(code);
        });

    if (it != lecturers.end()) {
        std::string newCode, newName;

        std::cout << "Enter new lecturer code (current: " << it->getCode() << "): ";
        std::cin >> newCode;

        std::cout << "Enter new lecturer name (current: " << it->getName() << "): ";
        std::cin.ignore();
        std::getline(std::cin, newName);

        std::string oldCode = it->getCode();  // timetable.txt için lazım

        it->setCode(newCode);
        it->setName(newName);

        std::cout << "Lecturer updated.\n";

        dataManager.saveLecturers();

        // --- timetable.txt'yi güncelle ---
        std::ifstream inFile("timetable.txt");
        std::ofstream outFile("temp.txt");
        std::string line;

        while (std::getline(inFile, line)) {
            std::stringstream ss(line);
            std::string id, lecturerCode;
            std::getline(ss, id, ',');
            std::getline(ss, lecturerCode, ',');

            if (toLower(lecturerCode) == toLower(oldCode)) {
                outFile << id << "," << newCode;
                std::string rest;
                std::getline(ss, rest);  // geri kalan kısmı al
                outFile << "," << rest << "\n";
            } else {
                outFile << line << "\n";
            }
        }

        inFile.close();
        outFile.close();

        std::remove("timetable.txt");
        std::rename("temp.txt", "timetable.txt");

        std::cout << "Timetable entries updated with new lecturer code.\n";

    } else {
        std::cout << "Lecturer not found.\n";
    }
}


void AdminManager::deleteLecturer() {
    std::string code;
    std::cout << "Enter lecturer code to delete: ";
    std::cin >> code;

    auto& lecturers = dataManager.getLecturers();
    auto it = std::remove_if(lecturers.begin(), lecturers.end(),
        [&code](const Lecturer& l) {
            return toLower(l.getCode()) == toLower(code);
        });

    if (it != lecturers.end()) {
        lecturers.erase(it, lecturers.end());
        dataManager.saveLecturers(); 
        std::cout << "Lecturer deleted.\n";

        // --- timetable.txt'den de o lecturer'ı sil ---
        std::ifstream inFile("timetable.txt");
        std::ofstream outFile("temp.txt");
        std::string line;

        while (std::getline(inFile, line)) {
            std::stringstream ss(line);
            std::string id, lecturerCode;
            std::getline(ss, id, ',');
            std::getline(ss, lecturerCode, ',');

            if (toLower(lecturerCode) != toLower(code)) {
                outFile << line << "\n";  // sadece eşleşmeyenleri yaz
            }
        }

        inFile.close();
        outFile.close();

        std::remove("timetable.txt");
        std::rename("temp.txt", "timetable.txt");

        std::cout << "Timetable entries related to the lecturer have been removed.\n";

    } else {
        std::cout << "Lecturer not found.\n";
    }
}

void AdminManager::setTimetableManager(TimetableManager* tm) {
    timetableManager = tm;
}

void AdminManager::manageTimetable() {
    if (!timetableManager) {
        std::cout << "Timetable manager is not set.\n";
        return;
    }

    int choice;
    do {
        std::cout << "\n--- Manage Timetable ---\n";
        std::cout << "1. Add Timetable Entry\n";
        std::cout << "2. Delete Timetable Entry\n";
        std::cout << "3. Back\n";
        std::cout << "Choice: ";
        std::cin >> choice;
        std::cin.ignore();

        switch (choice) {
            case 1:
                timetableManager->editTimetableEntry();
                break;
            case 2:
                timetableManager->deleteTimetableEntry();
                break;
            case 3:
                std::cout << "Returning...\n";
                break;
            default:
                std::cout << "Invalid choice.\n";
        }
    } while (choice != 3);
}


void AdminManager::manageStudentGroups() {
    int choice;
    do {
        std::cout << "\n--- Manage Student Groups ---\n";
        std::cout << "1. Add Student Group\n";
        std::cout << "2. View All Student Groups\n";
        std::cout << "3. Delete Student Group\n";
        std::cout << "4. Return to Admin Menu\n";
        std::cout << "Choice: ";
        std::cin >> choice;
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

        switch (choice) {
            case 1: {
                std::string groupID, groupName;
                int studentCount;

                std::cout << "Enter new group ID: ";
                std::getline(std::cin, groupID);

                if (groupID.empty()) {
                    std::cout << "Group ID cannot be empty.\n";
                } else if (dataManager.getStudentGroupById(groupID)) {
                    std::cout << "Group ID already exists.\n";
                } else {
                    std::cout << "Enter group name: ";
                    std::getline(std::cin, groupName);

                    std::cout << "Enter number of students in the group: ";
                    while (!(std::cin >> studentCount) || studentCount < 0) {
                        std::cout << "Invalid input. Please enter a positive integer: ";
                        std::cin.clear();
                        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
                    }
                    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

                    dataManager.addStudentGroup(StudentGroup(groupID, groupName, studentCount));
                    std::cout << "Student group added.\n";
                }
                break;
            }

            case 2: {
                std::cout << "\nAll Student Groups:\n";
                const auto& groups = dataManager.getAllStudentGroups();
                if (groups.empty()) {
                    std::cout << "No student groups available.\n";
                } else {
                    for (const auto& group : groups) {
                        std::cout << "- ID: " << group.getID()
                                  << ", Name: " << group.getName()
                                  << ", Students: " << group.getStudentCount() << "\n";
                    }
                }
                break;
            }

            case 3: {
                std::string groupID;
                std::cout << "Enter group ID to delete: ";
                std::getline(std::cin, groupID);

                if (dataManager.removeStudentGroup(groupID)) {
                    std::cout << "Group deleted.\n";
                } else {
                    std::cout << "Group not found.\n";
                }
                break;
            }

            case 4:
                std::cout << "Returning to admin menu...\n";
                break;

            default:
                std::cout << "Invalid choice.\n";
                break;
        }

    } while (choice != 4);
}




void AdminManager::addTimetableEntry() {
    TimetableEntry entry;

    std::cout << "Enter week number: ";
    std::cin >> entry.weekNumber;
    std::cin.ignore();

    std::cout << "Enter day (e.g. Monday): ";
    std::getline(std::cin, entry.day);

    std::cout << "Enter time (e.g. 10:00): ";
    std::getline(std::cin, entry.time);

    std::cout << "Enter module code: ";
    std::getline(std::cin, entry.moduleCode);

    std::cout << "Enter lecturer ID: ";
    std::getline(std::cin, entry.lecturerID);

    std::cout << "Enter room ID: ";
    std::getline(std::cin, entry.roomID);

    // Oda yoksa otomatik ekle
        if (!dataManager.getRoomById(entry.roomID)) {
            std::cout << "Room not found. Creating new room with default capacity (50).\n";
            Room newRoom(entry.roomID, entry.roomID, 50); 

        dataManager.addRoom(newRoom);
        }

    // Öğrenci grubu seçimi
    std::cout << "Available Student Groups:\n";
    const auto& groups = dataManager.getStudentGroups();
    for (const auto& g : groups) {
        std::cout << " - " << g.getID() << ": " << g.getName() << "\n";
    }

    std::cout << "Enter student group ID: ";
    std::getline(std::cin, entry.groupID);

    // Grup doğrulaması (case-insensitive)
    bool groupExists = false;
    for (const auto& g : groups) {
        if (toLower(g.getID()) == toLower(entry.groupID)) {
            groupExists = true;
            break;
        }
    }

    if (!groupExists) {
        std::cout << "Invalid group ID. Entry cancelled.\n";
        return;
    }

    dataManager.addTimetableEntry(entry);
    std::cout << "Timetable entry added successfully.\n";
}

void AdminManager::addStudent() {
    std::string id, name, group;

    std::cout << "Enter student ID: ";
    std::getline(std::cin >> std::ws, id);

    std::cout << "Enter student name: ";
    std::getline(std::cin, name);

    std::cout << "Enter group ID: ";
    std::getline(std::cin, group);

    Student student{id, name, group, dataManager, *timetableManager};
    dataManager.addStudent(student);

    std::cout << "Student added successfully.\n";
}
