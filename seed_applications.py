"""
Seed script: login as each student, upload a real CV PDF, attach it to their
applications, then trigger a full CV analysis and save the match score.

Run from the project root:
    python seed_applications.py
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import requests
import json
import time
from pathlib import Path

API = "http://localhost:8089"          # API gateway (Docker: 8089→8080)
CV_ANALYZER = "http://localhost:8090"  # direct (no auth needed)
TEST_CVS = Path(__file__).parent / "cv-analyzer" / "test_cvs"

# ── Known students with their app IDs ─────────────────────────────────────────
# Format: (email, prenom, nom, user_id, [(app_id, job_id, job_description), ...])
STUDENTS = [
    (
        "amine.bensalem@esprit.tn", "Amine", "Ben Salem", 7,
        [
            (5,  2, "React Angular TypeScript JavaScript frontend developer stage internship HTML CSS"),
            (36, 1, "Full Stack Java Spring Boot REST API Angular MySQL Docker developer CDI"),
        ],
        "cv_fullstack.pdf",
    ),
    (
        "sara.khemiri@esprit.tn", "Sara", "Khemiri", 8,
        [
            (6,  2, "React Angular TypeScript JavaScript frontend developer HTML CSS stage"),
            (15, 6, "Data Analyst BI SQL Python Tableau Power BI MySQL stage"),
        ],
        "cv_fullstack.pdf",
    ),
    (
        "karim.ferchichi@esprit.tn", "Karim", "Ferchichi", 11,
        [
            (7,  2, "React Angular TypeScript JavaScript frontend developer HTML CSS stage"),
        ],
        "cv_java_dev.pdf",
    ),
    (
        "amal.chebbi@esprit.tn", "Amal", "Chebbi", 14,
        [
            (8,  2, "React Angular TypeScript JavaScript frontend stage internship"),
        ],
        "cv_student_intern.pdf",
    ),
    (
        "wassim.mejri@esprit.tn", "mejri", "wassim", 41,
        [
            (32, 2, "React Angular TypeScript JavaScript frontend developer stage"),
            (33, 1, "Full Stack Java Spring Boot REST API developer CDI"),
        ],
        "cv_data_scientist.pdf",
    ),
    (
        "yassine.jbali@esprit.tn", "Yassine", "Jbali", 9,
        [
            (9,  3, "DevOps Docker Kubernetes Jenkins CI/CD Linux Ansible Terraform"),
        ],
        "cv_devops.pdf",
    ),
    (
        "ines.bouaziz@esprit.tn", "Inès", "Bouaziz", 10,
        [
            (17, 6, "Data Analyst BI SQL Python Machine Learning stage"),
        ],
        "cv_data_scientist.pdf",
    ),
    (
        "rania.hamdi@esprit.tn", "Rania", "Hamdi", 12,
        [
            (16, 6, "Data Analyst BI SQL Python Tableau stage"),
        ],
        "cv_data_scientist.pdf",
    ),
    (
        "sami.amara@esprit.tn", "Sami", "Amara", 15,
        [
            (1,  1, "Full Stack Java Spring Boot Angular REST API MySQL CDI developer"),
        ],
        "cv_java_dev.pdf",
    ),
    (
        "fares.dridi@esprit.tn", "Fares", "Dridi", 34,
        [
            (20, 7, "Spring Boot Java backend developer CDI REST API Microservices"),
        ],
        "cv_java_dev.pdf",
    ),
    (
        "mouna.zribi@esprit.tn", "Mouna", "Zribi", 35,
        [
            (22, 8, "QA Automation testing Selenium Python Java stage"),
            (25, 9, "Business Intelligence BI SQL Consultant CDD"),
        ],
        "cv_student_intern.pdf",
    ),
    (
        "nesrine.baccouche@esprit.tn", "Nesrine", "Baccouche", 33,
        [
            (21, 8, "QA Automation testing Python Java stage"),
            (30, 11, "IoT Data Engineer Python AWS Azure CDI"),
        ],
        "cv_fullstack.pdf",
    ),
]

# Alumni who also have applications
ALUMNI = [
    (
        "mokhtar.saidi@gmail.com", "Mokhtar", "Saïdi", 17,
        [
            (2,  1, "Full Stack Java Spring Boot Angular REST API MySQL CDI"),
            (10, 3, "DevOps Docker Kubernetes Jenkins CDD"),
        ],
        "cv_devops.pdf",
    ),
    (
        "walid.hosni@gmail.com", "Walid", "Hosni", 19,
        [
            (3,  1, "Full Stack Java Spring Boot Angular MySQL CDI"),
            (9,  3, "DevOps Docker Kubernetes Jenkins CDD"),
        ],
        "cv_devops.pdf",
    ),
    (
        "sofiene.lahmar@gmail.com", "Sofiene", "Lahmar", 30,
        [
            (18, 7, "Spring Boot Java backend developer CDI"),
            (29, 11, "IoT Data Engineer Python CDI"),
        ],
        "cv_java_dev.pdf",
    ),
    (
        "rim.missaoui@gmail.com", "Rim", "Missaoui", 31,
        [
            (19, 7, "Spring Boot Java backend REST API CDI"),
            (31, 11, "IoT Data Engineer CDI"),
        ],
        "cv_fullstack.pdf",
    ),
]

GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

def login(email: str, password: str = "password"):
    try:
        r = requests.post(f"{API}/api/auth/login",
                          json={"email": email, "password": password},
                          timeout=10)
        if r.status_code == 200:
            return r.json().get("token")
        print(f"  {RED}Login failed ({r.status_code}): {r.text[:80]}{RESET}")
        return None
    except Exception as e:
        print(f"  {RED}Login error: {e}{RESET}")
        return None


def upload_cv(token: str, cv_path: Path):
    try:
        with open(cv_path, "rb") as f:
            r = requests.post(
                f"{API}/api/jobs/upload",
                files={"file": (cv_path.name, f, "application/pdf")},
                headers={"Authorization": f"Bearer {token}"},
                timeout=20,
            )
        if r.status_code == 200:
            url = r.json().get("url")
            return url
        print(f"  {RED}Upload failed ({r.status_code}): {r.text[:80]}{RESET}")
        return None
    except Exception as e:
        print(f"  {RED}Upload error: {e}{RESET}")
        return None


def patch_cv_url(token: str, app_id: int, cv_url: str) -> bool:
    try:
        r = requests.patch(
            f"{API}/api/jobs/applications/{app_id}/cv-url",
            json={"cvUrl": cv_url},
            headers={"Authorization": f"Bearer {token}"},
            timeout=10,
        )
        return r.status_code == 200
    except Exception as e:
        print(f"  {RED}Patch cvUrl error: {e}{RESET}")
        return False


def analyze_and_score(cv_path: Path, job_desc: str):
    try:
        with open(cv_path, "rb") as f:
            r = requests.post(
                f"{CV_ANALYZER}/analyze",
                files={"file": (cv_path.name, f, "application/pdf")},
                params={"job_description": job_desc},
                timeout=30,
            )
        if r.status_code == 200:
            return r.json()
        return None
    except Exception as e:
        print(f"  {RED}Analysis error: {e}{RESET}")
        return None


def save_match_score(token: str, app_id: int, score: int) -> bool:
    try:
        r = requests.patch(
            f"{API}/api/jobs/applications/{app_id}/match-score",
            json={"matchScore": score},
            headers={"Authorization": f"Bearer {token}"},
            timeout=10,
        )
        return r.status_code == 200
    except Exception as e:
        print(f"  {RED}Save score error: {e}{RESET}")
        return False


def process_user(email, prenom, nom, user_id, applications, cv_filename):
    print(f"\n{BOLD}── {prenom} {nom} ({email}){RESET}")

    # 1) Check CV file exists
    cv_path = TEST_CVS / cv_filename
    if not cv_path.exists():
        print(f"  {YELLOW}CV file not found: {cv_path} — skipping{RESET}")
        return 0

    # 2) Login
    token = login(email)
    if not token:
        return 0
    print(f"  {GREEN}Logged in{RESET}")

    # 3) Upload CV once for this user
    cv_url = upload_cv(token, cv_path)
    if not cv_url:
        return 0
    print(f"  {GREEN}CV uploaded:{RESET} {cv_url}")

    success = 0
    for app_id, job_id, job_desc in applications:
        # 4) Patch cv_url on the application
        patched = patch_cv_url(token, app_id, cv_url)
        if not patched:
            print(f"  {RED}Failed to attach CV to application {app_id}{RESET}")
            continue

        # 5) Analyze CV and get score
        analysis = analyze_and_score(cv_path, job_desc)
        if not analysis:
            print(f"  {YELLOW}Analysis failed for app {app_id}, skipping score{RESET}")
            continue

        cv_score = analysis.get("score", 0)
        ats_score = analysis.get("ats_score", 0)
        job_match = analysis.get("job_match_score", 0)
        all_skills = analysis.get("all_skills", [])

        # Use CV score as the match score (or job_match_score if available)
        final_score = job_match if job_match else cv_score

        # 6) Save match score
        saved = save_match_score(token, app_id, final_score)
        status = f"{GREEN}✓{RESET}" if saved else f"{RED}✗{RESET}"
        print(
            f"  {status} App #{app_id} (Job #{job_id}) — "
            f"CV:{cv_score} ATS:{ats_score} Match:{job_match} → saved={final_score} "
            f"({len(all_skills)} skills)"
        )
        if saved:
            success += 1

    return success


def main():
    print(f"\n{BOLD}{'='*62}{RESET}")
    print(f"{BOLD}  ESPRIT CONNECT — APPLICATION SEEDER{RESET}")
    print(f"{BOLD}{'='*62}{RESET}")

    # Check cv-analyzer
    try:
        h = requests.get(f"{CV_ANALYZER}/health", timeout=5).json()
        print(f"\n{GREEN}cv-analyzer:{RESET} {h.get('service')} v{h.get('version')}")
    except Exception:
        print(f"{RED}cv-analyzer not reachable at {CV_ANALYZER}{RESET}")
        return

    # Check gateway
    try:
        r = requests.get(f"{API}/api/auth/users", timeout=5, headers={"Authorization": "Bearer dummy"})
        print(f"{GREEN}API gateway:{RESET} reachable (status {r.status_code})")
    except Exception as e:
        print(f"{RED}API gateway not reachable at {API}: {e}{RESET}")
        return

    all_users = STUDENTS + ALUMNI
    total_success = 0
    for entry in all_users:
        email, prenom, nom, user_id, applications, cv_file = entry
        n = process_user(email, prenom, nom, user_id, applications, cv_file)
        total_success += n
        time.sleep(0.3)   # small delay to avoid hammering the gateway

    print(f"\n{BOLD}{'='*62}{RESET}")
    print(f"{GREEN}{BOLD}  Done! {total_success} application(s) scored.{RESET}")
    print(f"  Reload the RH dashboard to see the results.\n")


if __name__ == "__main__":
    main()
