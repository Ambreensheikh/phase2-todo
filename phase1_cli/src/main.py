# src/main.py

# Global in-memory storage for tasks
tasks = []
next_id = 1

def find_task_by_id(task_id):
    """
    Helper function to find a task by its ID.
    Returns the task dictionary or None if not found.
    """
    for task in tasks:
        if task["id"] == task_id:
            return task
    return None

def list_tasks():
    """
    Displays all tasks.
    """
    print("--- Aapke Tasks ---")
    if not tasks:
        print("Abhi koi task nahi hai. Ek add karein!")
    for task in tasks:
        status = "Ho gaya" if task["completed"] else "Pending"
        print(f"[{task['id']}] {task['description']} ({status})")
    print("-------------------")

def add_task(description):
    """
    Adds a new task to the list.
    """
    global next_id
    new_task = {
        "id": next_id,
        "description": description,
        "completed": False
    }
    tasks.append(new_task)
    next_id += 1
    print(f"Task add ho gaya: \"{description}\"")

def delete_task(task_id):
    """
    Deletes a task by its ID.
    """
    task = find_task_by_id(task_id)
    if task:
        tasks.remove(task)
        print(f"Task [{task_id}] delete ho gaya.")
    else:
        print(f"Error: Task ID {task_id} nahi mila.")

def update_task(task_id, new_description):
    """
    Updates a task's description by its ID.
    """
    task = find_task_by_id(task_id)
    if task:
        task["description"] = new_description
        print(f"Task [{task_id}] update ho gaya.")
    else:
        print(f"Error: Task ID {task_id} nahi mila.")

def complete_task(task_id):
    """
    Marks a task as complete by its ID.
    """
    task = find_task_by_id(task_id)
    if task:
        task["completed"] = True
        print(f"Task [{task_id}] complete ho gaya.")
    else:
        print(f"Error: Task ID {task_id} nahi mila.")

def main():
    """
    Main application loop.
    """
    print("--- Todo App Phase 1 ---")
    while True:
        command_text = "\nEnter a command (list, add, delete, update, complete, exit): "
        command = input(command_text).strip().lower()
        parts = command.split()
        cmd = parts[0]

        if cmd == "list":
            list_tasks()
        elif cmd == "add":
            description = " ".join(parts[1:])
            if description:
                add_task(description)
            else:
                print("Task ki description likhein. Example: add Naya task likho")
        elif cmd in ["delete", "complete"]:
            if len(parts) == 2:
                try:
                    task_id = int(parts[1])
                    if cmd == "delete":
                        delete_task(task_id)
                    else:
                        complete_task(task_id)
                except ValueError:
                    print("Error: Task ID ek number hona chahiye.")
            else:
                print(f"Error: Command aisy likhein: {cmd} <task_id>")
        elif cmd == "update":
            if len(parts) >= 3:
                try:
                    task_id = int(parts[1])
                    new_description = " ".join(parts[2:])
                    update_task(task_id, new_description)
                except ValueError:
                    print("Error: Task ID ek number hona chahiye.")
            else:
                print("Error: Command aisy likhein: update <task_id> <new_description>")
        elif cmd == "exit":
            print("Alvida!")
            break
        else:
            print("Ghalat command. Maujood commands: list, add, delete, update, complete, exit")
        
        print("\n" + "-"*20)

if __name__ == "__main__":
    main()
