// functions/api/visitor.js — 访客相关写操作（需要 secret key）

export async function onRequestPost(context) {
  const { request, env } = context;
  const json = d => new Response(JSON.stringify(d), {
    headers: { 'Content-Type': 'application/json' },
  });

  const supabaseUrl = env.SUPABASE_URL;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': env.SUPABASE_SECRET_KEY,
    'Authorization': `Bearer ${env.SUPABASE_SECRET_KEY}`,
    'Prefer': 'return=representation',
  };

  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  if (action === 'updateCard') {
    let body;
    try { body = await request.json(); } catch { return json({ error: '参数错误' }); }

    const { visitorId, nickname, avatarUrl, bio } = body;
    if (!visitorId) return json({ error: '缺少 visitorId' });

    // 验证 visitorId 存在
    const checkRes = await fetch(
      `${supabaseUrl}/rest/v1/visitors?id=eq.${visitorId}&select=id`,
      { headers }
    );
    const checkData = await checkRes.json();
    if (!checkData?.length) return json({ error: '访客不存在' });

    // 更新名片字段（null 表示清空）
    const patch = {
      nickname: nickname?.trim() || null,
      avatar_url: avatarUrl?.trim() || null,
      bio: bio?.trim() || null,
    };

    const res = await fetch(
      `${supabaseUrl}/rest/v1/visitors?id=eq.${visitorId}`,
      { method: 'PATCH', headers, body: JSON.stringify(patch) }
    );

    if (!res.ok) return json({ error: '保存失败' });
    return json({ ok: true });
  }

  return json({ error: '未知操作' });
}