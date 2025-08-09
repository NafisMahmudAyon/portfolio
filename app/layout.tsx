import Cursor from '@/components/Cursor'
import { ChevronUpIcon } from 'lucide-react'
import type { Metadata } from 'next'
import { oswald } from './fonts'
import './globals.css'
import PageLoader from '@/components/PageLoader'
import { NavbarWrapper } from '@/components/NavbarWrapper'
import { BackToTop } from '@/components/aspect-ui'

export const metadata: Metadata = {
  title: 'Nafis Mahmud Ayon | Portfolio',
  description:
    'I am a passionate and versatile software developer with expertise in both frontend and backend technologies. With a strong focus on creating intuitive user experiences, I specialize in building dynamic web applications using modern JavaScript frameworks. My skill set includes proficiency in HTML, CSS, JavaScript, React, Next.js, and Node.js, enabling me to deliver high-quality solutions for a wide range of projects.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
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
