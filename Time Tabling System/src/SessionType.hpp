#ifndef SESSIONTYPE_H
#define SESSIONTYPE_H

#include <string>

class SessionType {
private:
    std::string name;

public:
    SessionType(const std::string& name);
    std::string getName() const;
    void setName(const std::string& newName);
};

#endif
