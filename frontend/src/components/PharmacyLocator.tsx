import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Star, Phone, Navigation, Search, LocateFixed, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface OsmPlace {
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
  type: "node" | "way" | "relation";
  center?: { lat: number; lon: number };
}

interface Pharmacy {
  id: number;
  name: string;
  address: string;
  distanceKm: number;
  phone?: string;
  hours?: string;
  lat: number;
  lon: number;
}

const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const PharmacyLocator = () => {
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [locationLabel, setLocationLabel] = useState<string>("");
  const { toast } = useToast();
  const controllerRef = useRef<AbortController | null>(null);

  const fetchByCoords = async (lat: number, lon: number) => {
    setLoading(true);
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();

    try {
      // Reverse geocode to label
      try {
        const rev = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
          { signal: controllerRef.current.signal, headers: { "Accept-Language": "en" } },
        );
        const revJson = await rev.json();
        setLocationLabel(revJson?.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      } catch {
        setLocationLabel(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      }

      // Overpass query for pharmacies within 3km
      const radius = 3000;
      const overpassQuery = `[
        out:json
      ];(
        node["amenity"="pharmacy"](around:${radius},${lat},${lon});
        way["amenity"="pharmacy"](around:${radius},${lat},${lon});
        relation["amenity"="pharmacy"](around:${radius},${lat},${lon});
      );out center;`;

      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: overpassQuery,
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        signal: controllerRef.current.signal,
      });
      if (!res.ok) throw new Error(`Overpass error ${res.status}`);
      const data = await res.json();
      const elements: OsmPlace[] = data.elements || [];

      const mapped: Pharmacy[] = elements.map((el) => {
        const t = el.tags || {};
        const plat = el.type === "node" ? el.lat : el.center?.lat || el.lat;
        const plon = el.type === "node" ? el.lon : el.center?.lon || el.lon;
        const distanceKm = haversineKm(lat, lon, plat, plon);
        const addressParts = [t["addr:housenumber"], t["addr:street"], t["addr:city"], t["addr:state"], t["addr:postcode"]]
          .filter(Boolean)
          .join(", ");
        return {
          id: el.id,
          name: t.name || "Pharmacy",
          address: addressParts || t["addr:full"] || t["addr:city"] || "",
          distanceKm,
          phone: t["phone"] || t["contact:phone"],
          hours: t["opening_hours"],
          lat: plat!,
          lon: plon!,
        };
      });

      // Sort by distance, limit 30
      mapped.sort((a, b) => a.distanceKm - b.distanceKm);
      setPharmacies(mapped.slice(0, 30));
    } catch (e: any) {
      if (e.name === "AbortError") return;
      toast({ title: "Failed to load pharmacies", description: e.message || String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", description: "Your browser does not support GPS.", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const next = { lat: latitude, lon: longitude };
        setCoords(next);
        fetchByCoords(next.lat, next.lon);
      },
      (err) => {
        toast({ title: "Location error", description: err.message, variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        { signal: controllerRef.current.signal, headers: { "Accept-Language": "en" } },
      );
      const [first] = await res.json();
      if (!first) throw new Error("No results found for that location");
      const lat = parseFloat(first.lat);
      const lon = parseFloat(first.lon);
      setCoords({ lat, lon });
      setLocationLabel(first.display_name || query);
      await fetchByCoords(lat, lon);
    } catch (e: any) {
      if (e.name === "AbortError") return;
      toast({ title: "Search failed", description: e.message || String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try to load initial by current location
    handleUseCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headerLocation = useMemo(() => locationLabel || (coords ? `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}` : ""), [coords, locationLabel]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Nearby Pharmacies</h2>
        <p className="text-muted-foreground">Find pharmacies around {headerLocation || "your location"}</p>
      </div>

      {/* Search */}
      <div className="flex space-x-2">
        <div className="flex-1">
          <Input
            placeholder="Enter a city, address, or place"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            className="accessibility-focus text-base"
          />
        </div>
        <Button variant="outline" onClick={handleUseCurrentLocation} className="accessibility-focus">
          <LocateFixed className="h-4 w-4 mr-2" />
          Use GPS
        </Button>
        <Button onClick={handleSearch} disabled={loading} className="medicine-button bg-gradient-to-r from-primary to-secondary hover:opacity-90">
          <Search className="h-4 w-4 mr-2" />
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 gap-4">
        {pharmacies.map((p) => (
          <Card key={p.id} className="pill-card hover:shadow-[var(--shadow-pill)] transition-[var(--transition-gentle)]">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                  <CardTitle className="text-lg font-semibold">{p.name}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                      <span>{p.address || "Address unavailable"}</span>
                      </div>
                    </CardDescription>
                  </div>
                <Badge className="alert-badge bg-secondary text-secondary-foreground">
                  {p.distanceKm.toFixed(2)} km
                </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Quick Info */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Navigation className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{p.distanceKm.toFixed(2)} km</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{p.hours || "Hours N/A"}</span>
                  </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{p.phone || "Phone N/A"}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                {p.phone && (
                  <Button asChild variant="outline" className="flex-1 accessibility-focus">
                    <a href={`tel:${p.phone.replace(/\s/g, '')}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline" className="flex-1 accessibility-focus">
                  <a
                    href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${coords?.lat},${coords?.lon};${p.lat},${p.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Directions
                  </a>
                  </Button>
                <Button asChild className="flex-1 medicine-button bg-gradient-to-r from-secondary to-primary hover:opacity-90">
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=18/${p.lat}/${p.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Map <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                    </Button>
                </div>
              </CardContent>
            </Card>
        ))}
      </div>

      {!loading && pharmacies.length === 0 && (
        <Card className="pill-card">
          <CardContent className="p-6 text-center text-muted-foreground">
            No pharmacies found yet. Try "Mumbai" or use GPS.
        </CardContent>
      </Card>
      )}
    </div>
  );
};

export default PharmacyLocator;