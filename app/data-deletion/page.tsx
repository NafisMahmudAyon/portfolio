import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Trash2, Mail, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'User Data Deletion Instructions | Nafis Mahmud Ayon',
  description:
    'Instructions for Facebook users to request deletion of their data associated with the NafisBD Bot application.',
  alternates: {
    canonical: '/data-deletion',
  },
};

export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-[#0d1117] text-gray-200 px-4 py-12 md:py-20 lg:px-8">
      <div className="max-w-3xl mx-auto bg-[#161b22] border border-gray-800 rounded-2xl p-6 md:p-12 shadow-2xl backdrop-blur-xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#00C26C] hover:underline mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portfolio
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Data Deletion Instructions</h1>
            <p className="text-sm text-gray-400">Meta Platform User Data Deletion Policy</p>
          </div>
        </div>

        <p className="mt-4 text-gray-300 leading-relaxed">
          The <strong>NafisBD Bot</strong> application (App ID: <code>1772730257342658</code>) respects user privacy and complies with Meta&apos;s Platform Data Deletion requirements. We do not store sensitive personal information or track personal profiles across the web.
        </p>

        <hr className="my-8 border-gray-800" />

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              How to Request Full Deletion of Your Data
            </h2>
            <p className="leading-relaxed mb-4">
              If you have interacted with our Facebook Page (<strong>Nafisbd</strong>) and would like any records of your comments, response logs, or Messenger interactions removed from our server databases, follow these simple steps:
            </p>

            <div className="bg-[#1c2128] border border-gray-700/60 rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#00C26C]/20 text-[#00C26C] text-sm font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-white">Send an Email Request</h3>
                  <p className="text-sm text-gray-300 mt-1">
                    Send an email to{' '}
                    <a href="mailto:nafismahmud0@gmail.com" className="text-[#00C26C] underline font-mono">
                      nafismahmud0@gmail.com
                    </a>{' '}
                    or{' '}
                    <a href="mailto:nafismahmudayon@gmail.com" className="text-[#00C26C] underline font-mono">
                      nafismahmudayon@gmail.com
                    </a>{' '}
                    with the subject line: <strong>&quot;Facebook Data Deletion Request&quot;</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#00C26C]/20 text-[#00C26C] text-sm font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-white">Provide Your Identifier</h3>
                  <p className="text-sm text-gray-300 mt-1">
                    Mention your Facebook Profile Name or the link to your comment so we can locate your record in our database.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#00C26C]/20 text-[#00C26C] text-sm font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-white">Permanent Deletion within 48 Hours</h3>
                  <p className="text-sm text-gray-300 mt-1">
                    Our team will delete all corresponding entries (comment IDs, reply records, and timestamps) from MongoDB within <strong>48 hours</strong> and send you a confirmation email with a confirmation code.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              How to Remove the App via Your Facebook Settings
            </h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-300">
              <li>Log in to your Facebook account.</li>
              <li>Go to <strong>Settings &amp; Privacy</strong> &gt; <strong>Settings</strong>.</li>
              <li>Scroll down to <strong>Apps and Websites</strong>.</li>
              <li>Find <strong>NafisBD Bot</strong> in the list.</li>
              <li>Click the <strong>Remove</strong> button next to the app name.</li>
            </ol>
          </section>

          <section className="bg-[#11161d] p-4 rounded-xl border border-gray-800 text-sm">
            <p>
              <strong>Data Controller:</strong> Nafis Mahmud Ayon | Portfolio: <a href="https://nafisbd.com" className="text-[#00C26C]">https://nafisbd.com</a>
            </p>
            <p className="mt-1">
              <strong>Support Email:</strong> <a href="mailto:nafismahmud0@gmail.com" className="text-[#00C26C]">nafismahmud0@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
