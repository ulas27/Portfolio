CXX = g++
CXXFLAGS = -Wall -std=c++17 -Iinclude
SRC_DIR = src
OBJ_DIR = build
BIN = timetable

SOURCES = $(wildcard $(SRC_DIR)/*.cpp)
OBJECTS = $(patsubst $(SRC_DIR)/%.cpp, $(OBJ_DIR)/%.o, $(SOURCES))

all: builddir $(BIN)

builddir:
	mkdir -p $(OBJ_DIR)

$(BIN): $(OBJECTS)
	$(CXX) $(OBJECTS) -o $(BIN)

$(OBJ_DIR)/%.o: $(SRC_DIR)/%.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

clean:
	rm -f $(OBJ_DIR)/*.o $(BIN)
