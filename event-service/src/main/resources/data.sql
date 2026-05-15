-- ============================================================
-- EspritConnect — Event Service Seed Data
-- ============================================================

-- ── CLUBS ──
INSERT IGNORE INTO clubs (id, nom, description, logo_url, creator_user_id) VALUES
(1, 'Club Intelligence Artificielle',
    'Ateliers ML/DL hebdomadaires, compétitions Kaggle, veille technologique IA.',
    NULL, 7),
(2, 'Club Robotique ESPRIT',
    'Conception et programmation de robots, participation aux compétitions nationales et internationales.',
    NULL, 9),
(3, 'Club Dev Web & Mobile',
    'React, Angular, Flutter, Spring Boot — projets open-source et hackathons.',
    NULL, 11),
(4, 'Club Sport & Bien-être',
    'Football, basketball, running, yoga — tournois inter-filières et bien-être étudiant.',
    NULL, 15);

-- ── EVENTS ──
INSERT IGNORE INTO events (id, titre, description, date, lieu, club_id, creator_user_id) VALUES
(1, 'Hackathon IA ESPRIT 2026',
    '48h de code autour de défis IA/ML. 3 tracks : Computer Vision, NLP, Data Analytics. Prix total : 5 000 DT. Équipes de 3 à 5 personnes.',
    '2026-06-07 08:00:00', 'Amphithéâtre A', 1, 7),
(2, 'Workshop TensorFlow & Keras',
    'Session pratique : construire et entraîner un réseau de neurones pour la classification d\'images. Ordinateur portable requis.',
    '2026-05-21 14:00:00', 'Salle informatique B14', 1, 2),
(3, 'Compétition Robotique Nationale',
    'Participation de l\'équipe ESPRIT à la compétition nationale. Présentation des robots construits par les étudiants.',
    '2026-06-15 09:00:00', 'Centre des Congrès de Tunis', 2, 9),
(4, 'Workshop React Native & Expo',
    'Créez votre première app mobile cross-platform en React Native. Déploiement sur Android et iOS en une journée.',
    '2026-05-24 09:00:00', 'Salle B12', 3, 11),
(5, 'Journée Portes Ouvertes ESPRIT 2026',
    'Présentation des filières, démonstrations de projets étudiants, rencontres avec les enseignants et les entreprises partenaires.',
    '2026-05-23 10:00:00', 'Campus Principal ESPRIT', NULL, 1),
(6, 'Tournoi de Football Inter-filières',
    'Tournoi annuel entre les promos GL, BI, DS, Cloud et SEMC. Phase de groupes puis élimination directe.',
    '2026-06-01 08:00:00', 'Terrain de sport ESPRIT', 4, 15);

-- ── CLUB MEMBERSHIPS ──
INSERT IGNORE INTO club_memberships (id, user_id, club_id, role) VALUES
-- Club IA (id=1)
(1,   7, 1, 'ADMIN'),  (2,  8, 1, 'MEMBER'), (3,  9, 1, 'MEMBER'),
(4,  10, 1, 'MEMBER'), (5, 11, 1, 'MEMBER'), (6, 12, 1, 'MEMBER'),
(7,  14, 1, 'MEMBER'), (8, 15, 1, 'MEMBER'), (9, 19, 1, 'MEMBER'),
-- Club Robotique (id=2)
(10,  9, 2, 'ADMIN'),  (11, 7, 2, 'MEMBER'), (12, 10, 2, 'MEMBER'),
(13, 13, 2, 'MEMBER'), (14, 16, 2, 'MEMBER'),
-- Club Dev Web (id=3)
(15, 11, 3, 'ADMIN'),  (16,  7, 3, 'MEMBER'), (17,  8, 3, 'MEMBER'),
(18, 12, 3, 'MEMBER'), (19, 14, 3, 'MEMBER'), (20, 15, 3, 'MEMBER'),
(21, 17, 3, 'MEMBER'), (22, 20, 3, 'MEMBER'),
-- Club Sport (id=4)
(23, 15, 4, 'ADMIN'),  (24,  7, 4, 'MEMBER'), (25,  9, 4, 'MEMBER'),
(26, 11, 4, 'MEMBER'), (27, 13, 4, 'MEMBER'), (28, 16, 4, 'MEMBER');

-- ── EVENT REGISTRATIONS ──
INSERT IGNORE INTO event_registrations (id, user_id, event_id) VALUES
-- Hackathon IA
(1,  7, 1), (2,  8, 1), (3,  9, 1), (4, 10, 1), (5, 11, 1),
(6, 12, 1), (7, 14, 1), (8, 15, 1), (9, 17, 1), (10, 19, 1),
-- Workshop TensorFlow
(11,  7, 2), (12,  8, 2), (13, 10, 2), (14, 12, 2), (15, 14, 2), (16, 16, 2),
-- Compétition Robotique
(17, 9, 3), (18, 7, 3), (19, 10, 3), (20, 13, 3),
-- Workshop React Native
(21, 11, 4), (22,  7, 4), (23,  8, 4), (24, 12, 4), (25, 14, 4), (26, 15, 4),
-- Journée Portes Ouvertes
(27,  7, 5), (28,  8, 5), (29,  9, 5), (30, 10, 5), (31, 11, 5),
(32, 12, 5), (33, 13, 5), (34, 14, 5), (35, 15, 5), (36, 16, 5),
(37, 17, 5), (38, 18, 5), (39, 19, 5), (40, 20, 5), (41, 21, 5),
-- Tournoi Football
(42, 15, 6), (43,  7, 6), (44,  9, 6), (45, 11, 6), (46, 13, 6), (47, 16, 6);

-- Extra clubs and events for complete dashboards
INSERT IGNORE INTO clubs (id, nom, description, logo_url, creator_user_id) VALUES
(5, 'Club CyberSec ESPRIT', 'CTF, securite applicative, sensibilisation et ateliers defense.', NULL, 25),
(6, 'Club Data & BI', 'Dashboards, SQL, data storytelling et projets analytiques avec entreprises.', NULL, 26),
(7, 'Club Career Builders', 'CV, entretiens, soft skills, alumni talks et preparation recrutement.', NULL, 28);

INSERT IGNORE INTO events (id, titre, description, date, lieu, club_id, creator_user_id) VALUES
(7, 'CTF Web Security Night',
    'Soiree capture the flag autour des failles OWASP, avec challenges debutants et avances.',
    '2026-05-28 18:00:00', 'Lab Cyber A21', 5, 25),
(8, 'Power BI Executive Dashboard Sprint',
    'Atelier pratique pour construire un dashboard direction en 3 heures a partir d un dataset ventes.',
    '2026-06-04 14:00:00', 'Salle Data B22', 6, 26),
(9, 'Alumni Talk: From ESPRIT to Cloud Architect',
    'Sofiene Lahmar partage son parcours cloud, les certifications utiles et les erreurs a eviter.',
    '2026-06-10 17:00:00', 'Amphi C', 7, 30),
(10, 'Forum Entreprises Juin 2026',
    'Rencontres recruteurs, stands entreprises, depot CV et entretiens courts avec le Career Center.',
    '2026-06-18 09:00:00', 'Campus Principal ESPRIT', NULL, 29);

INSERT IGNORE INTO club_memberships (id, user_id, club_id, role) VALUES
(29, 25, 5, 'ADMIN'), (30, 7, 5, 'MEMBER'), (31, 9, 5, 'MEMBER'), (32, 30, 5, 'MEMBER'), (33, 33, 5, 'MEMBER'), (34, 34, 5, 'MEMBER'),
(35, 26, 6, 'ADMIN'), (36, 8, 6, 'MEMBER'), (37, 12, 6, 'MEMBER'), (38, 20, 6, 'MEMBER'), (39, 32, 6, 'MEMBER'), (40, 35, 6, 'MEMBER'),
(41, 28, 7, 'ADMIN'), (42, 17, 7, 'MEMBER'), (43, 21, 7, 'MEMBER'), (44, 30, 7, 'MEMBER'), (45, 31, 7, 'MEMBER'), (46, 33, 7, 'MEMBER');

INSERT IGNORE INTO event_registrations (id, user_id, event_id) VALUES
(48, 7, 7), (49, 9, 7), (50, 25, 7), (51, 30, 7), (52, 33, 7), (53, 34, 7),
(54, 8, 8), (55, 12, 8), (56, 20, 8), (57, 26, 8), (58, 32, 8), (59, 35, 8),
(60, 7, 9), (61, 11, 9), (62, 28, 9), (63, 30, 9), (64, 31, 9), (65, 34, 9),
(66, 7, 10), (67, 8, 10), (68, 11, 10), (69, 15, 10), (70, 17, 10), (71, 18, 10),
(72, 19, 10), (73, 20, 10), (74, 21, 10), (75, 28, 10), (76, 29, 10), (77, 30, 10),
(78, 31, 10), (79, 32, 10), (80, 33, 10), (81, 34, 10), (82, 35, 10), (83, 36, 10),
(84, 37, 10), (85, 38, 10);
