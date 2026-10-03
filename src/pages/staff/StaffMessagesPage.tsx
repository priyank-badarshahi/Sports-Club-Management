import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store';
import { 
  MessageSquare, 
  Mail, 
  Send, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Phone, 
  Copy, 
  Download, 
  Plus, 
  User, 
  X,
  FileText,
  Sparkles,
  Printer
} from 'lucide-react';
import { formatDateTime } from '../../lib/formatters';

export interface MessageLog {
  id: string;
  channel: 'whatsapp' | 'email' | 'sms';
  recipientName: string;
  recipientContact: string; // phone or email
  memberId?: string;
  subject?: string;
  body: string;
  triggerEvent: string; // e.g., 'Booking Confirmation', 'Overdue Invoice', 'Leave Approval', 'Low Stock Alert'
  status: 'delivered' | 'sent' | 'failed' | 'read';
  timestamp: string;
  senderName: string;
}

const INITIAL_MESSAGE_LOGS: MessageLog[] = [
  {
    id: 'msg_1',
    channel: 'whatsapp',
    recipientName: 'Vikram Malhotra',
    recipientContact: '+91 98401 22334',
    memberId: 'mem_1',
    body: 'Hi Vikram! Your Court 1 Tennis booking for Oct 3 at 18:00 is CONFIRMED. QR Code attached for fast gate access.',
    triggerEvent: 'Booking Confirmation',
    status: 'delivered',
    timestamp: '2026-10-03T09:30:00',
    senderName: 'Champions Concierge',
  },
  {
    id: 'msg_2',
    channel: 'email',
    recipientName: 'Anita Desai',
    recipientContact: 'anita.desai@corp.com',
    memberId: 'mem_2',
    subject: 'Membership Expiry Warning - 7 Days Remaining',
    body: 'Dear Anita, your Gold Membership at Champions Club will expire on Oct 10, 2026. Click here to renew and keep your 14-day booking privilege.',
    triggerEvent: 'Membership Expiry',
    status: 'delivered',
    timestamp: '2026-10-03T08:15:00',
    senderName: 'Automated Lifecycle Bot',
  },
  {
    id: 'msg_3',
    channel: 'sms',
    recipientName: 'Kabir Mehta',
    recipientContact: '+91 98401 55667',
    memberId: 'mem_3',
    body: 'Champions Club: Overdue Tab Notice. Your open bar tab of ₹1,450 is pending payment. Please settle online via your passport.',
    triggerEvent: 'Unpaid Tab Reminder',
    status: 'delivered',
    timestamp: '2026-10-02T19:45:00',
    senderName: 'Finance Desk',
  },
  {
    id: 'msg_4',
    channel: 'whatsapp',
    recipientName: 'Rohan Das',
    recipientContact: '+91 98401 77889',
    body: 'Hi Rohan, your Casual Leave request for Oct 8 - Oct 9 has been APPROVED by Manager Arjun Rao.',
    triggerEvent: 'Leave Request Approved',
    status: 'read',
    timestamp: '2026-10-01T14:05:00',
    senderName: 'HR Portal',
  },
  {
    id: 'msg_5',
    channel: 'email',
    recipientName: 'Sanjay Rawat (Head Chef)',
    recipientContact: 'sanjay.chef@championsclub.in',
    subject: 'LOW STOCK ALERT: Cold Brew Beans & Alkaline Water',
    body: 'Inventory Alert: Cold Brew Espresso Beans inventory dropped below reorder threshold (3.5kg remaining). Please place supplier order.',
    triggerEvent: 'Low Stock Warning',
    status: 'delivered',
    timestamp: '2026-10-02T11:20:00',
    senderName: 'Inventory Sentinel',
  },
];

export const StaffMessagesPage: React.FC = () => {
  const { members, addToast } = useAppStore();
  const [messages, setMessages] = useState<MessageLog[]>(INITIAL_MESSAGE_LOGS);
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'whatsapp' | 'email' | 'sms'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<MessageLog | null>(null);

  // New Message Broadcast Modal
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendForm, setSendForm] = useState({
    memberId: members[0]?.id || '',
    channel: 'whatsapp' as MessageLog['channel'],
    triggerEvent: 'Custom Broadcast',
    subject: '',
    body: 'Dear Member, enjoy 20% off all Babolat tennis strings at the Pro Shop this weekend!',
  });

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      if (selectedChannel !== 'all' && m.channel !== selectedChannel) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          m.recipientName.toLowerCase().includes(q) ||
          m.recipientContact.toLowerCase().includes(q) ||
          m.body.toLowerCase().includes(q) ||
          m.triggerEvent.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [messages, selectedChannel, searchQuery]);

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mem = members.find((m) => m.id === sendForm.memberId);
    if (!mem) return;

    const newMsg: MessageLog = {
      id: `msg_${Date.now()}`,
      channel: sendForm.channel,
      recipientName: mem.fullName,
      recipientContact: sendForm.channel === 'email' ? mem.email : mem.phone,
      memberId: mem.id,
      subject: sendForm.channel === 'email' ? (sendForm.subject || 'Notice from Champions Club') : undefined,
      body: sendForm.body,
      triggerEvent: sendForm.triggerEvent,
      status: 'delivered',
      timestamp: new Date().toISOString(),
      senderName: 'Staff Concierge Dispatcher',
    };

    setMessages([newMsg, ...messages]);
    setShowSendModal(false);
    addToast({
      type: 'success',
      title: 'Simulated Dispatch Success',
      message: `Message sent via ${sendForm.channel.toUpperCase()} to ${mem.fullName}.`,
    });
  };

  const exportCSV = () => {
    const csvHeader = 'Timestamp,Channel,Recipient,Contact,Trigger Event,Status,Body\n';
    const csvRows = messages
      .map((m) => `"${m.timestamp}","${m.channel}","${m.recipientName}","${m.recipientContact}","${m.triggerEvent}","${m.status}","${m.body.replace(/"/g, '""')}"`)
      .join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `champions_club_communications_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-lime-400">
            Omnichannel Communications Engine
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-1">
            Simulated Email / SMS / WhatsApp Dispatch Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Audit live automated lifecycle alerts, booking triggers, overdue reminders, and broadcast announcements.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-lime-400" />
            <span>Export Log CSV</span>
          </button>
          <button
            onClick={() => setShowSendModal(true)}
            className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-lg shadow-lime-400/20 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Send Broadcast Message</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
          <button
            onClick={() => setSelectedChannel('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedChannel === 'all'
                ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Channels ({messages.length})
          </button>
          <button
            onClick={() => setSelectedChannel('whatsapp')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              selectedChannel === 'whatsapp'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={() => setSelectedChannel('email')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              selectedChannel === 'email'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>
          <button
            onClick={() => setSelectedChannel('sms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              selectedChannel === 'sms'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>SMS</span>
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search message text, member, trigger..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
          />
        </div>
      </div>

      {/* Message Logs Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <span className="font-heading font-bold text-sm text-white">Live Dispatched Messages ({filteredMessages.length})</span>
          <span className="text-[11px] text-slate-400 font-mono">Status: Gateway Operational</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-3.5 px-4">Channel</th>
                <th className="py-3.5 px-4">Recipient</th>
                <th className="py-3.5 px-4">Trigger Event</th>
                <th className="py-3.5 px-4">Message Snippet</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Dispatched At</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    No message logs match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredMessages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      {msg.channel === 'whatsapp' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <MessageSquare className="w-3 h-3" /> WhatsApp
                        </span>
                      )}
                      {msg.channel === 'email' && (
                        <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-bold border border-sky-500/30 flex items-center gap-1 w-fit">
                          <Mail className="w-3 h-3" /> Email
                        </span>
                      )}
                      {msg.channel === 'sms' && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30 flex items-center gap-1 w-fit">
                          <Phone className="w-3 h-3" /> SMS
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{msg.recipientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{msg.recipientContact}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-semibold text-lime-400">{msg.triggerEvent}</span>
                      <div className="text-[9px] text-slate-500">Sender: {msg.senderName}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      {msg.subject && (
                        <div className="font-bold text-slate-200 text-[11px] truncate">{msg.subject}</div>
                      )}
                      <div className="text-slate-400 text-[11px] line-clamp-1">{msg.body}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 capitalize font-semibold flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> {msg.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {formatDateTime(msg.timestamp)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedMessage(msg)}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase text-lime-400">Dispatched Communication Payload</span>
                <h3 className="font-heading font-bold text-lg text-white mt-0.5">{selectedMessage.triggerEvent}</h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold block">Channel</span>
                  <span className="text-white capitalize font-semibold">{selectedMessage.channel}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold block">Recipient</span>
                  <span className="text-white font-semibold">{selectedMessage.recipientName}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold block">Contact Address</span>
                  <span className="text-lime-400 font-mono">{selectedMessage.recipientContact}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold block">Dispatched At</span>
                  <span className="text-slate-300 font-mono">{formatDateTime(selectedMessage.timestamp)}</span>
                </div>
              </div>

              {selectedMessage.subject && (
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Subject Line</label>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold">
                    {selectedMessage.subject}
                  </div>
                </div>
              )}

              <div>
                <label className="text-slate-400 font-bold block mb-1">Message Body</label>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.body}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-5 py-2 rounded-xl bg-lime-400 text-slate-950 font-bold text-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Manual Broadcast Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase text-lime-400">Broadcast Simulator</span>
                <h3 className="font-heading font-bold text-lg text-white mt-0.5">Send Simulated Member Message</h3>
              </div>
              <button
                onClick={() => setShowSendModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Select Target Member</label>
                <select
                  value={sendForm.memberId}
                  onChange={(e) => setSendForm({ ...sendForm, memberId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-lime-400"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberNumber}) - {m.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Channel</label>
                  <select
                    value={sendForm.channel}
                    onChange={(e) => setSendForm({ ...sendForm, channel: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-lime-400 uppercase font-bold"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Trigger Tag</label>
                  <input
                    type="text"
                    value={sendForm.triggerEvent}
                    onChange={(e) => setSendForm({ ...sendForm, triggerEvent: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>

              {sendForm.channel === 'email' && (
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Email Subject</label>
                  <input
                    type="text"
                    value={sendForm.subject}
                    onChange={(e) => setSendForm({ ...sendForm, subject: e.target.value })}
                    placeholder="e.g. Special Weekend Pro Shop Offer"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-lime-400"
                  />
                </div>
              )}

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Message Content</label>
                <textarea
                  rows={4}
                  value={sendForm.body}
                  onChange={(e) => setSendForm({ ...sendForm, body: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime-400 text-slate-950 font-bold shadow-md shadow-lime-400/20 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Dispatch Message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
