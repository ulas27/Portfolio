# Test Instructions

To test the system manually:

1. Compile the program using `make` in the root directory.
2. Run the application: `./build/main`
3. Use the following sample credentials:
   - **Admin**: username: `admin`, password: `admin123`
   - **Student**: s001, alice

## Sample Test Scenarios

| Test Case ID | Scenario                        | Steps                                                                 | Expected Result                              |
|--------------|----------------------------------|-----------------------------------------------------------------------|----------------------------------------------|
| TC001        | Admin Login                     | Enter `admin` / `admin123`                                           | Successfully logged in to admin dashboard    |
| TC002        | Add Module                      | Go to Module Management → Add Module                                 | Module appears in the list                   |
| TC003        | Add Student Group               | Go to Group Management → Add Group                                   | Group appears in group list                  |
| TC004        | Add Room                        | Go to Room Management → Add Room                                     | Room added to the system                     |
| TC005        | View Student Timetable          | Log in as student and select Week                                    | Timetable shown correctly                    |
