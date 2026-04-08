import React from 'react';

interface SettingsSectionProps {
  id: string;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ id, title, icon: Icon, children }) => {
  return (
    <section
      id={id}
      className="mb-8 scroll-mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
    >
      <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="rounded-xl bg-purple-500/20 p-2">
          <Icon size={20} className="text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
};

export default SettingsSection;
