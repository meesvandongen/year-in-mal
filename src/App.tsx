import useLocalStorageState from "use-local-storage-state";
import { AnimeListItem } from "./data";
import { Wrapped } from "./Wrapped";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Link,
} from "@nextui-org/react";

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<
    true | false | "unknown"
  >("unknown");

  useEffect(() => {
    fetch("/api/check-auth")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Not authenticated");
        }
      })
      .then(() => {
        setIsAuthenticated(true);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  if (isAuthenticated === false) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-[400px]">
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md">MAL Wrapped</p>
              <p className="text-small text-default-500">unofficial</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <p>
              Review the Anime you have watched last year with the 2023 MAL
              Wrapped.
            </p>
          </CardBody>
          <Divider />
          <CardFooter>
            <Button as={Link} href="/api/login" color="primary" fullWidth>
              Login With MyAnimeList
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const [error, setError] = useState<Error | undefined>(undefined);
  const [list, setList] = useLocalStorageState<
    Array<AnimeListItem> | undefined
  >("state", {
    defaultValue: undefined,
  });

  useEffect(() => {
    if (list) {
      return;
    }
    fetch("/api/animelist")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Not authenticated");
        }
        return res.json();
      })
      .then((json) => {
        setList(json);
      })
      .catch((err) => {
        setError(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!list) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Failed to get list {error.message}</div>;
  }

  return <Wrapped data={list} />;
}
