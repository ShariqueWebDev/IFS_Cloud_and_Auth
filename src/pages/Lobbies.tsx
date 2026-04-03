import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGetLobbiesQuery } from "../services/lobbyApi";

interface Lobby {
  PoId?: string;
  Description?: string;
  PageTitle?: string;
  Keywords?: string;
  Author?: string;
  DescriptiveText?: string;
  [key: string]: unknown;
}

const PAGE_SIZE = 9;

function LobbyCard({ lobby }: { lobby: Lobby }) {
  const title =
    lobby.Description || lobby.PageTitle || lobby.PoId || "Untitled Lobby";
  const description = lobby.DescriptiveText || "";
  const keywords = lobby.Keywords || "";
  const author = lobby.Author || "";

  return (
    <div className="bg-white rounded-md p-5 shadow-sm border-t-3 border-blue-600 cursor-pointer hover:shadow-md transition-shadow">
      <h3 className="text-sm font-bold text-gray-800 uppercase mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{description}</p>
      )}
      {keywords && (
        <p className="text-xs text-blue-600 mb-2">
          <strong>Keywords:</strong> {keywords}
        </p>
      )}
      {author && <p className="text-xs text-gray-400">{author}</p>}
    </div>
  );
}

function Lobbies() {
  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const loaderRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetching } = useGetLobbiesQuery({
    top: PAGE_SIZE,
    skip,
  });

  const lobbies = data?.value ?? [];
  const totalCount = data?.["@odata.count"] ?? 0;
  const hasMore = lobbies.length < totalCount;

  const filtered = search
    ? lobbies.filter((lobby) => {
        const title = (
          lobby.Description ||
          lobby.PageTitle ||
          lobby.PoId ||
          ""
        ).toLowerCase();
        const keywords = (lobby.Keywords || "").toLowerCase();
        return (
          title.includes(search.toLowerCase()) ||
          keywords.includes(search.toLowerCase())
        );
      })
    : lobbies;

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isFetching) {
        setSkip((prev) => prev + PAGE_SIZE);
      }
    },
    [hasMore, isFetching],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: "200px",
    });
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    return () => observer.disconnect();
  }, [handleObserver]);

  if (isLoading && skip === 0)
    return <p className="text-center mt-12 text-lg">Loading lobbies...</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex justify-between items-center px-8 py-4 bg-blue-600 text-white">
        <div className="flex items-center gap-3">
          <img
            src="/ifs_logo_name.svg"
            alt="IFS Logo"
            className="h-8 brightness-0 invert"
          />
          <h1 className="text-xl font-semibold">Lobbies</h1>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-5 py-2 bg-white text-sm text-blue-600 rounded font-semibold hover:bg-gray-100 cursor-pointer"
        >
          Back to Dashboard
        </button>
      </header>

      <div className="flex justify-between items-center px-8 py-4">
        <span className="text-sm text-gray-500">
          {filtered.length} of {totalCount} lobbies
        </span>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded text-sm w-62.5 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-5 px-8 pb-8">
        {filtered.length > 0 ? (
          filtered.map((lobby, index) => (
            <LobbyCard key={index} lobby={lobby} />
          ))
        ) : (
          <p className="text-center text-gray-400 col-span-3 py-10">
            No lobbies found
          </p>
        )}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={loaderRef} className="text-center py-6">
        {isFetching && <p className="text-gray-500 text-sm">Loading more...</p>}
        {!hasMore && lobbies.length > 0 && (
          <p className="text-gray-400 text-sm">All lobbies loaded</p>
        )}
      </div>
    </div>
  );
}

export default Lobbies;
