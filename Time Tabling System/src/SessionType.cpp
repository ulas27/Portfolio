#include "SessionType.hpp"
#include "utility.hpp" 

SessionType::SessionType(const std::string& name) : name(name) {}

std::string SessionType::getName() const {
    return name;
}

void SessionType::setName(const std::string& newName) {
    name = newName;
}
