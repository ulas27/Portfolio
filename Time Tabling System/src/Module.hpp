#ifndef MODULE_HPP
#define MODULE_HPP

#include <string>

class Module {
private:
    std::string moduleCode;
    std::string moduleName;
    int credits;

public:
    Module() = default;

    // 2 parametreli constructor
    Module(const std::string& code, const std::string& name)
        : moduleCode(code), moduleName(name), credits(0) {}

    // 3 parametreli constructor
    Module(const std::string& code, const std::string& name, int cred)
        : moduleCode(code), moduleName(name), credits(cred) {}

    std::string getCode() const { return moduleCode; }
    std::string getName() const { return moduleName; }
    int getCredits() const { return credits; }

    void setCode(const std::string& newCode) { moduleCode = newCode; }
    void setName(const std::string& newName) { moduleName = newName; }
    void setCredits(int newCredits) { credits = newCredits; }

};

#endif
