"use client"; 

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SearchForm({ 
  allCats, 
  initialCat 
}: { 
  allCats: string[], 
  initialCat: string 
}) {
  const router = useRouter();
  const pathname = usePathname(); 
  const searchParams = useSearchParams();

  const [cat, setCat] = useState(initialCat);

  useEffect(() => {
    setCat(initialCat);
  }, [initialCat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 
    
    const params = new URLSearchParams(searchParams.toString());
    if (cat.trim() !== '') {
      params.set('cat', cat.trim());
    } else {
      params.delete('cat');
    }
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    router.refresh(); 
  };

  const handleReset = () => {
    setCat('');
    router.push(`${pathname}`, { scroll: false });
    router.refresh(); 
  };

  // 【UI 优化】：改为靠左的紧凑型工具栏排列，缩小按钮和输入框
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <label style={{ fontSize: '14px', color: '#333', fontWeight: '600', whiteSpace: 'nowrap' }}>
        按分类查询：
      </label>
      
      <input 
        value={cat}
        onChange={(e) => setCat(e.target.value)}
        list="category-list"
        placeholder="输入或选择分类..." 
        style={{ width: '220px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px', outline: 'none' }} 
      />
      <datalist id="category-list">
        {allCats.map(c => <option key={c} value={c} />)}
      </datalist>
      
      <button type="submit" style={{ padding: '8px 16px', background: '#ff2442', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'opacity 0.2s' }}>
        🔍 筛选
      </button>
      
      <button type="button" onClick={handleReset} style={{ padding: '8px 10px', background: 'transparent', border: 'none', color: '#888', fontSize: '13px', cursor: 'pointer' }}>
        重置
      </button>
    </form>
  );
}