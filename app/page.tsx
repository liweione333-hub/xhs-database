import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';

// 强制页面每次打开都刷新数据
export const revalidate = 0;

export default async function XhsDashboard() {
  // 从数据库获取所有采集到的笔记，按采集时间倒序排列
  const { rows } = await sql`SELECT * FROM xhs_notes ORDER BY created_at DESC`;

  // 计算简单的统计数据
  const totalNotes = rows.length;
  const categories = [...new Set(rows.map(row => row.category))];

  return (
    <main style={{ padding: '40px', fontFamily: 'system-ui', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* 顶部标题栏 */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ color: '#ff2442', fontSize: '28px', margin: 0 }}>📊 小红书爆款监控后台</h1>
            <p style={{ color: '#666', marginTop: '5px' }}>实时同步自插件采集的数据仓库</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '14px', color: '#888' }}>访问域名：</span>
            <code style={{ background: '#eee', padding: '4px 8px', borderRadius: '4px' }}>xhs.kydream.site</code>
          </div>
        </header>

        {/* 统计统计卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>累计采集笔记</p>
            <h2 style={{ fontSize: '32px', margin: '10px 0 0 0', color: '#333' }}>{totalNotes} <small style={{ fontSize: '14px', color: '#ff2442' }}>篇</small></h2>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>已创建分类</p>
            <h2 style={{ fontSize: '32px', margin: '10px 0 0 0', color: '#333' }}>{categories.length} <small style={{ fontSize: '14px', color: '#00a8ff' }}>个</small></h2>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>最新更新时间</p>
            <h2 style={{ fontSize: '20px', margin: '18px 0 0 0', color: '#333' }}>{rows[0] ? new Date(rows[0].created_at).toLocaleString() : '暂无数据'}</h2>
          </div>
        </div>

        {/* 数据表格区 */}
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '15px 20px', color: '#666', fontWeight: '600' }}>笔记标题</th>
                <th style={{ padding: '15px 20px', color: '#666', fontWeight: '600' }}>分类/文件夹</th>
                <th style={{ padding: '15px 20px', color: '#666', fontWeight: '600' }}>点赞数</th>
                <th style={{ padding: '15px 20px', color: '#666', fontWeight: '600' }}>发布时间</th>
                <th style={{ padding: '15px 20px', color: '#666', fontWeight: '600' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((note) => (
                <tr key={note.id} style={{ borderBottom: '1px solid #f5f5f5', transition: '0.2s' }}>
                  <td style={{ padding: '15px 20px', fontWeight: '500', maxWidth: '400px' }}>{note.title}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <span style={{ background: '#fff0f2', color: '#ff2442', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>
                      {note.category}
                    </span>
                  </td>
                  <td style={{ padding: '15px 20px', color: '#ff2442', fontWeight: 'bold' }}>{note.likes}</td>
                  <td style={{ padding: '15px 20px', color: '#888', fontSize: '14px' }}>{note.publish_time}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <a 
                      href={note.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#00a8ff', textDecoration: 'none', fontSize: '14px' }}
                    >
                      查看原帖 ↗
                    </a>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '100px', textAlign: 'center', color: '#999' }}>
                    目前数据库空空如也，快去小红书抓取几条同步过来吧！
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