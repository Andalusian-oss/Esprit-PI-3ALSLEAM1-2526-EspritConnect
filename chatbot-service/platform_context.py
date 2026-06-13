"""
Platform data & statistics provider for the ESPRIT Connect chatbot.

Gives the AI assistant *aggregated* knowledge of the live platform so it can
answer questions about real numbers (resources, events, jobs, members, ...).

Privacy guarantees (enforced here, not just in the prompt):
  * NEVER selects id, password, email, names, CIN, esprit_id, phone, avatars,
    verification documents, message/conversation contents, or individual
    job applications / CVs. Only counts and aggregates leave the database.
  * Role gating: ADMIN tokens get the full aggregated picture; every other
    (or anonymous) caller only gets public global counts.

The caller's role is taken from the *verified* JWT, never from client input.
"""

import os
import time
import logging
from typing import Optional

import pymysql
import jwt as pyjwt

logger = logging.getLogger("chatbot.context")

DB_HOST = os.getenv("DB_HOST", "mysql")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", os.getenv("DB_USERNAME", "root"))
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
JWT_SECRET = os.getenv("JWT_SECRET", "")

# Aggregated stats are cached briefly to avoid hammering the DB on every message.
_CACHE_TTL = int(os.getenv("STATS_CACHE_TTL", "60"))
_cache: dict = {}  # scope -> (expires_at, text)


# ── Role extraction from the verified JWT ──────────────────────────────────
def role_from_auth_header(auth_header: Optional[str]) -> Optional[str]:
    """Return the role claim from a valid Bearer token, else None."""
    if not auth_header or not auth_header.lower().startswith("bearer "):
        return None
    token = auth_header.split(" ", 1)[1].strip()
    if not JWT_SECRET:
        logger.warning("JWT_SECRET not set — cannot verify token, treating as public")
        return None
    try:
        claims = pyjwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return claims.get("role")
    except pyjwt.PyJWTError as exc:
        logger.info("JWT verification failed: %s", exc)
        return None


def is_admin(role: Optional[str]) -> bool:
    return (role or "").upper() == "ADMIN"


# ── DB helpers ─────────────────────────────────────────────────────────────
def _connect():
    return pymysql.connect(
        host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASSWORD,
        connect_timeout=4, read_timeout=6, charset="utf8mb4",
        cursorclass=pymysql.cursors.Cursor,
    )


def _scalar(cur, sql: str, default=0):
    try:
        cur.execute(sql)
        row = cur.fetchone()
        return row[0] if row and row[0] is not None else default
    except Exception as exc:  # missing table/db, etc. — degrade gracefully
        logger.info("stats query skipped: %s", exc)
        return default


def _pairs(cur, sql: str) -> list:
    try:
        cur.execute(sql)
        return [(r[0], r[1]) for r in cur.fetchall() if r[0] is not None]
    except Exception as exc:
        logger.info("stats query skipped: %s", exc)
        return []


def _fmt_pairs(pairs: list) -> str:
    return ", ".join(f"{k}={v}" for k, v in pairs) if pairs else "n/a"


# ── Public stats (every authenticated or anonymous user) ───────────────────
def _public_stats(cur) -> list:
    lines = ["## ESPRIT Connect — public platform statistics"]

    members = _scalar(cur, "SELECT COUNT(*) FROM db_auth.users WHERE approved=1")
    by_role = _pairs(cur, "SELECT role, COUNT(*) FROM db_auth.users WHERE approved=1 GROUP BY role")
    lines.append(f"- Approved members: {members} (by role: {_fmt_pairs(by_role)})")

    posts = _scalar(cur, "SELECT COUNT(*) FROM db_post.posts WHERE status='APPROVED'")
    lines.append(f"- Published posts: {posts}")

    events_total = _scalar(cur, "SELECT COUNT(*) FROM db_event.events")
    events_up = _scalar(cur, "SELECT COUNT(*) FROM db_event.events WHERE `date` > NOW()")
    events_cat = _pairs(cur, "SELECT categorie, COUNT(*) FROM db_event.events GROUP BY categorie")
    lines.append(f"- Events: {events_total} total, {events_up} upcoming (by category: {_fmt_pairs(events_cat)})")

    clubs = _scalar(cur, "SELECT COUNT(*) FROM db_event.clubs")
    club_names = _pairs(cur, "SELECT nom, id FROM db_event.clubs ORDER BY nom LIMIT 30")
    names = ", ".join(n for n, _ in club_names) if club_names else "n/a"
    lines.append(f"- Clubs: {clubs} (names: {names})")

    jobs = _scalar(cur, "SELECT COUNT(*) FROM db_job.jobs")
    jobs_type = _pairs(cur, "SELECT type, COUNT(*) FROM db_job.jobs GROUP BY type")
    lines.append(f"- Job/internship offers: {jobs} (by type: {_fmt_pairs(jobs_type)})")

    lines += _resource_stats(cur)
    return lines


def _resource_stats(cur) -> list:
    total = _scalar(cur, "SELECT COUNT(*) FROM db_resource.resources")
    by_type = _pairs(cur, "SELECT type, COUNT(*) FROM db_resource.resources GROUP BY type")
    by_cat = _pairs(cur, "SELECT categorie, COUNT(*) FROM db_resource.resources GROUP BY categorie")
    views = _scalar(cur, "SELECT COALESCE(SUM(view_count),0) FROM db_resource.resources")
    downloads = _scalar(cur, "SELECT COALESCE(SUM(download_count),0) FROM db_resource.resources")
    likes = _scalar(cur, "SELECT COALESCE(SUM(like_count),0) FROM db_resource.resources")
    lines = [
        f"- Resources: {total} (by type: {_fmt_pairs(by_type)}; by category: {_fmt_pairs(by_cat)})",
        f"- Resource engagement totals: {views} views, {downloads} downloads, {likes} likes",
    ]
    for label, col in (("most viewed", "view_count"), ("most downloaded", "download_count"), ("most liked", "like_count")):
        top = _pairs(cur, f"SELECT titre, {col} FROM db_resource.resources ORDER BY {col} DESC LIMIT 5")
        if top:
            lines.append(f"- Top {label} resources: " + "; ".join(f"\"{t}\" ({c})" for t, c in top))
    return lines


# ── Admin-only stats (full aggregated picture) ─────────────────────────────
def _admin_stats(cur) -> list:
    lines = ["", "## Admin-only aggregated statistics (counts only — no personal data)"]

    total_users = _scalar(cur, "SELECT COUNT(*) FROM db_auth.users")
    pending = _scalar(cur, "SELECT COUNT(*) FROM db_auth.users WHERE approved=0")
    online = _scalar(cur, "SELECT COUNT(*) FROM db_auth.users WHERE online=1")
    verified = _scalar(cur, "SELECT COUNT(*) FROM db_auth.users WHERE email_verified=1")
    new7 = _scalar(cur, "SELECT COUNT(*) FROM db_auth.users WHERE created_at > (NOW() - INTERVAL 7 DAY)")
    by_promo = _pairs(cur, "SELECT promo, COUNT(*) FROM db_auth.users WHERE promo IS NOT NULL AND promo<>'' GROUP BY promo ORDER BY promo")
    by_spec = _pairs(cur, "SELECT specialite, COUNT(*) FROM db_auth.users WHERE specialite IS NOT NULL AND specialite<>'' GROUP BY specialite")
    lines.append(f"- Users: {total_users} total, {pending} pending approval, {online} online, {verified} email-verified, {new7} new in last 7 days")
    lines.append(f"- Users by promo: {_fmt_pairs(by_promo)}")
    lines.append(f"- Users by speciality: {_fmt_pairs(by_spec)}")

    posts_status = _pairs(cur, "SELECT status, COUNT(*) FROM db_post.posts GROUP BY status")
    comments = _scalar(cur, "SELECT COUNT(*) FROM db_post.comments")
    plikes = _scalar(cur, "SELECT COUNT(*) FROM db_post.likes")
    reactions = _scalar(cur, "SELECT COUNT(*) FROM db_post.reactions")
    photos = _scalar(cur, "SELECT COUNT(*) FROM db_post.photos")
    lines.append(f"- Posts by status: {_fmt_pairs(posts_status)}; comments={comments}, likes={plikes}, reactions={reactions}, photos={photos}")

    regs = _scalar(cur, "SELECT COUNT(*) FROM db_event.event_registrations")
    memberships = _scalar(cur, "SELECT COUNT(*) FROM db_event.club_memberships")
    lines.append(f"- Event registrations: {regs}; club memberships: {memberships}")

    apps = _scalar(cur, "SELECT COUNT(*) FROM db_job.applications")
    apps_status = _pairs(cur, "SELECT statut, COUNT(*) FROM db_job.applications GROUP BY statut")
    avg_match = _scalar(cur, "SELECT ROUND(AVG(match_score),1) FROM db_job.applications WHERE match_score IS NOT NULL", default="n/a")
    mentorings = _scalar(cur, "SELECT COUNT(*) FROM db_job.mentorings")
    ment_status = _pairs(cur, "SELECT statut, COUNT(*) FROM db_job.mentorings GROUP BY statut")
    sessions = _scalar(cur, "SELECT COUNT(*) FROM db_job.mentoring_sessions")
    lines.append(f"- Applications: {apps} (by status: {_fmt_pairs(apps_status)}); avg match score: {avg_match}")
    lines.append(f"- Mentorings: {mentorings} (by status: {_fmt_pairs(ment_status)}); mentoring sessions: {sessions}")

    # Messaging: counts ONLY — contents are never read.
    msgs = _scalar(cur, "SELECT COUNT(*) FROM db_msg.messages")
    convs = _scalar(cur, "SELECT COUNT(*) FROM db_msg.conversations")
    groups = _scalar(cur, "SELECT COUNT(*) FROM db_msg.chat_groups")
    gmsgs = _scalar(cur, "SELECT COUNT(*) FROM db_msg.group_messages")
    notifs = _scalar(cur, "SELECT COUNT(*) FROM db_msg.notifications")
    lines.append(f"- Messaging volume (counts only, no contents): {msgs} direct messages, {convs} conversations, {groups} groups, {gmsgs} group messages, {notifs} notifications")
    return lines


# ── Public entrypoint ──────────────────────────────────────────────────────
def build_platform_context(role: Optional[str]) -> str:
    """Return a formatted stats block scoped to the caller's role, or '' on failure."""
    scope = "admin" if is_admin(role) else "public"
    now = time.time()
    cached = _cache.get(scope)
    if cached and cached[0] > now:
        return cached[1]

    try:
        conn = _connect()
    except Exception as exc:
        logger.warning("Could not connect to DB for stats: %s", exc)
        return ""

    try:
        with conn.cursor() as cur:
            lines = _public_stats(cur)
            if is_admin(role):
                lines += _admin_stats(cur)
    except Exception as exc:
        logger.warning("Failed building platform context: %s", exc)
        conn.close()
        return ""
    finally:
        try:
            conn.close()
        except Exception:
            pass

    text = "\n".join(lines)
    _cache[scope] = (now + _CACHE_TTL, text)
    return text
