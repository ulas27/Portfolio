#include <iostream>
#include <cassert>
#include "../src/DataManager.hpp"
#include <cstddef>


void testModuleLoading() {
    DataManager dm;
    dm.loadModules();
    assert(dm.modules.size() > 0); // modules.csv önceden dolu olmalı
}

int main() {
    testModuleLoading();
    std::cout << "All tests passed!\n";
    return 0;
}