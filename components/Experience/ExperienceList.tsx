'use client'
import { oswald, poppins } from '@/app/fonts'
import { motion, useAnimation, useInView } from 'framer-motion'
import Link from 'next/link'
import React, { useRef } from 'react'
import { Badge, Timeline, TimelineItem } from '../aspect-ui'

const ExperienceList = () => {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref)
  const experiences = [
    {
      title: 'React Developer',
      company: 'PickPlugins',
      period: '2024 - Present',
      location: 'Rangpur, Bangladesh',
      website: 'pickplugins.com',
      description: 'Develop and maintain scalable React napplications with reusable components and efficient state management.Integrate APIs using REST, GraphQL, or WebSockets, optimize performance with lazy loading and memoization, and ensure code quality through testing and debugging.Collaborate with designers and backend teams to deliver responsive, high- performance web applications.',
      technologies: ['HTML', 'CSS', 'JS', 'React', 'Next JS', 'TS', 'WordPress', 'JSON', 'API', 'Tailwind']
    },
    {
      title: 'Plugin Developer',
      company: 'PickPlugins',
      period: '2023 - 2024',
      location: 'Rangpur, Bangladesh',
      website: 'pickplugins.com',
      description: 'Develop and maintain WordPress plugins using PHP, JavaScript, and WordPress APIs, extending functionality with custom post types, taxonomies, and shortcodes.Create custom Gutenberg blocks with React, optimize performance, ensure security, and maintain compatibility with updates while debugging and troubleshooting issues.',
      technologies: ['HTML', 'CSS', 'JS', 'PHP', 'React', 'WordPress', 'JSON', 'API', 'Tailwind']
    },
    {
      title: 'FrontEnd Web Developer',
      company: 'PickPlugins',
      period: '2022 - 2023',
      location: 'Rangpur, Bangladesh',
      website: 'pickplugins.com',
      description: 'Developed web sections and landing page layouts using Gutenberg Editor and ComboBlocks plugin, ensuring responsiveness, performance optimization, and seamless user experience.Collaborated with designers to implement visually appealing and functional UI components',
      technologies: ['HTML', 'CSS', 'JS', 'PHP', 'React', 'WordPress', 'JSON', 'API', 'Tailwind']
    },
    {
      title: 'Full Stack Web Developer',
      company: 'Freelancer',
      period: '2020 - Present',
      location: 'Worldwide',
      website: 'fiverr.com',
      description: 'Developed Full Stack web application, Tech used React, JavaScript, PHP.',
      technologies: ['HTML', 'CSS', 'JS', 'PHP', 'React', 'WordPress', 'JSON', 'API', 'Tailwind']
    }
  ]

  React.useEffect(() => {
    if (isInView) {
      controls.start('visible')
    }
  }, [controls, isInView])

  const containerVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 10,
        stiffness: 100,
        ease: 'easeInOut',
        staggerChildren: 0.5
      }
    }
  }

  return (
    <motion.div
      className='mx-auto max-w-[760px] px-4'
      ref={ref}
      variants={containerVariants}
      initial='hidden'
      animate={controls}
    >
      {/* <Accordion activeItem={["0"]}>
        {experiences.map((experience, index) => (
          <AccordionItem id={index.toString()} key={index} className='mb-4 rounded-md border border-primaryColor/30 p-4'>
            <AccordionHeader
              className={`cursor-pointer gap-3 ${oswald.className} `}
              activeHeaderClassName='pb-2 border-b border-primaryColor'
              iconClassName='text-primaryColor w-4 '
            >
              <div className='flex flex-1 flex-col items-start text-headingText dark:text-headingDarkText md:flex-row md:items-center md:justify-between'>
                <span className='font-semibold'>
                  {experience.title}{' '}
                  <span className='text-primaryColor'>@</span> {experience.company}
                </span>
                <span className='font-light'>{experience.period}</span>
              </div>
            </AccordionHeader>
            <AccordionContent className='pt-2'>
              <div className='flex items-center gap-8 text-sm text-normalText dark:text-normalDarkText'>
                <span className='flex items-center gap-1 text-headingText dark:text-headingDarkText'>
                  <LocationIcon className='w-3' />
                  <span>{experience.location}</span>
                </span>
                <span className='flex items-center gap-1 text-headingText dark:text-headingDarkText'>
                  <LinkIcon className='h-3' />
                  <Link href={experience.website}>{experience.website}</Link>
                </span>
              </div>
              <div className='py-3 font-normal text-headingText dark:text-headingDarkText'>
                {experience.description}
              </div>
              <div className='flex items-center gap-2 overflow-auto text-xs font-extralight'>
                {experience.technologies.map((tag, i) => (
                  <span
                    key={i}
                    className='rounded-md bg-[#dfe8f1] px-2 py-1 text-normalText dark:bg-[#353535] dark:text-normalDarkText'
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion> */}
      <Timeline position="right" lineStyle="dashed">
        {experiences.map((exp, index) => (
          <TimelineItem key={index} className={`text-text-muted ${poppins.className}`}>
            <h3 className={`font-bold text-text ${oswald.className}`}>{exp.title} — {exp.company}</h3>
            <p className="text-sm">
              {exp.period} | {exp.location} |{' '}
              <Link
                href={`https://${exp.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primaryColor hover:underline"
              >
                {exp.website}
              </Link>
            </p>
            <p className="mt-2">{exp.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {exp.technologies.map((tech, i) => (
                <Badge variant='outline'
                  key={i}
                  className=""
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </TimelineItem>
        ))}
      </Timeline>

    </motion.div>
  )
}

export default ExperienceList
