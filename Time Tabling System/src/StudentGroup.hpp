#ifndef STUDENTGROUP_HPP
#define STUDENTGROUP_HPP

#include <string>



class StudentGroup {
private:
    std::string groupID;
    std::string groupName;
    int studentCount;

public:
    StudentGroup() = default;
    StudentGroup(const std::string& id, const std::string& name, int count);
    std::string getGroupID() const { return groupID; }
    std::string getID() const;
    std::string getName() const;
    int getStudentCount() const;

    void setID(const std::string& id);
    void setName(const std::string& name);
    void setStudentCount(int count);
    
};

#endif // STUDENTGROUP_HPP
