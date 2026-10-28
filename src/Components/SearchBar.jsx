import { useEffect, useState } from 'react';
import Icon from './Icon';

const CAPTIONS = {
  semantic: 'Matches by meaning and by your words.',
  keyword: 'Matches your words and tags. Meaning-based matching is not active, so use words from the note.',
};

function SearchBar({searchQuery,setSearchQuery,handleSearch,clearSearch,fetchNotes,loading}) {
 const [mode, setMode] = useState('keyword');
 const [truncated, setTruncated] = useState(false);
 useEffect(() => {
  const onMode = event => setMode(event.detail?.mode === 'semantic' ? 'semantic' : 'keyword');
  const onMeta = event => setTruncated(Boolean(event.detail?.truncated));
  window.addEventListener('voxnote:search-mode', onMode);
  window.addEventListener('voxnote:notes-meta', onMeta);
  return () => {
   window.removeEventListener('voxnote:search-mode', onMode);
   window.removeEventListener('voxnote:notes-meta', onMeta);
  };
 }, []);
 return <section className="card search-card"><p className="eyebrow">FIND THAT THOUGHT</p><h2>Search your notes</h2><form onSubmit={e=>{e.preventDefault();handleSearch(searchQuery)}}><label className="search-input"><Icon name="search" size={18}/><input aria-label="Search notes by word or tag" placeholder="A word, a phrase, a #tag..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/></label><div className="button-row"><button disabled={loading || !searchQuery.trim()}>Search notes</button><button type="button" className="text-button" onClick={clearSearch} disabled={loading}>Clear</button><button type="button" className="text-button" onClick={fetchNotes} disabled={loading}>Refresh</button></div></form><p className="search-caption">{CAPTIONS[mode]}</p>{truncated && <p className="search-caption">Only the first 1000 notes are loaded; older notes are not listed.</p>}</section>;
}
export default SearchBar;
