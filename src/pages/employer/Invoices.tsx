import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { Card, CardHeader, Button, Badge, Skeleton, EmptyState, Modal } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { timeTrackingService, type Invoice } from '@/services/timeTracking.service';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';

export function EmployerInvoices() {
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, [user, filter]);

  const loadInvoices = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await timeTrackingService.getEmployerInvoices(
        user.id,
        filter === 'all' ? undefined : filter
      );
      setInvoices(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      setMarkingPaid(true);
      await timeTrackingService.updateInvoiceStatus(invoiceId, 'paid');
      await loadInvoices();
      if (selectedInvoice?.id === invoiceId) {
        setShowInvoiceModal(false);
        setSelectedInvoice(null);
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      alert('Failed to mark invoice as paid');
    } finally {
      setMarkingPaid(false);
    }
  };

  const statusVariant: Record<Invoice['status'], 'warning' | 'info' | 'success' | 'error' | 'secondary'> = {
    draft: 'secondary',
    sent: 'info',
    viewed: 'info',
    paid: 'success',
    overdue: 'error',
    cancelled: 'error',
  };

  const totalOwed = invoices
    .filter(inv => ['sent', 'viewed', 'overdue'].includes(inv.status))
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-neutral-900">Invoices to Pay</h1>
                <p className="text-sm text-neutral-500 mt-1">Manage payments to your workers</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">Amount Owed</p>
                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalOwed)}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">Total Paid</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">Total Invoices</p>
                  <p className="text-2xl font-bold text-neutral-900">{invoices.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={filter === 'all' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'sent' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilter('sent')}
              >
                Unpaid
              </Button>
              <Button
                variant={filter === 'paid' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilter('paid')}
              >
                Paid
              </Button>
              <Button
                variant={filter === 'overdue' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilter('overdue')}
              >
                Overdue
              </Button>
            </div>
          </Card>

          {/* Invoices List */}
          <Card padding="none">
            <CardHeader title="Invoice List" subtitle="Invoices from your workers" />
            <div className="border-t border-neutral-100">
              {loading ? (
                <div className="p-4">
                  <Skeleton height={200} />
                </div>
              ) : invoices.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="bg-neutral-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Invoice #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Worker</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Issue Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Due Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {invoices.map(invoice => (
                      <tr key={invoice.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                          {invoice.invoice_number}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-600">
                          {(invoice as any).worker_info?.name || 'Unknown Worker'}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-600">
                          {format(new Date(invoice.issue_date), 'MMM d, yyyy')}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-600">
                          {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                          {formatCurrency(invoice.total_amount)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant[invoice.status]}>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowInvoiceModal(true);
                            }}
                          >
                            View
                          </Button>
                          {invoice.status !== 'paid' && (
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={() => handleMarkAsPaid(invoice.id)}
                            >
                              Mark Paid
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8">
                  <EmptyState
                    icon={
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    }
                    title="No Invoices Yet"
                    description="Invoices from workers will appear here once shifts are completed."
                  />
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="Invoice Details"
        size="lg"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="pb-4 border-b border-neutral-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900">{selectedInvoice.invoice_number}</h3>
                  <p className="text-sm text-neutral-500 mt-1">
                    Issued: {format(new Date(selectedInvoice.issue_date), 'MMMM d, yyyy')}
                  </p>
                </div>
                <Badge variant={statusVariant[selectedInvoice.status]} className="text-sm">
                  {selectedInvoice.status.toUpperCase()}
                </Badge>
              </div>
              
              {/* Worker Info */}
              {(selectedInvoice as any).worker_info && (
                <div className="bg-neutral-50 rounded-lg p-3 mt-3">
                  <p className="text-xs text-neutral-500 uppercase mb-1">Worker</p>
                  <p className="font-semibold text-neutral-900">{(selectedInvoice as any).worker_info.name}</p>
                </div>
              )}
              
              {/* Work Description */}
              {selectedInvoice.notes && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700 uppercase mb-1">Work Description</p>
                  <p className="text-sm text-blue-900 font-medium">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-neutral-500 uppercase">Work Period</p>
                <p className="text-sm font-medium text-neutral-900">
                  {format(new Date(selectedInvoice.period_start), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase">Due Date</p>
                <p className="text-sm font-medium text-neutral-900">
                  {format(new Date(selectedInvoice.due_date), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase">Payment Status</p>
                <p className="text-sm font-medium text-neutral-900">
                  {selectedInvoice.status === 'paid' ? 'Paid' : 'Pending'}
                </p>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-700 uppercase mb-3">Items</h4>
              <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                {(selectedInvoice as any).invoice_line_items && (selectedInvoice as any).invoice_line_items.length > 0 ? (
                  (selectedInvoice as any).invoice_line_items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-neutral-200 last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900">{item.description}</p>
                        <p className="text-xs text-neutral-500">
                          {item.quantity} × {formatCurrency(item.unit_price)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-neutral-900">{formatCurrency(item.amount)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-neutral-500 text-center py-4">No line items</p>
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-4 border-t border-neutral-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-medium text-neutral-900">{formatCurrency(selectedInvoice.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-neutral-300">
                <span className="text-neutral-900">Total</span>
                <span className="text-emerald-600">{formatCurrency(selectedInvoice.total_amount)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowInvoiceModal(false)} className="flex-1">
                Close
              </Button>
              {selectedInvoice.status !== 'paid' && (
                <Button 
                  className="flex-1" 
                  onClick={() => handleMarkAsPaid(selectedInvoice.id)}
                  disabled={markingPaid}
                >
                  {markingPaid ? 'Processing...' : 'Mark as Paid'}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
