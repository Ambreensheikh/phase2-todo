from sqlmodel import SQLModel, text
from db import engine
# Models import karna zaroori hai taake naya table sahi banay
from models.user import User
from models.task import Task
from models.conversation import Conversation
from models.message import Message

def reset_database():
    print("🛑 Connecting to Database...")
    
    # 1. Zabardasti Purana Table Delete Karein
    with engine.connect() as conn:
        print("🗑️ Deleting old 'user' table...")
        conn.execute(text('DROP TABLE IF EXISTS "user" CASCADE;'))
        conn.commit()
        print("✅ Old table DELETED successfully.")

    # 2. Naya Table Banayen
    print("🚀 Creating NEW Tables with Password column...")
    SQLModel.metadata.create_all(engine)
    print("🎉 SUCCESS: Database is 100% Fixed! Now Restart Backend.")

if __name__ == "__main__":
    reset_database()