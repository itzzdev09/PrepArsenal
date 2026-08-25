"""
PrepArsenal — GK Daily Harvester

Pulls fresh items from official public RSS feeds (PIB India per-ministry,
RBI press releases, PRS Legislative Research), drafts a short exam-relevant
summary and one grounded MCQ per new item via Gemini, and inserts them into
gk_daily_items as status='pending_review' for an admin to approve/reject at
/admin/gk-review.

Auth: signs in as a dedicated admin bot account (GK_HARVESTER_EMAIL /
GK_HARVESTER_PASSWORD) rather than using the Supabase service-role key, so
writes go through the normal admin RLS policy in
supabase/add_ncert_gk_features.sql. See that file's comment for how to
create/promote the bot account.

Run manually: python scripts/gk_harvester.py
Run on a schedule via k8s/base/cronjob-gk-harvester.yaml.
"""

import os
import json
import re
import time
from datetime import date
from typing import Optional

import feedparser
import requests

from db_client import get_admin_authenticated_client

FEEDS = [
    ("National", "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3"),
    ("Economy", "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1"),
    ("RBI", "https://www.rbi.org.in/pressreleases_rss.xml"),
    ("Policy", "https://prsindia.org/rss.xml"),
]

MAX_ITEMS_PER_RUN = 12
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent"


def draft_summary_and_question(headline: str, description: str) -> Optional[dict]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY not set, skipping draft generation.")
        return None

    prompt = f"""You are drafting a daily current-affairs GK card for Indian government exam aspirants (SSC/UPSC/Banking).

News item:
Headline: {headline}
Description: {description}

Respond with ONLY a JSON object, no markdown fences, no commentary, in this exact shape:
{{"summary": "2-4 sentence exam-relevant summary grounded only in the item above", "question_text": "one MCQ testing the key fact", "options": ["a", "b", "c", "d"], "correct_option": 0, "explanation": "why the correct option is right"}}"""

    try:
        res = requests.post(
            f"{GEMINI_URL}?key={api_key}",
            json={
                "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.4,
                    "maxOutputTokens": 1024,
                    # gemini-3.6-flash is a "thinking" model — without this it burns
                    # the output budget on internal reasoning before any visible text.
                    "thinkingConfig": {"thinkingBudget": 0},
                },
            },
            timeout=60,
        )
        res.raise_for_status()
        text = res.json()["candidates"][0]["content"]["parts"][0]["text"]
        cleaned = re.sub(r"^```(?:json)?|```$", "", text.strip()).strip()
        data = json.loads(cleaned)

        if not all(k in data for k in ("summary", "question_text", "options", "correct_option", "explanation")):
            raise ValueError("Missing required fields in drafted item")
        if len(data["options"]) != 4:
            raise ValueError("Expected exactly 4 options")

        return data
    except Exception as err:
        print(f"Draft generation failed for '{headline[:60]}': {err}")
        return None


def run():
    db = get_admin_authenticated_client()

    existing_urls = set()
    existing = db.table("gk_daily_items").select("source_url").execute()
    for row in existing.data or []:
        if row.get("source_url"):
            existing_urls.add(row["source_url"])

    created = 0
    skipped = 0

    for category, feed_url in FEEDS:
        if created >= MAX_ITEMS_PER_RUN:
            break

        try:
            parsed = feedparser.parse(feed_url)
        except Exception as err:
            print(f"Failed to fetch feed {feed_url}: {err}")
            continue

        for entry in parsed.entries:
            if created >= MAX_ITEMS_PER_RUN:
                break

            link = entry.get("link")
            if not link or link in existing_urls:
                skipped += 1
                continue

            headline = entry.get("title", "").strip()
            description = re.sub(r"<[^>]+>", "", entry.get("summary", "")).strip()
            if not headline:
                skipped += 1
                continue

            drafted = draft_summary_and_question(headline, description)
            if not drafted:
                skipped += 1
                continue
            time.sleep(4)  # stay well under the free-tier requests-per-minute limit

            db.table("gk_daily_items").insert({
                "item_date": str(date.today()),
                "category": category,
                "headline": headline,
                "summary": drafted["summary"],
                "source_url": link,
                "question_text": drafted["question_text"],
                "options": drafted["options"],
                "correct_option": drafted["correct_option"],
                "explanation": drafted["explanation"],
                "status": "pending_review",
            }).execute()

            existing_urls.add(link)
            created += 1

    print(f"GK harvester run complete: {created} created, {skipped} skipped.")


if __name__ == "__main__":
    run()
