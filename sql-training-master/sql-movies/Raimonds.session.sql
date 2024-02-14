
CREATE TABLE movies (
    id INTEGER PRIMARY KEY,
    imdb_id TEXT,
    popularity REAL,
    budget REAL,
    budget_adjusted REAL,
    revenue REAL,
    revenue_adjusted REAL,
    original_title TEXT,
    homepage TEXT,
    tagline TEXT,
    overview TEXT,
    runtime INTEGER,
    release_date TEXT
);
CREATE TABLE actors (
    id INTEGER PRIMARY KEY,
    full_name TEXT
);
CREATE TABLE keywords (
    id INTEGER PRIMARY KEY,
    keyword TEXT
);
CREATE TABLE directors (
    id INTEGER PRIMARY KEY,
    full_name TEXT
);
CREATE TABLE genres (
    id INTEGER PRIMARY KEY,
    genre TEXT
);
CREATE TABLE production_companies (
    id INTEGER PRIMARY KEY,
    company_name TEXT
);