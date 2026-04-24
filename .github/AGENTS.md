---
name: WinGroX AI Project Agents
---

# Custom Agents for WinGroX AI

## Available Agents

### 1. Explore (Built-in)
**Use**: Quick codebase exploration, pattern discovery
**Invocation**: `runSubagent` with agent="Explore"
**Params**: Query + thoroughness (quick/medium/thorough)
**Output**: Read-only findings summarized in one message

**Example**: "Explore what API endpoints already exist - quick search"

---

## Project-Specific Workflow
1. **Start with Explore** (read-only, fast): Gather context
2. **Main agent** (this session): Implement based on findings
3. **Phase completion**: Update memory, mark todos

This approach keeps token usage efficient and context focused.
