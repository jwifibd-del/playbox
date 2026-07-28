import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type FanartImg = { url: string; lang: string; likes: string; id: string };
type FanartSeasonImg = FanartImg & { season?: string };
type FanartDiscImg = FanartImg & { disc?: string };

export interface FanartMovieArt {
  name: string;
  tmdb_id?: string;
  imdb_id?: string;
  tvdb_id?: string;
  moviethumb?: FanartImg[];
  moviebackground?: FanartImg[];
  movieposter?: FanartImg[];
  movielogo?: FanartImg[];
  moviebanner?: FanartImg[];
  hdmovielogo?: FanartImg[];
  hdmovieclearart?: FanartImg[];
  moviedisc?: FanartDiscImg[];
  movieart?: FanartImg[];
}

export interface FanartTvArt {
  name: string;
  thetvdb_id: string;
  tmdb_id?: string;
  imdb_id?: string;
  clearlogo?: FanartImg[];
  hdtvlogo?: FanartImg[];
  clearart?: FanartImg[];
  showbackground?: FanartImg[];
  tvthumb?: FanartImg[];
  seasonposter?: FanartSeasonImg[];
  seasonthumb?: FanartSeasonImg[];
  hdclearart?: FanartImg[];
  tvbanner?: FanartImg[];
  characterart?: FanartImg[];
  tvposter?: FanartImg[];
  seasonbanner?: FanartSeasonImg[];
}

export interface PickedFanartMovie {
  logo?: string;
  hdlogo?: string;
  clearart?: string;
  hdclearart?: string;
  poster?: string;
  background?: string;
  banner?: string;
  thumb?: string;
  disc?: string;
  basic: Pick<FanartMovieArt, 'name' | 'tmdb_id' | 'imdb_id' | 'tvdb_id'>;
}

export interface PickedFanartTV {
  logo?: string;
  hdlogo?: string;
  clearart?: string;
  hdclearart?: string;
  poster?: string;
  background?: string;
  banner?: string;
  thumb?: string;
  basic: Pick<FanartTvArt, 'name' | 'thetvdb_id' | 'tmdb_id' | 'imdb_id'>;
  seasonPosters?: Record<string, string>;
  seasonThumbs?: Record<string, string>;
}

@Injectable()
export class FanartService {
  private readonly logger = new Logger(FanartService.name);
  private readonly baseUrl = 'https://webservice.fanart.tv/v3';
  private readonly tmdbBaseUrl = 'https://api.themoviedb.org/3';
  private readonly apiKey: string;
  private readonly tmdbApiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('FANART_API_KEY') || '';
    this.tmdbApiKey = this.configService.get<string>('TMDB_API_KEY') || '';
  }

  isConfigured(overrideKey?: string | undefined | null): boolean {
    return Boolean((this.apiKey && this.apiKey.length > 0) || (overrideKey && String(overrideKey).trim().length > 0));
  }

  isTmdbConfigured(): boolean {
    return Boolean(this.tmdbApiKey && this.tmdbApiKey.length > 0);
  }

  private effectiveKey(overrideKey?: string | undefined | null): string {
    if (overrideKey && String(overrideKey).trim().length > 0) return String(overrideKey).trim();
    return this.apiKey;
  }

  private pickBest(
    list?: { url: string; lang?: string; likes?: string }[] | undefined,
    preferLang = 'en',
  ): string | undefined {
    if (!list || list.length === 0) return undefined;
    const ranked = list.map(img => {
      const score =
        (img.lang === preferLang ? 10000 : 0) +
        Number((img as any).likes || 0);
      return { ...img, score };
    });
    ranked.sort((a, b) => b.score - a.score);
    return ranked[0]?.url || undefined;
  }

  async getTMDBMovieExternalIds(tmdbId: number): Promise<{ imdb_id?: string; tvdb_id?: number } | null> {
    if (!this.isTmdbConfigured()) return null;
    try {
      const url = `${this.tmdbBaseUrl}/movie/${tmdbId}/external_ids?api_key=${this.tmdbApiKey}`;
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`TMDB external ids lookup failed (${response.status})`);
      }
      return await response.json() as any;
    } catch (error) {
      this.logger.warn(`TMDB external ids lookup failed for movie ${tmdbId}: ${(error as Error).message}`);
      return null;
    }
  }

  async getTMDBTVExternalIds(tmdbId: number): Promise<{ imdb_id?: string; tvdb_id?: number } | null> {
    if (!this.isTmdbConfigured()) return null;
    try {
      const url = `${this.tmdbBaseUrl}/tv/${tmdbId}/external_ids?api_key=${this.tmdbApiKey}`;
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`TMDB external ids lookup failed (${response.status})`);
      }
      return await response.json() as any;
    } catch (error) {
      this.logger.warn(`TMDB external ids lookup failed for tv ${tmdbId}: ${(error as Error).message}`);
      return null;
    }
  }

  async getMovieArtByTMDB(tmdbId: number, fanartKey?: string): Promise<FanartMovieArt | null> {
    const ids = await this.getTMDBMovieExternalIds(tmdbId);
    let fanartId: string | null = null;
    if (ids?.imdb_id) fanartId = ids.imdb_id;
    else fanartId = String(tmdbId);
    if (!fanartId) return null;
    return this.getMovieArt(fanartId, fanartKey);
  }

  async getTVArtByTMDB(tmdbId: number, fanartKey?: string): Promise<FanartTvArt | null> {
    const ids = await this.getTMDBTVExternalIds(tmdbId);
    const tvdbId = ids?.tvdb_id ? String(ids.tvdb_id) : null;
    if (!tvdbId) return null;
    return this.getTVArt(tvdbId, fanartKey);
  }

  async getMovieArt(tmdbOrImdbId: string, fanartKey?: string): Promise<FanartMovieArt | null> {
    if (!this.isConfigured(fanartKey)) return null;
    if (!tmdbOrImdbId) return null;
    try {
      const key = this.effectiveKey(fanartKey);
      const url = `${this.baseUrl}/movies/${encodeURIComponent(String(tmdbOrImdbId))}?api_key=${key}`;
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Fanart movie lookup failed (${response.status})`);
      }
      return await response.json() as FanartMovieArt;
    } catch (error) {
      this.logger.warn(`Fanart movie lookup failed for ${tmdbOrImdbId}: ${(error as Error).message}`);
      return null;
    }
  }

  async getTVArt(tvdbId: string, fanartKey?: string): Promise<FanartTvArt | null> {
    if (!this.isConfigured(fanartKey)) return null;
    if (!tvdbId) return null;
    try {
      const key = this.effectiveKey(fanartKey);
      const url = `${this.baseUrl}/tv/${encodeURIComponent(String(tvdbId))}?api_key=${key}`;
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Fanart TV lookup failed (${response.status})`);
      }
      return await response.json() as FanartTvArt;
    } catch (error) {
      this.logger.warn(`Fanart TV lookup failed for ${tvdbId}: ${(error as Error).message}`);
      return null;
    }
  }

  async getPickedMovie(tmdbOrImdbId: string, preferLang = 'en', fanartKey?: string): Promise<PickedFanartMovie | null> {
    const art = await this.getMovieArt(tmdbOrImdbId, fanartKey);
    if (!art) return null;
    return {
      logo: this.pickBest(art.movielogo, preferLang),
      hdlogo: this.pickBest(art.hdmovielogo, preferLang),
      clearart: this.pickBest(art.hdmovieclearart, preferLang) || this.pickBest(art.movieart, preferLang),
      poster: this.pickBest(art.movieposter, preferLang),
      background: this.pickBest(art.moviebackground, preferLang),
      banner: this.pickBest(art.moviebanner, preferLang),
      thumb: this.pickBest(art.moviethumb, preferLang),
      disc: this.pickBest(art.moviedisc, preferLang),
      basic: {
        name: art.name,
        tmdb_id: art.tmdb_id,
        imdb_id: art.imdb_id,
        tvdb_id: art.tvdb_id,
      },
    };
  }

  async getPickedMovieByTMDB(tmdbId: number, preferLang = 'en', fanartKey?: string): Promise<PickedFanartMovie | null> {
    const ids = await this.getTMDBMovieExternalIds(tmdbId);
    let fanartId: string | null = null;
    if (ids?.imdb_id) fanartId = ids.imdb_id;
    else fanartId = String(tmdbId);
    if (!fanartId) return null;
    return this.getPickedMovie(fanartId, preferLang, fanartKey);
  }

  async getPickedTVByTMDB(tmdbId: number, preferLang = 'en', fanartKey?: string): Promise<PickedFanartTV | null> {
    const ids = await this.getTMDBTVExternalIds(tmdbId);
    const tvdbId = ids?.tvdb_id ? String(ids.tvdb_id) : null;
    if (!tvdbId) return null;
    return this.getPickedTV(tvdbId, preferLang, fanartKey);
  }

  async getPickedTV(tvdbId: string, preferLang = 'en', fanartKey?: string): Promise<PickedFanartTV | null> {
    const art = await this.getTVArt(tvdbId, fanartKey);
    if (!art) return null;
    const seasonPosters: Record<string, string> = {};
    const seasonPostersScore: Record<string, number> = {};
    for (const s of art.seasonposter || []) {
      if (!s.season) continue;
      const score = (s.lang === preferLang ? 10000 : 0) + Number((s as any).likes || 0);
      if (!seasonPosters[s.season] || score > (seasonPostersScore[s.season] || 0)) {
        seasonPosters[s.season] = s.url;
        seasonPostersScore[s.season] = score;
      }
    }
    const seasonThumbs: Record<string, string> = {};
    const seasonThumbsScore: Record<string, number> = {};
    for (const s of art.seasonthumb || []) {
      if (!s.season) continue;
      const score = (s.lang === preferLang ? 10000 : 0) + Number((s as any).likes || 0);
      if (!seasonThumbs[s.season] || score > (seasonThumbsScore[s.season] || 0)) {
        seasonThumbs[s.season] = s.url;
        seasonThumbsScore[s.season] = score;
      }
    }
    return {
      logo: this.pickBest(art.clearlogo, preferLang),
      hdlogo: this.pickBest(art.hdtvlogo, preferLang),
      clearart: this.pickBest(art.clearart, preferLang),
      hdclearart: this.pickBest(art.hdclearart, preferLang),
      poster: this.pickBest(art.tvposter, preferLang),
      background: this.pickBest(art.showbackground, preferLang),
      banner: this.pickBest(art.tvbanner, preferLang),
      thumb: this.pickBest(art.tvthumb, preferLang),
      basic: {
        name: art.name,
        thetvdb_id: art.thetvdb_id,
        tmdb_id: art.tmdb_id,
        imdb_id: art.imdb_id,
      },
      seasonPosters,
      seasonThumbs,
    };
  }
}
