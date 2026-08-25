import { useState, useEffect, useCallback } from "react";

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }
        setError(null);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu! ");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message || "Đã có lỗi xẩy ra!");
      } finally {
        setLoading(false);
      }
    },
    [url],
  );

  useEffect(() => {
    if (!url) {
      return undefined;
    }

    const timer = setTimeout(() => {
      void fetchData(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [url, fetchData]);

  return { data, loading, error, refetch: fetchData };
}
