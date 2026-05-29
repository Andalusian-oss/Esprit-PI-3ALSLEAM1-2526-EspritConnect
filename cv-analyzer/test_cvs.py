"""
CV Analyzer Test Script
Downloads sample CVs and tests them against the local cv-analyzer service.
"""

import requests
import json
import os
import sys
from pathlib import Path

CV_ANALYZER_URL = "http://localhost:8090"
DOWNLOAD_DIR = Path(__file__).parent / "test_cvs"
DOWNLOAD_DIR.mkdir(exist_ok=True)

# ── Sample CV PDFs (publicly accessible) ────────────────────────────────────
SAMPLE_CVS = [
    {
        "name": "Software Engineer - Java/Spring",
        "url": "https://www.overleaf.com/latex/templates/modern-cv/fprtsqgvtkmr.pdf",
        "filename": "cv_modern_template.pdf",
    },
    {
        "name": "Full Stack Developer",
        "url": "https://resumegenius.com/wp-content/uploads/Software-Engineer-Resume-Example.pdf",
        "filename": "cv_software_engineer.pdf",
    },
    {
        "name": "Data Scientist",
        "url": "https://cdn-careerservices.fas.harvard.edu/wp-content/uploads/sites/161/2023/09/College-resume-and-cover-letter.pdf",
        "filename": "cv_harvard_sample.pdf",
    },
    {
        "name": "Entry Level / Intern",
        "url": "https://www.careercup.com/static/resume-sample.pdf",
        "filename": "cv_entry_level.pdf",
    },
]

# ── Job descriptions for matching ────────────────────────────────────────────
JOB_DESCRIPTIONS = {
    "Java Backend Developer": (
        "We are looking for a Java Spring Boot developer with 2+ years experience. "
        "Skills required: Java, Spring, REST API, MySQL, Docker, Git, Microservices, JUnit, Maven."
    ),
    "Full Stack Web Developer": (
        "Looking for Angular + Spring Boot developer. "
        "Must know: JavaScript, TypeScript, Angular, Spring, MySQL, Docker, REST API, Git, Agile."
    ),
    "Data Scientist": (
        "Data science role requiring: Python, Machine Learning, TensorFlow, scikit-learn, "
        "Pandas, SQL, Jupyter, NLP, deep learning, data analysis."
    ),
}

# ── ANSI colors ──────────────────────────────────────────────────────────────
GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"


def score_color(score: int) -> str:
    if score >= 70:
        return GREEN
    elif score >= 40:
        return YELLOW
    return RED


def download_cv(name: str, url: str, filename: str) -> Path | None:
    dest = DOWNLOAD_DIR / filename
    if dest.exists():
        print(f"  [cached] {filename}")
        return dest
    print(f"  Downloading: {filename} ...", end=" ", flush=True)
    try:
        r = requests.get(url, timeout=20, headers={"User-Agent": "Mozilla/5.0"})
        r.raise_for_status()
        dest.write_bytes(r.content)
        print(f"OK ({len(r.content)//1024} KB)")
        return dest
    except Exception as e:
        print(f"FAILED ({e})")
        return None


def analyze_cv(filepath: Path, job_desc: str | None = None) -> dict | None:
    try:
        files = {"file": (filepath.name, filepath.read_bytes(), "application/pdf")}
        params = {"job_description": job_desc} if job_desc else {}
        r = requests.post(f"{CV_ANALYZER_URL}/analyze", files=files, params=params, timeout=30)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"  {RED}Analysis failed: {e}{RESET}")
        return None


def print_result(result: dict, job_name: str | None = None):
    score     = result.get("score", 0)
    ats       = result.get("ats_score", 0)
    job_match = result.get("job_match_score")
    name      = result.get("name") or "Unknown"
    words     = result.get("word_count", 0)
    skills    = result.get("skills", {})
    all_skills = result.get("all_skills", [])

    sc = score_color(score)
    print(f"\n  {BOLD}Candidate:{RESET} {name}")
    print(f"  {BOLD}Words:{RESET}     {words}")
    print(f"  {BOLD}Score:{RESET}     {sc}{score}/100{RESET}   "
          f"ATS: {score_color(ats)}{ats}/100{RESET}", end="")
    if job_match is not None:
        print(f"   Job Match ({job_name}): {score_color(job_match)}{job_match}/100{RESET}", end="")
    print()

    # Contact
    contact = result.get("contact", {})
    contact_info = [f"email:{contact['email']}" if contact.get("email") else "no-email",
                    f"phone:{contact['phone']}" if contact.get("phone") else "no-phone",
                    f"linkedin" if contact.get("linkedin") else "",
                    f"github" if contact.get("github") else ""]
    print(f"  {BOLD}Contact:{RESET}   {' | '.join(c for c in contact_info if c)}")

    # Skills breakdown
    print(f"  {BOLD}Skills ({len(all_skills)} total):{RESET}")
    for cat, items in skills.items():
        if items:
            label = cat.replace("_", " ").title()
            print(f"    {CYAN}{label}:{RESET} {', '.join(items)}")

    # Education
    edu = result.get("education", [])
    if edu:
        print(f"  {BOLD}Education:{RESET} {edu[0][:80]}")

    # Experience
    exp = result.get("experience", {})
    if exp.get("years_estimated"):
        print(f"  {BOLD}Experience:{RESET} ~{exp['years_estimated']} years")
    elif exp.get("internships"):
        print(f"  {BOLD}Internships:{RESET} {len(exp['internships'])} found")

    # Languages
    langs = result.get("languages", [])
    if langs:
        lang_str = ", ".join(f"{l['language']} ({l['level']})" for l in langs)
        print(f"  {BOLD}Languages:{RESET} {lang_str}")

    # Red flags
    flags = result.get("red_flags", [])
    if flags:
        print(f"  {RED}Red Flags:{RESET}")
        for f in flags:
            print(f"    - {f}")

    # Tips
    tips = result.get("tips", [])
    if tips:
        print(f"  {YELLOW}Tips:{RESET}")
        for t in tips[:3]:
            print(f"    * {t}")

    # Summary
    summary = result.get("summary", "")
    if summary:
        print(f"  {BOLD}Summary:{RESET} {summary}")


def create_test_pdf(name: str, content: str, filepath: Path):
    """Create a minimal PDF with reportlab if available, else skip."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        c = canvas.Canvas(str(filepath), pagesize=A4)
        y = 800
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, y, name)
        y -= 30
        c.setFont("Helvetica", 11)
        for line in content.split("\n"):
            if y < 50:
                c.showPage()
                y = 800
                c.setFont("Helvetica", 11)
            c.drawString(50, y, line[:100])
            y -= 16
        c.save()
        return True
    except ImportError:
        return False


SYNTHETIC_CVS = [
    {
        "name": "Ahmed Ben Ali",
        "filename": "cv_java_dev.pdf",
        "content": """Ahmed Ben Ali
Java Backend Developer
Email: ahmed.benali@gmail.com | Phone: +216 55 123 456 | LinkedIn: linkedin.com/in/ahmedbenali | GitHub: github.com/ahmedbenali

EDUCATION
Master in Software Engineering - ESPRIT, Tunis (2020-2022)
Bachelor in Computer Science - INSAT (2017-2020)

EXPERIENCE
3 years of experience in Java backend development.

Software Engineer at TunisTech (2022-2024)
- Developed REST API microservices using Spring Boot, Hibernate, MySQL
- Deployed applications with Docker, Kubernetes on AWS
- Implemented CI/CD pipelines with Jenkins and GitHub Actions

Internship at Proxym Group (2021)
- Built REST APIs with Spring Boot and PostgreSQL
- Wrote unit tests with JUnit and Mockito

SKILLS
Languages: Java, Python, JavaScript
Frameworks: Spring, Spring Boot, Hibernate, Angular, React
Databases: MySQL, PostgreSQL, MongoDB, Redis
DevOps: Docker, Kubernetes, Jenkins, GitHub Actions, AWS, Linux
Tools: Git, Maven, Postman, Swagger, Jira
Concepts: REST API, Microservices, Agile, Scrum, TDD, CI/CD, Design Patterns, SOLID

LANGUAGES
Arabic: Native | French: Fluent | English: Professional | German: Beginner

SOFT SKILLS
Teamwork, Leadership, Communication, Problem Solving, Analytical thinking
""",
    },
    {
        "name": "Salma Trabelsi",
        "filename": "cv_fullstack.pdf",
        "content": """Salma Trabelsi
Full Stack Developer
Email: salma.trabelsi@outlook.com | Phone: +216 22 987 654 | GitHub: github.com/salmatrabelsi

EDUCATION
Engineer Degree in Information Technology - ENSI (2018-2023)
Certificate in AWS Cloud Practitioner (2023)

EXPERIENCE
2 years of experience as Full Stack Developer.

Full Stack Developer at Sofrecom (2023-Present)
- Built Angular 17 + Spring Boot microservices platform
- Integrated Docker and managed MySQL/PostgreSQL databases
- Used Git, Scrum, Agile methodologies

Intern at Orange Tunisia (2022)
- Developed web app with React and Node.js backend
- Implemented REST API and MongoDB data layer

SKILLS
Languages: JavaScript, TypeScript, Java, Python, PHP
Frameworks: Angular, React, Vue, Spring, Node.js, Django, Flask
Databases: MySQL, MongoDB, PostgreSQL, Firebase
DevOps: Docker, Git, GitHub Actions, Nginx, Linux
Tools: Git, Webpack, npm, Postman, Figma, Maven, Jira
Concepts: REST API, Microservices, Agile, Scrum, CI/CD

LANGUAGES
Arabic: Native | French: Bilingual | English: Fluent

SOFT SKILLS
Creativity, Collaboration, Adaptability, Time Management
""",
    },
    {
        "name": "Youssef Mansouri",
        "filename": "cv_data_scientist.pdf",
        "content": """Youssef Mansouri
Data Scientist & ML Engineer
Email: youssef.mansouri@esprit.tn | Phone: +216 50 456 789 | LinkedIn: linkedin.com/in/youssefmansouri

EDUCATION
Master in Data Science - ESPRIT (2021-2023)
Bachelor in Mathematics & Computer Science - Sup'Com (2018-2021)

EXPERIENCE
Internship at Ooredoo Tunisia (2023)
- Built customer churn prediction model using scikit-learn, Python
- Data pipeline with Pandas, NumPy, and SQL queries
- Deployed model as REST API with FastAPI

Research Intern at INAT (2022)
- Natural Language Processing project using BERT and TensorFlow
- Computer vision model for plant disease detection with PyTorch

SKILLS
Languages: Python, R, SQL, Julia
Frameworks: TensorFlow, PyTorch, scikit-learn, Keras, FastAPI, Flask
Databases: MySQL, PostgreSQL, Elasticsearch, MongoDB
DevOps: Docker, Git, Linux, Bash
Tools: Jupyter, Git, Postman, Jira
Concepts: Machine Learning, Deep Learning, NLP, Computer Vision, Data Science, Data Analysis

LANGUAGES
Arabic: Native | French: Fluent | English: Fluent

SOFT SKILLS
Analytical, Critical thinking, Problem solving, Communication
""",
    },
    {
        "name": "Ines Chaabane",
        "filename": "cv_student_intern.pdf",
        "content": """Ines Chaabane
Computer Science Student - Looking for Internship
Email: ines.chaabane@iset.tn | Phone: +216 28 111 222

EDUCATION
Licence in Computer Science - ISET Sousse (2021-2024)
Bac Sciences (2021)

SKILLS
Languages: Java, Python, JavaScript, PHP
Frameworks: Spring, Angular, Laravel
Databases: MySQL, SQLite
Tools: Git, npm, Eclipse, VSCode

PROJECTS
E-commerce website with PHP and MySQL (2023)
Library management system in Java (2022)

LANGUAGES
Arabic: Native | French: Intermediate | English: Beginner

SOFT SKILLS
Teamwork, Adaptability
""",
    },
    {
        "name": "Karim Belhadj",
        "filename": "cv_devops.pdf",
        "content": """Karim Belhadj
DevOps Engineer / Cloud Architect
Email: karim.belhadj@gmail.com | Phone: +216 99 321 654 | LinkedIn: linkedin.com/in/karimbelhadj | GitHub: github.com/karimbelhadj

EDUCATION
Master in Cloud Computing & DevOps - ESPRIT (2019-2021)
Engineer Degree in Networks & Telecom - ENIT (2016-2019)

EXPERIENCE
4 years of experience in DevOps and Cloud Engineering.

Senior DevOps Engineer at Telnet (2021-Present)
- Architected Kubernetes clusters on AWS and Azure
- Automated infrastructure with Terraform and Ansible
- Set up CI/CD pipelines with Jenkins, GitLab CI
- Monitoring with Prometheus, Grafana, Elasticsearch

Cloud Engineer at BIAT (2019-2021)
- Managed AWS services (EC2, S3, RDS, Lambda)
- Containerized applications with Docker, Kubernetes
- Linux server administration, Bash scripting

SKILLS
Languages: Python, Bash, Go, Java
Frameworks: FastAPI, Spring
DevOps: Docker, Kubernetes, Jenkins, GitLab CI, GitHub Actions, Terraform, Ansible, AWS, Azure, GCP, Nginx, Linux, Bash
Databases: MySQL, PostgreSQL, Redis, Elasticsearch
Tools: Git, Jira, Confluence, Prometheus, Grafana
Concepts: Microservices, CI/CD, Agile, Scrum

LANGUAGES
Arabic: Native | French: Fluent | English: Professional | German: Intermediate

SOFT SKILLS
Leadership, Problem solving, Communication, Teamwork, Analytical
""",
    },
]


def main():
    print(f"\n{BOLD}{'='*60}{RESET}")
    print(f"{BOLD}  CV ANALYZER — TEST SUITE{RESET}")
    print(f"{BOLD}{'='*60}{RESET}")

    # 1) Check service health
    print(f"\n{CYAN}[1] Checking cv-analyzer service...{RESET}")
    try:
        health = requests.get(f"{CV_ANALYZER_URL}/health", timeout=5).json()
        print(f"  Service: {GREEN}OK{RESET} — {health.get('service')} v{health.get('version')}")
    except Exception as e:
        print(f"  {RED}Service not reachable: {e}{RESET}")
        print("  Start cv-analyzer with: uvicorn main:app --port 8090")
        sys.exit(1)

    # 2) Generate synthetic CVs
    print(f"\n{CYAN}[2] Generating synthetic CV PDFs...{RESET}")
    generated = []
    for cv in SYNTHETIC_CVS:
        filepath = DOWNLOAD_DIR / cv["filename"]
        if not filepath.exists():
            ok = create_test_pdf(cv["name"], cv["content"], filepath)
            if ok:
                print(f"  {GREEN}Created:{RESET} {cv['filename']}")
            else:
                # Fallback: save as plain text with .pdf extension using a minimal PDF builder
                try:
                    _write_minimal_pdf(filepath, cv["name"], cv["content"])
                    print(f"  {GREEN}Created (minimal PDF):{RESET} {cv['filename']}")
                except Exception as e:
                    print(f"  {RED}Could not create PDF for {cv['name']}: {e}{RESET}")
                    continue
        else:
            print(f"  [cached] {cv['filename']}")
        generated.append((cv["name"], filepath))

    # 3) Analyze each CV
    print(f"\n{CYAN}[3] Analyzing CVs...{RESET}")
    job_name = "Java Backend Developer"
    job_desc = JOB_DESCRIPTIONS[job_name]

    results_summary = []

    for cv_name, filepath in generated:
        print(f"\n{BOLD}--- {cv_name} ({filepath.name}) ---{RESET}")
        result = analyze_cv(filepath, job_desc)
        if result:
            print_result(result, job_name)
            results_summary.append({
                "cv": cv_name,
                "score": result.get("score"),
                "ats": result.get("ats_score"),
                "job_match": result.get("job_match_score"),
                "skills_count": len(result.get("all_skills", [])),
            })

    # 4) Test with different job descriptions
    if generated:
        print(f"\n{CYAN}[4] Testing job match scores for each JD on first CV...{RESET}")
        _, first_cv = generated[0]
        for jname, jdesc in JOB_DESCRIPTIONS.items():
            result = analyze_cv(first_cv, jdesc)
            if result:
                jm = result.get("job_match_score")
                if jm is not None:
                    print(f"  {score_color(jm)}{jm:3d}/100{RESET}  — {jname}")
                else:
                    print(f"  N/A  — {jname}")

    # 5) Summary table
    print(f"\n{BOLD}{'='*60}{RESET}")
    print(f"{BOLD}  RESULTS SUMMARY{RESET}")
    print(f"{BOLD}{'='*60}{RESET}")
    header = f"{'CV':<30} {'Score':>6} {'ATS':>5} {'JobMatch':>9} {'Skills':>7}"
    print(f"{BOLD}{header}{RESET}")
    print("-" * 60)
    for r in results_summary:
        jm_str = f"{r['job_match']:>9}" if r["job_match"] is not None else "       N/A"
        sc = score_color(r["score"] or 0)
        print(f"{r['cv']:<30} {sc}{r['score']:>6}/100{RESET} "
              f"{score_color(r['ats'] or 0)}{r['ats']:>5}{RESET} "
              f"{jm_str} {r['skills_count']:>7}")

    print(f"\n{GREEN}Done! Test CVs saved to: {DOWNLOAD_DIR}{RESET}\n")


def _write_minimal_pdf(filepath: Path, title: str, content: str):
    """Write a barebones valid PDF (text-based) without external libraries."""
    lines = content.split("\n")
    # Build PDF content stream
    stream_lines = []
    stream_lines.append("BT")
    stream_lines.append("/F1 12 Tf")
    stream_lines.append("50 800 Td")
    stream_lines.append("14 TL")
    for line in lines:
        safe = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)").replace("\r", "")
        stream_lines.append(f"({safe[:100]}) Tj T*")
    stream_lines.append("ET")
    stream = "\n".join(stream_lines)
    stream_bytes = stream.encode("latin-1", errors="replace")

    # Build PDF objects
    objects = []

    # 1: Catalog
    objects.append(b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    # 2: Pages
    objects.append(b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    # 3: Page
    objects.append(b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n")
    # 4: Content stream
    content_obj = (
        f"4 0 obj\n<< /Length {len(stream_bytes)} >>\nstream\n".encode()
        + stream_bytes
        + b"\nendstream\nendobj\n"
    )
    objects.append(content_obj)
    # 5: Font
    objects.append(b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")

    header = b"%PDF-1.4\n"
    body = b"".join(objects)
    xref_offset = len(header) + len(body)

    offsets = []
    pos = len(header)
    for obj in objects:
        offsets.append(pos)
        pos += len(obj)

    xref = b"xref\n"
    xref += f"0 {len(objects)+1}\n".encode()
    xref += b"0000000000 65535 f \n"
    for off in offsets:
        xref += f"{off:010d} 00000 n \n".encode()

    trailer = f"trailer\n<< /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode()

    filepath.write_bytes(header + body + xref + trailer)


if __name__ == "__main__":
    main()
