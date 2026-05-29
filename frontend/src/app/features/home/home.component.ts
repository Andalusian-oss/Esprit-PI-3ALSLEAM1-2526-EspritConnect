import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-home',
  template: `
    <div class="lp-root" [class.lp-light]="isLight">

      <!-- ════════════════════ NAVBAR ════════════════════ -->
      <header class="lp-nav">
        <div class="lp-nav-inner">
          <div class="lp-brand">
            <div class="lp-logo"><span class="lp-logo-ec">EC</span></div>
            <span class="lp-brand-name">Esprit<span>Connect</span></span>
          </div>
          <div class="lp-nav-links">
            <!-- Language toggle -->
            <button class="lp-theme-btn" (click)="lang.toggle()" [title]="lang.current === 'fr' ? 'Switch to English' : 'Passer en français'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span class="lp-lang-label">{{ lang.current === 'fr' ? 'EN' : 'FR' }}</span>
            </button>
            <!-- Theme toggle -->
            <button class="lp-theme-btn" (click)="toggleTheme()" [title]="isLight ? 'Switch to dark mode' : 'Switch to light mode'">
              <svg *ngIf="!isLight" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              <svg *ngIf="isLight" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </button>
            <button class="lp-btn-ghost" (click)="router.navigate(['/auth/login'])">{{ lang.t('home.signIn') }}</button>
            <button class="lp-btn-primary" (click)="router.navigate(['/auth/register'])">{{ lang.t('home.getStarted') }}</button>
          </div>
        </div>
      </header>

      <!-- ════════════════════ HERO ════════════════════ -->
      <section class="lp-hero">
        <div class="lp-hero-glow g1"></div>
        <div class="lp-hero-glow g2"></div>
        <div class="lp-hero-inner">
          <div class="lp-hero-text">
            <p class="lp-welcome-label">{{ lang.t('home.welcome') }}</p>
            <h1 class="lp-hero-title">Esprit<span>Connect</span></h1>
            <p class="lp-hero-sub">{{ lang.t('home.heroSub') }}</p>
            <div class="lp-hero-btns">
              <button class="lp-btn-hero" (click)="router.navigate(['/auth/register'])">
                {{ lang.t('home.getStarted') }} <span class="lp-arrow">→</span>
              </button>
              <button class="lp-btn-ghost" (click)="router.navigate(['/auth/login'])">{{ lang.t('home.signIn') }}</button>
            </div>
          </div>
          <div class="lp-hero-cards">
            <div class="lp-hcard lp-hcard-a">
              <div class="lp-hcard-avatar" style="background:var(--red)">SA</div>
              <div class="lp-hcard-info">
                <div class="lp-skeleton w120"></div>
                <div class="lp-skeleton w80 dim"></div>
              </div>
              <span class="lp-badge green">Connected</span>
            </div>
            <div class="lp-hcard lp-hcard-b">
              <div class="lp-hcard-avatar" style="background:#2E7BB2">MK</div>
              <div class="lp-hcard-info">
                <div class="lp-skeleton w120"></div>
                <div class="lp-skeleton w80 dim"></div>
              </div>
              <span class="lp-badge blue">New Job</span>
            </div>
            <div class="lp-hcard lp-hcard-c">
              <div class="lp-hcard-avatar" style="background:#4B8026">RL</div>
              <div class="lp-hcard-info">
                <div class="lp-skeleton w120"></div>
                <div class="lp-skeleton w80 dim"></div>
              </div>
              <span class="lp-badge red">Event</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ════════════════════ VALUE PROPS ════════════════════ -->
      <section class="lp-values">
        <div class="lp-values-inner">

          <div class="lp-vcard">
            <div class="lp-vicon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3>{{ lang.t('home.reconnect.title') }}</h3>
            <p>{{ lang.t('home.reconnect.desc') }}</p>
          </div>

          <div class="lp-vcard">
            <div class="lp-vicon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                <line x1="12" y1="12" x2="12" y2="16"/>
                <line x1="10" y1="14" x2="14" y2="14"/>
              </svg>
            </div>
            <h3>{{ lang.t('home.hire.title') }}</h3>
            <p>{{ lang.t('home.hire.desc') }}</p>
          </div>

          <div class="lp-vcard">
            <div class="lp-vicon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <h3>{{ lang.t('home.network.title') }}</h3>
            <p>{{ lang.t('home.network.desc') }}</p>
          </div>

        </div>
      </section>

      <!-- ════════════════════ COMMUNITY ════════════════════ -->
      <section class="lp-community">
        <div class="lp-community-inner">
          <div class="lp-community-text">
            <span class="lp-tag">{{ lang.t('home.community.tag') }}</span>
            <h2>{{ lang.t('home.community.title') }}</h2>
            <p>{{ lang.t('home.community.desc') }}</p>
            <ul class="lp-feat-list">
              <li><span class="lp-feat-dot"></span><span>{{ lang.t('home.feat.feed') }}</span></li>
              <li><span class="lp-feat-dot"></span><span>{{ lang.t('home.feat.jobs') }}</span></li>
              <li><span class="lp-feat-dot"></span><span>{{ lang.t('home.feat.events') }}</span></li>
              <li><span class="lp-feat-dot"></span><span>{{ lang.t('home.feat.messages') }}</span></li>
              <li><span class="lp-feat-dot"></span><span>{{ lang.t('home.feat.resources') }}</span></li>
              <li><span class="lp-feat-dot"></span><span>{{ lang.t('home.feat.ai') }}</span></li>
            </ul>
            <button class="lp-btn-primary" style="margin-top:32px" (click)="router.navigate(['/auth/register'])">
              {{ lang.t('home.join') }}
            </button>
          </div>

          <div class="lp-community-visual">
            <div class="lp-feed-mock">
              <div class="lp-fm-row">
                <div class="lp-fm-avatar" style="background:var(--red)">SA</div>
                <div class="lp-fm-meta">
                  <div class="lp-skeleton w120"></div>
                  <div class="lp-skeleton w80 dim"></div>
                </div>
              </div>
              <div class="lp-fm-body">
                <div class="lp-skeleton w100"></div>
                <div class="lp-skeleton w90 dim"></div>
                <div class="lp-skeleton w70 dim"></div>
              </div>
              <div class="lp-fm-actions">
                <span>👍 24</span><span>💬 6</span><span>↗ Share</span>
              </div>

              <div class="lp-fm-divider"></div>

              <div class="lp-fm-row" style="justify-content:space-between">
                <div class="lp-fm-row" style="gap:10px">
                  <div class="lp-fm-avatar sm" style="background:#2E7BB2">FC</div>
                  <div>
                    <div class="lp-skeleton w100"></div>
                    <div class="lp-skeleton w60 dim"></div>
                  </div>
                </div>
                <span class="lp-badge blue">CDI</span>
              </div>

              <div class="lp-fm-divider"></div>

              <div class="lp-fm-row">
                <div class="lp-evt-date">
                  <div class="lp-evt-day">14</div>
                  <div class="lp-evt-mon">JUN</div>
                </div>
                <div style="flex:1">
                  <div class="lp-skeleton w110"></div>
                  <div class="lp-skeleton w70 dim"></div>
                </div>
                <span class="lp-badge green">Free</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ════════════════════ STATS ════════════════════ -->
      <section class="lp-stats">
        <div class="lp-stats-inner">
          <div class="lp-stat"><div class="lp-stat-num">8 000<span>+</span></div><div class="lp-stat-lbl">{{ lang.t('home.stats.members') }}</div></div>
          <div class="lp-stat-div"></div>
          <div class="lp-stat"><div class="lp-stat-num">300<span>+</span></div><div class="lp-stat-lbl">{{ lang.t('home.stats.jobs') }}</div></div>
          <div class="lp-stat-div"></div>
          <div class="lp-stat"><div class="lp-stat-num">80<span>+</span></div><div class="lp-stat-lbl">{{ lang.t('home.stats.events') }}</div></div>
          <div class="lp-stat-div"></div>
          <div class="lp-stat"><div class="lp-stat-num">150<span>+</span></div><div class="lp-stat-lbl">{{ lang.t('home.stats.companies') }}</div></div>
        </div>
      </section>

      <!-- ════════════════════ CTA ════════════════════ -->
      <section class="lp-cta">
        <div class="lp-cta-glow"></div>
        <div class="lp-cta-inner">
          <h2>{{ lang.t('home.cta.title') }}</h2>
          <p>{{ lang.t('home.cta.desc') }}</p>
          <div class="lp-cta-btns">
            <button class="lp-btn-hero" (click)="router.navigate(['/auth/register'])">
              {{ lang.t('home.cta.create') }} <span class="lp-arrow">→</span>
            </button>
            <button class="lp-btn-ghost" (click)="router.navigate(['/auth/login'])">{{ lang.t('home.signIn') }}</button>
          </div>
        </div>
      </section>

      <!-- ════════════════════ FOOTER ════════════════════ -->
      <footer class="lp-footer">
        <div class="lp-footer-inner">
          <div class="lp-brand">
            <div class="lp-logo"><span class="lp-logo-ec">EC</span></div>
            <span class="lp-brand-name">Esprit<span>Connect</span></span>
          </div>
          <p class="lp-footer-copy">{{ lang.t('home.footer.copy') }}</p>
        </div>
      </footer>

    </div>
  `,
  styles: [`
    /* ══════════════════════════════════
       BASE (dark mode default)
    ══════════════════════════════════ */
    .lp-root {
      min-height: 100vh;
      background: var(--dark);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      overflow-x: hidden;
      transition: background 0.3s ease, color 0.3s ease;
    }

    /* ══ Navbar ══ */
    .lp-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: rgba(13, 16, 23, 0.88);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border-bottom: 1px solid var(--border);
      transition: background 0.3s ease, border-color 0.3s ease;
    }
    .lp-nav-inner {
      max-width: 1180px; margin: 0 auto; padding: 0 32px;
      height: 68px; display: flex; align-items: center; justify-content: space-between;
    }
    .lp-brand { display: flex; align-items: center; gap: 12px; }
    .lp-logo {
      width: 36px; height: 36px; background: var(--red); border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
    }
    .lp-logo-ec { color: #fff; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 13px; }
    .lp-brand-name {
      font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: var(--text);
      span { color: var(--red); }
    }
    .lp-nav-links { display: flex; gap: 10px; align-items: center; }

    .lp-lang-label {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .lp-theme-btn {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-muted);
      width: auto;
      min-width: 38px;
      padding: 0 10px;
      height: 38px;
      border-radius: 9px;
      display: flex; align-items: center; justify-content: center; gap: 6px;
      cursor: pointer;
      transition: var(--transition);
      flex-shrink: 0;
    }
    .lp-theme-btn:hover {
      border-color: var(--red);
      color: var(--red);
      background: var(--red-glow);
    }

    .lp-btn-ghost {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text);
      padding: 9px 22px; border-radius: 8px; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: var(--transition);
    }
    .lp-btn-ghost:hover { border-color: var(--red); color: var(--red); }

    .lp-btn-primary {
      background: var(--red); color: #fff; border: none;
      padding: 9px 22px; border-radius: 8px; font-size: 14px; font-weight: 700;
      cursor: pointer; transition: var(--transition);
    }
    .lp-btn-primary:hover { opacity: .85; transform: translateY(-1px); }

    /* ══ Hero ══ */
    .lp-hero {
      position: relative; min-height: 100vh;
      display: flex; align-items: center;
      padding-top: 68px; overflow: hidden;
    }
    .lp-hero-glow {
      position: absolute; border-radius: 50%;
      filter: blur(100px); pointer-events: none;
      transition: opacity 0.4s ease;
    }
    .lp-hero-glow.g1 {
      width: 700px; height: 700px; top: -200px; left: -150px;
      background: radial-gradient(circle, rgba(225,29,46,.18), transparent 70%);
    }
    .lp-hero-glow.g2 {
      width: 500px; height: 500px; bottom: -100px; right: -100px;
      background: radial-gradient(circle, rgba(56,214,199,.12), transparent 70%);
    }
    .lp-hero-inner {
      position: relative; z-index: 1;
      max-width: 1180px; margin: 0 auto; padding: 80px 32px;
      display: flex; align-items: center; gap: 80px; width: 100%;
    }
    .lp-hero-text { flex: 1; }
    .lp-welcome-label {
      font-size: 12px; font-weight: 700; color: var(--red);
      text-transform: uppercase; letter-spacing: 3px; margin-bottom: 16px;
    }
    .lp-hero-title {
      font-family: 'Syne', sans-serif;
      font-size: clamp(52px, 8vw, 88px);
      font-weight: 800; line-height: 1;
      letter-spacing: -3px; margin-bottom: 24px;
      color: var(--text);
      span { color: var(--red); }
    }
    .lp-hero-sub {
      font-size: 17px; color: var(--text-muted); line-height: 1.75;
      max-width: 480px; margin-bottom: 40px;
    }
    .lp-hero-btns { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
    .lp-btn-hero {
      display: inline-flex; align-items: center; gap: 10px;
      background: var(--red); color: #fff; border: none;
      padding: 14px 32px; border-radius: 10px;
      font-size: 16px; font-weight: 700; cursor: pointer;
      box-shadow: var(--shadow-red); transition: var(--transition);
    }
    .lp-btn-hero:hover { opacity: .88; transform: translateY(-2px); }
    .lp-arrow { font-size: 18px; transition: transform .2s; }
    .lp-btn-hero:hover .lp-arrow { transform: translateX(4px); }

    /* ── Floating cards ── */
    .lp-hero-cards { flex: 1; display: flex; flex-direction: column; gap: 16px; }
    .lp-hcard {
      background: var(--dark2); border: 1px solid var(--border);
      border-radius: 14px; padding: 16px 20px;
      display: flex; align-items: center; gap: 14px;
      box-shadow: var(--shadow);
      transition: background 0.3s ease, border-color 0.3s ease;
    }
    .lp-hcard-a { margin-left: 32px; animation: floatA 3.5s ease-in-out infinite; }
    .lp-hcard-b { animation: floatB 4s ease-in-out infinite; }
    .lp-hcard-c { margin-left: 56px; animation: floatA 4.5s ease-in-out infinite; }
    @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
    .lp-hcard-avatar {
      width: 42px; height: 42px; border-radius: 50%; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 13px; flex-shrink: 0;
    }
    .lp-hcard-info { flex: 1; }

    /* ── Skeletons ── */
    .lp-skeleton { height: 10px; background: var(--dark3); border-radius: 4px; margin-bottom: 6px; transition: background 0.3s; }
    .lp-skeleton.dim { opacity: .5; }
    .lp-skeleton.w60  { width: 60%; }
    .lp-skeleton.w70  { width: 70%; }
    .lp-skeleton.w80  { width: 80%; }
    .lp-skeleton.w90  { width: 90%; }
    .lp-skeleton.w100 { width: 100%; }
    .lp-skeleton.w110 { width: 110px; }
    .lp-skeleton.w120 { width: 120px; }

    /* ── Badges ── */
    .lp-badge {
      font-size: 11px; font-weight: 700;
      padding: 4px 10px; border-radius: 20px;
      flex-shrink: 0; white-space: nowrap;
    }
    .lp-badge.green { background: rgba(61,220,132,.13); color: #3ddc84; }
    .lp-badge.blue  { background: rgba(33,150,243,.13); color: #2196f3; }
    .lp-badge.red   { background: var(--red-glow); color: var(--red-light); }

    /* ══ Values ══ */
    .lp-values {
      background: var(--dark2);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      transition: background 0.3s ease;
    }
    .lp-values-inner {
      max-width: 1180px; margin: 0 auto; padding: 80px 32px;
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px;
    }
    .lp-vicon {
      width: 52px; height: 52px; background: var(--red-glow); border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      color: var(--red); margin-bottom: 20px;
      svg { width: 24px; height: 24px; }
    }
    .lp-vcard h3 {
      font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700;
      margin-bottom: 12px; color: var(--text);
    }
    .lp-vcard p { font-size: 15px; color: var(--text-muted); line-height: 1.75; }

    /* ══ Community ══ */
    .lp-community {
      background: var(--dark);
      border-top: 1px solid var(--border);
      transition: background 0.3s ease;
    }
    .lp-community-inner {
      max-width: 1180px; margin: 0 auto; padding: 96px 32px;
      display: flex; align-items: center; gap: 80px;
    }
    .lp-community-text { flex: 1; }
    .lp-tag {
      display: inline-block; background: var(--red-glow); color: var(--red-light);
      border-radius: 20px; padding: 5px 14px;
      font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
      text-transform: uppercase; margin-bottom: 20px;
    }
    .lp-community-text h2 {
      font-family: 'Syne', sans-serif;
      font-size: clamp(28px, 4vw, 44px); font-weight: 800;
      letter-spacing: -1px; margin-bottom: 16px; color: var(--text);
    }
    .lp-community-text p { font-size: 16px; color: var(--text-muted); line-height: 1.75; margin-bottom: 24px; }
    .lp-feat-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 14px; }
    .lp-feat-list li {
      display: flex; align-items: flex-start; gap: 12px;
      font-size: 15px; color: var(--text-muted);
      strong { color: var(--text); }
    }
    .lp-feat-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--red); flex-shrink: 0; margin-top: 7px;
    }

    /* ── Feed mock ── */
    .lp-community-visual { flex: 1; display: flex; justify-content: flex-end; }
    .lp-feed-mock {
      background: var(--dark2); border: 1px solid var(--border);
      border-radius: 18px; padding: 24px;
      width: 100%; max-width: 360px; box-shadow: var(--shadow);
      transition: background 0.3s ease;
    }
    .lp-fm-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
    .lp-fm-avatar {
      width: 40px; height: 40px; border-radius: 50%; color: #fff;
      font-weight: 800; font-size: 13px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .lp-fm-avatar.sm { width: 32px; height: 32px; font-size: 11px; }
    .lp-fm-meta { flex: 1; }
    .lp-fm-body { margin-bottom: 14px; }
    .lp-fm-actions { display: flex; gap: 18px; font-size: 13px; color: var(--text-muted); font-weight: 600; }
    .lp-fm-divider { height: 1px; background: var(--border); margin: 16px 0; }
    .lp-evt-date { background: var(--red-glow); border-radius: 10px; padding: 8px 12px; text-align: center; flex-shrink: 0; }
    .lp-evt-day { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: var(--red); line-height: 1; }
    .lp-evt-mon { font-size: 10px; font-weight: 700; color: var(--red); letter-spacing: 1px; }

    /* ══ Stats ══ */
    .lp-stats {
      background: var(--dark2);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      transition: background 0.3s ease;
    }
    .lp-stats-inner {
      max-width: 1180px; margin: 0 auto; padding: 64px 32px;
      display: flex; align-items: center; justify-content: space-around;
      flex-wrap: wrap; gap: 32px;
    }
    .lp-stat { text-align: center; }
    .lp-stat-num {
      font-family: 'Syne', sans-serif; font-size: 52px; font-weight: 800;
      color: var(--text); letter-spacing: -2px; line-height: 1;
      span { color: var(--red); font-size: 36px; }
    }
    .lp-stat-lbl { font-size: 14px; color: var(--text-muted); margin-top: 6px; font-weight: 600; }
    .lp-stat-div { width: 1px; height: 64px; background: var(--border); }

    /* ══ CTA ══ */
    .lp-cta {
      position: relative;
      background: linear-gradient(135deg, rgba(225,29,46,.08), transparent);
      border-top: 1px solid rgba(225,29,46,.15); overflow: hidden;
      transition: background 0.3s ease;
    }
    .lp-cta-glow {
      position: absolute; width: 600px; height: 600px;
      top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: radial-gradient(circle, rgba(225,29,46,.12), transparent 70%);
      pointer-events: none;
    }
    .lp-cta-inner {
      position: relative; z-index: 1;
      max-width: 680px; margin: 0 auto; padding: 100px 32px; text-align: center;
      h2 {
        font-family: 'Syne', sans-serif;
        font-size: clamp(28px, 4vw, 44px); font-weight: 800;
        letter-spacing: -1px; margin-bottom: 16px; color: var(--text);
      }
      p { font-size: 17px; color: var(--text-muted); margin-bottom: 40px; line-height: 1.6; }
    }
    .lp-cta-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

    /* ══ Footer ══ */
    .lp-footer {
      background: var(--dark2);
      border-top: 1px solid var(--border);
      transition: background 0.3s ease;
    }
    .lp-footer-inner {
      max-width: 1180px; margin: 0 auto; padding: 32px;
      display: flex; align-items: center; justify-content: space-between;
      gap: 16px; flex-wrap: wrap;
    }
    .lp-footer-copy { font-size: 13px; color: var(--text-dim); }

    /* ══════════════════════════════════
       LIGHT MODE OVERRIDES
       Triggered by .lp-root.lp-light
    ══════════════════════════════════ */

    /* Root background: CSS variables handle most of this */
    .lp-root.lp-light {
      background: #f1f5fb;
      color: #0f172a;
    }

    /* Navbar — critical fix: was hardcoded dark */
    .lp-root.lp-light .lp-nav {
      background: rgba(241, 245, 251, 0.92);
      border-bottom-color: rgba(15, 23, 42, 0.1);
    }

    .lp-root.lp-light .lp-brand-name { color: #0f172a; }
    .lp-root.lp-light .lp-theme-btn { border-color: rgba(15,23,42,0.15); color: #475569; }
    .lp-root.lp-light .lp-theme-btn:hover { border-color: var(--red); color: var(--red); background: rgba(225,29,46,0.05); }
    .lp-root.lp-light .lp-btn-ghost { border-color: rgba(15,23,42,0.15); color: #0f172a; }
    .lp-root.lp-light .lp-btn-ghost:hover { border-color: var(--red); color: var(--red); }

    /* Hero glows — softer in light */
    .lp-root.lp-light .lp-hero-glow.g1 {
      background: radial-gradient(circle, rgba(225,29,46,.09), transparent 70%);
    }
    .lp-root.lp-light .lp-hero-glow.g2 {
      background: radial-gradient(circle, rgba(56,214,199,.08), transparent 70%);
    }

    /* Hero title */
    .lp-root.lp-light .lp-hero-title { color: #0f172a; }
    .lp-root.lp-light .lp-hero-sub { color: #475569; }

    /* Floating cards */
    .lp-root.lp-light .lp-hcard {
      background: #ffffff;
      border-color: rgba(15,23,42,0.09);
      box-shadow: 0 2px 8px rgba(15,23,42,0.07), 0 8px 24px rgba(15,23,42,0.05);
    }

    /* Skeletons */
    .lp-root.lp-light .lp-skeleton { background: #e2e8f0; }

    /* Badges */
    .lp-root.lp-light .lp-badge.green { background: rgba(5,150,105,0.1); color: #059669; }
    .lp-root.lp-light .lp-badge.blue  { background: rgba(37,99,235,0.1); color: #2563eb; }
    .lp-root.lp-light .lp-badge.red   { background: rgba(225,29,46,0.08); color: #dc2626; }

    /* Values section */
    .lp-root.lp-light .lp-values {
      background: #ffffff;
      border-color: rgba(15,23,42,0.09);
    }
    .lp-root.lp-light .lp-vcard h3 { color: #0f172a; }
    .lp-root.lp-light .lp-vcard p  { color: #475569; }
    .lp-root.lp-light .lp-vicon {
      background: rgba(225,29,46,0.07);
      box-shadow: 0 2px 8px rgba(225,29,46,0.08);
    }

    /* Community section */
    .lp-root.lp-light .lp-community { background: #f1f5fb; border-color: rgba(15,23,42,0.09); }
    .lp-root.lp-light .lp-community-text h2 { color: #0f172a; }
    .lp-root.lp-light .lp-community-text p  { color: #475569; }
    .lp-root.lp-light .lp-feat-list li { color: #475569; strong { color: #0f172a; } }
    .lp-root.lp-light .lp-tag {
      background: rgba(225,29,46,0.07);
      color: #dc2626;
      border: 1px solid rgba(225,29,46,0.15);
    }

    /* Feed mock card */
    .lp-root.lp-light .lp-feed-mock {
      background: #ffffff;
      border-color: rgba(15,23,42,0.09);
      box-shadow: 0 2px 12px rgba(15,23,42,0.07), 0 8px 32px rgba(15,23,42,0.05);
    }
    .lp-root.lp-light .lp-fm-actions { color: #64748b; }
    .lp-root.lp-light .lp-fm-divider { background: rgba(15,23,42,0.08); }

    /* Stats section */
    .lp-root.lp-light .lp-stats {
      background: #ffffff;
      border-color: rgba(15,23,42,0.09);
    }
    .lp-root.lp-light .lp-stat-num { color: #0f172a; }
    .lp-root.lp-light .lp-stat-lbl { color: #64748b; }
    .lp-root.lp-light .lp-stat-div { background: rgba(15,23,42,0.1); }

    /* CTA section */
    .lp-root.lp-light .lp-cta {
      background: linear-gradient(135deg, rgba(225,29,46,.05), transparent);
      border-top-color: rgba(225,29,46,.12);
    }
    .lp-root.lp-light .lp-cta-inner h2 { color: #0f172a; }
    .lp-root.lp-light .lp-cta-inner p  { color: #475569; }
    .lp-root.lp-light .lp-cta-glow {
      background: radial-gradient(circle, rgba(225,29,46,.07), transparent 70%);
    }

    /* Footer */
    .lp-root.lp-light .lp-footer { background: #ffffff; border-top-color: rgba(15,23,42,0.09); }
    .lp-root.lp-light .lp-footer-copy { color: #94a3b8; }

    /* ══ Responsive ══ */
    @media (max-width: 960px) {
      .lp-hero-inner { flex-direction: column; padding: 60px 24px 48px; gap: 48px; }
      .lp-hcard-a, .lp-hcard-c { margin-left: 0; }
      .lp-values-inner { grid-template-columns: 1fr; gap: 32px; padding: 64px 24px; }
      .lp-community-inner { flex-direction: column; gap: 48px; padding: 64px 24px; }
      .lp-community-visual { width: 100%; justify-content: center; }
      .lp-stats-inner { gap: 24px; }
      .lp-stat-div { display: none; }
      .lp-footer-inner { flex-direction: column; text-align: center; }
    }
    @media (max-width: 600px) {
      .lp-nav-inner { padding: 0 16px; }
      .lp-hero-inner { padding: 48px 16px 40px; }
      .lp-stats-inner { padding: 48px 16px; display: grid; grid-template-columns: 1fr 1fr; }
      .lp-cta-btns { flex-direction: column; align-items: stretch; }
      .lp-cta-inner { padding: 64px 16px; }
      .lp-btn-hero, .lp-hero-btns .lp-btn-ghost { justify-content: center; width: 100%; }
      .lp-hero-btns { flex-direction: column; }
    }
  `]
})
export class HomeComponent implements OnInit {
  isLight = false;

  constructor(public router: Router, private authService: AuthService, public lang: LanguageService) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/feed']);
    }
    this.isLight = localStorage.getItem('app-theme') === 'light';
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isLight = !this.isLight;
    localStorage.setItem('app-theme', this.isLight ? 'light' : 'dark');
    this.applyTheme();
  }

  private applyTheme(): void {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('light-theme', this.isLight);
    }
  }
}
