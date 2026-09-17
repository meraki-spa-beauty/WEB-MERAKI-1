import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/sections/Hero';
import { Manifesto } from '../components/sections/Manifesto';
import { Experiences } from '../components/sections/Experiences';
import { Philosophy } from '../components/sections/Philosophy';
import { EditorialImage } from '../components/sections/EditorialImage';
import { BookingCTA } from '../components/sections/BookingCTA';
import { ContactSection } from '../components/sections/ContactSection';
export function Home() { return <div className="site-shell"><Header/><main><Hero/><Manifesto/><Experiences/><Philosophy/><EditorialImage/><BookingCTA/><ContactSection/></main><Footer/></div>; }
