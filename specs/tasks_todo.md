# Phase 3: Todo AI Chatbot - Implementation Tasks

This document outlines the step-by-step implementation plan for the Todo AI Chatbot, adhering to the provided architecture and "No manual coding" rule where applicable, using the Agentic Dev Stack workflow.

## Backend Development (FastAPI, MCP, OpenAI Agents SDK)

### 1. Initial FastAPI Setup

- [ ] Modify `backend/main.py`:
    - [ ] Initialize FastAPI app.
    - [ ] Configure CORS middleware to allow communication from the frontend.
    - [ ] Import and use the new modular `models` (e.g., `from models import User, Task, Conversation, Message`).
    - [ ] Update `on_startup` event to create database tables (using `SQLModel.metadata.create_all`).
    - [ ] Remove existing authentication endpoints (`/token`, `/create-test-user`, `/signup`) as they are out of scope for Phase 3's core functionality, or adapt them to "Better Auth" if explicitly required and defined.
    - [ ] Remove existing `/todos` CRUD endpoints.

### 2. MCP Tools Implementation

Create a new file `backend/mcp_tools.py` (or similar) to house the MCP tool definitions.

- [ ] Define the `add_task` function:
    - [ ] Parameters: `user_id`, `title`, `description` (optional).
    - [ ] Logic: Create a new `Task` record in the database.
    - [ ] Return: `task_id`, `status`, `title`.
- [ ] Define the `list_tasks` function:
    - [ ] Parameters: `user_id`, `status` (optional: "all", "pending", "completed").
    - [ ] Logic: Query `Task` records based on `user_id` and `status` filter.
    - [ ] Return: Array of task objects.
- [ ] Define the `complete_task` function:
    - [ ] Parameters: `user_id`, `task_id`.
    - [ ] Logic: Update the `completed` status of a `Task` record.
    - [ ] Return: `task_id`, `status`, `title`.
- [ ] Define the `delete_task` function:
    - [ ] Parameters: `user_id`, `task_id`.
    - [ ] Logic: Delete a `Task` record from the database.
    - [ ] Return: `task_id`, `status`, `title`.
- [ ] Define the `update_task` function:
    - [ ] Parameters: `user_id`, `task_id`, `title` (optional), `description` (optional).
    - [ ] Logic: Modify the `title` or `description` of a `Task` record.
    - [ ] Return: `task_id`, `status`, `title`.
- [ ] Integrate these functions with the Official MCP SDK to create actual tool definitions that the OpenAI agent can consume.

### 3. Chat Endpoint Implementation (`backend/api/v1/chat.py`)

- [ ] Create directory `backend/api/v1`.
- [ ] Create file `backend/api/v1/chat.py`.
- [ ] Define the `POST /api/{user_id}/chat` endpoint:
    - [ ] Request Body: `conversation_id` (optional), `message` (required).
    - [ ] Logic:
        - [ ] Get or create `Conversation` based on `conversation_id` and `user_id`.
        - [ ] Fetch historical `Message`s for the conversation from the database.
        - [ ] Store the incoming user `message` in the database.
        - [ ] Construct the message history array for the OpenAI agent, including system prompt and tools.
        - [ ] Initialize and run the OpenAI agent with the assembled tools and message history.
        - [ ] Process the agent's response, handling potential `tool_calls`.
        - [ ] Store the AI assistant's response `message` in the database.
        - [ ] Return the `conversation_id`, AI `response`, and `tool_calls` (if any) to the frontend.

### 4. Integration with `main.py`

- [ ] In `backend/main.py`, include the chat endpoint using `app.include_router()`.

## Frontend Development (OpenAI ChatKit) - *High-level, to be detailed later*

- [ ] Set up basic Next.js application (if not already done).
- [ ] Integrate OpenAI ChatKit component.
- [ ] Configure ChatKit to send messages to `backend/api/{user_id}/chat`.
- [ ] Handle `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` environment variable.

## Documentation & Project Management

- [ ] Update `README.md` with setup, running instructions, and environment variables.
- [ ] Generate database migration scripts/instructions (e.g., using Alembic if SQLModel doesn't provide built-in migration).
- [ ] Implement error handling and logging throughout the backend.

This task list will be updated and refined as implementation progresses.
