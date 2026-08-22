import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Prefer the repository's existing .env.local, while retaining support for
# scripts/.env and shell-provided variables.
repo_env = Path(__file__).resolve().parents[1] / '.env.local'
script_env = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=repo_env)
load_dotenv(dotenv_path=script_env, override=False)

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase URL/key. Set SUPABASE_URL + SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.")

def get_db_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)
