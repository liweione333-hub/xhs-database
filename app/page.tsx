import { sql } from '@vercel/postgres';
import SearchForm from './SearchForm';
import StarCheckbox from './StarCheckbox'; 
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export const metadata = {
  title: '小红书笔记采集',
};

export default async function XhsDashboard({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined } | Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  noStore();

  const resolvedParams = await searchParams;
  let rawCat = resolvedParams?.cat;
  if (Array.isArray(rawCat)) rawCat = rawCat[0];
  const selectedCat = rawCat && typeof rawCat === 'string' ? rawCat.trim() : '';

  const { rows: allCatsResult } = await sql`SELECT DISTINCT category FROM xhs_notes ORDER BY category ASC`;
  const allCats = allCatsResult.map(row => row.category);

  let query;
  if (selectedCat !== '') {
    const filter = `%${selectedCat}%`;
    query = sql`SELECT * FROM xhs_notes WHERE category ILIKE ${filter} ORDER BY created_at DESC`;
  } else {
    query = sql`SELECT * FROM xhs_notes ORDER BY created_at DESC`;
  }

  const { rows } = await query;

  const totalNotes = rows.length;
  const lastUpdateTime = rows[0] 
    ? new Date(rows[0].created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) 
    : '暂无数据';

  return (
    <main style={{ padding: '40px', fontFamily: 'system-ui', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '25px' }}>
          <h1 style={{ color: '#ff2442', fontSize: '24px', margin: 0 }}>📊 小红书爆款笔记采集</h1>
          <p style={{ color: '#666', marginTop: '5px', fontSize: '14px' }}>系统化管理你的笔记情报库</p>
        </header>

        {/* 【UI 优化】：三合一紧凑型数据看板 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
          
          <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '10px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ color: '#888', fontSize: '13px', margin: '0 0 6px 0' }}>
              当前筛选 {selectedCat ? <span style={{color: '#ff2442', fontWeight: 'bold'}}>[ {selectedCat} ]</span> : '[ 全部 ]'}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <h2 style={{ fontSize: '24px', margin: 0, color: '#333' }}>{totalNotes}</h2>
              <span style={{ fontSize: '13px', color: '#ff2442' }}>篇</span>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '10px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ color: '#888', fontSize: '13px', margin: '0 0 6px 0' }}>库内分类总数</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <h2 style={{ fontSize: '24px', margin: 0, color: '#333' }}>{allCats.length}</h2>
              <span style={{ fontSize: '13px', color: '#00a8ff' }}>个</span>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '10px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ color: '#888', fontSize: '13px', margin: '0 0 6px 0' }}>最新入库时间</p>
            <h2 style={{ fontSize: '16px', margin: 0, color: '#333', fontWeight: '500', lineHeight: '28px' }}>{lastUpdateTime}</h2>
          </div>

        </div>

        {/* 【UI 优化】：紧凑的工具栏外框 */}
        <div style={{ background: '#fff', padding: '15px 20px', borderRadius: '10px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', marginBottom: '20px', display: 'flex', justifyContent: 'flex-start' }}>
          <SearchForm allCats={allCats} initialCat={selectedCat} />
        </div>

        {/* 数据表格区 */}
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '16px 20px', color: '#666', fontWeight: '600', width: '80px', textAlign: 'center', fontSize: '14px' }}>序号</th>
                <th style={{ padding: '16px 20px', color: '#666', fontWeight: '600', fontSize: '14px' }}>笔记标题</th>
                <th style={{ padding: '16px 20px', color: '#666', fontWeight: '600', fontSize: '14px' }}>分类</th>
                <th style={{ padding: '16px 20px', color: '#666', fontWeight: '600', fontSize: '14px' }}>点赞数</th>
                <th style={{ padding: '16px 20px', color: '#666', fontWeight: '600', fontSize: '14px' }}>发布日期</th>
                <th style={{ padding: '16px 20px', color: '#666', fontWeight: '600', fontSize: '14px' }}>链接</th>
                <th style={{ padding: '16px 20px', color: '#666', fontWeight: '600', textAlign: 'center', fontSize: '14px' }}>标记</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? rows.map((note: any, index: number) => (
                <tr key={note.id} style={{ borderBottom: '1px solid #f5f5f5', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafbfc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '14px 20px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: '500', maxWidth: '400px', fontSize: '14px' }}>{note.title}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ background: '#fff0f2', color: '#ff2442', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>
                      {note.category}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#ff2442', fontWeight: 'bold', fontSize: '14px' }}>{note.likes}</td>
                  <td style={{ padding: '14px 20px', color: '#888', fontSize: '13px' }}>{note.publish_time}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <a href={note.url} target="_blank" rel="noopener noreferrer" style={{ color: '#00a8ff', textDecoration: 'none', fontSize: '13px' }}>
                      详情 ↗
                    </a>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <StarCheckbox id={note.id} initialStatus={note.is_starred} />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} style={{ padding: '50px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                    没有找到符合该分类的数据
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