import { ArrowLink } from '../ui/ArrowLink';

type ExperienceTone = 'sage' | 'cream' | 'terracotta';

type Experience = {
  number: string;
  category: string;
  title: string;
  description: string;
  tone: ExperienceTone;
};

const experiences: Experience[] = [
  {
    number: '01',
    category: 'RITUAL',
    title: 'Volver al cuerpo',
    description: 'Una pausa para soltar el ritmo y volver a sentir.',
    tone: 'sage',
  },
  {
    number: '02',
    category: 'BELLEZA',
    title: 'Cuidar la piel',
    description: 'Gestos lentos, texturas suaves y tiempo para ti.',
    tone: 'cream',
  },
  {
    number: '03',
    category: 'BIENESTAR',
    title: 'Regalarte una pausa',
    description: 'Experiencias pensadas para habitar el presente.',
    tone: 'terracotta',
  },
];

export function Experiences() {
  return (
    <section id="experiencias" className="experiences section-pad">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">EXPERIENCIAS</span>
          <h2>
            Elige cómo
            <br />
            quieres sentirte.
          </h2>
        </div>

        <div className="experience-list">
          {experiences.map((experience) => (
            <article
              className={`experience-card experience-card--${experience.tone}`}
              key={experience.number}
            >
              <div className="experience-card__number">{experience.number}</div>
              <div className="experience-card__body">
                <span className="eyebrow">{experience.category}</span>
                <h3>{experience.title}</h3>
                <p>{experience.description}</p>
                <ArrowLink href="#contacto">Descubrir</ArrowLink>
              </div>
              <div className="experience-card__shape" aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
