#include <iostream>
#include <fstream>
#include <algorithm>
#include <sstream>
#include "DataManager.hpp"
#include "utility.hpp"
#include "StudentGroup.hpp"


std::vector<Module>& DataManager::getModules() {
    return modules;
}

std::vector<TimetableEntry> DataManager::searchEntriesByDay(const std::string& day) const {
    std::vector<TimetableEntry> results;
    std::string lowerDay = toLower(day);
    std::copy_if(timetableEntries.begin(), timetableEntries.end(), std::back_inserter(results),
        [&](const TimetableEntry& entry) {
            return toLower(entry.day) == lowerDay;
        });
    return results;
}

std::vector<TimetableEntry> DataManager::searchEntriesByModule(const std::string& moduleCode) const {
    std::vector<TimetableEntry> results;
    std::string lowerCode = toLower(moduleCode);
    std::copy_if(timetableEntries.begin(), timetableEntries.end(), std::back_inserter(results),
        [&](const TimetableEntry& entry) {
            return toLower(entry.moduleCode) == lowerCode;
        });
    return results;
}

std::vector<TimetableEntry> DataManager::searchEntriesByLecturer(const std::string& lecturerID) const {
    std::vector<TimetableEntry> results;
    std::string lowerID = toLower(lecturerID);
    std::copy_if(timetableEntries.begin(), timetableEntries.end(), std::back_inserter(results),
        [&](const TimetableEntry& entry) {
            return toLower(entry.lecturerID) == lowerID;
        });
    return results;
}

std::vector<TimetableEntry> DataManager::searchEntriesByGroup(const std::string& groupID) const {
    std::vector<TimetableEntry> results;
    std::string lowerID = toLower(groupID);
    std::copy_if(timetableEntries.begin(), timetableEntries.end(), std::back_inserter(results),
        [&](const TimetableEntry& entry) {
            return toLower(entry.groupID) == lowerID;
        });
    return results;
}

std::vector<TimetableEntry> DataManager::searchEntriesByTime(const std::string& time) const {
    std::vector<TimetableEntry> results;
    std::string normalized = normalizeTime(time);
    std::copy_if(timetableEntries.begin(), timetableEntries.end(), std::back_inserter(results),
        [&](const TimetableEntry& entry) {
            return normalizeTime(entry.time) == normalized;
        });
    return results;
}


std::vector<TimetableEntry>& DataManager::getTimetable() {
    return timetable;
}

std::vector<Lecturer>& DataManager::getLecturers() {
    return instructors;
}

std::vector<TimetableEntry>& DataManager::getTimetableEntries() {
    return timetableEntries;
}

const std::vector<TimetableEntry>& DataManager::getTimetableEntries() const {
    return timetableEntries;
}

const std::vector<Student>& DataManager::getStudents() const {
    return students;
}

void DataManager::loadModules() {
    std::ifstream moduleFile("modules.txt");
    if (moduleFile.is_open()) {
        std::string code, name;
        while (moduleFile >> code) {
            std::getline(moduleFile >> std::ws, name);
            modules.emplace_back(code, name, 0);
        }
        moduleFile.close();
        std::cout << "Modules loaded successfully." << std::endl;
    } else {
        std::cerr << "Error loading modules." << std::endl;
    }
}

void DataManager::saveModules() {
    std::ofstream moduleFile("modules.txt");
    if (moduleFile.is_open()) {
        for (const auto& module : modules) {
            moduleFile << module.getCode() << " " << module.getName() << std::endl;
        }
        moduleFile.close();
        std::cout << "Modules saved successfully." << std::endl;
    } else {
        std::cerr << "Error saving modules." << std::endl;
    }
}

void DataManager::loadData() {
    loadTimetable();
    loadLecturers();
    loadModules();
    loadStudentsFromFile("student.txt");
}


bool DataManager::saveTimetableToFile(const std::string& filename) {
    std::ofstream outFile(filename);
    if (!outFile) return false;

    for (const auto& entry : timetableEntries) {
        outFile << entry.weekNumber << ","
        << entry.moduleCode << ","
        << entry.groupID << ","
        << entry.sessionType << ","
        << entry.day << ","
        << entry.roomDisplayName << ","
        << entry.time << ","
        << entry.lecturerID << "\n";

    }
    return true;
}


void DataManager::loadTimetable() {
    timetable.clear();
    timetableEntries.clear();

    std::ifstream file("timetable.txt");
    if (!file.is_open()) return;

    std::string line;
    while (std::getline(file, line)) {
        std::stringstream ss(line);
        std::string token;
        TimetableEntry entry;

        std::getline(ss, token, ',');
        entry.weekNumber = std::stoi(trim(token));

        std::getline(ss, token, ',');
        entry.moduleCode = toLower(trim(token));

        std::getline(ss, token, ',');
        entry.sessionType = trim(token);

        std::getline(ss, token, ',');
        entry.lecturerID = toLower(trim(token));

        std::getline(ss, token, ',');
        entry.day = toLower(trim(token));

        std::getline(ss, token, ',');
        entry.roomID = toLower(trim(token));
        entry.roomDisplayName = entry.roomID; // 🛠️ Display name başlangıçta oda ID olsun

        std::getline(ss, token, ',');
        entry.time = normalizeTime(trim(token));

        std::getline(ss, token, ',');
        entry.endTime = normalizeTime(trim(token));

        std::getline(ss, token);
        entry.groupID = trim(token);

        timetable.push_back(entry);
        timetableEntries.push_back(entry);
    }

    file.close();
}



void DataManager::addRoom(const Room& room) {
    rooms.push_back(room);
}

void DataManager::addLecturer(const Lecturer& lecturer) {
    instructors.push_back(lecturer);
}

void DataManager::addModule(const Module& module) {
    modules.push_back(module);
}

void DataManager::addStudentGroup(const StudentGroup& group) {
    studentGroups.push_back(group);
}

void DataManager::addStudent(const Student& student) {
    students.push_back(student);
}

void DataManager::addTimetableEntry(const TimetableEntry& entry) {
    timetable.push_back(entry);
    timetableEntries.push_back(entry);
    saveTimetable();
}



bool DataManager::deleteTimetableEntry(const std::string& code, const std::string& day, const std::string& time) {
    auto it = std::remove_if(timetable.begin(), timetable.end(), [&](const TimetableEntry& e) {
        return toLower(e.moduleCode) == toLower(code) &&
               toLower(e.day) == toLower(day) &&
               toLower(e.time) == toLower(time);
    });

    if (it != timetable.end()) {
        timetable.erase(it, timetable.end());
        saveTimetable();
        return true;
    }
    return false;
}

const Lecturer* DataManager::getLecturerById(const std::string& id) const {
    std::string lowerId = toLower(id);
    for (const auto& lecturer : instructors) {
        if (toLower(lecturer.getID()) == lowerId) {
            return &lecturer;
        }
    }
    return nullptr;
}

const Module* DataManager::getModuleByCode(const std::string& code) const {
    std::string lowerCode = toLower(code);
    for (const auto& module : modules) {
        if (toLower(module.getCode()) == lowerCode) {
            return &module;
        }
    }
    return nullptr;
}

const Room* DataManager::getRoomById(const std::string& id) const {
    std::string lowerId = toLower(id);
    for (const auto& room : rooms) {
        if (toLower(room.getID()) == lowerId) {
            return &room;
        }
    }
    return nullptr;
}

const StudentGroup* DataManager::getStudentGroupById(const std::string& id) const {
    std::string lowerId = toLower(id);
    for (const auto& group : studentGroups) {
        if (toLower(group.getID()) == lowerId) {
            return &group;
        }
    }
    return nullptr;
}

const Student* DataManager::getStudentById(const std::string& id) const {
    std::string lowerId = toLower(id);
    for (const auto& student : students) {
        if (toLower(student.getId()) == lowerId) {
            return &student;
        }
    }
    return nullptr;
}

void DataManager::addSessionType(const std::string& name) {
    sessionTypes.emplace_back(name);
    std::cout << "Session type added successfully.\n";
}

void DataManager::listSessionTypes() const {
    if (sessionTypes.empty()) {
        std::cout << "No session types available.\n";
        return;
    }

    std::cout << "Session Types:\n";
    for (const auto& type : sessionTypes) {
        std::cout << "- " << type.getName() << "\n";
    }
}

void DataManager::editSessionType(const std::string& oldName, const std::string& newName) {
    for (auto& type : sessionTypes) {
        if (toLower(type.getName()) == toLower(oldName)) {
            type.setName(newName);
            std::cout << "Session type updated.\n";
            return;
        }
    }
    std::cout << "Session type not found.\n";
}

void DataManager::deleteSessionType(const std::string& name) {
    auto it = std::remove_if(sessionTypes.begin(), sessionTypes.end(),
        [&](const SessionType& type) {
            return toLower(type.getName()) == toLower(name);
        });

    if (it != sessionTypes.end()) {
        sessionTypes.erase(it, sessionTypes.end());
        std::cout << "Session type deleted.\n";
    } else {
        std::cout << "Session type not found.\n";
    }
}

void DataManager::exportTimetableToCSV(const std::string& groupID, int week, const std::string& filename) const {
    std::ofstream outFile(filename);
    if (!outFile.is_open()) {
        std::cerr << "Error opening file for writing.\n";
        return;
    }

    outFile << "Module Code,Day,Time,Room,Notes\n";
    for (const auto& entry : timetable) {
        if (entry.weekNumber == week && toLower(entry.groupID) == toLower(groupID)) {
            outFile << entry.moduleCode << "," << entry.day << "," << entry.time << ","
                    << entry.roomDisplayName << "," << entry.notes << "\n";
        }
    }

    outFile.close();
    std::cout << "Timetable exported to " << filename << std::endl;
}

void DataManager::saveLecturers() {
    std::ofstream outFile("lecturers.txt");
    for (const auto& lecturer : instructors) { 
        outFile << lecturer.getCode() << "," << lecturer.getName() << "\n";
    }
    outFile.close();
}

void DataManager::saveTimetable() {
    saveTimetableToFile("timetable.txt");
}

void DataManager::updateModuleCodeInTimetable(const std::string& oldCode, const std::string& newCode) {
    for (auto& entry : timetable) {
        if (toLower(entry.moduleCode) == toLower(oldCode)) {
            entry.moduleCode = newCode;
        }
    }
    saveTimetable(); // timetable.txt'ye yaz
}

void DataManager::loadLecturers() {
    instructors.clear();

    std::ifstream inFile("lecturers.txt");
    if (!inFile.is_open()) {
        std::cerr << "Could not open lecturers.txt" << std::endl;
        return;
    }

    std::string line;
    while (std::getline(inFile, line)) {
        std::stringstream ss(line);
        std::string id, name;

        std::getline(ss, id, ',');
        std::getline(ss, name);

        if (!id.empty() && !name.empty()) {
            instructors.emplace_back(trim(id), trim(name));
        }
    }

    inFile.close();
    std::cout << "Lecturers loaded successfully.\n";
}


const std::vector<StudentGroup>& DataManager::getAllStudentGroups() const {
    return studentGroups;
}

bool DataManager::removeStudentGroup(const std::string& id) {
    std::string lowerId = toLower(id);
    auto it = std::remove_if(studentGroups.begin(), studentGroups.end(),
        [&lowerId](const StudentGroup& group) {
            return toLower(group.getID()) == lowerId;
        });
    if (it != studentGroups.end()) {
        studentGroups.erase(it, studentGroups.end());
        return true;
    }
    return false;
}

void DataManager::saveStudentsToFile() {
    std::ofstream file("students.txt");
    for (const auto& student : students) {
        file << student.getId() << "," << student.getName() << "," << student.getGroupID() << "\n";
    }
}

void DataManager::loadStudentsFromFile(const std::string& filename) {
    std::ifstream file(filename);
    if (!file.is_open()) {
        std::cerr << "Error opening student file.\n";
        return;
    }

    std::string line;
    while (std::getline(file, line)) {
        std::istringstream iss(line);
        std::string id, name, groupId;

        if (std::getline(iss, id, ',') && std::getline(iss, name, ',') && std::getline(iss, groupId)) {
            Student student(id, name, groupId); // ✅ sade constructor
            students.push_back(student);
        }
    }

    std::cout << "Students loaded: " << students.size() << std::endl;
}

const Student* DataManager::getStudentByIdAndName(const std::string& id, const std::string& name) const {
    std::string inputId = toLower(id);
    std::string inputName = toLower(name);

    for (const auto& student : students) {
        std::string sid = toLower(student.getId());
        std::string sname = toLower(student.getName());

        if (sid == inputId && sname == inputName) {
            std::cout << "[DEBUG] Student matched: " << sid << ", " << sname << std::endl;
            return &student;
        }
    }

    std::cout << "[DEBUG] No matching student found for ID: " << inputId << ", Name: " << inputName << std::endl;
    return nullptr;
}