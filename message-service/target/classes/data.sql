-- ============================================================
-- EspritConnect — Message Service Seed Data
-- Conversations are between two users (participant1 < participant2
-- is not enforced but good practice).
-- ============================================================

-- ── CONVERSATIONS ──────────────────────────────────────────
INSERT IGNORE INTO conversations (id, participant1_user_id, participant2_user_id) VALUES
(1,  2,  7),   -- Nadia (enseignant) <-> Amine (étudiant)
(2,  7, 19),   -- Amine (étudiant)   <-> Walid (alumni/mentor)
(3, 15, 22),   -- Sami (étudiant)    <-> Acme Corp (company)
(4,  1,  2),   -- Admin              <-> Nadia (enseignant)
(5,  7,  8),   -- Amine              <-> Sara (groupe révision)
(6, 17, 23);   -- Mokhtar (alumni)   <-> TechVision (company/entretien)

-- ── MESSAGES ───────────────────────────────────────────────
INSERT IGNORE INTO messages (id, conversation_id, sender_user_id, contenu, lu, created_at) VALUES

-- Conv 1 : Nadia <-> Amine (TP cryptographie)
(1,  1, 2,  'Bonjour Amine, vous avez bien rendu le TP hier avant la deadline ?',                        TRUE,  '2026-05-14 09:14:00'),
(2,  1, 7,  'Oui Madame, je l''ai soumis via Moodle à 22h précises.',                                   TRUE,  '2026-05-14 09:18:00'),
(3,  1, 2,  'Parfait. Je corrige ce soir. Le cours de jeudi est maintenu, salle B12.',                   TRUE,  '2026-05-14 09:20:00'),
(4,  1, 7,  'Merci beaucoup Madame. Bonne correction !',                                                 TRUE,  '2026-05-14 09:22:00'),
(5,  1, 7,  'J''avais aussi une question sur la partie DH : est-ce que l''implémentation en Python convient ou faut-il du Java ?', FALSE, '2026-05-14 10:45:00'),

-- Conv 2 : Amine <-> Walid (mentoring)
(6,  2, 7,  'Bonjour Walid, je me permets de vous contacter suite à votre post sur le mentoring. Je cherche des conseils pour préparer des entretiens techniques.',  TRUE,  '2026-05-11 17:00:00'),
(7,  2, 19, 'Bonjour Amine ! Bien sûr, c''est exactement pour ça que j''ai posté. Tu cibles quoi comme type de poste ? Frontend, backend ou full stack ?',            TRUE,  '2026-05-11 17:30:00'),
(8,  2, 7,  'Full stack de préférence, Spring Boot + React. J''ai un projet sur GitHub mais je manque de pratique LeetCode.',                                         TRUE,  '2026-05-11 18:00:00'),
(9,  2, 19, 'Good call. Pour les entretiens tech à Tunis, la plupart testent plus l''architecture et les design patterns que le LeetCode pur. Dis-moi ta dispo pour un appel cette semaine.', TRUE,  '2026-05-11 18:15:00'),
(10, 2, 7,  'Je suis libre mercredi soir ou samedi matin. Vous préférez quoi ?',                         FALSE, '2026-05-11 18:30:00'),

-- Conv 3 : Sami <-> Acme Corp (candidature)
(11, 3, 15, 'Bonjour, j''ai déposé ma candidature pour le stage frontend React il y a 3 jours. Pouvez-vous me confirmer que vous l''avez bien reçue ?',               TRUE,  '2026-05-12 10:00:00'),
(12, 3, 22, 'Bonjour Sami ! Oui, on a bien reçu votre dossier. Votre profil est intéressant, notre responsable technique va revenir vers vous cette semaine.',         TRUE,  '2026-05-12 11:00:00'),
(13, 3, 15, 'Super, merci pour le retour rapide ! J''attends votre contact.',                             TRUE,  '2026-05-12 11:15:00'),
(14, 3, 22, 'Nous vous proposons un test technique de 2h à faire en ligne (React + TypeScript). Je vous envoie le lien demain matin.',                                FALSE, '2026-05-13 09:00:00'),

-- Conv 4 : Admin <-> Nadia
(15, 4, 1,  'Bonjour Nadia, pouvez-vous valider les clubs créés ce semestre depuis le dashboard Admin ? Trois clubs attendent validation.',                            TRUE,  '2026-05-08 14:00:00'),
(16, 4, 2,  'Bonjour, oui bien sûr. Je regarde ça demain matin.',                                        TRUE,  '2026-05-08 14:30:00'),
(17, 4, 1,  'Merci. Il y a aussi deux entreprises en attente d''approbation. Je vous transfère les dossiers.',                                                         FALSE, '2026-05-08 14:35:00'),

-- Conv 5 : Amine <-> Sara (révision)
(18, 5, 7,  'Sara tu es disponible samedi matin pour la révision ? Je réserve la salle A03.',             TRUE,  '2026-05-13 14:50:00'),
(19, 5, 8,  'Oui ! 9h ça te va ? J''apporte mes notes du cours de Nadia.',                               TRUE,  '2026-05-13 15:00:00'),
(20, 5, 7,  'Parfait. Je demande à Yassine et Rania aussi.',                                              TRUE,  '2026-05-13 15:05:00'),
(21, 5, 8,  'Bonne idée. On fait 3h de révision puis pause déj ensemble ?',                               FALSE, '2026-05-13 15:10:00'),

-- Conv 6 : Mokhtar <-> TechVision (entretien)
(22, 6, 17, 'Bonjour, suite à votre offre DevOps, j''ai été contacté par votre équipe. Je confirme ma disponibilité pour l''entretien du 20 mai à 10h.',               TRUE,  '2026-05-14 08:00:00'),
(23, 6, 23, 'Bonjour Mokhtar ! Parfait, l''entretien aura lieu dans nos locaux à Lac II (adresse complète en pièce jointe). Merci de prévoir 1h30.',                   TRUE,  '2026-05-14 08:30:00'),
(24, 6, 17, 'Noté. Faut-il préparer une présentation technique ou juste l''entretien classique ?',         TRUE,  '2026-05-14 08:45:00'),
(25, 6, 23, 'Entretien classique + QCM technique de 20 minutes (Linux, Docker, Kubernetes). Rien d''insurmontable pour votre profil.',                                  FALSE, '2026-05-14 09:00:00');

-- Extra conversations for richer message dashboard
INSERT IGNORE INTO conversations (id, participant1_user_id, participant2_user_id) VALUES
(7, 25, 33),
(8, 28, 37),
(9, 29, 38),
(10, 30, 34),
(11, 26, 35),
(12, 1, 39),
(13, 31, 36),
(14, 27, 7);

INSERT IGNORE INTO messages (id, conversation_id, sender_user_id, contenu, lu, created_at) VALUES
(26, 7, 33, 'Bonjour Monsieur, je veux participer au CTF mais je debute en securite web.', TRUE, '2026-05-14 11:10:00'),
(27, 7, 25, 'Bienvenue Nesrine. Le track debutant est fait pour ca, viens avec ton laptop et Docker installe.', FALSE, '2026-05-14 11:22:00'),
(28, 8, 37, 'Bonjour Career Center, NovaSoft confirme deux offres pour le forum entreprises.', TRUE, '2026-05-14 10:00:00'),
(29, 8, 28, 'Merci. Envoyez les fiches de poste avant vendredi pour les publier sur la plateforme.', TRUE, '2026-05-14 10:12:00'),
(30, 8, 37, 'C est envoye. Nous voulons aussi 6 entretiens courts pendant le forum.', FALSE, '2026-05-14 10:30:00'),
(31, 9, 29, 'Bonjour FinTech Lab, votre compte est valide et votre challenge BI est visible.', TRUE, '2026-05-13 17:00:00'),
(32, 9, 38, 'Parfait, merci. Peut-on ajouter un lien vers le dataset ?', FALSE, '2026-05-13 17:15:00'),
(33, 10, 34, 'Bonjour Sofiene, je travaille sur un projet Spring Boot et je bloque sur Docker Compose.', TRUE, '2026-05-12 18:20:00'),
(34, 10, 30, 'Envoie ton docker-compose.yml. Je regarde surtout les ports, variables env et healthchecks.', TRUE, '2026-05-12 18:35:00'),
(35, 10, 34, 'Merci, je vous l envoie ce soir.', FALSE, '2026-05-12 18:40:00'),
(36, 11, 35, 'Madame, pour le dashboard Power BI, est-ce que 4 pages suffisent ?', TRUE, '2026-05-12 09:10:00'),
(37, 11, 26, 'Oui, si elles repondent aux questions metier: vue globale, risques, details et recommandations.', FALSE, '2026-05-12 09:25:00'),
(38, 12, 39, 'Bonjour, notre compte entreprise est encore en attente. Pouvez-vous verifier ?', FALSE, '2026-05-11 15:00:00'),
(39, 13, 31, 'Aymen, j ai regarde ton CV. Mets tes projets avant les modules suivis.', TRUE, '2026-05-10 12:00:00'),
(40, 13, 36, 'Merci Rim. Je peux ajouter le mini projet Angular meme s il est simple ?', FALSE, '2026-05-10 12:20:00'),
(41, 14, 27, 'Amine, ton attestation de presence est prete au service scolarite.', TRUE, '2026-05-09 08:30:00'),
(42, 14, 7, 'Merci, je passe la recuperer cet apres-midi.', FALSE, '2026-05-09 08:45:00');
