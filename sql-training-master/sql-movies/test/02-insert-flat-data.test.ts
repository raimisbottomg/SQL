import _ from "lodash";
import { Database } from "../src/database";
import { CsvLoader } from "../src/data/csv-loader";
import {
  selectActorByName,
  selectCount,
  selectKeyword,
  selectDirector,
  selectGenre,
  selectProductionCompany,
  selectMovie
} from "../src/queries/select";
import {
  ACTORS,
  KEYWORDS,
  DIRECTORS,
  GENRES,
  PRODUCTION_COMPANIES,
  MOVIES
} from "../src/table-names";
import { Movie } from "../src/data/types";
import { escape } from "../src/utils";
import { minutes } from "./utils";

const insertActors = (actors: string[]) => {
  const values = actors.map(actor => `('${escape(actor)}')`).join(', ');
  return `INSERT INTO actors (full_name) VALUES ${values}`;

};

const insertKeywords = (keywords: string[]) => {
  const values = keywords.map(keyword => `('${escape(keyword)}')`).join(", ");
  return `INSERT INTO keywords (keyword) VALUES ${values}`;
};

const insertDirectors = (directors: string[]) => {
  const values = directors.map(director => `('${escape(director)}')`).join(', ');
  return `INSERT INTO directors (full_name) VALUES ${values}`;
};

const insertGenres = (genres: string[]) => {
  const values = genres.map(genre => `('${escape(genre)}')`).join(", ");
  return `INSERT INTO genres (genre) VALUES ${values}`;
};

const insertProductionCompanies = (companies: string[]) => {
  const values = companies.map(company => `('${escape(company)}')`).join(', ');
  return `INSERT INTO production_companies (company_name) VALUES ${values}`;
};

const insertMovies = (movies: Movie[]) => {
  const values = movies.map(movie => {
    const {
      imdbId,
      popularity,
      budget,
      budgetAdjusted,
      revenue,
      revenueAdjusted,
      originalTitle,
      homepage,
      tagline,
      overview,
      runtime,
      releaseDate
    } = movie;
    const safeTagline = tagline !== undefined ? tagline : '';
    return `('${escape(imdbId)}', ${popularity}, ${budget}, ${budgetAdjusted}, ${revenue}, ${revenueAdjusted}, '${escape(originalTitle)}', '${escape(homepage)}', '${escape(safeTagline)}', '${escape(overview)}', ${runtime}, '${releaseDate}')`;
  }).join(', ');
  return `INSERT INTO movies (imdb_id, popularity, budget, budget_adjusted, revenue, revenue_adjusted, original_title, homepage, tagline, overview, runtime, release_date) VALUES ${values}`;
};

describe("Insert Flat Data", () => {
  let db: Database;

  beforeAll(async () => {
    db = await Database.fromExisting("01", "02");
    await CsvLoader.load();
  }, minutes(1));

  it(
    "should insert actors",
    async done => {
      const actors = await CsvLoader.actors();
      const chunks = _.chunk(actors, 500);

      for (const ch of chunks) {
        await db.insert(insertActors(ch));
      }

      const count = await db.selectSingleRow(selectCount(ACTORS));
      expect(count.c).toBe(7617);

      const actor = await db.selectSingleRow(selectActorByName("Tom Hardy"));
      expect(actor.id).not.toBeNaN();
      expect(actor.full_name).toEqual("Tom Hardy");

      done();
    },
    minutes(1)
  );

  it(
    "should insert keywords",
    async done => {
      const keywords = await CsvLoader.keywords();
      const chunks = _.chunk(keywords, 500);

      for (const ch of chunks) {
        await db.insert(insertKeywords(ch));
      }

      const count = await db.selectSingleRow(selectCount(KEYWORDS));
      expect(count.c).toBe(3700);

      const row = await db.selectSingleRow(selectKeyword("teddy bear"));
      expect(row.id).not.toBeNaN();
      expect(row.keyword).toEqual("teddy bear");

      done();
    },
    minutes(1)
  );

  it(
    "should insert directors",
    async done => {
      const directors = await CsvLoader.directors();
      const chunks = _.chunk(directors, 500);

      for (const ch of chunks) {
        await db.insert(insertDirectors(ch));
      }

      const count = await db.selectSingleRow(selectCount(DIRECTORS));
      expect(count.c).toBe(2499);

      const row = await db.selectSingleRow(selectDirector("Alan Taylor"));
      expect(row.id).not.toBeNaN();
      expect(row.full_name).toEqual("Alan Taylor");

      done();
    },
    minutes(1)
  );

  it(
    "should insert genres",
    async done => {
      const genres = await CsvLoader.genres();

      await db.insert(insertGenres(genres));

      const count = await db.selectSingleRow(selectCount(GENRES));
      expect(count.c).toBe(20);

      const row = await db.selectSingleRow(selectGenre("Fantasy"));
      expect(row.id).not.toBeNaN();
      expect(row.genre).toEqual("Fantasy");

      done();
    },
    minutes(1)
  );

  it(
    "should insert production companies",
    async done => {
      const productionCompanies = await CsvLoader.productionCompanies();
      const chunks = _.chunk(productionCompanies, 500);

      for (const ch of chunks) {
        await db.insert(insertProductionCompanies(ch));
      }

      const count = await db.selectSingleRow(selectCount(PRODUCTION_COMPANIES));
      expect(count.c).toBe(3429);

      const row = await db.selectSingleRow(
        selectProductionCompany("Universal Pictures")
      );
      expect(row.id).not.toBeNaN();
      expect(row.company_name).toEqual("Universal Pictures");

      done();
    },
    minutes(1)
  );

  it(
    "should insert movies",
    async done => {
      const movies = await CsvLoader.movies();
      const chunks = _.chunk(movies, 500);

      for (const ch of chunks) {
        await db.insert(insertMovies(ch));
      }

      const count = await db.selectSingleRow(selectCount(MOVIES));
      expect(count.c).toBe(2998);

      const row = await db.selectSingleRow(selectMovie("tt0369610"));
      expect(row.id).not.toBeNaN();
      expect(row.original_title).toEqual("Jurassic World");

      done();
    },
    minutes(1)
  );
});
