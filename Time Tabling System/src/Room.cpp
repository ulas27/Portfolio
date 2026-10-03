#include "Room.hpp"
#include "utility.hpp"

Room::Room(const std::string& id, const std::string& name, int capacity)
    : id(id), name(name), capacity(capacity) {}

std::string Room::getID() const {
    return id;
}

std::string Room::getName() const {
    return name;
}

int Room::getCapacity() const {
    return capacity;
}

void Room::setName(const std::string& newName) {
    name = newName;
}

void Room::setCapacity(int newCapacity) {
    capacity = newCapacity;
}
