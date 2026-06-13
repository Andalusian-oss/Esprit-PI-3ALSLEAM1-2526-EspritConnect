export type Lang = 'en' | 'fr';

export interface Translations {
  // ── Sidebar / nav ──
  'nav.feed': string;
  'nav.events': string;
  'nav.jobs': string;
  'nav.mentoring': string;
  'mentoring.subtitle': string;
  'nav.pfeBooks': string;
  'nav.resources': string;
  'nav.messages': string;
  'nav.profile': string;
  'nav.rh': string;
  'nav.admin': string;
  'nav.lightMode': string;
  'nav.darkMode': string;
  'nav.signOut': string;
  'nav.notifications': string;
  'nav.markAllRead': string;
  'nav.noNotif': string;
  'nav.viewAll': string;
  // ── Home ──
  'home.welcome': string;
  'home.heroSub': string;
  'home.getStarted': string;
  'home.signIn': string;
  'home.reconnect.title': string;
  'home.reconnect.desc': string;
  'home.hire.title': string;
  'home.hire.desc': string;
  'home.network.title': string;
  'home.network.desc': string;
  'home.community.tag': string;
  'home.community.title': string;
  'home.community.desc': string;
  'home.feat.feed': string;
  'home.feat.jobs': string;
  'home.feat.events': string;
  'home.feat.messages': string;
  'home.feat.resources': string;
  'home.feat.ai': string;
  'home.join': string;
  'home.stats.members': string;
  'home.stats.jobs': string;
  'home.stats.events': string;
  'home.stats.companies': string;
  'home.cta.title': string;
  'home.cta.desc': string;
  'home.cta.create': string;
  'home.footer.copy': string;
  // ── Auth ──
  'auth.email': string;
  'auth.password': string;
  'auth.login.sub': string;
  'auth.login.welcomeBack': string;
  'auth.login.btn': string;
  'auth.login.signingIn': string;
  'auth.login.subtitle': string;
  'auth.login.noAccount': string;
  'auth.login.createOne': string;
  'auth.login.pending': string;
  'auth.register.createAccount': string;
  'auth.register.whoAreYou': string;
  'auth.register.roleDesc': string;
  'auth.register.continue': string;
  'auth.register.yourDetails': string;
  'auth.register.registeringAs': string;
  'auth.register.back': string;
  'auth.register.create': string;
  'auth.register.creating': string;
  'auth.register.firstName': string;
  'auth.register.lastName': string;
  'auth.register.companyName': string;
  'auth.register.companyHint': string;
  'auth.register.espritId': string;
  'auth.register.espritIdHint': string;
  'auth.register.cin': string;
  'auth.register.cinHint': string;
  'auth.register.specialite': string;
  'auth.register.parcours': string;
  'auth.register.promo': string;
  'auth.register.dept': string;
  'auth.register.hasAccount': string;
  'auth.register.signIn': string;
  'auth.register.pendingMsg': string;
  // ── Chatbot ──
  'chat.title': string;
  'chat.status': string;
  'chat.welcome.title': string;
  'chat.welcome.body': string;
  'chat.placeholder': string;
  'chat.thinking': string;
  'chat.chips.job': string;
  'chat.chips.resources': string;
  'chat.chips.mentor': string;
  'chat.chips.events': string;
  'chat.chips.cv': string;
  'chat.newChat': string;
  'chat.history': string;
  'chat.noConvos': string;
  'chat.emptyTitle': string;
  'chat.emptySub': string;
  'chat.disclaimer': string;
  'chat.stop': string;
  'chat.send': string;
  'chat.regenerate': string;
  'chat.copy': string;
  'chat.copied': string;
  'chat.deleteConvo': string;
  'chat.error': string;
  'chat.expand': string;
  'nav.assistant': string;
  // ── Common shared ──
  'common.cancel': string;
  'common.save': string;
  'common.edit': string;
  'common.delete': string;
  'common.create': string;
  'common.update': string;
  'common.loading': string;
  'common.saving': string;
  'common.previous': string;
  'common.next': string;
  'common.close': string;
  'common.message': string;
  'common.viewCv': string;
  'common.apply': string;
  'common.register': string;
  'common.join': string;
  'common.all': string;
  'common.uploading': string;
  'common.noResults': string;
  // ── Feed ──
  'feed.title': string;
  'feed.subtitle': string;
  'feed.compose': string;
  'feed.mindPlaceholder': string;
  'feed.photo': string;
  'feed.media': string;
  'feed.publishing': string;
  'feed.publish': string;
  'feed.sharedFrom': string;
  'feed.emptyTitle': string;
  'feed.emptyDesc': string;
  'feed.noComments': string;
  'feed.commentPlaceholder': string;
  'feed.saveEdit': string;
  'feed.share': string;
  'feed.reactLike': string;
  'feed.reactWow': string;
  'feed.reactAppreciate': string;
  'feed.reactGg': string;
  // ── Events ──
  'events.title': string;
  'events.subtitle': string;
  'events.newClub': string;
  'events.closeClubForm': string;
  'events.createEvent': string;
  'events.updateEvent': string;
  'events.createClub': string;
  'events.updateClub': string;
  'events.titlePh': string;
  'events.descPh': string;
  'events.locationPh': string;
  'events.noClub': string;
  'events.clubNamePh': string;
  'events.logoUrlPh': string;
  'events.sectionEvents': string;
  'events.searchEvents': string;
  'events.allClubs': string;
  'events.noEvents': string;
  'events.registered': string;
  'events.location': string;
  'events.club': string;
  'events.sectionClubs': string;
  'events.searchClubs': string;
  'events.members': string;
  'events.clubBadge': string;
  // ── Jobs ──
  'jobs.title': string;
  'jobs.subtitle': string;
  'jobs.createOffer': string;
  'jobs.updateOffer': string;
  'jobs.findOpportunities': string;
  'jobs.findOpportunitiesDesc': string;
  'jobs.requestMentoring': string;
  'jobs.mentorIdPh': string;
  'jobs.domainPh': string;
  'jobs.internship': string;
  'jobs.cdi': string;
  'jobs.cdd': string;
  'jobs.postJob': string;
  'jobs.sectionOffers': string;
  'jobs.searchJobs': string;
  'jobs.allTypes': string;
  'jobs.typeInternship': string;
  'jobs.typeCDI': string;
  'jobs.typeCDD': string;
  'jobs.noJobs': string;
  'jobs.applicants': string;
  'jobs.applications': string;
  'jobs.score': string;
  'jobs.analyzeCv': string;
  'jobs.analyzingCv': string;
  'jobs.noApplications': string;
  'jobs.sectionMentoring': string;
  'jobs.noMentoring': string;
  'jobs.mentor': string;
  'jobs.mentee': string;
  'jobs.sessions': string;
  'jobs.complete': string;
  'jobs.mentorTab': string;
  'jobs.menteeTab': string;
  'jobs.statusActive': string;
  'jobs.statusCompleted': string;
  'jobs.statusCancelled': string;
  'jobs.cancelMentoring': string;
  'jobs.addSession': string;
  'jobs.sessionDate': string;
  'jobs.sessionDuration': string;
  'jobs.noSessions': string;
  'jobs.activeMentorings': string;
  'jobs.plannedSessions': string;
  'jobs.totalMentorings': string;
  'jobs.browseMentors': string;
  'jobs.browseMentorsDesc': string;
  'jobs.filterSpeciality': string;
  'jobs.allSpecialities': string;
  'jobs.noMentorsAvailable': string;
  'jobs.requestFromMentor': string;
  'jobs.chooseDomain': string;
  'jobs.sendRequest': string;
  'jobs.mentorSpeciality': string;
  'admin.mentorSection': string;
  'admin.addMentorRelation': string;
  'admin.mentorUserId': string;
  'admin.menteeUserId': string;
  'admin.createMentoring': string;
  'admin.allMentorings': string;
  'admin.noMentorings': string;
  'jobs.applyFor': string;
  'jobs.cvBanner': string;
  'jobs.cvLabel': string;
  'jobs.cvUploading': string;
  'jobs.cvUploaded': string;
  'jobs.uploadingCvBtn': string;
  'jobs.submitApplication': string;
  'jobs.cvAnalysisTitle': string;
  'jobs.candidate': string;
  'jobs.yrsExp': string;
  'jobs.skillsDetected': string;
  'jobs.education': string;
  'jobs.languages': string;
  'jobs.saveScore': string;
  // ── Resources ──
  'res.title': string;
  'res.subtitle': string;
  'res.shareBtn': string;
  'res.cancelBtn': string;
  'res.editForm': string;
  'res.shareForm': string;
  'res.labelTitle': string;
  'res.labelType': string;
  'res.labelCategory': string;
  'res.labelDesc': string;
  'res.labelUrl': string;
  'res.labelTags': string;
  'res.tagsHint': string;
  'res.titlePh': string;
  'res.descPh': string;
  'res.uploadPdf': string;
  'res.chooseFile': string;
  'res.fileUploaded': string;
  'res.update': string;
  'res.share': string;
  'res.filterAll': string;
  'res.filterAcademic': string;
  'res.filterCareer': string;
  'res.filterTechnical': string;
  'res.filterSocial': string;
  'res.filterEvent': string;
  'res.allTypes': string;
  'res.clearFilters': string;
  'res.loadingResources': string;
  'res.emptyTitle': string;
  'res.emptyFilterDesc': string;
  'res.emptyDesc': string;
  'res.liked': string;
  'res.like': string;
  'res.open': string;
  'res.prevBtn': string;
  'res.nextBtn': string;
  // ── Profile ──
  'profile.editProfile': string;
  'profile.editTitle': string;
  'profile.firstName': string;
  'profile.lastName': string;
  'profile.email': string;
  'profile.specialite': string;
  'profile.parcours': string;
  'profile.promo': string;
  'profile.dept': string;
  'profile.avatarUrl': string;
  'profile.noneOption': string;
  'profile.saveChanges': string;
  'profile.invalidEmail': string;
  'profile.accountDetails': string;
  'profile.memberSince': string;
  'profile.espritId': string;
  'profile.cin': string;
  'profile.online': string;
  'profile.offline': string;
  'profile.lastSeen': string;
  'profile.uploadAvatar': string;
  'profile.chooseImage': string;
  'profile.myPosts': string;
  'profile.loadingPosts': string;
  'profile.noPosts': string;
  'profile.likes': string;
  'profile.comments': string;
  'profile.view': string;
  // ── Messages ──
  'msg.title': string;
  'msg.tabDirect': string;
  'msg.tabGroups': string;
  'msg.searchPeople': string;
  'msg.searching': string;
  'msg.noConversations': string;
  'msg.noGroups': string;
  'msg.newGroup': string;
  'msg.emptyTitle': string;
  'msg.emptyDesc': string;
  'msg.active': string;
  'msg.members': string;
  'msg.typePlaceholder': string;
  'msg.edited': string;
  'msg.saveEdit': string;
  'msg.online': string;
  'msg.groupInfo': string;
  'msg.addMember': string;
  'msg.leaveGroup': string;
  'msg.groupName': string;
  'msg.addMembers': string;
  'msg.createGroup': string;
  'msg.searchUser': string;
  'msg.creating': string;
  'msg.deleteConv': string;
  // ── Admin ──
  'admin.title': string;
  'admin.subtitle': string;
  'admin.users': string;
  'admin.online': string;
  'admin.noAccess': string;
  'admin.userDirectory': string;
  'admin.results': string;
  'admin.searchUsers': string;
  'admin.allRoles': string;
  'admin.students': string;
  'admin.alumni': string;
  'admin.teachers': string;
  'admin.employees': string;
  'admin.companies': string;
  'admin.mentors': string;
  'admin.admins': string;
  'admin.noUsers': string;
  'admin.joined': string;
  'admin.feedTile': string;
  'admin.feedDesc': string;
  'admin.eventsTile': string;
  'admin.eventsDesc': string;
  'admin.jobsTile': string;
  'admin.jobsDesc': string;
  'admin.pendingApprovals': string;
  'admin.noPending': string;
  'admin.approve': string;
  'admin.reject': string;
  'admin.refTable': string;
  'admin.refDesc': string;
  'admin.refInfo': string;
  'admin.addRef': string;
  'admin.roleLabel': string;
  'admin.addEntry': string;
  'admin.noRef': string;
  // ── RH Dashboard ──
  'rh.title': string;
  'rh.tabAnalytics': string;
  'rh.tabJobs': string;
  'rh.myOffers': string;
  'rh.applicants': string;
  'rh.hrAnalytics': string;
  'rh.analyticsDesc': string;
  'rh.totalApps': string;
  'rh.avgScore': string;
  'rh.acceptanceRate': string;
  'rh.pendingReview': string;
  'rh.appPerJob': string;
  'rh.statusDist': string;
  'rh.noData': string;
  'rh.accepted': string;
  'rh.pending': string;
  'rh.rejected': string;
  'rh.scoreDist': string;
  'rh.jobOffers': string;
  'rh.jobOffersDesc': string;
  'rh.newOffer': string;
  'rh.cancelBtn': string;
  'rh.editJobOffer': string;
  'rh.newJobOffer': string;
  'rh.jobTitle': string;
  'rh.contractType': string;
  'rh.location': string;
  'rh.description': string;
  'rh.requiredSkills': string;
  'rh.skillsHint': string;
  'rh.titleRequired': string;
  'rh.descRequired': string;
  'rh.updateOffer': string;
  'rh.postJob': string;
  'rh.backToOffers': string;
  'rh.rankCol': string;
  'rh.candidateCol': string;
  'rh.cvQualityCol': string;
  'rh.jobMatchCol': string;
  'rh.statusCol': string;
  'rh.actionsCol': string;
  'rh.analyzingCvs': string;
  'rh.noApplicants': string;
  'rh.noJobsYet': string;
  'rh.viewApplicants': string;
  'rh.candidates': string;
  'rh.contact': string;
  'rh.skillsSection': string;
  'rh.missingSkills': string;
  'rh.educSection': string;
  'rh.expSection': string;
  'rh.yrsExpLabel': string;
  'rh.languagesSection': string;
  'rh.noCv': string;
  'rh.cvPending': string;
  'rh.analyzingDrawer': string;
  'rh.analyzeNow': string;
  'rh.acceptBtn': string;
  'rh.rejectBtn': string;
  'rh.rankedByMatch': string;
  'rh.top': string;
  'rh.loadApplicantsError': string;
  'rh.updateStatusError': string;
  'rh.applicantAccepted': string;
  'rh.applicantRejected': string;
  // ── PFE Books ──
  'pfe.title': string;
  'pfe.subtitle': string;
  'pfe.tabAll': string;
  'pfe.tabPending': string;
  'pfe.noBooks': string;
  'pfe.allReviewed': string;
  'pfe.approve': string;
  'pfe.reject': string;
  'pfe.uploadTitle': string;
  'pfe.uploadDesc': string;
  'pfe.newBook': string;
  'pfe.cancelBook': string;
  'pfe.labelCompany': string;
  'pfe.phCompany': string;
  'pfe.formLabelDesc': string;
  'pfe.phDesc': string;
  'pfe.formLabelSpec': string;
  'pfe.submitApproval': string;
  'pfe.searchPh': string;
  'pfe.viewBtn': string;
  'pfe.downloadBtn': string;
  'pfe.authorLabel': string;
  'pfe.yearLabel': string;
  'pfe.specLabel': string;
  'pfe.deptLabel': string;
  'pfe.sizeLabel': string;
  'pfe.descLabel': string;
  'pfe.downloadsLabel': string;
  'pfe.viewsLabel': string;
  'pfe.downloadPdf': string;
  'pfe.uploadSuccess': string;
  'pfe.approvedSuccess': string;
  'pfe.rejectedSuccess': string;
  'pfe.downloadedSuccess': string;
}

const en: Translations = {
  // ── Sidebar / nav ──
  'nav.feed': 'Feed',
  'nav.events': 'Events',
  'nav.jobs': 'Jobs',
  'nav.mentoring': 'Mentoring',
  'mentoring.subtitle': 'Find a mentor, track your sessions and grow your skills',
  'nav.pfeBooks': 'PFE Books',
  'nav.resources': 'Resources',
  'nav.messages': 'Messages',
  'nav.profile': 'Profile',
  'nav.rh': 'RH Dashboard',
  'nav.admin': 'Admin',
  'nav.lightMode': 'Light mode',
  'nav.darkMode': 'Dark mode',
  'nav.signOut': 'Sign out',
  'nav.notifications': 'Notifications',
  'nav.markAllRead': 'Mark all read',
  'nav.noNotif': 'No notifications yet',
  'nav.viewAll': 'View all in Messages',
  // ── Home ──
  'home.welcome': 'Welcome to',
  'home.heroSub': 'The official platform for ESPRIT students, alumni and partner companies. Build your network, find opportunities, and grow your career.',
  'home.getStarted': 'Get Started',
  'home.signIn': 'Sign In',
  'home.reconnect.title': 'Re-connect with classmates',
  'home.reconnect.desc': 'Find and reminisce with fellow graduates, see what they have been up to and stay in touch.',
  'home.hire.title': 'Hire & mentor talent',
  'home.hire.desc': 'Introduce, employ and offer to act as a mentor to our graduating students.',
  'home.network.title': 'Grow your network',
  'home.network.desc': 'Leverage your professional network to get introduced to people you should know.',
  'home.community.tag': 'Your ESPRIT Community',
  'home.community.title': 'Everything in one place',
  'home.community.desc': 'From your first post to your first job — one platform built for ESPRIT.',
  'home.feat.feed': 'Social Feed — posts, likes, comments',
  'home.feat.jobs': 'Job Board — CDI, CDD, internships',
  'home.feat.events': 'Events — hackathons, career fairs',
  'home.feat.messages': 'Messaging — chat with peers & recruiters',
  'home.feat.resources': 'Resources — courses, tutorials, projects',
  'home.feat.ai': 'AI Assistant — CV scoring, job matching',
  'home.join': 'Join the community',
  'home.stats.members': 'Active Members',
  'home.stats.jobs': 'Job Offers',
  'home.stats.events': 'Events / Year',
  'home.stats.companies': 'Partner Companies',
  'home.cta.title': 'Ready to join your ESPRIT community?',
  'home.cta.desc': 'Free for all ESPRIT students and alumni. Create your account in seconds.',
  'home.cta.create': 'Create Free Account',
  'home.footer.copy': '© 2025 EspritConnect — The official ESPRIT student platform.',
  // ── Auth ──
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.login.sub': 'Sign in',
  'auth.login.welcomeBack': 'Welcome back',
  'auth.login.btn': 'Sign in',
  'auth.login.signingIn': 'Signing in...',
  'auth.login.subtitle': 'Enter your credentials to access your campus network',
  'auth.login.noAccount': 'No account yet?',
  'auth.login.createOne': 'Create one',
  'auth.login.pending': 'Your company account has been submitted and is pending admin approval. You\'ll be able to login once approved.',
  'auth.register.createAccount': 'Create your account',
  'auth.register.whoAreYou': 'Who are you?',
  'auth.register.roleDesc': 'Select your role at Esprit to get started',
  'auth.register.continue': 'Continue →',
  'auth.register.yourDetails': 'Your details',
  'auth.register.registeringAs': 'Registering as',
  'auth.register.back': '← Back',
  'auth.register.create': 'Create account',
  'auth.register.creating': 'Creating...',
  'auth.register.firstName': 'First Name',
  'auth.register.lastName': 'Last Name',
  'auth.register.companyName': 'Company Name',
  'auth.register.companyHint': 'This name will appear on all your job offers',
  'auth.register.espritId': 'Esprit ID',
  'auth.register.espritIdHint': 'Printed on your student/staff card',
  'auth.register.cin': 'CIN',
  'auth.register.cinHint': 'National ID card number',
  'auth.register.specialite': 'Specialité',
  'auth.register.parcours': 'Parcours',
  'auth.register.promo': 'Promo',
  'auth.register.dept': 'Département / Spécialité',
  'auth.register.hasAccount': 'Already have an account?',
  'auth.register.signIn': 'Sign in',
  'auth.register.pendingMsg': 'Your account will be reviewed by an admin before you can log in.',
  // ── Chatbot ──
  'chat.title': 'ESPRIT Assistant',
  'chat.status': '● Online',
  'chat.welcome.title': "Hi, I'm your ESPRIT Connect assistant!",
  'chat.welcome.body': 'Ask me anything about jobs, events, resources, CV tips, or how to use the platform.',
  'chat.placeholder': 'Ask anything...',
  'chat.thinking': 'Thinking...',
  'chat.chips.job': 'How to apply for a job?',
  'chat.chips.resources': 'What are Resources?',
  'chat.chips.mentor': 'How does mentoring work?',
  'chat.chips.events': 'How to find events?',
  'chat.chips.cv': 'Give me tips to improve my CV',
  'chat.newChat': 'New chat',
  'chat.history': 'Conversations',
  'chat.noConvos': 'No conversations yet. Start a new chat!',
  'chat.emptyTitle': 'How can I help you today?',
  'chat.emptySub': 'Ask me anything — studies, career, code, or how to use ESPRIT Connect.',
  'chat.disclaimer': 'AI assistant can make mistakes. Check important info.',
  'chat.stop': 'Stop generating',
  'chat.send': 'Send',
  'chat.regenerate': 'Regenerate',
  'chat.copy': 'Copy',
  'chat.copied': 'Copied!',
  'chat.deleteConvo': 'Delete conversation',
  'chat.error': 'Sorry, I\'m temporarily unavailable. Please try again later.',
  'chat.expand': 'Open full chat',
  'nav.assistant': 'AI Assistant',
  // ── Common shared ──
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
  'common.create': 'Create',
  'common.update': 'Update',
  'common.loading': 'Loading...',
  'common.saving': 'Saving…',
  'common.previous': 'Previous',
  'common.next': 'Next',
  'common.close': 'Close',
  'common.message': 'Message',
  'common.viewCv': 'View CV',
  'common.apply': 'Apply',
  'common.register': 'Register',
  'common.join': 'Join',
  'common.all': 'All',
  'common.uploading': 'Uploading…',
  'common.noResults': 'No results found',
  // ── Feed ──
  'feed.title': 'Feed',
  'feed.subtitle': "What's happening at ESPRIT",
  'feed.compose': 'Share something with your campus…',
  'feed.mindPlaceholder': "What's on your mind?",
  'feed.photo': 'Photo',
  'feed.media': 'Photo / Video',
  'feed.publishing': 'Posting…',
  'feed.publish': 'Publish',
  'feed.sharedFrom': 'Shared from',
  'feed.emptyTitle': 'No posts yet',
  'feed.emptyDesc': 'Be the first to share something with the ESPRIT community!',
  'feed.noComments': 'No comments yet. Be the first!',
  'feed.commentPlaceholder': 'Write a comment…',
  'feed.saveEdit': 'Save',
  'feed.share': 'Share',
  'feed.reactLike': 'Like',
  'feed.reactWow': 'Wow',
  'feed.reactAppreciate': 'Appreciate',
  'feed.reactGg': 'GG',
  // ── Events ──
  'events.title': 'Events & Clubs',
  'events.subtitle': 'Manage campus events and student clubs',
  'events.newClub': 'New club',
  'events.closeClubForm': 'Close club form',
  'events.createEvent': 'Create event',
  'events.updateEvent': 'Update event',
  'events.createClub': 'Create club',
  'events.updateClub': 'Update club',
  'events.titlePh': 'Title',
  'events.descPh': 'Description',
  'events.locationPh': 'Location',
  'events.noClub': 'No club',
  'events.clubNamePh': 'Club name',
  'events.logoUrlPh': 'Logo URL',
  'events.sectionEvents': 'Events',
  'events.searchEvents': 'Search events...',
  'events.allClubs': 'All clubs',
  'events.noEvents': 'No events yet',
  'events.registered': 'registered',
  'events.location': 'Location:',
  'events.club': 'Club:',
  'events.sectionClubs': 'Clubs',
  'events.searchClubs': 'Search clubs...',
  'events.members': 'members',
  'events.clubBadge': 'Club',
  // ── Jobs ──
  'jobs.title': 'Job Board',
  'jobs.subtitle': 'Browse internships, CDI, CDD offers and manage your applications',
  'jobs.createOffer': 'Create Offer',
  'jobs.updateOffer': 'Update Offer',
  'jobs.findOpportunities': 'Find Opportunities',
  'jobs.findOpportunitiesDesc': 'Browse and apply to jobs below. Attach your CV when applying.',
  'jobs.requestMentoring': 'Request Mentoring',
  'jobs.mentorIdPh': 'Mentor User ID',
  'jobs.domainPh': 'Domain (e.g. Backend, Data Science)',
  'jobs.internship': 'Internship (Stage)',
  'jobs.cdi': 'CDI — Permanent',
  'jobs.cdd': 'CDD — Fixed-term',
  'jobs.postJob': 'Post Job',
  'jobs.sectionOffers': 'Job Offers',
  'jobs.searchJobs': 'Search jobs...',
  'jobs.allTypes': 'All types',
  'jobs.typeInternship': 'Internship',
  'jobs.typeCDI': 'CDI',
  'jobs.typeCDD': 'CDD',
  'jobs.noJobs': 'No job listings yet',
  'jobs.applicants': 'applicants',
  'jobs.applications': 'Applications',
  'jobs.score': 'Score:',
  'jobs.analyzeCv': 'Analyze CV',
  'jobs.analyzingCv': 'Analyzing...',
  'jobs.noApplications': 'No applications yet',
  'jobs.sectionMentoring': 'Mentoring',
  'jobs.noMentoring': 'No mentoring relationships yet',
  'jobs.mentor': 'Mentor:',
  'jobs.mentee': 'Mentee:',
  'jobs.sessions': 'sessions',
  'jobs.complete': 'Complete',
  'jobs.mentorTab': 'As Mentor',
  'jobs.menteeTab': 'As Mentee',
  'jobs.statusActive': 'Active',
  'jobs.statusCompleted': 'Completed',
  'jobs.statusCancelled': 'Cancelled',
  'jobs.cancelMentoring': 'Cancel',
  'jobs.addSession': 'Add Session',
  'jobs.sessionDate': 'Date & Time',
  'jobs.sessionDuration': 'Duration (min)',
  'jobs.noSessions': 'No sessions yet',
  'jobs.activeMentorings': 'Active',
  'jobs.plannedSessions': 'Planned sessions',
  'jobs.totalMentorings': 'Total',
  'jobs.browseMentors': 'Find a Mentor',
  'jobs.browseMentorsDesc': 'Browse available mentors, filter by speciality and send a request',
  'jobs.filterSpeciality': 'Speciality',
  'jobs.allSpecialities': 'All specialities',
  'jobs.noMentorsAvailable': 'No mentors available',
  'jobs.requestFromMentor': 'Request Mentoring',
  'jobs.chooseDomain': 'Topic / Domain *',
  'jobs.sendRequest': 'Send Request',
  'jobs.mentorSpeciality': 'Speciality:',
  'admin.mentorSection': 'Mentor Management',
  'admin.addMentorRelation': 'Create Mentoring Relationship',
  'admin.mentorUserId': 'Mentor User ID',
  'admin.menteeUserId': 'Mentee User ID',
  'admin.createMentoring': 'Create',
  'admin.allMentorings': 'All Mentoring Relationships',
  'admin.noMentorings': 'No mentoring relationships found.',
  'jobs.applyFor': 'Apply for:',
  'jobs.cvBanner': 'Attach your CV to strengthen your application. Recruiters can analyze it with AI.',
  'jobs.cvLabel': 'CV / Resume (PDF, optional)',
  'jobs.cvUploading': 'Uploading your CV...',
  'jobs.cvUploaded': '✓ CV uploaded successfully',
  'jobs.uploadingCvBtn': 'Uploading CV...',
  'jobs.submitApplication': 'Submit Application',
  'jobs.cvAnalysisTitle': 'CV Analysis Result',
  'jobs.candidate': 'Candidate',
  'jobs.yrsExp': 'yrs exp.',
  'jobs.skillsDetected': 'Skills Detected',
  'jobs.education': 'Education',
  'jobs.languages': 'Languages',
  'jobs.saveScore': 'Save Score',
  // ── Resources ──
  'res.title': 'Resources',
  'res.subtitle': 'Educational materials, articles, PDFs, videos and career resources shared by the community',
  'res.shareBtn': '+ Share Resource',
  'res.cancelBtn': '✕ Cancel',
  'res.editForm': '✏️ Edit Resource',
  'res.shareForm': '📤 Share a Resource',
  'res.labelTitle': 'Title *',
  'res.labelType': 'Type *',
  'res.labelCategory': 'Category *',
  'res.labelDesc': 'Description',
  'res.labelUrl': 'URL / Link',
  'res.labelTags': 'Tags',
  'res.tagsHint': 'comma-separated',
  'res.titlePh': 'e.g. Introduction to Spring Boot',
  'res.descPh': 'Briefly describe what this resource covers...',
  'res.uploadPdf': 'Upload a PDF file',
  'res.chooseFile': 'Choose file',
  'res.fileUploaded': '✓ File uploaded successfully',
  'res.update': 'Update Resource',
  'res.share': 'Share Resource',
  'res.filterAll': 'All',
  'res.filterAcademic': '🎓 Academic',
  'res.filterCareer': '💼 Career',
  'res.filterTechnical': '⚙️ Technical',
  'res.filterSocial': '🤝 Social',
  'res.filterEvent': '📅 Event',
  'res.allTypes': 'All types',
  'res.clearFilters': 'Clear filters ✕',
  'res.loadingResources': 'Loading resources…',
  'res.emptyTitle': 'No resources found',
  'res.emptyFilterDesc': 'Try adjusting your filters.',
  'res.emptyDesc': 'Be the first to share a resource with the community!',
  'res.liked': '♥ Liked',
  'res.like': '♡ Like',
  'res.open': 'Open ↗',
  'res.prevBtn': '← Prev',
  'res.nextBtn': 'Next →',
  // ── Profile ──
  'profile.editProfile': 'Edit profile',
  'profile.editTitle': 'Edit Profile',
  'profile.firstName': 'First Name',
  'profile.lastName': 'Last Name',
  'profile.email': 'Email',
  'profile.specialite': 'Spécialité',
  'profile.parcours': 'Parcours',
  'profile.promo': 'Promo',
  'profile.dept': 'Département / Spécialité',
  'profile.avatarUrl': 'Avatar URL',
  'profile.noneOption': '-- None --',
  'profile.saveChanges': 'Save changes',
  'profile.invalidEmail': 'Invalid email format',
  'profile.accountDetails': 'Account Details',
  'profile.memberSince': 'Member Since',
  'profile.espritId': 'Esprit ID',
  'profile.cin': 'CIN',
  'profile.online': 'Currently online',
  'profile.offline': 'Offline',
  'profile.lastSeen': 'Last seen',
  'profile.uploadAvatar': 'Upload Avatar',
  'profile.chooseImage': 'Choose image',
  'profile.myPosts': 'My Posts',
  'profile.loadingPosts': 'Loading posts...',
  'profile.noPosts': 'No posts yet.',
  'profile.likes': 'likes',
  'profile.comments': 'comments',
  'profile.view': 'view',
  // ── Messages ──
  'msg.title': 'Messages',
  'msg.tabDirect': 'Direct',
  'msg.tabGroups': 'Groups',
  'msg.searchPeople': 'Search people…',
  'msg.searching': 'Searching…',
  'msg.noConversations': 'No conversations yet',
  'msg.noGroups': 'No groups yet',
  'msg.newGroup': 'New Group',
  'msg.emptyTitle': 'Your Messages',
  'msg.emptyDesc': 'Select a conversation or search for a person to start chatting.',
  'msg.active': 'Active',
  'msg.members': 'members',
  'msg.typePlaceholder': 'Type a message…',
  'msg.edited': 'edited',
  'msg.saveEdit': 'Save',
  'msg.online': 'Online',
  'msg.groupInfo': 'Group Info',
  'msg.addMember': 'Add Member',
  'msg.leaveGroup': 'Leave Group',
  'msg.groupName': 'Group Name',
  'msg.addMembers': 'Add Members',
  'msg.createGroup': 'Create Group',
  'msg.searchUser': 'Search user…',
  'msg.creating': 'Creating…',
  'msg.deleteConv': 'Delete conversation',
  // ── Admin ──
  'admin.title': 'Admin Dashboard',
  'admin.subtitle': 'Platform overview and user management',
  'admin.users': 'users',
  'admin.online': 'online',
  'admin.noAccess': 'Access reserved for administrators.',
  'admin.userDirectory': 'User Directory',
  'admin.results': 'results',
  'admin.searchUsers': 'Search name, email or speciality...',
  'admin.allRoles': 'All roles',
  'admin.students': 'Students',
  'admin.alumni': 'Alumni',
  'admin.teachers': 'Teachers',
  'admin.employees': 'Employees',
  'admin.companies': 'Companies',
  'admin.mentors': 'Mentors',
  'admin.admins': 'Admins',
  'admin.noUsers': 'No users found.',
  'admin.joined': 'Joined',
  'admin.feedTile': 'Feed',
  'admin.feedDesc': 'Moderate posts and comments.',
  'admin.eventsTile': 'Events & Clubs',
  'admin.eventsDesc': 'Manage events and registrations.',
  'admin.jobsTile': 'Jobs & Mentoring',
  'admin.jobsDesc': 'Track offers and mentoring.',
  'admin.pendingApprovals': 'Pending Company Approvals',
  'admin.noPending': 'No pending registrations.',
  'admin.approve': 'Approve',
  'admin.reject': 'Reject',
  'admin.refTable': 'ESPRIT Reference Table',
  'admin.refDesc': 'EspritID ↔ CIN ↔ Role mappings for registration',
  'admin.refInfo': 'Only users whose espritId + CIN matches an entry here can register (except companies).',
  'admin.addRef': 'Add Pre-authorized User',
  'admin.roleLabel': 'Role',
  'admin.addEntry': 'Add Entry',
  'admin.noRef': 'No reference data.',
  // ── RH Dashboard ──
  'rh.title': 'RH Dashboard',
  'rh.tabAnalytics': '📊 Analytics',
  'rh.tabJobs': '📋 Job Offers',
  'rh.myOffers': 'MY OFFERS',
  'rh.applicants': 'applicant(s)',
  'rh.hrAnalytics': 'HR Analytics',
  'rh.analyticsDesc': 'Overview of your recruitment activity',
  'rh.totalApps': 'Total Applications',
  'rh.avgScore': 'Avg Match Score',
  'rh.acceptanceRate': 'Acceptance Rate',
  'rh.pendingReview': 'Pending Review',
  'rh.appPerJob': 'Applications per Job',
  'rh.statusDist': 'Status Distribution',
  'rh.noData': 'No data yet',
  'rh.accepted': 'Accepted',
  'rh.pending': 'Pending',
  'rh.rejected': 'Rejected',
  'rh.scoreDist': 'Score Distribution',
  'rh.jobOffers': 'Job Offers',
  'rh.jobOffersDesc': 'Create and manage your job postings',
  'rh.newOffer': '+ New Offer',
  'rh.cancelBtn': '✕ Cancel',
  'rh.editJobOffer': 'Edit Job Offer',
  'rh.newJobOffer': 'New Job Offer',
  'rh.jobTitle': 'Job Title *',
  'rh.contractType': 'Contract Type *',
  'rh.location': 'Location',
  'rh.description': 'Description *',
  'rh.requiredSkills': 'Required Skills',
  'rh.skillsHint': '(press Enter to add)',
  'rh.titleRequired': 'Title is required',
  'rh.descRequired': 'Description is required',
  'rh.updateOffer': 'Update Offer',
  'rh.postJob': 'Post Job',
  'rh.backToOffers': '← Back to offers',
  'rh.rankCol': 'Rank',
  'rh.candidateCol': 'Candidate',
  'rh.cvQualityCol': 'CV Quality',
  'rh.jobMatchCol': 'Job Match',
  'rh.statusCol': 'Status',
  'rh.actionsCol': 'Actions',
  'rh.analyzingCvs': 'Analyzing CVs…',
  'rh.noApplicants': 'No applications yet for this offer.',
  'rh.noJobsYet': 'No job offers yet. Create your first offer above.',
  'rh.viewApplicants': 'View ranked applicants →',
  'rh.candidates': 'candidate(s)',
  'rh.contact': 'Contact',
  'rh.skillsSection': 'Skills',
  'rh.missingSkills': 'Missing Skills',
  'rh.educSection': 'Education',
  'rh.expSection': 'Experience',
  'rh.yrsExpLabel': 'year(s) of experience',
  'rh.languagesSection': 'Languages',
  'rh.noCv': 'No CV uploaded for this applicant.',
  'rh.cvPending': 'CV available but analysis pending.',
  'rh.analyzingDrawer': 'Analyzing CV…',
  'rh.analyzeNow': 'Analyze Now',
  'rh.acceptBtn': '✓ Accept',
  'rh.rejectBtn': '✕ Reject',
  'rh.rankedByMatch': 'Ranked by match score',
  'rh.top': 'TOP',
  'rh.loadApplicantsError': 'Failed to load applicants',
  'rh.updateStatusError': 'Failed to update status',
  'rh.applicantAccepted': 'Applicant accepted',
  'rh.applicantRejected': 'Applicant rejected',
  // ── PFE Books ──
  'pfe.title': '📚 PFE Books Library',
  'pfe.subtitle': 'Browse, view, and download PFE project books',
  'pfe.tabAll': 'All Books',
  'pfe.tabPending': 'Pending Approval',
  'pfe.noBooks': 'No books yet',
  'pfe.allReviewed': '✓ All submissions reviewed!',
  'pfe.approve': '✓ Approve',
  'pfe.reject': '✕ Reject',
  'pfe.uploadTitle': '📤 Upload PFE Book',
  'pfe.uploadDesc': "Share your company's PFE project book with students",
  'pfe.newBook': '+ New Book',
  'pfe.cancelBook': '✕ Cancel',
  'pfe.labelCompany': 'Company Name *',
  'pfe.phCompany': 'Your Company Name & Domain',
  'pfe.formLabelDesc': 'Description *',
  'pfe.phDesc': 'Project description, technologies used, duration...',
  'pfe.formLabelSpec': 'Specialization *',
  'pfe.submitApproval': 'Submit for Approval',
  'pfe.searchPh': 'Search...',
  'pfe.viewBtn': '👁️ View',
  'pfe.downloadBtn': '⬇️ Download',
  'pfe.authorLabel': 'Author:',
  'pfe.yearLabel': 'Year:',
  'pfe.specLabel': 'Specialization:',
  'pfe.deptLabel': 'Department:',
  'pfe.sizeLabel': 'Size:',
  'pfe.descLabel': 'Description:',
  'pfe.downloadsLabel': 'Downloads:',
  'pfe.viewsLabel': 'Views:',
  'pfe.downloadPdf': 'Download PDF',
  'pfe.uploadSuccess': 'Book uploaded successfully!',
  'pfe.approvedSuccess': 'Book approved!',
  'pfe.rejectedSuccess': 'Book rejected',
  'pfe.downloadedSuccess': 'Downloaded: ',
};

const fr: Translations = {
  // ── Sidebar / nav ──
  'nav.feed': 'Fil d\'actu',
  'nav.events': 'Événements',
  'nav.jobs': 'Emplois',
  'nav.mentoring': 'Mentorat',
  'mentoring.subtitle': 'Trouvez un mentor, suivez vos sessions et développez vos compétences',
  'nav.pfeBooks': 'Livres PFE',
  'nav.resources': 'Ressources',
  'nav.messages': 'Messages',
  'nav.profile': 'Profil',
  'nav.rh': 'Tableau RH',
  'nav.admin': 'Admin',
  'nav.lightMode': 'Mode clair',
  'nav.darkMode': 'Mode sombre',
  'nav.signOut': 'Déconnexion',
  'nav.notifications': 'Notifications',
  'nav.markAllRead': 'Tout marquer comme lu',
  'nav.noNotif': 'Aucune notification',
  'nav.viewAll': 'Voir dans Messages',
  // ── Home ──
  'home.welcome': 'Bienvenue sur',
  'home.heroSub': 'La plateforme officielle des étudiants, alumni et entreprises partenaires d\'ESPRIT. Développez votre réseau, trouvez des opportunités et faites avancer votre carrière.',
  'home.getStarted': 'Commencer',
  'home.signIn': 'Connexion',
  'home.reconnect.title': 'Retrouvez vos camarades',
  'home.reconnect.desc': 'Retrouvez et échangez avec vos anciens camarades, voyez ce qu\'ils sont devenus et restez en contact.',
  'home.hire.title': 'Recrutez & mentorez',
  'home.hire.desc': 'Présentez, recrutez et proposez votre mentorat à nos étudiants diplômés.',
  'home.network.title': 'Élargissez votre réseau',
  'home.network.desc': 'Exploitez votre réseau professionnel pour rencontrer les bonnes personnes.',
  'home.community.tag': 'Votre communauté ESPRIT',
  'home.community.title': 'Tout en un seul endroit',
  'home.community.desc': 'De votre premier post à votre premier emploi — une plateforme conçue pour ESPRIT.',
  'home.feat.feed': 'Fil d\'actu — posts, likes, commentaires',
  'home.feat.jobs': 'Offres d\'emploi — CDI, CDD, stages',
  'home.feat.events': 'Événements — hackathons, forums emploi',
  'home.feat.messages': 'Messagerie — chat entre pairs et recruteurs',
  'home.feat.resources': 'Ressources — cours, tutoriels, projets',
  'home.feat.ai': 'Assistant IA — score CV, matching emploi',
  'home.join': 'Rejoindre la communauté',
  'home.stats.members': 'Membres actifs',
  'home.stats.jobs': 'Offres d\'emploi',
  'home.stats.events': 'Événements / An',
  'home.stats.companies': 'Entreprises partenaires',
  'home.cta.title': 'Prêt à rejoindre votre communauté ESPRIT ?',
  'home.cta.desc': 'Gratuit pour tous les étudiants et alumni ESPRIT. Créez votre compte en quelques secondes.',
  'home.cta.create': 'Créer un compte gratuit',
  'home.footer.copy': '© 2025 EspritConnect — La plateforme officielle des étudiants ESPRIT.',
  // ── Auth ──
  'auth.email': 'E-mail',
  'auth.password': 'Mot de passe',
  'auth.login.sub': 'Connexion',
  'auth.login.welcomeBack': 'Bon retour',
  'auth.login.btn': 'Se connecter',
  'auth.login.signingIn': 'Connexion...',
  'auth.login.subtitle': 'Entrez vos identifiants pour accéder à votre réseau campus',
  'auth.login.noAccount': 'Pas encore de compte ?',
  'auth.login.createOne': 'Créer un compte',
  'auth.login.pending': 'Votre compte entreprise a été soumis et est en attente de validation par un administrateur.',
  'auth.register.createAccount': 'Créer votre compte',
  'auth.register.whoAreYou': 'Qui êtes-vous ?',
  'auth.register.roleDesc': 'Sélectionnez votre rôle à Esprit pour commencer',
  'auth.register.continue': 'Continuer →',
  'auth.register.yourDetails': 'Vos informations',
  'auth.register.registeringAs': 'Inscription en tant que',
  'auth.register.back': '← Retour',
  'auth.register.create': 'Créer le compte',
  'auth.register.creating': 'Création...',
  'auth.register.firstName': 'Prénom',
  'auth.register.lastName': 'Nom',
  'auth.register.companyName': 'Nom de l\'entreprise',
  'auth.register.companyHint': 'Ce nom apparaîtra sur toutes vos offres d\'emploi',
  'auth.register.espritId': 'ID Esprit',
  'auth.register.espritIdHint': 'Imprimé sur votre carte étudiant/personnel',
  'auth.register.cin': 'CIN',
  'auth.register.cinHint': 'Numéro de carte d\'identité nationale',
  'auth.register.specialite': 'Spécialité',
  'auth.register.parcours': 'Parcours',
  'auth.register.promo': 'Promo',
  'auth.register.dept': 'Département / Spécialité',
  'auth.register.hasAccount': 'Déjà un compte ?',
  'auth.register.signIn': 'Se connecter',
  'auth.register.pendingMsg': 'Votre compte sera examiné par un administrateur avant que vous puissiez vous connecter.',
  // ── Chatbot ──
  'chat.title': 'Assistant ESPRIT',
  'chat.status': '● En ligne',
  'chat.welcome.title': 'Bonjour, je suis votre assistant ESPRIT Connect !',
  'chat.welcome.body': 'Posez-moi des questions sur les emplois, événements, ressources, conseils CV ou l\'utilisation de la plateforme.',
  'chat.placeholder': 'Posez une question...',
  'chat.thinking': 'Réflexion...',
  'chat.chips.job': 'Comment postuler à un emploi ?',
  'chat.chips.resources': 'C\'est quoi les Ressources ?',
  'chat.chips.mentor': 'Comment fonctionne le mentorat ?',
  'chat.chips.events': 'Comment trouver des événements ?',
  'chat.chips.cv': 'Donne-moi des conseils pour améliorer mon CV',
  'chat.newChat': 'Nouvelle discussion',
  'chat.history': 'Conversations',
  'chat.noConvos': 'Aucune conversation. Lancez une nouvelle discussion !',
  'chat.emptyTitle': 'Comment puis-je vous aider ?',
  'chat.emptySub': 'Posez-moi n\'importe quelle question — études, carrière, code, ou l\'utilisation d\'ESPRIT Connect.',
  'chat.disclaimer': 'L\'assistant IA peut faire des erreurs. Vérifiez les informations importantes.',
  'chat.stop': 'Arrêter la génération',
  'chat.send': 'Envoyer',
  'chat.regenerate': 'Régénérer',
  'chat.copy': 'Copier',
  'chat.copied': 'Copié !',
  'chat.deleteConvo': 'Supprimer la conversation',
  'chat.error': 'Désolé, je suis temporairement indisponible. Veuillez réessayer plus tard.',
  'chat.expand': 'Ouvrir le chat complet',
  'nav.assistant': 'Assistant IA',
  // ── Common shared ──
  'common.cancel': 'Annuler',
  'common.save': 'Enregistrer',
  'common.edit': 'Modifier',
  'common.delete': 'Supprimer',
  'common.create': 'Créer',
  'common.update': 'Mettre à jour',
  'common.loading': 'Chargement...',
  'common.saving': 'Enregistrement…',
  'common.previous': 'Précédent',
  'common.next': 'Suivant',
  'common.close': 'Fermer',
  'common.message': 'Message',
  'common.viewCv': 'Voir le CV',
  'common.apply': 'Postuler',
  'common.register': 'S\'inscrire',
  'common.join': 'Rejoindre',
  'common.all': 'Tout',
  'common.uploading': 'Envoi en cours…',
  'common.noResults': 'Aucun résultat',
  // ── Feed ──
  'feed.title': 'Fil d\'actu',
  'feed.subtitle': 'Ce qui se passe à ESPRIT',
  'feed.compose': 'Partagez quelque chose avec votre campus…',
  'feed.mindPlaceholder': 'À quoi pensez-vous ?',
  'feed.photo': 'Photo',
  'feed.media': 'Photo / Vidéo',
  'feed.publishing': 'Publication…',
  'feed.publish': 'Publier',
  'feed.sharedFrom': 'Partagé depuis',
  'feed.emptyTitle': 'Aucune publication',
  'feed.emptyDesc': 'Soyez le premier à partager quelque chose avec la communauté ESPRIT !',
  'feed.noComments': 'Pas encore de commentaires. Soyez le premier !',
  'feed.commentPlaceholder': 'Écrire un commentaire…',
  'feed.saveEdit': 'Enregistrer',
  'feed.share': 'Partager',
  'feed.reactLike': 'J\'aime',
  'feed.reactWow': 'Wow',
  'feed.reactAppreciate': 'Bravo',
  'feed.reactGg': 'GG',
  // ── Events ──
  'events.title': 'Événements & Clubs',
  'events.subtitle': 'Gérer les événements campus et les clubs étudiants',
  'events.newClub': 'Nouveau club',
  'events.closeClubForm': 'Fermer le formulaire',
  'events.createEvent': 'Créer un événement',
  'events.updateEvent': 'Modifier l\'événement',
  'events.createClub': 'Créer un club',
  'events.updateClub': 'Modifier le club',
  'events.titlePh': 'Titre',
  'events.descPh': 'Description',
  'events.locationPh': 'Lieu',
  'events.noClub': 'Aucun club',
  'events.clubNamePh': 'Nom du club',
  'events.logoUrlPh': 'URL du logo',
  'events.sectionEvents': 'Événements',
  'events.searchEvents': 'Rechercher des événements...',
  'events.allClubs': 'Tous les clubs',
  'events.noEvents': 'Aucun événement',
  'events.registered': 'inscrit(s)',
  'events.location': 'Lieu :',
  'events.club': 'Club :',
  'events.sectionClubs': 'Clubs',
  'events.searchClubs': 'Rechercher des clubs...',
  'events.members': 'membres',
  'events.clubBadge': 'Club',
  // ── Jobs ──
  'jobs.title': 'Offres d\'Emploi',
  'jobs.subtitle': 'Parcourez les stages, CDI, CDD et gérez vos candidatures',
  'jobs.createOffer': 'Créer une offre',
  'jobs.updateOffer': 'Modifier l\'offre',
  'jobs.findOpportunities': 'Trouver des opportunités',
  'jobs.findOpportunitiesDesc': 'Parcourez et postulez aux emplois ci-dessous. Joignez votre CV lors de votre candidature.',
  'jobs.requestMentoring': 'Demander un mentorat',
  'jobs.mentorIdPh': 'ID utilisateur mentor',
  'jobs.domainPh': 'Domaine (ex. Backend, Data Science)',
  'jobs.internship': 'Stage',
  'jobs.cdi': 'CDI — Permanent',
  'jobs.cdd': 'CDD — Durée déterminée',
  'jobs.postJob': 'Publier l\'offre',
  'jobs.sectionOffers': 'Offres d\'emploi',
  'jobs.searchJobs': 'Rechercher des emplois...',
  'jobs.allTypes': 'Tous types',
  'jobs.typeInternship': 'Stage',
  'jobs.typeCDI': 'CDI',
  'jobs.typeCDD': 'CDD',
  'jobs.noJobs': 'Aucune offre d\'emploi',
  'jobs.applicants': 'candidat(s)',
  'jobs.applications': 'Candidatures',
  'jobs.score': 'Score :',
  'jobs.analyzeCv': 'Analyser le CV',
  'jobs.analyzingCv': 'Analyse en cours...',
  'jobs.noApplications': 'Aucune candidature',
  'jobs.sectionMentoring': 'Mentorat',
  'jobs.noMentoring': 'Aucune relation de mentorat',
  'jobs.mentor': 'Mentor :',
  'jobs.mentee': 'Mentoré :',
  'jobs.sessions': 'sessions',
  'jobs.complete': 'Terminer',
  'jobs.mentorTab': 'En tant que Mentor',
  'jobs.menteeTab': 'En tant que Mentoré',
  'jobs.statusActive': 'Actif',
  'jobs.statusCompleted': 'Terminé',
  'jobs.statusCancelled': 'Annulé',
  'jobs.cancelMentoring': 'Annuler',
  'jobs.addSession': 'Ajouter une session',
  'jobs.sessionDate': 'Date & Heure',
  'jobs.sessionDuration': 'Durée (min)',
  'jobs.noSessions': 'Aucune session',
  'jobs.activeMentorings': 'Actifs',
  'jobs.plannedSessions': 'Sessions planifiées',
  'jobs.totalMentorings': 'Total',
  'jobs.browseMentors': 'Trouver un Mentor',
  'jobs.browseMentorsDesc': 'Parcourez les mentors disponibles, filtrez par spécialité et envoyez une demande',
  'jobs.filterSpeciality': 'Spécialité',
  'jobs.allSpecialities': 'Toutes les spécialités',
  'jobs.noMentorsAvailable': 'Aucun mentor disponible',
  'jobs.requestFromMentor': 'Demander un mentorat',
  'jobs.chooseDomain': 'Sujet / Domaine *',
  'jobs.sendRequest': 'Envoyer la demande',
  'jobs.mentorSpeciality': 'Spécialité :',
  'admin.mentorSection': 'Gestion des Mentors',
  'admin.addMentorRelation': 'Créer une relation de mentorat',
  'admin.mentorUserId': 'ID Mentor',
  'admin.menteeUserId': 'ID Mentoré',
  'admin.createMentoring': 'Créer',
  'admin.allMentorings': 'Toutes les relations de mentorat',
  'admin.noMentorings': 'Aucune relation de mentorat trouvée.',
  'jobs.applyFor': 'Postuler à :',
  'jobs.cvBanner': 'Joignez votre CV pour renforcer votre candidature. Les recruteurs peuvent l\'analyser avec l\'IA.',
  'jobs.cvLabel': 'CV / Lettre de motivation (PDF, optionnel)',
  'jobs.cvUploading': 'Envoi de votre CV...',
  'jobs.cvUploaded': '✓ CV envoyé avec succès',
  'jobs.uploadingCvBtn': 'Envoi du CV...',
  'jobs.submitApplication': 'Soumettre la candidature',
  'jobs.cvAnalysisTitle': 'Résultat d\'analyse du CV',
  'jobs.candidate': 'Candidat',
  'jobs.yrsExp': 'ans d\'exp.',
  'jobs.skillsDetected': 'Compétences détectées',
  'jobs.education': 'Formation',
  'jobs.languages': 'Langues',
  'jobs.saveScore': 'Sauvegarder le score',
  // ── Resources ──
  'res.title': 'Ressources',
  'res.subtitle': 'Matériaux éducatifs, articles, PDFs, vidéos et ressources carrière partagés par la communauté',
  'res.shareBtn': '+ Partager une ressource',
  'res.cancelBtn': '✕ Annuler',
  'res.editForm': '✏️ Modifier la ressource',
  'res.shareForm': '📤 Partager une ressource',
  'res.labelTitle': 'Titre *',
  'res.labelType': 'Type *',
  'res.labelCategory': 'Catégorie *',
  'res.labelDesc': 'Description',
  'res.labelUrl': 'URL / Lien',
  'res.labelTags': 'Tags',
  'res.tagsHint': 'séparés par des virgules',
  'res.titlePh': 'ex. Introduction à Spring Boot',
  'res.descPh': 'Décrivez brièvement ce que couvre cette ressource...',
  'res.uploadPdf': 'Télécharger un fichier PDF',
  'res.chooseFile': 'Choisir un fichier',
  'res.fileUploaded': '✓ Fichier envoyé avec succès',
  'res.update': 'Modifier la ressource',
  'res.share': 'Partager la ressource',
  'res.filterAll': 'Tout',
  'res.filterAcademic': '🎓 Académique',
  'res.filterCareer': '💼 Carrière',
  'res.filterTechnical': '⚙️ Technique',
  'res.filterSocial': '🤝 Social',
  'res.filterEvent': '📅 Événement',
  'res.allTypes': 'Tous types',
  'res.clearFilters': 'Effacer les filtres ✕',
  'res.loadingResources': 'Chargement des ressources…',
  'res.emptyTitle': 'Aucune ressource trouvée',
  'res.emptyFilterDesc': 'Essayez d\'ajuster vos filtres.',
  'res.emptyDesc': 'Soyez le premier à partager une ressource avec la communauté !',
  'res.liked': '♥ Aimé',
  'res.like': '♡ J\'aime',
  'res.open': 'Ouvrir ↗',
  'res.prevBtn': '← Précédent',
  'res.nextBtn': 'Suivant →',
  // ── Profile ──
  'profile.editProfile': 'Modifier le profil',
  'profile.editTitle': 'Modifier le profil',
  'profile.firstName': 'Prénom',
  'profile.lastName': 'Nom',
  'profile.email': 'E-mail',
  'profile.specialite': 'Spécialité',
  'profile.parcours': 'Parcours',
  'profile.promo': 'Promo',
  'profile.dept': 'Département / Spécialité',
  'profile.avatarUrl': 'URL de l\'avatar',
  'profile.noneOption': '-- Aucun --',
  'profile.saveChanges': 'Sauvegarder',
  'profile.invalidEmail': 'Format d\'e-mail invalide',
  'profile.accountDetails': 'Détails du compte',
  'profile.memberSince': 'Membre depuis',
  'profile.espritId': 'ID Esprit',
  'profile.cin': 'CIN',
  'profile.online': 'Actuellement en ligne',
  'profile.offline': 'Hors ligne',
  'profile.lastSeen': 'Dernière visite',
  'profile.uploadAvatar': 'Télécharger un avatar',
  'profile.chooseImage': 'Choisir une image',
  'profile.myPosts': 'Mes publications',
  'profile.loadingPosts': 'Chargement des publications...',
  'profile.noPosts': 'Aucune publication.',
  'profile.likes': 'j\'aime',
  'profile.comments': 'commentaires',
  'profile.view': 'voir',
  // ── Messages ──
  'msg.title': 'Messages',
  'msg.tabDirect': 'Direct',
  'msg.tabGroups': 'Groupes',
  'msg.searchPeople': 'Rechercher des personnes…',
  'msg.searching': 'Recherche…',
  'msg.noConversations': 'Aucune conversation',
  'msg.noGroups': 'Aucun groupe',
  'msg.newGroup': 'Nouveau groupe',
  'msg.emptyTitle': 'Vos Messages',
  'msg.emptyDesc': 'Sélectionnez une conversation ou recherchez une personne pour commencer à chatter.',
  'msg.active': 'Actif',
  'msg.members': 'membres',
  'msg.typePlaceholder': 'Écrire un message…',
  'msg.edited': 'modifié',
  'msg.saveEdit': 'Enregistrer',
  'msg.online': 'En ligne',
  'msg.groupInfo': 'Infos du groupe',
  'msg.addMember': 'Ajouter membre',
  'msg.leaveGroup': 'Quitter le groupe',
  'msg.groupName': 'Nom du groupe',
  'msg.addMembers': 'Ajouter des membres',
  'msg.createGroup': 'Créer le groupe',
  'msg.searchUser': 'Rechercher un utilisateur…',
  'msg.creating': 'Création…',
  'msg.deleteConv': 'Supprimer la conversation',
  // ── Admin ──
  'admin.title': 'Tableau de bord Admin',
  'admin.subtitle': 'Vue d\'ensemble de la plateforme et gestion des utilisateurs',
  'admin.users': 'utilisateurs',
  'admin.online': 'en ligne',
  'admin.noAccess': 'Accès réservé aux administrateurs.',
  'admin.userDirectory': 'Annuaire des utilisateurs',
  'admin.results': 'résultats',
  'admin.searchUsers': 'Rechercher nom, e-mail ou spécialité...',
  'admin.allRoles': 'Tous les rôles',
  'admin.students': 'Étudiants',
  'admin.alumni': 'Alumni',
  'admin.teachers': 'Enseignants',
  'admin.employees': 'Employés',
  'admin.companies': 'Entreprises',
  'admin.mentors': 'Mentors',
  'admin.admins': 'Admins',
  'admin.noUsers': 'Aucun utilisateur trouvé.',
  'admin.joined': 'Inscrit',
  'admin.feedTile': 'Fil d\'actu',
  'admin.feedDesc': 'Modérer les publications et commentaires.',
  'admin.eventsTile': 'Événements & Clubs',
  'admin.eventsDesc': 'Gérer les événements et inscriptions.',
  'admin.jobsTile': 'Emplois & Mentorat',
  'admin.jobsDesc': 'Suivre les offres et le mentorat.',
  'admin.pendingApprovals': 'Approbations d\'entreprises en attente',
  'admin.noPending': 'Aucune inscription en attente.',
  'admin.approve': 'Approuver',
  'admin.reject': 'Rejeter',
  'admin.refTable': 'Table de référence ESPRIT',
  'admin.refDesc': 'Correspondances EspritID ↔ CIN ↔ Rôle pour l\'inscription',
  'admin.refInfo': 'Seuls les utilisateurs dont l\'espritId + CIN correspond à une entrée ici peuvent s\'inscrire (sauf les entreprises).',
  'admin.addRef': 'Ajouter un utilisateur pré-autorisé',
  'admin.roleLabel': 'Rôle',
  'admin.addEntry': 'Ajouter',
  'admin.noRef': 'Aucune donnée de référence.',
  // ── RH Dashboard ──
  'rh.title': 'Tableau RH',
  'rh.tabAnalytics': '📊 Analytiques',
  'rh.tabJobs': '📋 Offres d\'emploi',
  'rh.myOffers': 'MES OFFRES',
  'rh.applicants': 'candidat(s)',
  'rh.hrAnalytics': 'Analytiques RH',
  'rh.analyticsDesc': 'Vue d\'ensemble de votre activité de recrutement',
  'rh.totalApps': 'Total des candidatures',
  'rh.avgScore': 'Score moyen de correspondance',
  'rh.acceptanceRate': 'Taux d\'acceptation',
  'rh.pendingReview': 'En attente de revue',
  'rh.appPerJob': 'Candidatures par offre',
  'rh.statusDist': 'Distribution des statuts',
  'rh.noData': 'Aucune donnée',
  'rh.accepted': 'Accepté',
  'rh.pending': 'En attente',
  'rh.rejected': 'Rejeté',
  'rh.scoreDist': 'Distribution des scores',
  'rh.jobOffers': 'Offres d\'emploi',
  'rh.jobOffersDesc': 'Créez et gérez vos offres d\'emploi',
  'rh.newOffer': '+ Nouvelle offre',
  'rh.cancelBtn': '✕ Annuler',
  'rh.editJobOffer': 'Modifier l\'offre',
  'rh.newJobOffer': 'Nouvelle offre d\'emploi',
  'rh.jobTitle': 'Titre du poste *',
  'rh.contractType': 'Type de contrat *',
  'rh.location': 'Lieu',
  'rh.description': 'Description *',
  'rh.requiredSkills': 'Compétences requises',
  'rh.skillsHint': '(appuyer sur Entrée pour ajouter)',
  'rh.titleRequired': 'Le titre est requis',
  'rh.descRequired': 'La description est requise',
  'rh.updateOffer': 'Modifier l\'offre',
  'rh.postJob': 'Publier l\'offre',
  'rh.backToOffers': '← Retour aux offres',
  'rh.rankCol': 'Rang',
  'rh.candidateCol': 'Candidat',
  'rh.cvQualityCol': 'Qualité CV',
  'rh.jobMatchCol': 'Adéquation',
  'rh.statusCol': 'Statut',
  'rh.actionsCol': 'Actions',
  'rh.analyzingCvs': 'Analyse des CVs…',
  'rh.noApplicants': 'Aucune candidature pour cette offre.',
  'rh.noJobsYet': 'Aucune offre. Créez votre première offre ci-dessus.',
  'rh.viewApplicants': 'Voir les candidats classés →',
  'rh.candidates': 'candidat(s)',
  'rh.contact': 'Contact',
  'rh.skillsSection': 'Compétences',
  'rh.missingSkills': 'Compétences manquantes',
  'rh.educSection': 'Formation',
  'rh.expSection': 'Expérience',
  'rh.yrsExpLabel': 'an(s) d\'expérience',
  'rh.languagesSection': 'Langues',
  'rh.noCv': 'Aucun CV téléchargé pour ce candidat.',
  'rh.cvPending': 'CV disponible mais analyse en attente.',
  'rh.analyzingDrawer': 'Analyse du CV…',
  'rh.analyzeNow': 'Analyser maintenant',
  'rh.acceptBtn': '✓ Accepter',
  'rh.rejectBtn': '✕ Rejeter',
  'rh.rankedByMatch': 'Classés par score',
  'rh.top': 'TOP',
  'rh.loadApplicantsError': 'Échec du chargement des candidats',
  'rh.updateStatusError': 'Échec de la mise à jour du statut',
  'rh.applicantAccepted': 'Candidat accepté',
  'rh.applicantRejected': 'Candidat rejeté',
  // ── PFE Books ──
  'pfe.title': '📚 Bibliothèque de PFE',
  'pfe.subtitle': 'Parcourez, consultez et téléchargez les rapports de PFE',
  'pfe.tabAll': 'Tous les livres',
  'pfe.tabPending': 'En attente d\'approbation',
  'pfe.noBooks': 'Aucun livre',
  'pfe.allReviewed': '✓ Toutes les soumissions examinées !',
  'pfe.approve': '✓ Approuver',
  'pfe.reject': '✕ Rejeter',
  'pfe.uploadTitle': '📤 Déposer un rapport PFE',
  'pfe.uploadDesc': 'Partagez le rapport PFE de votre entreprise avec les étudiants',
  'pfe.newBook': '+ Nouveau livre',
  'pfe.cancelBook': '✕ Annuler',
  'pfe.labelCompany': 'Nom de l\'entreprise *',
  'pfe.phCompany': 'Nom de votre entreprise & domaine',
  'pfe.formLabelDesc': 'Description *',
  'pfe.phDesc': 'Description du projet, technologies utilisées, durée...',
  'pfe.formLabelSpec': 'Spécialisation *',
  'pfe.submitApproval': 'Soumettre pour approbation',
  'pfe.searchPh': 'Rechercher...',
  'pfe.viewBtn': '👁️ Voir',
  'pfe.downloadBtn': '⬇️ Télécharger',
  'pfe.authorLabel': 'Auteur :',
  'pfe.yearLabel': 'Année :',
  'pfe.specLabel': 'Spécialisation :',
  'pfe.deptLabel': 'Département :',
  'pfe.sizeLabel': 'Taille :',
  'pfe.descLabel': 'Description :',
  'pfe.downloadsLabel': 'Téléchargements :',
  'pfe.viewsLabel': 'Vues :',
  'pfe.downloadPdf': 'Télécharger PDF',
  'pfe.uploadSuccess': 'Livre déposé avec succès !',
  'pfe.approvedSuccess': 'Livre approuvé !',
  'pfe.rejectedSuccess': 'Livre rejeté',
  'pfe.downloadedSuccess': 'Téléchargé : ',
};

export const TRANSLATIONS: Record<Lang, Translations> = { en, fr };
