#!/usr/bin/env python3
"""
Reconstruct index.html from transcript — version 3.
Handles extra blank lines from transcript format artifacts.
"""
import re

TRANSCRIPT = "/Users/yanivo/.cursor/projects/Users-yanivo-Documents-Manifest-analyze/agent-transcripts/5a494c8a-148f-44f8-bcfe-5e4b8cdfee3e.txt"
OUTPUT = "/Users/yanivo/Documents/Manifest analyze/index.html"
TARGET_FILE = "index.html"

WRITE_START_LINE = 27886
REDESIGN_FIRST_LINE = 34654


def main():
    with open(TRANSCRIPT, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    print(f"Transcript: {len(lines)} lines")
    
    # ── Step 1: Extract base file from Write ──
    base_content = extract_write(lines, WRITE_START_LINE - 1)
    print(f"Base file: {len(base_content)} chars, {base_content.count(chr(10))} newlines")
    
    # ── Step 2: Extract all StrReplace ops ──
    ops = []
    i = 0
    while i < len(lines):
        line_num = i + 1
        if line_num <= 28668 or line_num >= REDESIGN_FIRST_LINE:
            i += 1
            continue
        
        if lines[i].strip() == '[Tool call] StrReplace':
            op = parse_strreplace(lines, i)
            if op and TARGET_FILE in op['path']:
                ops.append(op)
                i = op['end_idx']
                continue
        i += 1
    
    print(f"Found {len(ops)} StrReplace operations")
    
    # ── Step 3: Apply operations with fuzzy blank-line handling ──
    content = base_content
    applied = 0
    skipped = 0
    
    for idx, op in enumerate(ops):
        old = op['old']
        new = op['new']
        replace_all = op.get('replace_all', False)
        
        success = False
        
        # Try exact match first
        if old in content:
            content = content.replace(old, new, 1) if not replace_all else content.replace(old, new)
            success = True
        
        # Try with normalized blank lines (collapse consecutive \n\n → \n)
        if not success:
            # Build a regex that allows optional extra blank lines between each line
            old_lines = old.split('\n')
            # Build pattern: each line literal, joined by \n with optional extra \n
            pattern_parts = [re.escape(line) for line in old_lines]
            pattern = r'\n\n?'.join(pattern_parts)
            
            m = re.search(pattern, content)
            if m:
                content = content[:m.start()] + new + content[m.end():]
                success = True
        
        # Try even more aggressively: allow 1-3 blank lines between any two lines
        if not success:
            old_lines = old.split('\n')
            pattern_parts = [re.escape(line) for line in old_lines]
            pattern = r'\n(?:\n{0,2})'.join(pattern_parts)
            
            m = re.search(pattern, content)
            if m:
                content = content[:m.start()] + new + content[m.end():]
                success = True
        
        if success:
            applied += 1
        else:
            skipped += 1
            first_line = old.split('\n')[0]
            if first_line.strip():
                idx_in_content = content.find(first_line)
                if idx_in_content >= 0:
                    around = content[max(0, idx_in_content-30):idx_in_content+len(first_line)+100]
                    print(f"  SKIP [{idx+1}] line {op['line']}: first line found but multi-line mismatch")
                    print(f"    old starts: {repr(old[:100])}")
                    # Show what's actually in content after the first line
                    after_first = content[idx_in_content:idx_in_content+200]
                    print(f"    content has: {repr(after_first[:150])}")
                else:
                    print(f"  SKIP [{idx+1}] line {op['line']}: first line NOT in content")
                    print(f"    looking for: {repr(first_line[:100])}")
    
    print(f"\nApplied: {applied}, Skipped: {skipped}")
    print(f"Result: {len(content)} chars, {content.count(chr(10))} newlines")
    
    with open(OUTPUT, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Written to {OUTPUT}")


def extract_write(lines, start_idx):
    """Extract Write content."""
    i = start_idx + 1
    while i < len(lines) and not lines[i].strip().startswith('contents:'):
        i += 1
    
    first = lines[i]
    if '  contents: ' in first:
        content_start = first.index('  contents: ') + len('  contents: ')
        result = [first[content_start:]]
    else:
        result = [first.lstrip()]
    i += 1
    
    while i < len(lines):
        if lines[i].strip() == '[Tool result] Write':
            break
        result.append(lines[i])
        i += 1
    
    text = ''.join(result)
    while text.endswith('\n\n'):
        text = text[:-1]
    return text


def parse_strreplace(lines, start_idx):
    """Parse a StrReplace tool call."""
    total = len(lines)
    line_num = start_idx + 1
    
    i = start_idx + 1
    path = None
    old_string = None
    new_string = None
    replace_all = False
    
    state = 'params'
    current_lines = []
    
    while i < total:
        line = lines[i]
        stripped = line.rstrip('\n')
        
        if stripped.strip().startswith('[Tool result]') or stripped.strip().startswith('[Tool call]'):
            if state == 'old':
                old_string = finalize_param(current_lines)
            elif state == 'new':
                new_string = finalize_param(current_lines)
            break
        
        # Check for 2-space indented parameters
        if len(stripped) >= 2 and stripped[:2] == '  ' and stripped[2:3] != ' ':
            param_part = stripped[2:]
            
            if param_part.startswith('path: '):
                if state == 'old': old_string = finalize_param(current_lines)
                elif state == 'new': new_string = finalize_param(current_lines)
                path = param_part[6:].strip()
                state = 'params'
                i += 1
                continue
            
            if param_part.startswith('old_string:'):
                state = 'old'
                current_lines = []
                rest = param_part[11:]
                if rest.startswith(' '): rest = rest[1:]
                current_lines.append(rest + '\n')
                i += 1
                continue
            
            if param_part.startswith('new_string:'):
                if state == 'old': old_string = finalize_param(current_lines)
                state = 'new'
                current_lines = []
                rest = param_part[11:]
                if rest.startswith(' '): rest = rest[1:]
                current_lines.append(rest + '\n')
                i += 1
                continue
            
            if param_part.startswith('replace_all:'):
                if state == 'old':
                    old_string = finalize_param(current_lines)
                    state = 'params'
                elif state == 'new':
                    new_string = finalize_param(current_lines)
                    state = 'params'
                replace_all = 'true' in param_part.lower()
                i += 1
                continue
        
        if state in ('old', 'new'):
            current_lines.append(line)
            i += 1
            continue
        
        i += 1
    
    if path and old_string is not None and new_string is not None:
        return {
            'line': line_num,
            'path': path,
            'old': old_string,
            'new': new_string,
            'replace_all': replace_all,
            'end_idx': i,
        }
    return None


def finalize_param(lines_list):
    if not lines_list:
        return ''
    text = ''.join(lines_list)
    if text.endswith('\n'):
        text = text[:-1]
    return text


if __name__ == '__main__':
    main()
