import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { id, is_starred } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: '缺少数据 ID' }, { status: 400 });
    }

    // 更新数据库中这行数据的打勾状态
    await sql`UPDATE xhs_notes SET is_starred = ${is_starred} WHERE id = ${id}`;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}