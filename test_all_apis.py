#!/usr/bin/env python3
"""
EspritConnect - Full CRUD API Test Suite
Tests every endpoint across all 6 microservices with all user roles.
Usage:  python test_all_apis.py
"""

import requests
import sys
import io
import time
from datetime import datetime, timedelta

# Force UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# ─── Configuration ─────────────────────────────────────────────────────────────

BASE = {
    "auth":     "http://localhost:8081",
    "post":     "http://localhost:8082",
    "event":    "http://localhost:8083",
    "job":      "http://localhost:8084",
    "message":  "http://localhost:8085",
    "resource": "http://localhost:8086",
}

USER_CREDS = {
    "admin":    ("admin@esprit.tn",              "password"),
    "student":  ("amine.bensalem@esprit.tn",     "password"),
    "teacher":  ("nadia.ayari@esprit.tn",        "password"),
    "alumni":   ("mokhtar.saidi@gmail.com",      "password"),
    "company":  ("hr@acmecorp.tn",               "password"),
    "student2": ("sara.khemiri@esprit.tn",       "password"),
}

# User IDs from seed data (used to target specific resources)
USER_IDS = {
    "admin":    1,
    "teacher":  2,
    "student":  7,
    "student2": 8,
    "alumni":   17,
    "company":  22,
}

# ─── Terminal colours ───────────────────────────────────────────────────────────

GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BLUE   = "\033[94m"
BOLD   = "\033[1m"
DIM    = "\033[2m"
RESET  = "\033[0m"

# ─── Global state ───────────────────────────────────────────────────────────────

_results: list[dict] = []
_tokens:  dict[str, str] = {}

# IDs captured during test run (used by later tests)
_ids: dict[str, int | None] = {
    "post_id":          None,
    "comment_id":       None,
    "club_id":          None,
    "event_id":         None,
    "job_id":           None,
    "application_id":   None,
    "mentoring_id":     None,
    "session_id":       None,
    "conversation_id":  None,
    "message_id":       None,
    "resource_id":      None,
    "notification_id":  None,
}

# ─── Test runner ────────────────────────────────────────────────────────────────

def _run(name: str, method: str, url: str, expected: int,
         user: str | None = None, capture_key: str | None = None,
         skip_if: str | None = None, **kwargs) -> requests.Response | None:
    """
    Execute one HTTP request and record PASS / FAIL.

    Args:
        name        Human-readable test label
        method      HTTP verb (GET, POST, PUT, PATCH, DELETE)
        url         Full URL
        expected    Expected HTTP status code
        user        Key into _tokens dict (or None for no auth)
        capture_key If set and response is 2xx, store resp.json()["id"] in _ids[capture_key]
        skip_if     If _ids[skip_if] is None, mark as SKIP and return None
        **kwargs    Forwarded to requests.request (json=, params=, data=, etc.)
    """
    # Skip guard
    if skip_if and _ids.get(skip_if) is None:
        _results.append({"name": name, "status": "SKIP"})
        print(f"  {DIM}SKIP  {name} (prerequisite missing){RESET}")
        return None

    headers: dict = kwargs.pop("headers", {})
    if user and user in _tokens:
        headers["Authorization"] = f"Bearer {_tokens[user]}"
    if "json" in kwargs:
        headers.setdefault("Content-Type", "application/json")

    try:
        resp = requests.request(method, url, headers=headers, timeout=12, **kwargs)
    except requests.exceptions.ConnectionError:
        _results.append({"name": name, "status": "FAIL", "actual": "CONNECTION ERROR"})
        print(f"  {RED}FAIL{RESET}  {name} → CONNECTION ERROR")
        return None
    except Exception as exc:
        _results.append({"name": name, "status": "FAIL", "actual": str(exc)})
        print(f"  {RED}FAIL{RESET}  {name} → {exc}")
        return None

    passed = resp.status_code == expected
    label  = f"{GREEN}PASS{RESET}" if passed else f"{RED}FAIL{RESET}"
    mark   = "✓" if passed else "✗"

    _results.append({
        "name":   name,
        "status": "PASS" if passed else "FAIL",
        "actual": resp.status_code,
    })
    print(f"  {label}  [{mark}] {name:<60} HTTP {resp.status_code}  (want {expected})")

    if not passed:
        try:
            msg = resp.json().get("message") or resp.json().get("error") or ""
        except Exception:
            msg = resp.text[:120]
        if msg:
            print(f"        {YELLOW}└─ {msg}{RESET}")

    # Capture created resource ID for downstream tests
    if capture_key and resp.status_code in (200, 201):
        try:
            body = resp.json()
            rid = body.get("id") if isinstance(body, dict) else None
            if rid:
                _ids[capture_key] = rid
        except Exception:
            pass

    return resp


def section(title: str):
    bar = "=" * 64
    print(f"\n{BOLD}{BLUE}+{bar}+{RESET}")
    print(f"{BOLD}{BLUE}|  {title:<62}|{RESET}")
    print(f"{BOLD}{BLUE}+{bar}+{RESET}")


def sub(title: str):
    print(f"\n  {BOLD}{CYAN}>> {title}{RESET}")


# ─── Login helpers ──────────────────────────────────────────────────────────────

def login_all():
    section("LOGIN — acquiring tokens for all users")
    for alias, (email, pwd) in USER_CREDS.items():
        try:
            resp = requests.post(
                f"{BASE['auth']}/api/auth/login",
                json={"email": email, "password": pwd},
                timeout=10,
            )
            if resp.status_code == 200:
                _tokens[alias] = resp.json()["token"]
                print(f"  {GREEN}PASS{RESET}  [✓] login as {alias:<12} ({email})")
                _results.append({"name": f"login/{alias}", "status": "PASS", "actual": 200})
            else:
                print(f"  {RED}FAIL{RESET}  [✗] login as {alias:<12} → HTTP {resp.status_code}")
                _results.append({"name": f"login/{alias}", "status": "FAIL", "actual": resp.status_code})
        except Exception as exc:
            print(f"  {RED}FAIL{RESET}  [✗] login as {alias:<12} → {exc}")
            _results.append({"name": f"login/{alias}", "status": "FAIL", "actual": "ERR"})


# ─── Auth Service Tests ─────────────────────────────────────────────────────────

def test_auth():
    section("AUTH SERVICE  (port 8081)")
    A = BASE["auth"]

    sub("Register")
    _unique_email = f"testco{int(time.time())}@esprit.tn"
    _run("register new COMPANY account",
         "POST", f"{A}/api/auth/register", 201,
         json={"email": _unique_email, "password": "test123",
               "prenom": "Test", "nom": "Company 999", "role": "COMPANY"})

    _run("register with invalid role enum → 400",
         "POST", f"{A}/api/auth/register", 400,
         json={"email": "x@x.com", "password": "123456",
               "prenom": "X", "nom": "X", "role": "INVALID_ROLE"})

    _run("register with missing required field → 400",
         "POST", f"{A}/api/auth/register", 400,
         json={"email": "missing@x.com", "password": "123456"})

    sub("Users — read operations")
    _run("GET all users [admin]",
         "GET", f"{A}/api/auth/users", 200, user="admin")

    _run("GET all users [student → 403]",
         "GET", f"{A}/api/auth/users", 403, user="student")

    _run("GET online users [admin]",
         "GET", f"{A}/api/auth/users/online", 200, user="admin")

    _run("GET online users [student]",
         "GET", f"{A}/api/auth/users/online", 200, user="student")

    _run("GET user by ID=1 [admin]",
         "GET", f"{A}/api/auth/users/1", 200, user="admin")

    _run("GET user by ID=1 [student]",
         "GET", f"{A}/api/auth/users/1", 200, user="student")

    _run("GET user by unknown ID → 404",
         "GET", f"{A}/api/auth/users/99999", 404, user="admin")

    _run("GET search users [admin]",
         "GET", f"{A}/api/auth/users/search", 200, user="admin",
         params={"q": "amine"})

    _run("GET bulk users [admin]",
         "GET", f"{A}/api/auth/users/bulk", 200, user="admin",
         params={"ids": [1, 2, 7]})

    _run("GET directory [teacher]",
         "GET", f"{A}/api/auth/users/directory", 200, user="teacher")

    _run("GET directory [student → 403]",
         "GET", f"{A}/api/auth/users/directory", 403, user="student")

    sub("Users — update")
    _run("PUT update own profile [student → 200]",
         "PUT", f"{A}/api/auth/users/{USER_IDS['student']}", 200, user="student",
         json={"prenom": "Amine Updated", "nom": "Ben Salem"})

    _run("PUT update another user [student → 403]",
         "PUT", f"{A}/api/auth/users/{USER_IDS['admin']}", 403, user="student",
         json={"prenom": "Hacked"})

    sub("Company approval (admin only)")
    _run("GET pending companies [admin]",
         "GET", f"{A}/api/auth/users/pending", 200, user="admin")

    _run("GET pending companies [student → 403]",
         "GET", f"{A}/api/auth/users/pending", 403, user="student")

    sub("Logout")
    _run("POST logout [student]",
         "POST", f"{A}/api/auth/logout", 204, user="student")


# ─── Post Service Tests ─────────────────────────────────────────────────────────

def test_posts():
    section("POST SERVICE  (port 8082)")
    A = BASE["post"]

    sub("Create post")
    _run("POST create post [student — no userName field]",
         "POST", f"{A}/api/posts", 201, user="student",
         json={"contenu": "Test post from API suite"},
         capture_key="post_id")

    _run("POST create post [admin — with userName]",
         "POST", f"{A}/api/posts", 201, user="admin",
         json={"contenu": "Admin test post", "userName": "Admin EspritConnect"})

    _run("POST create post without content → 400",
         "POST", f"{A}/api/posts", 400, user="student",
         json={"userName": "No content here"})

    sub("Read posts")
    _run("GET all posts (paginated)",
         "GET", f"{A}/api/posts", 200, user="student",
         params={"page": 0, "size": 5})

    _run("GET post by ID",
         "GET", f"{A}/api/posts/{_ids['post_id']}", 200, user="student",
         skip_if="post_id")

    _run("GET post by unknown ID → 404",
         "GET", f"{A}/api/posts/99999", 404, user="student")

    _run("GET posts by user [student own posts]",
         "GET", f"{A}/api/posts/user/{USER_IDS['student']}", 200, user="student")

    sub("Update post")
    _run("PUT update own post [student]",
         "PUT", f"{A}/api/posts/{_ids['post_id']}", 200, user="student",
         json={"contenu": "Updated content by owner"},
         skip_if="post_id")

    _run("PUT update post [teacher → 400 not owner]",
         "PUT", f"{A}/api/posts/{_ids['post_id']}", 400, user="teacher",
         json={"contenu": "Unauthorized update"},
         skip_if="post_id")

    sub("Comments")
    _run("POST add comment [teacher]",
         "POST", f"{A}/api/posts/{_ids['post_id']}/comments", 201, user="teacher",
         json={"texte": "Great post!", "userName": "Nadia Ayari"},
         capture_key="comment_id", skip_if="post_id")

    _run("POST add comment — no userName (bug fix check)",
         "POST", f"{A}/api/posts/{_ids['post_id']}/comments", 201, user="alumni",
         json={"texte": "Interesting!"},
         skip_if="post_id")

    _run("GET comments by post",
         "GET", f"{A}/api/posts/{_ids['post_id']}/comments", 200, user="student",
         skip_if="post_id")

    _run("DELETE comment [owner]",
         "DELETE", f"{A}/api/posts/comments/{_ids['comment_id']}", 204, user="teacher",
         skip_if="comment_id")

    sub("Likes")
    _run("POST toggle like on post [student]",
         "POST", f"{A}/api/posts/{_ids['post_id']}/likes", 200, user="student",
         skip_if="post_id")

    _run("POST toggle like again (unlike) [student]",
         "POST", f"{A}/api/posts/{_ids['post_id']}/likes", 200, user="student",
         skip_if="post_id")

    sub("Delete post")
    _run("DELETE post [student — own]",
         "DELETE", f"{A}/api/posts/{_ids['post_id']}", 204, user="student",
         skip_if="post_id")


# ─── Event / Club Service Tests ─────────────────────────────────────────────────

def test_events():
    section("EVENT SERVICE  (port 8083)")
    A = BASE["event"]
    future_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%dT10:00:00")

    sub("Clubs — CRUD (admin only for write)")
    _run("POST create club [admin]",
         "POST", f"{A}/api/clubs", 201, user="admin",
         json={"nom": "API Test Club", "description": "Created by test suite"},
         capture_key="club_id")

    _run("POST create club [student → 403]",
         "POST", f"{A}/api/clubs", 403, user="student",
         json={"nom": "Unauthorized Club"})

    _run("GET all clubs [student]",
         "GET", f"{A}/api/clubs", 200, user="student")

    _run("GET club by ID [student]",
         "GET", f"{A}/api/clubs/{_ids['club_id']}", 200, user="student",
         skip_if="club_id")

    _run("GET club unknown → 404",
         "GET", f"{A}/api/clubs/99999", 404, user="student")

    _run("PUT update club [admin]",
         "PUT", f"{A}/api/clubs/{_ids['club_id']}", 200, user="admin",
         json={"nom": "Updated API Test Club", "description": "Updated by test suite"},
         skip_if="club_id")

    _run("PUT update club [student → 403]",
         "PUT", f"{A}/api/clubs/{_ids['club_id']}", 403, user="student",
         json={"nom": "Unauthorized Update"},
         skip_if="club_id")

    sub("Club membership")
    _run("POST join club [student]",
         "POST", f"{A}/api/clubs/{_ids['club_id']}/join", 200, user="student",
         skip_if="club_id")

    _run("POST join same club again → 400",
         "POST", f"{A}/api/clubs/{_ids['club_id']}/join", 400, user="student",
         skip_if="club_id")

    _run("DELETE leave club [student]",
         "DELETE", f"{A}/api/clubs/{_ids['club_id']}/leave", 204, user="student",
         skip_if="club_id")

    sub("Events — CRUD")
    _run("POST create event [admin]",
         "POST", f"{A}/api/events", 201, user="admin",
         json={"titre": "API Test Event", "description": "Test",
               "date": future_date, "lieu": "ESPRIT Hall",
               "clubId": _ids["club_id"]},
         capture_key="event_id")

    _run("POST create event [student → 403]",
         "POST", f"{A}/api/events", 403, user="student",
         json={"titre": "Unauthorized Event", "date": future_date})

    _run("POST create event past date → 400",
         "POST", f"{A}/api/events", 400, user="admin",
         json={"titre": "Past Event", "date": "2020-01-01T10:00:00",
               "lieu": "Nowhere"})

    _run("GET all events [student]",
         "GET", f"{A}/api/events", 200, user="student")

    _run("GET event by ID [student]",
         "GET", f"{A}/api/events/{_ids['event_id']}", 200, user="student",
         skip_if="event_id")

    _run("GET events by club",
         "GET", f"{A}/api/events/club/{_ids['club_id']}", 200, user="student",
         skip_if="club_id")

    _run("GET event unknown → 404",
         "GET", f"{A}/api/events/99999", 404, user="student")

    _run("PUT update event [admin]",
         "PUT", f"{A}/api/events/{_ids['event_id']}", 200, user="admin",
         json={"titre": "Updated API Event", "date": future_date,
               "lieu": "ESPRIT Room 3"},
         skip_if="event_id")

    sub("Event registration")
    _run("POST register for event [student]",
         "POST", f"{A}/api/events/{_ids['event_id']}/register", 200, user="student",
         skip_if="event_id")

    _run("POST register same event again → 400",
         "POST", f"{A}/api/events/{_ids['event_id']}/register", 400, user="student",
         skip_if="event_id")

    _run("DELETE unregister from event [student]",
         "DELETE", f"{A}/api/events/{_ids['event_id']}/unregister", 204, user="student",
         skip_if="event_id")

    sub("Delete resources")
    _run("DELETE event [admin]",
         "DELETE", f"{A}/api/events/{_ids['event_id']}", 204, user="admin",
         skip_if="event_id")

    _run("DELETE club [admin]",
         "DELETE", f"{A}/api/clubs/{_ids['club_id']}", 204, user="admin",
         skip_if="club_id")


# ─── Job Service Tests ───────────────────────────────────────────────────────────

def test_jobs():
    section("JOB SERVICE  (port 8084)")
    A = BASE["job"]

    sub("Jobs — CRUD")
    _run("POST create job [company]",
         "POST", f"{A}/api/jobs", 201, user="company",
         json={"titre": "API Test Dev Role", "entreprise": "Acme Corp",
               "description": "Full stack developer", "type": "CDI", "lieu": "Tunis"},
         capture_key="job_id")

    _run("POST create job [admin]",
         "POST", f"{A}/api/jobs", 201, user="admin",
         json={"titre": "Admin Test Job", "entreprise": "ESPRIT",
               "description": "Research role", "type": "STAGE", "lieu": "Ariana"})

    _run("POST create job [student → 403]",
         "POST", f"{A}/api/jobs", 403, user="student",
         json={"titre": "Unauthorized", "entreprise": "X",
               "type": "CDD", "lieu": "X"})

    _run("POST create job invalid type → 400",
         "POST", f"{A}/api/jobs", 400, user="company",
         json={"titre": "Bad type", "entreprise": "X",
               "type": "EMPLOI", "lieu": "X"})

    _run("GET all jobs",
         "GET", f"{A}/api/jobs", 200, user="student",
         params={"page": 0, "size": 5})

    _run("GET job by ID",
         "GET", f"{A}/api/jobs/{_ids['job_id']}", 200, user="student",
         skip_if="job_id")

    _run("GET job unknown → 404",
         "GET", f"{A}/api/jobs/99999", 404, user="student")

    _run("PUT update job [company — own job]",
         "PUT", f"{A}/api/jobs/{_ids['job_id']}", 200, user="company",
         json={"titre": "Updated Dev Role", "entreprise": "Acme Corp",
               "type": "CDD", "lieu": "Lac II"},
         skip_if="job_id")

    _run("PUT update job [student → 403]",
         "PUT", f"{A}/api/jobs/{_ids['job_id']}", 403, user="student",
         json={"titre": "Hack", "entreprise": "X", "type": "CDI", "lieu": "X"},
         skip_if="job_id")

    sub("Applications")
    _run("POST apply to job [student with cvUrl]",
         "POST", f"{A}/api/jobs/{_ids['job_id']}/apply", 201, user="student",
         json={"cvUrl": "http://example.com/student_cv.pdf"},
         capture_key="application_id", skip_if="job_id")

    _run("POST apply same job again → 400",
         "POST", f"{A}/api/jobs/{_ids['job_id']}/apply", 400, user="student",
         json={}, skip_if="job_id")

    _run("POST apply [teacher]",
         "POST", f"{A}/api/jobs/{_ids['job_id']}/apply", 201, user="teacher",
         json={"cvUrl": "http://example.com/teacher_cv.pdf"},
         skip_if="job_id")

    _run("GET applications by job",
         "GET", f"{A}/api/jobs/{_ids['job_id']}/applications", 200, user="company",
         skip_if="job_id")

    _run("GET ranked applicants",
         "GET", f"{A}/api/jobs/{_ids['job_id']}/ranked-applicants", 200, user="company",
         skip_if="job_id")

    _run("PATCH update application status [company]",
         "PATCH", f"{A}/api/jobs/applications/{_ids['application_id']}/status", 200,
         user="company", params={"status": "ACCEPTED"},
         skip_if="application_id")

    _run("PATCH update match score [company]",
         "PATCH", f"{A}/api/jobs/applications/{_ids['application_id']}/match-score", 200,
         user="company",
         json={"matchScore": 87},
         skip_if="application_id")

    _run("PATCH update cv-url [student]",
         "PATCH", f"{A}/api/jobs/applications/{_ids['application_id']}/cv-url", 200,
         user="student",
         json={"cvUrl": "http://example.com/cv_v2.pdf"},
         skip_if="application_id")

    _run("DELETE withdraw application [student]",
         "DELETE", f"{A}/api/jobs/applications/{_ids['application_id']}", 204,
         user="student", skip_if="application_id")

    sub("Mentoring")
    _run("POST request mentoring [student → mentor=teacher]",
         "POST", f"{A}/api/jobs/mentoring", 201, user="student",
         json={"mentorUserId": USER_IDS["teacher"], "domaine": "Data Science"},
         capture_key="mentoring_id")

    _run("GET mentoring as mentee [student]",
         "GET", f"{A}/api/jobs/mentoring/as-mentore", 200, user="student")

    _run("GET mentoring as mentor [teacher]",
         "GET", f"{A}/api/jobs/mentoring/as-mentor", 200, user="teacher")

    sub("Sessions")
    future = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%dT14:00:00")
    _run("POST add session [teacher]",
         "POST", f"{A}/api/jobs/mentoring/{_ids['mentoring_id']}/sessions", 201,
         user="teacher",
         json={"date": future, "dureeMinutes": 60},
         capture_key="session_id", skip_if="mentoring_id")

    _run("GET sessions by mentoring",
         "GET", f"{A}/api/jobs/mentoring/{_ids['mentoring_id']}/sessions", 200,
         user="student", skip_if="mentoring_id")

    _run("PATCH update session status [teacher]",
         "PATCH", f"{A}/api/jobs/sessions/{_ids['session_id']}/status", 200,
         user="teacher", params={"status": "DONE"},
         skip_if="session_id")

    _run("PATCH complete mentoring [teacher]",
         "PATCH", f"{A}/api/jobs/mentoring/{_ids['mentoring_id']}/complete", 200,
         user="teacher", skip_if="mentoring_id")

    sub("Delete job")
    _run("DELETE job [company — own]",
         "DELETE", f"{A}/api/jobs/{_ids['job_id']}", 204, user="company",
         skip_if="job_id")


# ─── Message Service Tests ───────────────────────────────────────────────────────

def test_messages():
    section("MESSAGE SERVICE  (port 8085)")
    A = BASE["message"]

    sub("Send messages")
    # student sends to teacher
    resp = _run("POST send message [student → teacher]",
                "POST", f"{A}/api/messages", 201, user="student",
                json={"recipientUserId": USER_IDS["teacher"],
                      "contenu": "Hello teacher, test message!"},
                capture_key="message_id")

    # Extract conversationId from response
    if resp and resp.status_code == 201:
        try:
            data = resp.json()
            conv_id = data.get("conversationId") or data.get("conversation", {}).get("id")
            if conv_id:
                _ids["conversation_id"] = conv_id
        except Exception:
            pass

    _run("POST send message [teacher → student reply]",
         "POST", f"{A}/api/messages", 201, user="teacher",
         json={"recipientUserId": USER_IDS["student"],
               "contenu": "Hi student, I got your message!"})

    _run("POST send message missing content → 400",
         "POST", f"{A}/api/messages", 400, user="student",
         json={"recipientUserId": USER_IDS["teacher"]})

    sub("Conversations")
    _run("GET my conversations [student]",
         "GET", f"{A}/api/messages/conversations", 200, user="student")

    _run("GET my conversations [teacher]",
         "GET", f"{A}/api/messages/conversations", 200, user="teacher")

    # Fetch conversation ID dynamically if not set
    if _ids["conversation_id"] is None:
        try:
            r = requests.get(
                f"{A}/api/messages/conversations",
                headers={"Authorization": f"Bearer {_tokens.get('student', '')}"},
                timeout=10,
            )
            if r.status_code == 200:
                convs = r.json()
                if convs:
                    _ids["conversation_id"] = convs[0].get("id")
        except Exception:
            pass

    _run("GET messages in conversation [student]",
         "GET", f"{A}/api/messages/conversations/{_ids['conversation_id']}", 200,
         user="student", skip_if="conversation_id")

    _run("PATCH mark conversation as read [student]",
         "PATCH", f"{A}/api/messages/conversations/{_ids['conversation_id']}/read", 200,
         user="student", skip_if="conversation_id")

    sub("Message operations")
    _run("PATCH edit message [student]",
         "PATCH", f"{A}/api/messages/{_ids['message_id']}/edit", 200, user="student",
         json={"contenu": "Edited message content"},
         skip_if="message_id")

    _run("DELETE message [student]",
         "DELETE", f"{A}/api/messages/{_ids['message_id']}", 204, user="student",
         skip_if="message_id")

    sub("Notifications")
    _run("GET notifications [student]",
         "GET", f"{A}/api/messages/notifications", 200, user="student")

    _run("GET unread count [student]",
         "GET", f"{A}/api/messages/notifications/unread-count", 200, user="student")

    # Grab first notification ID for mark-read test
    try:
        r = requests.get(
            f"{A}/api/messages/notifications",
            headers={"Authorization": f"Bearer {_tokens.get('student', '')}"},
            timeout=10,
        )
        if r.status_code == 200 and r.json():
            _ids["notification_id"] = r.json()[0].get("id")
    except Exception:
        pass

    _run("PATCH mark notification as read [student]",
         "PATCH",
         f"{A}/api/messages/notifications/{_ids['notification_id']}/read", 200,
         user="student", skip_if="notification_id")

    sub("Delete conversation")
    _run("DELETE conversation [student]",
         "DELETE",
         f"{A}/api/messages/conversations/{_ids['conversation_id']}", 204,
         user="student", skip_if="conversation_id")


# ─── Resource Service Tests ──────────────────────────────────────────────────────

def test_resources():
    section("RESOURCE SERVICE  (port 8086)")
    A = BASE["resource"]

    sub("Create resource")
    _run("POST create resource [teacher]",
         "POST", f"{A}/api/resources", 201, user="teacher",
         json={"titre": "API Test Resource", "description": "Test description",
               "type": "ARTICLE", "categorie": "ACADEMIC",
               "lien": "https://example.com/resource", "tags": "test,api"},
         capture_key="resource_id")

    _run("POST create resource [student]",
         "POST", f"{A}/api/resources", 201, user="student",
         json={"titre": "Student Resource", "type": "LINK",
               "categorie": "TECHNICAL", "lien": "https://github.com/example"})

    _run("POST create resource missing required → 400",
         "POST", f"{A}/api/resources", 400, user="teacher",
         json={"description": "Missing titre and type"})

    _run("POST create resource invalid enum → 400",
         "POST", f"{A}/api/resources", 400, user="teacher",
         json={"titre": "Bad", "type": "INVALID", "categorie": "ACADEMIC"})

    sub("Read resources")
    _run("GET all resources [student] page 0",
         "GET", f"{A}/api/resources", 200, user="student",
         params={"page": 0, "size": 5})

    _run("GET resource by ID [student]",
         "GET", f"{A}/api/resources/{_ids['resource_id']}", 200, user="student",
         skip_if="resource_id")

    _run("GET resource unknown → 404",
         "GET", f"{A}/api/resources/99999", 404, user="student")

    _run("GET resources by category ACADEMIC",
         "GET", f"{A}/api/resources/category/ACADEMIC", 200, user="student")

    _run("GET resources by type ARTICLE",
         "GET", f"{A}/api/resources/type/ARTICLE", 200, user="student")

    sub("Update resource")
    _run("PUT update resource [teacher — own]",
         "PUT", f"{A}/api/resources/{_ids['resource_id']}", 200, user="teacher",
         json={"titre": "Updated API Resource", "type": "TUTORIAL",
               "categorie": "TECHNICAL"},
         skip_if="resource_id")

    _run("PUT update resource [student → 400 not owner]",
         "PUT", f"{A}/api/resources/{_ids['resource_id']}", 400, user="student",
         json={"titre": "Unauthorized Update", "type": "ARTICLE",
               "categorie": "ACADEMIC"},
         skip_if="resource_id")

    sub("Interactions")
    _run("POST toggle like [student]",
         "POST", f"{A}/api/resources/{_ids['resource_id']}/like", 200, user="student",
         skip_if="resource_id")

    _run("POST toggle like again (unlike) [admin]",
         "POST", f"{A}/api/resources/{_ids['resource_id']}/like", 200, user="admin",
         skip_if="resource_id")

    _run("POST increment download",
         "POST", f"{A}/api/resources/{_ids['resource_id']}/download", 200,
         user="student", skip_if="resource_id")

    sub("Delete resource")
    _run("DELETE resource [teacher — own]",
         "DELETE", f"{A}/api/resources/{_ids['resource_id']}", 204, user="teacher",
         skip_if="resource_id")


# ─── Summary ────────────────────────────────────────────────────────────────────

def print_summary():
    total  = len(_results)
    passed = sum(1 for r in _results if r["status"] == "PASS")
    failed = sum(1 for r in _results if r["status"] == "FAIL")
    skipped= sum(1 for r in _results if r["status"] == "SKIP")

    bar = "=" * 64
    print(f"\n{BOLD}{BLUE}+{bar}+{RESET}")
    print(f"{BOLD}{BLUE}|  RESULTS SUMMARY{' '*46}|{RESET}")
    print(f"{BOLD}{BLUE}+{bar}+{RESET}")
    print(f"{BOLD}{BLUE}|{RESET}  {GREEN}PASSED : {passed:>4}{RESET}{'':22}{BOLD}{BLUE}|{RESET}")
    print(f"{BOLD}{BLUE}|{RESET}  {RED}FAILED : {failed:>4}{RESET}{'':22}{BOLD}{BLUE}|{RESET}")
    print(f"{BOLD}{BLUE}|{RESET}  {DIM}SKIPPED: {skipped:>4}{'':22}{RESET}{BOLD}{BLUE}|{RESET}")
    print(f"{BOLD}{BLUE}|{RESET}  {'TOTAL  : ':9}{total:>4}{'':22}{BOLD}{BLUE}|{RESET}")
    print(f"{BOLD}{BLUE}+{bar}+{RESET}")

    if failed > 0:
        print(f"\n{BOLD}{RED}Failed tests:{RESET}")
        for r in _results:
            if r["status"] == "FAIL":
                print(f"  {RED}✗{RESET}  {r['name']}  (got HTTP {r.get('actual', '?')})")

    score_pct = round(passed / (total - skipped) * 100) if (total - skipped) > 0 else 0
    color = GREEN if score_pct >= 90 else (YELLOW if score_pct >= 70 else RED)
    print(f"\n  {BOLD}Score: {color}{score_pct}%{RESET}{BOLD} ({passed}/{total - skipped} tests passed){RESET}\n")


# ─── Entry point ────────────────────────────────────────────────────────────────

def main():
    print(f"\n{BOLD}{CYAN}EspritConnect - Full CRUD API Test Suite{RESET}")
    print(f"{DIM}Started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{RESET}")
    print(f"{DIM}Testing 6 microservices across all user roles{RESET}\n")

    # 1. Login
    login_all()

    if not _tokens:
        print(f"\n{RED}No tokens acquired — are the services running?  Aborting.{RESET}\n")
        sys.exit(1)

    # 2. Run tests per service
    test_auth()
    test_posts()
    test_events()
    test_jobs()
    test_messages()
    test_resources()

    # 3. Summary
    print_summary()


if __name__ == "__main__":
    main()
