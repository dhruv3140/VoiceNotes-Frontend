const paths = {
 mic: <><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/></>,
 folder:<path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>,
 note:<><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
 search:<><circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/></>,
 close:<path d="m6 6 12 12M6 18 18 6"/>,
 menu:<path d="M4 6h16M4 12h16M4 18h16"/>,
 arrow:<path d="m9 5 7 7-7 7"/>,
 plus:<path d="M12 5v14M5 12h14"/>,
 tag:<><path d="M3 3h8l10 10-8 8L3 11Z"/><circle cx="7.5" cy="7.5" r=".7"/></>,
 eye:<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
};
export default function Icon({name,size=20,...props}) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.note}</svg>; }
