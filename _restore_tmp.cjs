#!/usr/bin/env node
'use strict';
/* 从 ima「skill」知识库恢复 4 个技能为 /workspace 下的 SKILL.md 目录 */
const fs = require('node:fs');
const path = require('node:path');

process.env.IMA_SKILL_VERSION = '1.1.10';
const { imaApi } = require('/workspace/ima-skill/ima_api.cjs');

const JOBS = [
  { media: 'markdown_9311d108c49f208c9bd3c83e54a1d81e_cdbe05bad724d83e72c9ecd9ef7a79957504484708154981', out: 'XTW.skill' },
  { media: 'markdown_9311d108c49f208c9bd3c83e54a1d81e_4ca43c7132eeb6cf8d4bb29af9fe44917504484708154981', out: 'check.skill' },
  { media: 'markdown_9311d108c49f208c9bd3c83e54a1d81e_44dfc58985f62661c50606f138b0cb3f7504484708154981', out: '公众号发布工具' },
  { media: 'markdown_9311d108c49f208c9bd3c83e54a1d81e_027671690aeb445fdf7106c8aebd1cb27504484708154981', out: 'doi-sum' },
];

async function getMedia(mediaId) {
  const raw = await imaApi('openapi/wiki/v1/get_media_info', { media_id: mediaId }, {});
  return JSON.parse(raw);
}

(async () => {
  for (const { media, out } of JOBS) {
    const resp = await getMedia(media);
    if (resp.code !== 0) {
      console.error(`SKIP ${out}: get_media_info ${resp.code} ${resp.msg}`);
      continue;
    }
    const urlInfo = resp.data && resp.data.url_info;
    if (!urlInfo || !urlInfo.url) {
      console.error(`SKIP ${out}: 无 url_info`);
      continue;
    }
    const headers = urlInfo.headers || {};
    const contentResp = await fetch(urlInfo.url, { headers });
    if (!contentResp.ok) {
      console.error(`SKIP ${out}: 下载 HTTP ${contentResp.status}`);
      continue;
    }
    let text = await contentResp.text();
    // 去除文件大小限制行（如果下载回的是原始 md）
    const dir = `/workspace/${out}`;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'SKILL.md'), text, 'utf8');
    console.log(`OK  ${out}/SKILL.md  (${text.length} chars)`);
  }
  console.log('DONE');
})().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});