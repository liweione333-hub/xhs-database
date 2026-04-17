import { sql } from '@vercel/postgres';

// 1. 修改浏览器标签页标题
export const metadata = {
  title: '小红书笔记采集',
};

// 强制不缓存，确保每次筛选都是实时查询
export const revalidate = 0;

export default async function XhsDashboard(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // 核心修复：在 Next.js 新版本中，searchParams 必须 await 才能获取
  const searchParams = await props.searchParams;
  const selectedCat = (searchParams.cat as string) || '';

  // 2. 获取所有唯一的分类（用于下拉提示列表）
  const { rows: allCats } = await sql`SELECT DISTINCT category FROM xhs_notes ORDER BY category ASC`;

  // 3. 实际生效的筛选逻辑
  let query;
  if (selectedCat) {
    // 使用 ILIKE 进行模糊匹配，支持手动输入关键词查询分类
    const filter = `%${selectedCat}%`;
    query = sql`SELECT * FROM xhs_notes WHERE category ILIKE ${filter} ORDER BY created_at DESC`;
  } else {
    query = sql`SELECT * FROM xhs_notes ORDER BY created_at DESC`;
  }

  const { rows } = await query;

  // 统计数据
  const totalNotes = rows.length;
  // 转换为北京时间显示
  const lastUpdateTime = rows[0] 
    ? new Date(rows[0].created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) 
    : '暂无数据';

  return (
    <main style={{ padding: '40px', fontFamily: 'system-ui', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* 顶部标题栏 */}
        <header style={{ marginBottom: '30px' }}>
          <h1 style={{ color: '#ff2442', fontSize: '28px', margin: 0 }}>📊 小红书笔记采集后台</h1>
          <p style={{ color: '#666', marginTop: '5px' }}>系统化管理你的爆款情报库</p>
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

        {/* 筛选功能区：支持手动输入与下拉联动 */}
        <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <form action="/" method="GET" style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '14px', color: '#333', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                按分类查询（可输入关键词或直接选择）：
              </label>
              <input 
                name="cat" 
                list="category-list"
                defaultValue={selectedCat}
                placeholder="例如输入：竞品、穿搭、痛点..." 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} 
              />
              <datalist id="category-list">
                {allCats.map(c => (
                  <option key={c.category} value={c.category} />
                ))}
              </datalist>
            </div>
            
            <button type="submit" style={{ padding: '12px 30px', background: '#ff2442', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
              🔍 立即筛选
            </button>
            <a href="/" style={{ paddingBottom: '12px', color: '#666', textDecoration: 'none', fontSize: '13px' }}>重置</a>
          </form>
        </div>

        {/* 数据表格区 */}
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '18px 20px', color: '#666', fontWeight: '600' }}>笔记标题</th>
                <th style={{ padding: '18px 20px', color: '#666', fontWeight: '600' }}>分类</th>
                <th style={{ padding: '18px 20px', color: '#666', fontWeight: '600' }}>点赞数</th>
                <th style={{ padding: '18px 20px', color: '#666', fontWeight: '600' }}>发布日期</th>
                <th style={{ padding: '18px 20px', color: '#666', fontWeight: '600' }}>链接</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((note: any) => (
                <tr key={note.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
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