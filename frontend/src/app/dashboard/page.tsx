"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");

  // 1. Database se Tasks fetch karne ka function
  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:8001/todos");
      setTasks(res.data);
    } catch (err) {
      console.error("Tasks cannot be loaded", err);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  // 2. Naya Task add karne ka function
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8001/todos", {
        title: newTitle,
        user_id: 1, 
        completed: false
      });
      setNewTitle("");
      fetchTasks(); 
    } catch (err) {
      alert("Task cant be added" + err);
    }
  };

  // 3. Delete karne ka function (Sirf logic yahan hogi)
  const deleteTask = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8001/todos/${id}`);
      fetchTasks(); 
    } catch (err) {
      alert("Delete nahi ho saka");
    }
  };

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My To-Do List</h1>
      
      {/* Task Input Form */}
      <form onSubmit={addTask} className="flex gap-2 mb-8">
        <input 
          type="text" 
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Please type Your Task..." 
          className="border p-2 flex-1 rounded text-black"
          required
        />
        <button type="submit" className="bg-blue-900 text-white px-4 py-2 rounded">Add Task</button>
      </form>

      {/* Tasks List (UI Yahan hogi) */}
      <div className="space-y-3">
        {tasks.map((task: any) => (
          <div key={task.id} className="p-4 border rounded shadow-sm flex justify-between items-center bg-white text-black">
            <span className="font-medium">{task.title}</span>
            
            <div className="flex gap-4 items-center">
              <span className={task.completed ? "text-green-500" : "text-orange-500"}>
                {task.completed ? "Done" : "Pending"}
              </span>
              
              {/* Delete Button sahi jagah par */}
              <button 
                onClick={() => deleteTask(task.id)} 
                className="text-red-500 hover:underline font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}