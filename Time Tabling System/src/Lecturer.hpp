#pragma once
#include <string>

class Lecturer {
private:
    std::string code;  
    std::string name;

public:
    Lecturer(const std::string& name, const std::string& code)
        : code(code), name(name) {}

    std::string getCode() const { return code; }
    std::string getName() const { return name; }
    std::string getID() const;  // Implemented in .cpp

    void setCode(const std::string& newCode) { code = newCode; }
    void setName(const std::string& newName) { name = newName; }
};
