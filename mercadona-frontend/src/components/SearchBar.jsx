// src/components/SearchBar.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/buscar?query=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex-grow-1 w-100">
      <div className="input-group">
        <span className="input-group-text bg-white text-muted border-end-0">
          <i className="bi bi-search"></i>
        </span>
        <input
          type="search"
          className="form-control border-start-0 ps-0"
          placeholder="Buscar producto..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
        <button className="btn btn-success" type="submit">Buscar</button>
      </div>
    </form>
  );
}