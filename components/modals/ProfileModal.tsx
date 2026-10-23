
import React, { useState } from 'react';
import { Lang, UserProfile } from '../../types';
import { User, Mail, Phone, Camera, Save, Shield } from 'lucide-react';

interface ProfileModalProps {
  user: UserProfile;
  onSave: (u: UserProfile) => void;
  lang: Lang;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onSave, lang }) => {
  const [formData, setFormData] = useState(user);

  const t = {
    profile: lang === 'ar' ? 'الملف الشخصي' : 'User Profile',
    name: lang === 'ar' ? 'الاسم الكامل' : 'Full Name',
    email: lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address',
    phone: lang === 'ar' ? 'رقم الهاتف' : 'Phone Number',
    save: lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes',
    desc: lang === 'ar' ? 'حدث بياناتك لتسهيل التواصل مع الوسطاء.' : 'Update your personal details to enable faster connection with agents.'
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full">
      <div className="max-w-md mx-auto">
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl sm:text-3xl font-bold border-4 border-white dark:border-slate-800 shadow-lg">
                    {formData.avatar ? <img src={formData.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" /> : formData.name.charAt(0)}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 truncate max-w-xs">{formData.email}</p>
            <div className={`mt-1 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold uppercase ${formData.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'}`}>
                {formData.role === 'admin' ? 'Administrator' : 'Standard User'}
            </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3 sm:space-y-4">
            <div className="text-xs sm:text-sm text-slate-500 mb-1">
                {t.desc}
            </div>

            {/* Name */}
            <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">{t.name}</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rtl:right-3 rtl:left-auto" />
                    <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full pl-10 rtl:pr-10 rtl:pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    />
                </div>
            </div>

            {/* Email */}
             <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">{t.email}</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rtl:right-3 rtl:left-auto" />
                    <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full pl-10 rtl:pr-10 rtl:pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    />
                </div>
            </div>

            {/* Phone */}
             <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">{t.phone}</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rtl:right-3 rtl:left-auto" />
                    <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full pl-10 rtl:pr-10 rtl:pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    />
                </div>
            </div>

            {/* Debug Role Switcher */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Debug: Access Level
                </label>
                <div className="flex gap-2">
                    <button 
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, role: 'guest'}))}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg border ${formData.role === 'guest' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                        Guest
                    </button>
                    <button 
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, role: 'admin'}))}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg border ${formData.role === 'admin' ? 'bg-red-600 text-white border-red-600' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                        Admin
                    </button>
                </div>
            </div>

            <button 
                onClick={() => onSave(formData)}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
                <Save className="w-4 h-4" />
                {t.save}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
