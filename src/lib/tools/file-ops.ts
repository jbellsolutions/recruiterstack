import fs from "fs";
import path from "path";

export function handleFileOps(
  tool: string,
  input: Record<string, unknown>,
  workspacePath: string
): string {
  // Security: resolve path and ensure it's within workspace
  function safePath(relativePath: string): string {
    const resolved = path.resolve(workspacePath, relativePath);
    if (!resolved.startsWith(workspacePath)) {
      throw new Error(`Path escape attempt blocked: ${relativePath}`);
    }
    return resolved;
  }

  switch (tool) {
    case "read_file": {
      const filePath = safePath(input.path as string);
      if (!fs.existsSync(filePath)) return `Error: File not found: ${input.path}`;
      const content = fs.readFileSync(filePath, "utf-8");
      // Truncate very large files
      if (content.length > 50000) {
        return content.slice(0, 50000) + "\n\n[... truncated, file is " + content.length + " chars]";
      }
      return content;
    }

    case "write_file": {
      const filePath = safePath(input.path as string);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, input.content as string);
      return `Written: ${input.path} (${(input.content as string).length} chars)`;
    }

    case "list_files": {
      const dirPath = safePath(input.path as string);
      if (!fs.existsSync(dirPath)) return `Error: Directory not found: ${input.path}`;

      if (input.recursive) {
        const results: string[] = [];
        function walk(dir: string, prefix: string) {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            if (entry.name === "node_modules" || entry.name === ".git") continue;
            const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
            results.push(rel);
            if (entry.isDirectory()) walk(path.join(dir, entry.name), rel);
          }
        }
        walk(dirPath, "");
        return results.join("\n") || "(empty directory)";
      }

      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      return entries
        .map((e) => (e.isDirectory() ? `${e.name}/` : e.name))
        .join("\n") || "(empty directory)";
    }

    default:
      return `Error: Unknown file tool: ${tool}`;
  }
}
