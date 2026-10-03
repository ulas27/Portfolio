#include "TimeSlot.hpp"
#include "utility.hpp"

TimeSlot::TimeSlot(const std::string& day, const std::string& time)
    : day(day), time(time) {}

std::string TimeSlot::getDay() const {
    return day;
}

std::string TimeSlot::getTime() const {
    return time;
}

void TimeSlot::setDay(const std::string& newDay) {
    day = newDay;
}

void TimeSlot::setTime(const std::string& newTime) {
    time = newTime;
}
