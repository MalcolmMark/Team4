import { useState, useRef, useEffect } from 'react'
import {
  Shield, Network, AlertTriangle, FileText, BarChart2, Building2,
  BookOpen, Unlock, ClipboardList, TrendingUp, Code2, Users,
  Settings, Bell, Search, ChevronDown, LogOut, HelpCircle,
  CheckCircle, XCircle, Clock, Eye, EyeOff, RefreshCw, Plus,
  Filter, Download, Upload, ChevronRight, ArrowLeft, ArrowRight,
  Activity, Zap, Globe, Lock, Key, Webhook, Copy, RotateCcw,
  Terminal, Phone, MessageSquare, Send, X, MoreHorizontal,
  ArrowUp, ArrowDown, Minus, Info, Edit2, Trash2, UserPlus,
  AlertCircle, CheckSquare, Circle, Radio, ToggleRight,
  Calendar, MapPin, ExternalLink, Layers
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
  AreaChart, Area
} from 'recharts'

// ─── Types ──────────────────────────────────────────────────────────────────

type Screen =
  | 'login' | 'mfa'
  | 'bou-dashboard' | 'institution-dashboard'
  | 'alerts' | 'alert-detail'
  | 'incidents' | 'submit-intel'
  | 'fraud-network' | 'institutions' | 'institution-detail'
  | 'indicator-catalogue' | 'disclosure-requests'
  | 'audit-logs' | 'reports' | 'api-integrations'
  | 'users-roles' | 'ussd-simulator' | 'design-system' | 'settings'

type Role = 'bou-officer' | 'institution-admin' | 'fraud-analyst' | 'fraud-supervisor' | 'compliance-auditor'

interface AppState {
  screen: Screen
  role: Role
  institution: string
  user: string
  previousScreen?: Screen
}

// ─── Sample Data ─────────────────────────────────────────────────────────────

const MOBILE_MONEY_PROVIDERS = [
  'MTN Mobile Money Uganda Limited',
  'Airtel Mobile Commerce Uganda Limited',
]

const FINANCIAL_INSTITUTIONS = [
  'Stanbic Bank Uganda Limited',
  'Centenary Rural Development Bank Limited',
  'DFCU Bank Limited',
  'Equity Bank Uganda Limited',
  'Absa Bank Uganda Limited',
  'KCB Bank Uganda Limited',
  'Housing Finance Bank Limited',
  'Finance Trust Bank Limited',
]

const fraudTrendData = [
  { date: 'Jun 11', reports: 28 }, { date: 'Jun 13', reports: 34 }, { date: 'Jun 15', reports: 41 },
  { date: 'Jun 17', reports: 29 }, { date: 'Jun 19', reports: 52 }, { date: 'Jun 21', reports: 48 },
  { date: 'Jun 23', reports: 37 }, { date: 'Jun 25', reports: 63 }, { date: 'Jun 27', reports: 71 },
  { date: 'Jun 29', reports: 58 }, { date: 'Jul 1', reports: 44 }, { date: 'Jul 3', reports: 82 },
  { date: 'Jul 5', reports: 76 }, { date: 'Jul 7', reports: 91 }, { date: 'Jul 9', reports: 68 },
  { date: 'Jul 11', reports: 85 },
]

const riskLevelData = [
  { name: 'Low', value: 312, color: '#198754' },
  { name: 'Medium', value: 487, color: '#D97706' },
  { name: 'High', value: 298, color: '#C62828' },
  { name: 'Critical', value: 64, color: '#8B0000' },
]

const fraudTypeData = [
  { type: 'Account Takeover', count: 287 },
  { type: 'SIM-Swap', count: 214 },
  { type: 'Social Engineering', count: 178 },
  { type: 'Rapid Transfer', count: 156 },
  { type: 'Suspicious Funds', count: 134 },
  { type: 'Device Reuse', count: 98 },
]

const matchByWeek = [
  { week: 'W24', matches: 42 }, { week: 'W25', matches: 67 }, { week: 'W26', matches: 58 },
  { week: 'W27', matches: 89 }, { week: 'W28', matches: 124 },
]

const institutionPerf = [
  { name: 'MTN MoMo', responseTime: 1.4, confirmed: 87 },
  { name: 'Airtel Money', responseTime: 2.1, confirmed: 74 },
  { name: 'Stanbic Bank', responseTime: 3.2, confirmed: 91 },
  { name: 'Centenary Bank', responseTime: 1.8, confirmed: 82 },
]

const confirmedVsUnconfirmed = [
  { month: 'May', confirmed: 148, unconfirmed: 62 },
  { month: 'Jun', confirmed: 187, unconfirmed: 89 },
  { month: 'Jul', confirmed: 94, unconfirmed: 41 },
]

const SAMPLE_ALERTS = [
  { ref: 'ALT-2026-00891', risk: 'Critical', type: 'Account Takeover', matchReason: 'Exact protected reference match', indicators: 3, institutions: 2, generatedAt: '2026-07-11 14:32', analyst: 'A. Nakato', status: 'Under Investigation' },
  { ref: 'ALT-2026-00890', risk: 'High', type: 'SIM-Swap Abuse', matchReason: 'Device reuse across cases', indicators: 2, institutions: 2, generatedAt: '2026-07-11 12:18', analyst: 'B. Okonkwo', status: 'New' },
  { ref: 'ALT-2026-00889', risk: 'High', type: 'Rapid Transfer', matchReason: 'Time-based correlation', indicators: 4, institutions: 3, generatedAt: '2026-07-11 09:44', analyst: 'C. Ssali', status: 'Acknowledged' },
  { ref: 'ALT-2026-00888', risk: 'Medium', type: 'Social Engineering', matchReason: 'Shared indicator code', indicators: 2, institutions: 2, generatedAt: '2026-07-10 17:55', analyst: 'A. Nakato', status: 'Confirmed' },
  { ref: 'ALT-2026-00887', risk: 'Critical', type: 'SIM-Swap Abuse', matchReason: 'Exact protected reference match', indicators: 5, institutions: 4, generatedAt: '2026-07-10 14:23', analyst: 'D. Mwanga', status: 'Escalated' },
  { ref: 'ALT-2026-00886', risk: 'Low', type: 'Device Reuse', matchReason: 'Inferred relationship', indicators: 1, institutions: 2, generatedAt: '2026-07-10 11:12', analyst: 'B. Okonkwo', status: 'Resolved' },
]

const SAMPLE_INCIDENTS = [
  { ref: 'FL-UG-2026-000245', institution: 'MTN Mobile Money Uganda Limited', type: 'Account Takeover', risk: 'High', protectedRef: 'SUBJ_8F92A7B4C91D4E16', detectedAt: '2026-07-11 14:28', status: 'Under Investigation', matchStatus: 'Matched', analyst: 'A. Nakato' },
  { ref: 'FL-UG-2026-000244', institution: 'Airtel Mobile Commerce Uganda Limited', type: 'Suspicious Incoming Funds', risk: 'High', protectedRef: 'SUBJ_8F92A7B4C91D4E16', detectedAt: '2026-07-11 13:45', status: 'Under Investigation', matchStatus: 'Matched', analyst: 'B. Okonkwo' },
  { ref: 'FL-UG-2026-000243', institution: 'Stanbic Bank Uganda Limited', type: 'SIM-Swap Abuse', risk: 'Critical', protectedRef: 'SUBJ_3D41F89CA2B5E720', detectedAt: '2026-07-11 11:30', status: 'Confirmed', matchStatus: 'Matched', analyst: 'C. Ssali' },
  { ref: 'FL-UG-2026-000242', institution: 'Centenary Rural Development Bank Limited', type: 'Social Engineering', risk: 'Medium', protectedRef: 'SUBJ_71A23CD8F9E4B652', detectedAt: '2026-07-10 16:22', status: 'Triaged', matchStatus: 'No Match', analyst: 'D. Mwanga' },
  { ref: 'FL-UG-2026-000241', institution: 'MTN Mobile Money Uganda Limited', type: 'Rapid Transfer', risk: 'High', protectedRef: 'SUBJ_A91B3CF7D5E28049', detectedAt: '2026-07-10 14:08', status: 'Confirmed', matchStatus: 'Matched', analyst: 'A. Nakato' },
]

const SAMPLE_INSTITUTIONS_TABLE = [
  { name: 'MTN Mobile Money Uganda Limited', type: 'Payment Service Provider', regStatus: 'Active', platformStatus: 'Connected', apiConn: 'Online', lastSub: '2026-07-11 14:28', indicators: 4821, matches: 312, alerts: 28, compliance: 'Compliant', users: 14 },
  { name: 'Airtel Mobile Commerce Uganda Limited', type: 'Payment Service Provider', regStatus: 'Active', platformStatus: 'Connected', apiConn: 'Online', lastSub: '2026-07-11 13:45', indicators: 3104, matches: 247, alerts: 19, compliance: 'Compliant', users: 11 },
  { name: 'Stanbic Bank Uganda Limited', type: 'Commercial Bank', regStatus: 'Active', platformStatus: 'Connected', apiConn: 'Online', lastSub: '2026-07-11 09:12', indicators: 2847, matches: 198, alerts: 12, compliance: 'Under Review', users: 18 },
  { name: 'Centenary Rural Development Bank Limited', type: 'Commercial Bank', regStatus: 'Active', platformStatus: 'Connected', apiConn: 'Degraded', lastSub: '2026-07-11 07:44', indicators: 1708, matches: 112, alerts: 5, compliance: 'Compliant', users: 8 },
]

const AUDIT_LOGS = [
  { ts: '2026-07-11 14:33', user: 'A. Nakato', institution: 'MTN Mobile Money Uganda Limited', role: 'Fraud Analyst', action: 'Status Changed', resource: 'Alert', ref: 'ALT-2026-00891', ip: '196.216.14.22', result: 'Success', reason: 'Assigned to investigation team' },
  { ts: '2026-07-11 14:32', user: 'System', institution: 'Platform', role: 'System', action: 'Match Generated', resource: 'Alert', ref: 'ALT-2026-00891', ip: 'internal', result: 'Success', reason: 'Cross-institution reference match' },
  { ts: '2026-07-11 13:46', user: 'B. Okonkwo', institution: 'Airtel Mobile Commerce Uganda Limited', role: 'Fraud Analyst', action: 'Fraud Submission', resource: 'Incident', ref: 'FL-UG-2026-000244', ip: '197.239.18.11', result: 'Success', reason: 'Suspicious incoming funds detected' },
  { ts: '2026-07-11 14:29', user: 'K. Namukasa', institution: 'MTN Mobile Money Uganda Limited', role: 'Fraud Analyst', action: 'Fraud Submission', resource: 'Incident', ref: 'FL-UG-2026-000245', ip: '196.216.14.31', result: 'Success', reason: 'Account takeover detected' },
  { ts: '2026-07-11 14:28', user: 'K. Namukasa', institution: 'MTN Mobile Money Uganda Limited', role: 'Fraud Analyst', action: 'Login', resource: 'Session', ref: 'SES-2026-88412', ip: '196.216.14.31', result: 'Success', reason: 'MFA verified' },
  { ts: '2026-07-11 13:12', user: 'J. Ochieng', institution: 'Bank of Uganda', role: 'BoU Officer', action: 'Record Viewed', resource: 'Alert', ref: 'ALT-2026-00887', ip: '41.222.184.10', result: 'Success', reason: 'Oversight review' },
]

const INDICATOR_CATALOGUE = [
  { code: 'ACCOUNT_TAKEOVER', name: 'Account Takeover', definition: 'Indicators suggesting unauthorized access to a customer account', severity: 'High', version: '1.2', approvalDate: '2025-03-15', status: 'Active', approvedBy: 'Bank of Uganda' },
  { code: 'SIM_SWAP_SUSPECTED', name: 'SIM Swap Suspected', definition: 'Behavioural indicators consistent with SIM swap activity', severity: 'Critical', version: '1.1', approvalDate: '2025-03-15', status: 'Active', approvedBy: 'Bank of Uganda' },
  { code: 'RAPID_MULTI_WALLET_TRANSFER', name: 'Rapid Multi-Wallet Transfer', definition: 'Unusually rapid sequential transfers across multiple wallet accounts', severity: 'High', version: '1.0', approvalDate: '2025-03-15', status: 'Active', approvedBy: 'Bank of Uganda' },
  { code: 'SOCIAL_ENGINEERING_REPORTED', name: 'Social Engineering Reported', definition: 'Customer or institution-reported social engineering attempt', severity: 'Medium', version: '1.0', approvalDate: '2025-03-15', status: 'Active', approvedBy: 'Bank of Uganda' },
  { code: 'REPEATED_FAILED_PIN_ACTIVITY', name: 'Repeated Failed PIN Activity', definition: 'Multiple consecutive PIN failures within a short window', severity: 'Medium', version: '1.0', approvalDate: '2025-03-15', status: 'Active', approvedBy: 'Bank of Uganda' },
  { code: 'SUSPICIOUS_INCOMING_FUNDS', name: 'Suspicious Incoming Funds', definition: 'Funds received from sources flagged in other fraud incidents', severity: 'High', version: '1.0', approvalDate: '2025-03-15', status: 'Active', approvedBy: 'Bank of Uganda' },
  { code: 'DEVICE_REUSE_ACROSS_CASES', name: 'Device Reuse Across Cases', definition: 'The same device reference appears in multiple fraud incidents', severity: 'High', version: '1.1', approvalDate: '2025-04-02', status: 'Active', approvedBy: 'Bank of Uganda' },
  { code: 'NEW_SIM_HIGH_VALUE_TRANSFER', name: 'New SIM High-Value Transfer', definition: 'High-value transfer executed shortly after SIM registration', severity: 'Critical', version: '1.0', approvalDate: '2025-03-15', status: 'Active', approvedBy: 'Bank of Uganda' },
  { code: 'MULTIPLE_ACCOUNTS_ONE_DEVICE', name: 'Multiple Accounts One Device', definition: 'Multiple wallet accounts linked to a single device reference', severity: 'Medium', version: '1.0', approvalDate: '2025-03-15', status: 'Active', approvedBy: 'Bank of Uganda' },
  { code: 'RAPID_CASH_OUT', name: 'Rapid Cash Out', definition: 'Rapid withdrawal or agent cash-out following suspicious inbound transfer', severity: 'High', version: '1.0', approvalDate: '2025-03-15', status: 'Active', approvedBy: 'Bank of Uganda' },
]

const USERS_TABLE = [
  { name: 'Aisha Nakato', email: 'a.nakato@mtn.co.ug', institution: 'MTN Mobile Money Uganda Limited', role: 'Fraud Analyst', mfa: 'Enabled', status: 'Active', lastLogin: '2026-07-11 14:28', createdAt: '2025-06-12' },
  { name: 'Bernard Okonkwo', email: 'b.okonkwo@airtel.co.ug', institution: 'Airtel Mobile Commerce Uganda Limited', role: 'Fraud Analyst', mfa: 'Enabled', status: 'Active', lastLogin: '2026-07-11 13:46', createdAt: '2025-07-03' },
  { name: 'Catherine Ssali', email: 'c.ssali@stanbic.com', institution: 'Stanbic Bank Uganda Limited', role: 'Fraud Supervisor', mfa: 'Enabled', status: 'Active', lastLogin: '2026-07-11 09:12', createdAt: '2025-05-28' },
  { name: 'Daniel Mwanga', email: 'd.mwanga@centenarybank.co.ug', institution: 'Centenary Rural Development Bank Limited', role: 'Fraud Analyst', mfa: 'Disabled', status: 'Active', lastLogin: '2026-07-10 16:22', createdAt: '2025-08-14' },
  { name: 'Joy Ochieng', email: 'j.ochieng@bou.go.ug', institution: 'Bank of Uganda', role: 'BoU Officer', mfa: 'Enabled', status: 'Active', lastLogin: '2026-07-11 13:12', createdAt: '2025-04-01' },
  { name: 'Kevin Namukasa', email: 'k.namukasa@mtn.co.ug', institution: 'MTN Mobile Money Uganda Limited', role: 'Institution Admin', mfa: 'Enabled', status: 'Active', lastLogin: '2026-07-11 14:29', createdAt: '2025-06-12' },
]

// ─── Logo ─────────────────────────────────────────────────────────────────────

function MFLLogo({ size = 32, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2L4 9v10c0 9.4 6.8 18.2 16 20.4C30.2 37.2 37 28.4 37 19V9L20 2z" fill="#0F938A" fillOpacity="0.15" stroke="#0F938A" strokeWidth="1.5"/>
        <circle cx="20" cy="19" r="4" fill="#0F938A"/>
        <circle cx="11" cy="14" r="2.5" fill="#FFFFFF" fillOpacity="0.8"/>
        <circle cx="29" cy="14" r="2.5" fill="#FFFFFF" fillOpacity="0.8"/>
        <circle cx="11" cy="26" r="2.5" fill="#FFFFFF" fillOpacity="0.8"/>
        <circle cx="29" cy="26" r="2.5" fill="#FFFFFF" fillOpacity="0.8"/>
        <line x1="13.2" y1="15.4" x2="17.5" y2="17.8" stroke="#0F938A" strokeWidth="1.2"/>
        <line x1="26.8" y1="15.4" x2="22.5" y2="17.8" stroke="#0F938A" strokeWidth="1.2"/>
        <line x1="13.2" y1="24.6" x2="17.5" y2="21.8" stroke="#0F938A" strokeWidth="1.2"/>
        <line x1="26.8" y1="24.6" x2="22.5" y2="21.8" stroke="#0F938A" strokeWidth="1.2"/>
        <text x="20" y="23" textAnchor="middle" fontSize="7" fontWeight="700" fill="#FFFFFF" fontFamily="Manrope, sans-serif">MFL</text>
      </svg>
      {showText && (
        <div>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 15, color: '#FFFFFF', lineHeight: 1.1 }}>MoMo FraudLink</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#89b0c8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Uganda</div>
        </div>
      )}
    </div>
  )
}

// ─── Risk / Status Badge Helpers ─────────────────────────────────────────────

function RiskBadge({ level }: { level: string }) {
  const cls = level.toLowerCase() === 'critical' ? 'risk-critical'
    : level.toLowerCase() === 'high' ? 'risk-high'
    : level.toLowerCase() === 'medium' ? 'risk-medium'
    : 'risk-low'
  return <span className={`risk-badge ${cls}`}>{level}</span>
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase().replace(/\s+/g, '-')
  const cls = s.includes('investigation') ? 'status-investigating'
    : s.includes('new') ? 'status-new'
    : s.includes('acknowledged') ? 'status-acknowledged'
    : s.includes('escalated') ? 'status-escalated'
    : s.includes('confirmed') ? 'status-confirmed'
    : s.includes('resolved') ? 'status-resolved'
    : s.includes('withdrawn') ? 'status-withdrawn'
    : 'status-new'
  return <span className={`status-badge ${cls}`}>{status}</span>
}

function ApiStatusDot({ status }: { status: string }) {
  const color = status === 'Online' ? '#198754' : status === 'Degraded' ? '#D97706' : '#C62828'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, color }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} className={status === 'Online' ? 'pulse-dot' : ''} />
      {status}
    </span>
  )
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, icon: Icon, color = '#0F938A', delta }: {
  label: string; value: string | number; sub?: string; icon?: any; color?: string; delta?: string
}) {
  return (
    <div className="metric-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        {Icon && <div style={{ width: 34, height: 34, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={17} color={color} /></div>}
      </div>
      <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: '#12324A', lineHeight: 1 }}>{value}</div>
      {(sub || delta) && (
        <div style={{ marginTop: 6, fontSize: 12, color: '#667085' }}>
          {delta && <span style={{ color: delta.startsWith('+') ? '#198754' : '#C62828', fontWeight: 600, marginRight: 4 }}>{delta}</span>}
          {sub}
        </div>
      )}
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#12324A', margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13.5, color: '#667085', margin: '4px 0 0' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{actions}</div>}
    </div>
  )
}

// ─── Login Screen ────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (role: Role, inst: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [institution, setInstitution] = useState('MTN Mobile Money Uganda Limited')
  const [isBoU, setIsBoU] = useState(false)
  const [role, setRole] = useState<Role>('fraud-analyst')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(role, isBoU ? 'Bank of Uganda' : institution)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F5F7FA' }}>
      {/* Left panel */}
      <div style={{ flex: '0 0 480px', background: '#12324A', display: 'flex', flexDirection: 'column', padding: '48px 52px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(15,147,138,0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <MFLLogo size={40} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: 48 }}>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.25, marginBottom: 16 }}>
            Secure Fraud Intelligence Sharing Framework
          </div>
          <div style={{ fontSize: 14, color: '#89b0c8', lineHeight: 1.7, marginBottom: 40 }}>
            A regulated platform for authorised institutions to share protected fraud indicators, identify cross-institution patterns, and coordinate investigations.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: Shield, text: 'Privacy-preserving indicator exchange' },
              { icon: Network, text: 'Cross-institution fraud matching' },
              { icon: Lock, text: 'Controlled identity disclosure workflow' },
              { icon: ClipboardList, text: 'Full audit trail for every action' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(15,147,138,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} color="#0F938A" />
                </div>
                <span style={{ fontSize: 13.5, color: '#c8dde8' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, fontSize: 11.5, color: '#667085' }}>
          Prototype for Uganda's regulated financial ecosystem · Demonstration environment
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 800, color: '#12324A', margin: '0 0 6px' }}>Sign in to your account</h2>
            <p style={{ fontSize: 13.5, color: '#667085', margin: 0 }}>Demonstration access for authorised-user workflows.</p>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: '#e8eef3', borderRadius: 8, padding: 4 }}>
            <button
              onClick={() => setIsBoU(false)}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: !isBoU ? '#FFFFFF' : 'transparent', color: !isBoU ? '#12324A' : '#667085', boxShadow: !isBoU ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}
            >Service Provider Login</button>
            <button
              onClick={() => { setIsBoU(true); setRole('bou-officer') }}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: isBoU ? '#FFFFFF' : 'transparent', color: isBoU ? '#12324A' : '#667085', boxShadow: isBoU ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}
            >Bank of Uganda</button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {!isBoU && (
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Service Provider or Financial Institution</label>
                <select className="input-field" value={institution} onChange={e => setInstitution(e.target.value)}>
                  <optgroup label="Mobile Money and Payment Service Providers">
                    {MOBILE_MONEY_PROVIDERS.map(i => <option key={i} value={i}>{i}</option>)}
                  </optgroup>
                  <optgroup label="Bank of Uganda-Regulated Financial Institutions">
                    {FINANCIAL_INSTITUTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                  </optgroup>
                </select>
              </div>
            )}
            {!isBoU && (
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Role (Demo)</label>
                <select className="input-field" value={role} onChange={e => setRole(e.target.value as Role)}>
                  <option value="fraud-analyst">Fraud Analyst</option>
                  <option value="fraud-supervisor">Fraud Supervisor</option>
                  <option value="institution-admin">Institution Administrator</option>
                  <option value="compliance-auditor">Compliance Auditor</option>
                </select>
              </div>
            )}
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Email address</label>
              <input className="input-field" type="email" placeholder={isBoU ? 'officer@bou.go.ug' : 'analyst@institution.ug'} value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input-field" type={showPass ? 'text' : 'password'} placeholder="••••••••" style={{ paddingRight: 42 }} value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#667085', padding: 0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#667085', cursor: 'pointer' }}>
                <input type="checkbox" /> Remember this device
              </label>
              <button type="button" style={{ fontSize: 13, color: '#0F938A', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Forgot password?</button>
            </div>
            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '11px 18px', fontSize: 14, marginTop: 4 }}>
              <Lock size={15} /> Sign in
            </button>
          </form>

          <div style={{ marginTop: 24, padding: 14, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, display: 'flex', gap: 10 }}>
            <AlertTriangle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
              <strong>Prototype only.</strong> Institution names and user accounts are demonstration data and do not represent live integrations or endorsements.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MFA Screen ──────────────────────────────────────────────────────────────

function MFAScreen({ onVerify }: { onVerify: () => void }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(118)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  const handleInput = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[i] = val; setOtp(next)
    if (val && i < 5) inputs.current[i + 1]?.focus()
    if (next.every(d => d !== '') && next.join('').length === 6) setTimeout(onVerify, 400)
  }

  const mins = Math.floor(countdown / 60)
  const secs = countdown % 60

  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 420, background: '#FFFFFF', border: '1px solid #D9E1E8', borderRadius: 12, padding: '40px 48px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(15,147,138,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Shield size={26} color="#0F938A" />
          </div>
          <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 800, color: '#12324A', margin: '0 0 6px' }}>Two-Factor Verification</h2>
          <p style={{ fontSize: 13.5, color: '#667085', margin: 0 }}>Enter the 6-digit code sent to your registered device.</p>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
          {otp.map((d, i) => (
            <input
              key={i}
              ref={el => { inputs.current[i] = el }}
              type="text" inputMode="numeric" maxLength={1} value={d}
              onChange={e => handleInput(i, e.target.value)}
              onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) { inputs.current[i - 1]?.focus(); const n = [...otp]; n[i - 1] = ''; setOtp(n) } }}
              style={{ width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', border: '2px solid', borderColor: d ? '#0F938A' : '#D9E1E8', borderRadius: 8, outline: 'none', color: '#12324A', background: d ? 'rgba(15,147,138,0.04)' : '#FFFFFF' }}
            />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: '#667085' }}>Code expires in </span>
          <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono', fontWeight: 600, color: countdown < 30 ? '#C62828' : '#12324A' }}>
            {mins}:{String(secs).padStart(2, '0')}
          </span>
        </div>

        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px 18px' }} onClick={onVerify}>
          Verify & Sign In
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16, textAlign: 'center' }}>
          <button style={{ fontSize: 13, color: '#0F938A', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
            <RefreshCw size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />Resend code
          </button>
          <button style={{ fontSize: 13, color: '#667085', background: 'none', border: 'none', cursor: 'pointer' }}>
            Use backup code
          </button>
          <button style={{ fontSize: 12, color: '#667085', background: 'none', border: 'none', cursor: 'pointer' }}>
            Contact security support
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Top Bar ─────────────────────────────────────────────────────────────────

function TopBar({ appState, onNavigate }: { appState: AppState; onNavigate: (s: Screen) => void }) {
  const [notifOpen, setNotifOpen] = useState(false)

  const roleLabel: Record<Role, string> = {
    'bou-officer': 'BoU Oversight Officer',
    'institution-admin': 'Institution Administrator',
    'fraud-analyst': 'Fraud Analyst',
    'fraud-supervisor': 'Fraud Supervisor',
    'compliance-auditor': 'Compliance Auditor',
  }

  return (
    <div style={{ height: 56, background: '#FFFFFF', borderBottom: '1px solid #D9E1E8', display: 'flex', alignItems: 'center', paddingInline: 20, gap: 12, flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }}>
      <div style={{ flex: 1, position: 'relative', maxWidth: 380 }}>
        <Search size={15} color="#667085" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input placeholder="Search incidents, alerts, references…" style={{ width: '100%', paddingLeft: 34, paddingRight: 12, paddingBlock: 7, border: '1px solid #D9E1E8', borderRadius: 6, fontSize: 13, fontFamily: 'Inter', color: '#12324A', outline: 'none', background: '#F5F7FA' }} />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', border: '1px solid #D9E1E8', borderRadius: 6, background: '#F5F7FA', fontSize: 12, color: '#667085' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#198754' }} className="pulse-dot" />
          All Systems Operational
        </div>

        <div style={{ position: 'relative' }}>
          <button onClick={() => setNotifOpen(!notifOpen)} style={{ width: 36, height: 36, borderRadius: 6, background: notifOpen ? '#F5F7FA' : 'transparent', border: '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
            <Bell size={17} color="#667085" />
            <span style={{ position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: '50%', background: '#C62828', border: '2px solid #FFFFFF' }} />
          </button>
          {notifOpen && (
            <div style={{ position: 'absolute', right: 0, top: 44, width: 320, background: '#FFFFFF', border: '1px solid #D9E1E8', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #D9E1E8', fontFamily: 'Manrope', fontWeight: 700, fontSize: 13, color: '#12324A' }}>Notifications</div>
              {[
                { title: 'Critical alert generated', sub: 'ALT-2026-00891 — Cross-institution match', time: '2 min ago', dot: '#8B0000' },
                { title: 'Case assigned to you', sub: 'FL-UG-2026-000245', time: '18 min ago', dot: '#0F938A' },
                { title: 'Disclosure request approved', sub: 'DIS-2026-00041', time: '1h ago', dot: '#198754' },
              ].map((n, i) => (
                <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid #f0f4f8', display: 'flex', gap: 10, cursor: 'pointer' }} className="table-row">
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: n.dot, flexShrink: 0, marginTop: 5 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#12324A' }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: '#667085', marginTop: 2 }}>{n.sub}</div>
                    <div style={{ fontSize: 11, color: '#a3b4c0', marginTop: 2 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button style={{ width: 36, height: 36, borderRadius: 6, background: 'transparent', border: '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <HelpCircle size={17} color="#667085" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', border: '1px solid #D9E1E8', marginLeft: 4 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#12324A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#FFFFFF' }}>
            {appState.user.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', lineHeight: 1.2 }}>{appState.user}</div>
            <div style={{ fontSize: 10.5, color: '#667085', lineHeight: 1.2 }}>{roleLabel[appState.role]}</div>
          </div>
          <ChevronDown size={13} color="#667085" />
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ appState, onNavigate, onLogout }: {
  appState: AppState;
  onNavigate: (s: Screen) => void;
  onLogout: () => void;
}) {
  const { screen, role } = appState

  const allItems = [
    { id: 'bou-dashboard', label: 'National Overview', icon: BarChart2, roles: ['bou-officer'] },
    { id: 'institution-dashboard', label: 'Overview', icon: BarChart2, roles: ['institution-admin', 'fraud-analyst', 'fraud-supervisor', 'compliance-auditor'] },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, roles: ['fraud-analyst', 'fraud-supervisor', 'bou-officer', 'institution-admin'] },
    { id: 'incidents', label: 'Incidents', icon: FileText, roles: ['fraud-analyst', 'fraud-supervisor', 'bou-officer', 'compliance-auditor'] },
    { id: 'submit-intel', label: 'Submit Intelligence', icon: Upload, roles: ['fraud-analyst', 'fraud-supervisor'] },
    { id: 'fraud-network', label: 'Fraud Network', icon: Network, roles: ['fraud-analyst', 'fraud-supervisor', 'bou-officer'] },
    { id: 'institutions', label: 'Institutions', icon: Building2, roles: ['bou-officer'] },
    { id: 'indicator-catalogue', label: 'Indicator Catalogue', icon: BookOpen, roles: ['fraud-analyst', 'fraud-supervisor', 'bou-officer', 'institution-admin'] },
    { id: 'disclosure-requests', label: 'Disclosure Requests', icon: Unlock, roles: ['fraud-analyst', 'fraud-supervisor', 'bou-officer'] },
    { id: 'audit-logs', label: 'Audit Logs', icon: ClipboardList, roles: ['compliance-auditor', 'bou-officer', 'institution-admin'] },
    { id: 'reports', label: 'Reports', icon: TrendingUp, roles: ['fraud-supervisor', 'compliance-auditor', 'bou-officer', 'institution-admin'] },
    { id: 'api-integrations', label: 'API & Integrations', icon: Code2, roles: ['institution-admin', 'bou-officer'] },
    { id: 'users-roles', label: 'Users & Roles', icon: Users, roles: ['institution-admin', 'bou-officer'] },
    { id: 'ussd-simulator', label: 'USSD Simulator', icon: Phone, roles: ['fraud-analyst', 'fraud-supervisor', 'bou-officer', 'institution-admin'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['institution-admin', 'bou-officer'] },
  ]

  const visible = allItems.filter(item => item.roles.includes(role))

  return (
    <div style={{ width: 220, background: '#12324A', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <MFLLogo size={30} />
      </div>

      <div style={{ padding: '8px 10px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#456880', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px 6px 6px' }}>
          {appState.institution}
        </div>
        {visible.map(item => {
          const isActive = screen === item.id
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item${isActive ? ' active' : ''}`}
              onClick={() => onNavigate(item.id as Screen)}
            >
              <item.icon size={15} />
              {item.label}
            </button>
          )
        })}
      </div>

      <div style={{ padding: '10px 10px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button className="sidebar-nav-item" onClick={onLogout}>
          <LogOut size={15} />Logout
        </button>
      </div>
    </div>
  )
}

// ─── BoU Dashboard ────────────────────────────────────────────────────────────

function BoUDashboard({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div style={{ padding: 28, maxWidth: 1400, margin: '0 auto' }}>
      <SectionHeader
        title="National Fraud Intelligence Overview"
        subtitle="Bank of Uganda · Oversight Dashboard · 11 July 2026"
        actions={
          <>
            <button className="btn-secondary"><Download size={14} />Export Report</button>
            <button className="btn-primary"><RefreshCw size={14} />Refresh</button>
          </>
        }
      />

      {/* Metric grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <MetricCard label="Participating Institutions" value="18" icon={Building2} delta="+2" sub="since last quarter" />
        <MetricCard label="Fraud Indicators Submitted" value="12,480" icon={FileText} color="#0F938A" delta="+847" sub="this month" />
        <MetricCard label="Cross-Institution Matches" value="1,284" icon={Network} color="#D97706" delta="+124" sub="this month" />
        <MetricCard label="Critical Alerts" value="64" icon={AlertTriangle} color="#C62828" delta="+8" sub="last 7 days" />
        <MetricCard label="Open Investigations" value="318" icon={Activity} color="#0F938A" sub="across all institutions" />
        <MetricCard label="Confirmed Cases" value="872" icon={CheckCircle} color="#198754" delta="+43" sub="this month" />
        <MetricCard label="Withdrawn Indicators" value="34" icon={XCircle} color="#667085" sub="this month" />
        <MetricCard label="Avg Response Time" value="2h 18m" icon={Clock} color="#D97706" delta="-12m" sub="vs last month" />
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A', marginBottom: 4 }}>Fraud Reports — Last 30 Days</div>
          <div style={{ fontSize: 12, color: '#667085', marginBottom: 16 }}>Daily submission count across all institutions</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={fraudTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#667085' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#667085' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #D9E1E8', borderRadius: 6 }} />
              <Area type="monotone" dataKey="reports" stroke="#0F938A" strokeWidth={2} fill="rgba(15,147,138,0.08)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A', marginBottom: 4 }}>Alerts by Risk Level</div>
          <div style={{ fontSize: 12, color: '#667085', marginBottom: 12 }}>Active alert distribution</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={riskLevelData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                {riskLevelData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #D9E1E8', borderRadius: 6 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A', marginBottom: 16 }}>Fraud Incidents by Type</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={fraudTypeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#667085' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="type" tick={{ fontSize: 10, fill: '#667085' }} tickLine={false} axisLine={false} width={100} />
              <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #D9E1E8', borderRadius: 6 }} />
              <Bar dataKey="count" fill="#12324A" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A', marginBottom: 16 }}>Cross-Institution Matches by Week</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={matchByWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#667085' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#667085' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #D9E1E8', borderRadius: 6 }} />
              <Bar dataKey="matches" fill="#0F938A" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A', marginBottom: 16 }}>Confirmed vs Unconfirmed Cases</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={confirmedVsUnconfirmed}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#667085' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#667085' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #D9E1E8', borderRadius: 6 }} />
              <Bar dataKey="confirmed" fill="#198754" radius={[3, 3, 0, 0]} name="Confirmed" />
              <Bar dataKey="unconfirmed" fill="#D9E1E8" radius={[3, 3, 0, 0]} name="Unconfirmed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Critical alerts table */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #D9E1E8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A' }}>Recent Critical Alerts</div>
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => onNavigate('alerts')}>View all <ChevronRight size={13} /></button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Alert Ref', 'Risk', 'Fraud Type', 'Institutions', 'Generated', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ALERTS.filter(a => a.risk === 'Critical' || a.risk === 'High').slice(0, 4).map((a, i) => (
                <tr key={i} className="table-row" style={{ borderTop: '1px solid #f0f4f8', cursor: 'pointer' }} onClick={() => onNavigate('alert-detail')}>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'JetBrains Mono', color: '#12324A', fontWeight: 500 }}>{a.ref}</td>
                  <td style={{ padding: '12px 16px' }}><RiskBadge level={a.risk} /></td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#12324A' }}>{a.type}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#667085' }}>{a.institutions} institutions</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#667085', fontFamily: 'JetBrains Mono' }}>{a.generatedAt}</td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Institution API health */}
      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #D9E1E8', fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A' }}>Institution API Health</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Institution', 'Type', 'API Status', 'Last Submission', 'Indicators', 'Compliance'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAMPLE_INSTITUTIONS_TABLE.map((inst, i) => (
                <tr key={i} className="table-row" style={{ borderTop: '1px solid #f0f4f8', cursor: 'pointer' }} onClick={() => onNavigate('institution-detail')}>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#12324A' }}>{inst.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#667085' }}>{inst.type}</td>
                  <td style={{ padding: '12px 16px' }}><ApiStatusDot status={inst.apiConn} /></td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#667085', fontFamily: 'JetBrains Mono' }}>{inst.lastSub}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#12324A', fontFamily: 'JetBrains Mono' }}>{inst.indicators.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: inst.compliance === 'Compliant' ? '#198754' : '#D97706' }}>{inst.compliance}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Institution Dashboard ────────────────────────────────────────────────────

function InstitutionDashboard({ appState, onNavigate }: { appState: AppState; onNavigate: (s: Screen) => void }) {
  return (
    <div style={{ padding: 28, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontFamily: 'Manrope', fontSize: 22, fontWeight: 800, color: '#12324A', margin: 0 }}>Institution Fraud Intelligence Dashboard</h1>
            <ApiStatusDot status="Online" />
          </div>
          <div style={{ fontSize: 13, color: '#667085' }}>{appState.institution} · Last submission: 2026-07-11 14:28 · Schema v1.0</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={() => onNavigate('reports')}><Download size={14} />Generate Report</button>
          <button className="btn-primary" onClick={() => onNavigate('submit-intel')}><Plus size={14} />Submit Intelligence</button>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Submit Intelligence', icon: Upload, action: 'submit-intel' as Screen, color: '#0F938A' },
          { label: 'Review Critical Alerts', icon: AlertTriangle, action: 'alerts' as Screen, color: '#C62828' },
          { label: 'View Assigned Cases', icon: FileText, action: 'incidents' as Screen, color: '#12324A' },
          { label: 'Generate Report', icon: TrendingUp, action: 'reports' as Screen, color: '#D97706' },
          { label: 'API Documentation', icon: Code2, action: 'api-integrations' as Screen, color: '#667085' },
        ].map(({ label, icon: Icon, action, color }) => (
          <button key={label} onClick={() => onNavigate(action)} style={{ background: '#FFFFFF', border: '1px solid #D9E1E8', borderRadius: 8, padding: '14px 12px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s, box-shadow 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = color; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 2px 8px ${color}20` }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#D9E1E8'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none' }}>
            <Icon size={18} color={color} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A' }}>{label}</div>
          </button>
        ))}
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 24 }}>
        <MetricCard label="Indicators Submitted" value="4,821" icon={FileText} color="#0F938A" />
        <MetricCard label="Open Cases" value="28" icon={Activity} color="#D97706" />
        <MetricCard label="High-Risk Alerts" value="12" icon={AlertTriangle} color="#C62828" />
        <MetricCard label="Cross-Inst Matches" value="312" icon={Network} color="#12324A" />
        <MetricCard label="Confirmed Incidents" value="187" icon={CheckCircle} color="#198754" />
        <MetricCard label="Avg Investigation" value="1h 42m" icon={Clock} color="#667085" />
      </div>

      {/* Charts + recent */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A', marginBottom: 16 }}>Fraud Submission Trend</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={fraudTrendData.slice(-10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#667085' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#667085' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #D9E1E8', borderRadius: 6 }} />
              <Area type="monotone" dataKey="reports" stroke="#0F938A" strokeWidth={2} fill="rgba(15,147,138,0.08)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A', marginBottom: 12 }}>Risk Distribution</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={riskLevelData} cx="50%" cy="50%" outerRadius={70} dataKey="value" paddingAngle={2}>
                {riskLevelData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #D9E1E8', borderRadius: 6 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent alerts */}
      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #D9E1E8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A' }}>Recent Alerts</div>
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => onNavigate('alerts')}>View all <ChevronRight size={13} /></button>
        </div>
        {SAMPLE_ALERTS.slice(0, 4).map((a, i) => (
          <div key={i} className="table-row" style={{ padding: '12px 20px', borderTop: i > 0 ? '1px solid #f0f4f8' : undefined, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => onNavigate('alert-detail')}>
            <RiskBadge level={a.risk} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#12324A' }}>{a.ref}</div>
              <div style={{ fontSize: 12, color: '#667085', marginTop: 1 }}>{a.type} · {a.matchReason}</div>
            </div>
            <StatusBadge status={a.status} />
            <span style={{ fontSize: 11, color: '#a3b4c0', fontFamily: 'JetBrains Mono' }}>{a.generatedAt}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Submit Intelligence ──────────────────────────────────────────────────────

function SubmitIntelligence({ appState }: { appState: AppState }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    ref: '', fraudType: 'Account Takeover', riskLevel: 'High', detectionDate: '2026-07-11', detectionTime: '14:28',
    status: 'New', description: '', retentionClass: 'ACTIVE_CASE',
    walletId: '', deviceRef: '', simRef: '', txRef: '', indicatorCode: 'RAPID_MULTI_WALLET_TRANSFER',
    behaviourPattern: '', confidenceLevel: 'High', detectionSource: 'System Detection',
    confirm1: false, confirm2: false, confirm3: false,
  })
  const [submitted, setSubmitted] = useState(false)

  const protectedRef = 'SUBJ_8F92A7B4C91D4E16'
  const incidentRef = 'FL-UG-2026-000245'

  if (submitted) {
    return (
      <div style={{ padding: 28, maxWidth: 700, margin: '0 auto' }}>
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle size={32} color="#198754" />
          </div>
          <h2 style={{ fontFamily: 'Manrope', fontSize: 22, fontWeight: 800, color: '#12324A', marginBottom: 6 }}>Fraud Intelligence Submitted</h2>
          <p style={{ fontSize: 13.5, color: '#667085', marginBottom: 28 }}>The submission has been validated and stored. A protected reference has been generated.</p>

          <div style={{ background: '#F5F7FA', borderRadius: 8, padding: 20, textAlign: 'left', marginBottom: 24 }}>
            {[
              ['Incident Reference', incidentRef],
              ['Protected Subject Reference', protectedRef],
              ['Schema Version', '1.0'],
              ['Submission Timestamp', '2026-07-11T14:32:18+03:00'],
              ['Reporting Institution', appState.institution],
              ['Initial Risk Level', 'HIGH'],
              ['Match Check Status', 'MATCH DETECTED — Alert ALT-2026-00891 generated'],
              ['Audit Event Reference', 'AUD-2026-88412'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '8px 0', borderBottom: '1px solid #e8eef3' }}>
                <div style={{ fontSize: 12, color: '#667085', minWidth: 200, flexShrink: 0 }}>{k}</div>
                <div style={{ fontSize: 12.5, fontFamily: 'JetBrains Mono', color: '#12324A', fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff7ed', border: '1px solid #fde68a', borderRadius: 6, padding: 12, marginBottom: 24, textAlign: 'left', display: 'flex', gap: 10 }}>
            <AlertTriangle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12.5, color: '#92400e' }}>A cross-institution match was detected. Alert <strong>ALT-2026-00891</strong> has been generated and assigned for investigation.</div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn-secondary" onClick={() => { setSubmitted(false); setStep(1) }}>Submit Another</button>
            <button className="btn-primary">View Incident</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 28, maxWidth: 800, margin: '0 auto' }}>
      <SectionHeader title="Submit Fraud Intelligence" subtitle="All submissions are validated against the indicator catalogue and schema before storage." />

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
        {['Incident Details', 'Protected Indicators', 'Privacy & Validation', 'Review & Submit'].map((label, i) => {
          const n = i + 1
          const done = step > n
          const active = step === n
          return (
            <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : undefined }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? '#0F938A' : active ? '#12324A' : '#D9E1E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {done ? <CheckCircle size={14} color="#FFFFFF" /> : <span style={{ fontSize: 12, fontWeight: 700, color: active ? '#FFFFFF' : '#667085' }}>{n}</span>}
                </div>
                <span style={{ fontSize: 12.5, fontWeight: active ? 600 : 400, color: active ? '#12324A' : done ? '#0F938A' : '#667085', whiteSpace: 'nowrap' }}>{label}</span>
              </div>
              {i < 3 && <div style={{ flex: 1, height: 1, background: done ? '#0F938A' : '#D9E1E8', margin: '0 12px' }} />}
            </div>
          )
        })}
      </div>

      <div className="card" style={{ padding: 28 }}>
        {step === 1 && (
          <div>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, color: '#12324A', marginTop: 0, marginBottom: 20 }}>Step 1: Incident Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Internal Incident Reference *</label>
                <input className="input-field" placeholder="e.g. MNO-2026-007142" value={form.ref} onChange={e => setForm({ ...form, ref: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Fraud Type *</label>
                <select className="input-field" value={form.fraudType} onChange={e => setForm({ ...form, fraudType: e.target.value })}>
                  {['Account Takeover', 'SIM-Swap Abuse', 'Social Engineering', 'Impersonation', 'Stolen PIN', 'Suspicious Incoming Funds', 'Rapid Multi-Wallet Transfer', 'Device Reuse', 'Other Approved Category'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Risk Level *</label>
                <select className="input-field" value={form.riskLevel} onChange={e => setForm({ ...form, riskLevel: e.target.value })}>
                  {['Low', 'Medium', 'High', 'Critical'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Case Status</label>
                <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {['New', 'Triaged', 'Under Investigation', 'Confirmed', 'Resolved'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Detection Date *</label>
                <input className="input-field" type="date" value={form.detectionDate} onChange={e => setForm({ ...form, detectionDate: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Detection Time *</label>
                <input className="input-field" type="time" value={form.detectionTime} onChange={e => setForm({ ...form, detectionTime: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Short Description *</label>
                <textarea className="input-field" rows={3} placeholder="Describe the suspected fraud. Do not include customer names, NINs or telephone numbers." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Retention Class</label>
                <select className="input-field" value={form.retentionClass} onChange={e => setForm({ ...form, retentionClass: e.target.value })}>
                  {['ACTIVE_CASE', 'CLOSED_CASE', 'ARCHIVED'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, color: '#12324A', marginTop: 0, marginBottom: 12 }}>Step 2: Protected Indicators</h3>
            <div style={{ background: '#eff8ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: 14, marginBottom: 20, display: 'flex', gap: 10 }}>
              <Lock size={16} color="#1d4ed8" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.6 }}>
                <strong>Privacy protection active.</strong> The submitted wallet, account or device identifier will be converted into a protected reference. The direct identifier will not be stored in the shared fraud-intelligence record.
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Wallet or Account Identifier *</label>
                <input className="input-field" placeholder="Will be HMAC-hashed before storage" value={form.walletId} onChange={e => setForm({ ...form, walletId: e.target.value })} />
                <div style={{ fontSize: 11, color: '#667085', marginTop: 4 }}>→ Protected as: SUBJ_XXXXXXXXXXXXXXXX</div>
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Indicator Code *</label>
                <select className="input-field" value={form.indicatorCode} onChange={e => setForm({ ...form, indicatorCode: e.target.value })}>
                  {['SIM_SWAP_SUSPECTED', 'ACCOUNT_TAKEOVER', 'RAPID_MULTI_WALLET_TRANSFER', 'SOCIAL_ENGINEERING_REPORTED', 'REPEATED_FAILED_PIN_ACTIVITY', 'SUSPICIOUS_INCOMING_FUNDS', 'DEVICE_REUSE_ACROSS_CASES', 'NEW_SIM_HIGH_VALUE_TRANSFER', 'MULTIPLE_ACCOUNTS_ONE_DEVICE', 'RAPID_CASH_OUT'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Device Reference</label>
                <input className="input-field" placeholder="Will be hashed" value={form.deviceRef} onChange={e => setForm({ ...form, deviceRef: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>SIM Reference</label>
                <input className="input-field" placeholder="Will be hashed" value={form.simRef} onChange={e => setForm({ ...form, simRef: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Transaction Reference</label>
                <input className="input-field" placeholder="Internal transaction ID" value={form.txRef} onChange={e => setForm({ ...form, txRef: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Confidence Level</label>
                <select className="input-field" value={form.confidenceLevel} onChange={e => setForm({ ...form, confidenceLevel: e.target.value })}>
                  {['Low', 'Medium', 'High', 'Confirmed'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Detection Source</label>
                <select className="input-field" value={form.detectionSource} onChange={e => setForm({ ...form, detectionSource: e.target.value })}>
                  {['System Detection', 'Analyst Review', 'Customer Report', 'Third-Party Alert', 'Internal Audit'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Behaviour Pattern</label>
                <textarea className="input-field" rows={2} placeholder="Describe the observed behaviour. No customer names, NINs or phone numbers." value={form.behaviourPattern} onChange={e => setForm({ ...form, behaviourPattern: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, color: '#12324A', marginTop: 0, marginBottom: 20 }}>Step 3: Privacy & Validation Review</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Schema Validation', status: 'PASSED', color: '#198754', icon: CheckCircle },
                { label: 'Privacy Check', status: 'PASSED', color: '#198754', icon: CheckCircle },
                { label: 'Prohibited Data Scan', status: 'PASSED', color: '#198754', icon: CheckCircle },
                { label: 'Indicator Code Valid', status: 'PASSED', color: '#198754', icon: CheckCircle },
                { label: 'Mandatory Fields', status: 'PASSED', color: '#198754', icon: CheckCircle },
                { label: 'Date/Time Validity', status: 'PASSED', color: '#198754', icon: CheckCircle },
              ].map(({ label, status, color, icon: Icon }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6 }}>
                  <Icon size={16} color={color} />
                  <div style={{ flex: 1, fontSize: 13, color: '#12324A', fontWeight: 500 }}>{label}</div>
                  <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 700, color }}>{status}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#12324A', marginBottom: 10 }}>Fields being submitted</div>
              <div style={{ background: '#F5F7FA', borderRadius: 6, padding: 14 }}>
                {[
                  ['Fraud Type', form.fraudType], ['Risk Level', form.riskLevel], ['Detection Date/Time', `${form.detectionDate} ${form.detectionTime}`],
                  ['Indicator Code', form.indicatorCode], ['Confidence Level', form.confidenceLevel], ['Detection Source', form.detectionSource],
                  ['Retention Class', form.retentionClass], ['Reporting Institution', appState.institution],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 12, padding: '5px 0', borderBottom: '1px solid #e8eef3', fontSize: 12.5 }}>
                    <span style={{ color: '#667085', minWidth: 180 }}>{k}</span>
                    <span style={{ color: '#12324A', fontFamily: 'JetBrains Mono', fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 6, padding: 12, marginBottom: 20, fontSize: 13, color: '#713f12' }}>
              <strong>Fields excluded from shared record:</strong> Raw wallet identifier, raw device ID, raw SIM number. These are converted to protected references (HMAC-SHA256) before storage.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { key: 'confirm1', text: 'This submission is for authorised fraud-prevention purposes only, in accordance with the Data Protection Act 2019.' },
                { key: 'confirm2', text: 'The information provided is accurate to the best of this institution\'s knowledge at time of submission.' },
                { key: 'confirm3', text: 'This institution accepts responsibility for correcting any inaccurate intelligence submitted.' },
              ].map(({ key, text }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', border: '1px solid #D9E1E8', borderRadius: 6, cursor: 'pointer', background: (form as any)[key] ? 'rgba(15,147,138,0.04)' : '#FFFFFF' }}>
                  <input type="checkbox" checked={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} style={{ marginTop: 2, accentColor: '#0F938A' }} />
                  <span style={{ fontSize: 13, color: '#12324A', lineHeight: 1.5 }}>{text}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid #D9E1E8' }}>
          <button className="btn-secondary" onClick={() => setStep(s => Math.max(1, s - 1))} style={{ visibility: step > 1 ? 'visible' : 'hidden' }}>
            <ArrowLeft size={14} />Back
          </button>
          {step < 3 ? (
            <button className="btn-primary" onClick={() => setStep(s => s + 1)}>
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button className="btn-primary" onClick={() => setSubmitted(true)} disabled={!form.confirm1 || !form.confirm2 || !form.confirm3}
              style={{ opacity: (!form.confirm1 || !form.confirm2 || !form.confirm3) ? 0.5 : 1 }}>
              <Send size={14} />Submit Fraud Intelligence
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Alerts List ──────────────────────────────────────────────────────────────

function AlertsList({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [filterRisk, setFilterRisk] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')

  const filtered = SAMPLE_ALERTS.filter(a => {
    const matchRisk = !filterRisk || a.risk === filterRisk
    const matchStatus = !filterStatus || a.status === filterStatus
    const matchSearch = !search || a.ref.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase())
    return matchRisk && matchStatus && matchSearch
  })

  return (
    <div style={{ padding: 28 }}>
      <SectionHeader
        title="Fraud Alerts"
        subtitle="Cross-institution fraud matches and risk signals"
        actions={<button className="btn-secondary"><Download size={14} />Export</button>}
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 320 }}>
          <Search size={14} color="#667085" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input className="input-field" style={{ paddingLeft: 32 }} placeholder="Search alerts…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field" style={{ flex: '0 0 140px' }} value={filterRisk} onChange={e => setFilterRisk(e.target.value)}>
          <option value="">All Risk Levels</option>
          {['Low', 'Medium', 'High', 'Critical'].map(r => <option key={r}>{r}</option>)}
        </select>
        <select className="input-field" style={{ flex: '0 0 180px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {['New', 'Acknowledged', 'Under Investigation', 'Escalated', 'Confirmed', 'Resolved', 'Withdrawn'].map(s => <option key={s}>{s}</option>)}
        </select>
        <button className="btn-secondary"><Filter size={14} />More Filters</button>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Alert Reference', 'Risk', 'Fraud Type', 'Match Reason', 'Indicators', 'Institutions', 'Generated', 'Analyst', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11.5, fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={i} className="table-row" style={{ borderTop: '1px solid #f0f4f8', cursor: 'pointer' }} onClick={() => onNavigate('alert-detail')}>
                  <td style={{ padding: '13px 14px', fontSize: 12.5, fontFamily: 'JetBrains Mono', color: '#12324A', fontWeight: 600 }}>{a.ref}</td>
                  <td style={{ padding: '13px 14px' }}><RiskBadge level={a.risk} /></td>
                  <td style={{ padding: '13px 14px', fontSize: 13, color: '#12324A' }}>{a.type}</td>
                  <td style={{ padding: '13px 14px', fontSize: 12.5, color: '#667085', maxWidth: 180 }}>{a.matchReason}</td>
                  <td style={{ padding: '13px 14px', fontSize: 13, color: '#12324A', textAlign: 'center' }}>{a.indicators}</td>
                  <td style={{ padding: '13px 14px', fontSize: 13, color: '#12324A', textAlign: 'center' }}>{a.institutions}</td>
                  <td style={{ padding: '13px 14px', fontSize: 11.5, color: '#667085', fontFamily: 'JetBrains Mono', whiteSpace: 'nowrap' }}>{a.generatedAt}</td>
                  <td style={{ padding: '13px 14px', fontSize: 12.5, color: '#12324A' }}>{a.analyst}</td>
                  <td style={{ padding: '13px 14px' }}><StatusBadge status={a.status} /></td>
                  <td style={{ padding: '13px 14px' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0F938A', fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => { e.stopPropagation(); onNavigate('alert-detail') }}>
                      View <ChevronRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#667085', fontSize: 13 }}>
            <AlertCircle size={32} color="#D9E1E8" style={{ display: 'block', margin: '0 auto 12px' }} />
            No alerts match the current filters.
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Alert Detail ─────────────────────────────────────────────────────────────

function AlertDetail({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [activeTab, setActiveTab] = useState('summary')
  const [status, setStatus] = useState('Under Investigation')

  return (
    <div style={{ padding: 28 }}>
      <button className="btn-secondary" style={{ marginBottom: 16, padding: '7px 12px', fontSize: 12.5 }} onClick={() => onNavigate('alerts')}>
        <ArrowLeft size={13} />Back to Alerts
      </button>

      {/* Header */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 16, color: '#12324A' }}>ALT-2026-00891</span>
              <RiskBadge level="Critical" />
              <StatusBadge status={status} />
            </div>
            <h2 style={{ fontFamily: 'Manrope', fontSize: 18, fontWeight: 800, color: '#12324A', margin: '0 0 6px' }}>
              High-Risk Cross-Institution Fraud Pattern Detected
            </h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12.5, color: '#667085' }}>
              <span><Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} />Generated: 2026-07-11 14:32</span>
              <span><Users size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} />Analyst: A. Nakato</span>
              <span><Building2 size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} />2 Participating Institutions</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn-secondary" style={{ fontSize: 12, padding: '7px 12px' }}>Assign Analyst</button>
            <button className="btn-secondary" style={{ fontSize: 12, padding: '7px 12px' }}>Add Note</button>
            <button className="btn-secondary" style={{ fontSize: 12, padding: '7px 12px', color: '#D97706', borderColor: '#D97706' }}>Escalate</button>
            <button className="btn-primary" style={{ fontSize: 12, padding: '7px 12px' }} onClick={() => onNavigate('disclosure-requests')}>Request Disclosure</button>
          </div>
        </div>
      </div>

      {/* Privacy warning */}
      <div style={{ background: '#fff7ed', border: '1px solid #fde68a', borderRadius: 6, padding: 12, marginBottom: 16, display: 'flex', gap: 10 }}>
        <AlertTriangle size={15} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 13, color: '#92400e', fontStyle: 'italic' }}>
          <strong>Important:</strong> A fraud match is an intelligence signal. It is not automatic proof that a customer committed fraud. Customer identity is not disclosed automatically.
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #D9E1E8', display: 'flex', marginBottom: 20 }}>
        {[['summary', 'Summary'], ['match', 'Match Explanation'], ['timeline', 'Timeline'], ['actions', 'Actions']].map(([id, label]) => (
          <button key={id} className={`tab-btn${activeTab === id ? ' active' : ''}`} onClick={() => setActiveTab(id)}>{label}</button>
        ))}
      </div>

      {activeTab === 'summary' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A', marginBottom: 14 }}>Alert Summary</div>
              {[
                ['Common Incident Reference', 'FL-UG-2026-000245'],
                ['Fraud Type', 'Account Takeover / Suspicious Incoming Funds'],
                ['Related Indicators', '3'],
                ['Participating Institutions', 'MTN Mobile Money Uganda Limited, Airtel Mobile Commerce Uganda Limited'],
                ['Match Confidence', '85%'],
                ['Detection Window', '< 24 hours'],
                ['Protected Subject Reference', 'SUBJ_8F92A7B4C91D4E16'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 14, padding: '7px 0', borderBottom: '1px solid #f0f4f8', fontSize: 13 }}>
                  <span style={{ color: '#667085', minWidth: 220, flexShrink: 0 }}>{k}</span>
                  <span style={{ color: '#12324A', fontFamily: k.includes('Reference') ? 'JetBrains Mono' : undefined, fontWeight: k.includes('Reference') ? 500 : 400 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A', marginBottom: 14 }}>Change Status</div>
              <select className="input-field" value={status} onChange={e => setStatus(e.target.value)} style={{ marginBottom: 10 }}>
                {['New', 'Acknowledged', 'Under Investigation', 'Escalated', 'Confirmed', 'Resolved', 'Withdrawn'].map(s => <option key={s}>{s}</option>)}
              </select>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Update Status</button>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A', marginBottom: 12 }}>Related Incidents</div>
              {['FL-UG-2026-000245', 'FL-UG-2026-000244'].map(ref => (
                <div key={ref} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f0f4f8' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#0F938A', fontWeight: 500 }}>{ref}</span>
                  <ExternalLink size={13} color="#667085" style={{ cursor: 'pointer' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'match' && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, color: '#12324A', marginBottom: 6 }}>Match Explanation</div>
          <div style={{ fontSize: 13, color: '#667085', marginBottom: 20 }}>How this alert was generated by the matching engine</div>

          <div style={{ background: '#8B0000', borderRadius: 8, padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Composite Risk Score</div>
              <div style={{ fontFamily: 'Manrope', fontSize: 36, fontWeight: 800, color: '#FFFFFF' }}>85</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <RiskBadge level="Critical" />
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>Matching Rule: EXACT_REF_MULTI_INST</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {[
              { label: 'Exact protected wallet-reference match', score: '+40', color: '#8B0000' },
              { label: 'Reports submitted by different institutions', score: '+20', color: '#C62828' },
              { label: 'High-risk indicator combination', score: '+15', color: '#D97706' },
              { label: 'Events occurred within 24 hours', score: '+10', color: '#D97706' },
            ].map(({ label, score, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#F5F7FA', borderRadius: 6, borderLeft: `3px solid ${color}` }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 13, color, minWidth: 36 }}>{score}</span>
                <span style={{ fontSize: 13, color: '#12324A' }}>{label}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { label: 'Triggering Indicator Codes', value: 'ACCOUNT_TAKEOVER, RAPID_MULTI_WALLET_TRANSFER, SUSPICIOUS_INCOMING_FUNDS' },
              { label: 'Contributing Institutions', value: 'MTN Mobile Money Uganda Limited, Airtel Mobile Commerce Uganda Limited' },
              { label: 'Recommended Next Action', value: 'Assign to senior analyst · Consider controlled disclosure request' },
              { label: 'Detection Window', value: 'Events within 5h 44m of each other' },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: 14, background: '#F5F7FA', borderRadius: 6 }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 13, color: '#12324A', lineHeight: 1.5, fontFamily: label.includes('Code') ? 'JetBrains Mono' : undefined }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A', marginBottom: 20 }}>Investigation Timeline</div>
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            <div style={{ position: 'absolute', left: 9, top: 0, bottom: 0, width: 1, background: '#D9E1E8' }} />
            {[
              { time: '14:32 · 11 Jul', event: 'Alert generated', detail: 'Cross-institution reference match detected by matching engine', user: 'System', color: '#8B0000' },
              { time: '14:33 · 11 Jul', event: 'Status changed to Under Investigation', detail: 'Assigned to A. Nakato', user: 'A. Nakato', color: '#0F938A' },
              { time: '13:46 · 11 Jul', event: 'Incident FL-UG-2026-000244 submitted', detail: 'Airtel Mobile Commerce Uganda Limited — Suspicious Incoming Funds', user: 'B. Okonkwo', color: '#D97706' },
              { time: '14:28 · 11 Jul', event: 'Incident FL-UG-2026-000245 submitted', detail: 'MTN Mobile Money Uganda Limited — Account Takeover', user: 'K. Namukasa', color: '#0F938A' },
            ].map(({ time, event, detail, user, color }, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: 20, paddingLeft: 16 }}>
                <div style={{ position: 'absolute', left: -19, top: 5, width: 10, height: 10, borderRadius: '50%', background: color, border: '2px solid #FFFFFF', boxShadow: `0 0 0 2px ${color}40` }} />
                <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#667085', marginBottom: 2 }}>{time}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#12324A' }}>{event}</div>
                <div style={{ fontSize: 12.5, color: '#667085', marginTop: 2 }}>{detail}</div>
                <div style={{ fontSize: 11.5, color: '#a3b4c0', marginTop: 2 }}>by {user}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'actions' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Acknowledge Alert', icon: CheckCircle, color: '#0F938A', desc: 'Mark this alert as acknowledged by your team' },
            { label: 'Add Investigation Note', icon: Edit2, color: '#12324A', desc: 'Add a note to the investigation record' },
            { label: 'Escalate', icon: ArrowUp, color: '#D97706', desc: 'Escalate to a fraud supervisor for review' },
            { label: 'Request Controlled Disclosure', icon: Unlock, color: '#C62828', desc: 'Initiate a controlled identity disclosure workflow' },
            { label: 'Mark as False Positive', icon: XCircle, color: '#667085', desc: 'Flag this alert as a false positive for review' },
            { label: 'Withdraw Indicator', icon: Minus, color: '#C62828', desc: 'Withdraw an indicator from this institution\'s submission' },
            { label: 'Export Authorised Summary', icon: Download, color: '#0F938A', desc: 'Export a redacted summary of this alert' },
            { label: 'Assign Analyst', icon: UserPlus, color: '#12324A', desc: 'Assign this case to an analyst for investigation' },
          ].map(({ label, icon: Icon, color, desc }) => (
            <button key={label} style={{ background: '#FFFFFF', border: '1px solid #D9E1E8', borderRadius: 8, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 12, transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#D9E1E8')}>
              <Icon size={18} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#12324A' }}>{label}</div>
                <div style={{ fontSize: 12, color: '#667085', marginTop: 2 }}>{desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Fraud Network ────────────────────────────────────────────────────────────

function FraudNetwork() {
  const [selected, setSelected] = useState<string | null>('SUBJ_8F92A7B4C91D4E16')

  const nodes = [
    { id: 'SUBJ_8F92A7B4', x: 320, y: 200, type: 'wallet', label: 'SUBJ_8F92A7B4', color: '#C62828', size: 22 },
    { id: 'FL-000245', x: 160, y: 120, type: 'incident', label: 'FL-UG-000245', color: '#12324A', size: 16 },
    { id: 'FL-000244', x: 480, y: 120, type: 'incident', label: 'FL-UG-000244', color: '#12324A', size: 16 },
    { id: 'MTN-MoMo', x: 100, y: 280, type: 'institution', label: 'MTN MoMo', color: '#0F938A', size: 18 },
    { id: 'Airtel-Money', x: 540, y: 280, type: 'institution', label: 'Airtel Money', color: '#0F938A', size: 18 },
    { id: 'DEV_F7A2', x: 320, y: 340, type: 'device', label: 'DEV_F7A2', color: '#D97706', size: 14 },
    { id: 'CODE_RAPA', x: 200, y: 380, type: 'indicator', label: 'RAPID_TRANSFER', color: '#667085', size: 13 },
    { id: 'CODE_SUS', x: 440, y: 380, type: 'indicator', label: 'SUSP_FUNDS', color: '#667085', size: 13 },
  ]

  const edges = [
    { from: 'SUBJ_8F92A7B4', to: 'FL-000245', type: 'solid' },
    { from: 'SUBJ_8F92A7B4', to: 'FL-000244', type: 'solid' },
    { from: 'FL-000245', to: 'MTN-MoMo', type: 'solid' },
    { from: 'FL-000244', to: 'Airtel-Money', type: 'solid' },
    { from: 'SUBJ_8F92A7B4', to: 'DEV_F7A2', type: 'dashed' },
    { from: 'FL-000245', to: 'CODE_RAPA', type: 'dashed' },
    { from: 'FL-000244', to: 'CODE_SUS', type: 'dashed' },
    { from: 'MTN-MoMo', to: 'Airtel-Money', type: 'dashed' },
  ]

  const nodeShapes: Record<string, string> = { wallet: '⬡', incident: '■', institution: '▲', device: '●', indicator: '◆' }
  const selectedNode = nodes.find(n => n.id === selected || n.label === selected)

  return (
    <div style={{ padding: 28 }}>
      <SectionHeader title="Fraud Network View" subtitle="Interactive visualisation of cross-institution fraud relationships" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Filters */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #D9E1E8', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['Time Range', 'Institution', 'Fraud Type', 'Risk Level', 'Relationship'].map(f => (
              <select key={f} className="input-field" style={{ flex: '0 0 auto', fontSize: 12, padding: '5px 28px 5px 10px' }}>
                <option>{f}: All</option>
              </select>
            ))}
          </div>

          {/* Canvas */}
          <div style={{ position: 'relative', height: 460, background: '#fafcff', overflow: 'hidden' }}>
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e8eef3" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {edges.map((e, i) => {
                const from = nodes.find(n => n.id === e.from)!
                const to = nodes.find(n => n.id === e.to)!
                return (
                  <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={e.type === 'solid' ? '#0F938A' : '#a3b4c0'}
                    strokeWidth={e.type === 'solid' ? 2 : 1.5}
                    strokeDasharray={e.type === 'dashed' ? '5,4' : undefined}
                    opacity={0.7}
                  />
                )
              })}
              {nodes.map(node => {
                const isSelected = selected === node.id || selected === node.label
                return (
                  <g key={node.id} onClick={() => setSelected(node.id)} style={{ cursor: 'pointer' }}>
                    <circle cx={node.x} cy={node.y} r={node.size + 4} fill={isSelected ? node.color : 'transparent'} fillOpacity={0.12} />
                    <circle cx={node.x} cy={node.y} r={node.size} fill={isSelected ? node.color : '#FFFFFF'} stroke={node.color} strokeWidth={isSelected ? 2.5 : 1.5} />
                    <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill={isSelected ? '#FFFFFF' : node.color} fontFamily="JetBrains Mono">
                      {node.type === 'wallet' ? 'W' : node.type === 'incident' ? 'I' : node.type === 'institution' ? '🏛' : node.type === 'device' ? 'D' : 'C'}
                    </text>
                    <text x={node.x} y={node.y + node.size + 12} textAnchor="middle" fontSize="10" fill="#667085" fontFamily="JetBrains Mono">
                      {node.label}
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Legend */}
            <div style={{ position: 'absolute', bottom: 14, left: 14, background: 'rgba(255,255,255,0.92)', border: '1px solid #D9E1E8', borderRadius: 6, padding: '8px 12px', fontSize: 11, color: '#667085' }}>
              {[
                { symbol: '—', color: '#0F938A', label: 'Direct match' },
                { symbol: '- -', color: '#a3b4c0', label: 'Inferred relationship' },
              ].map(({ symbol, color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontFamily: 'monospace', color, fontWeight: 700, fontSize: 13 }}>{symbol}</span>
                  <span>{label}</span>
                </div>
              ))}
              {[{ c: '#C62828', l: 'Wallet/Account' }, { c: '#12324A', l: 'Incident' }, { c: '#0F938A', l: 'Institution' }, { c: '#D97706', l: 'Device' }, { c: '#667085', l: 'Indicator' }].map(({ c, l }) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} />
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <div className="card" style={{ padding: 20, overflowY: 'auto' }}>
          <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A', marginBottom: 14 }}>Node Detail</div>
          {selectedNode ? (
            <div>
              <div style={{ background: '#F5F7FA', borderRadius: 6, padding: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{selectedNode.type}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 600, color: '#12324A' }}>{selectedNode.id}</div>
              </div>
              {[
                { label: 'Related Incidents', value: 'FL-UG-2026-000245, FL-UG-2026-000244' },
                { label: 'Participating Institutions', value: 'MTN Mobile Money Uganda Limited, Airtel Mobile Commerce Uganda Limited' },
                { label: 'Indicator Codes', value: 'ACCOUNT_TAKEOVER, RAPID_MULTI_WALLET_TRANSFER, SUSPICIOUS_INCOMING_FUNDS' },
                { label: 'Match Reasons', value: 'Exact reference match, Time-based correlation' },
                { label: 'Investigation Status', value: 'Under Investigation' },
              ].map(({ label, value }) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 12.5, color: '#12324A', lineHeight: 1.5 }}>{value}</div>
                </div>
              ))}
              <div style={{ padding: 10, background: '#fff7ed', border: '1px solid #fde68a', borderRadius: 5, fontSize: 11.5, color: '#92400e', marginTop: 12 }}>
                Customer identity not disclosed. Controlled disclosure request required.
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 24, color: '#667085', fontSize: 13 }}>Select a node to view details</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Incidents ────────────────────────────────────────────────────────────────

function Incidents({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [search, setSearch] = useState('')
  const filtered = SAMPLE_INCIDENTS.filter(i =>
    !search || i.ref.toLowerCase().includes(search.toLowerCase()) || i.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: 28 }}>
      <SectionHeader
        title="Fraud Incidents"
        subtitle="Submitted fraud intelligence records"
        actions={
          <>
            <button className="btn-secondary"><Download size={14} />Export</button>
            <button className="btn-primary" onClick={() => onNavigate('submit-intel')}><Plus size={14} />Submit Intelligence</button>
          </>
        }
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 320 }}>
          <Search size={14} color="#667085" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input className="input-field" style={{ paddingLeft: 32 }} placeholder="Search incidents…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['Fraud Type', 'Risk Level', 'Status', 'Institution', 'Date Range'].map(f => (
          <select key={f} className="input-field" style={{ flex: '0 0 140px' }}>
            <option>{f}: All</option>
          </select>
        ))}
        <button className="btn-secondary"><Filter size={14} />Saved Searches</button>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Incident Reference', 'Institution', 'Fraud Type', 'Risk', 'Protected Reference', 'Detected At', 'Status', 'Match Status', 'Analyst', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11.5, fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inc, i) => (
                <tr key={i} className="table-row" style={{ borderTop: '1px solid #f0f4f8', cursor: 'pointer' }}>
                  <td style={{ padding: '12px 14px', fontSize: 12.5, fontFamily: 'JetBrains Mono', color: '#12324A', fontWeight: 600 }}>{inc.ref}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12.5, color: '#12324A' }}>{inc.institution}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12.5, color: '#12324A' }}>{inc.type}</td>
                  <td style={{ padding: '12px 14px' }}><RiskBadge level={inc.risk} /></td>
                  <td style={{ padding: '12px 14px', fontSize: 11.5, fontFamily: 'JetBrains Mono', color: '#0F938A', fontWeight: 500 }}>{inc.protectedRef}</td>
                  <td style={{ padding: '12px 14px', fontSize: 11.5, color: '#667085', fontFamily: 'JetBrains Mono', whiteSpace: 'nowrap' }}>{inc.detectedAt}</td>
                  <td style={{ padding: '12px 14px' }}><StatusBadge status={inc.status} /></td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: inc.matchStatus === 'Matched' ? '#0F938A' : '#667085' }}>
                      {inc.matchStatus === 'Matched' ? '✓ ' : '— '}{inc.matchStatus}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12.5, color: '#12324A' }}>{inc.analyst}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0F938A', fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      View <ChevronRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Institutions ─────────────────────────────────────────────────────────────

function Institutions({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div style={{ padding: 28 }}>
      <SectionHeader
        title="Participating Institutions"
        subtitle="Bank of Uganda oversight — all regulated entities on the platform"
        actions={<button className="btn-primary"><Plus size={14} />Onboard Institution</button>}
      />
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Institution', 'Type', 'Reg. Status', 'Platform', 'API', 'Last Submission', 'Indicators', 'Matches', 'Alerts', 'Compliance', 'Users', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAMPLE_INSTITUTIONS_TABLE.map((inst, i) => (
                <tr key={i} className="table-row" style={{ borderTop: '1px solid #f0f4f8' }}>
                  <td style={{ padding: '12px 12px', fontSize: 13, fontWeight: 600, color: '#12324A', cursor: 'pointer' }} onClick={() => onNavigate('institution-detail')}>{inst.name}</td>
                  <td style={{ padding: '12px 12px', fontSize: 11.5, color: '#667085' }}>{inst.type}</td>
                  <td style={{ padding: '12px 12px' }}><span style={{ fontSize: 11.5, fontWeight: 600, color: '#198754' }}>{inst.regStatus}</span></td>
                  <td style={{ padding: '12px 12px' }}><ApiStatusDot status={inst.platformStatus === 'Connected' ? 'Online' : 'Offline'} /></td>
                  <td style={{ padding: '12px 12px' }}><ApiStatusDot status={inst.apiConn} /></td>
                  <td style={{ padding: '12px 12px', fontSize: 11.5, color: '#667085', fontFamily: 'JetBrains Mono' }}>{inst.lastSub}</td>
                  <td style={{ padding: '12px 12px', fontSize: 12.5, fontFamily: 'JetBrains Mono', color: '#12324A' }}>{inst.indicators.toLocaleString()}</td>
                  <td style={{ padding: '12px 12px', fontSize: 12.5, fontFamily: 'JetBrains Mono', color: '#12324A' }}>{inst.matches}</td>
                  <td style={{ padding: '12px 12px', fontSize: 12.5, fontFamily: 'JetBrains Mono', color: inst.alerts > 20 ? '#C62828' : '#12324A' }}>{inst.alerts}</td>
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: inst.compliance === 'Compliant' ? '#198754' : '#D97706' }}>{inst.compliance}</span>
                  </td>
                  <td style={{ padding: '12px 12px', fontSize: 12.5, color: '#12324A' }}>{inst.users}</td>
                  <td style={{ padding: '12px 12px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: 11.5 }} onClick={() => onNavigate('institution-detail')}>View</button>
                      <button style={{ padding: '4px 8px', fontSize: 11.5, background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}>Suspend</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Institution Detail ───────────────────────────────────────────────────────

function InstitutionDetail({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div style={{ padding: 28 }}>
      <button className="btn-secondary" style={{ marginBottom: 16, padding: '7px 12px', fontSize: 12.5 }} onClick={() => onNavigate('institutions')}>
        <ArrowLeft size={13} />Back to Institutions
      </button>

      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ width: 52, height: 52, borderRadius: 10, background: '#12324A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={24} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ fontFamily: 'Manrope', fontSize: 20, fontWeight: 800, color: '#12324A', margin: 0 }}>MTN Mobile Money Uganda Limited</h2>
              <ApiStatusDot status="Online" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#198754', background: '#d1fae5', padding: '2px 8px', borderRadius: 4 }}>Compliant</span>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12.5, color: '#667085' }}>
              <span>Mobile Network Operator</span>
              <span>Regulatory ID: DEMO-PSP-001</span>
              <span>14 users</span>
              <span>Last security review: 2026-04-15</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-secondary" style={{ fontSize: 12, padding: '7px 12px' }}>Contact Admin</button>
            <button className="btn-danger" style={{ fontSize: 12, padding: '7px 12px' }}>Suspend Access</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <MetricCard label="Total Indicators" value="4,821" icon={FileText} />
        <MetricCard label="Confirmed Matches" value="312" icon={Network} color="#0F938A" />
        <MetricCard label="Open Alerts" value="28" icon={AlertTriangle} color="#C62828" />
        <MetricCard label="Data Quality Score" value="94%" icon={CheckCircle} color="#198754" />
      </div>

      <div style={{ borderBottom: '1px solid #D9E1E8', display: 'flex', marginBottom: 20 }}>
        {['overview', 'users', 'api', 'submissions', 'alerts', 'audit', 'compliance', 'settings'].map(tab => (
          <button key={tab} className={`tab-btn${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)} style={{ textTransform: 'capitalize' }}>{tab}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A', marginBottom: 16 }}>Institution Overview</div>
          {[
            ['Institution Name', 'MTN Mobile Money Uganda Limited'],
            ['Type', 'Mobile Network Operator'],
            ['Regulatory Status', 'Active — Licensed by UCC'],
            ['Platform Status', 'Connected'],
            ['API Base URL', 'https://api.fraudlink.ug/v1'],
            ['Schema Version', '1.0'],
            ['Onboarded', '2025-06-12'],
            ['Last Security Review', '2026-04-15'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 14, padding: '8px 0', borderBottom: '1px solid #f0f4f8', fontSize: 13 }}>
              <span style={{ color: '#667085', minWidth: 200, flexShrink: 0 }}>{k}</span>
              <span style={{ color: '#12324A', fontFamily: k.includes('URL') ? 'JetBrains Mono' : undefined }}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Name', 'Email', 'Role', 'MFA', 'Status', 'Last Login', ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {USERS_TABLE.filter(u => u.institution === 'MTN Mobile Money Uganda Limited').map((u, i) => (
                  <tr key={i} className="table-row" style={{ borderTop: '1px solid #f0f4f8' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#12324A' }}>{u.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12.5, color: '#667085', fontFamily: 'JetBrains Mono' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12.5, color: '#12324A' }}>{u.role}</td>
                    <td style={{ padding: '12px 16px' }}><span style={{ fontSize: 11.5, fontWeight: 600, color: u.mfa === 'Enabled' ? '#198754' : '#C62828' }}>{u.mfa}</span></td>
                    <td style={{ padding: '12px 16px' }}><span style={{ fontSize: 11.5, fontWeight: 600, color: '#198754' }}>{u.status}</span></td>
                    <td style={{ padding: '12px 16px', fontSize: 11.5, color: '#667085', fontFamily: 'JetBrains Mono' }}>{u.lastLogin}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button style={{ fontSize: 11.5, color: '#0F938A', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Disclosure Requests ──────────────────────────────────────────────────────

function DisclosureRequests() {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div style={{ padding: 28, maxWidth: 700, margin: '0 auto' }}>
        <div className="card" style={{ padding: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={24} color="#198754" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'Manrope', fontSize: 18, fontWeight: 800, color: '#12324A', margin: 0 }}>Disclosure Request Submitted</h2>
              <p style={{ fontSize: 13, color: '#667085', margin: '3px 0 0' }}>DIS-2026-00042 · Awaiting supervisor review</p>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            <div style={{ position: 'absolute', left: 9, top: 8, bottom: 8, width: 1, background: '#D9E1E8' }} />
            {[
              { label: 'Request Created', done: true, time: '2026-07-11 14:48', user: 'A. Nakato · MTN Mobile Money Uganda Limited' },
              { label: 'Supervisor Review', done: false, time: 'Pending', user: 'Awaiting fraud supervisor' },
              { label: 'Owning Institution Notified', done: false, time: 'Pending', user: 'Airtel Mobile Commerce Uganda Limited (institution owner)' },
              { label: 'Decision Recorded', done: false, time: 'Pending', user: '' },
              { label: 'Disclosure Completed', done: false, time: 'Pending', user: '' },
            ].map(({ label, done, time, user }, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: 18, paddingLeft: 16 }}>
                <div style={{ position: 'absolute', left: -19, top: 5, width: 10, height: 10, borderRadius: '50%', background: done ? '#0F938A' : '#D9E1E8', border: '2px solid #FFFFFF', boxShadow: done ? '0 0 0 2px #0F938A40' : 'none' }} />
                <div style={{ fontSize: 13.5, fontWeight: done ? 600 : 400, color: done ? '#12324A' : '#a3b4c0' }}>{label}</div>
                <div style={{ fontSize: 11.5, fontFamily: 'JetBrains Mono', color: done ? '#0F938A' : '#a3b4c0', marginTop: 1 }}>{time}</div>
                {user && <div style={{ fontSize: 11.5, color: '#667085', marginTop: 1 }}>{user}</div>}
              </div>
            ))}
          </div>

          <button className="btn-secondary" style={{ marginTop: 16 }} onClick={() => { setSubmitted(false); setStep(1) }}>Submit Another Request</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 28, maxWidth: 760, margin: '0 auto' }}>
      <SectionHeader title="Controlled Identity Disclosure Request" subtitle="A secure, multi-step approval workflow. Identity is never disclosed automatically." />

      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: 12, marginBottom: 20, display: 'flex', gap: 10 }}>
        <Lock size={15} color="#C62828" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 13, color: '#991b1b', lineHeight: 1.5 }}>
          Identity disclosure is strictly controlled. This request requires supervisor approval and owning institution consent before any customer identity is shared.
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        {['Select Alert', 'Request Details', 'Supervisor Review', 'Institution Review'].map((label, i) => {
          const n = i + 1; const done = step > n; const active = step === n
          return (
            <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : undefined }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: done ? '#0F938A' : active ? '#12324A' : '#D9E1E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {done ? <CheckCircle size={13} color="#FFFFFF" /> : <span style={{ fontSize: 11, fontWeight: 700, color: active ? '#FFFFFF' : '#667085' }}>{n}</span>}
                </div>
                <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? '#12324A' : done ? '#0F938A' : '#667085', whiteSpace: 'nowrap' }}>{label}</span>
              </div>
              {i < 3 && <div style={{ flex: 1, height: 1, background: done ? '#0F938A' : '#D9E1E8', margin: '0 10px' }} />}
            </div>
          )
        })}
      </div>

      <div className="card" style={{ padding: 24 }}>
        {step === 1 && (
          <div>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 15, color: '#12324A', marginTop: 0, marginBottom: 16 }}>Select Matched Alert</h3>
            {SAMPLE_ALERTS.filter(a => a.risk === 'Critical' || a.risk === 'High').slice(0, 3).map((a, i) => (
              <div key={i} onClick={() => setStep(2)} style={{ border: '1px solid #D9E1E8', borderRadius: 6, padding: 14, marginBottom: 10, cursor: 'pointer', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#0F938A')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#D9E1E8')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12.5, fontWeight: 600, color: '#12324A' }}>{a.ref}</span>
                  <RiskBadge level={a.risk} />
                </div>
                <div style={{ fontSize: 12.5, color: '#667085' }}>{a.type} · {a.matchReason} · {a.institutions} institutions</div>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 15, color: '#12324A', marginTop: 0, marginBottom: 16 }}>Step 2: Request Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Investigation Reason *</label>
                <textarea className="input-field" rows={3} placeholder="State the legal basis and operational need for identity disclosure." style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Requested Information *</label>
                  <select className="input-field">
                    <option>Full name and account number</option>
                    <option>Contact details only</option>
                    <option>Account activity summary</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Urgency</label>
                  <select className="input-field">
                    <option>Standard (48h)</option>
                    <option>Urgent (24h)</option>
                    <option>Critical (4h)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Legal/Internal Authorisation Reference *</label>
                  <input className="input-field" placeholder="e.g. LEGAL-2026-004421" />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Supporting Document Reference</label>
                  <input className="input-field" placeholder="e.g. DOC-2026-00881" />
                </div>
              </div>
            </div>
          </div>
        )}

        {step >= 3 && (
          <div>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 15, color: '#12324A', marginTop: 0, marginBottom: 16 }}>
              Step {step}: {step === 3 ? 'Supervisor Review' : 'Owning Institution Review'}
            </h3>
            <div style={{ background: '#F5F7FA', borderRadius: 6, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#667085', marginBottom: 8 }}>
                {step === 3
                  ? 'This request is pending review by a fraud supervisor. The supervisor will evaluate the stated reason and authorisation before approving.'
                  : 'This request has been approved by the supervisor and is pending review by Airtel Mobile Commerce Uganda Limited (the owning institution).'}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button className="btn-primary" style={{ fontSize: 12, padding: '7px 14px' }} onClick={() => step < 4 ? setStep(s => s + 1) : setSubmitted(true)}>
                  {step === 3 ? 'Approve (Demo)' : 'Approve & Complete Disclosure (Demo)'}
                </button>
                <button className="btn-danger" style={{ fontSize: 12, padding: '7px 14px' }}>Reject</button>
                <button className="btn-secondary" style={{ fontSize: 12, padding: '7px 14px' }}>Request More Info</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px solid #D9E1E8' }}>
          <button className="btn-secondary" onClick={() => setStep(s => Math.max(1, s - 1))} style={{ visibility: step > 1 ? 'visible' : 'hidden' }}>
            <ArrowLeft size={14} />Back
          </button>
          {step < 3 && (
            <button className="btn-primary" onClick={() => setStep(s => s + 1)}>Next <ArrowRight size={14} /></button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

function AuditLogs() {
  const [search, setSearch] = useState('')
  const filtered = AUDIT_LOGS.filter(l =>
    !search || l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()) || l.ref.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: 28 }}>
      <SectionHeader
        title="Audit Logs"
        subtitle="Complete audit trail of all platform actions"
        actions={<button className="btn-secondary"><Download size={14} />Export Logs</button>}
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 320 }}>
          <Search size={14} color="#667085" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input className="input-field" style={{ paddingLeft: 32 }} placeholder="Search logs…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['User', 'Institution', 'Action', 'Result', 'Date Range'].map(f => (
          <select key={f} className="input-field" style={{ flex: '0 0 140px' }}>
            <option>{f}: All</option>
          </select>
        ))}
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Timestamp', 'User', 'Institution', 'Role', 'Action', 'Resource', 'Reference', 'IP Address', 'Result', 'Reason'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => (
                <tr key={i} className="table-row" style={{ borderTop: '1px solid #f0f4f8', cursor: 'pointer' }}>
                  <td style={{ padding: '10px 12px', fontSize: 11, fontFamily: 'JetBrains Mono', color: '#667085', whiteSpace: 'nowrap' }}>{log.ts}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12.5, color: '#12324A', fontWeight: 500, whiteSpace: 'nowrap' }}>{log.user}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: '#667085', whiteSpace: 'nowrap' }}>{log.institution}</td>
                  <td style={{ padding: '10px 12px', fontSize: 11.5, color: '#667085' }}>{log.role}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12.5, fontWeight: 600, color: '#12324A', whiteSpace: 'nowrap' }}>{log.action}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: '#667085' }}>{log.resource}</td>
                  <td style={{ padding: '10px 12px', fontSize: 11, fontFamily: 'JetBrains Mono', color: '#0F938A', fontWeight: 500, whiteSpace: 'nowrap' }}>{log.ref}</td>
                  <td style={{ padding: '10px 12px', fontSize: 11, fontFamily: 'JetBrains Mono', color: '#667085' }}>{log.ip}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: log.result === 'Success' ? '#198754' : '#C62828' }}>{log.result}</span>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 11.5, color: '#667085', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Indicator Catalogue ──────────────────────────────────────────────────────

function IndicatorCatalogue() {
  return (
    <div style={{ padding: 28 }}>
      <SectionHeader
        title="Indicator Catalogue"
        subtitle="Bank of Uganda approved fraud indicator codes · Schema v1.0"
        actions={
          <>
            <button className="btn-secondary"><BookOpen size={14} />View History</button>
            <button className="btn-secondary"><Plus size={14} />Propose Indicator</button>
          </>
        }
      />
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Indicator Code', 'Name', 'Definition', 'Default Severity', 'Version', 'Approval Date', 'Status', 'Approved By', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INDICATOR_CATALOGUE.map((ind, i) => (
                <tr key={i} className="table-row" style={{ borderTop: '1px solid #f0f4f8' }}>
                  <td style={{ padding: '12px 14px', fontSize: 11.5, fontFamily: 'JetBrains Mono', color: '#0F938A', fontWeight: 600 }}>{ind.code}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#12324A', fontWeight: 500, whiteSpace: 'nowrap' }}>{ind.name}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#667085', maxWidth: 220 }}>{ind.definition}</td>
                  <td style={{ padding: '12px 14px' }}><RiskBadge level={ind.severity} /></td>
                  <td style={{ padding: '12px 14px', fontSize: 12, fontFamily: 'JetBrains Mono', color: '#667085' }}>v{ind.version}</td>
                  <td style={{ padding: '12px 14px', fontSize: 11.5, fontFamily: 'JetBrains Mono', color: '#667085' }}>{ind.approvalDate}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: '#198754' }}>{ind.status}</span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#667085' }}>{ind.approvedBy}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: 11 }}>View</button>
                      <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: 11 }}>History</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Reports ──────────────────────────────────────────────────────────────────

function Reports() {
  return (
    <div style={{ padding: 28 }}>
      <SectionHeader
        title="Reports & Analytics"
        subtitle="Generate compliance, operational, and intelligence reports"
        actions={<button className="btn-primary"><Plus size={14} />Schedule Report</button>}
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {['Institution: All', 'Date: Jul 2026', 'Fraud Type: All', 'Risk Level: All', 'Region: All', 'Status: All'].map(f => (
          <select key={f} className="input-field" style={{ flex: '0 0 auto' }}>
            <option>{f}</option>
          </select>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { title: 'Fraud Trend Report', desc: 'Submission volume and type trends over time', icon: TrendingUp, color: '#0F938A' },
          { title: 'Institution Response Report', desc: 'Average investigation and response times by institution', icon: Building2, color: '#12324A' },
          { title: 'Cross-Institution Match Report', desc: 'Cross-entity fraud pattern matches and resolutions', icon: Network, color: '#C62828' },
          { title: 'Indicator Quality Report', desc: 'Data quality scores and submission accuracy', icon: CheckCircle, color: '#198754' },
          { title: 'Confirmed Cases Report', desc: 'Confirmed fraud cases and investigation outcomes', icon: FileText, color: '#D97706' },
          { title: 'Withdrawn Intelligence Report', desc: 'Records withdrawn and the reasons provided', icon: XCircle, color: '#667085' },
          { title: 'Audit Activity Report', desc: 'User activity and audit log summary', icon: ClipboardList, color: '#12324A' },
          { title: 'API Performance Report', desc: 'API health, request rates, and error rates', icon: Code2, color: '#0F938A' },
        ].map(({ title, desc, icon: Icon, color }) => (
          <div key={title} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A', marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 12.5, color: '#667085', lineHeight: 1.4 }}>{desc}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-primary" style={{ fontSize: 12, padding: '6px 12px', flex: 1, justifyContent: 'center' }}><Download size={13} />PDF</button>
              <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>CSV</button>
              <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}><Send size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── API & Integrations ───────────────────────────────────────────────────────

function APIIntegrations() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => { setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const exampleJson = `{
  "schema_version": "1.0",
  "incident_id": "FL-UG-2026-000245",
  "fraud_type": "ACCOUNT_TAKEOVER",
  "protected_subject_ref": "HMAC:8F92A7B4C91D...",
  "indicator_code": "RAPID_MULTI_WALLET_TRANSFER",
  "risk_level": "HIGH",
  "detected_at": "2026-07-11T14:32:00+03:00",
  "reporting_entity": "ENTITY-004",
  "status": "UNDER_INVESTIGATION",
  "retention_class": "ACTIVE_CASE"
}`

  return (
    <div style={{ padding: 28 }}>
      <SectionHeader title="API & Integrations" subtitle="Manage API credentials, webhooks, and integration configuration" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <MetricCard label="API Status" value="Online" icon={Activity} color="#198754" />
        <MetricCard label="Active API Keys" value="3" icon={Key} color="#0F938A" />
        <MetricCard label="Requests (24h)" value="12,481" icon={Zap} color="#12324A" />
        <MetricCard label="Failed Requests" value="14" icon={XCircle} color="#C62828" sub="(0.11% error rate)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* API Keys */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A', marginBottom: 16 }}>API Keys</div>
          {[
            { name: 'Production Key', prefix: 'flug_live_Ak3…', created: '2026-01-12', lastUsed: '2026-07-11 14:32', active: true },
            { name: 'Staging Key', prefix: 'flug_test_Bm7…', created: '2026-02-04', lastUsed: '2026-07-10 09:12', active: true },
          ].map((key, i) => (
            <div key={i} style={{ border: '1px solid #D9E1E8', borderRadius: 6, padding: 14, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#12324A' }}>{key.name}</div>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: '#198754' }}>{key.active ? 'Active' : 'Inactive'}</span>
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#667085', marginBottom: 8 }}>{key.prefix}</div>
              <div style={{ fontSize: 11.5, color: '#a3b4c0', marginBottom: 10 }}>Created {key.created} · Last used {key.lastUsed}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn-secondary" style={{ fontSize: 11.5, padding: '4px 8px' }} onClick={handleCopy}>
                  <Copy size={11} />{copied ? 'Copied!' : 'Copy'}
                </button>
                <button className="btn-secondary" style={{ fontSize: 11.5, padding: '4px 8px' }}><RotateCcw size={11} />Rotate</button>
                <button style={{ fontSize: 11.5, padding: '4px 8px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 4, cursor: 'pointer' }}>Revoke</button>
              </div>
            </div>
          ))}
          <button className="btn-primary" style={{ fontSize: 12.5, width: '100%', justifyContent: 'center' }}><Key size={13} />Generate New Key</button>
        </div>

        {/* Webhook */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A', marginBottom: 16 }}>Webhook Configuration</div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', display: 'block', marginBottom: 6 }}>Webhook URL</label>
            <input className="input-field" defaultValue="https://hooks.mtn.co.ug/fraudlink" />
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#12324A', marginBottom: 8 }}>Events</div>
          {['alert.generated', 'alert.status_changed', 'incident.matched', 'disclosure.decision'].map(ev => (
            <label key={ev} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 13, color: '#12324A', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: '#0F938A' }} />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}>{ev}</span>
            </label>
          ))}
          <button className="btn-primary" style={{ marginTop: 14, fontSize: 12.5 }}><Webhook size={13} />Save Webhook</button>
        </div>
      </div>

      {/* API Reference */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A', marginBottom: 14 }}>API Endpoints</div>
          {[
            { method: 'POST', path: '/api/v1/incidents', desc: 'Submit fraud incident' },
            { method: 'GET', path: '/api/v1/incidents/{id}', desc: 'Retrieve incident' },
            { method: 'GET', path: '/api/v1/alerts', desc: 'List alerts' },
            { method: 'GET', path: '/api/v1/alerts/{id}', desc: 'Alert detail' },
            { method: 'PATCH', path: '/api/v1/incidents/{id}/status', desc: 'Update status' },
            { method: 'GET', path: '/api/v1/audit', desc: 'Audit log' },
            { method: 'GET', path: '/api/v1/schema', desc: 'Schema version' },
          ].map(({ method, path, desc }) => (
            <div key={path} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f0f4f8' }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, fontFamily: 'JetBrains Mono', color: method === 'POST' ? '#198754' : method === 'PATCH' ? '#D97706' : '#0F938A', background: method === 'POST' ? '#d1fae5' : method === 'PATCH' ? '#fef3c7' : '#e0f2fe', padding: '2px 6px', borderRadius: 3, minWidth: 44, textAlign: 'center' }}>{method}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11.5, color: '#12324A', flex: 1 }}>{path}</span>
              <span style={{ fontSize: 11.5, color: '#667085' }}>{desc}</span>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A' }}>Example Payload</div>
            <button className="btn-secondary" style={{ fontSize: 11.5, padding: '4px 8px' }} onClick={handleCopy}>
              <Copy size={11} />{copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre style={{ background: '#0f1419', borderRadius: 6, padding: 16, fontSize: 11, fontFamily: 'JetBrains Mono', color: '#e8f4f8', margin: 0, overflow: 'auto', lineHeight: 1.7 }}>{exampleJson}</pre>
        </div>
      </div>
    </div>
  )
}

// ─── Users & Roles ────────────────────────────────────────────────────────────

function UsersRoles() {
  return (
    <div style={{ padding: 28 }}>
      <SectionHeader
        title="Users & Roles"
        subtitle="Manage platform users, roles, and permissions"
        actions={<button className="btn-primary"><UserPlus size={14} />Add User</button>}
      />

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['User', 'Email', 'Institution', 'Role', 'MFA', 'Status', 'Last Login', 'Created', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {USERS_TABLE.map((u, i) => (
                <tr key={i} className="table-row" style={{ borderTop: '1px solid #f0f4f8' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#12324A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#FFFFFF', flexShrink: 0 }}>
                        {u.name.split(' ').map(w => w[0]).join('')}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#12324A' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#667085', fontFamily: 'JetBrains Mono' }}>{u.email}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12.5, color: '#12324A' }}>{u.institution}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12.5, color: '#12324A' }}>{u.role}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: u.mfa === 'Enabled' ? '#198754' : '#C62828' }}>
                      {u.mfa === 'Enabled' ? '✓ ' : '✗ '}{u.mfa}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}><span style={{ fontSize: 11.5, fontWeight: 600, color: '#198754' }}>{u.status}</span></td>
                  <td style={{ padding: '12px 14px', fontSize: 11.5, color: '#667085', fontFamily: 'JetBrains Mono', whiteSpace: 'nowrap' }}>{u.lastLogin}</td>
                  <td style={{ padding: '12px 14px', fontSize: 11.5, color: '#667085', fontFamily: 'JetBrains Mono' }}>{u.createdAt}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn-secondary" style={{ padding: '3px 7px', fontSize: 11 }}>Edit</button>
                      <button style={{ padding: '3px 7px', fontSize: 11, background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 4, cursor: 'pointer' }}>Suspend</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role summary */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, color: '#12324A', marginBottom: 14 }}>Role Permissions Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {[
            { role: 'BoU Officer', color: '#8B0000', perms: ['View national statistics', 'View all institutions', 'Suspend institutions', 'Review compliance', 'View oversight alerts'] },
            { role: 'Institution Admin', color: '#12324A', perms: ['Manage users', 'Issue API credentials', 'Configure webhooks', 'View alerts', 'Notification settings'] },
            { role: 'Fraud Analyst', color: '#0F938A', perms: ['Submit intelligence', 'Review alerts', 'Investigate cases', 'Add notes', 'Request disclosure'] },
            { role: 'Fraud Supervisor', color: '#D97706', perms: ['Approve escalations', 'Assign investigations', 'Approve disclosures', 'Confirm intelligence', 'Review analyst work'] },
            { role: 'Compliance Auditor', color: '#667085', perms: ['View audit logs', 'Review access history', 'View data exports', 'Generate compliance reports'] },
          ].map(({ role, color, perms }) => (
            <div key={role} className="card" style={{ padding: 16 }}>
              <div style={{ borderLeft: `3px solid ${color}`, paddingLeft: 10, marginBottom: 12 }}>
                <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 13, color: '#12324A' }}>{role}</div>
              </div>
              {perms.map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 0', fontSize: 12, color: '#667085' }}>
                  <CheckCircle size={12} color={color} />
                  {p}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── USSD Simulator ───────────────────────────────────────────────────────────

function USSDSimulator() {
  const [step, setStep] = useState(0)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])

  const screens = [
    { content: 'MoMo FraudLink Uganda\n*284*90#\n\n1. Report Suspected Fraud\n2. Check Report Status\n3. Mobile Money Safety Information\n4. Exit', prompt: 'Enter choice:' },
    { content: 'Report Suspected Fraud\n\n1. Unknown Transaction\n2. PIN Request\n3. SIM-Swap Suspicion\n4. Stolen Phone\n5. Fraudulent Transfer\n\n0. Back', prompt: 'Enter choice:' },
    { content: 'Enter Transaction Reference\n(or leave blank if unknown)\n\n0. Back', prompt: 'Transaction ref:' },
    { content: 'Select Provider\n\n1. MTN Mobile Money Uganda Limited\n2. Airtel Mobile Commerce Uganda Limited\n3. Stanbic Bank Uganda Limited\n4. Centenary Rural Development Bank Limited\n\n0. Back', prompt: 'Enter choice:' },
    { content: 'Confirm Report\n\nType: Unknown Transaction\nReference: TXN-2026-881244\n\nThis report will be sent to your provider for verification before submission to the shared fraud intelligence platform.\n\n1. Confirm\n2. Cancel', prompt: 'Enter choice:' },
    { content: 'Report Submitted\n\nYour report reference: RPT-2026-443821\n\nYour institution will verify this report within 24 hours. You will receive an SMS notification.\n\nThank you for helping protect Uganda\'s financial system.', prompt: '' },
  ]

  const handleSubmit = () => {
    if (step < screens.length - 1) {
      setHistory([...history, `${screens[step].prompt} ${input}`])
      setInput('')
      setStep(s => Math.min(s + 1, screens.length - 1))
    }
  }

  const curr = screens[Math.min(step, screens.length - 1)]

  return (
    <div style={{ padding: 28 }}>
      <SectionHeader title="USSD Fraud-Reporting Simulator" subtitle="Optional consumer-reporting input channel" />

      <div style={{ background: '#fff7ed', border: '1px solid #fde68a', borderRadius: 6, padding: 12, marginBottom: 24, display: 'flex', gap: 10, maxWidth: 700 }}>
        <Info size={15} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>
          <strong>Optional consumer-reporting input.</strong> Reports must be verified by the customer's institution before being submitted to the shared fraud-intelligence exchange. Customer identity is handled by the owning institution only.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Phone mockup */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ width: 260, background: '#1a1a2e', borderRadius: 36, padding: 8, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ background: '#111', borderRadius: 28, overflow: 'hidden' }}>
              {/* Camera */}
              <div style={{ height: 28, background: '#0a0a14', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#333' }} />
              </div>
              {/* Screen */}
              <div style={{ background: '#0a0a14', minHeight: 420, padding: 16, display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1 }}>
                  {/* Signal bars */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 10, color: '#666', fontFamily: 'monospace' }}>
                    <span>MTN UG</span>
                    <span>▪▪▪▪ 3G</span>
                    <span>🔋 84%</span>
                  </div>
                  <div style={{ background: '#0f1419', borderRadius: 6, padding: 12, minHeight: 280, whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono', fontSize: 11, color: '#e8f4f8', lineHeight: 1.7 }}>
                    {curr.content}
                  </div>
                </div>
                {curr.prompt && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#666', marginBottom: 4 }}>{curr.prompt}</div>
                    <input
                      value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      style={{ width: '100%', background: '#0f1419', border: '1px solid #333', borderRadius: 4, padding: '6px 8px', color: '#e8f4f8', fontFamily: 'JetBrains Mono', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                    />
                    <button onClick={handleSubmit} style={{ width: '100%', marginTop: 6, background: '#0F938A', border: 'none', borderRadius: 4, padding: '7px', color: '#FFFFFF', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'Inter' }}>
                      Send
                    </button>
                  </div>
                )}
                {step === screens.length - 1 && (
                  <button onClick={() => { setStep(0); setHistory([]) }} style={{ marginTop: 10, width: '100%', background: 'transparent', border: '1px solid #333', borderRadius: 4, padding: '6px', color: '#666', fontSize: 11, cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
                    Start again
                  </button>
                )}
              </div>
              {/* Home bar */}
              <div style={{ height: 28, background: '#0a0a14', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: 60, height: 3, borderRadius: 2, background: '#333' }} />
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#667085' }}>Dial <strong style={{ fontFamily: 'JetBrains Mono' }}>*284*90#</strong></div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 260 }}>
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A', marginBottom: 12 }}>How it works</div>
            {[
              { n: 1, text: 'Customer dials *284*90# and selects report type' },
              { n: 2, text: 'Report is submitted to the customer\'s own institution' },
              { n: 3, text: 'Institution verifies the report against internal records' },
              { n: 4, text: 'If verified, institution submits to the shared fraud-intelligence exchange using the API' },
              { n: 5, text: 'Platform processes and checks for cross-institution matches' },
            ].map(({ n, text }) => (
              <div key={n} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#0F938A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#FFFFFF' }}>{n}</span>
                </div>
                <span style={{ fontSize: 13, color: '#12324A', lineHeight: 1.5, paddingTop: 2 }}>{text}</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#12324A', marginBottom: 10 }}>Report Categories</div>
            {['Unknown Transaction', 'PIN Request', 'SIM-Swap Suspicion', 'Stolen Phone', 'Fraudulent Transfer'].map((c, i) => (
              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #f0f4f8', fontSize: 13, color: '#12324A' }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#667085', flexShrink: 0 }}>{i + 1}</span>
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Settings (placeholder) ───────────────────────────────────────────────────

function SettingsScreen() {
  return (
    <div style={{ padding: 28, maxWidth: 700 }}>
      <SectionHeader title="Settings" subtitle="Notification, security, and platform configuration" />
      <div className="card" style={{ padding: 24 }}>
        {['Email Notifications', 'SMS Alerts', 'Webhook Events', 'Session Timeout (minutes)', 'Data Retention Class', 'Two-Factor Authentication'].map((setting, i) => (
          <div key={setting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f0f4f8' }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: '#12324A' }}>{setting}</div>
            </div>
            {i < 3 ? (
              <div style={{ width: 40, height: 22, borderRadius: 11, background: '#0F938A', position: 'relative', cursor: 'pointer' }}>
                <div style={{ position: 'absolute', right: 3, top: 3, width: 16, height: 16, borderRadius: '50%', background: '#FFFFFF' }} />
              </div>
            ) : (
              <input className="input-field" defaultValue={i === 3 ? '30' : i === 4 ? 'ACTIVE_CASE' : 'TOTP'} style={{ width: 160, textAlign: 'right' }} />
            )}
          </div>
        ))}
        <button className="btn-primary" style={{ marginTop: 20 }}>Save Settings</button>
      </div>
    </div>
  )
}

// ─── Main App Shell ───────────────────────────────────────────────────────────

export default function App() {
  const [phase, setPhase] = useState<'login' | 'mfa' | 'app'>('login')
  const [appState, setAppState] = useState<AppState>({
    screen: 'institution-dashboard',
    role: 'fraud-analyst',
    institution: 'MTN Mobile Money Uganda Limited',
    user: 'Aisha Nakato',
  })

  const handleLogin = (role: Role, institution: string) => {
    const userNames: Record<string, string> = {
      'MTN Mobile Money Uganda Limited': 'Aisha Nakato', 'Airtel Mobile Commerce Uganda Limited': 'Bernard Okonkwo',
      'Stanbic Bank Uganda Limited': 'Catherine Ssali', 'Centenary Rural Development Bank Limited': 'Daniel Mwanga',
      'Bank of Uganda': 'Joy Ochieng',
    }
    setAppState(s => ({
      ...s, role, institution,
      user: userNames[institution] || 'Platform User',
      screen: role === 'bou-officer' ? 'bou-dashboard' : 'institution-dashboard',
    }))
    setPhase('mfa')
  }

  const handleMFAVerify = () => { setPhase('app') }
  const handleLogout = () => { setPhase('login') }
  const navigate = (screen: Screen) => setAppState(s => ({ ...s, screen }))

  if (phase === 'login') return <LoginScreen onLogin={handleLogin} />
  if (phase === 'mfa') return <MFAScreen onVerify={handleMFAVerify} />

  const renderScreen = () => {
    switch (appState.screen) {
      case 'bou-dashboard': return <BoUDashboard onNavigate={navigate} />
      case 'institution-dashboard': return <InstitutionDashboard appState={appState} onNavigate={navigate} />
      case 'alerts': return <AlertsList onNavigate={navigate} />
      case 'alert-detail': return <AlertDetail onNavigate={navigate} />
      case 'incidents': return <Incidents onNavigate={navigate} />
      case 'submit-intel': return <SubmitIntelligence appState={appState} />
      case 'fraud-network': return <FraudNetwork />
      case 'institutions': return <Institutions onNavigate={navigate} />
      case 'institution-detail': return <InstitutionDetail onNavigate={navigate} />
      case 'disclosure-requests': return <DisclosureRequests />
      case 'audit-logs': return <AuditLogs />
      case 'indicator-catalogue': return <IndicatorCatalogue />
      case 'reports': return <Reports />
      case 'api-integrations': return <APIIntegrations />
      case 'users-roles': return <UsersRoles />
      case 'ussd-simulator': return <USSDSimulator />
      case 'settings': return <SettingsScreen />
      default: return <InstitutionDashboard appState={appState} onNavigate={navigate} />
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F5F7FA' }}>
      <Sidebar appState={appState} onNavigate={navigate} onLogout={handleLogout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar appState={appState} onNavigate={navigate} />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {renderScreen()}
        </main>
      </div>
    </div>
  )
}
