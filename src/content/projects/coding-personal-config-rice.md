---
title: Personal config & rice
description: How the machine is laid out—tiling on macOS, Neovim, terminals, shell, and the bits that glue Obsidian and coding together.
date: 2026-05-14
category: coding
---

This is the **current stack** behind day-to-day work: same ideas that show up in my vault as “personal OS” and tooling notes, but grounded in what is actually checked into config.

## Dotfiles shape

`~/.config` is the **single tree** I treat as source of truth: editor, WM, terminals, shell, and app configs live next to each other. A small `bootstrap.sh` can back up an existing `~/.config` and symlink the repo into place so paths stay predictable across machines.

## Window manager: AeroSpace

On macOS I use **[AeroSpace](https://nikitabobko.github.io/AeroSpace/)** as the tiling layer: default **tiles** layout, **alt+hjkl** for focus, **alt+shift+hjkl** for move, **ctrl+alt+hjkl** for join-with neighbors, and **alt+1…9 / letter workspaces** for jumping without the mouse. Gaps are intentionally zero in the profile I run most often.

Configs are split so **base bindings** stay readable and a **docked-monitor fragment** can layer on when hardware changes. A shell script **rewrites the canonical `aerospace.toml`** from those pieces so there is only one path the WM reads—no drift between “the file I edited” and “the file AeroSpace loads.”

## Terminals

**Ghostty** and **Alacritty** both have folders in the tree; I pick one per machine or mood, but the habit is the same: full keyboard, copy-on-select behavior where it helps, and font sizing that matches the WM (no chrome-heavy floating terminal stacks).

## Shell

**Fish** is the interactive shell: fast prompts, sane defaults, and scripts that do not need to be POSIX-sh compatible when I am the only consumer.

## Neovim

Neovim is driven by **lazy.nvim** (`require("lazy").setup("plugins")`) with a small `lua/config_1/` entry (`remaps`, `set`, `lazy`) so boot stays obvious.

Plugins I actually lean on:

- **LSP** via **lsp-zero** plus **conform** for formatting
- **Telescope** for fuzzy everything
- **Obsidian.nvim** so vault markdown and the site repo feel like one editing muscle (with a tiny autocmd guard for spurious `readonly` on real files)
- **render-markdown.nvim** and **image.nvim** for readable notes with assets
- **Treesitter**, **Neo-tree**, **Harpoon**, **vim-fugitive**, **undotree**, **lualine**
- **vim-tmux-navigator** so split jumps between terminal panes and editor splits without thinking

Color scheme in tree: **Catppuccin**. The “rice” part is less about wallpaper and more about **one motion from thought to buffer**.

## Tmux

Tmux is still the **long-session** layer: attach, detach, and pair with Neovim’s tmux-navigator so navigation stays spatial. Journal notes from last summer were basically “learn tmux for real”; the current setup is that work paying rent.

## Keyboard and macOS glue

Separate from Neovim: I ran a **custom keyboard** project with **QMK** on the board and **Karabiner-Elements** plus **Bash / AppleScript** on macOS for leader-style remaps and deep OS integration. That stack is “hardware rice”; AeroSpace + Neovim are “software rice”—same philosophy, different layer.

## Declarative macOS pieces

**nix-darwin** shows up in the config tree for the parts of the machine I want **reproducible installs** instead of “I ran brew once on this laptop.” It does not need to own everything; it needs to own the bits that hurt when they drift.

## Second brain in the loop

- **Obsidian** is the vault; **Obsidian.nvim** is how Neovim participates without a second editor religion.
- Vault-side idea file **Personal OS Dashboard** sketches a bigger system: calendar as planned-vs-actual, tagged time, linked people/events, workspace modes, and an AI summary layer—**intentionally not one giant app first**. The live rice above is the **editor + WM + terminal floor** that has to work before that dashboard is worth automating.
- **Snippet Launcher** (still a note, not shipped) is the same “leader key opens power” idea: fuzzy search snippets → clipboard → optionally a Neovim mapping.

## Roadmap (honest)

From the vault task list: **Cmd+Delete-style line kill in Neovim**, a **short motion cheat sheet**, and tighter **offline calendar** workflow. Those are polish items; the spine is already AeroSpace + Fish + Ghostty/Alacritty + Neovim + tmux + Karabiner/QMK where it matters.
