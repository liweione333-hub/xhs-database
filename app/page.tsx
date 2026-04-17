import { sql } from '@vercel/postgres';
import SearchForm from './SearchForm'; // 引入刚才新建的无刷新组件

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: '小红书笔记采集',
};

export default async function XhsDashboard(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const selectedCat = typeof searchParams.cat === 'string' ? searchParams.cat.trim() : '';

  // 获取所有唯一的分类
  const { rows: allCatsResult } = await sql`SELECT DISTINCT category FROM xhs_notes ORDER BY category ASC`;
  // 将对象数组转换为纯字符串数组，传给子组件
  const allCats = allCatsResult.map(row => row.category);

  let query;
  if (selectedCat) {
    const filter = `%${selectedCat}%`;
    query = sql`SELECT * FROM xhs_notes WHERE category LIKE ${filter} ORDER BY created_at DESC`;
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
        
        {/* 顶部标题栏 */}
        <header style={{ marginBottom: '30px' }}>
          <h1 style={{ color: '#ff2442', fontSize: '28px', margin: 0 }}>📊 小红书爆款笔记采集</h1>
          <p style={{ color: '#666', marginTop: '5px' }}>系统化管理你的笔记情报库</p>
        </header>

        {/* 统计卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>当前筛选结果</p>
            <h2 style={{ fontSize: '32px', margin: '10px 0 0 0', color: '#333' }}>{totalNotes} <small style={{ fontSize: '14px', color: '#ff2442' }}>篇</small></h2>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>库内分类总数</p>
            <h2 style={{ fontSize: '32px', margin: '10px 0 0 0', color: '#333' }}>{allCats.length} <small style={{ fontSize: '14px', color: '#00a8ff' }}>个</small></h2>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>最新入库时间</p>
            <h2 style={{ fontSize: '18px', margin: '18px 0 0 0', color: '#333' }}>{lastUpdateTime}</h2>
          </div>
        </div>

        {/* 筛选功能区：现在使用独立的客户端无刷新组件 */}
        <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <SearchForm allCats={allCats} initialCat={selectedCat} />
        </div>

        {/* 数据表格区 */}
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '18px 20px', color: '#666', fontWeight: '600', width: '100px', textAlign: 'center' }}>序号</th>
                <th style={{ padding: '18px 20px', color: '#666', fontWeight: '600' }}>笔记标题</th>
                <th style={{ padding: '18px 20px', color: '#666', fontWeight: '600' }}>分类</th>
                <th style={{ padding: '18px 20px', color: '#666', fontWeight: '600' }}>点赞数</th>
                <th style={{ padding: '18px 20px', color: '#666', fontWeight: '600' }}>发布日期</th>
                <th style={{ padding: '18px 20px', color: '#666', fontWeight: '600' }}>链接</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((note: any, index: number) => (
                <tr key={note.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '15px 20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: '15px 20px', fontWeight: '500', maxWidth: '450px' }}>{note.title}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <span style={{ background: '#fff0f2', color: '#ff2442', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
                      {note.category}
                    </span>
                  </td>
                  <td style={{ padding: '15px 20px', color: '#ff2442', fontWeight: 'bold' }}>{note.likes}</td>
                  <td style={{ padding: '15px 20px', color: '#888', fontSize: '14px' }}>{note.publish_time}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <a href={note.url} target="_blank" rel="noopener noreferrer" style={{ color: '#00a8ff', textDecoration: 'none' }}>
                      详情 ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}