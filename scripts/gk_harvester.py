"""
PrepArsenal — GK Daily Harvester

Pulls fresh items from official public RSS feeds (PIB India per-ministry, RBI
press releases, PRS Legislative Research), builds an exam-relevant card for each
new item, and inserts them into gk_daily_items as status='pending_review' for an
admin to approve/reject/edit at /admin/gk-review.

No LLM is involved. The summary is extractive — the feed's own description,
cleaned and trimmed to whole sentences — and the draft MCQ is built
deterministically from the item's provenance (which body issued it), with
distractors drawn from the other feeds in this list. That question is always
answerable from the item itself and can never hallucinate a fact the source did
not state. It is deliberately a starting point: the admin review screen can
rewrite the stem, the options, the answer and the explanation before approval,
which is where a sharper subject question should be authored.

Auth: signs in as a dedicated admin bot account (GK_HARVESTER_EMAIL /
GK_HARVESTER_PASSWORD) rather than using the Supabase service-role key, so
writes go through the normal admin RLS policy in
supabase/add_ncert_gk_features.sql. See that file's comment for how to
create/promote the bot account.

Run manually: python scripts/gk_harvester.py
Run on a schedule via k8s/base/cronjob-gk-harvester.yaml.
"""

import html
import random
import re
from datetime import date

import feedparser

from db_client import get_admin_authenticated_client

# (category, feed url, issuing body) — the issuing body doubles as the answer to
# the generated provenance question.
FEEDS = [
    ("National", "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3", "Press Information Bureau (PIB)"),
    ("Economy", "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1", "Press Information Bureau (PIB)"),
    ("RBI", "https://www.rbi.org.in/pressreleases_rss.xml", "Reserve Bank of India (RBI)"),
    ("Policy", "https://prsindia.org/rss.xml", "PRS Legislative Research"),
]

ALL_BODIES = [
    "Press Information Bureau (PIB)",
    "Reserve Bank of India (RBI)",
    "PRS Legislative Research",
    "Securities and Exchange Board of India (SEBI)",
    "NITI Aayog",
]

MAX_ITEMS_PER_RUN = 12
MAX_SUMMARY_CHARS = 600


def clean_description(raw: str) -> str:
    """Strip markup and entities from a feed description and trim it to whole
    sentences, so the card never ends mid-word."""
    text = re.sub(r"<[^>]+>", " ", raw or "")
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= MAX_SUMMARY_CHARS:
        return text

    clipped = text[:MAX_SUMMARY_CHARS]
    cut = max(clipped.rfind(". "), clipped.rfind("? "), clipped.rfind("! "))
    return (clipped[:cut + 1] if cut > 200 else clipped.rstrip() + "…").strip()


def build_card(headline: str, description: str, issuing_body: str, rng: random.Random) -> dict:
    """Compose the summary and a grounded provenance MCQ for one feed item."""
    summary = clean_description(description)
    if not summary:
        summary = f"{headline} — reported via {issuing_body}."

    distractors = [body for body in ALL_BODIES if body != issuing_body]
    options = rng.sample(distractors, 3) + [issuing_body]
    rng.shuffle(options)

    short_headline = headline if len(headline) <= 160 else headline[:157].rstrip() + "…"

    return {
        "summary": summary,
        "question_text": f'Which body issued the following announcement: "{short_headline}"?',
        "options": options,
        "correct_option": options.index(issuing_body),
        "explanation": f"This item was released by the {issuing_body}.",
    }


def run():
    db = get_admin_authenticated_client()
    rng = random.Random()

    existing_urls = set()
    existing = db.table("gk_daily_items").select("source_url").execute()
    for row in existing.data or []:
        if row.get("source_url"):
            existing_urls.add(row["source_url"])

    created = 0
    skipped = 0

    for category, feed_url, issuing_body in FEEDS:
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
            headline = (entry.get("title") or "").strip()
            if not link or not headline or link in existing_urls:
                skipped += 1
                continue

            card = build_card(headline, entry.get("summary", ""), issuing_body, rng)

            db.table("gk_daily_items").insert({
                "item_date": str(date.today()),
                "category": category,
                "headline": headline,
                "source_url": link,
                "status": "pending_review",
                **card,
            }).execute()

            existing_urls.add(link)
            created += 1

    print(f"GK harvester run complete: {created} created, {skipped} skipped.")


if __name__ == "__main__":
    run()
