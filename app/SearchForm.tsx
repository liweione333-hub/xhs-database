"use client"; 

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SearchForm({ allCats, initialCat }: { allCats: string[], initialCat: string }) {
  const router = useRouter();
  const pathname = usePathname(); 
  const searchParams = useSearchParams();
  const [cat, setCat] = useState(initialCat);

  useEffect(() => { setCat(initialCat); }, [initialCat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 
    const params = new URLSearchParams(searchParams.toString());
    if (cat.trim()) {
      params.set('cat', cat.trim());
    } else {
      params.delete('cat');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    router.refresh(); 
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '5px',
      background: '#fff',
      padding: '4px 4px 4px 12px',
      borderRadius: '25px',
      border: '1px solid #ddd',
      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      width: 'fit-content'
    }}>
      <span style={{ fontSize: '12px', color: '#999', whiteSpace: 'nowrap' }}>📁 分类:</span>
      <input 
        value={cat}
        onChange={(e) => setCat(e.target.value)}
        list="category-list"
        placeholder="输入关键词..." 
        style={{ 
          border: 'none', 
          outline: 'none', 
          fontSize: '13px', 
          width: '150px',
          color: '#333',
          padding: '4px 0'
        }} 
      />
      <datalist id="category-list">
        {allCats.map(c => (
          <option key={c} value={c} />
        ))}
      </datalist>
      
      <button type="submit" style={{ 
        padding: '6px 14px', 
        background: '#ff2442', 
        color: '#fff', 
        border: 'none', 
        borderRadius: '20px', 
        cursor: 'pointer', 
        fontWeight: '600', 
        fontSize: '12px',
        transition: 'opacity 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
      onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
      >
        筛选
      </button>

      {cat && (
        <button 
          type="button" 
          onClick={() => { setCat(''); router.push(pathname); router.refresh(); }} 
          style={{
            background: 'none', 
            border: 'none', 
            color: '#999', 
            fontSize: '11px', 
            cursor: 'pointer', 
            padding: '0 8px',
            textDecoration: 'underline'
          }}
        >
          重置
        </button>
      )}
    </form>
  );
}