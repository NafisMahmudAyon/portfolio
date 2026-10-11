import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Trash2, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Nafis Mahmud Ayon (NafisBD)',
  description:
    'Privacy Policy and Data Protection guidelines for Nafis Mahmud Ayon portfolio, services, and NafisBD Bot automated Facebook applications.',
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'October 11, 2026';

  return (
    <main className="min-h-screen bg-[#0d1117] text-gray-200 px-4 py-12 md:py-20 lg:px-8">
      <div className="max-w-4xl mx-auto bg-[#161b22] border border-gray-800 rounded-2xl p-6 md:p-12 shadow-2xl backdrop-blur-xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#00C26C] hover:underline mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portfolio
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[#00C26C]/10 border border-[#00C26C]/30 rounded-xl text-[#00C26C]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Privacy Policy</h1>
            <p className="text-sm text-gray-400">Last Updated: {lastUpdated}</p>
          </div>
        </div>

        <p className="mt-4 text-gray-300 leading-relaxed">
          Welcome to <strong>Nafis Mahmud Ayon</strong> (&quot;NafisBD&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), accessible from{' '}
          <a href="https://nafisbd.com" className="text-[#00C26C] hover:underline">
            https://nafisbd.com
          </a>
          . This Privacy Policy outlines how our website and automated social integrations, including the{' '}
          <strong>NafisBD Bot</strong> Facebook application (App ID: 1772730257342658), collect, use, and protect your information.
        </p>

        <hr className="my-8 border-gray-800" />

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-[#00C26C]">1.</span> Information We Collect
            </h2>
            <p className="leading-relaxed mb-3">
              When you interact with our website or our official Facebook Page (<strong>Nafisbd</strong>), we may process the following minimal data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>
                <strong>Public Facebook Comments & Metadata:</strong> When you leave a public comment on a post on our Facebook Page, we receive the public comment text, public Facebook user name, comment ID, and post ID via Meta Graph API Webhooks.
              </li>
              <li>
                <strong>Contact Inquiries:</strong> Information you voluntarily provide through our contact or hire forms (e.g., your name, email address, and project message).
              </li>
              <li>
                <strong>Website Analytics:</strong> Standard technical information such as browser type, device information, and pages visited, used strictly to optimize site performance and security.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-[#00C26C]">2.</span> How We Use Your Information
            </h2>
            <p className="leading-relaxed mb-3">We use the processed information solely for the following legitimate purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Automated Real-Time Inquiries:</strong> Generating relevant, contextual public comment replies and one-time private replies (DMs) using Google Gemini AI to share requested tutorial links, article code, and answers.
              </li>
              <li>
                <strong>Anti-Spam & Duplicate Prevention:</strong> Storing comment IDs in our MongoDB database to ensure each comment is replied to only once and to prevent spam loops.
              </li>
              <li>
                <strong>Customer Support:</strong> Responding directly to your client inquiries and project collaboration requests.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-[#00C26C]">3.</span> Data Sharing & Third-Party Services
            </h2>
            <p className="leading-relaxed mb-3">
              We <strong>do not sell, rent, or trade</strong> your personal information to third parties. Data is processed through secure, industry-standard infrastructure:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Meta Platforms, Inc. (Facebook Graph API):</strong> Used strictly in compliance with Meta&apos;s Platform Terms and Developer Policies.
              </li>
              <li>
                <strong>Google Gemini AI:</strong> Used to generate contextual, natural responses for tech questions and blog automation.
              </li>
              <li>
                <strong>Cloudflare R2:</strong> Used as our content delivery network (CDN) for storing public media assets and cover images.
              </li>
              <li>
                <strong>MongoDB Atlas:</strong> Used for secure, encrypted cloud data storage.
              </li>
            </ul>
          </section>

          <section id="data-deletion" className="bg-[#1c2128] border border-gray-700/60 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              <span>4.</span> User Data Deletion Instructions (Meta Compliant)
            </h2>
            <p className="leading-relaxed mb-3">
              In accordance with Meta Developer Policies and General Data Protection Regulations (GDPR), users have the right to request the deletion of any data associated with their interactions.
            </p>
            <p className="mb-2 font-medium text-white">How to request data deletion:</p>
            <ol className="list-decimal pl-6 space-y-2 text-gray-300">
              <li>
                Send an email to{' '}
                <a href="mailto:nafismahmud0@gmail.com" className="text-[#00C26C] hover:underline font-mono">
                  nafismahmud0@gmail.com
                </a>{' '}
                or{' '}
                <a href="mailto:nafismahmudayon@gmail.com" className="text-[#00C26C] hover:underline font-mono">
                  nafismahmudayon@gmail.com
                </a>{' '}
                with the subject line: <strong>&quot;Facebook Data Deletion Request&quot;</strong>.
              </li>
              <li>
                Include your Facebook Profile Name or the URL of the comment you wish to have removed.
              </li>
              <li>
                Our administrative system will permanently purge your comment record, sender ID, and associated response logs from our database within <strong>48 hours</strong> of receipt and send you a confirmation.
              </li>
            </ol>
            <p className="mt-4 text-xs text-gray-400">
              Alternatively, you can remove the <strong>NafisBD Bot</strong> permissions at any time by going to your Facebook Profile &gt; Settings &amp; Privacy &gt; Settings &gt; Apps and Websites &gt; Select &quot;NafisBD Bot&quot; &gt; Click &quot;Remove&quot;.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#00C26C]" />
              <span>5.</span> Security & Retention
            </h2>
            <p className="leading-relaxed">
              We apply robust security safeguards, including TLS 1.3 encryption, environment variable token isolation, and strict database access controls. Comment IDs and reply logs are retained only as long as necessary for audit and anti-spam verification.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#00C26C]" />
              <span>6.</span> Contact Information
            </h2>
            <p className="leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please contact:
            </p>
            <div className="mt-3 p-4 bg-[#11161d] rounded-lg border border-gray-800 text-sm space-y-1">
              <p><strong>Name:</strong> Nafis Mahmud Ayon</p>
              <p><strong>Email:</strong> <a href="mailto:nafismahmud0@gmail.com" className="text-[#00C26C] hover:underline">nafismahmud0@gmail.com</a></p>
              <p><strong>Website:</strong> <a href="https://nafisbd.com" className="text-[#00C26C] hover:underline">https://nafisbd.com</a></p>
              <p><strong>Location:</strong> Dhaka, Bangladesh</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
