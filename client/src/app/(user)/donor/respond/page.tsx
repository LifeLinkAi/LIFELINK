'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

const IcoBlood = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>;

function RespondContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const requestId = searchParams.get('requestId') || '';
  const token = searchParams.get('token') || '';

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
        if (response === 'ACCEPTED') {
          setTimeout(() => router.push('/donor/incoming-requests'), 2000);
        } else {
          setTimeout(() => router.push('/donor/dashboard'), 2000);
        }
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
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-[#dce6cf] shadow-sm p-8 text-center">
        <div className="w-20 h-20 bg-[#eef4e2] rounded-full flex items-center justify-center mx-auto mb-6 text-[#5b8a3e]">
          <IcoBlood />
        </div>
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-3">Respond to Request</h1>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          You have been matched with a life-saving request. Will you accept the call to donate? Your response directly impacts a patient in need.
        </p>

        {status === 'idle' || status === 'loading' ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => submitResponse('ACCEPTED')}
              disabled={status === 'loading'}
              className="flex-1 px-6 py-3.5 bg-[#5b8a3e] hover:bg-[#4a7232] text-white font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'Processing...' : 'Accept Request'}
            </button>
            <button
              onClick={() => submitResponse('DECLINED')}
              disabled={status === 'loading'}
              className="flex-1 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              Decline
            </button>
          </div>
        ) : null}

        {status === 'success' && (
          <div className="bg-[#eef4e2] border border-[#dce6cf] rounded-xl p-5 mt-4">
            <p className="text-[#3b5e2b] font-bold">{message}</p>
            <p className="text-sm text-[#5b8a3e] mt-2">Redirecting you momentarily...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 mt-4">
            <p className="text-red-700 font-bold">{message}</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-3 text-sm text-red-600 hover:underline font-medium"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DonorRespondPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#3b5e2b] border-t-transparent rounded-full animate-spin" /></div>}>
      <RespondContent />
    </Suspense>
  );
}
