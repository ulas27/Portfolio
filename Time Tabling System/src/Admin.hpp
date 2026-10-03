#pragma once

#include "AdminManager.hpp"
#include "DataManager.hpp"
#include "TimetableManager.hpp"

class Admin {
public:
    Admin(DataManager& dm, AdminManager& adminMgr, TimetableManager& ttm);
    void showMenu();
    void sessionTypeMenu();

private:
    DataManager& dataManager;
    AdminManager& adminManager;
    TimetableManager& timetableManager;
};
