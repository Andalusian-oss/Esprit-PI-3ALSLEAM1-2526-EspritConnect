-- ============================================================
-- EspritConnect — Job Service Seed Data
-- Companies: 22=Acme Corp, 23=TechVision, 24=DataMinds
--            37=NovaSoft, 38=FinTech Lab, 39=MedTech, 40=GreenByte
-- ============================================================

-- ── JOBS ──
INSERT IGNORE INTO jobs (id, titre, entreprise, description, type, lieu, poster_user_id) VALUES
(1,  'Developpeur Full Stack',          'Acme Corp SA',       'React 18 + Spring Boot 3. Stack : React, TypeScript, Java 17, PostgreSQL, Docker. 3 ans exp ou recent diplome avec portfolio.', 'CDI',   'Tunis Centre',       22),
(2,  'Stage Developpeur Frontend React','Acme Corp SA',       'Stage PFE 6 mois. Integration equipe produit pour developper composants React/Material UI. Connaissance REST API requise.',       'STAGE', 'Tunis Centre',       22),
(3,  'Ingenieur DevOps',                'TechVision SARL',    'Mise en place pipelines CI/CD GitLab. Gestion clusters Kubernetes on-premise et cloud AWS. Automatisation Ansible/Terraform.',   'CDD',   'Les Berges du Lac II',23),
(4,  'Developpeur React Native',        'TechVision SARL',    'App mobile cross-platform iOS/Android. React Native + Expo + TypeScript. Experience Agile requise.',                              'CDI',   'Ariana',             23),
(5,  'Data Scientist',                  'DataMinds Tunisia',  'Modelisation predictive, NLP, Computer Vision. Python (scikit-learn, PyTorch), SQL, Spark. Master ou diplome ingenieur.',          'CDI',   'Tunis',              24),
(6,  'Stage Data Analyst & BI',         'DataMinds Tunisia',  'Stage PFE 3-6 mois. Analyse de donnees clients, dashboards Power BI/Metabase. SQL avance, Python pandas.',                       'STAGE', 'Ariana',             24),
(7,  'Backend Engineer Spring Boot',    'NovaSoft Tunisia',   'Build secure microservices for a SaaS product. Stack: Java 17, Spring Boot, MariaDB, Redis, Docker.',                             'CDI',   'Tunis Hybrid',       37),
(8,  'Stage QA Automation',             'NovaSoft Tunisia',   'PFE internship: Playwright, Cypress, REST API testing and CI quality gates. Good JavaScript basics required.',                    'STAGE', 'Tunis',              37),
(9,  'Business Intelligence Consultant','FinTech Lab',        'Design executive dashboards for banking operations. Power BI, SQL, Python and data storytelling required.',                       'CDD',   'Lac II',             38),
(10, 'Mobile Flutter Intern',           'MedTech Solutions',  'Internship on a patient follow-up mobile app. Flutter, Firebase basics and strong UI attention expected.',                        'STAGE', 'Sousse Remote',      39),
(11, 'IoT Data Engineer',               'GreenByte Energy',   'Collect and process smart-meter telemetry. MQTT, Kafka, TimescaleDB and Python experience appreciated.',                          'CDI',   'Ariana',             40);

-- ── APPLICATIONS (with match_score) ──
INSERT IGNORE INTO applications (id, job_id, applicant_user_id, statut, match_score) VALUES
-- Job 1: Developpeur Full Stack (CDI)
(1,  1, 15, 'PENDING',  71),
(2,  1, 17, 'ACCEPTED', 88),
(3,  1, 19, 'PENDING',  76),
(4,  1, 21, 'REJECTED', 55),
-- Job 2: Stage Frontend React (STAGE)
(5,  2,  7, 'ACCEPTED', 92),
(6,  2,  8, 'PENDING',  78),
(7,  2, 11, 'PENDING',  83),
(8,  2, 14, 'REJECTED', 60),
-- Job 3: Ingenieur DevOps (CDD)
(9,  3, 19, 'PENDING',  80),
(10, 3, 17, 'PENDING',  68),
-- Job 4: React Native (CDI)
(11, 4, 21, 'PENDING',  73),
(12, 4,  7, 'PENDING',  85),
-- Job 5: Data Scientist (CDI)
(13, 5, 20, 'ACCEPTED', 91),
(14, 5, 18, 'PENDING',  69),
-- Job 6: Stage BI (STAGE)
(15, 6,  8, 'ACCEPTED', 87),
(16, 6, 12, 'PENDING',  74),
(17, 6, 10, 'PENDING',  65),
-- Job 7: Backend Spring Boot (CDI)
(18, 7, 30, 'PENDING',  79),
(19, 7, 31, 'ACCEPTED', 94),
(20, 7, 34, 'PENDING',  70),
-- Job 8: QA Automation (STAGE)
(21, 8, 33, 'PENDING',  77),
(22, 8, 35, 'ACCEPTED', 89),
(23, 8, 36, 'PENDING',  62),
-- Job 9: BI Consultant (CDD)
(24, 9, 32, 'ACCEPTED', 86),
(25, 9, 35, 'PENDING',  72),
(26, 9, 18, 'PENDING',  67),
-- Job 10: Flutter Intern (STAGE)
(27,10, 34, 'PENDING',  75),
(28,10, 36, 'PENDING',  58),
-- Job 11: IoT Data Engineer (CDI)
(29,11, 30, 'ACCEPTED', 90),
(30,11, 33, 'PENDING',  66),
(31,11, 31, 'PENDING',  81);

-- ── MENTORINGS ──
INSERT IGNORE INTO mentorings (id, mentor_user_id, mentore_user_id, domaine, statut) VALUES
(1, 19,  7, 'Backend & Architecture',  'ACTIVE'),
(2, 17,  8, 'Frontend React',          'ACTIVE'),
(3, 21, 11, 'Full Stack & DevOps',     'ACTIVE'),
(4, 20, 15, 'Data Science & ML',       'COMPLETED'),
(5, 30, 34, 'Cloud & Docker',          'ACTIVE'),
(6, 31, 36, 'Mobile & Career',         'ACTIVE');

-- ── MENTORING SESSIONS ──
INSERT IGNORE INTO mentoring_sessions (id, mentoring_id, date, duree_minutes, statut) VALUES
(1,  1, '2026-05-07 18:00:00', 60,  'DONE'),
(2,  1, '2026-05-14 18:00:00', 60,  'PLANNED'),
(3,  2, '2026-05-08 17:00:00', 45,  'DONE'),
(4,  2, '2026-05-15 17:00:00', 45,  'PLANNED'),
(5,  3, '2026-05-06 20:00:00', 90,  'DONE'),
(6,  3, '2026-05-13 20:00:00', 90,  'DONE'),
(7,  3, '2026-05-20 20:00:00', 90,  'PLANNED'),
(8,  4, '2026-04-10 18:30:00', 60,  'DONE'),
(9,  4, '2026-04-24 18:30:00', 60,  'DONE'),
(10, 4, '2026-05-08 18:30:00', 60,  'DONE'),
(11, 5, '2026-05-09 19:00:00', 75,  'DONE'),
(12, 5, '2026-05-16 19:00:00', 75,  'PLANNED'),
(13, 6, '2026-05-11 16:00:00', 45,  'DONE'),
(14, 6, '2026-05-18 16:00:00', 45,  'PLANNED');
