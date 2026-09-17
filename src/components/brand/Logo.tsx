import { Link } from 'react-router-dom';

export function Logo() {
  return <Link className="brand-lockup" to="/" aria-label="Meraki, inicio"><span className="brand-mark" aria-hidden="true">Me</span><span className="brand-wordmark">Meraki</span></Link>;
}
