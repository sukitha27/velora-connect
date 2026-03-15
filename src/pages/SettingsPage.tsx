import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Globe, Webhook, Bell, Save } from "lucide-react";

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    n8nWebhookUrl: "https://your-n8n-instance.com/webhook/whatsapp",
    whatsappApiToken: "",
    whatsappPhoneId: "",
    whatsappBusinessId: "",
    notifyOnWaiting: true,
    notifySound: true,
    autoAssign: false,
  });

  const update = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <DashboardLayout title="Settings">
      <div className="p-6 max-w-3xl space-y-6">
        {/* n8n Settings */}
        <div className="bg-card rounded-xl border border-border shadow-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Webhook className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">n8n Webhook Configuration</h3>
              <p className="text-sm text-muted-foreground">Configure the n8n workflow webhook for sending messages</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Webhook URL</label>
              <input
                type="url"
                value={settings.n8nWebhookUrl}
                onChange={e => update("n8nWebhookUrl", e.target.value)}
                className="w-full bg-muted rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                placeholder="https://your-n8n.com/webhook/..."
              />
            </div>
          </div>
        </div>

        {/* WhatsApp API Settings */}
        <div className="bg-card rounded-xl border border-border shadow-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">WhatsApp Cloud API</h3>
              <p className="text-sm text-muted-foreground">Meta WhatsApp Business API credentials</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">API Token</label>
              <input
                type="password"
                value={settings.whatsappApiToken}
                onChange={e => update("whatsappApiToken", e.target.value)}
                className="w-full bg-muted rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Enter your API token"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Phone Number ID</label>
                <input
                  type="text"
                  value={settings.whatsappPhoneId}
                  onChange={e => update("whatsappPhoneId", e.target.value)}
                  className="w-full bg-muted rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Phone Number ID"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Business Account ID</label>
                <input
                  type="text"
                  value={settings.whatsappBusinessId}
                  onChange={e => update("whatsappBusinessId", e.target.value)}
                  className="w-full bg-muted rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Business Account ID"
                />
              </div>
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
              { key: "notifyOnWaiting", label: "Notify when customer is waiting for agent" },
              { key: "notifySound", label: "Play notification sound" },
              { key: "autoAssign", label: "Auto-assign conversations to available agents" },
            ].map(item => (
              <label key={item.key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-foreground">{item.label}</span>
                <button
                  onClick={() => update(item.key, !settings[item.key as keyof typeof settings])}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings[item.key as keyof typeof settings] ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-sm transition-transform ${
                    settings[item.key as keyof typeof settings] ? "left-[calc(100%-1.375rem)]" : "left-0.5"
                  }`} />
                </button>
              </label>
            ))}
          </div>
        </div>

        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity">
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
