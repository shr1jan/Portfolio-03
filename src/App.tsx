import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, Pause, Play, X } from '@phosphor-icons/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

import UpcomingEvents from './components/Events'
import ContactDialog from './components/ContactDialog'
import WelcomeDialog from './components/WelcomeDialog'

gsap.registerPlugin(ScrollTrigger)

const navigation = [{ label: 'Home', href: '#home' }, { label: 'Projects', href: '#projects' }, { label: 'About', href: '#about' }]
const experiences = [
  { title: 'AFTER DARK.', category: 'Live events', image: 'purple-concert.jpg', alt: 'An audience beneath purple spotlights at a live concert', description: 'The lights drop. The crowd comes alive. We bring together the stage, sound, production, and people for a night that stays with you.' },
  { title: 'FESTIVAL SEASON.', category: 'Live events', image: 'festival.jpg', alt: 'A huge outdoor music festival stage at night', description: 'Weekends built for thousands. Big stages, bigger sounds, and a sea of people moving as one from the opening act to the final encore.' },
  { title: 'CLUB NIGHTS.', category: 'Live events', image: 'dj.jpg', alt: 'A DJ performing in magenta stage light', description: 'Dance floors, strobes, and sweat. Late sets where the DJ takes over and the room lets go until the lights come up.' },
]
const galleryImages = [
  { image: 'gala.jpg', projectIndex: 1, alt: 'A formal dinner setting in an ornate venue' },
  { image: 'dj.jpg', projectIndex: 0, alt: 'A DJ playing music in magenta stage light' },
  { image: 'festival.jpg', projectIndex: 0, alt: 'A large outdoor music festival stage' },
  { image: 'wedding.jpg', projectIndex: 1, alt: 'Candlelit tables for a private celebration' },
  { image: 'conference.jpg', projectIndex: 2, alt: 'A live event stage with an immersive lighting installation' },
  { image: 'confetti.jpg', projectIndex: 2, alt: 'A crowd celebrating under colourful stage lighting' },
]

function RollingLabel({ children }: { children: string }) {
  return <span className="rolling-label"><span>{children}</span><span aria-hidden="true">{children}</span></span>
}

function App() {
  const root = useRef<HTMLDivElement>(null)
  const galleryDrag = useRef<{ start: number; offset: number; active: boolean }>({ start: 0, offset: 0, active: false })
  const lenis = useRef<Lenis | null>(null)
  const projectDialog = useRef<HTMLDialogElement>(null)
  const [contactOpen, setContactOpen] = useState(false)
  const [eventType, setEventType] = useState<string>()
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [motionPaused, setMotionPaused] = useState(false)
  const [welcomeOpen, setWelcomeOpen] = useState(true)

  const openContact = (type?: string) => {
    setSelectedProject(null)
    setEventType(type)
    setContactOpen(true)
  }

  useEffect(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const smooth = new Lenis({ duration: 1.15, smoothWheel: true, anchors: true })
      lenis.current = smooth
      smooth.on('scroll', ScrollTrigger.update)
      const tick = (time: number) => smooth.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
      return () => { gsap.ticker.remove(tick); smooth.destroy(); lenis.current = null }
    })
    const ctx = gsap.context(() => {
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.hero-title .word-inner', { yPercent: 110, duration: 1.3, stagger: 0.12, ease: 'power4.out', delay: 0.12 })
        gsap.from('.hero-bottom, .hero-side-note', { opacity: 0, y: 15, duration: 0.8, delay: 0.6 })
        const hero = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: 0.8 } })
        hero.to('.hero-photo', { yPercent: -100, ease: 'none' }, 0)
          .to('.hero-title', { color: '#171717', scale: 0.76, ease: 'none' }, 0.22)
          .to('.brand-period', { color: '#000080', ease: 'none' }, 0.22)
          .to('.hero-bottom, .hero-side-note', { opacity: 0, duration: 0.12 }, 0)
          .fromTo('.hero-gallery', { yPercent: 135, y: 0 }, { yPercent: 0, y: 0, ease: 'none', duration: 0.65 }, 0.18)
          .fromTo('.hero-gallery-caption', { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.65)
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
          gsap.from(element, { y: 55, opacity: 0, duration: 0.95, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 90%', once: true } })
        })
        gsap.utils.toArray<HTMLElement>('.parallax-image').forEach((element) => {
          gsap.fromTo(element, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: element.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } })
        })
        gsap.fromTo('.statement .soft-word', { opacity: 0.2 }, { opacity: 1, stagger: 0.2, scrollTrigger: { trigger: '.statement', start: 'top 70%', end: 'bottom 75%', scrub: true } })
      })
      media.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const track = document.querySelector<HTMLElement>('.project-track')!
        gsap.to(track, { x: () => -(track.scrollWidth - window.innerWidth + window.innerWidth * 0.04), ease: 'none', scrollTrigger: { trigger: '.projects', start: 'top top', end: () => `+=${track.scrollWidth - window.innerWidth}`, pin: true, scrub: 0.8, invalidateOnRefresh: true } })
      })
    }, root)
    const header = document.querySelector<HTMLElement>('.site-header')!
    let lightRanges: [number, number][] = []
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const brandMark = document.querySelector<HTMLElement>('.brand-mark')!
    const brandWipe = document.querySelector<HTMLElement>('.brand-mark-img')!
    let wasLight: boolean | null = null
    const wipeChips = (toLight: boolean, scrollUp: boolean) => {
      if (!brandMark || !brandWipe) return
      const toImg = `url(/images/${toLight ? 'light' : 'dark'}.png)`
      const fromImg = `url(/images/${toLight ? 'dark' : 'light'}.png)`
      const clip = scrollUp ? 'inset(0 0 100% 0)' : 'inset(100% 0 0 0)'
      gsap.killTweensOf(brandWipe)
      gsap.set(brandMark, { backgroundImage: toImg })
      gsap.set(brandWipe, { backgroundImage: fromImg, clipPath: 'inset(0 0 0 0)' })
      if (prefersReducedMotion.matches) { gsap.set(brandWipe, { clipPath: clip }); return }
      gsap.to(brandWipe, { clipPath: clip, duration: 0.185, ease: 'power2.inOut' })
    }
    let lastScrollY = window.scrollY
    const updateHeader = () => {
      const current = window.scrollY + 44
      const scrollUp = window.scrollY < lastScrollY
      lastScrollY = window.scrollY
      const heroPhoto = document.querySelector<HTMLElement>('.hero-photo')!
      const heroSection = document.querySelector<HTMLElement>('.hero')!
      const heroLight = current < heroSection.offsetHeight && heroPhoto.getBoundingClientRect().bottom < 44
      const light = heroLight || lightRanges.some(([start, end]) => current >= start && current < end)
      header.classList.toggle('is-light', light)
      brandMark.style.backgroundImage = `url(/images/${light ? 'light' : 'dark'}.png)`
      if (wasLight !== null && light !== wasLight) wipeChips(light, !scrollUp)
      wasLight = light
    }
    const measureRanges = () => {
      lightRanges = [...document.querySelectorAll<HTMLElement>('.manifesto, .moments, .footer')].map(element => {
        const rect = element.getBoundingClientRect()
        return [rect.top + window.scrollY, rect.bottom + window.scrollY]
      })
      updateHeader()
    }
    const headerTrigger = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: updateHeader, onRefresh: measureRanges })
    const refresh = () => { ScrollTrigger.refresh(); measureRanges() }
    void document.fonts.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => { window.removeEventListener('load', refresh); headerTrigger.kill(); ctx.revert(); media.revert() }
  }, [])

  useEffect(() => {
    if (selectedProject !== null) projectDialog.current?.showModal()
    else projectDialog.current?.close()
  }, [selectedProject])

  useEffect(() => {
    const locked = contactOpen || selectedProject !== null
    if (locked) lenis.current?.stop()
    else lenis.current?.start()
    document.body.style.overflow = locked ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [contactOpen, selectedProject])

  return (
    <div ref={root} className={motionPaused ? 'site motion-paused' : 'site'}>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="header-left">
          <a href="#home" className="brand-mark" aria-label="TRN Events home" style={{ backgroundImage: 'url(/images/light.png)' }}><span className="brand-mark-img" /></a>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="home" aria-label="TRN Events">
          <div className="hero-stage">
            <div className="hero-photo"><video className="hero-video" src="/images/hero-video.mp4" autoPlay muted loop playsInline preload="auto" /><div className="hero-shade" /></div>
            <h1 className="hero-title" aria-label="TRN NEPAL"><span className="word-clip"><span className="word-inner">TRN<span className="brand-period">.</span></span></span><span className="word-clip"><span className="word-inner">NEPAL</span></span></h1>
            <div className="hero-side-note"><span className="tiny-label">EVENTS. EXPERIENCES. ENERGY.</span><p>You bring the people.<br />We make the moment.</p></div>
            <div className="hero-bottom"><p>BIG IDEAS.<br />UNFORGETTABLE NIGHTS.</p><a href="#projects" className="hero-scroll"><span>DISCOVER WHAT’S POSSIBLE</span><span className="round-arrow"><ArrowDown size={20} /></span></a></div>
            <div className="hero-gallery-caption"><span className="tiny-label">[ MORE THAN AN EVENT ]</span><p>It’s a feeling.<br />Let’s make it last.</p></div>
            <div className="hero-gallery" aria-label="Event photo gallery. Drag or use arrow keys to explore." role="region" tabIndex={0}
              onPointerDown={(event) => {
                if (event.pointerType === 'mouse' && event.button !== 0) return
                galleryDrag.current = { start: event.clientX, offset: Number(gsap.getProperty(event.currentTarget, 'x')) || 0, active: true }
                event.currentTarget.setPointerCapture(event.pointerId)
              }}
              onPointerMove={(event) => {
                if (!galleryDrag.current.active) return
                const x = Math.max(-180, Math.min(180, galleryDrag.current.offset + event.clientX - galleryDrag.current.start))
                gsap.to(event.currentTarget, { x, duration: 0.35, ease: 'power2.out', overwrite: 'auto' })
              }}
              onPointerUp={() => { galleryDrag.current.active = false }}
              onPointerCancel={() => { galleryDrag.current.active = false }}
              onKeyDown={(event) => {
                if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
                event.preventDefault()
                const current = Number(gsap.getProperty(event.currentTarget, 'x')) || 0
                gsap.set(event.currentTarget, { x: Math.max(-180, Math.min(180, current + (event.key === 'ArrowLeft' ? 80 : -80))) })
              }}>
              {galleryImages.map((item, index) => <div className={`hero-gallery-item gallery-item-${index}`} key={item.image}><img src={`/images/${item.image}`} alt={item.alt} draggable={false} width="600" height="700" /></div>)}
            </div>
          </div>
        </section>

        <section className="manifesto section-pad">
          <span className="tiny-label" data-reveal>[ THE TRN WAY ]</span>
          <h2 data-reveal>BRING THE PEOPLE.<br /><span className="manifesto-indent">BUILD THE <span className="red-text">FEELING.</span></span><br />MAKE IT UNFORGETTABLE.</h2>
          <div className="manifesto-bottom" data-reveal><ArrowDownRight size={42} weight="light" /><p>From the first idea to the final encore,<br />we bring your world together.</p><a href="#about" className="text-link"><RollingLabel>MEET TRN EVENTS</RollingLabel><ArrowUpRight size={19} /></a></div>
        </section>

        <UpcomingEvents onContact={openContact} />

        <section className="projects" id="projects">
          <div className="project-heading"><div><span className="tiny-label">[ EVENT INSPIRATION ]</span><h2>PAST <span className="red-text">EVENTS.</span></h2></div><p>A glimpse of our work.</p></div>
          <div className="project-track">
            {experiences.map((project, index) => <button className="project-card" key={project.title} onClick={() => setSelectedProject(index)} aria-label={`Explore ${project.category.toLowerCase()}`}>
              <div className="project-image"><img src={`/images/${project.image}`} alt={project.alt} loading="lazy" width="1200" height="800" /><span className="project-view">EXPLORE<ArrowUpRight size={22} /></span></div>
              <div className="project-caption"><h3>{project.title}</h3><span className="tiny-label">{project.category}<ArrowUpRight size={18} /></span></div>
            </button>)}
          </div>
          <div className="projects-bottom"><span className="tiny-label">LIVE EVENTS / CONCERTS / FESTIVALS</span><span className="project-direction" aria-hidden="true"><ArrowRight size={28} /></span></div>
        </section>

        <section className="about section-pad" id="about">
          <div className="about-intro"><h2 data-reveal>WE’RE<br />TRN<span className="red-text">.</span></h2><div className="about-copy" data-reveal><span className="tiny-label">[ THE PEOPLE BEHIND THE MOMENT ]</span><p>Big crowds. Close friends. Bold ideas. Whatever brings you together, we make it an experience worth showing up for.</p><p className="muted-text">We’re a hands-on events team with a love for the details. The sound, the space, the atmosphere. It all matters.</p></div></div>
          <div className="statement"><h2><span className="soft-word">FROM THE FIRST</span> <span className="soft-word red-text">“WHAT IF”</span><br /><span className="soft-word">TO THE FINAL</span> <span className="soft-word red-text">“ONE MORE.”</span><br /><span className="soft-word">WE’RE ALL IN.</span></h2></div>
        </section>

        <div className="process-marquee" aria-label="Our process: Dream it, Plan it, Build it, Live it">
          <div className="marquee-track" aria-hidden="true">{[0, 1].map((copy) => <div className="marquee-group" key={copy}><span>DREAM IT</span><ArrowRight /><span>PLAN IT</span><ArrowRight /><span>BUILD IT</span><ArrowRight /><span>LIVE IT</span><ArrowRight /></div>)}</div>
          <button className="motion-toggle" onClick={() => setMotionPaused(!motionPaused)} aria-label={motionPaused ? 'Play moving text' : 'Pause moving text'}>{motionPaused ? <Play size={14} /> : <Pause size={14} />}</button>
        </div>

        <section className="moments section-pad" aria-labelledby="moments-title">
          <div className="moments-heading"><span className="tiny-label">[ THE BIG PICTURE. THE LITTLE DETAILS. ]</span><span className="tiny-label">THAT’S WHERE THE MAGIC IS.</span></div>
          <div className="moment-gallery">{galleryImages.map((item) => <button className="moment-image" key={item.image} onClick={() => setSelectedProject(item.projectIndex)} aria-label={`Explore event inspiration: ${item.alt}`}><img src={`/images/${item.image}`} alt={item.alt} loading="lazy" width="600" height="800" /></button>)}</div>
          <div className="moments-footer"><h2 id="moments-title" data-reveal>LESS ORDINARY.<br /><span className="red-text">MORE “YOU HAD TO BE THERE.”</span></h2><button className="button button-red cornered" onClick={() => openContact()}><RollingLabel>MAKE YOUR MOMENT</RollingLabel><ArrowUpRight size={16} /></button></div>
        </section>

        <footer className="footer section-pad" id="contact">
          <div className="footer-main"><a className="footer-brand" href="#home" aria-label="TRN Events home">TRN<span className="red-text">.</span><br />EVENTS</a><div className="footer-links"><span className="tiny-label">COME ON IN</span>{navigation.map((item) => <a key={item.label} href={item.href}>{item.label}<ArrowUpRight size={15} /></a>)}<button onClick={() => openContact()}>Contact<ArrowUpRight size={15} /></button></div><div className="footer-note"><span className="tiny-label">GOOD PEOPLE. GREAT MOMENTS.</span><p>Bring your idea.<br />We’ll bring the energy.</p><a href="mailto:trnevents@gmail.com">trnevents@gmail.com</a></div></div>
          <div className="footer-bottom"><span>© {new Date().getFullYear()} TRN EVENTS. ALL RIGHTS RESERVED.</span><span>MADE TO BE FELT.</span><a href="#home">BACK TO TOP <ArrowUpRight size={14} /></a></div>
        </footer>
      </main>

      <dialog className="project-dialog" ref={projectDialog} onCancel={() => setSelectedProject(null)} onClick={(event) => { if (event.target === event.currentTarget) setSelectedProject(null) }} aria-labelledby="project-title" data-lenis-prevent>
        {selectedProject !== null && <div className="project-dialog-inner"><button className="dialog-close" onClick={() => setSelectedProject(null)} aria-label="Close event inspiration" autoFocus><X size={24} /></button><img className="project-dialog-image" src={`/images/${experiences[selectedProject].image}`} alt={experiences[selectedProject].alt} /><div className="project-dialog-copy"><span className="tiny-label">{experiences[selectedProject].category} / EVENT INSPIRATION</span><h2 id="project-title">{experiences[selectedProject].title}</h2><p>{experiences[selectedProject].description}</p><button className="button button-red" onClick={() => openContact(experiences[selectedProject].category)}>MAKE SOMETHING LIKE THIS<ArrowUpRight size={18} /></button></div></div>}
      </dialog>
      <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} eventType={eventType} />
      <WelcomeDialog open={welcomeOpen} onClose={() => setWelcomeOpen(false)} />
    </div>
  )
}

export default App
