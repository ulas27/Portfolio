#include "StudentGroup.hpp"
#include "utility.hpp"

StudentGroup::StudentGroup(const std::string& id, const std::string& name, int count)
    : groupID(id), groupName(name), studentCount(count) {}

std::string StudentGroup::getID() const {
    return groupID;
}

std::string StudentGroup::getName() const {
    return groupName;
}

int StudentGroup::getStudentCount() const {
    return studentCount;
}

void StudentGroup::setID(const std::string& id) {
    groupID = id;
}

void StudentGroup::setName(const std::string& name) {
    groupName = name;
}

void StudentGroup::setStudentCount(int count) {
    studentCount = count;
}
