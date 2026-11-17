import { getEvents } from "@/services/event-service";
import { getPosts } from "@/services/post-service";
import { useEffect, useState } from "react";

export interface Event {
  id: number;
  title: string;
  startDate: string;
  description: string;
}

export interface Post {
  id: number;
  title: string;
  startDate: string;
  description: string;
}

const useData = (
  eventParam: string | null = null,
  postParam: string | null = null
) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [eventsError, setEventsError] = useState<Error | null>(null);
  const [postsError, setPostsError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const promises: Promise<void>[] = [];

        if (eventParam !== null) {
          promises.push(
            getEvents()
              .then((data) => setEvents(data ?? []))
              .catch((err) => setEventsError(err as Error))
          );
        }

        if (postParam !== null) {
          promises.push(
            getPosts()
              .then((data) => setPosts(data ?? []))
              .catch((err) => setPostsError(err as Error))
          );
        }

        await Promise.all(promises);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventParam, postParam]);

  return { events, posts, loading, eventsError, postsError, setPosts, setEvents };
};

export default useData;
