import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/fetchHelper';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Plus, Trash2, Users, Heart, ShieldAlert, Award, FileText, Check } from 'lucide-react';

interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  relation: string;
  age: number;
  gender: string;
  medicalHistory: string;
}

export const Family: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('relationChild');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [medicalHistory, setMedicalHistory] = useState('');

  // Open drawer/modal toggle for adding members
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchMembers();
    }
  }, [user]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiFetch(`/api/family/${user?.id}`);
      if (!res.ok) {
        throw new Error('Failed to load family members');
      }
      const data = await res.json();
      setMembers(data);
    } catch (err: any) {
      setError(err.message || 'Error loading family data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name is required / नाम दर्ज करना आवश्यक है।');
      return;
    }

    const numAge = Number(age);
    if (!age || isNaN(numAge) || numAge <= 0 || numAge > 120) {
      setError('Please enter a valid age between 1 and 120 / कृपया १ और १२० के बीच सही उम्र दर्ज करें।');
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiFetch('/api/family/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          name: name.trim(),
          relation,
          age: numAge,
          gender,
          medicalHistory: medicalHistory.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Server error adding family member');
      }

      const data = await res.json();
      if (data.success) {
        setSuccess('Family member added successfully! / परिवार का सदस्य सफलतापूर्वक जोड़ा गया!');
        setName('');
        setAge('');
        setMedicalHistory('');
        setRelation('relationChild');
        setGender('Male');
        setShowAddForm(false);
        fetchMembers(); // refresh
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (err: any) {
      setError(err.message || 'Error saving family member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to remove this family member? / क्या आप इस सदस्य को हटाना चाहते हैं?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      const res = await apiFetch(`/api/family/${user?.id}/${memberId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete member');
      }

      const data = await res.json();
      if (data.success) {
        setSuccess('Member removed successfully / सदस्य सफलतापूर्वक हटाया गया');
        fetchMembers();
      } else {
        throw new Error('Failed to remove member');
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting member.');
    }
  };

  // Helper to translate relationship tags
  const getRelationText = (key: string) => {
    // If translations exists, return it, otherwise fallback
    return t(key) || key;
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header Hero Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 md:p-10 shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
          <Users size={200} />
        </div>
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
            <Heart size={12} className="fill-white" />
            <span>Family Wellness Registry</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            {t('familyTitle')}
          </h1>
          <p className="text-sm md:text-lg font-medium text-amber-50">
            {t('familySubtitle')}
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3 text-sm font-bold">
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center gap-3 text-sm font-bold">
          <Check size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Family Member Registry list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-foreground/90 uppercase tracking-wide flex items-center gap-2">
              <span>👥</span> Registered Dependents / पंजीकृत सदस्य
            </h2>
            
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all text-xs md:text-sm"
              >
                <Plus size={16} />
                {t('addMember')}
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-3xl space-y-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-muted-foreground font-semibold">Loading Family Tree...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center p-12 bg-card border border-dashed border-border rounded-3xl space-y-4">
              <span className="text-5xl block opacity-40">👨‍👩‍👧‍👦</span>
              <p className="text-sm font-bold text-muted-foreground">
                {t('noFamily')}
              </p>
              <p className="text-xs text-muted-foreground/60 max-w-md mx-auto">
                Adding parents, children, and spouses helps speed up their booking for telemedicine consultations and medicine deliveries under rural wellness guidelines.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-2xl shadow-md active:scale-95 transition-all text-xs"
              >
                <Plus size={16} />
                {t('addMember')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="group relative bg-card border border-border p-5 rounded-3xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-1">
                          {getRelationText(member.relation)}
                        </span>
                        <h3 className="font-black text-lg text-foreground tracking-tight group-hover:text-primary transition-colors">
                          {member.name}
                        </h3>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/15 dark:hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
                        title={t('removeMember')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-muted-foreground">
                      <div className="bg-background/50 p-2 rounded-xl border border-border/40">
                        <span className="text-[10px] text-muted-foreground/60 block">{t('ageYears')}</span>
                        <span className="text-foreground">{member.age} Yrs</span>
                      </div>
                      <div className="bg-background/50 p-2 rounded-xl border border-border/40">
                        <span className="text-[10px] text-muted-foreground/60 block">{t('gender')}</span>
                        <span className="text-foreground">{member.gender === 'Male' ? 'Male / पुरुष' : member.gender === 'Female' ? 'Female / महिला' : 'Other / अन्य'}</span>
                      </div>
                    </div>

                    {member.medicalHistory && (
                      <div className="bg-background/40 p-3 rounded-2xl border border-border/30 text-xs">
                        <span className="text-[10px] font-bold text-muted-foreground block mb-0.5 uppercase tracking-wide flex items-center gap-1">
                          <FileText size={10} /> Medical History / मेडिकल रिकॉर्ड
                        </span>
                        <p className="text-foreground/90 leading-relaxed italic">
                          "{member.medicalHistory}"
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-border/40 flex justify-between items-center text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      Ready for Doctor Call
                    </span>
                    <span className="font-bold text-primary">ID: {member.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Column: Add member form or wellness guidelines */}
        <div className="space-y-6">
          {showAddForm ? (
            <div className="bg-card border border-border p-6 rounded-3xl shadow-lg space-y-4 animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="font-black text-foreground flex items-center gap-2">
                  <span>➕</span> {t('addMember')}
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground px-2 py-1 bg-muted rounded-lg active:scale-95 transition-all"
                >
                  Cancel / रद्द
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-foreground/80 mb-1">{t('fullName')} / नाम</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold placeholder:text-muted-foreground/60 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground/80 mb-1">{t('relationship')} / रिश्ता</label>
                    <select
                      value={relation}
                      onChange={(e) => setRelation(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold transition-all"
                    >
                      <option value="relationChild">{t('relationChild')} / बच्चे</option>
                      <option value="relationSpouse">{t('relationSpouse')} / पति/पत्नी</option>
                      <option value="relationParent">{t('relationParent')} / माता-पिता</option>
                      <option value="relationSibling">{t('relationSibling')} / भाई-बहन</option>
                      <option value="relationOther">{t('relationOther')} / अन्य</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground/80 mb-1">{t('gender')} / लिंग</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold transition-all"
                    >
                      <option value="Male">Male / पुरुष</option>
                      <option value="Female">Female / महिला</option>
                      <option value="Other">Other / अन्य</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground/80 mb-1">{t('ageYears')} / उम्र</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    placeholder="Ex: 45"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold placeholder:text-muted-foreground/60 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground/80 mb-1">
                    {t('medicalHistory')} / स्वास्थ्य समस्याएँ
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ex: Sugar patient, allergies to penicillin / शुगर के मरीज, पेनिसिलिन से एलर्जी"
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold placeholder:text-muted-foreground/60 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md active:scale-95 transition-all text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register Member / सुरक्षित करें'}
                </button>
              </form>
            </div>
          ) : (
            /* Information side-card on family coverage benefits */
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900/60 dark:to-slate-900 border border-indigo-100 dark:border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="font-black text-sm text-indigo-900 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award size={16} />
                Dependent Coverage Benefits
              </h3>
              
              <ul className="space-y-3 text-xs text-indigo-950/80 dark:text-slate-300 leading-relaxed font-semibold">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 flex-shrink-0 mt-0.5">✔</span>
                  <span><strong>Village Plan Protection</strong>: Upgrade to a Rural Health Plan to cover up to 5 dependents at zero additional premium.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 flex-shrink-0 mt-0.5">✔</span>
                  <span><strong>Single Tap Doctor Call</strong>: Launch WebRTC video consults directly for any child or elderly parent on their behalf.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 flex-shrink-0 mt-0.5">✔</span>
                  <span><strong>Individual Prescriptions</strong>: Standardize clinical reports and PDFs separately for school, work, or local records.</span>
                </li>
              </ul>

              <div className="p-3 bg-white/50 dark:bg-black/10 rounded-2xl text-[10px] text-muted-foreground leading-relaxed flex items-start gap-2">
                <span>🛡</span>
                <span>Profiles are managed in compliance with National Digital Health Mission (NDHM) guidelines for patient consent safety.</span>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
