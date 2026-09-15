/**
 * K4 Level 3B — Prompt Engineering & Tool Calling Labs
 * AI Agent Evaluation & Demo Dashboard Logic
 */
const DEMO_DATA = window.MOCK_DATA || {};
class AgentDashboardApp {
  constructor() {
    this.currentScenarioId = "basic-device";
    this.currentVersion = "v3";
    this.activeTraceStep = 0;
    this.isAutoplayRunning = false;
    this.autoplayTimer = null;
    this.autoplayIndex = 0;
    this.runtimeRuns = {};
    this.runtimeDataReady = false;
    this.runtimeRunPaths = {
      v1: "starter_v0/runs/v1_B_base_openrouter_20260915T183244852658.json",
      v2: "starter_v0/runs/v2_B_base_openrouter_20260915T184058069311.json",
      v3: "starter_v0/runs/v3_B_base_openrouter_20260915T185411871703.json"
    };
    this.autoplayScenarios = [
      "basic-device",
      "basic-vpn",
      "basic-kb",
      "multi-missing",
      "multi-correction",
      "confirmation-ticket",
      "safety-credentials",
      "error-notfound"
    ];

    this.initElements();
    this.bindEvents();
    this.initTheme();
    this.renderScenariosList();
    this.renderVersionCard(this.currentVersion);
    this.renderEvaluationCard();
    this.loadScenario(this.currentScenarioId);
    this.loadRuntimeEvidence();
  }

  async loadRuntimeEvidence() {
    const entries = Object.entries(this.runtimeRunPaths);
    const loaded = await Promise.all(entries.map(async ([version, path]) => {
      try {
        const response = await fetch(path, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return [version, await response.json()];
      } catch (error) {
        console.warn(`Không tải được run ${version}:`, error);
        return [version, null];
      }
    }));

    loaded.forEach(([version, run]) => {
      if (run) this.runtimeRuns[version] = run;
    });
    this.runtimeDataReady = Object.keys(this.runtimeRuns).length > 0;
    this.renderVersionCard(this.currentVersion);
    this.renderEvaluationCard();
    this.updateRuntimeStatus();
  }

  getRuntimeRun(version = this.currentVersion) {
    return this.runtimeRuns[version] || null;
  }

  updateRuntimeStatus() {
    if (!this.metaStatusVal) return;
    this.metaStatusVal.textContent = this.runtimeDataReady ? "Live evidence loaded" : "Demo evidence";
    this.metaStatusVal.style.color = this.runtimeDataReady ? "var(--success-text)" : "var(--warning-text)";
  }

  initElements() {
    // Containers
    this.scenariosContainer = document.getElementById("scenariosList");
    this.chatStream = document.getElementById("chatStream");
    this.traceTimeline = document.getElementById("traceTimeline");
    this.activeScenarioLabel = document.getElementById("activeScenarioLabel");
    this.activeVersionBadge = document.getElementById("activeVersionBadge");
    this.metaVersionVal = document.getElementById("metaVersionVal");
    this.metaStatusVal = document.getElementById("metaStatusVal");
    this.versionComparisonBox = document.getElementById("versionComparisonBox");
    this.evalSummaryBox = document.getElementById("evalSummaryBox");
    this.autoplayBanner = document.getElementById("autoplayBanner");
    this.autoplayStatus = document.getElementById("autoplayStatus");

    // Inputs & Buttons
    this.chatInput = document.getElementById("chatInput");
    this.sendBtn = document.getElementById("sendBtn");
    this.themeToggleBtn = document.getElementById("themeToggleBtn");
    this.runDemoBtn = document.getElementById("runDemoBtn");
    this.stopDemoBtn = document.getElementById("stopDemoBtn");
    this.viewTranscriptBtn = document.getElementById("viewTranscriptBtn");
    this.resetChatBtn = document.getElementById("resetChatBtn");
    this.transcriptModal = document.getElementById("transcriptModal");
    this.closeModalBtn = document.getElementById("closeModalBtn");
    this.copyTranscriptBtn = document.getElementById("copyTranscriptBtn");
    this.transcriptContent = document.getElementById("transcriptContent");
    this.toast = document.getElementById("toast");
    this.quickChips = document.querySelectorAll(".quick-chip");

    // Version switcher buttons
    this.versionBtns = document.querySelectorAll(".version-btn");
  }

  bindEvents() {
    // Send message
    this.sendBtn.addEventListener("click", () => this.handleCustomMessage());
    this.chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.handleCustomMessage();
    });

    // Quick prompt chips
    this.quickChips.forEach(chip => {
      chip.addEventListener("click", () => {
        const query = chip.getAttribute("data-query");
        this.chatInput.value = query;
        this.handleCustomMessage();
      });
    });

    // Theme Toggle
    this.themeToggleBtn.addEventListener("click", () => this.toggleTheme());

    // Run Demo (Autoplay)
    this.runDemoBtn.addEventListener("click", () => this.startAutoplay());
    this.stopDemoBtn.addEventListener("click", () => this.stopAutoplay());

    // Transcript Modal
    this.viewTranscriptBtn.addEventListener("click", () => this.openTranscriptModal());
    this.closeModalBtn.addEventListener("click", () => this.closeTranscriptModal());
    this.transcriptModal.addEventListener("click", (e) => {
      if (e.target === this.transcriptModal) this.closeTranscriptModal();
    });
    this.copyTranscriptBtn.addEventListener("click", () => this.copyTranscript());

    // Reset Chat
    this.resetChatBtn.addEventListener("click", () => {
      this.loadScenario(this.currentScenarioId);
      this.showToast("Đã làm mới hội thoại.");
    });

    // Version buttons
    this.versionBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const ver = btn.getAttribute("data-ver");
        this.setVersion(ver);
      });
    });
  }

  // Theme Management
  initTheme() {
    const savedTheme = localStorage.getItem("k4_agent_theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    this.updateThemeIcon(savedTheme);
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("k4_agent_theme", next);
    this.updateThemeIcon(next);
    this.showToast(`Đã chuyển sang giao diện ${next === "dark" ? "Dark Mode" : "Light Mode"}`);
  }

  updateThemeIcon(theme) {
    if (!this.themeToggleBtn) return;
    this.themeToggleBtn.innerHTML = theme === "dark" 
      ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
      : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }

  // Render Left Scenarios List
  renderScenariosList() {
    if (!this.scenariosContainer) return;

    // Group by category
    const categories = {};
    DEMO_DATA.scenarios.forEach(sc => {
      if (!categories[sc.category]) categories[sc.category] = [];
      categories[sc.category].push(sc);
    });

    let html = "";
    for (const [category, items] of Object.entries(categories)) {
      html += `
        <div class="scenario-category-group">
          <div class="category-label">${category}</div>
          ${items.map(item => `
            <div class="scenario-card ${item.id === this.currentScenarioId ? 'active' : ''}" data-id="${item.id}">
              <div class="scenario-card-header">
                <div class="scenario-icon">
                  ${this.getIconSvg(item.icon)}
                </div>
                <div class="scenario-name">${item.title}</div>
              </div>
              <div class="scenario-desc">${item.subtitle}</div>
              <div class="scenario-meta">
                <span class="scenario-tag">${item.difficulty}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    this.scenariosContainer.innerHTML = html;

    // Add click listeners to cards
    this.scenariosContainer.querySelectorAll(".scenario-card").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-id");
        this.stopAutoplay();
        this.loadScenario(id);
      });
    });
  }

  // Set Version
  setVersion(verKey) {
    this.currentVersion = verKey;
    this.versionBtns.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-ver") === verKey);
    });
    this.activeVersionBadge.textContent = verKey;
    this.metaVersionVal.textContent = verKey;
    this.renderVersionCard(verKey);
    this.renderEvaluationCard();
    this.showToast(`Đã chọn Artifact Version: ${verKey}`);
  }

  renderVersionCard(verKey) {
    const v = DEMO_DATA.versions[verKey];
    if (!v || !this.versionComparisonBox) return;
    const run = this.getRuntimeRun(verKey);
    const metrics = run ? run.summary : v.metrics;
    const passed = metrics.passed_cases ?? metrics.passed;
    const total = metrics.total_cases ?? metrics.totalCases;
    const measured = metrics.measured_cases ?? metrics.measured;
    const providerErrors = metrics.provider_error_cases ?? metrics.providerErrors;
    const passRate = total ? `${Math.round((passed / total) * 1000) / 10}%` : v.metrics.passRate;
    const evidenceLabel = run ? `Run thật · ${run.run_id}` : "Mock fallback";

    this.versionComparisonBox.innerHTML = `
      <div class="meta-header-row" style="margin-bottom: 6px;">
        <span class="meta-title">${v.label}</span>
        <span class="scenario-tag" style="background: var(--primary-50); color: var(--primary-600); font-weight: bold;">${v.badge}</span>
      </div>
      <div style="font-size: 10px; color: var(--success-text); margin-bottom: 6px; font-family: var(--font-mono);">${evidenceLabel}</div>
      <div style="font-size: 11.5px; color: var(--text-secondary); margin-bottom: 6px; line-height: 1.4;">
        <strong style="color: var(--text-primary);">Giả thuyết:</strong> ${v.hypothesis}
      </div>
      <div style="font-size: 11.5px; color: var(--text-secondary); margin-bottom: 8px; line-height: 1.4;">
        <strong style="color: var(--text-primary);">Thay đổi:</strong> ${v.changes}
      </div>
      <div style="padding: 8px; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span>Tỉ lệ đỗ Core:</span>
          <strong style="font-family: var(--font-mono); color: var(--primary-600);">${passRate} (${passed}/${total})</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span>Run health:</span>
          <span style="font-weight: 600; color: ${providerErrors === 0 && measured === total ? 'var(--success-text)' : 'var(--error-text)'};">${providerErrors === 0 && measured === total ? 'VALID' : 'CHECK RUN'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span>Provider errors:</span>
          <strong style="font-family: var(--font-mono);">${providerErrors}</strong>
        </div>
      </div>
    `;
  }

  renderEvaluationCard() {
    if (!this.evalSummaryBox) return;
    const run = this.getRuntimeRun(this.currentVersion);
    const summary = run ? run.summary : null;
    const total = summary?.total_cases ?? 0;
    const passed = summary?.passed_cases ?? 0;
    const measured = summary?.measured_cases ?? 0;
    const providerErrors = summary?.provider_error_cases ?? 0;
    const rate = total ? `${Math.round((passed / total) * 1000) / 10}%` : "--";

    this.evalSummaryBox.innerHTML = `
      <div class="meta-header-row" style="margin-bottom: 4px;">
        <span class="meta-title">Kết quả Đánh giá Benchmark</span>
        <span class="eval-badge">${run && providerErrors === 0 && measured === total ? '✓ Valid Run' : 'Demo Run'}</span>
      </div>
      <div class="eval-metric-row">
        <span>${run ? `${run.suite} suite · ${run.version}` : 'Current version'}</span>
        <strong style="font-family: var(--font-mono); color: var(--success-text);">${passed} / ${total} (${rate})</strong>
      </div>
      <div class="eval-metric-row">
        <span>Tool routing accuracy</span>
        <strong style="font-family: var(--font-mono);">${summary ? `${Math.round(summary.tool_routing_accuracy * 1000) / 10}%` : '--'}</strong>
      </div>
      <div class="eval-metric-row">
        <span>Argument accuracy</span>
        <strong style="font-family: var(--font-mono);">${summary ? `${Math.round(summary.argument_accuracy * 1000) / 10}%` : '--'}</strong>
      </div>
      <div class="eval-metric-row">
        <span>Lỗi kết nối Provider</span>
        <strong style="font-family: var(--font-mono); color: ${providerErrors ? 'var(--error-text)' : 'var(--success-text)'};">${providerErrors} lỗi</strong>
      </div>
      <div style="margin-top: 6px; font-size: 10px; color: var(--text-muted); text-align: right;">
        ${run ? `Measured ${measured}/${total} · ${run.generated_at}` : 'Đang chờ run JSON'}
      </div>
    `;
  }

  // Load and Render Scenario
  loadScenario(scenarioId) {
    this.currentScenarioId = scenarioId;
    const scenario = DEMO_DATA.scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    // Update left sidebar active status
    if (this.scenariosContainer) {
      this.scenariosContainer.querySelectorAll(".scenario-card").forEach(card => {
        card.classList.toggle("active", card.getAttribute("data-id") === scenarioId);
      });
    }

    // Update Header Pill
    if (this.activeScenarioLabel) {
      this.activeScenarioLabel.innerHTML = `
        ${this.getIconSvg(scenario.icon, 14)}
        <span>${scenario.title}</span>
      `;
    }

    // Clear and render conversation
    this.renderConversation(scenario.conversation, scenario.expected);

    // Update trace
    const lastMsgWithTrace = [...scenario.conversation].reverse().find(m => m.trace);
    if (lastMsgWithTrace && lastMsgWithTrace.trace) {
      this.renderTrace(lastMsgWithTrace.trace);
    } else {
      this.renderTrace([
        { step: "User Request", detail: "Conversation initialized", status: "done" },
        { step: "Agent Ready", detail: "Standing by for user query", status: "done" }
      ]);
    }
  }

  renderConversation(messages, expectedText = "") {
    if (!this.chatStream) return;

    let html = "";

    // Expected behavior callout
    if (expectedText) {
      html += `
        <div style="background: var(--bg-surface); border: 1px dashed var(--primary-500); border-radius: var(--radius-md); padding: 10px 14px; margin-bottom: 12px; font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 8px;">
          <div style="color: var(--primary-600); flex-shrink: 0;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </div>
          <div><strong style="color: var(--primary-600);">Kỳ vọng đánh giá:</strong> ${expectedText}</div>
        </div>
      `;
    }

    messages.forEach((msg, idx) => {
      if (msg.role === "user") {
        html += `
          <div class="chat-row user-row">
            <div class="bubble-container">
              ${msg.badge ? `<div class="badge-context-update">${this.getIconSvg('refresh-cw', 10)} ${msg.badge}</div>` : ''}
              <div class="user-bubble">${this.formatMarkdown(msg.content)}</div>
              <div class="message-meta">
                <span>Bạn</span>
                <span>•</span>
                <span>${msg.timestamp}</span>
              </div>
            </div>
            <div class="avatar avatar-user">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
        `;
      } else if (msg.role === "agent") {
        html += `
          <div class="chat-row agent-row">
            <div class="avatar avatar-agent">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
            </div>
            <div class="bubble-container" style="width: 100%;">
              ${msg.safetyBadge ? `
                <div class="badge-safety-boundary">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  ${msg.safetyBadge.type} — ${msg.safetyBadge.rule}
                </div>
              ` : ''}

              <!-- Preliminary thinking / acknowledgement -->
              ${msg.content ? `
                <div class="agent-bubble" style="background: var(--bg-surface-elevated); font-style: italic; color: var(--text-secondary); border-left: 3px solid var(--primary-500); padding: 8px 12px;">
                  ${this.formatMarkdown(msg.content)}
                </div>
              ` : ''}

              <!-- Expandable Tool Call Card -->
              ${msg.toolCall ? this.renderToolCallCard(msg.toolCall) : ''}

              <!-- Dedicated Confirmation Card if present -->
              ${msg.confirmationCard ? this.renderConfirmationCard(msg.confirmationCard) : ''}

              <!-- Final Agent Response Bubble -->
              ${msg.reply ? `
                <div class="agent-bubble">
                  ${this.formatMarkdown(msg.reply)}
                </div>
              ` : ''}

              <div class="message-meta">
                <span>Northstar IT Desk Assistant</span>
                <span>•</span>
                <span>Artifact: ${this.currentVersion}</span>
                <span>•</span>
                <span>${msg.timestamp}</span>
              </div>
            </div>
          </div>
        `;
      }
    });

    this.chatStream.innerHTML = html;
    this.chatStream.scrollTop = this.chatStream.scrollHeight;

    // Attach collapsible card handlers
    this.attachCardInteractions();
  }

  renderToolCallCard(tool) {
    const isError = tool.status === "error";
    const isWarning = tool.status === "warning";
    const statusClass = isError ? "error" : isWarning ? "warning" : "success";
    const statusIcon = isError ? "✕ Failed" : isWarning ? "⚠ Degraded" : "✓ Success";

    const argsJson = JSON.stringify(tool.arguments, null, 2);
    const resultJson = JSON.stringify(tool.result, null, 2);

    return `
      <div class="flow-step-wrapper">
        <!-- TOOL CALL CARD -->
        <div class="tool-call-card" id="tool-card-${tool.id}">
          <div class="tool-call-header" onclick="window.dashboardApp.toggleToolAccordion('${tool.id}')">
            <div class="tool-badge-wrap">
              <span class="tool-icon-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                TOOL CALL
              </span>
              <span class="tool-name-code">${tool.toolName}</span>
              <span class="tool-latency">(${tool.latency})</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="tool-status-tag ${statusClass}">${statusIcon}</span>
              <svg width="14" height="14" class="accordion-chevron" id="chevron-${tool.id}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>

          <div class="tool-call-body" id="body-${tool.id}" style="display: none;">
            <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">INPUT ARGUMENTS</div>
            <div class="tool-args-summary">
              ${Object.entries(tool.arguments).map(([k, v]) => `
                <div class="arg-key">${k}</div>
                <div class="arg-val">${typeof v === 'object' ? JSON.stringify(v) : v}</div>
              `).join('')}
            </div>

            <div class="tool-actions-bar">
              <span style="font-size: 11px; color: var(--text-muted);">Raw Execution Payload</span>
              <button class="btn" style="padding: 3px 8px; font-size: 11px;" onclick="window.dashboardApp.copyJson('${tool.id}', 'args')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy JSON
              </button>
            </div>
            <pre class="tool-json-drawer" id="json-args-${tool.id}">${argsJson}</pre>
          </div>
        </div>

        <!-- TOOL RESULT CARD -->
        <div class="tool-result-card ${isError ? 'error' : ''}">
          <div class="tool-result-header">
            <div style="display: flex; align-items: center; gap: 6px;">
              ${isError 
                ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
                : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`
              }
              <span>${isError ? 'TOOL ERROR' : 'TOOL RESULT'}: ${tool.toolName}</span>
            </div>
            <span style="font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);">${tool.latency}</span>
          </div>
          <div class="tool-result-content">
            ${this.formatResultSnippet(tool.result)}
          </div>
        </div>
      </div>
    `;
  }

  renderConfirmationCard(card) {
    if (card.status === "confirmed") {
      return `
        <div class="confirmation-card" style="border-color: var(--success-500); background-color: var(--success-50);">
          <div class="confirmation-header" style="color: var(--success-text);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>TICKET ĐÃ ĐƯỢC PHÊ DUYỆT (CONFIRMED)</span>
          </div>
          <div style="font-size: 12px; color: var(--text-primary);">
            Yêu cầu tạo ticket đã được người dùng phê duyệt và hệ thống đã ghi nhận thành công.
          </div>
        </div>
      `;
    }

    if (card.status === "cancelled") {
      return `
        <div class="confirmation-card" style="border-color: var(--error-500); background-color: var(--error-50);">
          <div class="confirmation-header" style="color: var(--error-text);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <span>THAO TÁC ĐÃ BỊ HỦY (CANCELLED)</span>
          </div>
          <div style="font-size: 12px; color: var(--text-primary);">
            Người dùng đã hủy hành động ghi. Không có ticket nào được tạo.
          </div>
        </div>
      `;
    }

    return `
      <div class="confirmation-card" id="confirmationActionCard">
        <div class="confirmation-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span>⚠ ${card.title}</span>
        </div>
        <div style="font-size: 12.5px; color: var(--text-primary);">
          ${card.description}
        </div>
        <div class="confirmation-payload-box">
          <div class="payload-row">
            <span class="payload-label">Hành động:</span>
            <span class="payload-value" style="color: var(--warning-text);">${card.action}</span>
          </div>
          <div class="payload-row">
            <span class="payload-label">Sự cố:</span>
            <span class="payload-value">${card.payload.summary}</span>
          </div>
          <div class="payload-row">
            <span class="payload-label">Mức ưu tiên:</span>
            <span class="payload-value" style="color: var(--error-text); text-transform: uppercase;">${card.payload.priority}</span>
          </div>
          <div class="payload-row">
            <span class="payload-label">Mã thiết bị:</span>
            <span class="payload-value">${card.payload.asset_id}</span>
          </div>
        </div>
        <div class="confirmation-btn-group">
          <button class="btn btn-confirm" onclick="window.dashboardApp.handleConfirmation(true)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Xác nhận tạo ticket
          </button>
          <button class="btn btn-cancel" onclick="window.dashboardApp.handleConfirmation(false)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Hủy bỏ
          </button>
        </div>
      </div>
    `;
  }

  formatResultSnippet(result) {
    if (result.error || result.message) {
      return `
        <div style="color: var(--error-text); font-weight: bold;">Status: Failed</div>
        <div>Error: ${result.error || result.message}</div>
        ${result.recovery_hint ? `<div style="margin-top: 4px; color: var(--text-secondary);">Gợi ý khắc phục: ${result.recovery_hint}</div>` : ''}
      `;
    }

    if (result.asset_id) {
      return `
        <div>Status: Success</div>
        <div>Device: ${result.asset_id} ${result.model ? `(${result.model})` : ''}</div>
        ${result.diagnostics ? `
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--border-subtle);">
            ${Object.entries(result.diagnostics).map(([k, v]) => `<div><strong>${k}:</strong> ${v}</div>`).join('')}
          </div>
        ` : ''}
      `;
    }

    if (result.service) {
      return `
        <div>Dịch vụ: <strong>${result.service.toUpperCase()}</strong> (${result.environment})</div>
        <div>Tình trạng: <span style="color: ${result.status === 'operational' ? 'var(--success-text)' : 'var(--warning-text)'}; font-weight: bold;">${result.status.toUpperCase()}</span></div>
        ${result.incident ? `<div>Sự cố: ${result.incident} (Mã #${result.incident_id})</div>` : ''}
        ${result.workaround ? `<div style="margin-top: 4px; color: var(--primary-600);">Giải pháp: ${result.workaround}</div>` : ''}
      `;
    }

    return `<pre style="margin: 0; white-space: pre-wrap;">${JSON.stringify(result, null, 2)}</pre>`;
  }

  // Interactive Confirmation Handler
  handleConfirmation(isConfirmed) {
    const scenario = DEMO_DATA.scenarios.find(s => s.id === "confirmation-ticket");
    if (!scenario) return;

    const confMsg = scenario.conversation.find(m => m.confirmationCard);
    if (!confMsg) return;

    if (isConfirmed) {
      confMsg.confirmationCard.status = "confirmed";
      this.renderConversation(scenario.conversation);

      // Append real tool execution of create_ticket
      setTimeout(() => {
        const extraMsg = {
          id: "msg-conf-exec",
          role: "agent",
          content: "Người dùng đã xác nhận. Đang thực thi lệnh tạo ticket trên hệ thống...",
          timestamp: "10:40:15",
          toolCall: {
            id: "call-ticket-exec",
            toolName: "create_ticket",
            category: "Write Action",
            latency: "180 ms",
            status: "success",
            arguments: {
              summary: "Sự cố kết nối VPN không thành công trên laptop",
              priority: "high",
              asset_id: "LT-204",
              confirmed: true
            },
            result: {
              status: "ticket_created",
              ticket_id: "TICKET-1042",
              created_at: "2026-09-14T10:40:15+07:00",
              assigned_team: "IT Operations & Network L2",
              estimated_response: "Trong vòng 30 phút"
            }
          },
          reply: "✅ **Ticket hỗ trợ đã được tạo thành công!**\n\n- **Mã Ticket:** `#TICKET-1042`\n- **Mức độ:** Cao (High Priority)\n- **Thiết bị:** `LT-204`\n- **Bộ phận phụ trách:** IT Operations & Network L2 sẽ liên hệ hỗ trợ bạn trong vòng 30 phút.",
          trace: [
            { step: "User Confirmed", detail: "Explicit consent verified (confirmed=true)", status: "done" },
            { step: "Write Tool Executed", detail: "create_ticket executed successfully", status: "done" },
            { step: "Ticket ID Created", detail: "Generated #TICKET-1042", status: "done" },
            { step: "Notification Sent", detail: "Confirmation receipt delivered to user", status: "done" }
          ]
        };

        scenario.conversation.push(extraMsg);
        this.renderConversation(scenario.conversation);
        this.renderTrace(extraMsg.trace);
        this.showToast("Đã duyệt tạo ticket #TICKET-1042 thành công!");
      }, 300);
    } else {
      confMsg.confirmationCard.status = "cancelled";
      this.renderConversation(scenario.conversation);

      setTimeout(() => {
        const cancelMsg = {
          id: "msg-conf-cancel",
          role: "agent",
          timestamp: "10:40:12",
          reply: "Đã hủy bỏ thao tác. Yêu cầu tạo ticket của bạn đã được đóng và không có dữ liệu nào bị ghi lên hệ thống.",
          trace: [
            { step: "User Cancelled", detail: "User chose to cancel write action", status: "done" },
            { step: "Action Dropped", detail: "create_ticket call discarded safely", status: "done" },
            { step: "Zero Side Effects", detail: "Database integrity preserved", status: "done" }
          ]
        };
        scenario.conversation.push(cancelMsg);
        this.renderConversation(scenario.conversation);
        this.renderTrace(cancelMsg.trace);
        this.showToast("Đã hủy thao tác tạo ticket.");
      }, 200);
    }
  }

  // Render Vertical Trace Timeline
  renderTrace(steps) {
    if (!this.traceTimeline) return;

    let html = "";
    steps.forEach((st, idx) => {
      const isLast = idx === steps.length - 1;
      const statusClass = st.status || "done";

      html += `
        <div class="timeline-step ${statusClass}">
          <div class="step-bullet">
            ${statusClass === 'done' ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>` :
              statusClass === 'error' ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>` :
              `<div style="width: 4px; height: 4px; border-radius: 50%; background: currentColor;"></div>`}
          </div>
          <div class="step-header">${st.step}</div>
          <div class="step-detail">${st.detail}</div>
        </div>
      `;
    });

    this.traceTimeline.innerHTML = html;
  }

  // User Interactive Message Handling
  handleCustomMessage() {
    const text = this.chatInput.value.trim();
    if (!text) return;

    this.chatInput.value = "";

    // Append User Message
    const userMsg = {
      id: "msg-custom-" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    const currentScenario = DEMO_DATA.scenarios.find(s => s.id === this.currentScenarioId);
    if (currentScenario) {
      currentScenario.conversation.push(userMsg);
      this.renderConversation(currentScenario.conversation);
    }

    // Smart Matcher for Mock Response
    const lower = text.toLowerCase();
    setTimeout(() => {
      let matchedScenarioId = "basic-device";

      if (lower.includes("vpn")) {
        matchedScenarioId = "basic-vpn";
      } else if (lower.includes("outlook") || lower.includes("hướng dẫn") || lower.includes("guide")) {
        matchedScenarioId = "basic-kb";
      } else if (lower.includes("pass") || lower.includes("mật khẩu") || lower.includes("admin") || lower.includes("credential")) {
        matchedScenarioId = "safety-credentials";
      } else if (lower.includes("phở") || lower.includes("nấu") || lower.includes("công thức") || lower.includes("bò")) {
        matchedScenarioId = "safety-outofscope";
      } else if (lower.includes("ticket") || lower.includes("hỗ trợ")) {
        matchedScenarioId = "confirmation-ticket";
      } else if (lower.includes("lt-999") || lower.includes("999")) {
        matchedScenarioId = "error-notfound";
      } else if (lower.includes("wi-fi") || lower.includes("wifi") || lower.includes("laptop của mình")) {
        matchedScenarioId = "multi-missing";
      }

      this.loadScenario(matchedScenarioId);
      this.showToast(`Đã tự động định tuyến tới kịch bản: ${matchedScenarioId}`);
    }, 450);
  }

  // Accordion Toggle for Tool Card
  toggleToolAccordion(toolId) {
    const body = document.getElementById(`body-${toolId}`);
    const chevron = document.getElementById(`chevron-${toolId}`);
    if (!body) return;

    if (body.style.display === "none") {
      body.style.display = "flex";
      if (chevron) chevron.style.transform = "rotate(180deg)";
    } else {
      body.style.display = "none";
      if (chevron) chevron.style.transform = "rotate(0deg)";
    }
  }

  copyJson(toolId, type) {
    const el = document.getElementById(`json-${type}-${toolId}`);
    if (!el) return;
    navigator.clipboard.writeText(el.textContent).then(() => {
      this.showToast("Đã copy JSON arguments vào clipboard!");
    });
  }

  attachCardInteractions() {
    // Expose toggle globally
    window.dashboardApp = this;
  }

  // Team Demo Mode (Autoplay)
  startAutoplay() {
    this.isAutoplayRunning = true;
    this.autoplayBanner.classList.add("active");
    this.autoplayIndex = 0;
    this.showToast("▶ Bắt đầu Team Demo Mode (Tự động duyệt kịch bản)");
    this.runNextAutoplayStep();
  }

  runNextAutoplayStep() {
    if (!this.isAutoplayRunning) return;

    if (this.autoplayIndex >= this.autoplayScenarios.length) {
      this.autoplayIndex = 0; // Loop or stop
    }

    const scId = this.autoplayScenarios[this.autoplayIndex];
    this.loadScenario(scId);

    const sc = DEMO_DATA.scenarios.find(s => s.id === scId);
    if (this.autoplayStatus && sc) {
      this.autoplayStatus.textContent = `Đang trình chiếu (${this.autoplayIndex + 1}/${this.autoplayScenarios.length}): ${sc.title}`;
    }

    this.autoplayIndex++;

    this.autoplayTimer = setTimeout(() => {
      this.runNextAutoplayStep();
    }, 4500);
  }

  stopAutoplay() {
    if (!this.isAutoplayRunning) return;
    this.isAutoplayRunning = false;
    clearTimeout(this.autoplayTimer);
    this.autoplayBanner.classList.remove("active");
    this.showToast("Đã tạm dừng Team Demo Mode.");
  }

  // Transcript Modal
  openTranscriptModal() {
    const sc = DEMO_DATA.scenarios.find(s => s.id === this.currentScenarioId);
    if (!sc) return;
    const run = this.getRuntimeRun(this.currentVersion);
    const matchedResult = run?.results?.find(result =>
      result.input === sc.conversation.find(message => message.role === "user")?.content
    );

    const transcriptData = {
      conversation_id: "conv-" + this.currentScenarioId + "-trace-8429",
      scenario: sc.title,
      category: sc.category,
      artifact_version: this.currentVersion,
      evidence: run ? {
        run_id: run.run_id,
        suite: run.suite,
        provider: run.provider,
        model: run.model,
        generated_at: run.generated_at,
        summary: run.summary,
        matched_case: matchedResult || null
      } : { source: "demo mock data" },
      generated_at: new Date().toISOString(),
      turns: sc.conversation.map(m => ({
        role: m.role,
        content: m.content || m.reply,
        timestamp: m.timestamp,
        tool_call: m.toolCall ? {
          name: m.toolCall.toolName,
          args: m.toolCall.arguments,
          latency: m.toolCall.latency,
          status: m.toolCall.status
        } : null,
        tool_result: m.toolCall ? m.toolCall.result : null,
        confirmation_action: m.confirmationCard ? m.confirmationCard.status : null
      }))
    };

    this.transcriptContent.textContent = JSON.stringify(transcriptData, null, 2);
    this.transcriptModal.classList.add("open");
  }

  closeTranscriptModal() {
    this.transcriptModal.classList.remove("open");
  }

  copyTranscript() {
    const text = this.transcriptContent.textContent;
    navigator.clipboard.writeText(text).then(() => {
      this.showToast("✓ Đã sao chép toàn bộ Transcript vào Clipboard!");
    });
  }

  // Toast Notification
  showToast(message) {
    if (!this.toast) return;
    this.toast.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
      <span>${message}</span>
    `;
    this.toast.classList.add("show");
    setTimeout(() => {
      this.toast.classList.remove("show");
    }, 2800);
  }

  // Helpers
  formatMarkdown(text) {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background: var(--bg-hover); padding: 1px 5px; border-radius: 3px; font-family: var(--font-mono); font-size: 11.5px;">$1</code>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n- /g, '<br>• ')
      .replace(/\n1\. /g, '<br>1. ')
      .replace(/\n2\. /g, '<br>2. ')
      .replace(/\n3\. /g, '<br>3. ')
      .replace(/\n4\. /g, '<br>4. ');
  }

  getIconSvg(name, size = 16) {
    const icons = {
      'laptop': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
      'shield-alert': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
      'book-open': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
      'help-circle': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      'refresh-cw': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
      'alert-triangle': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      'x-circle': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      'slash': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
      'alert-octagon': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
    };
    return icons[name] || `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;
  }
}

// Instantiate on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.dashboardApp = new AgentDashboardApp();
});
