import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Phone, Shield, Bell, Trash2, Camera,
  BarChart3, FileText, AlertTriangle, Check, X, Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchProfile } from '../api/client';
import './Profile.css';

const Profile = () => {
  const { user, updateUser, logout, t, language } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [emailAlerts, setEmailAlerts] = useState(user?.email_alerts ?? true);
  const [weeklyDigest, setWeeklyDigest] = useState(user?.weekly_digest ?? false);
  const [riskAlerts, setRiskAlerts] = useState(user?.risk_alerts ?? true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saved, setSaved] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stats, setStats] = useState({ contracts_analyzed: 0, clauses_flagged: 0, reports_generated: 0 });
  const [loadingProfile, setLoadingProfile] = useState(true);

  
  useEffect(() => {
    if (!user) return;
    setLoadingProfile(true);
    fetchProfile(user.id)
      .then(({ user: dbUser, stats: dbStats }) => {
        setName(dbUser.name || user.name || '');
        setPhone(dbUser.phone || '');
        setEmailAlerts(dbUser.email_alerts ?? true);
        setWeeklyDigest(dbUser.weekly_digest ?? false);
        setRiskAlerts(dbUser.risk_alerts ?? true);
        setStats({
          contracts_analyzed: Number(dbStats?.contracts_analyzed ?? 0),
          clauses_flagged: Number(dbStats?.clauses_flagged ?? 0),
          reports_generated: Number(dbStats?.contracts_analyzed ?? 0), 
        });
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, [user?.id]);

  const getInitials = (n: string) =>
    n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const showSaved = (section: string) => {
    setSaved(section);
    setTimeout(() => setSaved(null), 2500);
  };

  const handleSaveProfile = () => {
    updateUser({ name, phone, email_alerts: emailAlerts, weekly_digest: weeklyDigest, risk_alerts: riskAlerts });
    showSaved('profile');
  };

  const handleSavePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) return;
    showSaved('password');
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  const handleDeleteAccount = () => {
    logout();
    navigate('/login');
  };

  const statCards = [
    { label: t('profile.contractsAnalyzed'), value: String(stats.contracts_analyzed), icon: <FileText size={18} /> },
    { label: t('profile.clausesFlagged'), value: String(stats.clauses_flagged), icon: <AlertTriangle size={18} /> },
    { label: t('profile.reportsGenerated'), value: String(stats.reports_generated), icon: <BarChart3 size={18} /> },
  ];

  if (!user) { navigate('/login'); return null; }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar-lg">
            {user.photo
              ? <img src={user.photo} alt={user.name} className="profile-avatar-img" />
              : <span>{getInitials(user.name)}</span>
            }
          </div>
          <button className="profile-avatar-change" title="Change photo">
            <Camera size={14} />
          </button>
        </div>
        <div className="profile-header-info">
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-email-sub">{user.email}</p>
        </div>
      </div>

      
      <div className="profile-stats-row">
        {statCards.map((s, i) => (
          <div key={i} className="profile-stat-card">
            <div className="profile-stat-icon">{s.icon}</div>
            <div className="profile-stat-value">
              {loadingProfile ? <Loader2 size={16} className="animate-spin" /> : s.value}
            </div>
            <div className="profile-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="profile-body">
        
        <section className="profile-section">
          <div className="profile-section-header">
            <User size={16} className="profile-section-icon" />
            <h2>{t('profile.personalInfo')}</h2>
          </div>
          <div className="profile-section-body">
            <div className="profile-field">
              <label>{t('profile.displayName')}</label>
              <input
                id="profile-name"
                className="profile-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="profile-field">
              <label>{t('profile.email')}</label>
              <input
                className="profile-input readonly"
                value={user.email}
                readOnly
                placeholder="your@email.com"
              />
              <p className="profile-field-hint">{t('profile.email.readonly')}</p>
            </div>
            <div className="profile-field">
              <label>{t('profile.phone')}</label>
              <div className="profile-input-icon-wrap">
                <Phone size={14} className="profile-input-icon" />
                <input
                  id="profile-phone"
                  className="profile-input has-icon"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
            <button
              id="profile-save-btn"
              className="profile-save-btn"
              onClick={handleSaveProfile}
            >
              {saved === 'profile' ? <><Check size={14} /> Saved!</> : t('profile.saveChanges')}
            </button>
          </div>
        </section>

        
        <section className="profile-section">
          <div className="profile-section-header">
            <Shield size={16} className="profile-section-icon" />
            <h2>{t('profile.security')}</h2>
          </div>
          <div className="profile-section-body">
            <div className="profile-field">
              <label>{t('profile.currentPassword')}</label>
              <input
                id="current-password"
                type="password"
                className="profile-input"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="profile-field">
              <label>{t('profile.newPassword')}</label>
              <input
                id="new-password"
                type="password"
                className="profile-input"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="profile-field">
              <label>{t('profile.confirmPassword')}</label>
              <input
                id="confirm-password"
                type="password"
                className={`profile-input ${newPassword && confirmPassword && newPassword !== confirmPassword ? 'error' : ''}`}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="profile-field-error">{language === 'hi' ? 'पासवर्ड मेल नहीं खाते।' : 'Passwords do not match.'}</p>
              )}
            </div>
            <button
              id="save-password-btn"
              className="profile-save-btn"
              onClick={handleSavePassword}
              disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
            >
              {saved === 'password' ? <><Check size={14} /> Updated!</> : t('profile.changePassword')}
            </button>

            <div className="profile-divider" />
            <div className="profile-session-item">
              <div>
                <p className="profile-session-label">{t('profile.currentSession')}</p>
                <p className="profile-session-sub">{t('profile.currentSession.desc')}</p>
              </div>
              <span className="profile-session-badge">{t('common.active')}</span>
            </div>
          </div>
        </section>

        
        <section className="profile-section">
          <div className="profile-section-header">
            <Bell size={16} className="profile-section-icon" />
            <h2>{t('profile.notifications')}</h2>
          </div>
          <div className="profile-section-body">
            {[
              { id: 'email-alerts', label: t('profile.emailAlerts'), value: emailAlerts, set: setEmailAlerts },
              { id: 'weekly-digest', label: t('profile.weeklyDigest'), value: weeklyDigest, set: setWeeklyDigest },
              { id: 'risk-alerts', label: t('profile.riskAlerts'), value: riskAlerts, set: setRiskAlerts },
            ].map(n => (
              <div key={n.id} className="profile-toggle-row">
                <span className="profile-toggle-label">{n.label}</span>
                <button
                  id={n.id}
                  className={`profile-toggle ${n.value ? 'on' : ''}`}
                  onClick={() => n.set(!n.value)}
                  aria-label={n.label}
                >
                  <span className="profile-toggle-knob" />
                </button>
              </div>
            ))}
            <button
              id="save-notifications-btn"
              className="profile-save-btn"
              style={{ marginTop: '12px' }}
              onClick={handleSaveProfile}
            >
              {saved === 'profile' ? <><Check size={14} /> {language === 'hi' ? 'सहेजा गया!' : 'Saved!'}</> : t('common.save')}
            </button>
          </div>
        </section>

        
        <section className="profile-section danger">
          <div className="profile-section-header">
            <Trash2 size={16} className="profile-section-icon danger" />
            <h2>{t('profile.dangerZone')}</h2>
          </div>
          <div className="profile-section-body">
            <div className="danger-row">
              <div>
                <p className="danger-label">{t('profile.deleteAccount')}</p>
                <p className="danger-sub">{t('profile.deleteAccount.desc')}</p>
              </div>
              <button
                id="delete-account-btn"
                className="profile-delete-btn"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 size={13} /> {t('profile.deleteAccount')}
              </button>
            </div>

            <div className="danger-row" style={{ marginTop: '12px' }}>
              <div>
                <p className="danger-label">{t('profile.signOutAll')}</p>
                <p className="danger-sub">{t('profile.signOutAll.desc')}</p>
              </div>
              <button className="profile-danger-outline-btn" onClick={logout}>
                {t('profile.signOutAll')}
              </button>
            </div>
          </div>
        </section>
      </div>

      
      {showDeleteModal && (
        <div className="profile-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="profile-modal" onClick={e => e.stopPropagation()}>
            <div className="profile-modal-icon"><Trash2 size={24} /></div>
            <h3>{t('profile.deleteConfirm')}</h3>
            <p>{t('profile.deleteConfirm.desc')}</p>
            <div className="profile-modal-actions">
              <button className="profile-modal-cancel" onClick={() => setShowDeleteModal(false)}>
                <X size={14} /> {t('common.cancel')}
              </button>
              <button className="profile-modal-delete" onClick={handleDeleteAccount}>
                <Trash2 size={14} /> {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
