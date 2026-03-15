export interface Conversation {
  id: string;
  phone_number: string;
  customer_name: string;
  last_message: string;
  status: "active" | "waiting_agent" | "resolved" | "bot";
  created_at: string;
  unread?: boolean;
}

export interface Message {
  id: string;
  conversation_id: string;
  phone_number: string;
  message: string;
  sender_type: "user" | "bot" | "agent";
  timestamp: string;
}

export interface Lead {
  id: string;
  phone_number: string;
  customer_name: string;
  status: "new" | "waiting_agent" | "contacted" | "converted";
  created_at: string;
}

export const mockConversations: Conversation[] = [
  { id: "1", phone_number: "+1 (555) 234-5678", customer_name: "Sarah Johnson", last_message: "I'd like to know more about your premium plan", status: "waiting_agent", created_at: "2026-03-15T10:30:00Z", unread: true },
  { id: "2", phone_number: "+1 (555) 345-6789", customer_name: "Mike Chen", last_message: "Thank you for the information!", status: "active", created_at: "2026-03-15T09:15:00Z" },
  { id: "3", phone_number: "+1 (555) 456-7890", customer_name: "Emily Davis", last_message: "Can I speak to a human agent?", status: "waiting_agent", created_at: "2026-03-15T08:45:00Z", unread: true },
  { id: "4", phone_number: "+1 (555) 567-8901", customer_name: "James Wilson", last_message: "Got it, thanks!", status: "resolved", created_at: "2026-03-14T16:20:00Z" },
  { id: "5", phone_number: "+1 (555) 678-9012", customer_name: "Ana Martinez", last_message: "What are your business hours?", status: "bot", created_at: "2026-03-14T14:00:00Z" },
  { id: "6", phone_number: "+1 (555) 789-0123", customer_name: "Robert Taylor", last_message: "I need help with my order #4521", status: "waiting_agent", created_at: "2026-03-15T11:00:00Z", unread: true },
];

export const mockMessages: Record<string, Message[]> = {
  "1": [
    { id: "m1", conversation_id: "1", phone_number: "+1 (555) 234-5678", message: "Hi, I'm interested in your services", sender_type: "user", timestamp: "2026-03-15T10:00:00Z" },
    { id: "m2", conversation_id: "1", phone_number: "+1 (555) 234-5678", message: "Hello Sarah! Welcome to Velora AI. We offer several plans tailored to your needs. Would you like to know more about our Premium, Business, or Enterprise plans?", sender_type: "bot", timestamp: "2026-03-15T10:00:30Z" },
    { id: "m3", conversation_id: "1", phone_number: "+1 (555) 234-5678", message: "I'd like to know more about your premium plan", sender_type: "user", timestamp: "2026-03-15T10:30:00Z" },
  ],
  "3": [
    { id: "m4", conversation_id: "3", phone_number: "+1 (555) 456-7890", message: "Hello, I have a billing issue", sender_type: "user", timestamp: "2026-03-15T08:30:00Z" },
    { id: "m5", conversation_id: "3", phone_number: "+1 (555) 456-7890", message: "I'm sorry to hear that. Let me help you with your billing. Could you please provide your account number?", sender_type: "bot", timestamp: "2026-03-15T08:30:30Z" },
    { id: "m6", conversation_id: "3", phone_number: "+1 (555) 456-7890", message: "Can I speak to a human agent?", sender_type: "user", timestamp: "2026-03-15T08:45:00Z" },
  ],
};

export const mockLeads: Lead[] = [
  { id: "l1", phone_number: "+1 (555) 234-5678", customer_name: "Sarah Johnson", status: "waiting_agent", created_at: "2026-03-15T10:30:00Z" },
  { id: "l2", phone_number: "+1 (555) 456-7890", customer_name: "Emily Davis", status: "new", created_at: "2026-03-15T08:45:00Z" },
  { id: "l3", phone_number: "+1 (555) 789-0123", customer_name: "Robert Taylor", status: "waiting_agent", created_at: "2026-03-15T11:00:00Z" },
  { id: "l4", phone_number: "+1 (555) 111-2222", customer_name: "Lisa Park", status: "contacted", created_at: "2026-03-14T12:00:00Z" },
  { id: "l5", phone_number: "+1 (555) 333-4444", customer_name: "David Brown", status: "converted", created_at: "2026-03-13T09:00:00Z" },
];

export const analyticsData = {
  totalConversations: 1248,
  totalLeads: 342,
  messagesPerDay: [
    { day: "Mon", count: 145 },
    { day: "Tue", count: 198 },
    { day: "Wed", count: 176 },
    { day: "Thu", count: 210 },
    { day: "Fri", count: 189 },
    { day: "Sat", count: 95 },
    { day: "Sun", count: 72 },
  ],
  activeUsers: 89,
  conversionRate: 27.4,
  avgResponseTime: "1.2m",
  leadsByStatus: [
    { status: "New", count: 45 },
    { status: "Waiting", count: 28 },
    { status: "Contacted", count: 67 },
    { status: "Converted", count: 34 },
  ],
};
