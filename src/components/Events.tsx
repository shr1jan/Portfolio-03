import { ArrowUpRight } from '@phosphor-icons/react'
import './events.css'

type EventsProps = {
  onContact: () => void
}

const upcomingEvents = [
  { month: 'MAR', day: '28', title: 'SUSHANT KC LIVE', venue: 'United Kingdom' },
]

function RollingLabel({ children }: { children: string }) {
  return <span className="rolling-label"><span>{children}</span><span aria-hidden="true">{children}</span></span>
}

export default function UpcomingEvents({ onContact }: EventsProps) {
  return (
    <section className="upcoming section-pad" id="upcoming" aria-labelledby="upcoming-title">
      <div className="events-heading">
        <span className="tiny-label">[ UP NEXT ]</span>
        <h2 id="upcoming-title">UPCOMING <span className="red-text">LIVE EVENTS.</span></h2>
      </div>
      <div className="event-list">
        {upcomingEvents.map((event) => (
          <article className="event-row" key={event.title}>
            <div className="event-date" aria-hidden="true"><span className="event-month">{event.month}</span><span className="event-day">{event.day}</span></div>
            <div className="event-info"><h3>{event.title}</h3><p>{event.venue}</p></div>
            <button className="button button-red cornered" onClick={onContact}><RollingLabel>SIGN ME UP</RollingLabel><ArrowUpRight size={14} /></button>
          </article>
        ))}
      </div>
    </section>
  )
}