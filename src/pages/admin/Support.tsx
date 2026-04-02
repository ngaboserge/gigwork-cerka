import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { supabaseUntyped as supabase } from '@/lib/supabase';

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  user: {
    email: string;
    role: string;
  };
}

export default function AdminSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [response, setResponse] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user:user_id(email, role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      if (error) throw error;
      
      // Reload tickets
      await loadTickets();
      
      // Send notification to user
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        await supabase.from('notifications').insert({
          user_id: ticket.user_id,
          type: 'support_update',
          title: 'Support Ticket Updated',
          message: `Your support ticket "${ticket.subject}" status changed to ${newStatus}`,
          priority: 'normal',
        });
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const sendResponse = async () => {
    if (!selectedTicket || !response.trim()) return;

    try {
      // Update ticket status to in_progress if it's open
      if (selectedTicket.status === 'open') {
        await updateTicketStatus(selectedTicket.id, 'in_progress');
      }

      // Send notification with response
      await supabase.from('notifications').insert({
        user_id: selectedTicket.user_id,
        type: 'support_response',
        title: 'Support Team Response',
        message: response,
        priority: 'high',
      });

      setResponse('');
      setSelectedTicket(null);
      alert('Response sent successfully!');
    } catch (error) {
      console.error('Error sending response:', error);
      alert('Failed to send response');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'neutral';
      default: return 'neutral';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'normal': return 'text-blue-600 bg-blue-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredTickets = statusFilter === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === statusFilter);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-gray-600 mt-2">Manage user support requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Open</div>
              <div className="text-3xl font-bold text-red-600 mt-2">
                {tickets.filter(t => t.status === 'open').length}
              </div>
            </div>
            <div className="text-3xl">⚠️</div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">In Progress</div>
              <div className="text-3xl font-bold text-orange-600 mt-2">
                {tickets.filter(t => t.status === 'in_progress').length}
              </div>
            </div>
            <div className="text-3xl">⏱️</div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Resolved</div>
              <div className="text-3xl font-bold text-green-600 mt-2">
                {tickets.filter(t => t.status === 'resolved').length}
              </div>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Total</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {tickets.length}
              </div>
            </div>
            <div className="flex items-center justify-center w-12 h-12">
              <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setStatusFilter('all')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'open' ? 'primary' : 'secondary'}
            onClick={() => setStatusFilter('open')}
          >
            Open
          </Button>
          <Button
            variant={statusFilter === 'in_progress' ? 'primary' : 'secondary'}
            onClick={() => setStatusFilter('in_progress')}
          >
            In Progress
          </Button>
          <Button
            variant={statusFilter === 'resolved' ? 'primary' : 'secondary'}
            onClick={() => setStatusFilter('resolved')}
          >
            Resolved
          </Button>
        </div>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">
            No tickets found
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{ticket.subject}</h3>
                    <Badge variant={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    From: {ticket.user?.email} ({ticket.user?.role})
                  </p>
                  <p className="text-sm text-gray-700">{ticket.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Created: {new Date(ticket.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  Respond
                </Button>
                {ticket.status === 'open' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                  >
                    Start Working
                  </Button>
                )}
                {ticket.status === 'in_progress' && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                  >
                    Mark Resolved
                  </Button>
                )}
                {ticket.status === 'resolved' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => updateTicketStatus(ticket.id, 'closed')}
                  >
                    Close Ticket
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Response Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => {
          setSelectedTicket(null);
          setResponse('');
        }}
        title="Respond to Ticket"
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{selectedTicket.subject}</h4>
              <p className="text-sm text-gray-600">{selectedTicket.message}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Response
              </label>
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={6}
                placeholder="Type your response here..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedTicket(null);
                  setResponse('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={sendResponse}
                disabled={!response.trim()}
              >
                Send Response
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
    </Layout>
  );
}
