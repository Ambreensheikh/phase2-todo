# MCP Tools Specification

The MCP server must expose the following tools for the AI agent:

## Tool: add_task

- **Purpose**: Create a new task
- **Parameters**:
    - `user_id` (string, required)
    - `title` (string, required)
    - `description` (string, optional)
- **Returns**: `task_id`, `status`, `title`
- **Example Input**: `{"user_id": "ziakhan", "title": "Buy groceries", "description": "Milk, eggs, bread"}`
- **Example Output**: `{"task_id": 5, "status": "created", "title": "Buy groceries"}`

## Tool: list_tasks

- **Purpose**: Retrieve tasks from the list
- **Parameters**:
    - `user_id` (string, required)
    - `status` (string, optional: "all", "pending", "completed")
- **Returns**: Array of task objects
- **Example Input**: `{"user_id": "ziakhan", "status": "pending"}`
- **Example Output**: `[{"id": 1, "title": "Buy groceries", "completed": false}, ...]`

## Tool: complete_task

- **Purpose**: Mark a task as complete
- **Parameters**:
    - `user_id` (string, required)
    - `task_id` (integer, required)
- **Returns**: `task_id`, `status`, `title`
- **Example Input**: `{"user_id": "ziakhan", "task_id": 3}`
- **Example Output**: `{"task_id": 3, "status": "completed", "title": "Call mom"}`

## Tool: delete_task

- **Purpose**: Remove a task from the list
- **Parameters**:
    - `user_id` (string, required)
    - `task_id` (integer, required)
- **Returns**: `task_id`, `status`, `title`
- **Example Input**: `{"user_id": "ziakhan", "task_id": 2}`
- **Example Output**: `{"task_id": 2, "status": "deleted", "title": "Old task"}`

## Tool: update_task

- **Purpose**: Modify task title or description
- **Parameters**:
    - `user_id` (string, required)
    - `task_id` (integer, required)
    - `title` (string, optional)
    - `description` (string, optional)
- **Returns**: `task_id`, `status`, `title`
- **Example Input**: `{"user_id": "ziakhan", "task_id": 1, "title": "Buy groceries and fruits"}`
- **Example Output**: `{"task_id": 1, "status": "updated", "title": "Buy groceries and fruits"}`
