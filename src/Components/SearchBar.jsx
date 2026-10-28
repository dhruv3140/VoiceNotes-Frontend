import Icon from './Icon';
function SearchBar({searchQuery,setSearchQuery,handleSearch,clearSearch,fetchNotes,loading}) {
 return <section className="card search-card"><p className="eyebrow">FIND THAT THOUGHT</p><h2>Search by meaning</h2><form onSubmit={e=>{e.preventDefault();handleSearch(searchQuery)}}><label className="search-input"><Icon name="search" size={18}/><input aria-label="Search notes by meaning or tag" placeholder="An idea, a phrase, a #tag..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/></label><div className="button-row"><button disabled={loading || !searchQuery.trim()}>Search notes</button><button type="button" className="text-button" onClick={clearSearch} disabled={loading}>Clear</button><button type="button" className="text-button" onClick={fetchNotes} disabled={loading}>Refresh</button></div></form><p className="search-caption">You don't need the exact words.</p></section>;
}
export default SearchBar;
