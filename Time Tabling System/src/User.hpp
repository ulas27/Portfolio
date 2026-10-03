#pragma once
#include <string>
#include <iostream>

class User {
protected:
    std::string name;
    std::string id;

public:
    User() = default;

    User(const std::string& name, const std::string& id)
        : name(name), id(id) {}

    virtual ~User() = default;

    std::string getName() const { return name; }
    std::string getId() const { return id; }

    void setName(const std::string& newName) { name = newName; }
    void setId(const std::string& newId) { id = newId; }

    // Gerekirse override edilecek sanal metodlar
    virtual void displayInfo() const {
        std::cout << "Name: " << name << ", ID: " << id << std::endl;
    }
};
