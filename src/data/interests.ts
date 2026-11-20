export type ProjectPiece = {
  projectId: string;
  summary?: string;
};

export type NotePiece = {
  title: string;
  summary: string;
  meta?: string;
};

export type InterestPiece = ProjectPiece | NotePiece;

export type InterestLink = {
  label: string;
  href: string;
};

export type Interest = {
  slug: string;
  label: string;
  color: string;
  lede: string;
  pointsTitle?: string;
  points?: string[];
  pieces: InterestPiece[];
  links?: InterestLink[];
};

export const interests: readonly Interest[] = [
  {
    slug: 'neovim',
    label: 'Neovim',
    color: 'var(--accent-success)',
    lede: 'The editor on the machine I actually use. It lives in the same config tree as the window manager, shell, and terminals.',
    pointsTitle: 'In the config',
    points: [
      'lazy.nvim, with boot split into remaps, set, and lazy under lua/config_1.',
      'LSP through lsp-zero, and formatting with conform.',
      'Telescope, Treesitter, Harpoon, Neo-tree, fugitive, undotree, and lualine.',
      'Obsidian.nvim, render-markdown, and image.nvim so notes stay in the editor.',
      'vim-tmux-navigator, with Catppuccin as the color scheme.',
      'Still open: a Cmd+Delete-style line kill, and a short motion cheat sheet.',
    ],
    pieces: [
      {
        projectId: 'coding-personal-config-rice',
        summary:
          'How Neovim sits next to AeroSpace, Fish, Ghostty, Alacritty, and tmux, including the keyboard layer (QMK and Karabiner) around it.',
      },
    ],
    links: [
      {
        label: 'Config repo',
        href: 'https://github.com/BryceRoberts13/config',
      },
    ],
  },
  {
    slug: 'leatherworking',
    label: 'Leatherworking',
    color: 'var(--accent-secondary)',
    lede: 'Straps, a wallet, and a case. These are practice pieces: fit, edges, and hardware before a belt I would wear every day.',
    pieces: [
      { projectId: 'leather-airpods-case' },
      { projectId: 'exploration-wallet-making' },
      { projectId: 'exploration-belt-making' },
    ],
  },
  {
    slug: 'game-theory',
    label: 'Game Theory',
    color: 'var(--accent-link)',
    lede: 'Strategic models with a budget and a network. The project I can hand you is the 14.18 lobbying paper. Strategy and Information is the other course in this lane.',
    pieces: [
      {
        projectId: '14-18-lobbying-network',
        summary:
          'A lobbyist splits persuasion effort across council members who influence each other. The closed form lines optimal effort up with Katz-Bonacich centrality, including a linear-quadratic network game and extensions for bounded actions and probabilistic voting.',
      },
    ],
  },
  {
    slug: 'formal-verification',
    label: 'Formal Verification',
    color: 'var(--accent)',
    lede: 'I want an argument that a system does what it claims, not only a test suite that happened to pass. There is no verification project written up here yet.',
    pieces: [
      {
        title: 'Theory of Computation',
        meta: 'Coursework',
        summary:
          'The nearest course on the resume. It is computability and complexity, not a proof assistant or a model checker. A real verification writeup belongs on this page when it exists.',
      },
    ],
  },
  {
    slug: 'numerical-methods',
    label: 'Numerical Methods',
    color: 'var(--accent-tertiary)',
    lede: 'Computation that has to answer to the math: check a closed form, and know what the optimizer is doing. The concrete code is the numerics package inside the lobbying project.',
    pieces: [
      {
        projectId: '14-18-lobbying-network',
        summary:
          'Python package at src/lobbying_research/, with a pytest suite. Install with uv sync, then pytest. The numerics sit next to the paper’s closed form.',
      },
      {
        title: 'Graduate Non-Linear Optimization',
        meta: 'Coursework',
        summary: 'On the transcript. No separate project page.',
      },
    ],
  },
];

export function isProjectPiece(piece: InterestPiece): piece is ProjectPiece {
  return 'projectId' in piece;
}
