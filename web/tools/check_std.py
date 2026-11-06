#!/usr/bin/env python3
"""uni-app 页面编码规范自检。

校验项：
    1. 块顺序必须是 style -> template -> script
    2. 不允许出现 HTML / JS / CSS 注释
    3. CSS 每条规则必须写在一行内
    4. 相邻选择器之间不允许空行
    5. 每条规则必须显式声明 position
    6. 样式变量必须以 $ 开头并集中在文件顶部

用法：
    python3 tools/check_std.py src/pages/whmj/index.vue
    python3 tools/check_std.py src/pages/whmj
"""

import os
import re
import sys


def read(path: str) -> str:
    with open(path, encoding="utf-8") as fh:
        return fh.read()


def blocks(text: str) -> dict:
    """按出现顺序返回三个顶层块的起始下标。"""
    pos = {}
    for name in ("style", "template", "script"):
        idx = text.find("<" + name)
        if idx >= 0:
            pos[name] = idx
    return pos


def check(path: str) -> list:
    errs = []
    text = read(path)
    pos = blocks(text)

    for name in ("style", "template", "script"):
        if name not in pos:
            errs.append(f"缺少 <{name}> 块")

    if all(k in pos for k in ("style", "template", "script")):
        order = sorted(pos, key=lambda k: pos[k])
        if order != ["style", "template", "script"]:
            errs.append("块顺序错误，应为 style -> template -> script，实际 " + " -> ".join(order))

    if re.search(r"<!--", text):
        errs.append("模板中存在 HTML 注释")

    if re.search(r"/\*(?!\*)", text):
        errs.append("存在普通块注释，仅允许 JSDoc")

    m = re.search(r"<script[^>]*>(.*?)</script>", text, re.S)
    if m:
        script = re.sub(r"(?m)^\s*//\s*#(?:ifdef|ifndef|endif|else).*$", "", m.group(1))
        if re.search(r'(?m)(?<![:"\'])//\s', script):
            errs.append("脚本中存在行注释")

    ms = re.search(r"<style[^>]*>(.*?)</style>", text, re.S)
    if ms:
        css = ms.group(1)
        lines = [ln.rstrip() for ln in css.split("\n")]
        selector_blank = False
        for i, ln in enumerate(lines):
            s = ln.strip()
            if not s:
                selector_blank = True
                continue
            if selector_blank and s.endswith("{") and not s.startswith("@"):
                errs.append(f"选择器之间存在空行：{s[:48]}")
            selector_blank = False

        for i, ln in enumerate(lines):
            s = ln.strip()
            if not s.endswith("{"):
                continue
            if i + 1 < len(lines):
                body = lines[i + 1].strip()
                if body and not body.startswith("}") and "position" not in body:
                    errs.append(f"规则缺少 position：{s[:48]}")
                if body and not body.startswith("}") and body.endswith("}"):
                    pass
        for i, ln in enumerate(lines):
            s = ln.strip()
            if s.endswith("{") and i + 1 < len(lines):
                body = lines[i + 1].strip()
                if body and not body.startswith("}") and body.count("{") == 0 and not body.endswith("}"):
                    errs.append(f"规则未写成单行：{s[:48]}")

        first_var = None
        for i, ln in enumerate(lines):
            if re.match(r"^\s*\$[\w-]+\s*:", ln):
                if first_var is None:
                    first_var = i
        if first_var is not None:
            head = [ln.strip() for ln in lines[:first_var] if ln.strip()]
            if head:
                errs.append("样式变量未置于文件顶部")

    return errs


def collect(target: str) -> list:
    if os.path.isdir(target):
        out = []
        for root, _dirs, files in os.walk(target):
            for f in files:
                if f.endswith(".vue"):
                    out.append(os.path.join(root, f))
        return sorted(out)
    return [target]


def main() -> int:
    args = sys.argv[1:] or ["src/pages/whmj"]
    failed = 0
    for target in args:
        for path in collect(target):
            errs = check(path)
            if errs:
                failed += 1
                print(f"FAIL {path}")
                for e in errs:
                    print("  - " + e)
            else:
                print(f"OK   {path}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
