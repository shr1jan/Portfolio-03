import './services.css'

const services = [
  {
    number: '01',
    category: 'Live Events',
    lines: ['WE BRING', 'THE ENERGY.'],
    description:
      'From the first soundcheck to the final encore. Concerts, festivals, and live experiences that bring people together and leave the room buzzing.',
    image: '/images/festival.jpg',
  },
  {
    number: '02',
    category: 'Live Events',
    lines: ['WE OWN', 'THE NIGHT.'],
    description:
      'Club nights and late sets. Dance floors in full swing, a DJ on the decks, and a room that lets go until the lights come up.',
    image: '/images/dj.jpg',
  },
  {
    number: '03',
    category: 'Live Events',
    lines: ['WE MAKE IT', 'UNFORGETTABLE.'],
    description:
      'One-offs, tour stops, and arena moments. Full production from front to back, built to be felt long after the lights go down.',
    image: '/images/purple-concert.jpg',
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="trn-services"
      data-theme="dark"
      aria-label="Our event services"
    >
      {services.map((service) => (
        <article
          className="trn-service"
          key={service.number}
          aria-labelledby={`service-title-${service.number}`}
        >
          <div className="trn-service__image" aria-hidden="true">
            <img src={service.image} alt="" loading="lazy" />
          </div>

          <div className="trn-service__content">
            <div className="trn-service__copy">
              <p className="trn-service__category">{service.category}</p>
              <h2
                className="trn-service__title"
                id={`service-title-${service.number}`}
              >
                {service.lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h2>

              <div className="trn-service__details">
                <p className="trn-service__description">{service.description}</p>
              </div>
            </div>

            <span className="trn-service__number" aria-hidden="true">
              {service.number}
            </span>
          </div>
        </article>
      ))}
    </section>
  );
}
