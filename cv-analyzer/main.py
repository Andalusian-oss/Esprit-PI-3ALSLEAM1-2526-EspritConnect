"""
CV Analyzer Service v2 — improved with job matching, ATS score, tips, aliases,
deduplication, timeline extraction, soft skill scoring, DOCX support, and red flag detection.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import re
import io
import httpx
import os
from typing import Optional

app = FastAPI(title="CV Analyzer", version="2.0.0")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:4200").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)

# ── Skill aliases (normalize before matching) ────────────────────────────────
SKILL_ALIASES = {
    "js": "javascript", "ts": "typescript", "node": "node.js", "nodejs": "node.js",
    "spring boot": "spring", "springboot": "spring", "react.js": "react",
    "reactjs": "react", "vue.js": "vue", "vuejs": "vue", "angular.js": "angular",
    "next": "next.js", "nextjs": "next.js", "k8s": "kubernetes",
    "postgres": "postgresql", "pg": "postgresql", "mongo": "mongodb",
    "aws lambda": "aws", "amazon web services": "aws",
    "google cloud": "gcp", "microsoft azure": "azure",
    "ml": "machine learning", "dl": "deep learning",
    "oop": "design patterns", "solid principles": "solid",
}

# ── Skill database ──────────────────────────────────────────────────────────
TECH_SKILLS = {
    "languages": ["python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
                  "kotlin", "swift", "php", "ruby", "scala", "r", "matlab", "dart", "node.js"],
    "frameworks": ["spring", "django", "flask", "fastapi", "angular", "react", "vue", "next.js",
                   "nestjs", "express", "laravel", "rails", "flutter", "tensorflow", "pytorch",
                   "scikit-learn", "keras", "hibernate", "mybatis"],
    "databases": ["mysql", "postgresql", "mongodb", "redis", "elasticsearch", "oracle", "sqlite",
                  "cassandra", "dynamodb", "firebase", "mariadb"],
    "devops": ["docker", "kubernetes", "jenkins", "github actions", "gitlab ci", "terraform",
               "ansible", "aws", "azure", "gcp", "nginx", "linux", "bash"],
    "tools": ["git", "jira", "confluence", "postman", "swagger", "figma", "maven", "gradle",
              "webpack", "vite", "npm", "yarn"],
    "concepts": ["rest api", "microservices", "agile", "scrum", "tdd", "ci/cd", "solid",
                 "design patterns", "machine learning", "deep learning", "nlp", "data science",
                 "data analysis", "computer vision", "blockchain", "cybersecurity"],
}

SOFT_SKILLS = ["communication", "teamwork", "leadership", "problem solving", "critical thinking",
               "adaptability", "creativity", "time management", "collaboration", "analytical"]

EDUCATION_KEYWORDS = ["bachelor", "master", "phd", "doctorate", "engineer", "licence",
                       "bts", "dut", "bac", "university", "école", "esprit", "sup'com",
                       "insat", "ensi", "enit", "isitcom", "iset", "degree", "diploma",
                       "formation", "certification", "certificate"]

EXPERIENCE_PATTERNS = [
    r"(\d+)\+?\s*(?:years?|ans?)\s*(?:of\s*)?(?:experience|expérience)",
    r"(?:stage|internship|intern)\s*[:\-]?\s*([^|\n]{10,80})",
    r"(?:developer|engineer|analyst|consultant|manager|architect)\s+at\s+([^|\n]{3,50})",
]

LANGUAGE_MAP = {
    "french": "French", "français": "French", "anglais": "English", "english": "English",
    "arabic": "Arabic", "arabe": "Arabic", "german": "German", "allemand": "German",
    "spanish": "Spanish", "espagnol": "Spanish", "italian": "Italian", "italien": "Italian",
}

LEVEL_KEYWORDS = {
    "fluent": "Fluent", "native": "Native", "bilingual": "Bilingual",
    "professional": "Professional", "intermediate": "Intermediate",
    "beginner": "Beginner", "courant": "Fluent", "maternelle": "Native",
    "bilingue": "Bilingual", "intermédiaire": "Intermediate", "débutant": "Beginner",
    "b2": "Upper-Intermediate", "c1": "Advanced", "c2": "Proficient",
    "a2": "Elementary", "b1": "Intermediate",
}

# Date pattern for timeline extraction
DATE_RANGE_PATTERN = re.compile(
    r"(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|janvier|f\u00e9vrier|mars|avril|"
    r"mai|juin|juillet|ao\u00fbt|septembre|octobre|novembre|d\u00e9cembre)[a-z]*\.?\s*)?"
    r"(\d{4})\s*[-\u2013\u2014]\s*(\d{4}|present|pr\u00e9sent|today|aujourd'hui)",
    re.IGNORECASE
)


# ── Text extraction ──────────────────────────────────────────────────────────

def apply_aliases(text: str) -> str:
    """Apply skill aliases before matching."""
    t = text.lower()
    for alias, canonical in SKILL_ALIASES.items():
        t = re.sub(r"\b" + re.escape(alias) + r"\b", canonical, t)
    return t


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from PDF using pdfplumber (all pages)."""
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        return "\n".join(page.extract_text() or "" for page in pdf.pages)


def extract_text_from_docx(docx_bytes: bytes) -> str:
    """Extract text from DOCX using python-docx."""
    try:
        import docx as python_docx
        doc = python_docx.Document(io.BytesIO(docx_bytes))
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    except ImportError:
        raise HTTPException(status_code=422, detail="python-docx not installed; DOCX not supported")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse DOCX: {str(e)}")


def extract_contact(text: str) -> dict:
    email = re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    phone = re.findall(r"(?:\+216|\+33|\+1)?\s*[\d\s\-\.]{8,15}", text)
    linkedin = re.findall(r"linkedin\.com/in/[\w\-]+", text, re.IGNORECASE)
    github = re.findall(r"github\.com/[\w\-]+", text, re.IGNORECASE)
    return {
        "email": email[0] if email else None,
        "phone": phone[0].strip() if phone else None,
        "linkedin": linkedin[0] if linkedin else None,
        "github": github[0] if github else None,
    }


def extract_name(text: str) -> Optional[str]:
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for line in lines[:5]:
        if len(line.split()) in (2, 3) and not re.search(r"[@\d]", line):
            if line[0].isupper():
                return line
    return None


def extract_skills(text: str) -> dict:
    """Extract skills with alias normalization and deduplication."""
    normalized = apply_aliases(text)
    found: dict = {cat: [] for cat in TECH_SKILLS}
    for cat, skills in TECH_SKILLS.items():
        for skill in skills:
            if re.search(r"\b" + re.escape(skill.lower()) + r"\b", normalized):
                if skill not in found[cat]:
                    found[cat].append(skill)
    lower = text.lower()
    found["soft_skills"] = list({
        s for s in SOFT_SKILLS if re.search(r"\b" + re.escape(s) + r"\b", lower)
    })
    return found


def extract_education(text: str) -> list:
    lines = text.split("\n")
    education = []
    seen = set()
    for line in lines:
        lower_line = line.lower()
        if any(kw in lower_line for kw in EDUCATION_KEYWORDS):
            entry = line.strip()
            if len(entry) > 5 and entry not in seen:
                education.append(entry[:120])
                seen.add(entry)
    return education[:5]


def extract_experience(text: str) -> dict:
    lower = text.lower()
    years = None
    years_match = re.search(r"(\d+)\+?\s*(?:years?|ans?)\s*(?:of\s*)?(?:experience|exp\u00e9rience)", lower)
    if years_match:
        try:
            years = int(years_match.group(1))
        except Exception:
            pass

    internships = []
    for m in re.finditer(r"(?:stage|internship|intern)[^\n]*", lower):
        entry = m.group(0).strip()[:100]
        if entry not in internships:
            internships.append(entry)

    return {"years_estimated": years, "internships": internships[:3]}


def extract_timeline(text: str) -> list:
    """Extract date ranges from the CV."""
    timeline = []
    for m in DATE_RANGE_PATTERN.finditer(text):
        context_start = max(0, m.start() - 60)
        context = text[context_start:m.end() + 60].replace("\n", " ").strip()
        timeline.append({"start": m.group(1), "end": m.group(2), "context": context[:120]})
    return timeline[:10]


def detect_red_flags(text: str, contact: dict, education: list, word_count: int) -> list:
    """Return list of red flag strings."""
    flags = []
    if word_count < 200:
        flags.append("CV is very short (< 200 words) — add more detail")
    if not contact.get("email"):
        flags.append("No email address found")
    if not contact.get("phone"):
        flags.append("No phone number found")
    if not education:
        flags.append("No education section detected")
    years = sorted(set(int(m.group(0)) for m in re.finditer(r"\b(20\d{2}|19\d{2})\b", text)))
    if len(years) >= 2:
        for i in range(len(years) - 1):
            if years[i + 1] - years[i] > 2:
                flags.append(f"Possible employment gap between {years[i]} and {years[i + 1]}")
    return flags


def compute_ats_score(contact: dict, education: list, experience: dict, text: str) -> int:
    """ATS compliance check (0-100)."""
    score = 0
    if contact.get("email"): score += 20
    if contact.get("phone"): score += 10
    if contact.get("linkedin"): score += 10
    if education: score += 20
    if experience.get("years_estimated") or experience.get("internships"): score += 15
    if re.search(r"\d+%|\d+\s*(?:users|projects|clients|mois|months|years|ans|\u20ac|\$)", text, re.IGNORECASE):
        score += 15
    if re.findall(r"\d{2}/\d{4}|\d{4}-\d{2}", text):
        score += 10
    return min(100, score)


def generate_tips(contact: dict, education: list, skills: dict, experience: dict,
                  word_count: int, ats_score: int) -> list:
    """Generate actionable improvement tips."""
    tips = []
    if not contact.get("linkedin"):
        tips.append("Add your LinkedIn profile URL to increase visibility")
    if not contact.get("github") and (skills.get("languages") or skills.get("frameworks")):
        tips.append("Add your GitHub profile to showcase your code")
    if not education:
        tips.append("Add an education section with your degree and institution")
    if not skills.get("languages"):
        tips.append("List your programming languages explicitly")
    if not skills.get("devops"):
        tips.append("Mention DevOps tools (Docker, Git, CI/CD) if applicable")
    if not experience.get("years_estimated") and not experience.get("internships"):
        tips.append("Add work experience or internships with dates and responsibilities")
    if word_count < 300:
        tips.append("Expand your CV — aim for at least 300 words to improve ATS scoring")
    if ats_score < 60:
        tips.append("Improve ATS compliance: ensure email, phone, education, and dates are clearly formatted")
    return tips


def compute_job_match_score(all_skills: list, job_description: str) -> int:
    """Match CV skills against job description keywords (0–100)."""
    if not job_description or not all_skills:
        return 0
    jd_normalized = apply_aliases(job_description.lower())
    cv_skills_lower = {s.lower() for s in all_skills}
    all_tech = {s.lower() for lst in TECH_SKILLS.values() for s in lst}
    jd_words = set(re.findall(r"\b[a-z][a-z+#.]{1,20}\b", jd_normalized))
    jd_tech_required = jd_words & all_tech
    if jd_tech_required:
        jd_matched = sum(1 for s in jd_tech_required if s in cv_skills_lower)
        return min(100, round((jd_matched / len(jd_tech_required)) * 100))
    matched = sum(1 for skill in cv_skills_lower
                  if re.search(r"\b" + re.escape(skill) + r"\b", jd_normalized))
    if not cv_skills_lower:
        return 0
    return min(100, round((matched / len(cv_skills_lower)) * 100))


def extract_languages(text: str) -> list:
    lower = text.lower()
    found = []
    for key, lang in LANGUAGE_MAP.items():
        if re.search(r"\b" + re.escape(key) + r"\b", lower):
            level = "Mentioned"
            for lk, lv in LEVEL_KEYWORDS.items():
                pattern = re.compile(r"\b" + re.escape(key) + r"[^.]{0,40}\b" + re.escape(lk) + r"\b", re.IGNORECASE)
                pattern2 = re.compile(r"\b" + re.escape(lk) + r"[^.]{0,40}\b" + re.escape(key) + r"\b", re.IGNORECASE)
                if pattern.search(text) or pattern2.search(text):
                    level = lv
                    break
            entry = {"language": lang, "level": level}
            if entry not in found:
                found.append(entry)
    return found


def compute_score(skills: dict, education: list, contact: dict, experience: dict) -> int:
    score = 0
    tech_skills = {k: v for k, v in skills.items() if k != "soft_skills"}
    total_tech = sum(len(v) for v in tech_skills.values())
    total_soft = len(skills.get("soft_skills", []))
    score += min(35, total_tech * 2)
    score += min(5, total_soft)  # soft skills contribute
    if education:
        score += min(20, len(education) * 8)
    if contact.get("email"): score += 10
    if contact.get("phone"): score += 5
    if contact.get("linkedin"): score += 5
    if contact.get("github"): score += 5
    if experience.get("years_estimated"):
        score += min(10, experience["years_estimated"] * 3)
    elif experience.get("internships"):
        score += 5
    return min(100, score)


@app.post("/analyze")
async def analyze_cv(
    file: UploadFile = File(...),
    job_description: Optional[str] = None,
):
    filename = (file.filename or "").lower()
    is_docx = filename.endswith(".docx") or filename.endswith(".doc")
    is_pdf = filename.endswith(".pdf")

    if not is_pdf and not is_docx:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    try:
        if is_docx:
            text = extract_text_from_docx(content)
        else:
            text = extract_text_from_pdf(content)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse file: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=422, detail="Document appears to be empty or image-based")

    name = extract_name(text)
    contact = extract_contact(text)
    skills = extract_skills(text)
    education = extract_education(text)
    experience = extract_experience(text)
    languages = extract_languages(text)
    timeline = extract_timeline(text)
    word_count = len(text.split())

    score = compute_score(skills, education, contact, experience)
    ats_score = compute_ats_score(contact, education, experience, text)
    all_skills_flat = list({s for lst in skills.values() for s in lst})
    job_match_score = compute_job_match_score(all_skills_flat, job_description) if job_description else None
    red_flags = detect_red_flags(text, contact, education, word_count)
    tips = generate_tips(contact, education, skills, experience, word_count, ats_score)

    result = {
        "name": name,
        "contact": contact,
        "skills": skills,
        "all_skills": all_skills_flat,
        "education": education,
        "experience": experience,
        "languages": languages,
        "timeline": timeline,
        "score": score,
        "ats_score": ats_score,
        "word_count": word_count,
        "summary": generate_summary(name, skills, experience, education, score),
        "tips": tips,
        "red_flags": red_flags,
    }
    if job_match_score is not None:
        result["job_match_score"] = job_match_score
    return result


@app.post("/analyze-url")
async def analyze_cv_url(payload: dict):
    url = payload.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="Missing 'url' field")
    if url.startswith("/"):
        base = os.getenv("API_GATEWAY_URL", "http://api-gateway:8080")
        url = f"{base}{url}"
    job_description = payload.get("job_description")
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.get(url)
            resp.raise_for_status()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not fetch CV: {str(e)}")

    content = resp.content
    content_type = resp.headers.get("content-type", "")
    is_docx = "docx" in content_type or url.lower().endswith(".docx")
    try:
        if is_docx:
            text = extract_text_from_docx(content)
        else:
            text = extract_text_from_pdf(content)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=422, detail="Could not parse document from URL")

    if not text.strip():
        raise HTTPException(status_code=422, detail="Document appears to be empty or image-based")

    name = extract_name(text)
    contact = extract_contact(text)
    skills = extract_skills(text)
    education = extract_education(text)
    experience = extract_experience(text)
    languages = extract_languages(text)
    timeline = extract_timeline(text)
    word_count = len(text.split())

    score = compute_score(skills, education, contact, experience)
    ats_score = compute_ats_score(contact, education, experience, text)
    all_skills_flat = list({s for lst in skills.values() for s in lst})
    job_match_score = compute_job_match_score(all_skills_flat, job_description) if job_description else None
    red_flags = detect_red_flags(text, contact, education, word_count)
    tips = generate_tips(contact, education, skills, experience, word_count, ats_score)

    result = {
        "name": name,
        "contact": contact,
        "skills": skills,
        "all_skills": all_skills_flat,
        "education": education,
        "experience": experience,
        "languages": languages,
        "timeline": timeline,
        "score": score,
        "ats_score": ats_score,
        "word_count": word_count,
        "summary": generate_summary(name, skills, experience, education, score),
        "tips": tips,
        "red_flags": red_flags,
    }
    if job_match_score is not None:
        result["job_match_score"] = job_match_score
    return result


def generate_summary(name, skills, experience, education, score):
    tech = {k: v for k, v in skills.items() if k != "soft_skills"}
    parts = []
    if name:
        parts.append(f"Candidate: {name}.")
    if education:
        parts.append(f"Education: {education[0]}.")
    if experience.get("years_estimated"):
        parts.append(f"Experience: ~{experience['years_estimated']} years.")
    elif experience.get("internships"):
        parts.append("Has internship experience.")
    top_langs = skills.get("languages", [])[:4]
    if top_langs:
        parts.append(f"Tech: {', '.join(top_langs)}.")
    parts.append(f"Overall CV score: {score}/100.")
    return " ".join(parts)


@app.get("/health")
def health():
    return {"status": "ok", "service": "cv-analyzer", "version": "2.0.0"}
