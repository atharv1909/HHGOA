// ═══════════════════════════════════════════════════════
// HH GOA 2026 — BUILDER TITLE GENERATOR
// Deterministic, no AI. Categorized by discipline.
// ═══════════════════════════════════════════════════════

interface TitleCategory {
  keywords: string[];
  adjectives: string[];
  nouns: string[];
}

const CATEGORIES: Record<string, TitleCategory> = {
  engineering: {
    keywords: ['dev', 'engineer', 'backend', 'frontend', 'fullstack', 'full-stack', 'full stack', 'software', 'sde', 'swe', 'web', 'mobile', 'app', 'developer', 'programmer', 'coder', 'javascript', 'typescript', 'python', 'java', 'go', 'rust', 'c++', 'ruby', 'node', 'react', 'angular', 'vue', 'next', 'django', 'flask', 'spring'],
    adjectives: ['Signal', 'Runtime', 'Protocol', 'Stack', 'Pipeline', 'Deploy', 'Kernel', 'Thread', 'Socket', 'Cache', 'Queue', 'Binary', 'Async', 'Lambda'],
    nouns: ['Architect', 'Engineer', 'Whisperer', 'Wrangler', 'Surgeon', 'Forger', 'Pilot', 'Alchemist', 'Commander', 'Pioneer', 'Voyager', 'Crafter'],
  },
  design: {
    keywords: ['design', 'ui', 'ux', 'graphic', 'visual', 'brand', 'figma', 'sketch', 'illustrat', 'motion', 'animation', 'creative', 'art', 'pixel', 'interface', 'product design', 'interaction'],
    adjectives: ['Pixel', 'Grid', 'Interface', 'Canvas', 'Palette', 'Vector', 'Gradient', 'Layout', 'Color', 'Form', 'Frame', 'Light'],
    nouns: ['Cartographer', 'Sculptor', 'Weaver', 'Conjurer', 'Composer', 'Visionary', 'Dreamer', 'Shapeshifter', 'Oracle', 'Artisan', 'Mosaicist', 'Luminary'],
  },
  product: {
    keywords: ['product', 'pm', 'manager', 'management', 'strategy', 'growth', 'business', 'founder', 'ceo', 'cto', 'coo', 'lead', 'director', 'vp', 'head', 'chief', 'startup', 'entrepreneur'],
    adjectives: ['Scope', 'Metric', 'Feature', 'Sprint', 'Roadmap', 'Orbit', 'Vision', 'Impact', 'North Star', 'Horizon', 'Venture', 'Market'],
    nouns: ['Navigator', 'Oracle', 'Strategist', 'Captain', 'Pathfinder', 'Catalyst', 'Trailblazer', 'Helmsman', 'Cartographer', 'Vanguard', 'Pioneer', 'Maverick'],
  },
  ai: {
    keywords: ['ai', 'ml', 'machine learning', 'deep learning', 'data', 'neural', 'nlp', 'cv', 'computer vision', 'model', 'llm', 'gpt', 'transformer', 'diffusion', 'reinforcement', 'pytorch', 'tensorflow', 'genai', 'gen ai', 'artificial intelligence'],
    adjectives: ['Tensor', 'Gradient', 'Neural', 'Latent', 'Vector', 'Epoch', 'Inference', 'Diffusion', 'Attention', 'Embedding', 'Quantum', 'Synthetic'],
    nouns: ['Shepherd', 'Conjurer', 'Whisperer', 'Summoner', 'Architect', 'Sage', 'Warden', 'Sorcerer', 'Prophet', 'Channeler', 'Oracle', 'Mystic'],
  },
  systems: {
    keywords: ['devops', 'infra', 'infrastructure', 'cloud', 'sre', 'platform', 'kubernetes', 'docker', 'aws', 'gcp', 'azure', 'linux', 'network', 'security', 'sys', 'ops', 'admin', 'database', 'dba'],
    adjectives: ['Latency', 'Uptime', 'Cluster', 'Container', 'Mesh', 'Pipeline', 'Registry', 'Firewall', 'Proxy', 'Vault', 'Terraform', 'Daemon'],
    nouns: ['Warden', 'Guardian', 'Sentinel', 'Keeper', 'Operator', 'Alchemist', 'Forger', 'Architect', 'Pilot', 'Engineer', 'Ranger', 'Conductor'],
  },
  blockchain: {
    keywords: ['web3', 'blockchain', 'crypto', 'solidity', 'smart contract', 'defi', 'nft', 'dao', 'ethereum', 'solana', 'bitcoin', 'token', 'consensus', 'ledger'],
    adjectives: ['Protocol', 'Consensus', 'Chain', 'Block', 'Hash', 'Merkle', 'Ledger', 'Genesis', 'Shard', 'Oracle', 'Forge', 'Zero-Knowledge'],
    nouns: ['Pirate', 'Architect', 'Miner', 'Validator', 'Sentinel', 'Pioneer', 'Crafter', 'Alchemist', 'Voyager', 'Navigator', 'Explorer', 'Guardian'],
  },
  research: {
    keywords: ['research', 'phd', 'academic', 'scientist', 'professor', 'lab', 'paper', 'journal', 'thesis', 'computational', 'bioinformatics', 'math'],
    adjectives: ['Hypothesis', 'Theorem', 'Citation', 'Abstract', 'Quantum', 'Spectral', 'Axiomatic', 'Empirical', 'Stochastic', 'Boolean', 'Fractal', 'Prime'],
    nouns: ['Scholar', 'Sage', 'Theorist', 'Explorer', 'Philosopher', 'Investigator', 'Discoverer', 'Polymath', 'Luminary', 'Seeker', 'Oracle', 'Cipher'],
  },
  creative: {
    keywords: ['content', 'write', 'writer', 'copy', 'market', 'social', 'media', 'video', 'photo', 'film', 'music', 'audio', 'podcast', 'blog', 'community'],
    adjectives: ['Narrative', 'Rhythm', 'Spectrum', 'Echo', 'Signal', 'Story', 'Wavelength', 'Frequency', 'Pulse', 'Chronicle', 'Verse', 'Chorus'],
    nouns: ['Weaver', 'Bard', 'Composer', 'Alchemist', 'Storyteller', 'Chronicler', 'Architect', 'Conductor', 'Dreamer', 'Sculptor', 'Muse', 'Luminary'],
  },
};

// Fallback for unrecognized stacks
const FALLBACK: TitleCategory = {
  keywords: [],
  adjectives: ['Signal', 'Horizon', 'Vertex', 'Apex', 'Zenith', 'Vector', 'Nova', 'Prism', 'Nexus', 'Cipher', 'Flux', 'Quantum'],
  nouns: ['Builder', 'Architect', 'Pioneer', 'Explorer', 'Voyager', 'Alchemist', 'Crafter', 'Navigator', 'Forger', 'Maverick', 'Sentinel', 'Visionary'],
};

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function detectCategory(stack: string): TitleCategory {
  const lower = stack.toLowerCase();
  for (const [, category] of Object.entries(CATEGORIES)) {
    for (const keyword of category.keywords) {
      if (lower.includes(keyword)) {
        return category;
      }
    }
  }
  return FALLBACK;
}

export function generateTitle(name: string, stack: string, rerollIndex: number = 0): string {
  const category = detectCategory(stack);
  const seed = simpleHash(name + stack) + rerollIndex;
  const adj = category.adjectives[seed % category.adjectives.length];
  const noun = category.nouns[(seed * 7 + 3) % category.nouns.length];
  return `${adj} ${noun}`;
}

export const MAX_REROLLS = 3;
