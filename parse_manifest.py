#!/usr/bin/env python3
"""Parse Wix component manifest JSON and output a Markdown table."""
import json
import sys
from pathlib import Path

def safe(s, max_len=60):
    if s is None:
        return ""
    s = str(s).replace("|", "\\|").replace("\n", " ")
    return (s[:max_len] + "…") if len(s) > max_len else s

def main():
    manifest_path = Path(__file__).parent / "manifest.json"
    if not manifest_path.exists():
        print("Create manifest.json in this folder with your full manifest JSON.", file=sys.stderr)
        sys.exit(1)

    with open(manifest_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    rows = []
    for comp_id, comp in data.items():
        ext_type = comp.get("extensionType", "")
        manifest = comp.get("manifest") or {}
        editor_el = manifest.get("editorElement") or {}
        display_name = editor_el.get("displayName") or manifest.get("type") or comp_id
        selector = editor_el.get("selector", "")
        description = manifest.get("description") or ""
        archetype = editor_el.get("archetype", "")

        rows.append({
            "Component ID": comp_id,
            "Extension Type": ext_type,
            "Display Name": display_name,
            "Selector": selector,
            "Description": description,
            "Archetype": archetype,
        })

    # Markdown table
    headers = ["Component ID", "Extension Type", "Display Name", "Selector", "Description", "Archetype"]
    col_widths = [50, 25, 25, 35, 45, 20]

    lines = []
    lines.append("| " + " | ".join(h for h in headers) + " |")
    lines.append("| " + " | ".join("---" for _ in headers) + " |")
    for r in rows:
        cells = [safe(r[h], col_widths[i]) for i, h in enumerate(headers)]
        lines.append("| " + " | ".join(cells) + " |")

    out_path = Path(__file__).parent / "manifest-components-table.md"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("# Manifest components overview\n\n")
        f.write("Generated from manifest JSON.\n\n")
        f.write("\n".join(lines))

    print(f"Written {len(rows)} rows to {out_path}")

if __name__ == "__main__":
    main()
