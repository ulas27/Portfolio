#ifndef ROOM_HPP
#define ROOM_HPP

#include <string>

class Room {
private:
    std::string id;
    std::string name;
    int capacity;

public:
    Room(); // Default constructor
    Room(const std::string& id, const std::string& name, int capacity); // Parametreli

    std::string getID() const;
    std::string getName() const;
    int getCapacity() const;

    void setName(const std::string& newName);
    void setCapacity(int newCapacity);
};

#endif
