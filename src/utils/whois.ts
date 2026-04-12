import axios from 'axios';
import type { WhoisResponse } from '../types/whois.d.ts';

export async function getWhoisInfo(domain: string): Promise<WhoisResponse> {
  const response = await axios.post('https://whoiscx.com/api/whois/info/', {
    domain
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  // 检查API响应的状态
  if (response.data.status === 0) {
    throw new Error(response.data.error || '查询失败');
  }

  return response.data;
}
