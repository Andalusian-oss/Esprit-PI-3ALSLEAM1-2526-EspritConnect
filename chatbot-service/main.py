"""
AI Chatbot Service for ESPRIT Connect.
Priority: OpenAI (GPT-4o-mini) → Groq (LLaMA 3) → Rule-based fallback
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
import re
import logging
import time
from typing import Optional
from collections import defaultdict

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("chatbot")

app = FastAPI(title="ESPRIT Connect Chatbot", version="2.0.0")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:4200").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)

# ── Simple in-process rate limiter (20 req/min per IP) ─────────────────────
_rate_counters: dict = defaultdict(list)
RATE_LIMIT = int(os.getenv("CHAT_RATE_LIMIT", "20"))
RATE_WINDOW = 60  # seconds


def check_rate_limit(ip: str) -> None:
    now = time.time()
    window = _rate_counters[ip]
    # Drop timestamps outside window
    _rate_counters[ip] = [t for t in window if now - t < RATE_WINDOW]
    if len(_rate_counters[ip]) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait before sending more messages.")
    _rate_counters[ip].append(now)

# ── API keys & config ──────────────────────────────────────────────────────
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL   = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_URL     = "https://api.openai.com/v1/chat/completions"

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL   = "llama3-8b-8192"
GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions"

SYSTEM_PROMPT = """You are ESPRIT Connect Assistant, a helpful AI chatbot for the ESPRIT Connect campus platform.

ESPRIT Connect is a professional social network for ESPRIT university (Tunisia) students, alumni, teachers, and companies.

Platform features you can help with:
- **Feed**: Share posts, photos, comments, and connect with the ESPRIT community
- **Events & Clubs**: Discover academic, cultural, sports and tech events; join or create clubs
- **Jobs**: Browse internships (STAGE), CDI, and CDD job offers; apply with your CV; track applications
- **Mentoring**: Connect students with mentors (alumni/teachers) for career guidance
- **Messages**: Real-time chat with individuals and groups
- **Profile**: Manage your academic profile (promo, speciality, parcours)
- **Resources**: Access educational materials, articles, PDFs, tutorials, and career resources
- **CV Analysis**: Recruiters can analyze candidate CVs with AI to extract skills and get match scores
- **Admin**: Platform administration for ESPRIT staff

User roles: Student, Teacher (Enseignant), Alumni, Employee, Company, Admin, Mentor

Be friendly, helpful, and concise. Answer in the same language the user writes in (French or English).
Guide users to the relevant platform section when appropriate.
Keep responses under 250 words unless a detailed explanation is needed.
"""

# ── Rule-based fallback ────────────────────────────────────────────────────
RULES = [
    (r"\b(bonjour|salut|hello|hi|hey)\b", [
        "Bonjour ! Je suis l'assistant ESPRIT Connect. Comment puis-je vous aider ?",
        "Hello! I'm the ESPRIT Connect assistant. How can I help you today?",
    ]),
    (r"\b(jobs?|emploi|offres?|stages?|cdi|cdd|internships?|postuler|apply|appli(cation|cations)?)\b", [
        "Pour les offres d'emploi et stages, rendez-vous dans la section **Jobs**. Vous pouvez filtrer par type (Stage, CDI, CDD) et postuler en joignant votre CV.",
        "For job offers and internships, visit the **Jobs** section. Filter by type (Internship, CDI, CDD) and apply with your CV directly.",
    ]),
    (r"\b(cv|curriculum|resume|candidature|candidates?)\b", [
        "Lors de votre candidature, vous pouvez joindre votre CV (PDF). Les recruteurs peuvent ensuite l'analyser avec notre IA pour extraire vos compétences et obtenir un score de correspondance.",
        "When applying for a job, attach your CV (PDF). Recruiters can analyze it with our AI to extract skills and compute a match score.",
    ]),
    (r"\b(mentoring|mentor|mentee|accompagnement)\b", [
        "Le **Mentoring** vous connecte avec des mentors (alumni ou enseignants). Allez dans Jobs > Mentoring pour faire une demande.",
        "The **Mentoring** feature connects you with mentors (alumni or teachers). Go to Jobs > Mentoring to request a session.",
    ]),
    (r"\b(events?|événements?|clubs?|associations?)\b", [
        "Découvrez les événements et clubs dans la section **Events**. Rejoignez des clubs, créez des événements (sportifs, académiques, culturels, tech) et inscrivez-vous.",
        "Explore events and clubs in the **Events** section. Join clubs, create events, and register for upcoming activities.",
    ]),
    (r"\b(messages?|chat|conversation|messaging)\b", [
        "La messagerie est dans la section **Messages**. Chattez en privé avec n'importe quel membre ou créez des groupes.",
        "The messaging feature is in the **Messages** section. Chat privately or create group conversations.",
    ]),
    (r"\b(resources?|ressources?|articles?|pdf|tutorials?|documents?|matériaux)\b", [
        "Les **Ressources** donnent accès à des articles, PDFs, tutoriels et liens utiles. Filtrez par catégorie : Académique, Carrière, Technique.",
        "The **Resources** section provides articles, PDFs, tutorials, and useful links. Filter by category: Academic, Career, Technical.",
    ]),
    (r"\b(profiles?|profils?|compte|account|settings?)\b", [
        "Gérez votre profil dans la section **Profile** : photo, spécialité, promotion et contact.",
        "Manage your profile in the **Profile** section: photo, speciality, promotion year, and contact details.",
    ]),
    (r"\b(connexion|login|password|mot de passe|signin|sign.?in)\b", [
        "Si vous avez un problème de connexion, vérifiez votre email et mot de passe. Pour une réinitialisation, contactez l'administration ESPRIT.",
        "If you have login issues, check your email and password. For a reset, contact ESPRIT administration.",
    ]),
    (r"\b(esprit|university|université)\b", [
        "ESPRIT Connect est la plateforme officielle de l'École Supérieure Privée d'Ingénierie et de Technologies (ESPRIT), Tunis, Tunisie.",
        "ESPRIT Connect is the official platform of the École Supérieure Privée d'Ingénierie et de Technologies (ESPRIT), Tunis, Tunisia.",
    ]),
    (r"\b(merci|thank|thanks)\b", [
        "Avec plaisir ! N'hésitez pas si vous avez d'autres questions.",
        "You're welcome! Don't hesitate if you have more questions.",
    ]),
    (r"\b(aide|help|support|what can|que peux|que puis)\b", [
        "Je peux vous aider avec :\n• Jobs & Candidatures\n• Events & Clubs\n• Messages\n• Resources\n• Mentoring\n• CV Analysis\n\nQue souhaitez-vous savoir ?",
        "I can help you with:\n• Jobs & Applications\n• Events & Clubs\n• Messages\n• Resources\n• Mentoring\n• CV Analysis\n\nWhat would you like to know?",
    ]),
    (r"\b(score|analyse cv|cv score|ats|match score|analyser mon cv|analyze my cv)\b", [
        "Le score CV est calculé automatiquement :\n• **Score qualité** (0-100) : contact, compétences, éducation, expérience.\n• **Score ATS** (0-100) : conformité aux systèmes de recrutement.\n• **Score de correspondance** : % de compétences requises trouvées dans votre CV.\n\nPour améliorer : ajoutez email, téléphone, LinkedIn, et quantifiez vos réalisations.",
        "The CV score is computed automatically:\n• **Quality score** (0-100): contact, skills, education, experience.\n• **ATS score** (0-100): compliance with applicant tracking systems.\n• **Job match score**: % of required skills found in your CV.\n\nTo improve: add email, phone, LinkedIn, and quantify your achievements.",
    ]),
    (r"\b(recruiter|recruteur|rh|hr dashboard|tableau de bord|ranked|classement)\b", [
        "Le tableau de bord RH (section **/rh**) permet aux recruteurs de :\n• Voir les candidats classés par score\n• Analyser automatiquement les CVs\n• Accepter/refuser les candidatures\n• Visualiser les statistiques par offre\n\nAccès réservé au rôle **Entreprise**.",
        "The RH dashboard (**/rh** section) lets recruiters:\n• View applicants ranked by match score\n• Auto-analyze CVs\n• Accept/reject applications\n• View per-job analytics\n\nAccess is restricted to the **Company** role.",
    ]),
    (r"\b(notifications?|bell|cloche|unread|non lu)\b", [
        "Les notifications apparaissent dans la cloche en haut de la page. Elles signalent les nouveaux messages, réponses à vos posts, et mises à jour de candidatures.",
        "Notifications appear in the bell icon at the top. They alert you to new messages, replies to your posts, and application status updates.",
    ]),
    (r"\b(post|publication|feed|fil|partager|share|like|comment)\b", [
        "Dans le **Feed**, publiez des textes et images, likez et commentez les posts de la communauté ESPRIT.",
        "In the **Feed**, post text and images, like and comment on posts from the ESPRIT community.",
    ]),
]


def rule_based_response(message: str) -> str:
    msg_lower = message.lower()
    french_words = ["bonjour", "salut", "merci", "aide", "emploi", "stage",
                    "ressource", "événement", "profil", "connexion", "inscription",
                    "offre", "candidature", "comment", "où", "est-ce", "puis-je"]
    is_french = any(w in msg_lower for w in french_words)
    for pattern, responses in RULES:
        if re.search(pattern, msg_lower, re.IGNORECASE):
            return responses[0] if is_french else responses[1]
    if is_french:
        return ("Je ne suis pas sûr de comprendre votre question. "
                "Je peux vous aider avec Jobs, Events, Messages, Resources et Mentoring. "
                "Tapez 'aide' pour voir toutes les options.")
    return ("I'm not sure I understood your question. "
            "I can help you with Jobs, Events, Messages, Resources, and Mentoring. "
            "Type 'help' to see all options.")


def build_messages(message: str, history: list, user_role: Optional[str]) -> list:
    system = SYSTEM_PROMPT
    if user_role:
        system += f"\n\nCurrent user role: {user_role}"
    msgs = [{"role": "system", "content": system}]
    for h in (history or [])[-8:]:
        msgs.append({"role": h.role, "content": h.content})
    msgs.append({"role": "user", "content": message})
    return msgs


async def openai_chat(message: str, history: list, user_role: Optional[str]) -> str:
    msgs = build_messages(message, history, user_role)
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            OPENAI_URL,
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"},
            json={"model": OPENAI_MODEL, "messages": msgs, "max_tokens": 600, "temperature": 0.7},
        )
        if resp.status_code != 200:
            raise Exception(f"OpenAI API error {resp.status_code}: {resp.text}")
        return resp.json()["choices"][0]["message"]["content"]


async def groq_chat(message: str, history: list, user_role: Optional[str]) -> str:
    msgs = build_messages(message, history, user_role)
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
            json={"model": GROQ_MODEL, "messages": msgs, "max_tokens": 512, "temperature": 0.7},
        )
        if resp.status_code != 200:
            raise Exception(f"Groq API error {resp.status_code}: {resp.text}")
        return resp.json()["choices"][0]["message"]["content"]


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[list[ChatMessage]] = []
    user_role: Optional[str] = None


@app.post("/chat")
async def chat(req: ChatRequest, request: Request):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    client_ip = request.client.host if request.client else "unknown"
    check_rate_limit(client_ip)

    history = req.history or []
    engine_used = "rule-based"

    # Priority 1: OpenAI
    if OPENAI_API_KEY:
        try:
            response = await openai_chat(req.message, history, req.user_role)
            engine_used = "openai"
            logger.info("chat engine=openai ip=%s role=%s", client_ip, req.user_role)
            return {"response": response, "engine": engine_used}
        except Exception as exc:
            logger.warning("OpenAI failed, falling back: %s", exc)

    # Priority 2: Groq
    if GROQ_API_KEY:
        try:
            response = await groq_chat(req.message, history, req.user_role)
            engine_used = "groq"
            logger.info("chat engine=groq ip=%s role=%s", client_ip, req.user_role)
            return {"response": response, "engine": engine_used}
        except Exception as exc:
            logger.warning("Groq failed, falling back: %s", exc)

    # Priority 3: Rule-based
    response = rule_based_response(req.message)
    logger.info("chat engine=rule-based ip=%s role=%s", client_ip, req.user_role)
    return {"response": response, "engine": "rule-based"}


@app.get("/health")
def health():
    engine = "openai" if OPENAI_API_KEY else ("groq" if GROQ_API_KEY else "rule-based")
    return {"status": "ok", "service": "chatbot", "engine": engine}
