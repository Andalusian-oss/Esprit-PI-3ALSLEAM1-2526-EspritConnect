-- ============================================================
-- EspritConnect — Auth Service Seed Data
-- Default password for ALL accounts: password
-- BCrypt(10) hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- Uses INSERT IGNORE → idempotent, safe to re-run on every startup.
-- ============================================================

SET @pw = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

-- ──────────────────────────────────────────
-- 1. ESPRIT REFERENCE TABLE
-- ──────────────────────────────────────────
INSERT IGNORE INTO esprit_reference (id, esprit_id, cin, expected_role, nom, prenom) VALUES
(1,  'RH-2015-0001',  '08421357', 'ENSEIGNANT', 'Ayari',     'Nadia'),
(2,  'RH-2016-0012',  '09543210', 'ENSEIGNANT', 'Trabelsi',  'Hédi'),
(3,  'RH-2013-0034',  '07654321', 'ENSEIGNANT', 'Ben Said',  'Leïla'),
(4,  'RH-2018-0056',  '10876543', 'ENSEIGNANT', 'Mbarki',    'Faouzi'),
(5,  'RH-2017-0078',  '06789012', 'ENSEIGNANT', 'Ben Amor',  'Tahar'),
(6,  'ESP-2021-4512', '12345678', 'STUDENT',    'Ben Salem', 'Amine'),
(7,  'ESP-2021-4589', '23456789', 'STUDENT',    'Khemiri',   'Sara'),
(8,  'ESP-2022-3701', '34567890', 'STUDENT',    'Jbali',     'Yassine'),
(9,  'ESP-2023-2103', '45678901', 'STUDENT',    'Bouaziz',   'Inès'),
(10, 'ESP-2021-4623', '56789012', 'STUDENT',    'Ferchichi', 'Karim'),
(11, 'ESP-2022-3812', '67890123', 'STUDENT',    'Hamdi',     'Rania'),
(12, 'ESP-2024-1044', '78901234', 'STUDENT',    'Maaloul',   'Zied'),
(13, 'ESP-2021-4798', '89012345', 'STUDENT',    'Chebbi',    'Amal'),
(14, 'ESP-2021-4834', '90123456', 'STUDENT',    'Amara',     'Sami'),
(15, 'ESP-2023-2267', '01234567', 'STUDENT',    'Belhadj',   'Hajer'),
(16, 'ESP-2018-3341', '11223344', 'ALUMNI',     'Saïdi',     'Mokhtar'),
(17, 'ESP-2019-2980', '22334455', 'ALUMNI',     'Jouini',    'Olfa'),
(18, 'ESP-2017-4102', '33445566', 'ALUMNI',     'Hosni',     'Walid'),
(19, 'ESP-2019-3065', '44556677', 'ALUMNI',     'Brik',      'Maryem'),
(20, 'ESP-2018-2879', '55667788', 'ALUMNI',     'Nasri',     'Tarek');

-- ──────────────────────────────────────────
-- 2. USERS
-- ──────────────────────────────────────────

-- ── ADMIN ──
INSERT IGNORE INTO users
  (id, email, password, prenom, nom, role, promo, specialite, parcours, esprit_id, cin, approved, online, created_at)
VALUES
(1, 'admin@esprit.tn', @pw, 'Admin', 'EspritConnect', 'ADMIN',
 NULL, NULL, NULL, NULL, NULL, TRUE, FALSE, '2024-09-01 08:00:00');

-- ── ENSEIGNANTS ──
INSERT IGNORE INTO users
  (id, email, password, prenom, nom, role, promo, specialite, parcours, esprit_id, cin, approved, online, created_at)
VALUES
(2, 'nadia.ayari@esprit.tn',      @pw, 'Nadia',  'Ayari',    'ENSEIGNANT', NULL, 'Informatique',             NULL, 'RH-2015-0001', '08421357', TRUE, FALSE, '2024-09-01 08:05:00'),
(3, 'hedi.trabelsi@esprit.tn',    @pw, 'Hédi',   'Trabelsi', 'ENSEIGNANT', NULL, 'Réseaux & Télécom',        NULL, 'RH-2016-0012', '09543210', TRUE, FALSE, '2024-09-01 08:10:00'),
(4, 'leila.bensaid@esprit.tn',    @pw, 'Leïla',  'Ben Said', 'ENSEIGNANT', NULL, 'Mathématiques appliquées', NULL, 'RH-2013-0034', '07654321', TRUE, FALSE, '2024-09-01 08:15:00'),
(5, 'faouzi.mbarki@esprit.tn',    @pw, 'Faouzi', 'Mbarki',   'ENSEIGNANT', NULL, 'Génie Logiciel',           NULL, 'RH-2018-0056', '10876543', TRUE, FALSE, '2024-09-01 08:20:00'),
(6, 'tahar.benamor@esprit.tn',    @pw, 'Tahar',  'Ben Amor', 'ENSEIGNANT', NULL, 'Systèmes Embarqués',       NULL, 'RH-2017-0078', '06789012', TRUE, FALSE, '2024-09-01 08:25:00');

-- ── ÉTUDIANTS ──
INSERT IGNORE INTO users
  (id, email, password, prenom, nom, role, promo, specialite, parcours, esprit_id, cin, approved, online, created_at)
VALUES
(7,  'amine.bensalem@esprit.tn',  @pw, 'Amine',   'Ben Salem', 'STUDENT', '4DS1', 'Informatique', 'GL',    'ESP-2021-4512', '12345678', TRUE, FALSE, '2021-09-15 10:00:00'),
(8,  'sara.khemiri@esprit.tn',    @pw, 'Sara',    'Khemiri',   'STUDENT', '4DS2', 'Informatique', 'BI',    'ESP-2021-4589', '23456789', TRUE, FALSE, '2021-09-15 10:05:00'),
(9,  'yassine.jbali@esprit.tn',   @pw, 'Yassine', 'Jbali',     'STUDENT', '3DS1', 'Informatique', 'GL',    'ESP-2022-3701', '34567890', TRUE, FALSE, '2022-09-12 10:10:00'),
(10, 'ines.bouaziz@esprit.tn',    @pw, 'Inès',    'Bouaziz',   'STUDENT', '2DS3', 'Informatique', 'DS',    'ESP-2023-2103', '45678901', TRUE, FALSE, '2023-09-10 10:15:00'),
(11, 'karim.ferchichi@esprit.tn', @pw, 'Karim',   'Ferchichi', 'STUDENT', '4DS1', 'Informatique', 'Cloud', 'ESP-2021-4623', '56789012', TRUE, FALSE, '2021-09-15 10:20:00'),
(12, 'rania.hamdi@esprit.tn',     @pw, 'Rania',   'Hamdi',     'STUDENT', '3DS2', 'Informatique', 'BI',    'ESP-2022-3812', '67890123', TRUE, FALSE, '2022-09-12 10:25:00'),
(13, 'zied.maaloul@esprit.tn',    @pw, 'Zied',    'Maaloul',   'STUDENT', '1DS4', 'Informatique', 'GL',    'ESP-2024-1044', '78901234', TRUE, FALSE, '2024-09-08 10:30:00'),
(14, 'amal.chebbi@esprit.tn',     @pw, 'Amal',    'Chebbi',    'STUDENT', '4DS3', 'Informatique', 'SEMC',  'ESP-2021-4798', '89012345', TRUE, FALSE, '2021-09-15 10:35:00'),
(15, 'sami.amara@esprit.tn',      @pw, 'Sami',    'Amara',     'STUDENT', '4DS2', 'Informatique', 'DS',    'ESP-2021-4834', '90123456', TRUE, FALSE, '2021-09-15 10:40:00'),
(16, 'hajer.belhadj@esprit.tn',   @pw, 'Hajer',   'Belhadj',   'STUDENT', '2DS1', 'Informatique', 'GL',    'ESP-2023-2267', '01234567', TRUE, FALSE, '2023-09-10 10:45:00');

-- ── ALUMNI ──
INSERT IGNORE INTO users
  (id, email, password, prenom, nom, role, promo, specialite, parcours, esprit_id, cin, approved, online, created_at)
VALUES
(17, 'mokhtar.saidi@gmail.com',  @pw, 'Mokhtar', 'Saïdi',  'ALUMNI', '2022', 'Informatique', 'GL', 'ESP-2018-3341', '11223344', TRUE, FALSE, '2022-07-01 09:00:00'),
(18, 'olfa.jouini@gmail.com',    @pw, 'Olfa',    'Jouini', 'ALUMNI', '2023', 'Finance',       'CF', 'ESP-2019-2980', '22334455', TRUE, FALSE, '2023-07-01 09:00:00'),
(19, 'walid.hosni@gmail.com',    @pw, 'Walid',   'Hosni',  'ALUMNI', '2021', 'Informatique', 'DS', 'ESP-2017-4102', '33445566', TRUE, FALSE, '2021-07-01 09:00:00'),
(20, 'maryem.brik@gmail.com',    @pw, 'Maryem',  'Brik',   'ALUMNI', '2023', 'Informatique', 'BI', 'ESP-2019-3065', '44556677', TRUE, FALSE, '2023-07-01 09:00:00'),
(21, 'tarek.nasri@gmail.com',    @pw, 'Tarek',   'Nasri',  'ALUMNI', '2022', 'Informatique', 'GL', 'ESP-2018-2879', '55667788', TRUE, FALSE, '2022-07-01 09:00:00');

-- ── ENTREPRISES (pre-approved) ──
INSERT IGNORE INTO users
  (id, email, password, prenom, nom, role, promo, specialite, parcours, esprit_id, cin, approved, online, created_at)
VALUES
(22, 'hr@acmecorp.tn',        @pw, 'RH',          'Acme Corp SA',      'COMPANY', NULL, NULL, NULL, NULL, NULL, TRUE, FALSE, '2024-10-01 12:00:00'),
(23, 'contact@techvision.tn', @pw, 'Recrutement', 'TechVision SARL',   'COMPANY', NULL, NULL, NULL, NULL, NULL, TRUE, FALSE, '2024-10-05 12:00:00'),
(24, 'rh@dataminds.tn',       @pw, 'RH',          'DataMinds Tunisia', 'COMPANY', NULL, NULL, NULL, NULL, NULL, TRUE, FALSE, '2024-11-01 12:00:00');

-- Additional rich demo users for complete dashboards
INSERT IGNORE INTO esprit_reference (id, esprit_id, cin, expected_role, nom, prenom) VALUES
(21, 'RH-2019-0101', '11770011', 'ENSEIGNANT', 'Mansour', 'Youssef'),
(22, 'RH-2020-0102', '11770022', 'ENSEIGNANT', 'Gharbi', 'Salma'),
(23, 'ADM-2018-0201', '11770101', 'EMPLOYE', 'Mejri', 'Nour'),
(24, 'ADM-2019-0202', '11770102', 'EMPLOYE', 'Karray', 'Anis'),
(25, 'ADM-2021-0203', '11770103', 'EMPLOYE', 'Bouzid', 'Maha'),
(26, 'ESP-2016-5201', '11770201', 'ALUMNI', 'Lahmar', 'Sofiene'),
(27, 'ESP-2017-5202', '11770202', 'ALUMNI', 'Missaoui', 'Rim'),
(28, 'ESP-2018-5203', '11770203', 'ALUMNI', 'Cherif', 'Ahmed'),
(29, 'ESP-2022-5301', '11770301', 'STUDENT', 'Baccouche', 'Nesrine'),
(30, 'ESP-2022-5302', '11770302', 'STUDENT', 'Dridi', 'Fares'),
(31, 'ESP-2023-5303', '11770303', 'STUDENT', 'Zribi', 'Mouna'),
(32, 'ESP-2024-5304', '11770304', 'STUDENT', 'Mami', 'Aymen');

INSERT IGNORE INTO users
  (id, email, password, prenom, nom, role, promo, specialite, parcours, esprit_id, cin, approved, online, created_at)
VALUES
(25, 'youssef.mansour@esprit.tn', @pw, 'Youssef', 'Mansour', 'ENSEIGNANT', NULL, 'Cybersecurite', NULL, 'RH-2019-0101', '11770011', TRUE, TRUE, '2024-09-01 08:30:00'),
(26, 'salma.gharbi@esprit.tn', @pw, 'Salma', 'Gharbi', 'ENSEIGNANT', NULL, 'Data Science', NULL, 'RH-2020-0102', '11770022', TRUE, FALSE, '2024-09-01 08:35:00'),
(27, 'nour.mejri@esprit.tn', @pw, 'Nour', 'Mejri', 'EMPLOYE', NULL, 'Scolarite', NULL, 'ADM-2018-0201', '11770101', TRUE, TRUE, '2024-09-02 09:00:00'),
(28, 'anis.karray@esprit.tn', @pw, 'Anis', 'Karray', 'EMPLOYE', NULL, 'Career Center', NULL, 'ADM-2019-0202', '11770102', TRUE, FALSE, '2024-09-02 09:05:00'),
(29, 'maha.bouzid@esprit.tn', @pw, 'Maha', 'Bouzid', 'EMPLOYE', NULL, 'Relations Entreprises', NULL, 'ADM-2021-0203', '11770103', TRUE, TRUE, '2024-09-02 09:10:00'),
(30, 'sofiene.lahmar@gmail.com', @pw, 'Sofiene', 'Lahmar', 'ALUMNI', '2020', 'Informatique', 'Cloud', 'ESP-2016-5201', '11770201', TRUE, FALSE, '2020-07-01 09:00:00'),
(31, 'rim.missaoui@gmail.com', @pw, 'Rim', 'Missaoui', 'ALUMNI', '2021', 'Informatique', 'SEMC', 'ESP-2017-5202', '11770202', TRUE, TRUE, '2021-07-01 09:00:00'),
(32, 'ahmed.cherif@gmail.com', @pw, 'Ahmed', 'Cherif', 'ALUMNI', '2022', 'Informatique', 'BI', 'ESP-2018-5203', '11770203', TRUE, FALSE, '2022-07-01 09:00:00'),
(33, 'nesrine.baccouche@esprit.tn', @pw, 'Nesrine', 'Baccouche', 'STUDENT', '3DS3', 'Informatique', 'Cloud', 'ESP-2022-5301', '11770301', TRUE, TRUE, '2022-09-12 10:50:00'),
(34, 'fares.dridi@esprit.tn', @pw, 'Fares', 'Dridi', 'STUDENT', '3DS1', 'Informatique', 'GL', 'ESP-2022-5302', '11770302', TRUE, FALSE, '2022-09-12 10:55:00'),
(35, 'mouna.zribi@esprit.tn', @pw, 'Mouna', 'Zribi', 'STUDENT', '2DS2', 'Informatique', 'BI', 'ESP-2023-5303', '11770303', TRUE, TRUE, '2023-09-10 10:50:00'),
(36, 'aymen.mami@esprit.tn', @pw, 'Aymen', 'Mami', 'STUDENT', '1DS1', 'Informatique', 'GL', 'ESP-2024-5304', '11770304', TRUE, FALSE, '2024-09-08 10:35:00'),
(37, 'talent@novasoft.tn', @pw, 'Talent', 'NovaSoft Tunisia', 'COMPANY', NULL, NULL, NULL, NULL, NULL, TRUE, FALSE, '2024-11-15 12:00:00'),
(38, 'recrutement@fintechlab.tn', @pw, 'Recrutement', 'FinTech Lab', 'COMPANY', NULL, NULL, NULL, NULL, NULL, TRUE, TRUE, '2024-11-20 12:00:00'),
(39, 'jobs@medtech.tn', @pw, 'Jobs', 'MedTech Solutions', 'COMPANY', NULL, NULL, NULL, NULL, NULL, FALSE, FALSE, '2024-12-01 12:00:00'),
(40, 'contact@greenbyte.tn', @pw, 'Contact', 'GreenByte Energy', 'COMPANY', NULL, NULL, NULL, NULL, NULL, FALSE, FALSE, '2024-12-05 12:00:00');

-- ── MENTORS (10 experienced profiles, diverse specialities) ──
INSERT IGNORE INTO users
  (id, email, password, prenom, nom, role, promo, specialite, parcours, esprit_id, cin, approved, online, created_at)
VALUES
(41, 'ahmed.slim@mentor.esprit.tn',     @pw, 'Ahmed',   'Slim',       'MENTOR', '2020', 'Génie Logiciel',         'GL',    'ESP-2016-9001', '61001001', TRUE, TRUE,  '2023-01-15 09:00:00'),
(42, 'cyrine.boubaker@mentor.esprit.tn',@pw, 'Cyrine',  'Boubaker',   'MENTOR', '2019', 'Data Science',           'BI',    'ESP-2015-9002', '62002002', TRUE, FALSE, '2023-02-10 09:00:00'),
(43, 'ghariani.med@mentor.esprit.tn',   @pw, 'Mohamed', 'Ghariani',   'MENTOR', '2021', 'Cloud & DevOps',         'Cloud', 'ESP-2017-9003', '63003003', TRUE, TRUE,  '2023-03-05 09:00:00'),
(44, 'fatma.oueslati@mentor.esprit.tn', @pw, 'Fatma',   'Oueslati',   'MENTOR', '2020', 'Cybersécurité',          'SSI',   'ESP-2016-9004', '64004004', TRUE, FALSE, '2023-04-20 09:00:00'),
(45, 'yassine.chaari@mentor.esprit.tn', @pw, 'Yassine', 'Chaari',     'MENTOR', '2022', 'Développement Mobile',   'TWIN',  'ESP-2018-9005', '65005005', TRUE, TRUE,  '2023-05-12 09:00:00'),
(46, 'mariem.soltani@mentor.esprit.tn', @pw, 'Mariem',  'Soltani',    'MENTOR', '2021', 'Intelligence Artificielle','BI',  'ESP-2017-9006', '66006006', TRUE, FALSE, '2023-06-01 09:00:00'),
(47, 'khalil.turki@mentor.esprit.tn',   @pw, 'Khalil',  'Turki',      'MENTOR', '2019', 'Génie Logiciel',         'GL',    'ESP-2015-9007', '67007007', TRUE, TRUE,  '2023-07-08 09:00:00'),
(48, 'donia.fersi@mentor.esprit.tn',    @pw, 'Donia',   'Fersi',      'MENTOR', '2022', 'Développement Web',      'TWIN',  'ESP-2018-9008', '68008008', TRUE, FALSE, '2023-08-14 09:00:00'),
(49, 'ons.hammami@mentor.esprit.tn',    @pw, 'Ons',     'Hammami',    'MENTOR', '2020', 'Systèmes Embarqués',     'SEMC',  'ESP-2016-9009', '69009009', TRUE, TRUE,  '2023-09-22 09:00:00'),
(50, 'bilel.mansouri@mentor.esprit.tn', @pw, 'Bilel',   'Mansouri',   'MENTOR', '2018', 'Génie Logiciel',         'GL',    'ESP-2014-9010', '70010010', TRUE, FALSE, '2023-10-30 09:00:00');
