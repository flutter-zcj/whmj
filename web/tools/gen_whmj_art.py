"""武汉赖子麻将 H5 美术资源生成器。

按《游戏资源分析》文档的四节规格批量产出位图，全部由代码绘制，
不引用任何第三方版权素材；配色与尺寸集中在 TOKENS / LAYOUT 中，
改一处即可整体换肤。

生成清单：
    hall.jpg       大厅背景（天空 + 远山 + 湖面 + 黄鹤楼 + 樱花 + 草岸）
    table_bg.jpg   牌桌背景（墨绿绒布 + 金线描边 + 水波暗纹）
    logo.png       产品标准字「武汉赖子麻将」
    game_*.png     七个玩法入口卡
    shop_head.png  商城帘头
    tile_z1.png    红中牌面
    coin.png       金币
    gem.png        钻石

用法：
    python3 tools/gen_whmj_art.py [--out src/static/whmj/gen]
"""

from __future__ import annotations

import argparse
import math
import os
from typing import List, Sequence, Tuple

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

Color = Tuple[int, int, int]

FONT_SANS = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"
FONT_SERIF = "/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc"

# 设计令牌：色值与前端 utils/whmj/theme.js 一一对应
TOKENS = {
    "skyTop": (62, 149, 244),
    "skyMid": (129, 197, 246),
    "skyLow": (188, 231, 250),
    "sun": (255, 246, 214),
    "mountainFar": (158, 189, 210),
    "mountainMid": (122, 164, 176),
    "mountainNear": (86, 130, 138),
    "treeDark": (76, 116, 92),
    "lakeFar": (198, 233, 242),
    "lakeMid": (137, 205, 219),
    "lakeNear": (108, 186, 203),
    "grass": (110, 154, 60),
    "grassDark": (74, 112, 40),
    "grassLight": (150, 190, 88),
    "blossom": (247, 179, 205),
    "blossomLight": (253, 226, 236),
    "trunk": (92, 66, 58),
    "pavilion": (58, 86, 92),
    "pavilionLight": (98, 128, 130),
    "gold": (243, 199, 106),
    "goldDeep": (176, 122, 38),
    "goldLight": (255, 235, 176),
    "seal": (198, 52, 42),
    "cream": (246, 239, 218),
    "bannerGreen": (43, 175, 179),
    "bannerGreenDeep": (24, 122, 128),
    "felt": (21, 74, 54),
    "feltLight": (34, 100, 72),
    "mint": (231, 246, 243),
    "ink": (40, 46, 48),
}

DEVICES = [
    # key, 主色, 暗色, 大字, 副标题
    ("game_whmj", (228, 118, 117), (150, 52, 58), "麻", "武汉麻将"),
    ("game_scmj", (233, 176, 74), (156, 104, 30), "川", "四川麻将"),
    ("game_tlj", (86, 150, 205), (36, 86, 136), "拖", "拖拉机"),
    ("game_ddz1", (94, 196, 200), (32, 122, 132), "斗", "斗地主"),
    ("game_kwx", (231, 150, 70), (150, 84, 26), "星", "卡五星"),
    ("game_hh", (152, 122, 206), (86, 58, 142), "晃", "晃晃"),
    ("game_pdk", (110, 176, 92), (52, 108, 44), "跑", "跑得快"),
]


def font(size: int, serif: bool = False) -> ImageFont.FreeTypeFont:
    """加载中文字体，缺失时回退到默认字体。

    :param size: 字号（像素）
    :param serif: 是否使用衬线体
    :return: PIL 字体对象
    """
    path = FONT_SERIF if serif else FONT_SANS
    if os.path.isfile(path):
        return ImageFont.truetype(path, size)

    return ImageFont.load_default()


def vertical_gradient(size: Tuple[int, int], stops: Sequence[Tuple[float, Color]]) -> Image.Image:
    """生成纵向多段渐变图。

    :param size: (宽, 高)
    :param stops: [(位置0~1, 颜色)]，按位置升序
    :return: RGB 图像
    """
    width, height = size
    ys = np.linspace(0.0, 1.0, height)
    pos = np.array([s[0] for s in stops])
    colors = np.array([s[1] for s in stops], dtype=float)

    out = np.zeros((height, 3), dtype=float)
    for channel in range(3):
        out[:, channel] = np.interp(ys, pos, colors[:, channel])

    arr = np.repeat(out[:, None, :], width, axis=1).astype(np.uint8)

    return Image.fromarray(arr, mode="RGB")


def add_glow(img: Image.Image, center: Tuple[int, int], radius: int, color: Color, alpha: int) -> None:
    """在图上叠加一团柔光（就地修改）。

    :param img: 目标图
    :param center: 圆心
    :param radius: 半径
    :param color: 光色
    :param alpha: 最大不透明度
    """
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    steps = 26
    for i in range(steps, 0, -1):
        r = int(radius * i / steps)
        a = int(alpha * (1 - i / steps) ** 1.6)
        draw.ellipse(
            [center[0] - r, center[1] - r, center[0] + r, center[1] + r],
            fill=(color[0], color[1], color[2], a),
        )
    layer = layer.filter(ImageFilter.GaussianBlur(radius // 6))
    img.alpha_composite(layer) if img.mode == "RGBA" else img.paste(
        Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB"), (0, 0)
    )


def overlay(img: Image.Image, draw_fn) -> None:
    """在透明图层上绘制再合成，避免 ImageDraw 直接改写 alpha 通道造成"挖洞"。

    :param img: 目标 RGBA 图
    :param draw_fn: 接收 (图层, ImageDraw) 的绘制回调
    """
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw_fn(layer, ImageDraw.Draw(layer, "RGBA"))
    img.alpha_composite(layer)


def ridge(width: int, base_y: int, amplitude: float, seed: int, roughness: int = 3) -> List[int]:
    """生成一条起伏山脊线的高度序列。

    :param width: 宽度
    :param base_y: 基线 y
    :param amplitude: 起伏幅度
    :param seed: 随机种子
    :param roughness: 叠加高频噪声的次数
    :return: 每个 x 对应的高度列表
    """
    rng = np.random.default_rng(seed)
    xs = np.linspace(0, 1, width)
    wave = np.zeros(width)
    for k in range(1, roughness + 2):
        wave += np.sin(xs * math.pi * (k * 1.7) + rng.uniform(0, 6.28)) * (amplitude / (k ** 1.35))
    wave += rng.normal(0, amplitude * 0.06, width)

    return (base_y - wave).astype(int).tolist()


def draw_hall(path: str, width: int = 1612, height: int = 750) -> None:
    """绘制大厅背景：天空、远山、湖面、黄鹤楼、樱花与草岸。

    :param path: 输出路径
    :param width: 画布宽
    :param height: 画布高
    """
    img = vertical_gradient(
        (width, height),
        [
            (0.00, TOKENS["skyTop"]),
            (0.28, TOKENS["skyMid"]),
            (0.44, TOKENS["skyLow"]),
            (0.55, TOKENS["lakeFar"]),
            (0.72, TOKENS["lakeMid"]),
            (0.86, TOKENS["lakeNear"]),
            (1.00, TOKENS["grassDark"]),
        ],
    ).convert("RGBA")

    add_glow(img, (int(width * 0.72), int(height * 0.12)), 300, TOKENS["sun"], 150)

    draw = ImageDraw.Draw(img, "RGBA")

    # 云带：横向拉长的柔光条
    clouds = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    cd = ImageDraw.Draw(clouds)
    for i, (cx, cy, cw, ch, a) in enumerate(
        [(260, 120, 420, 46, 120), (760, 78, 380, 38, 96), (1180, 150, 460, 44, 110), (520, 190, 300, 30, 70)]
    ):
        cd.ellipse([cx - cw // 2, cy - ch // 2, cx + cw // 2, cy + ch // 2], fill=(255, 255, 255, a))
    clouds = clouds.filter(ImageFilter.GaussianBlur(14))
    img.alpha_composite(clouds)

    # 三层远山
    layers = [
        (ridge(width, int(height * 0.42), 46, 11), TOKENS["mountainFar"], 0.95),
        (ridge(width, int(height * 0.47), 62, 27), TOKENS["mountainMid"], 0.92),
        (ridge(width, int(height * 0.52), 78, 43), TOKENS["mountainNear"], 0.9),
    ]
    for line, color, alpha in layers:
        poly = [(x, y) for x, y in enumerate(line)] + [(width, int(height * 0.62)), (0, int(height * 0.62))]
        draw.polygon(poly, fill=(color[0], color[1], color[2], int(255 * alpha)))

    # 湖面：上方倒影 + 横向波光
    lake_top = int(height * 0.52)
    refl = img.crop((0, lake_top - 150, width, lake_top)).transpose(Image.FLIP_TOP_BOTTOM)
    refl = refl.filter(ImageFilter.GaussianBlur(7)).resize((width, int(height * 0.2)))
    refl.putalpha(96)
    img.alpha_composite(refl, (0, lake_top))

    def ripples(layer: Image.Image, ld: ImageDraw.ImageDraw) -> None:
        for i in range(46):
            rng = np.random.default_rng(i)
            y = int(lake_top + rng.uniform(20, height * 0.40))
            x = int(rng.uniform(0, width))
            length = int(rng.uniform(60, 200))
            a = int(14 + 22 * rng.uniform(0, 1) * (1 - (y - lake_top) / (height * 0.5)))
            ld.line([x, y, x + length, y], fill=(255, 255, 255, max(8, a)), width=int(rng.uniform(1, 2)))

    overlay(img, ripples)

    draw_pavilion(img, int(width * 0.855), int(height * 0.575), 1.35)
    draw_blossom(img, width, height)

    # 草岸：底部起伏的绿坡 + 亮边
    bank = ridge(width, int(height * 0.90), 22, 77)
    poly = [(x, y) for x, y in enumerate(bank)] + [(width, height), (0, height)]
    draw.polygon(poly, fill=(*TOKENS["grass"], 255))
    shade = [(x, y + 26) for x, y in enumerate(bank)] + [(width, height), (0, height)]
    draw.polygon(shade, fill=(*TOKENS["grassDark"], 120))
    draw.line([(x, y) for x, y in enumerate(bank)], fill=(*TOKENS["grassLight"], 210), width=4)

    for i in range(600):
        rng = np.random.default_rng(1000 + i)
        x = int(rng.uniform(0, width))
        y = int(bank[min(x, width - 1)] + rng.uniform(6, height * 0.09))
        h = int(rng.uniform(6, 18))
        draw.line([x, y, x + int(rng.uniform(-4, 4)), y - h], fill=(*TOKENS["grassLight"], 120), width=1)

    img.convert("RGB").save(path, quality=92)


def draw_pavilion(img: Image.Image, cx: int, base_y: int, scale: float) -> None:
    """绘制黄鹤楼剪影（五层飞檐），落在湖对岸。

    :param img: 目标图
    :param cx: 楼体中心 x
    :param base_y: 楼底 y
    :param scale: 缩放系数
    """
    draw = ImageDraw.Draw(img, "RGBA")
    body = (*TOKENS["pavilion"], 232)
    light = (*TOKENS["pavilionLight"], 216)
    tiers = 5
    tier_h = 30 * scale

    # 台基
    draw.rectangle([cx - 84 * scale, base_y - 10 * scale, cx + 84 * scale, base_y], fill=(*TOKENS["pavilionLight"], 180))

    for i in range(tiers):
        y = base_y - i * tier_h * 1.2
        w = 46 * scale * (1.32 - i * 0.06)
        draw.rectangle([cx - w / 2, y - tier_h, cx + w / 2, y], fill=body)
        eave = w * 1.52
        draw.polygon(
            [
                (cx - eave / 2, y - tier_h),
                (cx - eave / 2 - 14 * scale, y - tier_h - 7 * scale),
                (cx - w / 2 + 3, y - tier_h - 14 * scale),
                (cx + w / 2 - 3, y - tier_h - 14 * scale),
                (cx + eave / 2 + 14 * scale, y - tier_h - 7 * scale),
                (cx + eave / 2, y - tier_h),
            ],
            fill=light,
        )
        for k in range(-2, 3):
            wx = cx + k * w * 0.18
            draw.rectangle([wx - 2, y - tier_h * 0.7, wx + 2, y - tier_h * 0.2], fill=(*TOKENS["gold"], 70))

    top = base_y - tiers * tier_h * 1.2
    draw.polygon([(cx - 9 * scale, top), (cx, top - 24 * scale), (cx + 9 * scale, top)], fill=body)
    draw.line([(cx, top - 24 * scale), (cx, top - 40 * scale)], fill=body, width=max(1, int(2 * scale)))


def draw_blossom(img: Image.Image, width: int, height: int) -> None:
    """绘制左上角樱花枝与花瓣。

    :param img: 目标图
    :param width: 画布宽
    :param height: 画布高
    """
    rng = np.random.default_rng(9)

    # 花冠：先铺一层柔光粉团，再点上花瓣，避免枝条稀疏
    canopy = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    cd = ImageDraw.Draw(canopy)
    for _ in range(90):
        x = rng.normal(width * 0.16, width * 0.13)
        y = rng.normal(height * 0.14, height * 0.11)
        r = rng.uniform(14, 40)
        cd.ellipse([x - r, y - r * 0.8, x + r, y + r * 0.8], fill=(*TOKENS["blossom"], int(rng.uniform(40, 90))))
    canopy = canopy.filter(ImageFilter.GaussianBlur(12))
    img.alpha_composite(canopy)

    draw = ImageDraw.Draw(img, "RGBA")

    def branch(x0: float, y0: float, angle: float, length: float, thickness: float, depth: int) -> None:
        x1 = x0 + math.cos(angle) * length
        y1 = y0 + math.sin(angle) * length
        draw.line([x0, y0, x1, y1], fill=(*TOKENS["trunk"], 235), width=max(2, int(thickness)))
        if depth <= 0:
            for _ in range(7):
                bx = x1 + rng.uniform(-22, 22)
                by = y1 + rng.uniform(-18, 18)
                r = rng.uniform(6, 12)
                draw.ellipse([bx - r, by - r, bx + r, by + r], fill=(*TOKENS["blossom"], 225))
                draw.ellipse([bx - r * 0.45, by - r * 0.45, bx + r * 0.45, by + r * 0.45],
                             fill=(*TOKENS["blossomLight"], 240))
            return

        for _ in range(2):
            branch(x1, y1, angle + rng.uniform(-0.5, 0.5), length * rng.uniform(0.6, 0.8),
                   thickness * 0.62, depth - 1)

    branch(-40, 30, 0.55, 170, 20, 3)
    branch(20, -10, 0.92, 140, 14, 2)

    for _ in range(46):
        x = rng.uniform(-20, width * 0.45)
        y = rng.uniform(0, height * 0.40)
        r = rng.uniform(3, 7)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(*TOKENS["blossomLight"], int(rng.uniform(60, 130))))


def draw_table(path: str, width: int = 1334, height: int = 750) -> None:
    """绘制牌桌背景：墨绿绒布、金色描边与水波暗纹。

    :param path: 输出路径
    :param width: 画布宽
    :param height: 画布高
    """
    img = vertical_gradient(
        (width, height),
        [(0.0, TOKENS["felt"]), (0.5, TOKENS["feltLight"]), (1.0, TOKENS["felt"])],
    ).convert("RGBA")

    draw = ImageDraw.Draw(img, "RGBA")

    # 绒布噪点
    noise = np.random.default_rng(3).normal(0, 5, (height, width, 1)).repeat(3, axis=2)
    base = np.array(img.convert("RGB"), dtype=float) + noise
    img = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), "RGB").convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")

    def deco(layer: Image.Image, ld: ImageDraw.ImageDraw) -> None:
        # 中央水波暗纹
        for r in range(120, 520, 46):
            ld.ellipse([width / 2 - r * 1.5, height / 2 - r * 0.72, width / 2 + r * 1.5, height / 2 + r * 0.72],
                       outline=(*TOKENS["gold"], 26), width=2)

        # 金色内框
        ld.rounded_rectangle([16, 16, width - 16, height - 16], radius=26, outline=(*TOKENS["goldDeep"], 170), width=6)
        ld.rounded_rectangle([26, 26, width - 26, height - 26], radius=20, outline=(*TOKENS["gold"], 110), width=2)

        # 四角云纹
        for cx, cy, sx, sy in [(70, 70, 1, 1), (width - 70, 70, -1, 1), (70, height - 70, 1, -1),
                               (width - 70, height - 70, -1, -1)]:
            for i in range(3):
                r = 16 + i * 12
                ld.arc([cx - r, cy - r, cx + r, cy + r], start=0 if sx > 0 else 90,
                       end=90 if sy > 0 else 180, fill=(*TOKENS["gold"], 150), width=2)

    overlay(img, deco)

    img.convert("RGB").save(path, quality=92)


def draw_logo(path: str) -> None:
    """绘制产品标准字「武汉赖子麻将」。

    :param path: 输出路径
    """
    width, height = 640, 176
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    text = "武汉赖子麻将"
    f = font(76, serif=True)
    bbox = draw.textbbox((0, 0), text, font=f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (width - tw) / 2 - bbox[0]
    y = 34 - bbox[1]

    for dx, dy in [(-3, 0), (3, 0), (0, -3), (0, 4), (0, 7)]:
        draw.text((x + dx, y + dy), text, font=f, fill=(*TOKENS["goldDeep"], 255))
    draw.text((x, y), text, font=f, fill=(255, 250, 232, 255))
    draw.text((x, y - 2), text, font=f, fill=(*TOKENS["goldLight"], 160))

    # 底部红印章
    seal = font(30, serif=True)
    seal_text = "红中赖子"
    sbox = draw.textbbox((0, 0), seal_text, font=seal)
    sw = sbox[2] - sbox[0] + 26
    sx = (width - sw) / 2
    draw.rounded_rectangle([sx, 128, sx + sw, 166], radius=8, fill=(*TOKENS["seal"], 235))
    draw.text((sx + 13, 132), seal_text, font=seal, fill=(255, 240, 226, 255))

    img.save(path)


def rounded_card(size: Tuple[int, int], top: Color, bottom: Color, radius: int = 26) -> Image.Image:
    """生成圆角渐变卡底。

    :param size: 卡片尺寸
    :param top: 顶部色
    :param bottom: 底部色
    :param radius: 圆角
    :return: RGBA 卡片
    """
    w, h = size
    grad = vertical_gradient((w, h), [(0.0, top), (1.0, bottom)]).convert("RGBA")
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)
    grad.putalpha(mask)

    return grad


def draw_game_card(path: str, key: str, main: Color, dark: Color, glyph: str, label: str) -> None:
    """绘制一个玩法入口卡：渐变底 + 高光 + 大字形 + 底部标签条。

    :param path: 输出路径
    :param key: 资源名，仅用于日志
    :param main: 主色
    :param dark: 暗色
    :param glyph: 卡片主字形
    :param label: 标签文案
    """
    w, h = 248, 196
    card = rounded_card((w, h), main, dark)
    draw = ImageDraw.Draw(card, "RGBA")

    # 顶部高光：必须走叠加层，否则会把底色 alpha 改写成半透明
    overlay(card, lambda layer, ld: ld.ellipse([-w * 0.3, -h * 0.9, w * 1.1, h * 0.55], fill=(255, 255, 255, 40)))
    # 内描边
    draw.rounded_rectangle([3, 3, w - 4, h - 4], radius=23, outline=(255, 244, 214, 190), width=3)
    draw.rounded_rectangle([9, 9, w - 10, h - 11], radius=18, outline=(255, 255, 255, 60), width=1)

    # 中心字形
    f = font(104, serif=True)
    bbox = draw.textbbox((0, 0), glyph, font=f)
    gw, gh = bbox[2] - bbox[0], bbox[3] - bbox[1]
    gx, gy = (w - gw) / 2 - bbox[0], 44 - bbox[1]
    draw.text((gx + 3, gy + 4), glyph, font=f, fill=(0, 0, 0, 90))
    draw.text((gx, gy), glyph, font=f, fill=(255, 250, 236, 250))

    # 底部标签条
    bar_h = 46
    bar = Image.new("RGBA", (w, bar_h), (0, 0, 0, 0))
    bd = ImageDraw.Draw(bar)
    bd.rectangle([0, 0, w, bar_h], fill=(*TOKENS["goldDeep"], 236))
    bd.line([0, 1, w, 1], fill=(*TOKENS["goldLight"], 210), width=2)
    card.alpha_composite(bar, (0, h - bar_h - 6))

    lf = font(30, serif=True)
    lbox = draw.textbbox((0, 0), label, font=lf)
    lw = lbox[2] - lbox[0]
    draw.text(((w - lw) / 2 - lbox[0], h - bar_h + 4 - lbox[1]), label, font=lf, fill=(255, 246, 224, 255))

    card.save(path)


def draw_shop_head(path: str) -> None:
    """绘制商城帘头：绿白条纹雨棚 + 金边。

    :param path: 输出路径
    """
    w, h = 980, 96
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    draw.rounded_rectangle([0, 0, w - 1, h - 22], radius=18, fill=(*TOKENS["cream"], 255), outline=(*TOKENS["goldDeep"], 255), width=4)
    stripe_w = 56
    for i in range(0, w, stripe_w * 2):
        draw.rectangle([i, 6, min(i + stripe_w, w - 6), h - 26], fill=(*TOKENS["bannerGreen"], 235))
    # 波浪下沿
    for i in range(0, w, 64):
        draw.ellipse([i, h - 40, i + 64, h - 6], fill=(*TOKENS["cream"], 255), outline=(*TOKENS["goldDeep"], 255), width=3)

    f = font(46, serif=True)
    text = "商 城"
    bbox = draw.textbbox((0, 0), text, font=f)
    tw = bbox[2] - bbox[0]
    x = (w - tw) / 2 - bbox[0]
    draw.rounded_rectangle([x - 26, 12, x + tw + 26, h - 34], radius=12, fill=(*TOKENS["goldDeep"], 220))
    draw.text((x + 2, 16 - bbox[1]), text, font=f, fill=(*TOKENS["goldLight"], 255))
    draw.text((x, 14 - bbox[1]), text, font=f, fill=(255, 250, 234, 255))

    img.save(path)


def draw_tile_zhong(path: str) -> None:
    """绘制红中牌面，尺寸与其它牌一致（120×172）。

    :param path: 输出路径
    """
    w, h = 120, 172
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    draw.rounded_rectangle([2, 8, w - 3, h - 3], radius=12, fill=(196, 178, 148, 255))
    draw.rounded_rectangle([2, 2, w - 3, h - 9], radius=12, fill=(250, 245, 231, 255))
    draw.rounded_rectangle([6, 6, w - 7, h - 13], radius=10, outline=(224, 214, 194, 255), width=2)
    draw.line([4, 4, w - 5, 4], fill=(198, 60, 48, 255), width=4)

    f = font(88, serif=True)
    text = "中"
    bbox = draw.textbbox((0, 0), text, font=f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((w - tw) / 2 - bbox[0], (h - 14 - th) / 2 - bbox[1]), text, font=f, fill=(206, 46, 38, 255))
    draw.text(((w - tw) / 2 - bbox[0] + 2, (h - 14 - th) / 2 - bbox[1] + 2), text, font=f, fill=(150, 26, 22, 80))

    img.save(path)


def draw_coin(path: str, size: int = 96) -> None:
    """绘制金币图标。

    :param path: 输出路径
    :param size: 边长
    """
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    r = size * 0.42
    c = size / 2

    draw.ellipse([c - r, c - r + size * 0.06, c + r, c + r + size * 0.06], fill=(*TOKENS["goldDeep"], 255))
    draw.ellipse([c - r, c - r, c + r, c + r], fill=(255, 210, 92, 255))
    draw.ellipse([c - r * 0.72, c - r * 0.72, c + r * 0.72, c + r * 0.72], outline=(*TOKENS["goldDeep"], 220), width=max(2, size // 24))
    draw.ellipse([c - r * 0.34, c - r * 0.34, c + r * 0.34, c + r * 0.34], fill=(255, 236, 168, 255))
    img.save(path)


def draw_coin_pile(path: str, size: int = 150) -> None:
    """绘制金币堆：三枚金币错位叠加，供商城礼包使用。

    :param path: 输出路径
    :param size: 画布边长
    """
    img = Image.new("RGBA", (size, int(size * 0.76)), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    coins = [(0.30, 0.30, 0.30), (0.62, 0.34, 0.28), (0.46, 0.20, 0.33)]

    for cx, cy, r in coins:
        cx, cy, r = cx * size, cy * size * 0.76, r * size
        draw.ellipse([cx - r, cy - r * 0.42 + 6, cx + r, cy + r * 0.58 + 6], fill=(*TOKENS["goldDeep"], 255))
        draw.ellipse([cx - r, cy - r * 0.42, cx + r, cy + r * 0.58], fill=(255, 208, 88, 255))
        draw.ellipse([cx - r * 0.74, cy - r * 0.2, cx + r * 0.74, cy + r * 0.36],
                     outline=(*TOKENS["goldDeep"], 220), width=max(2, size // 40))
        draw.ellipse([cx - r * 0.30, cy + r * 0.02, cx + r * 0.30, cy + r * 0.18], fill=(255, 240, 180, 255))

    img.save(path)


def draw_gem(path: str, size: int = 64) -> None:
    """绘制钻石图标。

    :param path: 输出路径
    :param size: 边长
    """
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    c = size / 2
    pts = [(c, size * 0.08), (size * 0.92, size * 0.42), (c, size * 0.94), (size * 0.08, size * 0.42)]
    draw.polygon(pts, fill=(92, 220, 240, 255))
    draw.polygon([(c, size * 0.08), (size * 0.92, size * 0.42), (c, size * 0.52)], fill=(168, 244, 255, 255))
    draw.polygon([(c, size * 0.52), (c, size * 0.94), (size * 0.08, size * 0.42)], fill=(58, 176, 214, 255))
    img.save(path)


def main() -> None:
    """按清单生成全部资源。"""
    parser = argparse.ArgumentParser(description="生成武汉赖子麻将美术资源")
    parser.add_argument("--out", default="src/static/whmj/gen", help="输出目录")
    args = parser.parse_args()

    out = args.out
    for sub in ("bg", "ui", "tiles"):
        os.makedirs(os.path.join(out, sub), exist_ok=True)

    draw_hall(os.path.join(out, "bg", "hall.jpg"))
    draw_table(os.path.join(out, "bg", "table_bg.jpg"))
    draw_logo(os.path.join(out, "ui", "logo.png"))
    draw_shop_head(os.path.join(out, "ui", "shop_head.png"))
    draw_tile_zhong(os.path.join(out, "tiles", "tile_z1.png"))
    draw_coin(os.path.join(out, "ui", "coin.png"))
    draw_coin_pile(os.path.join(out, "ui", "coin_pile.png"))
    draw_gem(os.path.join(out, "ui", "gem.png"))

    for item in DEVICES:
        draw_game_card(os.path.join(out, "ui", f"{item[0]}.png"), *item)

    print(f"资源已生成到 {out}")


if __name__ == "__main__":
    main()
