import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  QrCode,
  Users,
  UserPlus,
  Settings,
  X,
  Save,
  Phone,
  Mail,
  MapPin,
  Calendar
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '../hooks/useTheme';
import { cacheMember } from '../utils/database';
import { Member, Cell, mockMembers, mockCells } from '../data/mockData';

type TabType = 'members' | 'cells' | 'reports';
type ModalType = 'member' | 'cell' | 'qr' | null;

interface FormData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cellId: string;
  cellName: string;
  membershipId: string;
  joinDate?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [cells] = useState<Cell[]>(mockCells);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cellId: '',
    cellName: '',
    membershipId: ''
  });

  // Filter members based on search and role
  const filteredMembers = members.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`;
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.status === filterRole;
    return matchesSearch && matchesRole;
  });

  // Open modal for editing
  const openEditModal = (type: ModalType, item?: any) => {
    setModalType(type);
    setSelectedItem(item);
    
    if (type === 'member' && item) {
      setFormData({
        id: item.id,
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email,
        phone: item.phone || '',
        cellId: item.cellId || '',
        cellName: item.cellName || '',
        membershipId: item.membershipId,
        joinDate: item.joinDate,
        status: item.status
      });
    } else if (type === 'member') {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        cellId: '',
        cellName: '',
        membershipId: ''
      });
    }
  };

  // Close modal
  const closeModal = () => {
    setModalType(null);
    setSelectedItem(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      cellId: '',
      cellName: '',
      membershipId: ''
    });
  };

  // Save member
  const saveMember = async () => {
    try {
      if (formData.id) {
        // Update existing member
        const updatedMember = {
          ...selectedItem,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          cellId: formData.cellId,
          cellName: formData.cellName,
          membershipId: formData.membershipId,
          status: formData.status || 'ACTIVE'
        };
        setMembers(prev => prev.map(m => m.id === formData.id ? updatedMember : m));
        await cacheMember({
          id: updatedMember.id,
          firstName: updatedMember.firstName,
          lastName: updatedMember.lastName,
          membershipId: updatedMember.membershipId,
          cellName: updatedMember.cellName,
          status: updatedMember.status
        });
      } else {
        // Create new member
        const newMember: Member = {
          id: `member_${Date.now()}`,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          membershipId: formData.membershipId || `MEM${Date.now()}`,
          cellId: formData.cellId,
          cellName: formData.cellName,
          joinDate: formData.joinDate || new Date().toISOString().split('T')[0],
          status: formData.status || 'ACTIVE'
        };
        setMembers(prev => [...prev, newMember]);
        await cacheMember({
          id: newMember.id,
          firstName: newMember.firstName,
          lastName: newMember.lastName,
          membershipId: newMember.membershipId,
          cellName: newMember.cellName,
          status: newMember.status
        });
      }
      closeModal();
    } catch (error) {
      console.error('Error saving member:', error);
    }
  };

  // Delete member
  const deleteMember = async (id: string) => {
    if (confirm('Are you sure you want to delete this member?')) {
      setMembers(prev => prev.filter(m => m.id !== id));
      // Note: In a real app, you'd also remove from the database
    }
  };

  // Generate QR code data
  const generateQRData = (member: Member) => {
    return JSON.stringify({
      id: member.id,
      name: `${member.firstName} ${member.lastName}`,
      email: member.email,
      phone: member.phone,
      membershipId: member.membershipId,
      cellName: member.cellName
    });
  };

  // Export data
  const exportData = () => {
    const data = filteredMembers.map(member => ({
      'First Name': member.firstName,
      'Last Name': member.lastName,
      Email: member.email,
      Phone: member.phone || '',
      'Membership ID': member.membershipId,
      'Cell Group': member.cellName || '',
      'Join Date': member.joinDate,
      Status: member.status
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `members_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const TabButton = ({ tab, label, icon: Icon }: { tab: TabType; label: string; icon: any }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 backdrop-blur-sm border ${
        activeTab === tab
          ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white border-green-500 shadow-lg'
          : 'bg-white/50 text-gray-700 border-white/30 hover:bg-white/70 hover:border-green-300'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </motion.button>
  );

  const StatCard = ({ icon: Icon, title, value, color }: {
    icon: any;
    title: string;
    value: string | number;
    color: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-800">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg ring-2 ring-white/30`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Beautiful Background with Logo-inspired Colors */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80')`
        }}
      ></div>
      
      {/* Logo-inspired gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/90 via-blue-50/90 to-green-100/90"></div>
      <div className="absolute inset-0 bg-white/80"></div>
      
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <pattern id="admin-dots" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.5" fill="#22C55E"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#admin-dots)"/>
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/30 backdrop-blur-lg border-b border-white/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-gray-700 font-medium mt-1">
                Manage members, cells, and attendance records
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg text-sm"
                onClick={() => window.location.hash = '#attendance'}
              >
                <Calendar className="w-4 h-4" />
                All Cells Attendance
              </motion.button>
              <TabButton tab="members" label="Members" icon={Users} />
              <TabButton tab="cells" label="Cells" icon={MapPin} />
              <TabButton tab="reports" label="Reports" icon={Calendar} />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Members"
            value={members.length}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={UserPlus}
            title="Active Members"
            value={members.filter(m => m.status === 'ACTIVE').length}
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={MapPin}
            title="Total Cells"
            value={cells.length}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            icon={Settings}
            title="Cell Leaders"
            value={cells.length}
            color="from-pink-500 to-pink-600"
          />
        </div>

        {/* Members Tab */}
        {activeTab === 'members' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 shadow-lg"
          >
            {/* Toolbar */}
            <div className="p-6 border-b border-white/30">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Filter */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="pl-10 pr-8 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openEditModal('member')}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    Add Member
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={exportData}
                    className="flex items-center gap-2 bg-white/50 text-gray-700 px-4 py-2 rounded-xl hover:bg-white/70 transition-all border border-white/30"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Members Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/40 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Cell Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/30">
                  {filteredMembers.map((member, index) => (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-white/40 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {`${member.firstName[0]}${member.lastName[0]}`.toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-800">
                              {`${member.firstName} ${member.lastName}`}
                            </div>
                            <div className="text-sm text-gray-600">
                              ID: {member.membershipId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-800">
                          <div className="flex items-center gap-1 mb-1">
                            <Mail className="w-3 h-3 text-gray-500" />
                            {member.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-500" />
                            {member.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-800">
                          {member.cellName || 'No Cell Assigned'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Member
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          member.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEditModal('qr', member)}
                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <QrCode className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEditModal('member', member)}
                            className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded-lg transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteMember(member.id)}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No members found matching your criteria
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Other tabs placeholder */}
        {activeTab === 'cells' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/20 p-8 shadow-lg text-center"
          >
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Cells Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Cell management interface coming soon
            </p>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/20 p-8 shadow-lg text-center"
          >
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Reports & Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Detailed reports and analytics coming soon
            </p>
          </motion.div>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {modalType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Member Form Modal */}
              {modalType === 'member' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedItem ? 'Edit Member' : 'Add New Member'}
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); saveMember(); }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Cell Group
                      </label>
                      <select
                        value={formData.cellId}
                        onChange={(e) => {
                          const selectedCell = cells.find(cell => cell.id === e.target.value);
                          setFormData(prev => ({ 
                            ...prev, 
                            cellId: e.target.value,
                            cellName: selectedCell?.name || ''
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Cell Group</option>
                        {cells.map(cell => (
                          <option key={cell.id} value={cell.id}>
                            {cell.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status || 'ACTIVE'}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'ACTIVE' | 'INACTIVE' }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* QR Code Modal */}
              {modalType === 'qr' && selectedItem && (
                <div className="p-6 text-center">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      QR Code
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="mb-6">
                    <div className="bg-white p-4 rounded-lg inline-block shadow-lg">
                      <QRCodeSVG
                        value={generateQRData(selectedItem)}
                        size={200}
                        level="M"
                        includeMargin
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {selectedItem.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {selectedItem.cellGroup}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Scan this QR code to mark attendance
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
