'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

export default function DonorRespondPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // no-op; we'll wait for button click
  }, []);

  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const requestId = params?.get('requestId') || '';
  const token = params?.get('token') || '';

  const submitResponse = async (response: 'ACCEPTED' | 'DECLINED') => {
    if (!requestId || !token) {
      toast.error('Missing requestId or token in link.');
      return;
    }
    setStatus('loading');
    try {
      const res = await api.post(`/requests/${requestId}/respond`, { token, response });
      if (res?.data?.success) {
        setStatus('success');
        setMessage(res.data.message || 'Response recorded.');
        toast.success(res.data.message || 'Response recorded.');
      } else {
        setStatus('error');
        setMessage('Unexpected server response.');
        toast.error('Unexpected server response.');
      }
    } catch (err: any) {
      setStatus('error');
      const msg = err?.response?.data?.error?.message || err?.message || 'Failed to send response.';
      setMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Respond to Request</h1>
      <p className="mb-4">Request: <strong>{requestId || '—'}</strong></p>
      <div className="flex gap-3">
        <button onClick={() => submitResponse('ACCEPTED')} disabled={status === 'loading'} className="px-4 py-2 bg-green-600 text-white rounded">Accept</button>
        <button onClick={() => submitResponse('DECLINED')} disabled={status === 'loading'} className="px-4 py-2 bg-red-600 text-white rounded">Decline</button>
      </div>
      {status === 'success' && <p className="mt-4 text-green-700">{message}</p>}
      {status === 'error' && <p className="mt-4 text-red-700">{message}</p>}
    </div>
  );
}
