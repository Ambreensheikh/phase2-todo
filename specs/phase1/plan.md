# Technical Plan - Phase 1

## 1. Core Components
- **Main Application File:** `src/main.py`
- **Language:** Python

## 2. Data Structure
- A global list named `tasks` will be used to store task items.
- Each task will be a dictionary with the following keys:
  - `id`: A unique integer for each task.
  - `description`: The text of the task.
  - `completed`: A boolean indicating if the task is completed (initially always `False`).
- A global variable `next_id` will be used to track the next available ID for a new task. It will start at 1.

## 3. Application Flow
- The application will run in a continuous loop, waiting for user input.
- The user will be prompted to enter a command.
- The application will parse the command and perform the corresponding action.
- The loop will terminate when the user enters the `exit` command.

## 4. Initial Commands
- **`list`**: Displays all tasks with their IDs and status.
- **`add <description>`**: Adds a new task to the list.
- **`exit`**: Exits the application.

## 5. Initial File Structure (`src/main.py`)
The `src/main.py` file will be initialized with:
- The `tasks` list.
- The `next_id` variable.
- The main `while` loop for the application.
- Placeholder functions for `list_tasks()` and `add_task()`.
