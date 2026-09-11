#!/usr/bin/env python3
"""
Langton's Ant — a real-time demo.

Langton's ant is a two-dimensional cellular automaton with a tiny ruleset
that produces surprisingly complex emergent behaviour:

    * On a white square: turn 90° right, flip the square to black, then
      move forward one cell.
    * On a black square: turn 90° left, flip the square to white, then
      move forward one cell.

After a chaotic initial phase (~10 000 steps) the ant falls into a
repeating "highway" pattern that builds a diagonal corridor forever.

Dependencies:
    pip install pygame

Run:
    python langtons_ant.py

Controls:
    SPACE       pause / resume
    UP / DOWN   speed up / slow down (steps per frame)
    C           toggle colour mode (classic black/white  <->  visit heat-map)
    R           reset
    F1          toggle the on-screen HUD
    ESC         quit
"""
from __future__ import annotations

import sys

try:
    import pygame
except ImportError:
    sys.stderr.write(
        "This demo needs pygame.  Install it with:\n\n    pip install pygame\n"
    )
    sys.exit(1)


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
GRID_W, GRID_H = 220, 220          # number of cells across / down
CELL = 3                           # screen pixels per cell
WIN_W, WIN_H = GRID_W * CELL, GRID_H * CELL

STEPS_PER_FRAME = 60               # initial simulation speed
FPS = 60

# Direction vectors, indexed 0..3 for up, right, down, left.
DX = (0, 1, 0, -1)
DY = (-1, 0, 1, 0)

# Palette
WHITE = (245, 245, 245)
BLACK = (20, 20, 20)
ANT = (225, 45, 45)
HUD = (255, 255, 255)
HUD_BG = (0, 0, 0)


# ---------------------------------------------------------------------------
# Colour helpers for the heat-map mode
# ---------------------------------------------------------------------------
def hsv_to_rgb(h: float, s: float, v: float) -> tuple[int, int, int]:
    """Convert an HSV colour (each channel in [0, 1]) to an 8-bit RGB tuple."""
    i = int(h * 6.0)
    f = h * 6.0 - i
    p = v * (1.0 - s)
    q = v * (1.0 - s * f)
    t = v * (1.0 - s * (1.0 - f))
    i %= 6
    if i == 0:
        r, g, b = v, t, p
    elif i == 1:
        r, g, b = q, v, p
    elif i == 2:
        r, g, b = p, v, t
    elif i == 3:
        r, g, b = p, q, v
    elif i == 4:
        r, g, b = t, p, v
    else:
        r, g, b = v, p, q
    return int(r * 255), int(g * 255), int(b * 255)


def heat_color(count: int) -> tuple[int, int, int]:
    """Map a visit count (0..255) to a colour: white -> blue -> red."""
    if count <= 0:
        return WHITE
    hue = (1.0 - min(count / 255.0, 1.0)) * 0.66   # 0.66 blue -> 0.0 red
    return hsv_to_rgb(hue, 0.9, 1.0)


# ---------------------------------------------------------------------------
# The simulation
# ---------------------------------------------------------------------------
class LangtonsAnt:
    def __init__(self) -> None:
        self.mode = "classic"
        self.reset()

    def reset(self) -> None:
        self.grid = bytearray(GRID_W * GRID_H)   # 0 = white, 1 = black
        self.heat = bytearray(GRID_W * GRID_H)   # visit count, capped at 255
        self.ant_x = GRID_W // 2
        self.ant_y = GRID_H // 2
        self.ant_dir = 0                          # start facing up
        self.steps = 0
        # A 1-pixel-per-cell surface we repaint incrementally (only the one
        # cell the ant flips changes per step, so this is very cheap).
        self.surface = pygame.Surface((GRID_W, GRID_H))
        self.surface.fill(WHITE)

    def cell_color(self, idx: int) -> tuple[int, int, int]:
        if self.mode == "heat":
            return heat_color(self.heat[idx])
        return BLACK if self.grid[idx] else WHITE

    def rebuild_surface(self) -> None:
        """Repaint every cell (used when switching colour modes)."""
        surf = self.surface
        color_of = self.cell_color
        surf.lock()
        try:
            for y in range(GRID_H):
                row = y * GRID_W
                for x in range(GRID_W):
                    surf.set_at((x, y), color_of(row + x))
        finally:
            surf.unlock()

    def step(self, n: int) -> None:
        """Advance the ant by n steps."""
        grid, heat = self.grid, self.heat
        ax, ay, d = self.ant_x, self.ant_y, self.ant_dir
        set_at = self.surface.set_at
        color_of = self.cell_color
        surf = self.surface
        surf.lock()
        try:
            for _ in range(n):
                idx = ay * GRID_W + ax
                if grid[idx] == 0:               # white -> turn right, go black
                    d = (d + 1) & 3
                    grid[idx] = 1
                else:                            # black -> turn left, go white
                    d = (d - 1) & 3
                    grid[idx] = 0
                if heat[idx] < 255:
                    heat[idx] += 1
                set_at((ax, ay), color_of(idx))
                ax = (ax + DX[d]) % GRID_W
                ay = (ay + DY[d]) % GRID_H
        finally:
            surf.unlock()
        self.ant_x, self.ant_y, self.ant_dir = ax, ay, d
        self.steps += n


# ---------------------------------------------------------------------------
# Main loop
# ---------------------------------------------------------------------------
def main() -> None:
    pygame.init()
    pygame.display.set_caption("Langton's Ant")
    screen = pygame.display.set_mode(
        (WIN_W, WIN_H), flags=pygame.SCALED, vsync=1
    )
    clock = pygame.time.Clock()
    font = pygame.font.SysFont("monospace", 14)

    sim = LangtonsAnt()
    steps_per_frame = STEPS_PER_FRAME
    paused = False
    show_hud = True

    hint = "SPACE pause   UP/DOWN speed   C colour   R reset   F1 hud   ESC quit"

    running = True
    while running:
        for ev in pygame.event.get():
            if ev.type == pygame.QUIT:
                running = False
            elif ev.type == pygame.KEYDOWN:
                if ev.key == pygame.K_ESCAPE:
                    running = False
                elif ev.key == pygame.K_SPACE:
                    paused = not paused
                elif ev.key == pygame.K_UP:
                    steps_per_frame = min(steps_per_frame * 2, 200000)
                elif ev.key == pygame.K_DOWN:
                    steps_per_frame = max(steps_per_frame // 2, 1)
                elif ev.key == pygame.K_c:
                    sim.mode = "heat" if sim.mode == "classic" else "classic"
                    sim.rebuild_surface()
                elif ev.key == pygame.K_r:
                    sim.reset()
                elif ev.key == pygame.K_F1:
                    show_hud = not show_hud

        if not paused:
            sim.step(steps_per_frame)

        # --- render -------------------------------------------------------
        pygame.transform.scale(sim.surface, (WIN_W, WIN_H), screen)
        # ant marker (drawn on top so it stays visible)
        pygame.draw.rect(
            screen, ANT,
            (sim.ant_x * CELL, sim.ant_y * CELL, CELL, CELL),
        )

        if show_hud:
            lines = [
                f"steps : {sim.steps:>10}",
                f"speed : {steps_per_frame:>10} /frame",
                f"mode  : {sim.mode:>10}",
                f"state : {'PAUSED' if paused else 'RUNNING':>10}",
            ]
            y = 8
            for line in lines:
                surf = font.render(line, True, HUD, HUD_BG)
                screen.blit(surf, (8, y))
                y += surf.get_height() + 1
            hint_surf = font.render(hint, True, HUD, HUD_BG)
            screen.blit(hint_surf, (8, WIN_H - hint_surf.get_height() - 8))

        pygame.display.flip()
        clock.tick(FPS)

    pygame.quit()


if __name__ == "__main__":
    main()
