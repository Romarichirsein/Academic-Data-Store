/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  UserCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  AlertCircle, 
  Lock, 
  Key, 
  Briefcase, 
  Mail, 
  Phone,
  Search,
  Filter,
  Check,
  X
} from 'lucide-react';
import { AdminRole, StaffMember, AdminRoleType, DEFAULT_ROLE_PERMISSIONS, SchoolTenant } from '../types';

interface RolesManagementModuleProps {
  roles: AdminRole[];
  setRoles: React.Dispatch<React.SetStateAction<AdminRole[]>>;
  staff: StaffMember[];
  setStaff: React.Dispatch<React.SetStateAction<StaffMember[]>>;
  activeSchoolId: string;
  activeSchool: SchoolTenant;
  addAuditLog?: (action: string, schoolId: string, details: string) => void;
}

export default function RolesManagementModule({
  roles,
  setRoles,
  staff,
  setStaff,
  activeSchoolId,
  activeSchool,
  addAuditLog
}: RolesManagementModuleProps) {
  const [activeTab, setActiveTab] = useState<'staff' | 'roles'>('staff');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  // Modal / Form states for Staff
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRoleType, setStaffRoleType] = useState<AdminRoleType>('secretaire');

  // Modal / Form states for Roles
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleLabel, setRoleLabel] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [roleType, setRoleType] = useState<AdminRoleType>('secretaire');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Feedback states
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Filter staff by active school
  const activeStaff = staff.filter(s => (s.schoolId || 'school-lby') === activeSchoolId);
  const activeRoles = roles.filter(r => (r.schoolId || 'school-lby') === activeSchoolId);

  const allAvailablePermissions = [
    { id: 'all', label: 'Accès Total Superviseur (Toutes permissions)' },
    { id: 'manage_staff', label: 'Gestion du personnel administratif' },
    { id: 'manage_roles', label: 'Création et configuration des rôles' },
    { id: 'manage_classes', label: 'Création et gestion des classes' },
    { id: 'manage_subjects', label: 'Création et gestion des matières' },
    { id: 'manage_teachers', label: 'Création et assignation des enseignants' },
    { id: 'manage_students', label: 'Inscription et répartition des élèves' },
    { id: 'enter_grades', label: 'Saisie et modification des notes' },
    { id: 'view_grades', label: 'Consultation des fiches de notes' },
    { id: 'validate_grades', label: 'Validation définitive et verrouillage des notes' },
    { id: 'manage_attendance', label: 'Saisie et contrôle des feuilles d\'appel' },
    { id: 'view_attendance', label: 'Consultation des statistiques d\'absences' },
    { id: 'view_audit', label: 'Consultation des journaux d\'audit de sécurité' }
  ];

  // Open modal to add/edit staff
  const handleOpenStaffModal = (member?: StaffMember) => {
    if (member) {
      setEditingStaffId(member.id);
      setStaffName(member.name);
      setStaffEmail(member.email);
      setStaffPhone(member.phone);
      setStaffRoleType(member.roleType);
    } else {
      setEditingStaffId(null);
      setStaffName('');
      setStaffEmail('');
      setStaffPhone('');
      setStaffRoleType('secretaire');
    }
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim()) {
      showNotification('Veuillez renseigner le nom et l\'adresse email.', 'error');
      return;
    }

    if (editingStaffId) {
      // Edit
      setStaff(prev => prev.map(s => {
        if (s.id === editingStaffId) {
          return {
            ...s,
            name: staffName.trim(),
            email: staffEmail.trim(),
            phone: staffPhone.trim(),
            roleType: staffRoleType,
            roleId: `role-${staffRoleType}`
          };
        }
        return s;
      }));
      addAuditLog?.('Modification Personnel', activeSchoolId, `Mise à jour du profil du personnel ${staffName} (${DEFAULT_ROLE_PERMISSIONS[staffRoleType]?.label || staffRoleType}).`);
      showNotification(`Membre du personnel "${staffName}" mis à jour avec succès.`);
    } else {
      // Create
      const newMember: StaffMember = {
        id: `staff-${Date.now()}`,
        name: staffName.trim(),
        email: staffEmail.trim(),
        phone: staffPhone.trim() || '+237 600 00 00 00',
        roleId: `role-${staffRoleType}`,
        roleType: staffRoleType,
        schoolId: activeSchoolId,
        isActive: true
      };
      setStaff(prev => [newMember, ...prev]);
      addAuditLog?.('Création Personnel', activeSchoolId, `Création d'un nouveau membre ${staffName} avec le rôle ${DEFAULT_ROLE_PERMISSIONS[staffRoleType]?.label}.`);
      showNotification(`Nouveau membre "${staffName}" ajouté à l'administration.`);
    }
    setIsStaffModalOpen(false);
  };

  const handleDeleteStaff = (member: StaffMember) => {
    if (confirm(`Êtes-vous sûr de vouloir retirer "${member.name}" de l'administration ?`)) {
      setStaff(prev => prev.filter(s => s.id !== member.id));
      addAuditLog?.('Suppression Personnel', activeSchoolId, `Retrait du personnel ${member.name} (${member.roleType}).`);
      showNotification(`"${member.name}" a été retiré de l'administration.`);
    }
  };

  const handleToggleStaffStatus = (member: StaffMember) => {
    const updatedStatus = !member.isActive;
    setStaff(prev => prev.map(s => s.id === member.id ? { ...s, isActive: updatedStatus } : s));
    addAuditLog?.('Statut Personnel', activeSchoolId, `Compte de ${member.name} ${updatedStatus ? 'activé' : 'désactivé'}.`);
    showNotification(`Compte ${updatedStatus ? 'activé' : 'suspendu'} pour ${member.name}.`);
  };

  // Open modal to add/edit Role
  const handleOpenRoleModal = (role?: AdminRole) => {
    if (role) {
      setEditingRoleId(role.id);
      setRoleLabel(role.label);
      setRoleDescription(role.description);
      setRoleType(role.type);
      setSelectedPermissions(role.permissions);
    } else {
      setEditingRoleId(null);
      setRoleLabel('');
      setRoleDescription('');
      setRoleType('secretaire');
      setSelectedPermissions(['view_grades', 'view_attendance']);
    }
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleLabel.trim()) {
      showNotification('Veuillez spécifier le titre du rôle.', 'error');
      return;
    }

    if (editingRoleId) {
      setRoles(prev => prev.map(r => {
        if (r.id === editingRoleId) {
          return {
            ...r,
            label: roleLabel.trim(),
            description: roleDescription.trim(),
            permissions: selectedPermissions
          };
        }
        return r;
      }));
      addAuditLog?.('Modification Rôle', activeSchoolId, `Configuration mise à jour pour le rôle "${roleLabel}".`);
      showNotification(`Rôle "${roleLabel}" mis à jour.`);
    } else {
      const newRole: AdminRole = {
        id: `role-custom-${Date.now()}`,
        type: roleType,
        label: roleLabel.trim(),
        description: roleDescription.trim() || 'Rôle administratif personnalisé',
        permissions: selectedPermissions.length > 0 ? selectedPermissions : ['view_grades'],
        schoolId: activeSchoolId
      };
      setRoles(prev => [...prev, newRole]);
      addAuditLog?.('Création Rôle', activeSchoolId, `Création du nouveau rôle administratif "${roleLabel}".`);
      showNotification(`Nouveau rôle "${roleLabel}" créé avec succès.`);
    }
    setIsRoleModalOpen(false);
  };

  const handleDeleteRole = (role: AdminRole) => {
    const count = activeStaff.filter(s => s.roleType === role.type).length;
    if (count > 0) {
      alert(`Impossible de supprimer le rôle "${role.label}" car ${count} membre(s) du personnel y sont actuellement affectés.`);
      return;
    }
    if (confirm(`Confirmez-vous la suppression du rôle "${role.label}" ?`)) {
      setRoles(prev => prev.filter(r => r.id !== role.id));
      addAuditLog?.('Suppression Rôle', activeSchoolId, `Suppression du rôle administratif "${role.label}".`);
      showNotification(`Le rôle "${role.label}" a été supprimé.`);
    }
  };

  // Filtered staff list
  const filteredStaff = activeStaff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.phone.includes(searchQuery);
    const matchesRole = selectedRoleFilter === 'all' || member.roleType === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeStyle = (type: AdminRoleType) => {
    switch (type) {
      case 'proviseur': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'censeur': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'surveillant_general': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'secretaire': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'econome': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'intendant': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'enseignant': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'parent': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-indigo-500/30">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
              <span>Gouvernance & Sécurité RBAC • {activeSchool.name}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold">
              Gestion des Rôles Administratifs & du Personnel
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Configurez les fonctions de l'administration scolaire (Secrétaire, Surveillant Général, Économe, Censeur, Proviseur) et attribuez les habilitations d'accès sécurisées.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenStaffModal()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter un Personnel</span>
            </button>
            <button
              onClick={() => handleOpenRoleModal()}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Key className="h-4 w-4 text-indigo-400" />
              <span>Nouveau Rôle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center space-x-2 animate-fade-in ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-rose-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-2 rounded-xl border shadow-xs gap-2">
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'staff'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Annuaire du Personnel ({activeStaff.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'roles'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Matrice des Rôles & Habilitations ({activeRoles.length})</span>
        </button>
      </div>

      {/* Tab 1: Staff Directory */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un membre par nom, email ou téléphone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none"
              >
                <option value="all">Tous les rôles</option>
                <option value="proviseur">Proviseur / Directeur</option>
                <option value="censeur">Censeur</option>
                <option value="surveillant_general">Surveillant Général</option>
                <option value="secretaire">Secrétaire</option>
                <option value="econome">Économe / Intendant</option>
                <option value="enseignant">Enseignant</option>
                <option value="parent">Parent d'élève</option>
              </select>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                    <th className="p-4 pl-6">Personnel</th>
                    <th className="p-4">Rôle Administratif</th>
                    <th className="p-4">Contact Professionnel</th>
                    <th className="p-4 text-center">Statut Accès</th>
                    <th className="p-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                        Aucun membre du personnel trouvé pour ces critères.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((member) => {
                      const roleConfig = DEFAULT_ROLE_PERMISSIONS[member.roleType];
                      return (
                        <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center space-x-3">
                              <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                                {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-sm">{member.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono">ID: {member.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getRoleBadgeStyle(member.roleType)}`}>
                              {roleConfig?.label || member.roleType}
                            </span>
                            <p className="text-[10px] text-slate-500 mt-1 max-w-xs truncate">
                              {roleConfig?.description}
                            </p>
                          </td>
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-1.5 text-slate-700">
                                <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                                <span className="font-mono text-[11px]">{member.email}</span>
                              </div>
                              <div className="flex items-center space-x-1.5 text-slate-500">
                                <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                                <span className="font-mono text-[11px]">{member.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleToggleStaffStatus(member)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer transition-all ${
                                member.isActive 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              }`}
                              title="Cliquer pour activer/suspendre"
                            >
                              {member.isActive ? '● Actif' : '○ Suspendu'}
                            </button>
                          </td>
                          <td className="p-4 text-right pr-6">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => handleOpenStaffModal(member)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Modifier"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteStaff(member)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Roles & Permissions Matrix */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeRoles.map((role) => {
            const staffCount = activeStaff.filter(s => s.roleType === role.type).length;
            return (
              <div key={role.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRoleBadgeStyle(role.type)}`}>
                      {role.type}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenRoleModal(role)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                        title="Modifier le rôle"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Supprimer le rôle"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{role.label}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{role.description}</p>
                  </div>

                  {/* Permissions list */}
                  <div className="border-t border-slate-100 pt-3 space-y-1.5">
                    <p className="text-[10px] font-mono uppercase font-bold text-slate-400">Habilitations accordées :</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((p) => {
                        const permLabel = allAvailablePermissions.find(ap => ap.id === p)?.label || p;
                        return (
                          <span key={p} className="bg-slate-100 text-slate-700 text-[9px] px-2 py-0.5 rounded font-mono font-medium truncate max-w-full" title={permLabel}>
                            ✓ {p}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Effectif affecté :</span>
                  <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">{staffCount} personne(s)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Staff Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingStaffId ? 'Modifier le Membre Administratif' : 'Nouveau Membre du Personnel'}
              </h3>
              <button onClick={() => setIsStaffModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Nom complet & Titre *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mme Christine Ngo Bassong"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Rôle dans l'Administration *</label>
                <select
                  value={staffRoleType}
                  onChange={(e) => setStaffRoleType(e.target.value as AdminRoleType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none"
                >
                  <option value="proviseur">Proviseur / Direction Générale</option>
                  <option value="censeur">Censeur (Validation pédagogique)</option>
                  <option value="surveillant_general">Surveillant Général (Discipline & Présences)</option>
                  <option value="secretaire">Secrétaire (Inscriptions & Dossiers)</option>
                  <option value="econome">Économe (Finances & Facturation)</option>
                  <option value="intendant">Intendant (Matériel & Logistique)</option>
                  <option value="enseignant">Enseignant / Professeur</option>
                  <option value="parent">Parent d'élève / Tuteur</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Email Professionnel *</label>
                  <input
                    type="email"
                    required
                    placeholder="nom@lbyaounde.cm"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Téléphone Mobile</label>
                  <input
                    type="tel"
                    placeholder="+237 600 00 00 00"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-md"
                >
                  {editingStaffId ? 'Enregistrer les modifications' : 'Créer le Membre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingRoleId ? 'Configurer le Rôle Administratif' : 'Créer un Nouveau Rôle'}
              </h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="p-6 space-y-4 text-xs overflow-y-auto flex-1 custom-scrollbar">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Libellé du Rôle *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Responsable Scolarité & Examens"
                  value={roleLabel}
                  onChange={(e) => setRoleLabel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Type de Base</label>
                <select
                  value={roleType}
                  onChange={(e) => setRoleType(e.target.value as AdminRoleType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none"
                >
                  <option value="secretaire">Secrétariat & Gestion</option>
                  <option value="surveillant_general">Surveillance Générale</option>
                  <option value="econome">Économat & Comptabilité</option>
                  <option value="censeur">Censure Pédagogique</option>
                  <option value="proviseur">Direction d'établissement</option>
                  <option value="intendant">Intendance & Ressources</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Description des Attributions</label>
                <textarea
                  rows={2}
                  placeholder="Rôle chargé de coordonner..."
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-700 block">Permissions granulaires accordées</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {allAvailablePermissions.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.id);
                    return (
                      <label key={perm.id} className="flex items-center space-x-2 text-slate-700 cursor-pointer hover:bg-slate-100/70 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions(prev => [...prev, perm.id]);
                            } else {
                              setSelectedPermissions(prev => prev.filter(p => p !== perm.id));
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-0"
                        />
                        <span className="text-[11px] font-medium">{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer shadow-md"
                >
                  {editingRoleId ? 'Sauvegarder les Habilitations' : 'Créer le Rôle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
