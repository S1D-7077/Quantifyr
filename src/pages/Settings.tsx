import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Building2, 
  Mail, 
  ShieldCheck, 
  CreditCard,
  Check,
  Save,
  Loader2,
  Calendar
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function Settings() {
  const { token, user: authUser } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userMetadata, setUserMetadata] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        setUserMetadata(json);
        setBusinessName(json.business_name);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchSettings();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ business_name: businessName })
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">Loading...</div>;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-zinc-500 mt-1">Manage your business profile and cost configurations.</p>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 space-y-10">
          {/* Profile Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-lg">Business Profile</h3>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Business Name</label>
                <input 
                  type="text" 
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Email Address</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-zinc-500">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-medium">{userMetadata?.email}</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-500 text-black py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    {success ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    {success ? 'Saved Successfully' : 'Save Changes'}
                  </>
                )}
              </button>
            </form>
          </section>

          <div className="border-t border-white/5 pt-10">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-lg">Account Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoBlock 
                icon={<Calendar className="w-4 h-4" />}
                label="Member Since"
                value={new Date(userMetadata?.created_at).toLocaleDateString()}
              />
              <InfoBlock 
                icon={<CreditCard className="w-4 h-4" />}
                label="Current Plan"
                value="Scale (Enterprise)"
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <section className="p-8 bg-red-500/5 border border-red-500/10 rounded-3xl">
          <h3 className="font-bold text-red-400 mb-2">Danger Zone</h3>
          <p className="text-sm text-zinc-500 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
          <button className="px-6 py-2 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold hover:bg-red-500 hover:text-white transition-all">
            Delete Business Data
          </button>
        </section>
      </div>
    </DashboardLayout>
  );
}

function InfoBlock({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
      <div className="flex items-center gap-2 text-zinc-500 mb-1">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}
