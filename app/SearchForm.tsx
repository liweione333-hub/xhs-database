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

  // 监听浏览器前进后退，自动同步输入框的文字
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
    
    // 1. 无感更新网址
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    // 2. 【核心修复】：强行踹一脚服务器，命令它立刻去数据库拿最新数据！
    router.refresh(); 
  };

  const handleReset = () => {
    setCat('');
    router.push(`${pathname}`, { scroll: false });
    router.refresh(); // 同样强制刷新
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
      <div style={{ flex: 1 }}>
        <label style={{ fontSize: '14px', color: '#333', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
          按分类查询（可输入关键词或直接选择）：
        </label>
        <input 
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          list="category-list"
          placeholder="例如输入：竞品、穿搭、痛点..." 
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} 
        />
        <datalist id="category-list">
          {allCats.map(c => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      
      <button type="submit" style={{ padding: '12px 30px', background: '#ff2442', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
        🔍 立即筛选
      </button>
      
      <button type="button" onClick={handleReset} style={{ paddingBottom: '12px', background: 'none', border: 'none', color: '#666', textDecoration: 'none', fontSize: '13px', cursor: 'pointer' }}>
        重置
      </button>
    </form>
  );
}