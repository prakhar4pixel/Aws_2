import { useState, useEffect, useRef } from "react";
import { Search, MapPin, FileText, Globe2, Loader2, RotateCcw, Cloud } from "lucide-react";

interface NavbarProps {
  onLocationSelect: (lng: number, lat: number, label: string) => void;
  onOpenMethodology: () => void;
  onOpenAwsModal?: () => void;
  onClearSelection: () => void;
  hasSelection: boolean;
}

interface GeocodeResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export default function Navbar({
  onLocationSelect,
  onOpenMethodology,
  onOpenAwsModal,
  onClearSelection,
  hasSelection,
}: NavbarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query.trim()
          )}&format=json&limit=5&addressdetails=1`
        );
        const data = await res.json();
        setResults(data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Geocoding lookup error:", err);
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (r: GeocodeResult) => {
    onLocationSelect(parseFloat(r.lon), parseFloat(r.lat), r.display_name);
    setShowDropdown(false);
    setQuery("");
  };

  return (
    <header className="urbancool-navbar">
      <div className="navbar-brand">
        <div className="brand-icon-box">
          <Globe2 size={22} className="brand-icon-warm" />
        </div>
        <div className="brand-text-column">
          <div className="brand-main-title">
            <span className="brand-name">UrbanCool</span>
            <span className="brand-tag">GIS Heat Decision Support</span>
          </div>
          <span className="brand-sub">
            Satellite Heat Analysis &amp; Intervention Planner
          </span>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="navbar-search-wrapper" ref={searchContainerRef}>
        <div className="search-input-pill">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search urban center (e.g. Phoenix, Delhi, Madrid, Tokyo)..."
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (val.trim().length < 2) {
                setResults([]);
                setShowDropdown(false);
              }
            }}
            onFocus={() => {
              if (results.length > 0) setShowDropdown(true);
            }}
          />
          {loading && <Loader2 size={16} className="search-loading-spinner" />}
        </div>

        {showDropdown && results.length > 0 && (
          <div className="search-dropdown-menu">
            <div className="dropdown-label">Locations Found</div>
            {results.map((r) => (
              <button
                key={r.place_id}
                type="button"
                className="dropdown-item"
                onClick={() => handleSelect(r)}
              >
                <MapPin size={15} className="dropdown-pin-icon" />
                <span className="dropdown-text">{r.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="navbar-actions">
        {hasSelection && (
          <button
            type="button"
            className="navbar-btn clear-btn"
            onClick={onClearSelection}
            title="Reset current polygon selection"
          >
            <RotateCcw size={15} />
            <span>Clear Area</span>
          </button>
        )}

        <button
          type="button"
          className="navbar-btn aws-btn"
          onClick={onOpenAwsModal}
          title="Explore AWS Cloud Architecture (Amazon SNS Emergency Dispatcher)"
        >
          <Cloud size={15} className="text-amber" />
          <span>AWS Architecture</span>
        </button>

        <button
          type="button"
          className="navbar-btn methodology-btn"
          onClick={onOpenMethodology}
          title="Review scientific methodology and limitations"
        >
          <FileText size={15} />
          <span>Methodology &amp; Limitations</span>
        </button>
      </div>
    </header>
  );
}
