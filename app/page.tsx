import { sql } from '@vercel/postgres';
import SearchForm from './SearchForm';
import StarCheckbox from './StarCheckbox'; 
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link'; // 引入 Link 用于切换排序

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
  
  // 1. 处理筛选参数
  let rawCat = resolvedParams?.cat;
  if (Array.isArray(rawCat)) rawCat = rawCat[0];
  const selectedCat = rawCat && typeof rawCat === 'string' ? rawCat.trim() : '';

  // 2. 处理排序参数 (安全白名单)
  const allowedSortFields = ['created_at', 'likes', 'publish_time'];
  const sortField = allowedSortFields.includes(String(resolvedParams?.sort)) 
    ? String(resolvedParams?.sort) 
    : 'created_at';
  const sortOrder = resolvedParams?.order === 'asc' ? 'ASC' : 'DESC';

  // 辅助函数：生成排序链接的 URL
  const getSortUrl = (field: string) => {
    const newOrder = (sortField === field && sortOrder === 'DESC') ? 'asc' : 'desc';
    const params = new URLSearchParams();
    if (selectedCat) params.set('cat', selectedCat);
    params.set('sort', field);
    params.set('order', newOrder);
    return `?${params.toString()}`;
  };

  // 3. 执行查询
  // 获取全部分类供筛选
  const { rows: allCatsResult } = await sql`SELECT DISTINCT category FROM xhs_notes ORDER BY category ASC`;
  const allCats = allCatsResult.map(row => row.category);

  // 根据排序字段安全地构建 SQL
  let query;
  const filter = selectedCat !== '' ? `%${selectedCat}%` : null;

  // 使用条件分支确保 SQL 安全，因为 sql 模板不支持动态 ID
  if (filter) {
    if (sortField === 'likes') {
      query = sortOrder === 'ASC' 
        ? sql`SELECT * FROM xhs_notes WHERE category ILIKE ${filter} ORDER BY likes ASC`
        : sql`SELECT * FROM xhs_notes WHERE category ILIKE ${filter} ORDER BY likes DESC`;
    } else if (sortField === 'publish_time') {
      query = sortOrder === 'ASC'
        ? sql`SELECT * FROM xhs_notes WHERE category ILIKE ${filter} ORDER BY publish_time ASC`
        : sql`SELECT * FROM xhs_notes WHERE category ILIKE ${filter} ORDER BY publish_time DESC`;
    } else {
      query = sortOrder === 'ASC'
        ? sql`SELECT * FROM xhs_notes WHERE category ILIKE ${filter} ORDER BY created_at ASC`
        : sql`SELECT * FROM xhs_notes WHERE category ILIKE ${filter} ORDER BY created_at DESC`;
    }
  } else {
    if (sortField === 'likes') {
      query = sortOrder === 'ASC' 
        ? sql`SELECT * FROM xhs_notes ORDER BY likes ASC`
        : sql`SELECT * FROM xhs_notes ORDER BY likes DESC`;
    } else if (sortField === 'publish_time') {
      query = sortOrder === 'ASC'
        ? sql`SELECT * FROM xhs_notes ORDER BY publish_time ASC`
        : sql`SELECT * FROM xhs_notes ORDER BY publish_time DESC`;
    } else {
      query = sortOrder === 'ASC'
        ? sql`SELECT * FROM xhs_notes ORDER BY created_at ASC`
        : sql`SELECT * FROM xhs_notes ORDER BY created_at DESC`;
    }
  }

  const { rows } = await query;
  const totalNotes = rows.length;
  const lastUpdateTime = rows[0] 
    ? new Date(rows[0].created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) 
    : '暂无数据';

  return (
    <main style={{ padding: '20px 40px', fontFamily: 'system-ui', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ color: '#ff2442', fontSize: '24px', margin: 0 }}>📊 小红书爆款笔记采集</h1>
            <p style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>系统化管理你的笔记情报库</p>
          </div>
          <SearchForm allCats={allCats} initialCat={selectedCat} />
        </header>

        {/* 统计卡片保持不变 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
          {[
            { label: '筛选结果', value: `${totalNotes} 篇`, sub: selectedCat ? `[ ${selectedCat} ]` : '[ 全部 ]', color: '#ff2442' },
            { label: '分类总数', value: `${allCats.length} 个`, sub: '↑', color: '#00a8ff' },
            { label: '最新入库', value: lastUpdateTime.split(' ')[0], sub: lastUpdateTime.split(' ')[1] || '', color: '#333' }
          ].map((item, i) => (
            <div key={i} style={{ background: '#fff', padding: '12px 20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f0f0f0' }}>
              <span style={{ fontSize: '13px', color: '#666' }}>{item.label} <small style={{color: '#999', marginLeft: '5px'}}>{item.sub}</small></span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* 数据表格 */}
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #eee' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '12px 20px', color: '#666', fontWeight: '600', width: '80px', textAlign: 'center', fontSize: '14px' }}>序号</th>
                <th style={{ padding: '12px 20px', color: '#666', fontWeight: '600', fontSize: '14px' }}>笔记标题</th>
                <th style={{ padding: '12px 20px', color: '#666', fontWeight: '600', fontSize: '14px', width: '120px' }}>作者</th>
                <th style={{ padding: '12px 20px', color: '#666', fontWeight: '600', fontSize: '14px', width: '100px' }}>分类</th>
                {/* 🚀 修改：点赞数表头支持排序 */}
                <th style={{ padding: '12px 20px', color: '#666', fontWeight: '600', fontSize: '14px', width: '110px' }}>
                  <Link href={getSortUrl('likes')} style={{ textDecoration: 'none', color: sortField === 'likes' ? '#ff2442' : 'inherit' }}>
                    点赞数 {sortField === 'likes' ? (sortOrder === 'ASC' ? '↑' : '↓') : '↕'}
                  </Link>
                </th>
                {/* 🚀 修改：发布日期表头支持排序 */}
                <th style={{ padding: '12px 20px', color: '#666', fontWeight: '600', fontSize: '14px', width: '120px' }}>
                  <Link href={getSortUrl('publish_time')} style={{ textDecoration: 'none', color: sortField === 'publish_time' ? '#ff2442' : 'inherit' }}>
                    发布日期 {sortField === 'publish_time' ? (sortOrder === 'ASC' ? '↑' : '↓') : '↕'}
                  </Link>
                </th>
                <th style={{ padding: '12px 20px', color: '#666', fontWeight: '600', fontSize: '14px', width: '70px', textAlign: 'center' }}>链接</th>
                <th style={{ padding: '12px 20px', color: '#666', fontWeight: '600', fontSize: '14px', width: '60px', textAlign: 'center' }}>标记</th>
              </tr>
            </thead>
            <tbody>
              {/* 表格内容渲染保持不变 */}
              {rows.length > 0 ? rows.map((note: any, index: number) => (
                <tr key={note.id} style={{ borderBottom: '1px solid #f8f8f8' }}>
                  <td style={{ padding: '10px 20px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>{index + 1}</td>
                  <td style={{ padding: '10px 20px', fontWeight: '500', maxWidth: '300px', fontSize: '14px' }}>{note.title}</td>
                  <td style={{ padding: '10px 20px', color: '#555', fontSize: '13px', fontWeight: '500' }}>{note.author || '未知作者'}</td>
                  <td style={{ padding: '10px 20px' }}><span style={{ background: '#fff0f2', color: '#ff2442', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '500', whiteSpace: 'nowrap' }}>{note.category}</span></td>
                  <td style={{ padding: '10px 20px', color: '#ff2442', fontWeight: 'bold', fontSize: '14px' }}>{note.likes}</td>
                  <td style={{ padding: '10px 20px', color: '#888', fontSize: '13px' }}>{note.publish_time}</td>
                  <td style={{ padding: '10px 20px', textAlign: 'center' }}><a href={note.url} target="_blank" rel="noopener noreferrer" style={{ color: '#00a8ff', textDecoration: 'none', fontSize: '13px' }}>详情 ↗</a></td>
                  <td style={{ padding: '10px 20px', textAlign: 'center' }}><StarCheckbox id={note.id} initialStatus={note.is_starred} /></td>
                </tr>
              )) : (
                <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>没有找到符合该分类的数据</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}