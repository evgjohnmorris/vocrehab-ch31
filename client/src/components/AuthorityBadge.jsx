import { Scale, Book, ShieldAlert } from 'lucide-react';

function AuthorityBadge({ level, className = '' }) {
  const getBadgeStyle = () => {
    switch (level) {
      case 'binding_law':
      case 'binding':
        return {
          bg: 'bg-emerald-950/40 backdrop-blur-md',
          border: 'border-emerald-800/60',
          text: 'text-emerald-300 font-semibold',
          label: 'BINDING LAW',
          desc: 'Statute or regulation: VA must adhere strictly.', // @cite 38-cfr-21-40
          icon: <Scale size={13} className="mr-1 inline-block" />
        };
      case 'va_manual':
      case 'policy':
        return {
          bg: 'bg-indigo-950/40 backdrop-blur-md',
          border: 'border-indigo-800/60',
          text: 'text-indigo-300 font-medium',
          label: 'VA MANUAL / POLICY',
          desc: 'Internal manual guidance: binding on VRCs, but subordinate to law.',
          icon: <Book size={13} className="mr-1 inline-block" />
        };
      case 'persuasive':
      case 'supporting':
      default:
        return {
          bg: 'bg-amber-950/40 backdrop-blur-md',
          border: 'border-amber-800/60',
          text: 'text-amber-300',
          label: 'PERSUASIVE',
          desc: 'Advocacy guides, BVA decisions, or reports: supports arguments.',
          icon: <ShieldAlert size={13} className="mr-1 inline-block" />
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <span 
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${style.bg} ${style.border} ${style.text} ${className}`}
      title={style.desc}
    >
      {style.icon}
      {style.label}
    </span>
  );
}

export default AuthorityBadge;
