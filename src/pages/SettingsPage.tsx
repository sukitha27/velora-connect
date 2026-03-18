import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Webhook, Bell, Save, Loader2, Shield } from "lucide-react";
import { useSettings, useSaveSettings } from "@/hooks/use-data";
import { toast } from "sonner";

const SettingsPage = () => {
  const { data: savedSettings, isLoading } = useSettings();
  const saveSettings = useSaveSettings();

  const [settings, setSettings] = useState({
    n8n_webhook_url: "",
    notify_on_waiting: "true",
    notify_sound: "true",
    auto_assign: "false",
  });

  useEffect(() => {
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...savedSettings }));
    }
  }, [savedSettings]);

  const update = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleBool = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: prev[key as keyof typeof prev] === "true" ? "false" : "true" }));
  };

  const handleSave = () => {
    saveSettings.mutate(settings, {
      onSuccess: () => toast.success("Settings saved successfully"),
      onError: (err) => toast.error("Failed to save: " + (err as Error).message),
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Settings">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings">
      <div className="p-6 max-w-3xl space-y-6">
        {/* WhatsApp API Info */}
        <div className="bg-card rounded-xl border border-border shadow-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">WhatsApp Cloud API</h3>
              <p className="text-sm text-muted-foreground">API credentials are securely stored as encrypted secrets</p>
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p>Your WhatsApp API Token, Phone Number ID, and Verify Token are managed as secure environment secrets and cannot be viewed or edited from this page for security reasons.</p>
          </div>
        </div>

        {/* n8n Settings */}
        <div className="bg-card rounded-xl border border-border shadow-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Webhook className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">n8n Webhook Configuration</h3>
              <p className="text-sm text-muted-foreground">Configure the n8n workflow webhook for automation</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Webhook URL</label>
              <input
                type="url"
                value={settings.n8n_webhook_url}
                onChange={e => update("n8n_webhook_url", e.target.value)}
                className="w-full bg-muted rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                placeholder="https://your-n8n.com/webhook/..."
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-card rounded-xl border border-border shadow-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Notification Settings</h3>
              <p className="text-sm text-muted-foreground">Configure agent notifications</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { key: "notify_on_waiting", label: "Notify when customer is waiting for agent" },
              { key: "notify_sound", label: "Play notification sound" },
              { key: "auto_assign", label: "Auto-assign conversations to available agents" },
            ].map(item => (
              <label key={item.key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-foreground">{item.label}</span>
                <button
                  onClick={() => toggleBool(item.key)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings[item.key as keyof typeof settings] === "true" ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-sm transition-transform ${
                    settings[item.key as keyof typeof settings] === "true" ? "left-[calc(100%-1.375rem)]" : "left-0.5"
                  }`} />
                </button>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saveSettings.isPending}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saveSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saveSettings.isPending ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
