import { SimpleHeader } from '@/components/layout/SimpleHeader';
import { CalorieGoalSettings } from '@/components/settings/CalorieGoalSettings';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { ThemeSettings } from '@/components/settings/ThemeSettings';

// Configurações: meta diária, altura e peso (dados do usuário, salvos no
// backend) e aparência (preferência do navegador).
export function SettingsPage() {
  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <SimpleHeader
        title="Configurações"
        subtitle="Sua meta diária, altura e peso, e as cores da interface"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 mb-8 items-start">
        <CalorieGoalSettings />
        <ProfileSettings />
        <div className="lg:col-span-2">
          <ThemeSettings />
        </div>
      </div>
    </div>
  );
}
