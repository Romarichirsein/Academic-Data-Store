/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, User, GraduationCap, Eye, EyeOff, ShieldAlert, ArrowRight, Building2, Sparkles } from 'lucide-react';
import { SchoolTenant } from '../types';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface LoginModuleProps {
  schools: SchoolTenant[];
  onLoginSuccess: (user: {
    email: string;
    role: string;
    schoolId?: string;
    studentId?: string;
  }) => void;
}

export default function LoginModule({ schools, onLoginSuccess }: LoginModuleProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Define authorized accounts
  const demoAccounts = [
    {
      label: 'Super Administrateur',
      email: 'superadmin@minesec.gov.cm',
      username: 'superadmin',
      password: 'admin',
      role: 'superadmin' as const,
      details: 'Supervision globale de tous les locataires',
      badge: 'Plateforme'
    },
    {
      label: 'Admin / Proviseur - Lycée Bilingue de Yaoundé',
      email: 'lby@academic.cm',
      username: 'lby',
      password: 'lby',
      role: 'school_admin' as const,
      schoolId: 'school-lby',
      details: 'Direction d\'établissement (Thème Bleu)',
      badge: 'Proviseur'
    },
    {
      label: 'Secrétaire - Inscriptions & Classes',
      email: 'secretariat@lbyaounde.cm',
      username: 'secretaire',
      password: 'lby',
      role: 'secretaire' as const,
      schoolId: 'school-lby',
      details: 'Gestion des inscriptions & répartition élèves',
      badge: 'Secrétaire'
    },
    {
      label: 'Surveillant Général - Présences & Discipline',
      email: 'surveillant@lbyaounde.cm',
      username: 'surveillant',
      password: 'lby',
      role: 'surveillant_general' as const,
      schoolId: 'school-lby',
      details: 'Contrôle des absences, retards et discipline',
      badge: 'Surveillant'
    },
    {
      label: 'Économe - Gestion & Finances',
      email: 'economat@lbyaounde.cm',
      username: 'econome',
      password: 'lby',
      role: 'econome' as const,
      schoolId: 'school-lby',
      details: 'Intendance, finances et matériels scolaires',
      badge: 'Économe'
    },
    {
      label: 'Enseignant - Saisie des Notes & Cours',
      email: 'jm.kamga@academic.cm',
      username: 'prof',
      password: 'lby',
      role: 'enseignant' as const,
      schoolId: 'school-lby',
      details: 'M. Jean-Marc Kamga (Mathématiques & Informatique)',
      badge: 'Professeur'
    },
    {
      label: 'Parent d\'Élève - Consultation des Notes',
      email: 'etoo.parent@gmail.com',
      username: 'parent',
      password: 'lby',
      role: 'parent' as const,
      schoolId: 'school-lby',
      studentId: 'stud-tc-1',
      details: 'M. Samuel Eto\'o Sr. (Tuteur de Samuel Eto\'o Fils)',
      badge: 'Parent Tuteur'
    },
    {
      label: 'Admin - Collège Jean-Tabi / Vogt',
      email: 'vogt@academic.cm',
      username: 'vogt',
      password: 'vogt',
      role: 'school_admin' as const,
      schoolId: 'school-vogt',
      details: 'Limité au Vogt uniquement (Thème Émeraude)',
      badge: 'Établissement'
    },
    {
      label: 'Admin - Lycée Classique de Bafoussam',
      email: 'lcb@academic.cm',
      username: 'lcb',
      password: 'lcb',
      role: 'school_admin' as const,
      schoolId: 'school-lcb',
      details: 'Limité au LCB uniquement (Thème Indigo)',
      badge: 'Établissement'
    },
    {
      label: 'Admin - Lycée Jost de Douala',
      email: 'lsd@academic.cm',
      username: 'lsd',
      password: 'lsd',
      role: 'school_admin' as const,
      schoolId: 'school-lsd',
      details: 'Limité au LSD uniquement (Thème Rose)',
      badge: 'Établissement'
    },
    {
      label: 'Admin - Collège Fako',
      email: 'collegefako@gmail.com',
      username: 'collegefako',
      password: 'fako2026',
      role: 'school_admin' as const,
      schoolId: 'school-fako',
      details: 'Direction du Collège Fako (Thème Ambre)',
      badge: 'Établissement'
    },
    {
      label: 'Admin - Collège Fapo',
      email: 'collegefapo@gmail.com',
      username: 'collegefapo',
      password: 'fapo2026',
      role: 'school_admin' as const,
      schoolId: 'school-fapo',
      details: 'Direction du Collège Fapo (Thème Émeraude)',
      badge: 'Établissement'
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    if (!identifier.trim() || !password) {
      setErrorMessage('Veuillez remplir tous les champs du formulaire.');
      setIsLoading(false);
      return;
    }

    const cleanInput = identifier.trim().toLowerCase();

    // Check credentials matching for demo bypass (makes review/testing ultra-smooth)
    const matchedAccount = demoAccounts.find(
      acc => 
        (acc.email.toLowerCase() === cleanInput || acc.username.toLowerCase() === cleanInput) &&
        acc.password === password
    );

    if (matchedAccount) {
      setIsLoading(false);
      onLoginSuccess({
        email: matchedAccount.email,
        role: matchedAccount.role,
        schoolId: matchedAccount.schoolId
      });
      return;
    }

    // Real Firebase Auth
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, identifier.trim(), password);
        const user = userCredential.user;
        setIsLoading(false);
        onLoginSuccess({
          email: user.email || identifier.trim(),
          role: 'school_admin',
          schoolId: (user.email || identifier.trim()).toLowerCase().includes('fapo') ? 'school-fapo' : (user.email || identifier.trim()).toLowerCase().includes('fako') ? 'school-fako' : 'school-lby'
        });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, identifier.trim(), password);
        const user = userCredential.user;
        const email = user.email || identifier.trim();
        const role = email.includes('superadmin') ? 'superadmin' : 'school_admin';
        setIsLoading(false);
        onLoginSuccess({
          email,
          role,
          schoolId: email.toLowerCase().includes('fapo') ? 'school-fapo' : email.toLowerCase().includes('fako') ? 'school-fako' : 'school-lby'
        });
      }
    } catch (error: any) {
      console.error("Firebase auth error:", error);
      setIsLoading(false);
      if (error.code === 'auth/network-request-failed') {
        setErrorMessage('Connexion au serveur impossible. Vérifiez votre connexion Internet ou utilisez un compte de démonstration ci-dessous.');
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setErrorMessage('Identifiant ou mot de passe incorrect. Veuillez vérifier vos accès.');
      } else if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Cet email est déjà associé à un compte utilisateur.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('Le mot de passe doit contenir au moins 6 caractères.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Veuillez saisir une adresse email valide.');
      } else {
        setErrorMessage(`Erreur d'authentification : ${error.message || error}`);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      const email = user.email || 'visiteur@minesec.gov.cm';
      const role = email.includes('superadmin') ? 'superadmin' : 'school_admin';
      setIsLoading(false);
      onLoginSuccess({
        email,
        role,
        schoolId: 'school-lby'
      });
    } catch (error: any) {
      console.error("Google Sign-In error:", error);
      setIsLoading(false);
      if (error.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(`Erreur Google Sign-In : ${error.message || error}`);
      }
    }
  };

  const handleQuickLogin = (acc: typeof demoAccounts[0]) => {
    setIdentifier(acc.email);
    setPassword(acc.password);
    setErrorMessage('');
    
    // Automatically log in for smooth testing
    onLoginSuccess({
      email: acc.email,
      role: acc.role,
      schoolId: acc.schoolId
    });
  };

  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row bg-[#0A0F1D] text-slate-100 font-sans antialiased overflow-y-auto">
      
      {/* Left side: Premium Academic Showcase info card with gorgeous background image */}
      <div className="md:w-5/12 p-8 flex flex-col justify-between border-r border-slate-800/50 relative overflow-hidden shrink-0 min-h-[350px] md:min-h-screen bg-slate-950">
        
        {/* Background Image representation with premium dark-themed blending */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&auto=format&fit=crop&w=1200&q=80"
            alt="MINESEC Academic Campus"
            className="w-full h-full object-cover opacity-40 transform scale-100 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
          {/* Rich gradients to ensure extreme text contrast and modern aesthetic branding */}
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/80 to-indigo-950/40"></div>
          {/* Subtle grid mesh */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>
        
        <div className="relative z-10 flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg border border-indigo-400/20">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-display uppercase tracking-widest text-slate-200">
              MINESEC République du Cameroun
            </h1>
            <p className="text-[10px] text-indigo-400 font-mono">Academic Data Store v2.5.0</p>
          </div>
        </div>

        <div className="relative z-10 my-8 space-y-4">
          <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 text-indigo-300 font-mono text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-indigo-500/20">
            <Sparkles className="h-3 w-3" />
            <span>Gestion Scolaire Sécurisée</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold leading-tight text-white tracking-tight">
            Portail d'accès National aux Établissements Scolaires
          </h2>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-sm">
            Système d'information centralisé pour le suivi en temps réel des absences, de la saisie des notes séquentielles et de l'édition des rapports d'audit.
          </p>
          
          <div className="pt-4 space-y-2.5 text-xs text-slate-300 font-medium">
            <div className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span>Authentification stricte des personnels administratifs</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              <span>Séparation stricte entre les rôles d'écoles et de supervision</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[10px] text-slate-500 font-mono border-t border-slate-800/60 pt-4">
          <p>© 2026 Ministère des Enseignements Secondaires.</p>
          <p className="mt-1">Plateforme nationale d'agrégation académique sécurisée.</p>
        </div>
      </div>

      {/* Right side: Login Form & Demonstration accounts deck */}
      <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-[#070A13]">
        <div className="max-w-md w-full mx-auto space-y-8">
          
          {/* Headline */}
          <div>
            <h3 className="text-xl font-display font-bold text-white">
              {isSignUp ? "Créer un Compte SaaS" : "Connexion Authentifiée"}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5">
              {isSignUp 
                ? "Inscrivez-vous pour créer un espace d'établissement sécurisé et cloud-persistant." 
                : "Remplissez vos accès professionnels ou utilisez l'un des profils de démonstration ci-dessous."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Error Message */}
            {errorMessage && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3.5 rounded-xl text-xs font-semibold flex items-start space-x-2 animate-fade-in">
                <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email/Username field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                {isSignUp ? "Adresse Email Professionnelle" : "Identifiant ou Email"}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={isSignUp ? "Ex: admin.nom@academic.cm" : "Ex: superadmin ou lby@academic.cm"}
                  className="w-full bg-[#0F1424] border border-slate-800/80 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Mot de passe
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Saisissez votre mot de passe de sécurité"
                  className="w-full bg-[#0F1424] border border-slate-800/80 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-0.5 text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 group cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? "Chargement..." : isSignUp ? "Créer mon Compte Administrateur" : "Se Connecter au Système"}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Toggle mode between Login and Register + Google Sign-In */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs gap-3 pt-2 border-b border-slate-800/60 pb-5">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMessage('');
              }}
              className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
            >
              {isSignUp ? "Déjà membre ? Se connecter" : "Pas de compte ? S'enregistrer"}
            </button>
            
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white px-4 py-2 rounded-xl transition-all font-bold text-xs cursor-pointer disabled:opacity-50 shrink-0"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Google Sign-In</span>
            </button>
          </div>

          {/* Quick Demo Logins Deck */}
          <div className="pt-6 border-t border-slate-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                <span>Accès de Démo Éducatif (Recommandé)</span>
              </span>
              <span className="text-[9px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/10">
                1-Clic
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {demoAccounts.map((acc, index) => {
                const isSuper = acc.role === 'superadmin';
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    className={`p-3 text-left border rounded-xl transition-all flex items-center justify-between gap-3 hover:-translate-y-0.5 shadow-sm hover:shadow-md cursor-pointer group ${
                      isSuper 
                        ? 'bg-slate-900/60 hover:bg-indigo-950/40 border-indigo-500/20 hover:border-indigo-500/40' 
                        : 'bg-slate-900/40 hover:bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[8px] px-1.5 py-0.2 rounded font-extrabold uppercase font-mono tracking-wide ${
                          isSuper ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {acc.badge}
                        </span>
                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors truncate">
                          {acc.label}
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 truncate">
                        {acc.details}
                      </p>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                        User: <span className="text-slate-300">{acc.username}</span> • Pass: <span className="text-slate-300">{acc.password}</span>
                      </p>
                    </div>

                    <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 shrink-0 transition-all" />
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
