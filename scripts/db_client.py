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


def get_admin_authenticated_client() -> Client:
    """
    Returns a Supabase client signed in as a dedicated admin bot account, so
    writes pass through RLS admin policies (see supabase/add_ncert_gk_features.sql)
    instead of the anon key's default-deny. Used by scripts/gk_harvester.py.

    Requires GK_HARVESTER_EMAIL / GK_HARVESTER_PASSWORD to be set for an
    account whose profiles.role = 'admin' (see supabase/fix_admin_role_security.sql
    for how to promote a user to admin).
    """
    email = os.getenv("GK_HARVESTER_EMAIL")
    password = os.getenv("GK_HARVESTER_PASSWORD")
    if not email or not password:
        raise ValueError("Missing GK_HARVESTER_EMAIL / GK_HARVESTER_PASSWORD in the environment.")

    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    client.auth.sign_in_with_password({"email": email, "password": password})
    return client
