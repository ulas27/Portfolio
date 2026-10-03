#ifndef SESSION_HPP
#define SESSION_HPP

#include <string>
#include "Module.hpp"
#include "Room.hpp"
#include "StudentGroup.hpp"
#include "TimeSlot.hpp"
#include "Lecturer.hpp"

class Session {
private:
    Module module;
    Room room;
    StudentGroup group;
    TimeSlot timeSlot;
    Lecturer lecturer;

public:
    Session() = default;
    Session(const Module& m, const Room& r, const StudentGroup& g, const TimeSlot& t, const Lecturer& l);

    Module getModule() const;
    Room getRoom() const;
    StudentGroup getStudentGroup() const;
    TimeSlot getTimeSlot() const;
    Lecturer getLecturer() const;

    void setModule(const Module& m);
    void setRoom(const Room& r);
    void setStudentGroup(const StudentGroup& g);
    void setTimeSlot(const TimeSlot& t);
    void setLecturer(const Lecturer& l);
};

#endif // SESSION_HPP
