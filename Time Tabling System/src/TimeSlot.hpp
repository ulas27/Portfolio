#ifndef TIMESLOT_HPP
#define TIMESLOT_HPP

#include <string>

class TimeSlot {
private:
    std::string day;
    std::string time; // örnek: "10:00-11:00"

public:
    TimeSlot() = default;
    TimeSlot(const std::string& day, const std::string& time);

    std::string getDay() const;
    std::string getTime() const;

    void setDay(const std::string& newDay);
    void setTime(const std::string& newTime);
};

#endif // TIMESLOT_HPP
