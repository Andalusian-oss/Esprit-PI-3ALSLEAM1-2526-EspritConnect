-- ============================================================
-- EspritConnect — Resource Service Seed Data
-- ResourceType: ARTICLE, PDF, VIDEO, LINK, TUTORIAL
-- ResourceCategory: ACADEMIC, CAREER, TECHNICAL, SOCIAL, EVENT
-- Uploaders: teachers(2-6), students(7-16), alumni(17-21)
-- ============================================================

-- ── RESOURCES ──
INSERT IGNORE INTO resources
  (id, titre, description, type, categorie, file_url, lien, tags, uploaded_by_user_id, like_count, download_count, created_at)
VALUES
(1,
 'Cours Complet Spring Boot 3 - Microservices',
 'PDF complet couvrant Spring Boot 3, Spring Cloud, Docker et les patterns microservices. Supporte le cours de GL4.',
 'PDF', 'TECHNICAL',
 '/uploads/spring-boot-3-microservices.pdf', NULL,
 'spring,java,microservices,docker',
 3, 34, 127, '2026-04-01 10:00:00'),

(2,
 'Guide Pratique : Preparer son Entretien Tech',
 'Guide etape par etape : algorithmes, structures de donnees, system design et soft skills. Recommande aux 4eme annee.',
 'PDF', 'CAREER',
 '/uploads/guide-entretien-tech.pdf', NULL,
 'entretien,carriere,algorithmes,tips',
 21, 62, 215, '2026-04-05 14:30:00'),

(3,
 'Introduction au Machine Learning avec Python',
 'Video tutoriel couvrant regression, classification et clustering avec scikit-learn. Exercices inclus.',
 'VIDEO', 'TECHNICAL',
 NULL, 'https://www.youtube.com/watch?v=ml-intro-python',
 'python,machine-learning,scikit-learn,ia',
 5, 41, 98, '2026-04-08 09:00:00'),

(4,
 'Methode Agile & Scrum pour les Projets PFE',
 'Article expliquant comment appliquer Scrum dans un projet de 4-6 mois avec un petit equipe etudiant.',
 'ARTICLE', 'ACADEMIC',
 NULL, 'https://espritconnect.tn/blog/agile-pfe',
 'agile,scrum,pfe,gestion-projet',
 2, 28, 0, '2026-04-10 11:00:00'),

(5,
 'Template CV Junior Developeur - Format LaTeX',
 'Template LaTeX propre et professionnel adapte aux jeunes diplomes IT. Sections : skills, projets, experience.',
 'PDF', 'CAREER',
 '/uploads/cv-template-junior.pdf', NULL,
 'cv,latex,carriere,template',
 31, 55, 189, '2026-04-12 16:00:00'),

(6,
 'Docker & Kubernetes : de Zero a Hero',
 'Tutoriel interactif en 8 chapitres : images, conteneurs, Docker Compose, orchestration K8s, Helm.',
 'TUTORIAL', 'TECHNICAL',
 NULL, 'https://docker-k8s.espritconnect.tn',
 'docker,kubernetes,devops,conteneurs',
 19, 48, 163, '2026-04-15 13:00:00'),

(7,
 'Recap Journee Portes Ouvertes Entreprises - Mai 2026',
 'Compte rendu et slides des interventions des entreprises partenaires lors de la JPO du 10 mai 2026.',
 'PDF', 'EVENT',
 '/uploads/jpo-entreprises-mai2026.pdf', NULL,
 'evenement,entreprises,recrutement,jpo',
 28, 19, 74, '2026-05-11 12:00:00'),

(8,
 'Checklist Securite API REST - OWASP Top 10',
 'Article technique detaillant les 10 vulnerabilites critiques des API REST et comment les corriger avec Spring Security.',
 'ARTICLE', 'TECHNICAL',
 NULL, 'https://espritconnect.tn/blog/owasp-api',
 'securite,owasp,spring-security,api',
 25, 37, 0, '2026-05-01 10:30:00'),

(9,
 'Data Viz : construire un dashboard Power BI de A a Z',
 'Tutoriel complet avec dataset reel : connexion SQL, transformation, visualisation et publication.',
 'TUTORIAL', 'TECHNICAL',
 NULL, 'https://powerbi-tutorial.espritconnect.tn',
 'powerbi,bi,data,visualisation',
 26, 31, 0, '2026-05-03 14:00:00'),

(10,
 'Les Clubs Etudiants ESPRIT - Guide des Activites',
 'Presentation de tous les clubs actifs a ESPRIT : missions, contacts et comment rejoindre.',
 'ARTICLE', 'SOCIAL',
 NULL, 'https://espritconnect.tn/clubs',
 'clubs,social,vie-etudiante,esprit',
 27, 22, 0, '2026-04-20 09:00:00'),

(11,
 'React 18 Hooks Avances - useCallback, useMemo, useTransition',
 'Video workshop de 90 min expliquant les hooks avances React 18 avec cas pratiques sur une vraie app.',
 'VIDEO', 'TECHNICAL',
 NULL, 'https://www.youtube.com/watch?v=react18-hooks-advanced',
 'react,hooks,frontend,javascript',
 17, 39, 0, '2026-04-25 17:00:00'),

(12,
 'Modele Rapport PFE ESPRIT - Word et LaTeX',
 'Templates officiels du rapport PFE ESPRIT avec styles, en-tetes et exemples de sections remplis.',
 'PDF', 'ACADEMIC',
 '/uploads/modele-rapport-pfe-esprit.pdf', NULL,
 'pfe,rapport,template,academique',
 4, 71, 342, '2026-03-15 08:00:00'),

(13,
 'Temoignages Alumni : Du PFE au Premier Emploi',
 'Serie d articles avec 5 alumni ESPRIT qui partagent leur parcours : recherche, entretiens et onboarding.',
 'ARTICLE', 'CAREER',
 NULL, 'https://espritconnect.tn/blog/alumni-parcours',
 'alumni,carriere,temoignage,emploi',
 20, 44, 0, '2026-04-18 11:00:00'),

(14,
 'Git & GitHub Avance : rebase, cherry-pick, CI/CD',
 'Tutoriel intermediaire-avance sur les commandes Git les plus utiles en equipe et les workflows GitHub Actions.',
 'TUTORIAL', 'TECHNICAL',
 NULL, 'https://git-advanced.espritconnect.tn',
 'git,github,ci-cd,devops',
 11, 29, 0, '2026-05-05 15:00:00'),

(15,
 'Feuille de Route Certification AWS pour Etudiants',
 'Lien vers le plan de certification AWS Cloud Practitioner + Solutions Architect avec ressources gratuites.',
 'LINK', 'CAREER',
 NULL, 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/',
 'aws,cloud,certification,carriere',
 14, 33, 0, '2026-05-06 21:30:00');

-- ── RESOURCE LIKES ──
INSERT IGNORE INTO resource_likes (id, resource_id, user_id) VALUES
-- Resource 1 (Spring Boot PDF)
(1,1,7),(2,1,8),(3,1,9),(4,1,10),(5,1,11),(6,1,12),(7,1,13),(8,1,14),
(9,1,15),(10,1,16),(11,1,33),(12,1,34),(13,1,35),(14,1,36),
-- Resource 2 (Entretien guide)
(15,2,7),(16,2,8),(17,2,9),(18,2,10),(19,2,11),(20,2,12),(21,2,13),(22,2,14),
(23,2,15),(24,2,16),(25,2,17),(26,2,18),(27,2,19),(28,2,20),(29,2,21),
(30,2,30),(31,2,31),(32,2,32),(33,2,33),(34,2,34),(35,2,35),(36,2,36),
-- Resource 3 (ML video)
(37,3,7),(38,3,9),(39,3,10),(40,3,12),(41,3,14),(42,3,15),(43,3,20),
(44,3,26),(45,3,33),(46,3,35),
-- Resource 4 (Agile article)
(47,4,7),(48,4,8),(49,4,9),(50,4,10),(51,4,14),(52,4,15),(53,4,16),
-- Resource 5 (CV template)
(54,5,7),(55,5,8),(56,5,9),(57,5,10),(58,5,11),(59,5,13),(60,5,14),
(61,5,15),(62,5,16),(63,5,33),(64,5,34),(65,5,35),(66,5,36),
-- Resource 6 (Docker tutorial)
(67,6,7),(68,6,9),(69,6,11),(70,6,14),(71,6,15),(72,6,33),(73,6,34),
-- Resource 7 (JPO recap)
(74,7,7),(75,7,8),(76,7,10),(77,7,12),(78,7,14),(79,7,22),(80,7,23),
-- Resource 8 (OWASP)
(81,8,7),(82,8,11),(83,8,14),(84,8,15),(85,8,30),(86,8,33),(87,8,34),
-- Resource 9 (Power BI)
(88,9,12),(89,9,20),(90,9,26),(91,9,35),
-- Resource 12 (PFE template) -- most liked
(92,12,7),(93,12,8),(94,12,9),(95,12,10),(96,12,11),(97,12,12),
(98,12,13),(99,12,14),(100,12,15),(101,12,16),(102,12,33),(103,12,34),
-- Resource 13 (alumni articles)
(104,13,7),(105,13,8),(106,13,9),(107,13,10),(108,13,11),(109,13,12),
-- Resource 14 (Git advanced)
(110,14,9),(111,14,11),(112,14,14),(113,14,15),(114,14,34),
-- Resource 15 (AWS link)
(115,15,9),(116,15,10),(117,15,12),(118,15,14),(119,15,15),(120,15,36);
