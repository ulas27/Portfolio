#include "Session.hpp"
#include "utility.hpp"

Session::Session(const Module& m, const Room& r, const StudentGroup& g, const TimeSlot& t, const Lecturer& l)
    : module(m), room(r), group(g), timeSlot(t), lecturer(l) {}

Module Session::getModule() const {
    return module;
}

Room Session::getRoom() const {
    return room;
}

StudentGroup Session::getStudentGroup() const {
    return group;
}

TimeSlot Session::getTimeSlot() const {
    return timeSlot;
}

Lecturer Session::getLecturer() const {
    return lecturer;
}

void Session::setModule(const Module& m) {
    module = m;
}

void Session::setRoom(const Room& r) {
    room = r;
}

void Session::setStudentGroup(const StudentGroup& g) {
    group = g;
}

void Session::setTimeSlot(const TimeSlot& t) {
    timeSlot = t;
}

void Session::setLecturer(const Lecturer& l) {
    lecturer = l;
}
