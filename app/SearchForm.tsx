"use client"; // 告诉系统这是一个在浏览器端运行的交互组件

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchForm({ 
  allCats, 
  initialCat 
}: { 
  allCats: string[], 
  initialCat: string 
}) {
  const router = useRouter();
  const [cat, setCat] = useState(initialCat);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // 核心：拦截并阻止浏览器默认的“整体刷新”行为
    // 核心：使用 Next.js 路由进行静默更新，scroll: false 保证页面不会自动跳回最顶部
    router.push(`?cat=${encodeURIComponent(cat)}`, { scroll: false });
  };

  const handleReset = () => {
    setCat('');
    router.push('?', { scroll: false });
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