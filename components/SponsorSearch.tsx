'use client'
import { createClient } from '@/utils/supabase/client'

import { useState, useEffect, useRef } from 'react';
import { searchSponsors } from '../app/actions/search_actions';

export default function SponsorSearch() {
  const supabase = createClient() // Initialize the client inside the component
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ sponsor_dfe_name: string; spons_dfe_ein: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

// Debounced search logic
  useEffect(() => {
    const fetchSponsors = async () => {
      if (query.length >= 3) {
        setIsLoading(true);
        console.log("Searching for:", query);
        
        const { data, error } = await supabase
          .from('f_5500_data') 
          .select('sponsor_dfe_name, spons_dfe_ein')
          .ilike('sponsor_dfe_name', `%${query}%`)
          .limit(10);

        setIsLoading(false);

        if (error) {
          console.error("Supabase error:", error.message);
          return;
        } 

        if (data) {
          setResults(data);
          setIsOpen(true); // Ensures the dropdown opens when data arrives
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }; // This closes fetchSponsors correctly

    const debounceTimer = setTimeout(() => {
      fetchSponsors();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [query, supabase]);
  
return (
    <div className="relative w-full max-w-lg mx-auto" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-slate-700 mb-1">
        Sponsor Name
      </label>
      
      <div className="relative">
        <input
          type="text"
          className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900"
          placeholder="Type 3+ characters (e.g. Walmart)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 3 && setIsOpen(true)}
        />
        
        {/* The Spinner - Fixed Positioning */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* The Floating Dropdown Menu */}
      {isOpen && (
        <ul className="absolute z-[100] w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-2xl max-h-72 overflow-y-auto list-none p-0">
          {results.length > 0 ? (
            results.map((item, index) => (
              <li
                key={`${item.spons_dfe_ein}-${index}`}
                className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b last:border-b-0 border-slate-100 transition-colors list-none"
                onClick={() => {
                  setQuery(item.sponsor_dfe_name);
                  setIsOpen(false);
                }}
              >
                <div className="font-medium text-slate-900">{item.sponsor_dfe_name}</div>
                <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">
                  EIN: {item.spons_dfe_ein}
                </div>
              </li>
            ))
          ) : !isLoading && query.length >= 3 && (
            <li className="px-4 py-4 text-center text-slate-500 text-sm italic list-none">
              No results found for "{query}"
            </li>
          )}
        </ul>
      )}
    </div>
  );
}