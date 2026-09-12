import { ArrowRight } from '@phosphor-icons/react';
import './services.css';

type ServicesProps = {
  onContact: (type?: string) => void;
};

const services = [
  {
    number: '01',
    category: 'Live Events',
    contactType: 'Live events',
    lines: ['WE BRING', 'THE ENERGY.'],
    description:
      'From the first soundcheck to the final encore. Concerts, festivals, and live experiences that bring people together and leave the room buzzing.',
    image: '/images/festival.jpg',
  },
  {
    number: '02',
    category: 'Private Celebrations',
    contactType: 'Private celebrations',
    lines: ['WE MAKE', 'IT PERSONAL.'],
    description:
      'The big days. The little details. Weddings, milestone moments, and celebrations shaped around your story, with every element thoughtfully brought together.',
    image: '/images/wedding.jpg',
  },
  {
    number: '03',
    category: 'Brand Experiences',
    contactType: 'Brand experiences',
    lines: ['WE MAKE AN', 'IMPRESSION.'],
    description:
      'Give people something to be part of. Product launches, conferences, and brand activations that turn your ideas into experiences people remember.',
    image: '/images/conference.jpg',
  },
];

export default function Services({ onContact }: ServicesProps) {
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
                <button
                  type="button"
                  className="trn-service__button"
                  aria-label={`Plan your ${service.contactType.toLowerCase()} with TRN Events`}
                  onClick={() => onContact(service.contactType)}
                >
                  <span>Plan your event</span>
                  <ArrowRight size={18} weight="regular" aria-hidden="true" />
                </button>
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
