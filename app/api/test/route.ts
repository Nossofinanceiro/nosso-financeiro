import { NextResponse } from 'next/server';
import fs from 'fs';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    fs.writeFileSync('error_log.json', body);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false });
  }
}
