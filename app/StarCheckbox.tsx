"use client";

import { useState } from 'react';

export default function StarCheckbox({ id, initialStatus }: { id: number, initialStatus: boolean }) {
  // 记录当前的打勾状态
  const [checked, setChecked] = useState(initialStatus || false);
  const [loading, setLoading] = useState(false);

  // 点击时的处理函数
  const toggleStatus = async () => {
    if (loading) return;
    
    const newStatus = !checked;
    setChecked(newStatus); // 瞬间变色（提供丝滑体验）
    setLoading(true);

    try {
      // 悄悄向我们刚才写的后台接口发个请求，保存状态
      const res = await fetch('/api/toggle-star', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_starred: newStatus })
      });
      
      if (!res.ok) throw new Error('保存失败');
    } catch (err) {
      // 如果网络错误没存上，把颜色退回去并提示
      setChecked(!newStatus); 
      alert('状态更新失败，请检查网络');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={toggleStatus} 
      style={{ 
        cursor: loading ? 'wait' : 'pointer', 
        fontSize: '22px', 
        userSelect: 'none', 
        textAlign: 'center',
        transition: 'transform 0.1s'
      }}
      title={checked ? "取消关注" : "标为关注"}
    >
      {/* 状态为真显示亮星星，为假显示灰星星 */}
      {checked ? '⭐' : <span style={{ filter: 'grayscale(100%) opacity(30%)' }}>⭐</span>}
    </div>
  );
}