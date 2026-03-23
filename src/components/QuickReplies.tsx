import { useState, useEffect, useRef } from "react";
import { Zap, Search, X, Plus, Trash2, ChevronRight } from "lucide-react";

const DEFAULT_TEMPLATES = [
  { id: "1", shortcut: "/hi", text: "Hi! Thanks for reaching out to us. How can I help you today? 😊" },
  { id: "2", shortcut: "/hours", text: "Our business hours are Monday–Friday, 9 AM to 6 PM. We're closed on weekends and public holidays." },
  { id: "3", shortcut: "/human", text: "I'm connecting you with a human agent now. Please hold on for a moment — someone will be with you shortly!" },
  { id: "4", shortcut: "/thanks", text: "Thank you for contacting us! Is there anything else I can help you with?" },
  { id: "5", shortcut: "/wait", text: "I'm looking into this for you right now. Please give me just a moment! 🔍" },
];

interface Template {
  id: string;
  shortcut: string;
  text: string;
}

interface Props {
  onSelect: (text: string) => void;
  onClose: () => void;
}

const STORAGE_KEY = "velora_quick_replies";

function loadTemplates(): Template[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

function saveTemplates(templates: Template[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function QuickReplies({ onSelect, onClose }: Props) {
  const [templates, setTemplates] = useState<Template[]>(loadTemplates);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [newShortcut, setNewShortcut] = useState("");
  const [newText, setNewText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const filtered = templates.filter(
    (t) =>
      !search ||
      t.shortcut.toLowerCase().includes(search.toLowerCase()) ||
      t.text.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newText.trim()) return;
    const template: Template = {
      id: Date.now().toString(),
      shortcut: newShortcut.trim() || `/${Date.now()}`,
      text: newText.trim(),
    };
    const updated = [...templates, template];
    setTemplates(updated);
    saveTemplates(updated);
    setAdding(false);
    setNewShortcut("");
    setNewText("");
  };

  const handleDelete = (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    saveTemplates(updated);
  };

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full mb-2 left-0 right-0 bg-card border border-border rounded-2xl shadow-elevated overflow-hidden z-50 animate-slide-up"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-[13px] font-semibold text-foreground">Quick Replies</span>
          <span className="text-[11px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
            {templates.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAdding(!adding)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Add template"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates or type shortcut…"
            className="bg-transparent text-[13px] outline-none flex-1 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Add new */}
      {adding && (
        <div className="px-3 py-3 border-b border-border bg-muted/30 space-y-2">
          <input
            type="text"
            value={newShortcut}
            onChange={(e) => setNewShortcut(e.target.value)}
            placeholder="Shortcut (e.g. /promo)"
            className="w-full bg-muted rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-primary/30"
          />
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Message text…"
            rows={2}
            className="w-full bg-muted rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-primary/30 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!newText.trim()}
              className="flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              Save Template
            </button>
            <button
              onClick={() => setAdding(false)}
              className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-[12px] hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Template list */}
      <div className="max-h-64 overflow-auto">
        {filtered.length === 0 ? (
          <div className="px-4 py-6 text-center text-[13px] text-muted-foreground">
            {search ? `No templates match "${search}"` : "No templates yet. Add one above!"}
          </div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="group flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border last:border-0"
              onClick={() => onSelect(t.text)}
            >
              <code className="text-[11px] font-mono font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0">
                {t.shortcut}
              </code>
              <p className="text-[13px] text-foreground flex-1 leading-snug line-clamp-2">{t.text}</p>
              <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(t.id);
                  }}
                  className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
