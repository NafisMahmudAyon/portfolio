import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Nafis Mahmud Ayon (NafisBD)',
  description:
    'Terms of Service governing the use of Nafis Mahmud Ayon portfolio, services, and NafisBD Bot automated Facebook applications.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsOfServicePage() {
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
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Terms of Service</h1>
            <p className="text-sm text-gray-400">Last Updated: {lastUpdated}</p>
          </div>
        </div>

        <p className="mt-4 text-gray-300 leading-relaxed">
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of the website{' '}
          <a href="https://nafisbd.com" className="text-[#00C26C] hover:underline">
            https://nafisbd.com
          </a>
          , our web development consulting services, and our automated social integrations, including the{' '}
          <strong>NafisBD Bot</strong> Facebook application.
        </p>

        <hr className="my-8 border-gray-800" />

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-[#00C26C]">1.</span> Acceptance of Terms
            </h2>
            <p className="leading-relaxed">
              By accessing our website, subscribing to our technical tutorials, or interacting with our Facebook Page (<strong>Nafisbd</strong>), you agree to be bound by these Terms and all applicable local, national, and international laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-[#00C26C]">2.</span> Description of Services & Automated Bot
            </h2>
            <p className="leading-relaxed mb-3">
              Nafis Mahmud Ayon provides software development portfolio content, open-source code libraries (such as Aspect UI), and automated customer response workflows via the <strong>NafisBD Bot</strong>.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Automated Responses:</strong> The bot provides automated public comment replies and private messages on Facebook Messenger strictly to deliver requested technical articles, coding resources, and direct assistance.
              </li>
              <li>
                <strong>One-Shot Messaging:</strong> Automated direct messages comply strictly with Meta&apos;s Private Replies policy and will only send one introductory response per user comment.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-[#00C26C]">3.</span> Acceptable Use
            </h2>
            <p className="leading-relaxed mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Post unlawful, abusive, harassing, defamatory, or harmful comments on our pages.</li>
              <li>Attempt to reverse-engineer, exploit, or disrupt our web services, API endpoints, or webhooks.</li>
              <li>Use automated scripts to spam or scrape our forms, chatbot, or Facebook pages.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-[#00C26C]">4.</span> Intellectual Property
            </h2>
            <p className="leading-relaxed">
              All website designs, code snippets, branding, and technical content published by Nafis Mahmud Ayon are protected by applicable intellectual property and copyright laws. Open-source repositories (such as Aspect UI) are governed by their respective open-source licenses (MIT).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-[#00C26C]">5.</span> Limitation of Liability
            </h2>
            <p className="leading-relaxed">
              The materials and automated responses are provided on an &quot;as is&quot; basis. In no event shall Nafis Mahmud Ayon or affiliated platforms be liable for any damages arising out of the use or inability to use the materials, code tutorials, or third-party platform interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-[#00C26C]">6.</span> Contact & Inquiries
            </h2>
            <p className="leading-relaxed">
              If you have any questions regarding these Terms of Service, please reach out directly:
            </p>
            <div className="mt-3 p-4 bg-[#11161d] rounded-lg border border-gray-800 text-sm space-y-1">
              <p><strong>Contact Email:</strong> <a href="mailto:nafismahmud0@gmail.com" className="text-[#00C26C] hover:underline">nafismahmud0@gmail.com</a></p>
              <p><strong>Website:</strong> <a href="https://nafisbd.com" className="text-[#00C26C] hover:underline">https://nafisbd.com</a></p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
