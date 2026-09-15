import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, version = 'v3', provider = 'openrouter' } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    // Resolve path to starter_v0
    const repoRoot = path.resolve(process.cwd(), '..');
    const starterDir = path.join(repoRoot, 'starter_v0');

    // Run Python execution snippet to execute HelpdeskAgent cleanly without modifying starter_v0
    const pythonCode = `import json, sys, pathlib, io; sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8'); sys.path.insert(0, r'${starterDir}'); from env_loader import load_lab_env; load_lab_env(pathlib.Path(r'${starterDir}')); from providers import make_provider; from tools import load_tool_declarations, to_openai_tools; from agent import HelpdeskAgent; prompt = (pathlib.Path(r'${starterDir}') / 'artifacts' / 'system_prompt.md').read_text(encoding='utf-8'); tools = to_openai_tools(load_tool_declarations(pathlib.Path(r'${starterDir}') / 'artifacts' / 'tools.yaml')); provider = make_provider('${provider}'); agent = HelpdeskAgent(provider, system_prompt=prompt, tools=tools); user_messages = ${JSON.stringify(messages)}; run = agent.run(user_messages); output = {'text': run.text, 'tool_calls': [{'name': tc.name, 'args': tc.args} for tc in run.tool_calls], 'tool_results': run.tool_results}; print(json.dumps(output, ensure_ascii=False))`;

    return new Promise((resolve) => {
      exec(`python -c "${pythonCode.replace(/"/g, '\\"')}"`, { cwd: starterDir, env: { ...process.env, PYTHONIOENCODING: 'utf-8' } }, (error, stdout, stderr) => {


        if (error) {
          console.error('Python Exec Error:', stderr || error.message);
          return resolve(NextResponse.json({
            text: "Xin lỗi, đã xảy ra lỗi khi gọi Agent loop.",
            tool_calls: [],
            tool_results: [{ error: "execution_error", message: stderr || error.message }]
          }));
        }

        try {
          const result = JSON.parse(stdout.trim());
          return resolve(NextResponse.json(result));
        } catch (parseErr) {
          return resolve(NextResponse.json({
            text: stdout.trim() || "Hoàn thành.",
            tool_calls: [],
            tool_results: []
          }));
        }
      });
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
