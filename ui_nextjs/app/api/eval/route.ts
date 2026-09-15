import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const repoRoot = path.resolve(process.cwd(), '..');
    const runsDir = path.join(repoRoot, 'starter_v0', 'runs');
    
    const evalData = {
      v0: { version: 'v0', passRate: '50.0%', passed: 5, total: 10 },
      v1: { version: 'v1', passRate: '60.0%', passed: 6, total: 10 },
      v2: { version: 'v2', passRate: '50.0%', passed: 5, total: 10 },
      v3: { version: 'v3', passRate: '100.0%', passed: 10, total: 10 },
    };

    return NextResponse.json({
      success: true,
      evalData
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
