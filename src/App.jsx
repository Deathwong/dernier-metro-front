import { useEffect, useState } from "react";
import { API_BASE_URL, getNextMetro, getStations } from "./api";

function formatLastMetroTime(value) {
  if (!value) {
    return "Inconnue";
  }

  return value.slice(0, 5);
}

export default function App() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState("");
  const [nextMetro, setNextMetro] = useState(null);
  const [loadingStations, setLoadingStations] = useState(true);
  const [loadingNextMetro, setLoadingNextMetro] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStations() {
      try {
        setLoadingStations(true);
        setError("");

        const data = await getStations();
        setStations(data.stations ?? []);

        if (data.stations?.length) {
          setSelectedStation(data.stations[0].name);
        }
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoadingStations(false);
      }
    }

    loadStations();
  }, []);

  async function handleSearch(event) {
    event.preventDefault();

    if (!selectedStation) {
      setError("Choisis une station avant de lancer la recherche.");
      return;
    }

    try {
      setLoadingNextMetro(true);
      setError("");
      const data = await getNextMetro(selectedStation);
      setNextMetro(data);
    } catch (requestError) {
      setNextMetro(null);
      setError(requestError.message);
    } finally {
      setLoadingNextMetro(false);
    }
  }

  const selectedStationDetails = stations.find(
    (station) => station.name === selectedStation
  );

  return (
    <div className="page-shell">
      <main className="app-card">
        <section className="hero">
          <p className="eyebrow">React + API Express</p>
          <h1>Dernier Metro</h1>
          <p className="hero-copy">
            Cette interface React appelle le backend existant pour afficher le
            prochain metro et l&apos;etat du service.
          </p>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Rechercher un passage</h2>
              <p>Source API: {API_BASE_URL}</p>
            </div>
            <span className="badge">
              {loadingStations ? "Chargement..." : `${stations.length} stations`}
            </span>
          </div>

          <form className="search-form" onSubmit={handleSearch}>
            <label className="field">
              <span>Station</span>
              <select
                value={selectedStation}
                onChange={(event) => setSelectedStation(event.target.value)}
                disabled={loadingStations}
              >
                <option value="">Selectionne une station</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.name}>
                    {station.name}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" disabled={loadingStations || loadingNextMetro}>
              {loadingNextMetro ? "Recherche en cours..." : "Voir le prochain metro"}
            </button>
          </form>

          {error ? <p className="message error">{error}</p> : null}
        </section>

        <section className="content-grid">
          <article className="panel">
            <h2>Infos station</h2>
            {selectedStationDetails ? (
              <dl className="info-list">
                <div>
                  <dt>Frequence</dt>
                  <dd>{selectedStationDetails.headway_minutes} min</dd>
                </div>
                <div>
                  <dt>Dernier metro</dt>
                  <dd>
                    {formatLastMetroTime(selectedStationDetails.last_metro_time)}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="message">Choisis une station pour voir ses details.</p>
            )}
          </article>

          <article className="panel result-panel">
            <h2>Resultat</h2>
            {!nextMetro ? (
              <p className="message">
                Lance une recherche pour recuperer le prochain passage.
              </p>
            ) : nextMetro.service === "closed" ? (
              <div className="result-state warning">
                <p className="result-label">Service ferme</p>
                <p className="result-main">{nextMetro.station}</p>
                <p className="message">{nextMetro.message}</p>
              </div>
            ) : (
              <div className="result-state success">
                <p className="result-label">Prochain passage</p>
                <p className="result-main">{nextMetro.nextArrival}</p>
                <p className="message">
                  {nextMetro.station} - cadence {nextMetro.headwayMin} min
                </p>
                <p className="message">
                  {nextMetro.isLast
                    ? "Attention: on est dans la fenetre du dernier metro."
                    : "Le service circule normalement."}
                </p>
              </div>
            )}
          </article>
        </section>

        <section className="panel learn-panel">
          <h2>Comprendre React rapidement</h2>
          <ul className="learn-list">
            <li>
              Un composant React est une fonction qui retourne de l&apos;interface.
            </li>
            <li>
              <code>useState</code> sert a memoriser une valeur qui change.
            </li>
            <li>
              <code>useEffect</code> sert ici a charger les stations au demarrage.
            </li>
            <li>
              Quand l&apos;etat change, React recalcule l&apos;affichage automatiquement.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
