import Cursor from '@/components/Cursor'
import { ChevronUpIcon } from 'lucide-react'
import type { Metadata } from 'next'
import { oswald } from './fonts'
import './globals.css'
import PageLoader from '@/components/PageLoader'
import { NavbarWrapper } from '@/components/NavbarWrapper'
import { BackToTop } from '@/components/aspect-ui'

// export const metadata: Metadata = {
//   title: 'Nafis Mahmud Ayon | Portfolio',
//   description:
//     'I am a passionate and versatile software developer with expertise in both frontend and backend technologies. With a strong focus on creating intuitive user experiences, I specialize in building dynamic web applications using modern JavaScript frameworks. My skill set includes proficiency in HTML, CSS, JavaScript, React, Next.js, and Node.js, enabling me to deliver high-quality solutions for a wide range of projects.'
// }


export const metadata: Metadata = {
  title: 'Nafis Mahmud Ayon | Portfolio',
  description:
    'I am a passionate and versatile software developer with expertise in both frontend and backend technologies. I specialize in building dynamic web applications using HTML, CSS, JavaScript, React, Next.js, and Node.js.',
  
  keywords: [
    'Nafis Mahmud Ayon',
    'Frontend Developer',
    'Backend Developer',
    'Fullstack Developer',
    'React.js',
    'Next.js',
    'Node.js',
    'JavaScript',
    'Portfolio',
    'Open Source'
  ],

  authors: [{ name: 'Nafis Mahmud Ayon', url: 'https://nafisbd.com' }],

  creator: 'Nafis Mahmud Ayon',
  publisher: 'Nafis Mahmud Ayon',

  metadataBase: new URL('https://nafisbd.com'),

  alternates: {
    canonical: '/',
  },

  openGraph: {
    title: 'Nafis Mahmud Ayon | Portfolio',
    description:
      'I am a passionate and versatile software developer specializing in building dynamic web applications with React, Next.js, and Node.js.',
    url: 'https://nafisbd.com',
    siteName: 'Nafis Mahmud Ayon Portfolio',
    images: [
      {
        url: 'https://nafisbd.com/images/nafis-mahmud-ayon.png',
        width: 1200,
        height: 630,
        alt: 'Nafis Mahmud Ayon'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Nafis Mahmud Ayon | Portfolio',
    description:
      'I am a passionate software developer building modern web applications with React, Next.js, and Node.js.',
    site: '@nafis_mahmud',
    creator: '@nafis_mahmud',
    images: ['https://nafisbd.com/images/nafis-mahmud-ayon.png']
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true
    }
  },

  // themeColor: [
  //   { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  //   { media: '(prefers-color-scheme: dark)', color: '#000000' }
  // ]
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Nafis Mahmud Ayon',
    alternateName: 'Nafis Ayon',
    url: 'https://nafisbd.com',
    image: 'https://nafisbd.com/images/nafis-mahmud-ayon.png',
    sameAs: [
      'https://github.com/NafisMahmudAyon',
      'https://www.linkedin.com/in/nafis-mahmud-ayon',
      'https://www.facebook.com/ayon.nafis.mahmud'
    ],
    jobTitle: 'Frontend Developer',
    worksFor: {
      '@type': 'Organization',
      name: 'Aspect UI'
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Your University Name'
    },
    description:
      'Nafis Mahmud Ayon is a frontend developer, open-source contributor, and creator of Aspect UI. He builds modern web applications and UI libraries.',
    knowsAbout: [
      'React.js',
      'Next.js',
      'JavaScript',
      'UI Libraries',
      'Open Source Development'
    ],
    nationality: {
      '@type': 'Country',
      name: 'Bangladesh'
    }
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>
      <body
        className={` ${oswald.className} bg-bg-dark relative max-h-screen overflow-y-scroll`}
      >
        <PageLoader />
        <Cursor />
        <NavbarWrapper />
        {children}
        <BackToTop className='border-primaryColor bg-primaryColor/10 text-primaryColor border p-2 backdrop-blur-xl'>
          <ChevronUpIcon className='w-6' />
        </BackToTop>
      </body>
    </html>
  )
}
