# Phase III: Todo AI Chatbot

## Basic Level Functionality

**Objective:** Create an AI-powered chatbot interface for managing todos through natural language using MCP (Model Context Protocol) server architecture and using Claude Code and Spec-Kit Plus.

**Development Approach:** Use the Agentic Dev Stack workflow: Write spec → Generate plan → Break into tasks → Implement via Claude Code. No manual coding allowed. We will review the process, prompts, and iterations to judge each phase and project.

## Requirements

- Implement conversational interface for all Basic Level features
- Use OpenAI Agents SDK for AI logic
- Build MCP server with Official MCP SDK that exposes task operations as tools
- Stateless chat endpoint that persists conversation state to database
- AI agents use MCP tools to manage tasks. The MCP tools will also be stateless and will store state in the database. 

## Technology Stack

| Component      | Technology                  |
|----------------|-----------------------------|
| Frontend       | OpenAI ChatKit              |
| Backend        | Python FastAPI              |
| AI Framework   | OpenAI Agents SDK           |
| MCP Server     | Official MCP SDK            |
| ORM            | SQLModel                    |
| Database       | Neon Serverless PostgreSQL  |
| Authentication | Better Auth                 |

## Architecture

```
┌─────────────────┐     ┌──────────────────────────────────────────────┐     ┌─────────────────┐
│                 │     │              FastAPI Server                  │     │                 │
│                 │     │  ┌────────────────────────────────────────┐  │     │                 │
│  ChatKit UI     │────▶│  │         Chat Endpoint                  │  │     │    Neon DB      │
│  (Frontend)     │     │  │  POST /api/chat                        │  │     │  (PostgreSQL)   │
│                 │     │  └───────────────┬────────────────────────┘  │     │                 │
│                 │     │                  │                           │     │  - tasks        │
│                 │     │                  ▼                           │     │  - conversations│
│                 │     │  ┌────────────────────────────────────────┐  │     │  - messages     │
│                 │◀────│  │      OpenAI Agents SDK                 │  │     │                 │
│                 │     │  │      (Agent + Runner)                  │  │     │                 │
│                 │     │  └───────────────┬────────────────────────┘  │     │                 │
│                 │     │                  │                           │     │                 │
│                 │     │                  ▼                           │     │                 │
│                 │     │  ┌────────────────────────────────────────┐  │────▶│                 │
│                 │     │  │         MCP Server                 │  │     │                 │
│                 │     │  │  (MCP Tools for Task Operations)       │  │◀────│                 │
│                 │     │  └────────────────────────────────────────┘  │     │                 │
└─────────────────┘     └──────────────────────────────────────────────┘     └─────────────────┘
```

## Database Models

| Model          | Fields                                                                 | Description     |
|----------------|------------------------------------------------------------------------|-----------------|
| Task           | user_id, id, title, description, completed, created_at, updated_at   | Todo items      |
| Conversation   | user_id, id, created_at, updated_at                                    | Chat session    |
| Message        | user_id, id, conversation_id, role (user/assistant), content, created_at | Chat history    |

## Chat API Endpoint

| Method | Endpoint             | Description                      |
|--------|----------------------|----------------------------------|
| POST   | /api/{user_id}/chat  | Send message & get AI response   |

**Request**

| Field           | Type    | Required | Description                                     |
|-----------------|---------|----------|-------------------------------------------------|
| conversation_id | integer | No       | Existing conversation ID (creates new if not provided) |
| message         | string  | Yes      | User's natural language message                 |

**Response**

| Field           | Type    | Description                   |
|-----------------|---------|-------------------------------|
| conversation_id | integer | The conversation ID           |
| response        | string  | AI assistant's response       |
| tool_calls      | array   | List of MCP tools invoked     |
