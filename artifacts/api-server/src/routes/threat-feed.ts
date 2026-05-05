import { Router } from "express";

const router = Router();

type CisaVuln = {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  shortDescription: string;
  requiredAction: string;
  dueDate: string;
  knownRansomwareCampaignUse: string;
  notes: string;
};

type CisaFeed = {
  catalogVersion: string;
  dateReleased: string;
  count: number;
  vulnerabilities: CisaVuln[];
};

type CachedData = { data: CisaVuln[]; fetchedAt: number; catalogVersion: string };
let cache: CachedData | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

router.get("/threat-feed", async (req, res) => {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    res.json({ items: cache.data, catalogVersion: cache.catalogVersion, cached: true, fetchedAt: cache.fetchedAt });
    return;
  }

  try {
    const response = await fetch(
      "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
      { signal: AbortSignal.timeout(10_000) }
    );
    if (!response.ok) throw new Error(`CISA API returned ${response.status}`);

    const json = (await response.json()) as CisaFeed;

    const sorted = [...json.vulnerabilities]
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      .slice(0, 20);

    cache = { data: sorted, fetchedAt: Date.now(), catalogVersion: json.catalogVersion };
    res.json({ items: sorted, catalogVersion: json.catalogVersion, cached: false, fetchedAt: cache.fetchedAt });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch CISA threat feed");
    if (cache) {
      res.json({ items: cache.data, catalogVersion: cache.catalogVersion, cached: true, fetchedAt: cache.fetchedAt, stale: true });
    } else {
      res.status(503).json({ error: "Threat feed temporarily unavailable." });
    }
  }
});

export default router;
