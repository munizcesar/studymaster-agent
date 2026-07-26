class SourceProvider {
  constructor(name, type) {
    this.name = name;
    this.type = type; // "aggregator", "official_api", "sitemap", etc.
  }
  
  /**
   * Deve retornar um array de objetos:
   * {
   *    sourceUrl: string,
   *    discoveredUrl: string,
   *    discoveredAt: string (ISO),
   *    discoveryType: string
   * }
   */
  async discover() {
    throw new Error("discover() not implemented in " + this.name);
  }
}

class HTMLAggregatorProvider extends SourceProvider {
  constructor(name, url, type = "aggregator") {
    super(name, type);
    this.url = url;
  }

  async discover() {
    const results = [];
    try {
      const response = await fetch(this.url, {
        headers: { 'User-Agent': 'StudyMaster-DiscoveryEngine/1.0' },
        signal: AbortSignal.timeout(15000)
      });
      if (!response.ok) return [];
      
      const html = await response.text();
      
      // Busca links de notícias
      const linkRegex = /href="(https:\/\/www\.pciconcursos\.com\.br\/noticias\/[^"]+)"/gi;
      let match;
      while ((match = linkRegex.exec(html)) !== null) {
        const link = match[1].trim();
        results.push({
          sourceProvider: this.name,
          sourceUrl: this.url,
          discoveredUrl: link,
          discoveredAt: new Date().toISOString(),
          discoveryType: this.type
        });
      }
    } catch (e) {
      console.error(`Erro no provider ${this.name}:`, e);
    }
    return results;
  }
}

class DiscoveryEngine {
  constructor(env) {
    this.env = env;
    this.providers = [
      new HTMLAggregatorProvider("pci-concursos", "https://www.pciconcursos.com.br/concursos/nacional/")
    ];
  }

  async run() {
    const allDiscovered = [];
    for (const provider of this.providers) {
      const items = await provider.discover();
      allDiscovered.push(...items);
    }

    const newItems = [];
    const processedUrls = new Set(); // para deduplicação em memória na mesma run

    for (const item of allDiscovered) {
      if (processedUrls.has(item.discoveredUrl)) continue;
      processedUrls.add(item.discoveredUrl);

      // Idempotência: verifica se a URL já existe em documentos (como url_origem)
      let exists = false;
      if (this.env.DB_EDITAIS) {
        // Como o Document Fetcher vai alterar a url_origem para a oficial,
        // a descoberta pode achar a mesma URL e considerá-la nova se só checar url_origem.
        // O ideal é registrar a 'discoveredUrl' em alguma tabela ou usar 'url_origem' inicialmente.
        const row = await this.env.DB_EDITAIS.prepare(
          'SELECT 1 FROM documentos WHERE url_origem = ? LIMIT 1'
        ).bind(item.discoveredUrl).first();
        exists = !!row;
      }

      if (!exists) {
        item.eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2,8)}`;
        newItems.push(item);
        
        // Envia para a Fila de Discovery
        if (this.env.DISCOVERY_QUEUE) {
          await this.env.DISCOVERY_QUEUE.send(item);
        }
      }
    }
    return newItems;
  }
}

export {
  SourceProvider,
  HTMLAggregatorProvider,
  DiscoveryEngine
};
