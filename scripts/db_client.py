import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from scripts/.env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY") # We use anon key if service role is missing

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_ANON_KEY in scripts/.env")

def get_db_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)
