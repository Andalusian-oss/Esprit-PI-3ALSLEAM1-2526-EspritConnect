import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { JobService } from '../../core/services/job.service';
import { Mentoring } from '../../core/models/models';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface Stat { label: string; value: string | number; change?: string; trend?: 'up' | 'down' | 'neutral'; }
interface ChartBar { label: string; value: number; color?: string; }
interface TimeSeriesPoint { date: string; value: number; label?: string; }
interface Metric { title: string; current: number; previous: number; unit?: string; }

@Component({
  selector: 'app-statistics',
  template: `
    <div class="stats-dashboard">
      
      <!-- Header -->
      <div class="stats-header">
        <div>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <button class="btn-back" (click)="goBack()">← Back to Admin</button>
            <h1 style="margin: 0;">📊 Platform Analytics & Statistics</h1>
          </div>
          <p class="stats-subtitle">Comprehensive insights and metrics across EspritConnect</p>
        </div>
        <div class="stats-header-actions">
          <button class="btn-outline" (click)="refreshData()">
            <span class="icon">🔄</span> Refresh
          </button>
          <select class="time-range-select" [(ngModel)]="timeRange" (change)="onTimeRangeChange()">
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <!-- Key Performance Indicators -->
      <div class="kpi-grid">
        <div class="kpi-card" *ngFor="let kpi of mainKPIs">
          <div class="kpi-icon" [style.background]="kpi.color">{{ kpi.icon }}</div>
          <div class="kpi-content">
            <div class="kpi-label">{{ kpi.label }}</div>
            <div class="kpi-value">{{ kpi.value }}</div>
            <div class="kpi-change" [class.positive]="kpi.trend === 'up'" [class.negative]="kpi.trend === 'down'">
              <span class="trend-arrow">{{ kpi.trend === 'up' ? '↗' : kpi.trend === 'down' ? '↘' : '→' }}</span>
              {{ kpi.change }}
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="stats-grid">

        <!-- User Growth Chart -->
        <div class="stats-panel full-width">
          <h3>👥 User Growth Over Time</h3>
          <div class="chart-container">
            <div class="line-chart">
              <div class="chart-y-axis">
                <span>500</span>
                <span>400</span>
                <span>300</span>
                <span>200</span>
                <span>100</span>
                <span>0</span>
              </div>
              <div class="chart-plot">
                <div class="season-bands" aria-hidden="true">
                  <div class="season-band season-study" style="left: 0%; width: 41.67%;">Study Term</div>
                  <div class="season-band season-break" style="left: 41.67%; width: 25%;">Summer Break</div>
                  <div class="season-band season-study" style="left: 66.67%; width: 25%;">Study Term</div>
                  <div class="season-band season-break" style="left: 91.67%; width: 8.33%;">Holiday</div>
                </div>
                <div class="chart-frame" aria-hidden="true"></div>
                <svg class="chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="User growth chart">
                  <defs>
                    <linearGradient id="userGrowthArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#e31e24" stop-opacity="0.22"></stop>
                      <stop offset="100%" stop-color="#e31e24" stop-opacity="0.02"></stop>
                    </linearGradient>
                  </defs>
                  <path class="chart-area-fill" [attr.d]="userGrowthAreaPath"></path>
                  <path class="chart-area-line" [attr.d]="userGrowthLinePath"></path>
                  <circle
                    *ngFor="let p of userGrowthPlotPoints; let i = index"
                    class="chart-point"
                    [class.chart-point-peak]="i === userGrowthPeakIndex"
                    [class.chart-point-dip]="i === userGrowthDipIndex"
                    [attr.cx]="p.x"
                    [attr.cy]="p.y"
                    [attr.r]="i === userGrowthPeakIndex || i === userGrowthDipIndex ? 1.9 : 1.3"
                  >
                    <title>{{ p.label }}: {{ p.value }}</title>
                  </circle>
                </svg>
                <div class="chart-grid">
                  <div class="grid-line" *ngFor="let i of [0,1,2,3,4,5]"></div>
                </div>
                <div class="chart-x-labels">
                  <span *ngFor="let point of userGrowthData">{{ point.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Demographics -->
        <div class="stats-panel">
          <h3>👨‍🎓 User Demographics</h3>
          <div class="demo-stats">
            <div class="demo-item" *ngFor="let demo of demographics">
              <div class="demo-bar-wrap">
                <div class="demo-label">{{ demo.label }}</div>
                <div class="demo-bar">
                  <div class="demo-fill" [style.width.%]="demo.percentage" [style.background]="demo.color"></div>
                </div>
              </div>
              <div class="demo-value">{{ demo.value }} ({{ demo.percentage }}%)</div>
            </div>
          </div>
        </div>

        <!-- Active Users Real-time -->
        <div class="stats-panel">
          <h3>⚡ Real-time Activity</h3>
          <div class="realtime-metrics">
            <div class="realtime-big">
              <span class="pulse-dot"></span>
              <div class="realtime-number">{{ realtimeActive }}</div>
              <div class="realtime-label">Active Now</div>
            </div>
            <div class="realtime-list">
              <div class="realtime-item" *ngFor="let activity of recentActivity">
                <span class="activity-icon">{{ activity.icon }}</span>
                <span class="activity-text">{{ activity.text }}</span>
                <span class="activity-time">{{ activity.time }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Statistics -->
        <div class="stats-panel">
          <h3>📝 Content Overview</h3>
          <div class="content-grid">
            <div class="content-stat" *ngFor="let stat of contentStats">
              <div class="content-icon" [style.background]="stat.color">{{ stat.icon }}</div>
              <div class="content-number">{{ stat.count }}</div>
              <div class="content-label">{{ stat.label }}</div>
              <div class="content-trend" [class.up]="stat.trend > 0" [class.down]="stat.trend < 0">
                {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}% this week
              </div>
            </div>
          </div>
        </div>

        <!-- Engagement Metrics -->
        <div class="stats-panel">
          <h3>💬 Engagement Metrics</h3>
          <div class="engagement-list">
            <div class="engagement-item" *ngFor="let metric of engagementMetrics">
              <div class="engagement-header">
                <span class="engagement-title">{{ metric.title }}</span>
                <span class="engagement-value">{{ metric.value }}</span>
              </div>
              <div class="engagement-bar">
                <div class="engagement-fill" [style.width.%]="metric.percentage" [style.background]="metric.color"></div>
              </div>
              <div class="engagement-footer">
                <span class="engagement-avg">Avg: {{ metric.average }}</span>
                <span class="engagement-change" [class.positive]="metric.change > 0">
                  {{ metric.change > 0 ? '+' : '' }}{{ metric.change }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Events Analytics -->
        <div class="stats-panel">
          <h3>🎉 Events Analytics</h3>
          <div class="metric-cards">
            <div class="metric-card" *ngFor="let metric of eventMetrics">
              <div class="metric-label">{{ metric.label }}</div>
              <div class="metric-value">{{ metric.value }}</div>
              <div class="metric-bar">
                <div class="metric-bar-fill" [style.width.%]="metric.progress"></div>
              </div>
            </div>
          </div>
          <div class="chart-bars">
            <div class="bar-item" *ngFor="let bar of eventsByCategory">
              <div class="bar-label">{{ bar.label }}</div>
              <div class="bar-visual">
                <div class="bar-fill" [style.height.%]="bar.percentage" [style.background]="bar.color">
                  <span class="bar-value">{{ bar.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Jobs & Applications -->
        <div class="stats-panel">
          <h3>💼 Jobs & Recruitment</h3>
          <div class="job-stats-grid">
            <div class="job-stat-card">
              <div class="job-stat-number">{{ jobStats.totalJobs }}</div>
              <div class="job-stat-label">Active Jobs</div>
            </div>
            <div class="job-stat-card">
              <div class="job-stat-number">{{ jobStats.totalApplications }}</div>
              <div class="job-stat-label">Applications</div>
            </div>
            <div class="job-stat-card green">
              <div class="job-stat-number">{{ jobStats.acceptanceRate }}%</div>
              <div class="job-stat-label">Acceptance Rate</div>
            </div>
            <div class="job-stat-card blue">
              <div class="job-stat-number">{{ jobStats.avgMatchScore }}</div>
              <div class="job-stat-label">Avg Match Score</div>
            </div>
          </div>
          <div class="job-type-breakdown">
            <div class="job-type-item" *ngFor="let type of jobTypeBreakdown">
              <span class="job-type-label">{{ type.label }}</span>
              <div class="job-type-bar">
                <div class="job-type-fill" [style.width.%]="type.percentage"></div>
              </div>
              <span class="job-type-count">{{ type.count }}</span>
            </div>
          </div>
        </div>

        <!-- Top Content -->
        <div class="stats-panel">
          <h3>🔥 Trending & Top Content</h3>
          <div class="top-content-tabs">
            <button [class.active]="topContentTab === 'posts'" (click)="topContentTab = 'posts'">Posts</button>
            <button [class.active]="topContentTab === 'events'" (click)="topContentTab = 'events'">Events</button>
            <button [class.active]="topContentTab === 'jobs'" (click)="topContentTab = 'jobs'">Jobs</button>
          </div>
          <div class="top-content-list">
            <div class="top-content-item" *ngFor="let item of getTopContent(); let i = index">
              <div class="top-rank" [class.gold]="i === 0" [class.silver]="i === 1" [class.bronze]="i === 2">
                {{ i + 1 }}
              </div>
              <div class="top-content-info">
                <div class="top-content-title">{{ item.title }}</div>
                <div class="top-content-meta">{{ item.meta }}</div>
              </div>
              <div class="top-content-score">
                <span class="score-icon">{{ item.icon }}</span>
                {{ item.score }}
              </div>
            </div>
          </div>
        </div>

        <!-- Resources Analytics -->
        <div class="stats-panel">
          <h3>📚 Resources & Learning</h3>
          <div class="resource-stats">
            <div class="resource-circle">
              <svg viewBox="0 0 36 36" class="circular-chart">
                <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="circle" stroke-dasharray="75, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <text x="18" y="20.35" class="percentage">{{ resourceStats.downloadRate }}%</text>
              </svg>
              <div class="circle-label">Download Rate</div>
            </div>
            <div class="resource-details">
              <div class="resource-detail">
                <span class="resource-detail-label">Total Resources</span>
                <span class="resource-detail-value">{{ resourceStats.total }}</span>
              </div>
              <div class="resource-detail">
                <span class="resource-detail-label">Total Downloads</span>
                <span class="resource-detail-value">{{ resourceStats.downloads }}</span>
              </div>
              <div class="resource-detail">
                <span class="resource-detail-label">Avg Rating</span>
                <span class="resource-detail-value">⭐ {{ resourceStats.avgRating }}</span>
              </div>
              <div class="resource-detail">
                <span class="resource-detail-label">Most Popular Category</span>
                <span class="resource-detail-value">{{ resourceStats.topCategory }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Mentoring Analytics -->
        <div class="stats-panel">
          <h3>🎓 Mentoring Program</h3>
          <div class="mentoring-overview">
            <div class="mentoring-stat">
              <div class="mentoring-number">{{ mentoringStats.activeMentors }}</div>
              <div class="mentoring-label">Active Mentors</div>
            </div>
            <div class="mentoring-stat">
              <div class="mentoring-number">{{ mentoringStats.totalSessions }}</div>
              <div class="mentoring-label">Total Sessions</div>
            </div>
            <div class="mentoring-stat">
              <div class="mentoring-number">{{ mentoringStats.completed }}</div>
              <div class="mentoring-label">Completed</div>
            </div>
          </div>
          <div class="mentoring-domains" *ngIf="topMentoringDomains.length">
            <div class="domain-tag" *ngFor="let domain of topMentoringDomains" [style.font-size.px]="12 + domain.count / 2">
              {{ domain.name }} ({{ domain.count }})
            </div>
          </div>
        </div>

        <!-- Activity Heatmap -->
        <div class="stats-panel full-width">
          <h3>🔥 Activity Heatmap (Last 30 Days)</h3>
          <div class="heatmap">
            <div class="heatmap-row" *ngFor="let day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']">
              <span class="heatmap-label">{{ day }}</span>
              <div class="heatmap-cells">
                <div class="heatmap-cell" *ngFor="let cell of getHeatmapData(day)" 
                     [class.intensity-0]="cell === 0"
                     [class.intensity-1]="cell > 0 && cell <= 25"
                     [class.intensity-2]="cell > 25 && cell <= 50"
                     [class.intensity-3]="cell > 50 && cell <= 75"
                     [class.intensity-4]="cell > 75"
                     [title]="cell + ' activities'">
                </div>
              </div>
            </div>
          </div>
          <div class="heatmap-legend">
            <span>Less</span>
            <div class="legend-cell intensity-0"></div>
            <div class="legend-cell intensity-1"></div>
            <div class="legend-cell intensity-2"></div>
            <div class="legend-cell intensity-3"></div>
            <div class="legend-cell intensity-4"></div>
            <span>More</span>
          </div>
        </div>

        <!-- Performance Metrics -->
        <div class="stats-panel">
          <h3>⚙️ System Performance</h3>
          <div class="performance-metrics">
            <div class="perf-metric" *ngFor="let perf of performanceMetrics">
              <div class="perf-header">
                <span class="perf-label">{{ perf.label }}</span>
                <span class="perf-value" [class.good]="perf.status === 'good'" [class.warning]="perf.status === 'warning'">
                  {{ perf.value }}
                </span>
              </div>
              <div class="perf-bar">
                <div class="perf-fill" [style.width.%]="perf.percentage" 
                     [style.background]="perf.status === 'good' ? '#3ddc84' : '#ffb400'">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Geographic Distribution -->
        <div class="stats-panel">
          <h3>🌍 User Distribution</h3>
          <div class="geo-stats">
            <div class="geo-item" *ngFor="let geo of geographicData">
              <div class="geo-flag">{{ geo.flag }}</div>
              <div class="geo-info">
                <div class="geo-name">{{ geo.name }}</div>
                <div class="geo-bar">
                  <div class="geo-fill" [style.width.%]="geo.percentage"></div>
                </div>
              </div>
              <div class="geo-count">{{ geo.count }}</div>
            </div>
          </div>
        </div>

        <!-- Conversion Funnels -->
        <div class="stats-panel">
          <h3>📊 User Journey Funnel</h3>
          <div class="funnel">
            <div class="funnel-stage" *ngFor="let stage of conversionFunnel; let i = index" 
                 [style.width.%]="stage.percentage">
              <div class="funnel-label">{{ stage.label }}</div>
              <div class="funnel-value">{{ stage.value }} ({{ stage.percentage }}%)</div>
              <div class="funnel-conversion" *ngIf="i > 0">{{ stage.conversionRate }}% conversion</div>
            </div>
          </div>
        </div>

        <!-- Revenue/Impact Metrics (if applicable) -->
        <div class="stats-panel">
          <h3>💰 Platform Impact</h3>
          <div class="impact-cards">
            <div class="impact-card" *ngFor="let impact of impactMetrics">
              <div class="impact-icon">{{ impact.icon }}</div>
              <div class="impact-value">{{ impact.value }}</div>
              <div class="impact-label">{{ impact.label }}</div>
              <div class="impact-change" [class.up]="impact.trend === 'up'">
                {{ impact.trend === 'up' ? '↗' : '↘' }} {{ impact.change }}
              </div>
            </div>
          </div>
        </div>

        <!-- Predictions & Forecasts -->
        <div class="stats-panel full-width">
          <h3>🔮 Predictions & Forecasts</h3>
          <div class="predictions-grid">
            <div class="prediction-card" *ngFor="let pred of predictions">
              <div class="prediction-title">{{ pred.title }}</div>
              <div class="prediction-chart">
                <div class="prediction-bar" *ngFor="let bar of pred.data">
                  <div class="prediction-label">{{ bar.label }}</div>
                  <div class="prediction-visual">
                    <div class="prediction-actual" [style.width.%]="bar.actual"></div>
                    <div class="prediction-forecast" [style.width.%]="bar.forecast"></div>
                  </div>
                  <div class="prediction-values">
                    <span class="actual-val">{{ bar.actualValue }}</span>
                    <span class="forecast-val">→ {{ bar.forecastValue }}</span>
                  </div>
                </div>
              </div>
              <div class="prediction-confidence">
                Confidence: <strong>{{ pred.confidence }}%</strong>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer Stats -->
      <div class="stats-footer">
        <div class="footer-stat" *ngFor="let stat of footerStats">
          <span class="footer-icon">{{ stat.icon }}</span>
          <span class="footer-label">{{ stat.label }}:</span>
          <strong>{{ stat.value }}</strong>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .stats-dashboard { padding: 24px; max-width: 1600px; margin: 0 auto; }
    
    /* Header */
    .stats-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .stats-header h1 { margin: 0 0 8px; font-size: 32px; font-weight: 700; }
    .stats-subtitle { color: var(--text-muted); margin: 0; }
    .stats-header-actions { display: flex; gap: 12px; align-items: center; }
    .btn-back { padding: 6px 14px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text); cursor: pointer; font-size: 14px; transition: all 0.2s; }
    .btn-back:hover { background: var(--input-bg); border-color: var(--accent); color: var(--accent); }
    .btn-outline { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text); cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
    .btn-outline:hover { background: var(--input-bg); border-color: var(--accent); }
    .time-range-select { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--input-bg); color: var(--text); cursor: pointer; }

    /* KPI Cards */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .kpi-card { display: flex; gap: 16px; padding: 20px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; transition: transform 0.2s; }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
    .kpi-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; }
    .kpi-content { flex: 1; }
    .kpi-label { font-size: 13px; color: var(--text-muted); margin-bottom: 4px; }
    .kpi-value { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
    .kpi-change { font-size: 12px; display: flex; align-items: center; gap: 4px; }
    .kpi-change.positive { color: #3ddc84; }
    .kpi-change.negative { color: #e31e24; }
    .trend-arrow { font-size: 14px; }

    /* Stats Grid */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; }
    .stats-panel { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
    .stats-panel.full-width { grid-column: 1 / -1; }
    .stats-panel h3 { margin: 0 0 20px; font-size: 16px; font-weight: 600; }

    /* Line Chart */
    .chart-container { height: 280px; overflow: hidden; }
    .line-chart { display: flex; gap: 12px; height: 100%; overflow: hidden; }
    .chart-y-axis { display: flex; flex-direction: column; justify-content: space-between; font-size: 11px; color: var(--text-muted); padding: 10px 0; }
    .chart-plot { flex: 1; position: relative; height: 100%; overflow: hidden; }
    .chart-frame { position: absolute; inset: 10px 6px 28px 6px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.04); background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); z-index: 0; pointer-events: none; }
    .season-bands { position: absolute; left: 6px; right: 6px; top: 10px; bottom: 28px; z-index: 0; overflow: hidden; border-radius: 14px; }
    .season-band { position: absolute; top: 0; bottom: 0; font-size: 10px; color: var(--text-muted); display: flex; align-items: flex-start; justify-content: center; padding-top: 6px; letter-spacing: 0.3px; }
    .season-study { background: rgba(61, 220, 132, 0.06); }
    .season-break { background: rgba(227, 30, 36, 0.06); }
    .chart-svg { position: absolute; left: 6px; top: 10px; width: calc(100% - 12px); height: calc(100% - 38px); z-index: 3; display: block; overflow: hidden; }
    .chart-area-fill { fill: url(#userGrowthArea); }
    .chart-area-line { fill: none; stroke: #e31e24; stroke-width: 1.05; stroke-linecap: round; stroke-linejoin: round; filter: drop-shadow(0 1px 2px rgba(227, 30, 36, 0.18)); }
    .chart-point { fill: #e31e24; stroke: rgba(255,255,255,0.95); stroke-width: 0.45; }
    .chart-point-peak { fill: #3ddc84; }
    .chart-point-dip { fill: #ffb400; }
    .chart-grid { position: absolute; left: 6px; right: 6px; top: 10px; bottom: 28px; z-index: 1; display: flex; flex-direction: column; justify-content: space-between; pointer-events: none; }
    .grid-line { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent); }
    .chart-x-labels { position: absolute; bottom: 4px; left: 8px; right: 10px; display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); z-index: 4; pointer-events: none; }

    /* Demographics */
    .demo-stats { display: flex; flex-direction: column; gap: 16px; }
    .demo-item { display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center; }
    .demo-bar-wrap { display: flex; flex-direction: column; gap: 6px; }
    .demo-label { font-size: 13px; font-weight: 500; }
    .demo-bar { height: 24px; background: var(--input-bg); border-radius: 12px; overflow: hidden; }
    .demo-fill { height: 100%; border-radius: 12px; transition: width 0.5s; }
    .demo-value { font-size: 13px; font-weight: 600; white-space: nowrap; }

    /* Real-time Activity */
    .realtime-metrics { display: flex; flex-direction: column; gap: 20px; }
    .realtime-big { text-align: center; padding: 20px; background: var(--input-bg); border-radius: 12px; position: relative; }
    .pulse-dot { position: absolute; top: 20px; right: 20px; width: 12px; height: 12px; background: #3ddc84; border-radius: 50%; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }
    .realtime-number { font-size: 48px; font-weight: 700; color: #3ddc84; }
    .realtime-label { font-size: 13px; color: var(--text-muted); margin-top: 8px; }
    .realtime-list { display: flex; flex-direction: column; gap: 8px; }
    .realtime-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--input-bg); border-radius: 8px; font-size: 12px; }
    .activity-icon { font-size: 16px; }
    .activity-text { flex: 1; }
    .activity-time { color: var(--text-muted); font-size: 11px; }

    /* Content Stats */
    .content-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .content-stat { text-align: center; padding: 16px; background: var(--input-bg); border-radius: 12px; }
    .content-icon { width: 48px; height: 48px; margin: 0 auto 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .content-number { font-size: 32px; font-weight: 700; margin-bottom: 4px; }
    .content-label { font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }
    .content-trend { font-size: 11px; font-weight: 600; }
    .content-trend.up { color: #3ddc84; }
    .content-trend.down { color: #e31e24; }

    /* Engagement Metrics */
    .engagement-list { display: flex; flex-direction: column; gap: 20px; }
    .engagement-item { }
    .engagement-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .engagement-title { font-size: 14px; font-weight: 500; }
    .engagement-value { font-size: 18px; font-weight: 700; }
    .engagement-bar { height: 8px; background: var(--input-bg); border-radius: 4px; overflow: hidden; margin-bottom: 8px; }
    .engagement-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }
    .engagement-footer { display: flex; justify-content: space-between; font-size: 11px; }
    .engagement-avg { color: var(--text-muted); }
    .engagement-change { font-weight: 600; }
    .engagement-change.positive { color: #3ddc84; }

    /* Metric Cards */
    .metric-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; }
    .metric-card { padding: 12px; background: var(--input-bg); border-radius: 8px; }
    .metric-label { font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
    .metric-value { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
    .metric-bar { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
    .metric-bar-fill { height: 100%; background: var(--accent); }

    /* Chart Bars */
    .chart-bars { display: flex; justify-content: space-around; align-items: flex-end; height: 150px; gap: 8px; }
    .bar-item { flex: 1; display: flex; flex-direction: column; align-items: center; }
    .bar-label { font-size: 10px; color: var(--text-muted); margin-bottom: 8px; text-align: center; }
    .bar-visual { width: 100%; flex: 1; display: flex; align-items: flex-end; justify-content: center; }
    .bar-fill { width: 100%; border-radius: 4px 4px 0 0; display: flex; align-items: flex-start; justify-content: center; padding-top: 4px; transition: height 0.5s; }
    .bar-value { font-size: 11px; font-weight: 700; color: white; }

    /* Job Stats */
    .job-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; }
    .job-stat-card { padding: 16px; background: var(--input-bg); border-radius: 12px; text-align: center; border: 2px solid transparent; }
    .job-stat-card.green { border-color: #3ddc84; }
    .job-stat-card.blue { border-color: #38d6c7; }
    .job-stat-number { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
    .job-stat-label { font-size: 12px; color: var(--text-muted); }
    .job-type-breakdown { display: flex; flex-direction: column; gap: 12px; }
    .job-type-item { display: flex; align-items: center; gap: 12px; }
    .job-type-label { font-size: 13px; font-weight: 500; min-width: 60px; }
    .job-type-bar { flex: 1; height: 24px; background: var(--input-bg); border-radius: 12px; overflow: hidden; }
    .job-type-fill { height: 100%; background: linear-gradient(90deg, #e31e24, #ff6b6b); }
    .job-type-count { font-size: 13px; font-weight: 700; min-width: 40px; text-align: right; }

    /* Top Content */
    .top-content-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
    .top-content-tabs button { padding: 6px 12px; border: 1px solid var(--border); border-radius: 6px; background: transparent; color: var(--text); cursor: pointer; font-size: 12px; transition: all 0.2s; }
    .top-content-tabs button.active { background: var(--accent); border-color: var(--accent); color: white; }
    .top-content-list { display: flex; flex-direction: column; gap: 8px; }
    .top-content-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: var(--input-bg); border-radius: 8px; }
    .top-rank { width: 28px; height: 28px; border-radius: 50%; background: var(--border); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
    .top-rank.gold { background: linear-gradient(135deg, #ffd700, #ffed4e); color: #1a1a1a; }
    .top-rank.silver { background: linear-gradient(135deg, #c0c0c0, #e8e8e8); color: #1a1a1a; }
    .top-rank.bronze { background: linear-gradient(135deg, #cd7f32, #e9a865); color: #1a1a1a; }
    .top-content-info { flex: 1; min-width: 0; }
    .top-content-title { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .top-content-meta { font-size: 11px; color: var(--text-muted); }
    .top-content-score { font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 4px; }
    .score-icon { font-size: 16px; }

    /* Resources */
    .resource-stats { display: grid; grid-template-columns: 120px 1fr; gap: 20px; align-items: center; }
    .resource-circle { text-align: center; }
    .circular-chart { max-width: 120px; }
    .circle-bg { fill: none; stroke: var(--border); stroke-width: 3.8; }
    .circle { fill: none; stroke: #e31e24; stroke-width: 2.8; stroke-linecap: round; animation: progress 1s ease-out forwards; }
    @keyframes progress { 0% { stroke-dasharray: 0 100; } }
    .percentage { fill: var(--text); font-family: sans-serif; font-size: 0.5em; font-weight: 700; text-anchor: middle; }
    .circle-label { font-size: 11px; color: var(--text-muted); margin-top: 8px; }
    .resource-details { display: flex; flex-direction: column; gap: 12px; }
    .resource-detail { display: flex; justify-content: space-between; padding: 8px 12px; background: var(--input-bg); border-radius: 6px; }
    .resource-detail-label { font-size: 12px; color: var(--text-muted); }
    .resource-detail-value { font-size: 13px; font-weight: 600; }

    /* Mentoring */
    .mentoring-overview { display: flex; justify-content: space-around; margin-bottom: 20px; }
    .mentoring-stat { text-align: center; padding: 16px; background: var(--input-bg); border-radius: 12px; }
    .mentoring-number { font-size: 32px; font-weight: 700; color: var(--accent); margin-bottom: 4px; }
    .mentoring-label { font-size: 12px; color: var(--text-muted); }
    .mentoring-domains { display: flex; flex-wrap: wrap; gap: 8px; }
    .domain-tag { padding: 6px 12px; background: var(--input-bg); border: 1px solid var(--border); border-radius: 16px; font-size: 12px; font-weight: 500; }

    /* Heatmap */
    .heatmap { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
    .heatmap-row { display: flex; gap: 8px; align-items: center; }
    .heatmap-label { font-size: 11px; color: var(--text-muted); min-width: 32px; }
    .heatmap-cells { display: flex; gap: 3px; }
    .heatmap-cell { width: 16px; height: 16px; border-radius: 3px; cursor: pointer; }
    .heatmap-cell.intensity-0 { background: var(--input-bg); }
    .heatmap-cell.intensity-1 { background: rgba(227, 30, 36, 0.2); }
    .heatmap-cell.intensity-2 { background: rgba(227, 30, 36, 0.4); }
    .heatmap-cell.intensity-3 { background: rgba(227, 30, 36, 0.6); }
    .heatmap-cell.intensity-4 { background: rgba(227, 30, 36, 0.9); }
    .heatmap-legend { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-muted); }
    .legend-cell { width: 14px; height: 14px; border-radius: 2px; }

    /* Performance */
    .performance-metrics { display: flex; flex-direction: column; gap: 16px; }
    .perf-metric { }
    .perf-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .perf-label { font-size: 13px; }
    .perf-value { font-size: 16px; font-weight: 700; }
    .perf-value.good { color: #3ddc84; }
    .perf-value.warning { color: #ffb400; }
    .perf-bar { height: 6px; background: var(--input-bg); border-radius: 3px; overflow: hidden; }
    .perf-fill { height: 100%; transition: width 0.5s; }

    /* Geographic */
    .geo-stats { display: flex; flex-direction: column; gap: 12px; }
    .geo-item { display: flex; align-items: center; gap: 12px; }
    .geo-flag { font-size: 24px; width: 32px; text-align: center; }
    .geo-info { flex: 1; }
    .geo-name { font-size: 13px; font-weight: 500; margin-bottom: 4px; }
    .geo-bar { height: 20px; background: var(--input-bg); border-radius: 10px; overflow: hidden; }
    .geo-fill { height: 100%; background: linear-gradient(90deg, #e31e24, #ff6b6b); transition: width 0.5s; }
    .geo-count { font-size: 14px; font-weight: 700; min-width: 40px; text-align: right; }

    /* Funnel */
    .funnel { display: flex; flex-direction: column; gap: 8px; }
    .funnel-stage { padding: 16px; background: linear-gradient(90deg, rgba(227,30,36,0.1), rgba(227,30,36,0.05)); border-left: 4px solid var(--accent); border-radius: 8px; margin-left: auto; transition: all 0.5s; }
    .funnel-label { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
    .funnel-value { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
    .funnel-conversion { font-size: 11px; color: var(--text-muted); }

    /* Impact */
    .impact-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .impact-card { padding: 16px; background: var(--input-bg); border-radius: 12px; text-align: center; }
    .impact-icon { font-size: 32px; margin-bottom: 8px; }
    .impact-value { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    .impact-label { font-size: 11px; color: var(--text-muted); margin-bottom: 6px; }
    .impact-change { font-size: 12px; font-weight: 600; }
    .impact-change.up { color: #3ddc84; }

    /* Predictions */
    .predictions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .prediction-card { padding: 20px; background: var(--input-bg); border-radius: 12px; }
    .prediction-title { font-size: 14px; font-weight: 600; margin-bottom: 16px; }
    .prediction-chart { display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px; }
    .prediction-bar { display: flex; flex-direction: column; gap: 4px; }
    .prediction-label { font-size: 11px; color: var(--text-muted); }
    .prediction-visual { height: 24px; position: relative; background: var(--card-bg); border-radius: 4px; overflow: hidden; }
    .prediction-actual { position: absolute; height: 100%; background: rgba(227,30,36,0.4); }
    .prediction-forecast { position: absolute; height: 100%; background: rgba(61,220,132,0.4); border: 2px dashed rgba(61,220,132,0.8); }
    .prediction-values { display: flex; justify-content: space-between; font-size: 11px; }
    .actual-val { color: var(--accent); font-weight: 600; }
    .forecast-val { color: #3ddc84; font-weight: 600; }
    .prediction-confidence { font-size: 11px; color: var(--text-muted); text-align: right; }

    /* Footer */
    .stats-footer { margin-top: 32px; padding: 20px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; display: flex; flex-wrap: wrap; gap: 24px; justify-content: space-around; }
    .footer-stat { display: flex; align-items: center; gap: 8px; font-size: 13px; }
    .footer-icon { font-size: 18px; }
    .footer-label { color: var(--text-muted); }

    /* Responsive */
    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: 1fr; }
      .kpi-grid { grid-template-columns: 1fr; }
      .stats-header { flex-direction: column; gap: 16px; }
    }
  `]
})
export class StatisticsComponent implements OnInit {
  timeRange = '30d';
  topContentTab = 'posts';

  // Main KPIs
  mainKPIs = [
    { icon: '👥', label: 'Total Users', value: '2,847', change: '+12.5% from last month', trend: 'up' as const, color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { icon: '📝', label: 'Total Posts', value: '8,432', change: '+8.3% from last month', trend: 'up' as const, color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { icon: '💼', label: 'Active Jobs', value: '127', change: '-2.1% from last month', trend: 'down' as const, color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { icon: '🎉', label: 'Events This Month', value: '45', change: '+15.7% from last month', trend: 'up' as const, color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { icon: '⭐', label: 'Avg Engagement', value: '87%', change: '+3.2% from last month', trend: 'up' as const, color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { icon: '📚', label: 'Resources Shared', value: '1,234', change: '+22.4% from last month', trend: 'up' as const, color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }
  ];

  // User Growth Data
  userGrowthData = [
    { label: 'Jan', value: 220 },
    { label: 'Feb', value: 260 },
    { label: 'Mar', value: 315 },
    { label: 'Apr', value: 360 },
    { label: 'May', value: 400 },
    { label: 'Jun', value: 250 },
    { label: 'Jul', value: 120 },
    { label: 'Aug', value: 100 },
    { label: 'Sep', value: 340 },
    { label: 'Oct', value: 385 },
    { label: 'Nov', value: 405 },
    { label: 'Dec', value: 180 }
  ];
  userGrowthPlotPoints: Array<{ x: number; y: number; label: string; value: number }> = [];
  userGrowthLinePath = '';
  userGrowthAreaPath = '';
  userGrowthPeakIndex = -1;
  userGrowthDipIndex = -1;

  // Demographics
  demographics = [
    { label: 'Students', value: 1842, percentage: 64.7, color: '#667eea' },
    { label: 'Alumni', value: 512, percentage: 18.0, color: '#764ba2' },
    { label: 'Teachers', value: 243, percentage: 8.5, color: '#f093fb' },
    { label: 'Companies', value: 184, percentage: 6.5, color: '#4facfe' },
    { label: 'Mentors', value: 66, percentage: 2.3, color: '#43e97b' }
  ];

  // Real-time Activity
  realtimeActive = 342;
  recentActivity = [
    { icon: '📝', text: 'New post created in Technology', time: '2s ago' },
    { icon: '💼', text: 'Job application submitted', time: '12s ago' },
    { icon: '🎉', text: 'User registered for Tech Talk event', time: '28s ago' },
    { icon: '💬', text: 'New comment on trending post', time: '45s ago' },
    { icon: '👤', text: 'New user signed up', time: '1m ago' }
  ];

  // Content Stats
  contentStats = [
    { icon: '📰', label: 'Posts', count: 8432, trend: 8.3, color: '#f093fb' },
    { icon: '💼', label: 'Jobs', count: 127, trend: -2.1, color: '#4facfe' },
    { icon: '🎉', label: 'Events', count: 234, trend: 15.7, color: '#43e97b' },
    { icon: '📚', label: 'Resources', count: 1234, trend: 22.4, color: '#30cfd0' }
  ];

  // Engagement Metrics
  engagementMetrics = [
    { title: 'Post Likes', value: '24,567', percentage: 82, average: '2.9/post', change: 12.5, color: '#e31e24' },
    { title: 'Comments', value: '18,432', percentage: 73, average: '2.2/post', change: 8.7, color: '#667eea' },
    { title: 'Shares', value: '5,678', percentage: 45, average: '0.7/post', change: 15.2, color: '#43e97b' },
    { title: 'Event Registrations', value: '3,421', percentage: 91, average: '14.6/event', change: 18.9, color: '#f5576c' }
  ];

  // Event Metrics
  eventMetrics = [
    { label: 'Total Events', value: 234, progress: 78 },
    { label: 'Upcoming', value: 45, progress: 45 },
    { label: 'Completed', value: 189, progress: 95 },
    { label: 'Avg Attendance', value: '87%', progress: 87 }
  ];

  eventsByCategory = [
    { label: 'Tech', value: 89, percentage: 90, color: '#667eea' },
    { label: 'Career', value: 67, percentage: 67, color: '#4facfe' },
    { label: 'Social', value: 45, percentage: 45, color: '#43e97b' },
    { label: 'Sports', value: 23, percentage: 23, color: '#fa709a' },
    { label: 'Culture', value: 10, percentage: 10, color: '#f5576c' }
  ];

  // Job Stats
  jobStats = {
    totalJobs: 127,
    totalApplications: 2847,
    acceptanceRate: 24.5,
    avgMatchScore: 78.3
  };

  jobTypeBreakdown = [
    { label: 'Full-time', count: 67, percentage: 52.8 },
    { label: 'Internship', count: 38, percentage: 29.9 },
    { label: 'Part-time', count: 15, percentage: 11.8 },
    { label: 'Contract', count: 7, percentage: 5.5 }
  ];

  // Top Content
  topPosts = [
    { title: 'Introduction to Microservices Architecture', meta: 'By Ahmed Ben Salem • 342 likes', icon: '❤️', score: 342 },
    { title: 'Spring Boot Best Practices 2024', meta: 'By Sarah Khalil • 287 likes', icon: '❤️', score: 287 },
    { title: 'Career Tips for Fresh Graduates', meta: 'By Mohamed Trabelsi • 234 likes', icon: '❤️', score: 234 },
    { title: 'AI and Machine Learning Workshop Recap', meta: 'By Amina Gharbi • 198 likes', icon: '❤️', score: 198 },
    { title: 'Networking Strategies for Developers', meta: 'By Karim Mansour • 176 likes', icon: '❤️', score: 176 }
  ];

  topEvents = [
    { title: 'Tech Innovation Summit 2024', meta: '234 attendees', icon: '👥', score: 234 },
    { title: 'Career Fair Spring 2024', meta: '198 attendees', icon: '👥', score: 198 },
    { title: 'AI Workshop with Industry Experts', meta: '156 attendees', icon: '👥', score: 156 },
    { title: 'Startup Pitch Competition', meta: '142 attendees', icon: '👥', score: 142 },
    { title: 'Alumni Networking Night', meta: '127 attendees', icon: '👥', score: 127 }
  ];

  topJobs = [
    { title: 'Senior Full-Stack Developer', meta: '87 applications', icon: '📄', score: 87 },
    { title: 'Data Science Intern', meta: '76 applications', icon: '📄', score: 76 },
    { title: 'DevOps Engineer', meta: '65 applications', icon: '📄', score: 65 },
    { title: 'Frontend Developer (React)', meta: '54 applications', icon: '📄', score: 54 },
    { title: 'Product Manager', meta: '48 applications', icon: '📄', score: 48 }
  ];

  // Resource Stats
  resourceStats = {
    total: 1234,
    downloads: 8942,
    downloadRate: 75,
    avgRating: 4.3,
    topCategory: 'Programming'
  };

  // Mentoring Stats — loaded live from the backend (see loadMentoringStats)
  mentoringStats = {
    activeMentors: 0,
    totalSessions: 0,
    completed: 0
  };

  topMentoringDomains: { name: string; count: number }[] = [];

  // Performance Metrics
  performanceMetrics = [
    { label: 'API Response Time', value: '142ms', percentage: 92, status: 'good' },
    { label: 'Database Query Time', value: '38ms', percentage: 96, status: 'good' },
    { label: 'Page Load Time', value: '1.8s', percentage: 88, status: 'good' },
    { label: 'Error Rate', value: '0.03%', percentage: 99, status: 'good' },
    { label: 'Uptime', value: '99.97%', percentage: 99, status: 'good' }
  ];

  // Geographic Data
  geographicData = [
    { flag: '🇹🇳', name: 'Tunisia', count: 2145, percentage: 75.3 },
    { flag: '🇫🇷', name: 'France', count: 342, percentage: 12.0 },
    { flag: '🇩🇪', name: 'Germany', count: 156, percentage: 5.5 },
    { flag: '🇬🇧', name: 'United Kingdom', count: 98, percentage: 3.4 },
    { flag: '🇨🇦', name: 'Canada', count: 67, percentage: 2.4 },
    { flag: '🌍', name: 'Others', count: 39, percentage: 1.4 }
  ];

  // Conversion Funnel
  conversionFunnel = [
    { label: 'Visitors', value: 15420, percentage: 100, conversionRate: 0 },
    { label: 'Signed Up', value: 4628, percentage: 75, conversionRate: 30.0 },
    { label: 'Completed Profile', value: 2847, percentage: 60, conversionRate: 61.5 },
    { label: 'Posted Content', value: 1423, percentage: 45, conversionRate: 50.0 },
    { label: 'Active Users', value: 712, percentage: 30, conversionRate: 50.0 }
  ];

  // Impact Metrics
  impactMetrics = [
    { icon: '🤝', value: '4,283', label: 'Connections Made', trend: 'up' as const, change: '+18.2%' },
    { icon: '💡', value: '892', label: 'Projects Shared', trend: 'up' as const, change: '+24.7%' },
    { icon: '🎯', value: '1,247', label: 'Goals Achieved', trend: 'up' as const, change: '+12.8%' },
    { icon: '📈', value: '342', label: 'Hires Made', trend: 'up' as const, change: '+6.4%' }
  ];

  // Predictions
  predictions = [
    {
      title: 'User Growth Forecast',
      confidence: 87,
      data: [
        { label: 'Jul', actual: 75, actualValue: 425, forecast: 85, forecastValue: 485 },
        { label: 'Aug', actual: 0, actualValue: 0, forecast: 90, forecastValue: 540 },
        { label: 'Sep', actual: 0, actualValue: 0, forecast: 95, forecastValue: 610 }
      ]
    },
    {
      title: 'Event Attendance Projection',
      confidence: 92,
      data: [
        { label: 'Jul', actual: 70, actualValue: 42, forecast: 80, forecastValue: 48 },
        { label: 'Aug', actual: 0, actualValue: 0, forecast: 85, forecastValue: 51 },
        { label: 'Sep', actual: 0, actualValue: 0, forecast: 88, forecastValue: 53 }
      ]
    },
    {
      title: 'Job Application Trends',
      confidence: 78,
      data: [
        { label: 'Jul', actual: 82, actualValue: 2847, forecast: 88, forecastValue: 3100 },
        { label: 'Aug', actual: 0, actualValue: 0, forecast: 92, forecastValue: 3420 },
        { label: 'Sep', actual: 0, actualValue: 0, forecast: 95, forecastValue: 3680 }
      ]
    }
  ];

  // Footer Stats
  footerStats = [
    { icon: '📅', label: 'Platform Launch Date', value: 'Jan 15, 2023' },
    { icon: '🕐', label: 'Last Data Update', value: 'Just now' },
    { icon: '💾', label: 'Total Storage Used', value: '47.3 GB' },
    { icon: '🔄', label: 'API Calls (24h)', value: '1,247,382' },
    { icon: '🌐', label: 'Active Sessions', value: '342' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private languageService: LanguageService,
    private jobService: JobService
  ) {}

  ngOnInit(): void {
    this.updateUserGrowthPlot();
    this.refreshData();
    this.loadMentoringStats();
  }

  /** Pull every mentoring relationship and derive the real mentoring KPIs + top domains. */
  private loadMentoringStats(): void {
    this.jobService.getAllMentorings()
      .pipe(catchError(() => of([] as Mentoring[])))
      .subscribe(mentorings => {
        const activeMentorIds = new Set(
          mentorings.filter(m => m.statut === 'ACTIVE').map(m => m.mentorUserId)
        );
        this.mentoringStats = {
          activeMentors: activeMentorIds.size,
          totalSessions: mentorings.reduce((sum, m) => sum + (m.sessionCount || 0), 0),
          completed: mentorings.filter(m => m.statut === 'COMPLETED').length
        };

        // Top domains by relationship count (descending), capped at 6.
        const counts = new Map<string, number>();
        mentorings.forEach(m => {
          const d = (m.domaine || '').trim();
          if (d) counts.set(d, (counts.get(d) || 0) + 1);
        });
        this.topMentoringDomains = [...counts.entries()]
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);
      });
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }

  refreshData(): void {
    // Simulate data refresh
    console.log('Refreshing statistics data for timeRange:', this.timeRange);
    // In a real app, this would call API endpoints to fetch updated data
    this.updateUserGrowthPlot();
  }

  onTimeRangeChange(): void {
    this.refreshData();
  }

  getTopContent(): any[] {
    switch (this.topContentTab) {
      case 'posts': return this.topPosts;
      case 'events': return this.topEvents;
      case 'jobs': return this.topJobs;
      default: return this.topPosts;
    }
  }

  getHeatmapData(day: string): number[] {
    // Generate mock heatmap data (30 days)
    const data: number[] = [];
    for (let i = 0; i < 30; i++) {
      // Simulate varying activity levels
      const baseActivity = Math.random() * 100;
      const dayFactor = ['Sat', 'Sun'].includes(day) ? 0.6 : 1.0;
      data.push(Math.floor(baseActivity * dayFactor));
    }
    return data;
  }

  private updateUserGrowthPlot(): void {
    const maxValue = Math.max(...this.userGrowthData.map(p => p.value), 1);
    const lastIndex = Math.max(this.userGrowthData.length - 1, 1);
    const leftPad = 6;
    const rightPad = 96;
    const topPad = 12;
    const bottomPad = 88;

    this.userGrowthPlotPoints = this.userGrowthData.map((point, idx) => {
      const x = leftPad + (idx / lastIndex) * (rightPad - leftPad);
      const y = bottomPad - (point.value / maxValue) * (bottomPad - topPad);
      return {
        label: point.label,
        value: point.value,
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2))
      };
    });

    this.userGrowthPeakIndex = this.userGrowthData.reduce((bestIdx, current, idx, arr) =>
      current.value > arr[bestIdx].value ? idx : bestIdx, 0);
    this.userGrowthDipIndex = this.userGrowthData.reduce((bestIdx, current, idx, arr) =>
      current.value < arr[bestIdx].value ? idx : bestIdx, 0);

    this.userGrowthLinePath = this.buildSmoothPath(this.userGrowthPlotPoints);

    if (this.userGrowthPlotPoints.length > 1) {
      const first = this.userGrowthPlotPoints[0];
      const last = this.userGrowthPlotPoints[this.userGrowthPlotPoints.length - 1];
      this.userGrowthAreaPath = `${this.userGrowthLinePath} L ${last.x} 92 L ${first.x} 92 Z`;
    } else {
      this.userGrowthAreaPath = '';
    }
  }

  private buildSmoothPath(points: Array<{ x: number; y: number }>): string {
    if (!points.length) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const dx = curr.x - prev.x;
      const cp1x = Number((prev.x + dx * 0.34).toFixed(2));
      const cp2x = Number((curr.x - dx * 0.34).toFixed(2));
      d += ` C ${cp1x} ${prev.y} ${cp2x} ${curr.y} ${curr.x} ${curr.y}`;
    }
    return d;
  }
}