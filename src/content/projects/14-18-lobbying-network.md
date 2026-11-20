---
title: Targeted lobbying on council networks (14.18)
description: MIT 14.18 (Economics of Networks) final paper and code. Static persuasion game on a council graph; optimal effort tracks Katz-Bonacich centrality.
date: 2026-05-14
category: coding
github: https://github.com/BryceRoberts13/14.18-lobbying-network
---

Final project for **14.18, Spring 2026**: one lobbyist splits a persuasion budget across council members who influence each other along network edges before voting. Paper gives closed-form solution and shows optimal targeting lines up with **Katz-Bonacich centrality** on the council graph under standard influence-tech assumptions.

**Repository highlights**

- `paper/` LaTeX draft and final submission tree
- `src/lobbying_research/` Python package for numerics
- `tests/` pytest suite (`uv sync`, then `pytest`)
- `lobbying-model-formalization.md` plus `presentations/` and `resources/` for slides and references

Use **GitHub** button above for clone, `uv` lockfile, and full file layout.
