import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// 允许插件跨域请求的设置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 处理预检请求 (浏览器的安全机制)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// 接收插件发来的 POST 数据并存入数据库
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, secret, category = '未分类' } = body;

    // 安全校验：防止别人乱发数据到你的数据库
    if (secret !== 'my_super_secret_123') {
      return NextResponse.json({ error: '密钥错误，拒绝访问' }, { status: 401, headers: corsHeaders });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: '没有接收到数据' }, { status: 400, headers: corsHeaders });
    }

    let insertedCount = 0;
    
    // 循环把插件传来的每一条小红书笔记插入数据库
    for (const note of data) {
      await sql`
        INSERT INTO xhs_notes (title, likes, publish_time, url, category)
        VALUES (${note.title}, ${note.likes}, ${note.time}, ${note.url}, ${category});
      `;
      insertedCount++;
    }

    return NextResponse.json(
      { message: `成功将 ${insertedCount} 条数据保存到了云端分类：【${category}】！` },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}