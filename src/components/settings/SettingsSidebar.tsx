import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { SETTINGS_SIDEBAR_LINKS } from '../../utils/settings.utils';

interface SettingsSidebarProps {
  onBack: () => void;
  onSelectSection: (id: string) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ onBack, onSelectSection }) => {
  return (
    <aside className="hidden w-64 flex-col border-r border-white/10 bg-black/50 p-6 md:flex">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>
      <h1 className="mb-8 text-2xl font-bold tracking-wide text-white">Settings</h1>
      <nav className="custom-scrollbar flex flex-1 flex-col gap-2 overflow-y-auto pr-2">
        {SETTINGS_SIDEBAR_LINKS.map((link) => (
          <button
            key={link.id}
            onClick={() => onSelectSection(link.id)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <link.icon size={18} />
            {link.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default SettingsSidebar;
