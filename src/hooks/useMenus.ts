import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Menu } from "../types";

export function useMenus() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getDocs(collection(db, "menus"))
      .then((snap) => {
        const data = snap.docs.map((d) => d.data() as Menu);
        data.sort((a, b) => a.name.localeCompare(b.name, "ko"));
        setMenus(data);
      })
      .catch((err: Error) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { menus, loading, error };
}
