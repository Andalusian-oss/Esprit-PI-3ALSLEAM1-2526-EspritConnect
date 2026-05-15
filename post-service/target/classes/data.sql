-- ============================================================
-- EspritConnect — Post Service Seed Data
-- User IDs mirror auth-service:
--   1=admin, 2-6=enseignants, 7-16=étudiants, 17-21=alumni, 22-24=entreprises
-- ============================================================

-- ── POSTS ──
INSERT IGNORE INTO posts (id, contenu, user_id, created_at) VALUES
(1,  'Vient de passer ma soutenance PFE avec mention ✓ — merci à tous pour le soutien ! Prochain objectif : trouver un CDI en data science à Tunis.',                                                             15, '2026-05-14 09:42:00'),
(2,  'Rappel : le TP de cryptographie est reporté au jeudi 16 mai. Groupes pairs le matin (08h30), groupes impairs l\'après-midi (14h00). Support disponible sur Moodle.',                                      2,  '2026-05-14 08:15:00'),
(3,  'Notre startup vient d\'être sélectionnée pour l\'incubateur Flat6Labs Tunisia 🚀 Recrutement ouvert : 2 dev React/Node.js, 1 designer UX. Envoyez votre CV à jobs@mokhtar-labs.tn',                       17, '2026-05-13 17:30:00'),
(4,  'Quelqu\'un cherche à former un groupe de révision pour les examens du semestre ? Je propose un créneau le samedi matin à la bibliothèque. DM si intéressé(e).',                                           7,  '2026-05-13 14:22:00'),
(5,  'Nouveau papier publié : « Intrusion Detection in IoT Networks using Graph Neural Networks ». Lien dans les commentaires. Retours bienvenus !',                                                             3,  '2026-05-12 11:00:00'),
(6,  'Acme Corp SA recrute ! 2 stages développement full-stack (React + Spring Boot) pour Juillet-Décembre 2026. Lettre de motivation + CV à hr@acmecorp.tn',                                                   22, '2026-05-12 09:00:00'),
(7,  'Disponible pour du mentoring tech : architecture microservices, Docker/K8s, préparation entretiens. 3 créneaux disponibles par semaine. Étudiants ESPRIT en priorité.',                                    19, '2026-05-11 16:45:00'),
(8,  'Notre projet de fin d\'études (recommandation de jobs par NLP) a remporté le prix du jury lors de la journée PFE ! Très fier de toute l\'équipe 💪',                                                      8,  '2026-05-11 10:30:00'),
(9,  'Séance de TP Analyse numérique annulée demain mercredi. Reportée à la semaine prochaine. Les devoirs rendus avant vendredi seront bien pris en compte.',                                                   4,  '2026-05-10 20:00:00'),
(10, 'Question : vous utilisez quoi comme librairie pour les graphes en React ? Recharts, Chart.js ou Nivo ? On hésite pour notre projet d\'intégration.',                                                       9,  '2026-05-10 15:10:00'),
(11, 'Conseil à tous les 4ème année : préparez votre profil LinkedIn AVANT la soutenance. Les recruteurs vont vous chercher le jour même. Expérience personnelle 👀',                                           21, '2026-05-09 12:00:00'),
(12, 'TechVision SARL organise une journée portes ouvertes dans ses locaux le 22 mai. Venez découvrir nos équipes et projets tech. Inscription sur notre site.',                                                 23, '2026-05-09 09:30:00'),
(13, 'On cherche 2 personnes supplémentaires pour notre équipe au Hackathon IA ESPRIT (7-8 juin). Profil souhaité : Python/ML ou backend Spring. DM rapidement !',                                              11, '2026-05-08 18:20:00'),
(14, 'Bienvenue à tous les étudiants de 1ère année en GL ! Le premier cours de Structures de Données aura lieu vendredi à 10h00, Amphi C. Apportez votre laptop.',                                             5,  '2026-05-07 08:00:00'),
(15, 'Certifiée AWS Cloud Practitioner après 3 mois de préparation ! Le guide que j\'ai utilisé est gratuit sur le site d\'AWS. N\'hésitez pas à me demander des conseils.', 14, '2026-05-06 21:00:00');

-- ── COMMENTS ──
INSERT IGNORE INTO comments (id, post_id, user_id, texte, created_at) VALUES
(1,  1, 7,  'Félicitations Sami ! Tu mérites vraiment cette mention. Bonne chance pour la suite !',                   '2026-05-14 09:55:00'),
(2,  1, 8,  'Bravo ! La data science à Tunis ça bouge beaucoup en ce moment, tu vas trouver vite.',                    '2026-05-14 10:02:00'),
(3,  1, 2,  'Excellent travail tout au long de l\'année. Tu as été un étudiant sérieux et rigoureux.',                 '2026-05-14 10:15:00'),
(4,  1, 19, 'Félicitations ! Si tu cherches dans la data, envois moi ton CV, j\'ai des contacts chez quelques boîtes.', '2026-05-14 10:30:00'),
(5,  3, 7,  'Super nouvelle ! Vous cherchez des alternants ou seulement des temps-pleins ?',                             '2026-05-13 18:00:00'),
(6,  3, 11, 'Impressionnant ! C\'est quoi votre domaine exactement ?',                                                 '2026-05-13 18:30:00'),
(7,  4, 8,  'Je suis partante pour le samedi matin ! On se retrouve à quelle heure à la biblio ?',                      '2026-05-13 14:45:00'),
(8,  4, 12, 'Je rejoins aussi si la place est dispo.',                                                                   '2026-05-13 15:00:00'),
(9,  5, 7,  'Super intéressant ! Vous avez testé sur quel dataset IoT ?',                                               '2026-05-12 11:30:00'),
(10, 5, 3,  'Merci ! On a utilisé UNSW-NB15 et un dataset maison. Je partage le lien du papier ici : arxiv.org/abs/2026.00042', '2026-05-12 11:45:00'),
(11, 8, 15, 'Bravo Sara et toute l\'équipe ! C\'était vraiment un super projet.',                                      '2026-05-11 11:00:00'),
(12, 8, 2,  'Projet très bien ficelé. Le jury a beaucoup apprécié la démo en temps réel.',                             '2026-05-11 11:30:00'),
(13, 10, 11,'Nivo c\'est le mieux pour les graphes complexes, mais Recharts suffit pour des dashboards simples.',        '2026-05-10 15:30:00'),
(14, 10, 20,'D\'expérience pro : Chart.js pour la perf, Recharts pour la facilité d\'intégration avec React.',          '2026-05-10 16:00:00'),
(15, 13, 8, 'Je cherche aussi une équipe, je maîtrise Python/scikit-learn.',                                            '2026-05-08 18:45:00'),
(16, 13, 14,'Je peux rejoindre, je fais du Spring Boot depuis 2 ans.',                                                  '2026-05-08 19:00:00'),
(17, 15, 10,'Super ! Merci pour le partage. Tu as passé la certification en quelle langue ? Anglais ou Français ?',       '2026-05-06 21:30:00'),
(18, 15, 12,'Je vise cette certif pour l\'été, je t\'envoie un DM !',                                                   '2026-05-06 22:00:00');

-- ── LIKES ──
INSERT IGNORE INTO likes (id, post_id, user_id) VALUES
(1,  1,  7), (2,  1,  8),  (3,  1,  9),  (4,  1, 10), (5,  1, 11),
(6,  1, 12), (7,  1, 14), (8,  1, 16), (9,  1, 17), (10, 1, 19),
(11, 1, 20), (12, 1, 21), (13, 1,  2),
(14, 2,  7), (15, 2, 10), (16, 2, 12), (17, 2, 16),
(18, 3,  7), (19, 3,  8), (20, 3, 11), (21, 3, 14), (22, 3, 15),
(23, 3, 20), (24, 3, 21), (25, 3, 10), (26, 3,  9), (27, 3, 19),
(28, 4,  8), (29, 4,  9), (30, 4, 12), (31, 4, 13),
(32, 5,  7), (33, 5,  9), (34, 5, 11), (35, 5, 17), (36, 5, 19),
(37, 6, 15), (38, 6,  9), (39, 6, 10), (40, 6, 12),
(41, 7, 10), (42, 7, 13), (43, 7, 16),
(44, 8, 15), (45, 8,  7), (46, 8,  9), (47, 8, 11), (48, 8,  2),
(49, 9,  7), (50, 9, 10),
(51,10,  7), (52,10, 11), (53,10, 14), (54,10, 16), (55,10, 20),
(56,11,  7), (57,11,  8), (58,11,  9), (59,11, 10), (60,11, 13), (61,11, 14),
(62,12, 11), (63,12, 14), (64,12, 15),
(65,13,  8), (66,13, 14), (67,13, 12),
(68,14, 13), (69,14, 16),
(70,15,  9), (71,15, 10), (72,15, 11), (73,15, 12), (74,15, 16);

-- Extra posts, comments and likes to make dashboards denser
INSERT IGNORE INTO posts (id, contenu, user_id, created_at) VALUES
(16, 'Le Career Center ouvre 40 creneaux de simulation entretien cette semaine. Les 4eme annee et alumni en recherche active sont prioritaires.', 28, '2026-05-14 11:00:00'),
(17, 'Retour terrain: pour un premier poste backend, montrez un projet deploye, des tests et une vraie documentation API. Le code seul ne suffit plus.', 30, '2026-05-14 10:25:00'),
(18, 'FinTech Lab lance un challenge BI: construire un dashboard risque credit avec SQL et Power BI. Les meilleurs profils seront invites en entretien.', 38, '2026-05-13 16:00:00'),
(19, 'Workshop cybersecurite vendredi: threat modeling, OWASP Top 10 et revue de code securise sur Spring Security.', 25, '2026-05-13 13:30:00'),
(20, 'Besoin de volontaires pour accueillir les entreprises pendant la journee portes ouvertes. Inscription aupres du service scolarite.', 27, '2026-05-12 15:15:00'),
(21, 'Je partage mon template CV junior: une page, projets mesurables, liens GitHub propres et mots-cles adaptes a l offre.', 31, '2026-05-12 12:45:00'),
(22, 'Notre equipe cherche encore un profil QA automation pour le PFE. Playwright ou Cypress apprecie, curiosite obligatoire.', 37, '2026-05-11 09:20:00'),
(23, 'Data storytelling: un dashboard utile commence par 3 questions metier, pas par le choix des couleurs.', 26, '2026-05-10 17:10:00');

INSERT IGNORE INTO comments (id, post_id, user_id, texte, created_at) VALUES
(19, 16, 33, 'Je veux reserver un creneau pour un entretien backend.', '2026-05-14 11:20:00'),
(20, 16, 30, 'Bonne initiative. Je peux aider sur deux simulations alumni.', '2026-05-14 11:35:00'),
(21, 17, 34, 'Merci pour le conseil, je vais ajouter une collection Postman a mon projet.', '2026-05-14 10:40:00'),
(22, 18, 35, 'Est-ce que les etudiants de 2eme annee peuvent participer ?', '2026-05-13 16:25:00'),
(23, 19, 7, 'Je serai present. Est-ce qu il faut installer Burp avant ?', '2026-05-13 14:00:00'),
(24, 20, 29, 'Je transmets aussi aux partenaires entreprises.', '2026-05-12 15:40:00'),
(25, 21, 8, 'Tres utile, merci Rim.', '2026-05-12 13:10:00'),
(26, 22, 36, 'Je peux candidater meme sans experience Cypress avancee ?', '2026-05-11 09:45:00'),
(27, 23, 12, 'Phrase a retenir pour notre projet BI.', '2026-05-10 17:30:00');

INSERT IGNORE INTO likes (id, post_id, user_id) VALUES
(75,16,7), (76,16,8), (77,16,33), (78,16,34), (79,16,30),
(80,17,7), (81,17,11), (82,17,14), (83,17,33), (84,17,35),
(85,18,8), (86,18,12), (87,18,20), (88,18,32), (89,18,35),
(90,19,7), (91,19,9), (92,19,30), (93,19,33), (94,19,34),
(95,20,13), (96,20,16), (97,20,27), (98,20,28), (99,20,29),
(100,21,8), (101,21,10), (102,21,15), (103,21,33), (104,21,36),
(105,22,14), (106,22,34), (107,22,36), (108,22,31),
(109,23,12), (110,23,18), (111,23,20), (112,23,32);
