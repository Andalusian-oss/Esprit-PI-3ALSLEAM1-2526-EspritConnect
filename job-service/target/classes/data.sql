-- ============================================================
-- EspritConnect — Job Service Seed Data
-- Companies: 22=Acme Corp, 23=TechVision, 24=DataMinds
-- ============================================================

-- ── JOBS ──
INSERT IGNORE INTO jobs (id, titre, entreprise, description, type, lieu, poster_user_id) VALUES
(1, 'Développeur Full Stack',
    'Acme Corp SA',
    'Développement d\'applications web et API REST avec React 18 et Spring Boot 3. 3 ans d\'expérience souhaités ou profil récent diplômé avec portfolio solide. Stack : React, TypeScript, Java 17, PostgreSQL, Docker.',
    'CDI', 'Tunis Centre', 22),
(2, 'Stage Développeur Frontend React',
    'Acme Corp SA',
    'Stage PFE 6 mois. Intégration dans l\'équipe produit pour développer des composants React / Material UI. Connaissance de base en REST API requise.',
    'STAGE', 'Tunis Centre', 22),
(3, 'Ingénieur DevOps',
    'TechVision SARL',
    'Mise en place et maintenance pipelines CI/CD GitLab. Gestion des clusters Kubernetes on-premise et cloud (AWS). Automatisation Ansible/Terraform.',
    'CDD', 'Les Berges du Lac II', 23),
(4, 'Développeur React Native',
    'TechVision SARL',
    'Développement d\'une application mobile cross-platform (iOS/Android) pour notre client banque. React Native + Expo + TypeScript. Expérience Agile requise.',
    'CDI', 'Ariana', 23),
(5, 'Data Scientist',
    'DataMinds Tunisia',
    'Modélisation prédictive, NLP, Computer Vision. Python (scikit-learn, PyTorch), SQL, Spark. Maîtrise de l\'anglais technique requise. Master ou diplôme ingénieur.',
    'CDI', 'Tunis', 24),
(6, 'Stage Data Analyst & BI',
    'DataMinds Tunisia',
    'Stage PFE ou été (3-6 mois). Analyse de données clients, dashboards Power BI / Metabase. SQL avancé, Python pandas. Bonne capacité de communication.',
    'STAGE', 'Ariana', 24);

-- ── APPLICATIONS ──
INSERT IGNORE INTO applications (id, job_id, applicant_user_id, statut) VALUES
-- Développeur Full Stack (CDI, job=1) : alumni et 4ème année
(1,  1, 15, 'PENDING'),   -- Sami (4DS2/DS)
(2,  1, 17, 'ACCEPTED'),  -- Mokhtar (alumni GL 2022)
(3,  1, 19, 'PENDING'),   -- Walid (alumni DS 2021)
(4,  1, 21, 'REJECTED'),  -- Tarek (alumni GL 2022)
-- Stage Frontend React (STAGE, job=2) : étudiants
(5,  2,  7, 'ACCEPTED'),  -- Amine (4DS1/GL)
(6,  2,  8, 'PENDING'),   -- Sara (4DS2/BI)
(7,  2, 11, 'PENDING'),   -- Karim (4DS1/Cloud)
(8,  2, 14, 'REJECTED'),  -- Amal (4DS3/SEMC)
-- Ingénieur DevOps (CDD, job=3) : alumni
(9,  3, 19, 'PENDING'),   -- Walid (alumni DS)
(10, 3, 17, 'PENDING'),   -- Mokhtar (alumni GL)
-- React Native (CDI, job=4) : alumni et 4ème année
(11, 4, 21, 'PENDING'),   -- Tarek (alumni GL)
(12, 4,  7, 'PENDING'),   -- Amine (4DS1/GL)
-- Data Scientist (CDI, job=5) : alumni
(13, 5, 20, 'ACCEPTED'),  -- Maryem (alumni BI 2023)
(14, 5, 18, 'PENDING'),   -- Olfa (alumni CF 2023)
-- Stage BI (STAGE, job=6) : étudiants
(15, 6,  8, 'ACCEPTED'),  -- Sara (4DS2/BI)
(16, 6, 12, 'PENDING'),   -- Rania (3DS2/BI)
(17, 6, 10, 'PENDING');   -- Inès (2DS3/DS)

-- Extra jobs for richer company dashboards
INSERT IGNORE INTO jobs (id, titre, entreprise, description, type, lieu, poster_user_id) VALUES
(7, 'Backend Engineer Spring Boot',
    'NovaSoft Tunisia',
    'Build secure microservices for a SaaS product used by schools and training centers. Stack: Java 17, Spring Boot, MariaDB, Redis, Docker.',
    'CDI', 'Tunis Hybrid', 37),
(8, 'Stage QA Automation',
    'NovaSoft Tunisia',
    'PFE internship around Playwright, Cypress, REST API testing and CI quality gates. Good JavaScript basics required.',
    'STAGE', 'Tunis', 37),
(9, 'Business Intelligence Consultant',
    'FinTech Lab',
    'Design executive dashboards for banking operations. Power BI, SQL, Python and data storytelling are required.',
    'CDD', 'Lac II', 38),
(10, 'Mobile Flutter Intern',
    'MedTech Solutions',
    'Internship on a patient follow-up mobile app. Flutter, Firebase basics and strong UI attention expected.',
    'STAGE', 'Sousse Remote', 39),
(11, 'IoT Data Engineer',
    'GreenByte Energy',
    'Collect and process smart-meter telemetry. MQTT, Kafka, TimescaleDB and Python experience appreciated.',
    'CDI', 'Ariana', 40);

INSERT IGNORE INTO applications (id, job_id, applicant_user_id, statut) VALUES
(18, 7, 30, 'PENDING'),
(19, 7, 31, 'ACCEPTED'),
(20, 7, 34, 'PENDING'),
(21, 8, 33, 'PENDING'),
(22, 8, 35, 'ACCEPTED'),
(23, 8, 36, 'PENDING'),
(24, 9, 32, 'ACCEPTED'),
(25, 9, 35, 'PENDING'),
(26, 9, 18, 'PENDING'),
(27, 10, 34, 'PENDING'),
(28, 10, 36, 'PENDING'),
(29, 11, 30, 'ACCEPTED'),
(30, 11, 33, 'PENDING'),
(31, 11, 31, 'PENDING');
