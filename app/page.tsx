import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';

// 强制页面实时刷新
export const revalidate = 0;

export default async function XhsDashboard({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // 获取筛选参数：分类(cat) 和 关键词(q)
  const selectedCat = searchParams.cat as string || '';
  const searchQuery = searchParams.q as string || '';

  // 1. 获取所有唯一的分类名（用于下拉列表）
  const { rows: allCats } = await sql`SELECT DISTINCT category FROM xhs_notes ORDER BY category ASC`;

  // 2. 根据筛选条件查询数据
  let query;
  if (selectedCat && searchQuery) {
    query = sql`SELECT * FROM xhs_notes WHERE category = ${selectedCat} AND title ILIKE ${'%' + searchQuery + '%'} ORDER BY created_at DESC`;
  } else if (selectedCat) {
    query = sql`SELECT * FROM xhs_notes WHERE category = ${selectedCat} ORDER BY created_at DESC`;
  } else if (searchQuery) {
    query = sql`SELECT * FROM xhs_notes WHERE title ILIKE ${'%' + searchQuery + '%'} ORDER BY created_at DESC`;
  } else {
    query = sql`SELECT * FROM xhs_notes ORDER BY created_at DESC`;
  }

  const { rows } = await query;

  // 统计数据
  const totalNotes = rows.length;
  const lastUpdateTime = rows[0] 
    ? new Date(rows[0].created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) 
    : '暂无数据';

  return (
    <main style={{ padding: '40px', fontFamily: 'system-ui', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* 顶部标题栏 */}
        <header style={{ marginBottom: '30px' }}>
          <h1 style={{ color: '#ff2442', fontSize: '28px', margin: 0 }}>📊 小红书爆款笔记采集</h1>
          <p style={{ color: '#666', marginTop: '5px' }}>实时同步自插件采集的数据仓库</p>
        </header>

        {/* 统计卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>筛选结果</p>
            <h2 style={{ fontSize: '32px', margin: '10px 0 0 0', color: '#333' }}>{totalNotes} <small style={{ fontSize: '14px', color: '#ff2442' }}>篇</small></h2>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>分类总数</p>
            <h2 style={{ fontSize: '32px', margin: '10px 0 0 0', color: '#333' }}>{allCats.length} <small style={{ fontSize: '14px', color: '#00a8ff' }}>个</small></h2>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>最新更新 (北京时间)</p>
            <h2 style={{ fontSize: '18px', margin: '18px 0 0 0', color: '#333' }}>{lastUpdateTime}</h2>
          </div>
        </div>

        {/* 筛选与查询功能区 */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <form method="GET" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '5px' }}>关键词查询：</label>
              <input 
                name="q" 
                defaultValue={searchQuery}
                placeholder="搜索笔记标题..." 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} 
              />
            </div>
            <div style={{ width: '200px' }}>
              <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '5px' }}>选择分类：</label>
              <select 
                name="cat" 
                defaultValue={selectedCat}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              >
                <option value="">全部分类</option>
                {allCats.map(c => (
                  <option key={c.category} value={c.category}>{c.category}</option>
                ))}
              </select>
            </div>
            <div style={{ paddingTop: '20px' }}>
              <button type="submit" style={{ padding: '11px 25px', background: '#ff2442', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                🔍 立即筛选
              </button>
              <a href="/" style={{ marginLeft: '10px', color: '#666', textDecoration: 'none', fontSize: '13px' }}>清空条件</a>
            </div>
          </form>
        </div>

        {/* 数据表格区 */}
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '15px 20px', color: '#666', fontWeight: '600' }}>笔记标题</th>
                <th style={{ padding: '15px 20px', color: '#666', fontWeight: '600' }}>分类</th>
                <th style={{ padding: '15px 20px', color: '#666', fontWeight: '600' }}>点赞数</th>
                <th style={{ padding: '15px 20px', color: '#666', fontWeight: '600' }}>发布时间</th>
                <th style={{ padding: '15px 20px', color: '#666', fontWeight: '600' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((note: any) => (
                <tr key={note.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '15px 20px', fontWeight: '500', maxWidth: '400px' }}>{note.title}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <span style={{ background: '#fff0f2', color: '#ff2442', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>
                      {note.category}
                    </span>
                  </td>
                  <td style={{ padding: '15px 20px', color: '#ff2442', fontWeight: 'bold' }}>{note.likes}</td>
                  <td style={{ padding: '15px 20px', color: '#888', fontSize: '14px' }}>{note.publish_time}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <a href={note.url} target="_blank" rel="noopener noreferrer" style={{ color: '#00a8ff', textDecoration: 'none', fontSize: '14px' }}>
                      查看原帖 ↗
                    </a>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '80px', textAlign: 'center', color: '#999' }}>
                    没有找到符合条件的笔记。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}